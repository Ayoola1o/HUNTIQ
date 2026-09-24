import { randomUUID } from 'crypto';
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
  executionId?: string;
}

export interface StaleRecoveryDetail {
  campaignId: string;
  prospectId: string;
  action: 'recovered_delivered' | 'recovered_failed' | 'marked_needs_review';
  reason: string;
}

export interface StaleRecoveryResult {
  recoveredCount: number;
  deliveredCount: number;
  failedCount: number;
  ambiguousCount: number;
  details: StaleRecoveryDetail[];
  error?: string;
}

/**
 * Sanitizes error messages to protect against credential, token, or connection string leakage.
 */
export function sanitizeDiagnosticError(error: any): string {
  if (!error) return 'Unknown error';
  let str = typeof error === 'string' ? error : (error.message || JSON.stringify(error));

  // Strip Bearer tokens
  str = str.replace(/Bearer\s+[A-Za-z0-9_\-\.]+/gi, 'Bearer [REDACTED]');
  // Strip Google OAuth tokens / api keys (ya29..., AIza...)
  str = str.replace(/ya29\.[A-Za-z0-9_\-]+/gi, '[REDACTED_GOOGLE_TOKEN]');
  str = str.replace(/AIza[0-9A-Za-z-_]{35}/gi, '[REDACTED_API_KEY]');
  // Strip authorization headers, secrets, passwords
  str = str.replace(/(?:password|secret|token|client_secret|client_id)=[^&\s]+/gi, '$1=[REDACTED]');
  // Strip database connection strings
  str = str.replace(/postgres(?:ql)?:\/\/[^@]+@[^\/\s]+/gi, 'postgres://[REDACTED]');
  // Strip raw header dumps
  str = str.replace(/authorization:\s*['"]?[^'",\n]+['"]?/gi, 'authorization: [REDACTED]');

  if (str.length > 500) {
    str = str.substring(0, 500) + '...';
  }
  return str;
}

export class CampaignExecutionService {
  /**
   * Default timeout for detecting abandoned / stale sending executions (5 minutes).
   */
  public static getStaleTimeoutMs(): number {
    const envVal = process.env.CAMPAIGN_STALE_SENDING_TIMEOUT_MS;
    if (envVal) {
      const parsed = parseInt(envVal, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Halts any active sequence follow-ups for a prospect across a workspace's campaigns.
   * Directly updates production database state (target_prospects JSONB in campaigns table)
   * under an explicit PostgreSQL transaction with FOR UPDATE row locks.
   * Sets status to 'replied', clears nextStepAt, claimedAt, and executionId.
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
                claimedAt: null,
                executionId: null,
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

          // Also mark any in-flight execution attempts in campaign_step_executions as aborted_reply
          try {
            await client.query(
              `UPDATE campaign_step_executions 
               SET status = 'aborted_reply', 
                   completed_at = now(),
                   updated_at = now() 
               WHERE workspace_id = $1 AND campaign_id = $2 
                 AND status = 'sending'`,
              [workspaceId, campaignId]
            );
          } catch {}
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
      return { success: false, haltedCount: 0, campaignIds: [], error: sanitizeDiagnosticError(err) };
    } finally {
      client.release();
    }
  }

  /**
   * Determines if a prospect is eligible to receive a sequence step.
   * Returns false immediately if:
   * - campaignStatus is not 'active'
   * - prospect status is 'replied', 'halted', 'converted', 'needs_review'
   * - prospect status is 'sending' and NOT stale
   * - nextStepAt is scheduled in the future
   * - prospect has no email
   */
  public static isProspectEligibleForStep(
    prospect: TargetProspectItem & { nextStepAt?: string | null; claimedAt?: string | null },
    campaignStatus: string,
    staleTimeoutMs = CampaignExecutionService.getStaleTimeoutMs()
  ): boolean {
    if (campaignStatus !== 'active') {
      return false;
    }

    const currentStatus = String(prospect.status || '').toLowerCase();
    if (
      currentStatus === 'replied' ||
      currentStatus === 'halted' ||
      currentStatus === 'converted' ||
      currentStatus === 'needs_review'
    ) {
      return false;
    }

    if (currentStatus === 'sending') {
      // If currently claimed and NOT stale, another worker is executing it
      if (prospect.claimedAt) {
        const claimedTime = new Date(prospect.claimedAt).getTime();
        if (!isNaN(claimedTime) && Date.now() - claimedTime < staleTimeoutMs) {
          return false; // Still active in-flight
        }
      } else {
        return false;
      }
    }

    if (prospect.nextStepAt) {
      const scheduledTime = new Date(prospect.nextStepAt).getTime();
      if (!isNaN(scheduledTime) && scheduledTime > Date.now()) {
        return false; // Scheduled for the future
      }
    }

    if (!prospect.email || !prospect.email.trim()) {
      return false;
    }

    return true;
  }

  /**
   * Executes the next sequence step for a specific prospect in a campaign.
   * Explicit durable state machine & crash-safe 2-transaction architecture:
   * 
   * Transaction A (DB under row lock):
   * - locks campaign & prospect
   * - verifies eligibility
   * - verifies idempotency / previous step executions
   * - claims prospect (status = 'sending', claimedAt, executionId, idempotencyKey)
   * - persists durable step execution record in campaign_step_executions
   * - commits Transaction A & releases connection
   * 
   * Pre-Dispatch Safety Check:
   * - re-checks whether a reply arrived in the interim
   * - aborts safely if replied
   * 
   * External Operation (NO DB TRANSACTION OPEN):
   * - calls external email provider
   * 
   * Transaction B (DB under row lock):
   * - locks campaign & prospect
   * - verifies same execution attempt
   * - checks if reply arrived while dispatch was in flight (preserves replied status)
   * - persists successful (delivered + advance step + nextStepAt) or failed state
   * - persists provider message ID and execution completion in campaign_step_executions
   * - commits Transaction B & releases connection
   */
  public static async executeNextStepForProspect(
    workspaceId: string,
    campaignId: string,
    prospectId: string,
    options?: {
      forceExecutionId?: string;
      staleTimeoutMs?: number;
    }
  ): Promise<StepExecutionResult> {
    const activePool = postgresPool || pool;
    if (!activePool) {
      return { executed: false, reason: 'DATABASE_UNAVAILABLE' };
    }

    const staleTimeout = options?.staleTimeoutMs || this.getStaleTimeoutMs();
    let campaignName = 'Campaign';
    let targetProspect: TargetProspectItem | null = null;
    let nextStepIndex = 0;
    let currentStepDef: any = null;
    let sequenceSteps: any[] = [];
    const executionId = options?.forceExecutionId || randomUUID();
    let idempotencyKey = '';

    // =========================================================================
    // TRANSACTION A: Claim & Lock (Durable State Entry)
    // =========================================================================
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

      const prospects: (TargetProspectItem & { 
        currentStep?: number; 
        nextStepAt?: string | null;
        claimedAt?: string | null;
        executionId?: string | null;
        idempotencyKey?: string | null;
      })[] = Array.isArray(campaign.target_prospects)
        ? campaign.target_prospects
        : (typeof campaign.target_prospects === 'string' ? JSON.parse(campaign.target_prospects) : []);

      const prospectIdx = prospects.findIndex(p => p.id === prospectId);
      if (prospectIdx === -1) {
        await claimClient.query('ROLLBACK');
        return { executed: false, reason: 'PROSPECT_NOT_FOUND' };
      }

      targetProspect = prospects[prospectIdx];

      // Eligibility & Reply Guard:
      // If prospect has replied, been halted, converted, or is currently in-flight, abort immediately!
      if (!this.isProspectEligibleForStep(targetProspect, campaign.status, staleTimeout)) {
        await claimClient.query('ROLLBACK');
        const reason = targetProspect.status === 'sending' 
          ? 'STEP_EXECUTION_IN_FLIGHT' 
          : `INELIGIBLE_STATUS_${String(targetProspect.status || '').toUpperCase()}`;
        return { executed: false, reason };
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
          claimedAt: null,
          executionId: null,
          lastTouch: 'Sequence completed'
        };
        await claimClient.query(
          `UPDATE campaigns SET target_prospects = $1, updated_at = now() WHERE id = $2 AND workspace_id = $3`,
          [JSON.stringify(prospects), campaignId, workspaceId]
        );
        await claimClient.query('COMMIT');
        return { executed: false, reason: 'SEQUENCE_COMPLETED' };
      }

      // Check durable execution history in campaign_step_executions
      idempotencyKey = `${workspaceId}:${campaignId}:${prospectId}:step_${nextStepIndex}:${executionId}`;

      try {
        const stepExecRes = await claimClient.query(
          `SELECT id, status, provider_message_id, claimed_at 
           FROM campaign_step_executions 
           WHERE workspace_id = $1 AND campaign_id = $2 AND prospect_id = $3 AND sequence_step = $4 
           FOR UPDATE`,
          [workspaceId, campaignId, prospectId, nextStepIndex]
        );

        if (stepExecRes.rows.length > 0) {
          const prevExec = stepExecRes.rows[0];

          // 1. If step was already delivered, DO NOT dispatch again!
          if (prevExec.status === 'delivered') {
            await claimClient.query('ROLLBACK');
            return {
              executed: false,
              reason: 'STEP_ALREADY_DELIVERED',
              messageId: prevExec.provider_message_id
            };
          }

          // 2. If same execution ID is being retried
          if (prevExec.id === executionId && prevExec.status === 'delivered') {
            await claimClient.query('ROLLBACK');
            return { executed: false, reason: 'EXECUTION_ALREADY_COMPLETED' };
          }

          // 3. If in-flight and not stale
          if (prevExec.status === 'sending') {
            const prevClaimed = new Date(prevExec.claimed_at).getTime();
            if (!isNaN(prevClaimed) && Date.now() - prevClaimed < staleTimeout) {
              await claimClient.query('ROLLBACK');
              return { executed: false, reason: 'STEP_EXECUTION_IN_FLIGHT' };
            }
          }

          // 4. If marked unresolved_recovery (ambiguous send)
          if (prevExec.status === 'unresolved_recovery') {
            await claimClient.query('ROLLBACK');
            return { executed: false, reason: 'AMBIGUOUS_STALE_EXECUTION' };
          }

          // Update existing execution record to new attempt
          await claimClient.query(
            `UPDATE campaign_step_executions 
             SET id = $1, 
                 idempotency_key = $2, 
                 status = 'sending', 
                 claimed_at = now(), 
                 completed_at = null,
                 error_code = null,
                 error_message = null,
                 updated_at = now() 
             WHERE workspace_id = $3 AND campaign_id = $4 AND prospect_id = $5 AND sequence_step = $6`,
            [executionId, idempotencyKey, workspaceId, campaignId, prospectId, nextStepIndex]
          );
        } else {
          // Insert new execution attempt record
          await claimClient.query(
            `INSERT INTO campaign_step_executions (
               id, workspace_id, campaign_id, prospect_id, sequence_step, 
               idempotency_key, status, claimed_at, updated_at
             ) VALUES ($1, $2, $3, $4, $5, $6, 'sending', now(), now())`,
            [executionId, workspaceId, campaignId, prospectId, nextStepIndex, idempotencyKey]
          );
        }
      } catch (stepErr: any) {
        // If unique constraint violated by concurrent insert
        if (stepErr.code === '23505') {
          await claimClient.query('ROLLBACK');
          return { executed: false, reason: 'CONCURRENT_EXECUTION_CONFLICT' };
        }
        // If table does not exist yet (during initial migration boot), proceed safely
        console.warn('[CAMPAIGN_EXECUTION] Step executions table notice:', stepErr.message);
      }

      // Claim prospect state in campaigns.target_prospects
      const nowIso = new Date().toISOString();
      prospects[prospectIdx] = {
        ...targetProspect,
        status: 'sending' as any,
        claimedAt: nowIso,
        executionId,
        idempotencyKey,
        currentStep: nextStepIndex,
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
      return { executed: false, reason: sanitizeDiagnosticError(err) };
    } finally {
      claimClient.release();
    }

    // =========================================================================
    // PRE-DISPATCH SAFETY CHECK: Re-verify prospect state after claiming
    // If a reply arrived between claim and dispatch, abort safely!
    // =========================================================================
    try {
      const preCheck = await activePool.query(
        `SELECT target_prospects FROM campaigns WHERE id = $1 AND workspace_id = $2`,
        [campaignId, workspaceId]
      );
      if (preCheck.rows.length > 0) {
        const pList = Array.isArray(preCheck.rows[0].target_prospects)
          ? preCheck.rows[0].target_prospects
          : JSON.parse(preCheck.rows[0].target_prospects || '[]');
        const currentP = pList.find((p: any) => p.id === prospectId);
        if (currentP && (currentP.status === 'replied' || currentP.status === 'halted')) {
          // Abort execution safely before calling external email provider
          try {
            await activePool.query(
              `UPDATE campaign_step_executions 
               SET status = 'aborted_reply', completed_at = now(), updated_at = now() 
               WHERE id = $1 AND workspace_id = $2`,
              [executionId, workspaceId]
            );
          } catch {}
          return { executed: false, reason: 'REPLY_ARRIVED_BEFORE_DISPATCH' };
        }
      }
    } catch {}

    // =========================================================================
    // EXTERNAL OPERATION (NO OPEN DATABASE TRANSACTION)
    // =========================================================================
    let dispatchRes: any;
    try {
      dispatchRes = await EmailDispatchService.sendEmail({
        to: targetProspect.email,
        toName: targetProspect.contactName,
        subject: currentStepDef.title || `Follow-up from ${campaignName}`,
        text: currentStepDef.contentSnippet || 'Hi, checking in on our previous conversation.',
        campaignId,
        prospectId: targetProspect.id,
        idempotencyKey
      }, workspaceId);
    } catch (dispatchErr: any) {
      dispatchRes = {
        success: false,
        messageId: `err-${Date.now()}`,
        provider: 'simulation',
        status: 'failed',
        to: targetProspect.email,
        deliveredAt: new Date().toISOString(),
        error: sanitizeDiagnosticError(dispatchErr)
      };
    }

    // =========================================================================
    // TRANSACTION B: Reconcile Post-Dispatch State (Durable State Finalization)
    // =========================================================================
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
        const latestProspects: (TargetProspectItem & { 
          currentStep?: number; 
          nextStepAt?: string | null;
          claimedAt?: string | null;
          executionId?: string | null;
          idempotencyKey?: string | null;
          lastError?: string | null;
        })[] = Array.isArray(row.target_prospects)
          ? row.target_prospects
          : (typeof row.target_prospects === 'string' ? JSON.parse(row.target_prospects) : []);

        const pIdx = latestProspects.findIndex(p => p.id === prospectId);
        if (pIdx !== -1) {
          const currentProspect = latestProspects[pIdx];

          // 1. STOP-ON-REPLY PRECEDENCE:
          // Did an inbound reply arrive while dispatch was in flight?
          // If prospect is 'replied' or 'halted', NEVER overwrite with 'delivered' and keep nextStepAt = null!
          if (currentProspect.status === 'replied' || (currentProspect as any).status === 'halted') {
            try {
              await reconcileClient.query(
                `UPDATE campaign_step_executions 
                 SET status = $1, 
                     provider_message_id = $2, 
                     provider_thread_id = $3, 
                     completed_at = now(),
                     updated_at = now() 
                 WHERE id = $4 AND workspace_id = $5`,
                [
                  dispatchRes.success ? 'delivered' : 'failed',
                  dispatchRes.messageId || null,
                  dispatchRes.threadId || null,
                  executionId,
                  workspaceId
                ]
              );
            } catch {}

            await reconcileClient.query('COMMIT');
            return {
              executed: true,
              messageId: dispatchRes.messageId,
              nextStepAt: null,
              reason: 'DISPATCHED_BUT_REPLY_COMMITTED'
            };
          }

          // 2. VERIFY EXECUTION ATTEMPT:
          // Ensure we are finalizing the exact execution attempt that held the claim
          if (currentProspect.executionId && currentProspect.executionId !== executionId) {
            await reconcileClient.query('ROLLBACK');
            return { executed: false, reason: 'EXECUTION_ATTEMPT_MISMATCH' };
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
              status: upcomingStepDef ? 'delivered' : 'converted',
              nextStepAt: upcomingNextStepDate,
              claimedAt: null,
              executionId: null,
              idempotencyKey: null,
              lastError: null,
              lastTouch: upcomingStepDef
                ? `Step ${currentStepDef.stepNumber || nextStepIndex + 1} sent: ${currentStepDef.title || 'Follow-up'}`
                : 'Sequence completed successfully'
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

            // Persist success in campaign_step_executions
            try {
              await reconcileClient.query(
                `UPDATE campaign_step_executions 
                 SET status = 'delivered', 
                     provider = $1,
                     provider_message_id = $2, 
                     provider_thread_id = $3, 
                     completed_at = now(),
                     updated_at = now() 
                 WHERE id = $4 AND workspace_id = $5`,
                [
                  dispatchRes.provider || 'email',
                  dispatchRes.messageId || null,
                  dispatchRes.threadId || null,
                  executionId,
                  workspaceId
                ]
              );
            } catch {}
          } else {
            // Handle Provider Failure cleanly with safe diagnostic info
            const safeErrorMessage = sanitizeDiagnosticError(dispatchRes.error || 'Provider delivery error');

            latestProspects[pIdx] = {
              ...currentProspect,
              status: 'failed',
              claimedAt: null,
              executionId: null,
              idempotencyKey: null,
              lastError: safeErrorMessage,
              lastTouch: `Step dispatch failed: ${safeErrorMessage}`
            };

            await reconcileClient.query(
              `UPDATE campaigns SET target_prospects = $1, updated_at = now() WHERE id = $2 AND workspace_id = $3`,
              [JSON.stringify(latestProspects), campaignId, workspaceId]
            );

            // Persist failure in campaign_step_executions
            try {
              await reconcileClient.query(
                `UPDATE campaign_step_executions 
                 SET status = 'failed', 
                     error_code = 'PROVIDER_DISPATCH_FAILED',
                     error_message = $1,
                     completed_at = now(),
                     updated_at = now() 
                 WHERE id = $2 AND workspace_id = $3`,
                [safeErrorMessage, executionId, workspaceId]
              );
            } catch {}
          }
        }
      }

      await reconcileClient.query('COMMIT');
    } catch (err: any) {
      try {
        await reconcileClient.query('ROLLBACK');
      } catch {}
      console.error('[CAMPAIGN_EXECUTION] Reconcile phase error:', err.message);
      return { executed: false, reason: sanitizeDiagnosticError(err) };
    } finally {
      reconcileClient.release();
    }

    if (!dispatchRes.success) {
      return { 
        executed: false, 
        reason: sanitizeDiagnosticError(dispatchRes.error || 'EMAIL_DISPATCH_FAILED'),
        executionId 
      };
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
      threadId: dispatchRes.threadId
    });

    return {
      executed: true,
      messageId: dispatchRes.messageId,
      nextStepAt: upcomingNextStepDate,
      executionId
    };
  }

  /**
   * Recovers abandoned or stale 'sending' records across campaigns in a workspace.
   * If a process crashed or timed out while a prospect was 'sending':
   * - Determines whether the original provider operation has a durable provider/message execution record
   * - If delivered: reconciles prospect to 'delivered', advances sequence step, updates sent_count
   * - If failed: reconciles prospect to 'failed'
   * - If provider outcome is ambiguous / unknown: marks prospect 'needs_review' rather than blindly resending!
   */
  public static async recoverStaleSendingRecords(
    workspaceId: string,
    customTimeoutMs?: number
  ): Promise<StaleRecoveryResult> {
    const activePool = postgresPool || pool;
    if (!activePool) {
      return { recoveredCount: 0, deliveredCount: 0, failedCount: 0, ambiguousCount: 0, details: [], error: 'DATABASE_UNAVAILABLE' };
    }

    const timeoutMs = customTimeoutMs || this.getStaleTimeoutMs();
    const cutoffTime = Date.now() - timeoutMs;
    const details: StaleRecoveryDetail[] = [];
    let recoveredCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;
    let ambiguousCount = 0;

    const client = await activePool.connect();
    try {
      await client.query('BEGIN');

      const campaignsRes = await client.query(
        `SELECT id, target_prospects, sent_count, sequence_steps 
         FROM campaigns 
         WHERE workspace_id = $1 
         FOR UPDATE`,
        [workspaceId]
      );

      for (const campaign of campaignsRes.rows) {
        const campaignId = campaign.id;
        let prospects: any[] = Array.isArray(campaign.target_prospects)
          ? campaign.target_prospects
          : (typeof campaign.target_prospects === 'string' ? JSON.parse(campaign.target_prospects) : []);

        const sequenceSteps = Array.isArray(campaign.sequence_steps)
          ? campaign.sequence_steps
          : (typeof campaign.sequence_steps === 'string' ? JSON.parse(campaign.sequence_steps) : []);

        let campaignModified = false;
        let newSentCount = campaign.sent_count || 0;

        for (let i = 0; i < prospects.length; i++) {
          const p = prospects[i];

          // Check if prospect is stuck in 'sending'
          if (p.status === 'sending') {
            const claimedTime = p.claimedAt ? new Date(p.claimedAt).getTime() : 0;
            const isStale = !claimedTime || claimedTime < cutoffTime;

            if (isStale) {
              const currentStepIdx = p.currentStep !== undefined ? p.currentStep : 0;

              // Check durable execution log
              let execRow: any = null;
              try {
                const execRes = await client.query(
                  `SELECT * FROM campaign_step_executions 
                   WHERE workspace_id = $1 AND campaign_id = $2 AND prospect_id = $3 AND sequence_step = $4`,
                  [workspaceId, campaignId, p.id, currentStepIdx]
                );
                if (execRes.rows.length > 0) {
                  execRow = execRes.rows[0];
                }
              } catch {}

              // Also check outreach_threads for linked message ID if any
              let threadRow: any = null;
              try {
                const threadRes = await client.query(
                  `SELECT provider_message_id, provider_thread_id FROM outreach_threads 
                   WHERE workspace_id = $1 AND campaign_id = $2 AND prospect_id = $3 
                   LIMIT 1`,
                  [workspaceId, campaignId, p.id]
                );
                if (threadRes.rows.length > 0) {
                  threadRow = threadRes.rows[0];
                }
              } catch {}

              const confirmedMessageId = execRow?.provider_message_id || threadRow?.provider_message_id;

              if (execRow?.status === 'delivered' || confirmedMessageId) {
                // CASE 1: Message was delivered before the crash!
                // Reconcile prospect to delivered and advance step
                const upcomingStepDef = sequenceSteps[currentStepIdx + 1];
                const nextDelayDays = upcomingStepDef?.delayDays || 3;
                const nextStepDate = upcomingStepDef
                  ? new Date(Date.now() + nextDelayDays * 86400000).toISOString()
                  : null;

                prospects[i] = {
                  ...p,
                  currentStep: currentStepIdx + 1,
                  status: upcomingStepDef ? 'delivered' : 'converted',
                  nextStepAt: nextStepDate,
                  claimedAt: null,
                  executionId: null,
                  idempotencyKey: null,
                  lastError: null,
                  lastTouch: `Recovered: Step ${currentStepIdx + 1} confirmed delivered (Msg: ${confirmedMessageId || 'verified'})`
                };

                newSentCount++;
                campaignModified = true;
                recoveredCount++;
                deliveredCount++;
                details.push({
                  campaignId,
                  prospectId: p.id,
                  action: 'recovered_delivered',
                  reason: `Confirmed delivery with provider message ID: ${confirmedMessageId || 'delivered'}`
                });
              } else if (execRow?.status === 'failed') {
                // CASE 2: Message failed before crash
                prospects[i] = {
                  ...p,
                  status: 'failed',
                  claimedAt: null,
                  executionId: null,
                  idempotencyKey: null,
                  lastError: execRow.error_message || 'Provider dispatch failed prior to process crash',
                  lastTouch: `Recovery: Dispatch failed prior to timeout`
                };
                campaignModified = true;
                recoveredCount++;
                failedCount++;
                details.push({
                  campaignId,
                  prospectId: p.id,
                  action: 'recovered_failed',
                  reason: execRow.error_message || 'Provider failed prior to crash'
                });
              } else {
                // CASE 3: Ambiguous state (status still 'sending', no confirmation)
                // DO NOT resend blindly! Mark 'needs_review' to surface ambiguity safely
                prospects[i] = {
                  ...p,
                  status: 'needs_review',
                  claimedAt: null,
                  executionId: null,
                  idempotencyKey: null,
                  lastError: 'STALE_SENDING_AMBIGUOUS',
                  lastTouch: 'Execution timed out in sending state without provider delivery confirmation. Operator review required.'
                };

                // Mark execution attempt as unresolved_recovery
                try {
                  await client.query(
                    `UPDATE campaign_step_executions 
                     SET status = 'unresolved_recovery', 
                         error_code = 'STALE_SENDING_AMBIGUOUS',
                         error_message = 'Execution timed out without provider confirmation',
                         updated_at = now() 
                     WHERE workspace_id = $1 AND campaign_id = $2 AND prospect_id = $3 AND sequence_step = $4`,
                    [workspaceId, campaignId, p.id, currentStepIdx]
                  );
                } catch {}

                campaignModified = true;
                recoveredCount++;
                ambiguousCount++;
                details.push({
                  campaignId,
                  prospectId: p.id,
                  action: 'marked_needs_review',
                  reason: 'Execution timed out without provider confirmation. Surfaced to operator to prevent double-send.'
                });
              }
            }
          }
        }

        if (campaignModified) {
          await client.query(
            `UPDATE campaigns 
             SET target_prospects = $1, 
                 sent_count = $2, 
                 updated_at = now() 
             WHERE id = $3 AND workspace_id = $4`,
            [JSON.stringify(prospects), newSentCount, campaignId, workspaceId]
          );
        }
      }

      await client.query('COMMIT');

      return {
        recoveredCount,
        deliveredCount,
        failedCount,
        ambiguousCount,
        details
      };
    } catch (err: any) {
      try {
        await client.query('ROLLBACK');
      } catch {}
      console.error('[CAMPAIGN_EXECUTION] Stale recovery error:', err.message);
      return {
        recoveredCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        ambiguousCount: 0,
        details: [],
        error: sanitizeDiagnosticError(err)
      };
    } finally {
      client.release();
    }
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
   * Runs recovery for stale sending records first, then executes due steps.
   */
  public static async processDueCampaignSteps(workspaceId: string): Promise<{
    processedCount: number;
    executedCount: number;
    recoveredCount: number;
    errors: string[];
  }> {
    const activePool = postgresPool || pool;
    if (!activePool) {
      return { processedCount: 0, executedCount: 0, recoveredCount: 0, errors: ['DATABASE_UNAVAILABLE'] };
    }

    let processedCount = 0;
    let executedCount = 0;
    let recoveredCount = 0;
    const errors: string[] = [];

    try {
      // 1. Recover any abandoned or stale sending records first
      const recoveryRes = await this.recoverStaleSendingRecords(workspaceId);
      recoveredCount = recoveryRes.recoveredCount;

      // 2. Scan active campaigns for eligible due steps
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
              errors.push(`Prospect ${prospect.id} step execution failed: ${sanitizeDiagnosticError(err)}`);
            }
          }
        }
      }

      return { processedCount, executedCount, recoveredCount, errors };
    } catch (err: any) {
      return { processedCount, executedCount, recoveredCount, errors: [sanitizeDiagnosticError(err)] };
    }
  }
}
