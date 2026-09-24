import { postgresPool, pool } from '../database/postgres';
import { createActivityLogRepository } from '../repositories/activity-logs';
import { EmailDispatchService } from './emailDispatchService';
import type { TargetProspectItem, CampaignItem } from '../types/campaign';

export interface HaltProspectResult {
  success: boolean;
  haltedCount: number;
  campaignIds: string[];
  error?: string;
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
   * under an explicit PostgreSQL transaction with FOR UPDATE row locks.
   * Sets status to 'replied' and clears nextStepAt to null.
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
      return { success: false, haltedCount: 0, campaignIds: [], error: 'DATABASE_UNAVAILABLE' };
    }

    const client = await activePool.connect();
    try {
      await client.query('BEGIN');

      // Find all campaigns for the workspace under explicit FOR UPDATE row locks
      const query = options.campaignId
        ? `SELECT id, target_prospects, replied_count FROM campaigns WHERE id = $1 AND workspace_id = $2 FOR UPDATE`
        : `SELECT id, target_prospects, replied_count FROM campaigns WHERE workspace_id = $1 FOR UPDATE`;
      const params = options.campaignId ? [options.campaignId, workspaceId] : [workspaceId];

      const res = await client.query(query, params);

      for (const row of res.rows) {
        const campaignId = row.id;
        let prospects: TargetProspectItem[] = Array.isArray(row.target_prospects)
          ? row.target_prospects
          : (typeof row.target_prospects === 'string' ? JSON.parse(row.target_prospects) : []);

        let modified = false;

        prospects = prospects.map((p) => {
          const matchByEmail = p.email && p.email.toLowerCase().trim() === cleanEmail;
          const matchById = options.prospectId && p.id === options.prospectId;

          // When prospectId is provided, enforce exact prospect match
          if (options.prospectId ? matchById : matchByEmail) {
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
          await client.query(
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

      await client.query('COMMIT');

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
        success: true,
        haltedCount,
        campaignIds: haltedCampaignIds
      };
    } catch (err: any) {
      try {
        await client.query('ROLLBACK');
      } catch {}
      console.error('[CAMPAIGN_EXECUTION] Failed to halt prospect sequence in DB:', err.message);
      return { success: false, haltedCount: 0, campaignIds: [], error: err.message };
    } finally {
      client.release();
    }
  }

  /**
   * Determines if a prospect is eligible to receive a sequence step.
   * Returns false immediately if prospect status is 'replied', 'halted', 'converted',
   * 'sending', or if nextStepAt is in the future.
   */
  public static isProspectEligibleForStep(
    prospect: TargetProspectItem & { nextStepAt?: string | null },
    campaignStatus: string
  ): boolean {
    if (campaignStatus !== 'active') {
      return false;
    }

    const currentStatus = String(prospect.status || '').toLowerCase();
    if (
      currentStatus === 'replied' ||
      currentStatus === 'halted' ||
      currentStatus === 'converted' ||
      currentStatus === 'sending'
    ) {
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
   * Concurrency-safe atomic claim pattern:
   * Phase 1 (Under explicit transaction & row lock): Re-verifies eligibility and claims step (status = 'sending').
   * Phase 2: Dispatches outbound email.
   * Phase 3 (Under explicit transaction & row lock): Re-checks if reply arrived while sending;
   *          advances step only if not replied/halted, and sets upcoming nextStepAt.
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

    let campaignName = 'Campaign';
    let targetProspect: TargetProspectItem | null = null;
    let nextStepIndex = 0;
    let currentStepDef: any = null;
    let sequenceSteps: any[] = [];

    // --- PHASE 1: Atomic Claim under Transaction Lock ---
    const claimClient = await activePool.connect();
    try {
      await claimClient.query('BEGIN');

      const campaignRes = await claimClient.query(
        `SELECT id, name, status, sequence_steps, target_prospects, sent_count 
         FROM campaigns 
         WHERE id = $1 AND workspace_id = $2 
         FOR UPDATE`,
        [campaignId, workspaceId]
      );

      if (campaignRes.rows.length === 0) {
        await claimClient.query('ROLLBACK');
        return { executed: false, reason: 'CAMPAIGN_NOT_FOUND' };
      }

      const campaign = campaignRes.rows[0];
      campaignName = campaign.name || 'Campaign';

      if (campaign.status !== 'active') {
        await claimClient.query('ROLLBACK');
        return { executed: false, reason: 'CAMPAIGN_NOT_ACTIVE' };
      }

      const prospects: (TargetProspectItem & { currentStep?: number; nextStepAt?: string | null })[] =
        Array.isArray(campaign.target_prospects)
          ? campaign.target_prospects
          : (typeof campaign.target_prospects === 'string' ? JSON.parse(campaign.target_prospects) : []);

      const prospectIdx = prospects.findIndex(p => p.id === prospectId);
      if (prospectIdx === -1) {
        await claimClient.query('ROLLBACK');
        return { executed: false, reason: 'PROSPECT_NOT_FOUND' };
      }

      targetProspect = prospects[prospectIdx];

      // CRITICAL RACE-PREVENTION CHECK:
      // If prospect has replied, been halted, or is already sending, abort immediately!
      if (!this.isProspectEligibleForStep(targetProspect, campaign.status)) {
        await claimClient.query('ROLLBACK');
        return {
          executed: false,
          reason: `INELIGIBLE_STATUS_${String(targetProspect.status || '').toUpperCase()}`
        };
      }

      if (!targetProspect.email) {
        await claimClient.query('ROLLBACK');
        return { executed: false, reason: 'PROSPECT_HAS_NO_EMAIL' };
      }

      sequenceSteps = Array.isArray(campaign.sequence_steps)
        ? campaign.sequence_steps
        : (typeof campaign.sequence_steps === 'string' ? JSON.parse(campaign.sequence_steps) : []);

      nextStepIndex = targetProspect.currentStep !== undefined ? targetProspect.currentStep : 0;
      currentStepDef = sequenceSteps[nextStepIndex];

      if (!currentStepDef) {
        // No further steps in sequence: mark converted
        prospects[prospectIdx] = {
          ...targetProspect,
          status: 'converted',
          nextStepAt: null,
          lastTouch: 'Sequence completed'
        };
        await claimClient.query(
          `UPDATE campaigns SET target_prospects = $1, updated_at = now() WHERE id = $2 AND workspace_id = $3`,
          [JSON.stringify(prospects), campaignId, workspaceId]
        );
        await claimClient.query('COMMIT');
        return { executed: false, reason: 'SEQUENCE_COMPLETED' };
      }

      // ATOMIC CLAIM: Claim execution state by setting status = 'sending'
      prospects[prospectIdx] = {
        ...targetProspect,
        status: 'sending' as any,
        lastTouch: `Executing Step ${currentStepDef.stepNumber || nextStepIndex + 1}: ${currentStepDef.title || 'Follow-up'}`
      };

      await claimClient.query(
        `UPDATE campaigns SET target_prospects = $1, updated_at = now() WHERE id = $2 AND workspace_id = $3`,
        [JSON.stringify(prospects), campaignId, workspaceId]
      );

      await claimClient.query('COMMIT');
    } catch (err: any) {
      try {
        await claimClient.query('ROLLBACK');
      } catch {}
      console.error('[CAMPAIGN_EXECUTION] Claim phase error:', err.message);
      return { executed: false, reason: err.message };
    } finally {
      claimClient.release();
    }

    // --- PHASE 2: Dispatch Email Step ---
    const dispatchRes = await EmailDispatchService.sendEmail({
      to: targetProspect.email,
      toName: targetProspect.contactName,
      subject: currentStepDef.title || `Follow-up from ${campaignName}`,
      text: currentStepDef.contentSnippet || 'Hi, checking in on our previous conversation.',
      campaignId
    }, workspaceId);

    // --- PHASE 3: Reconcile Post-Dispatch State under Transaction Lock ---
    let upcomingNextStepDate: string | null = null;
    const reconcileClient = await activePool.connect();
    try {
      await reconcileClient.query('BEGIN');

      const recheckRes = await reconcileClient.query(
        `SELECT target_prospects, sent_count, sequence_steps 
         FROM campaigns 
         WHERE id = $1 AND workspace_id = $2 
         FOR UPDATE`,
        [campaignId, workspaceId]
      );

      if (recheckRes.rows.length > 0) {
        const row = recheckRes.rows[0];
        const latestProspects: (TargetProspectItem & { currentStep?: number; nextStepAt?: string | null })[] =
          Array.isArray(row.target_prospects)
            ? row.target_prospects
            : (typeof row.target_prospects === 'string' ? JSON.parse(row.target_prospects) : []);

        const pIdx = latestProspects.findIndex(p => p.id === prospectId);
        if (pIdx !== -1) {
          const currentProspect = latestProspects[pIdx];

          // CRITICAL: Did an inbound reply arrive while dispatch was in flight?
          // If the prospect was already marked 'replied' or 'halted' by haltProspectSequence,
          // NEVER overwrite with 'delivered' and keep nextStepAt = null!
          if (currentProspect.status === 'replied' || (currentProspect as any).status === 'halted') {
            await reconcileClient.query('COMMIT');
            return {
              executed: true,
              messageId: dispatchRes.messageId,
              nextStepAt: null,
              reason: 'DISPATCHED_BUT_REPLY_COMMITTED'
            };
          }

          if (dispatchRes.success) {
            const steps = Array.isArray(row.sequence_steps)
              ? row.sequence_steps
              : (typeof row.sequence_steps === 'string' ? JSON.parse(row.sequence_steps) : []);

            const upcomingStepDef = steps[nextStepIndex + 1];
            const nextDelayDays = upcomingStepDef?.delayDays || 3;
            upcomingNextStepDate = upcomingStepDef
              ? new Date(Date.now() + nextDelayDays * 86400000).toISOString()
              : null;

            latestProspects[pIdx] = {
              ...currentProspect,
              currentStep: nextStepIndex + 1,
              status: 'delivered',
              nextStepAt: upcomingNextStepDate,
              lastTouch: `Step ${currentStepDef.stepNumber || nextStepIndex + 1} sent: ${currentStepDef.title || 'Follow-up'}`
            };

            const newSentCount = (row.sent_count || 0) + 1;
            await reconcileClient.query(
              `UPDATE campaigns 
               SET target_prospects = $1, 
                   sent_count = $2, 
                   updated_at = now() 
               WHERE id = $3 AND workspace_id = $4`,
              [JSON.stringify(latestProspects), newSentCount, campaignId, workspaceId]
            );
          } else {
            // Revert failed dispatch from 'sending' to 'failed'
            latestProspects[pIdx] = {
              ...currentProspect,
              status: 'failed',
              lastTouch: `Step dispatch failed: ${dispatchRes.error || 'Provider delivery error'}`
            };
            await reconcileClient.query(
              `UPDATE campaigns SET target_prospects = $1, updated_at = now() WHERE id = $2 AND workspace_id = $3`,
              [JSON.stringify(latestProspects), campaignId, workspaceId]
            );
          }
        }
      }

      await reconcileClient.query('COMMIT');
    } catch (err: any) {
      try {
        await reconcileClient.query('ROLLBACK');
      } catch {}
      console.error('[CAMPAIGN_EXECUTION] Reconcile phase error:', err.message);
    } finally {
      reconcileClient.release();
    }

    if (!dispatchRes.success) {
      return { executed: false, reason: dispatchRes.error || 'EMAIL_DISPATCH_FAILED' };
    }

    // Persist/update linked outreach thread for Gmail reply correlation
    await this.ensureOutreachThreadLink(workspaceId, {
      campaignId,
      prospectId: targetProspect.id,
      contactEmail: targetProspect.email,
      contactName: targetProspect.contactName || (targetProspect as any).name,
      companyName: targetProspect.companyName || (targetProspect as any).company,
      subject: currentStepDef.title || `Follow-up from ${campaignName}`,
      messageId: dispatchRes.messageId,
      threadId: (dispatchRes as any).threadId
    });

    return {
      executed: true,
      messageId: dispatchRes.messageId,
      nextStepAt: upcomingNextStepDate
    };
  }

  /**
   * Links or creates an outreach_threads record with campaign_id and prospect_id
   * so that inbound Gmail replies immediately correlate with high precision.
   */
  public static async ensureOutreachThreadLink(
    workspaceId: string,
    details: {
      campaignId: string;
      prospectId: string;
      contactEmail: string;
      contactName?: string;
      companyName?: string;
      subject?: string;
      messageId?: string;
      threadId?: string;
    }
  ): Promise<void> {
    const activePool = postgresPool || pool;
    if (!activePool) return;

    try {
      const cleanEmail = details.contactEmail.toLowerCase().trim();
      const existingRes = await activePool.query(
        `SELECT id FROM outreach_threads 
         WHERE workspace_id = $1 AND (
           (campaign_id = $2 AND prospect_id = $3) OR 
           (provider_thread_id IS NOT NULL AND provider_thread_id = $4) OR
           (email = $5 AND status != 'replied')
         ) LIMIT 1`,
        [workspaceId, details.campaignId, details.prospectId, details.threadId || null, cleanEmail]
      );

      if (existingRes.rows.length > 0) {
        await activePool.query(
          `UPDATE outreach_threads 
           SET campaign_id = $1, 
               prospect_id = $2, 
               provider_thread_id = COALESCE($3, provider_thread_id),
               provider_message_id = COALESCE($4, provider_message_id),
               updated_at = now()
           WHERE id = $5 AND workspace_id = $6`,
          [details.campaignId, details.prospectId, details.threadId || null, details.messageId || null, existingRes.rows[0].id, workspaceId]
        );
      } else {
        await activePool.query(
          `INSERT INTO outreach_threads (
            workspace_id, contact_name, contact_role, company_name, domain,
            email, channel, status, opportunity_score, messages, metadata,
            provider, provider_thread_id, provider_message_id, campaign_id, prospect_id,
            stop_sequence_on_reply, created_at, updated_at
          ) VALUES (
            $1, $2, 'Prospect', $3, $4,
            $5, 'email', 'contacted', 75, $6, $7,
            'gmail', $8, $9, $10, $11,
            true, now(), now()
          )`,
          [
            workspaceId,
            details.contactName || cleanEmail.split('@')[0],
            details.companyName || cleanEmail.split('@')[1] || 'Target Co',
            cleanEmail.split('@')[1] || '',
            cleanEmail,
            JSON.stringify([{
              id: `msg-${Date.now()}`,
              sender: 'me',
              senderName: 'Account Executive',
              content: details.subject || 'Outreach email',
              timestamp: new Date().toISOString(),
              channel: 'email',
              status: 'delivered',
              provider: 'gmail',
              providerMessageId: details.messageId || null,
              providerThreadId: details.threadId || null
            }]),
            JSON.stringify({ subject: details.subject || 'Campaign Outreach', unread: false }),
            details.threadId || null,
            details.messageId || null,
            details.campaignId,
            details.prospectId
          ]
        );
      }
    } catch (err: any) {
      console.warn('[CAMPAIGN_EXECUTION] Thread link notice:', err.message);
    }
  }

  /**
   * Processes all due campaign sequence steps across active campaigns for a workspace.
   */
  public static async processDueCampaignSteps(workspaceId: string): Promise<{
    processedCount: number;
    executedCount: number;
    errors: string[];
  }> {
    const activePool = postgresPool || pool;
    if (!activePool) {
      return { processedCount: 0, executedCount: 0, errors: ['DATABASE_UNAVAILABLE'] };
    }

    let processedCount = 0;
    let executedCount = 0;
    const errors: string[] = [];

    try {
      const activeCampaigns = await activePool.query(
        `SELECT id, target_prospects, status FROM campaigns WHERE workspace_id = $1 AND status = 'active'`,
        [workspaceId]
      );

      for (const campaign of activeCampaigns.rows) {
        const prospects: (TargetProspectItem & { nextStepAt?: string | null })[] =
          Array.isArray(campaign.target_prospects)
            ? campaign.target_prospects
            : (typeof campaign.target_prospects === 'string' ? JSON.parse(campaign.target_prospects) : []);

        for (const prospect of prospects) {
          if (this.isProspectEligibleForStep(prospect, 'active')) {
            processedCount++;
            try {
              const res = await this.executeNextStepForProspect(workspaceId, campaign.id, prospect.id);
              if (res.executed) {
                executedCount++;
              }
            } catch (err: any) {
              errors.push(`Prospect ${prospect.id} step execution failed: ${err.message}`);
            }
          }
        }
      }

      return { processedCount, executedCount, errors };
    } catch (err: any) {
      return { processedCount, executedCount, errors: [err.message] };
    }
  }
}
