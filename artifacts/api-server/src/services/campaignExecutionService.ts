import { postgresPool, pool } from '../database/postgres';
import { createActivityLogRepository } from '../repositories/activity-logs';
import { EmailDispatchService } from './emailDispatchService';
import type { TargetProspectItem, CampaignItem } from '../../../src/types/campaign';

export interface HaltProspectResult {
  haltedCount: number;
  campaignIds: string[];
}

export interface StepExecutionResult {
  executed: boolean;
  reason?: string;
  messageId?: string;
  nextStepAt?: string | null;
}

export class CampaignExecutionService {
  /**
   * Halts any active sequence follow-ups for a prospect across a workspace's campaigns.
   * Directly updates production database state (target_prospects JSONB in campaigns table)
   * setting status to 'replied' and clearing nextStepAt.
   */
  public static async haltProspectSequence(
    workspaceId: string,
    options: {
      campaignId?: string;
      prospectId?: string;
      contactEmail: string;
      reason?: string;
      userId?: string;
    }
  ): Promise<HaltProspectResult> {
    const activePool = postgresPool || pool;
    const cleanEmail = options.contactEmail.toLowerCase().trim();
    const haltedCampaignIds: string[] = [];
    let haltedCount = 0;

    if (!activePool) {
      return { haltedCount: 0, campaignIds: [] };
    }

    try {
      // Find all campaigns for the workspace
      const query = options.campaignId
        ? `SELECT id, target_prospects, replied_count FROM campaigns WHERE id = $1 AND workspace_id = $2 FOR UPDATE`
        : `SELECT id, target_prospects, replied_count FROM campaigns WHERE workspace_id = $1 FOR UPDATE`;
      const params = options.campaignId ? [options.campaignId, workspaceId] : [workspaceId];

      const res = await activePool.query(query, params);

      for (const row of res.rows) {
        const campaignId = row.id;
        let prospects: TargetProspectItem[] = Array.isArray(row.target_prospects)
          ? row.target_prospects
          : (typeof row.target_prospects === 'string' ? JSON.parse(row.target_prospects) : []);

        let modified = false;

        prospects = prospects.map((p) => {
          const matchByEmail = p.email && p.email.toLowerCase().trim() === cleanEmail;
          const matchById = options.prospectId && p.id === options.prospectId;

          if (matchByEmail || matchById) {
            if (p.status !== 'replied' && (p as any).status !== 'halted') {
              modified = true;
              haltedCount++;
              return {
                ...p,
                status: 'replied',
                nextStepAt: null,
                lastTouch: options.reason || 'Sequence halted: Prospect replied via Gmail'
              };
            }
          }
          return p;
        });

        if (modified) {
          const newRepliedCount = (row.replied_count || 0) + 1;
          await activePool.query(
            `UPDATE campaigns 
             SET target_prospects = $1, 
                 replied_count = $2,
                 updated_at = now() 
             WHERE id = $3 AND workspace_id = $4`,
            [JSON.stringify(prospects), newRepliedCount, campaignId, workspaceId]
          );
          haltedCampaignIds.push(campaignId);
        }
      }

      if (haltedCount > 0) {
        try {
          const activityRepo = createActivityLogRepository();
          await activityRepo.log({
            workspaceId,
            userId: options.userId || 'system',
            action: 'SEQUENCE_HALTED',
            entityType: 'campaign',
            entityId: haltedCampaignIds[0] || 'all',
            details: `Automated campaign sequence halted for ${cleanEmail}: inbound Gmail reply detected.`
          });
        } catch (err: any) {
          console.warn('[CAMPAIGN_EXECUTION] Activity log notice:', err.message);
        }
      }

      return {
        haltedCount,
        campaignIds: haltedCampaignIds
      };
    } catch (err: any) {
      console.error('[CAMPAIGN_EXECUTION] Failed to halt prospect sequence in DB:', err.message);
      return { haltedCount: 0, campaignIds: [] };
    }
  }

  /**
   * Determines if a prospect is eligible to receive a sequence step.
   * Returns false immediately if prospect status is 'replied', 'halted', 'converted',
   * or if nextStepAt is in the future.
   */
  public static isProspectEligibleForStep(
    prospect: TargetProspectItem & { nextStepAt?: string | null },
    campaignStatus: string
  ): boolean {
    if (campaignStatus !== 'active') {
      return false;
    }

    const currentStatus = String(prospect.status || '').toLowerCase();
    if (currentStatus === 'replied' || currentStatus === 'halted' || currentStatus === 'converted') {
      return false;
    }

    if (prospect.nextStepAt) {
      const scheduledTime = new Date(prospect.nextStepAt).getTime();
      if (!isNaN(scheduledTime) && scheduledTime > Date.now()) {
        return false; // Scheduled for the future
      }
    }

    return true;
  }

  /**
   * Executes the next sequence step for a specific prospect in a campaign.
   * Atomically re-verifies prospect eligibility under lock to prevent any race condition
   * with incoming replies.
   */
  public static async executeNextStepForProspect(
    workspaceId: string,
    campaignId: string,
    prospectId: string
  ): Promise<StepExecutionResult> {
    const activePool = postgresPool || pool;
    if (!activePool) {
      return { executed: false, reason: 'DATABASE_UNAVAILABLE' };
    }

    try {
      // 1. Lock campaign row for atomic evaluation
      const campaignRes = await activePool.query(
        `SELECT id, name, status, sequence_steps, target_prospects, sent_count 
         FROM campaigns 
         WHERE id = $1 AND workspace_id = $2 
         FOR UPDATE`,
        [campaignId, workspaceId]
      );

      if (campaignRes.rows.length === 0) {
        return { executed: false, reason: 'CAMPAIGN_NOT_FOUND' };
      }

      const campaign = campaignRes.rows[0];
      if (campaign.status !== 'active') {
        return { executed: false, reason: 'CAMPAIGN_NOT_ACTIVE' };
      }

      const prospects: (TargetProspectItem & { currentStep?: number; nextStepAt?: string | null })[] =
        Array.isArray(campaign.target_prospects)
          ? campaign.target_prospects
          : (typeof campaign.target_prospects === 'string' ? JSON.parse(campaign.target_prospects) : []);

      const prospectIdx = prospects.findIndex(p => p.id === prospectId);
      if (prospectIdx === -1) {
        return { executed: false, reason: 'PROSPECT_NOT_FOUND' };
      }

      const prospect = prospects[prospectIdx];

      // 2. CRITICAL RACE-PREVENTION CHECK:
      // If prospect has replied or been halted, abort step execution immediately.
      if (!this.isProspectEligibleForStep(prospect, campaign.status)) {
        return {
          executed: false,
          reason: `INELIGIBLE_STATUS_${prospect.status.toUpperCase()}`
        };
      }

      if (!prospect.email) {
        return { executed: false, reason: 'PROSPECT_HAS_NO_EMAIL' };
      }

      const sequenceSteps = Array.isArray(campaign.sequence_steps)
        ? campaign.sequence_steps
        : (typeof campaign.sequence_steps === 'string' ? JSON.parse(campaign.sequence_steps) : []);

      const nextStepIndex = prospect.currentStep !== undefined ? prospect.currentStep : 0;
      const currentStepDef = sequenceSteps[nextStepIndex];

      if (!currentStepDef) {
        // No further steps in sequence
        prospects[prospectIdx] = {
          ...prospect,
          status: 'converted',
          nextStepAt: null,
          lastTouch: 'Sequence completed'
        };
        await activePool.query(
          `UPDATE campaigns SET target_prospects = $1, updated_at = now() WHERE id = $2 AND workspace_id = $3`,
          [JSON.stringify(prospects), campaignId, workspaceId]
        );
        return { executed: false, reason: 'SEQUENCE_COMPLETED' };
      }

      // 3. Dispatch the email step
      const dispatchRes = await EmailDispatchService.sendEmail({
        to: prospect.email,
        toName: prospect.contactName,
        subject: currentStepDef.title || `Follow-up from ${campaign.name}`,
        text: currentStepDef.contentSnippet || 'Hi, checking in on our previous conversation.',
        campaignId
      }, workspaceId);

      if (!dispatchRes.success) {
        return { executed: false, reason: dispatchRes.error || 'EMAIL_DISPATCH_FAILED' };
      }

      // 4. Calculate next step delay
      const upcomingStepDef = sequenceSteps[nextStepIndex + 1];
      const nextDelayDays = upcomingStepDef?.delayDays || 3;
      const nextStepDate = new Date(Date.now() + nextDelayDays * 86400000).toISOString();

      prospects[prospectIdx] = {
        ...prospect,
        currentStep: nextStepIndex + 1,
        status: 'delivered',
        nextStepAt: upcomingStepDef ? nextStepDate : null,
        lastTouch: `Step ${currentStepDef.stepNumber || nextStepIndex + 1} sent: ${currentStepDef.title}`
      };

      const newSentCount = (campaign.sent_count || 0) + 1;

      await activePool.query(
        `UPDATE campaigns 
         SET target_prospects = $1, 
             sent_count = $2, 
             updated_at = now() 
         WHERE id = $3 AND workspace_id = $4`,
        [JSON.stringify(prospects), newSentCount, campaignId, workspaceId]
      );

      return {
        executed: true,
        messageId: dispatchRes.messageId,
        nextStepAt: upcomingStepDef ? nextStepDate : null
      };
    } catch (err: any) {
      console.error('[CAMPAIGN_EXECUTION] Error executing sequence step:', err.message);
      return { executed: false, reason: err.message };
    }
  }

  /**
   * Evaluates all active campaigns in a workspace and processes any due sequence steps.
   */
  public static async processDueCampaignSteps(workspaceId: string): Promise<{ processed: number; executed: number }> {
    const activePool = postgresPool || pool;
    if (!activePool) return { processed: 0, executed: 0 };

    try {
      const activeCamps = await activePool.query(
        `SELECT id, target_prospects FROM campaigns WHERE workspace_id = $1 AND status = 'active'`,
        [workspaceId]
      );

      let processed = 0;
      let executed = 0;

      for (const row of activeCamps.rows) {
        const campaignId = row.id;
        const prospects: any[] = Array.isArray(row.target_prospects)
          ? row.target_prospects
          : (typeof row.target_prospects === 'string' ? JSON.parse(row.target_prospects) : []);

        for (const p of prospects) {
          if (this.isProspectEligibleForStep(p, 'active')) {
            processed++;
            const res = await this.executeNextStepForProspect(workspaceId, campaignId, p.id);
            if (res.executed) executed++;
          }
        }
      }

      return { processed, executed };
    } catch (err: any) {
      console.error('[CAMPAIGN_EXECUTION] Error processing due campaign steps:', err.message);
      return { processed: 0, executed: 0 };
    }
  }
}
