import { postgresPool, pool } from '../database/postgres';
import { config } from '../config/env';
import { GoogleAuthService } from './googleAuthService';
import { createActivityLogRepository } from '../repositories/activity-logs';
import { CampaignExecutionService, sanitizeDiagnosticError } from './campaignExecutionService';

export interface GmailWatchResult {
  success: boolean;
  historyId?: string;
  expiration?: string;
  topicName?: string;
  isConfigured: boolean;
  error?: string;
}

export interface WatchRenewalDetail {
  workspaceId: string;
  accountEmail?: string;
  status: 'renewed' | 'skipped' | 'failed';
  expiration?: string;
  historyId?: string;
  error?: string;
}

export interface WatchRenewalSummary {
  checked: number;
  renewed: number;
  failed: number;
  skipped: number;
  details: WatchRenewalDetail[];
  error?: string;
}

export interface SyncMailboxResult {
  success: boolean;
  processedCount: number;
  repliesCount: number;
  newHistoryId?: string;
  error?: string;
}

export function isGmailWatchRenewalDue(expiration: string | Date | null | undefined, now = Date.now(), renewalWindowMs = 24 * 60 * 60 * 1000): boolean {
  if (!expiration) return true;
  const expirationTime = new Date(expiration).getTime();
  return !Number.isFinite(expirationTime) || expirationTime <= now + renewalWindowMs;
}

export async function fetchGmailHistoryPages(accessToken: string, startHistoryId: string, fetcher: typeof fetch = fetch): Promise<{ history: any[]; historyId: string }> {
  const history: any[] = [];
  let pageToken: string | undefined;
  let historyId = startHistoryId;
  do {
    const params = new URLSearchParams({ startHistoryId, historyTypes: 'messageAdded', maxResults: '500' });
    if (pageToken) params.set('pageToken', pageToken);
    const response = await fetcher(`https://gmail.googleapis.com/gmail/v1/users/me/history?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) throw Object.assign(new Error(`Gmail history API error HTTP ${response.status}; cursor was not advanced.`), { statusCode: response.status, code: response.status === 404 ? 'HISTORY_CURSOR_EXPIRED' : 'HISTORY_FETCH_FAILED' });
    const data: any = await response.json();
    historyId = String(data.historyId || historyId);
    history.push(...(data.history || []));
    pageToken = data.nextPageToken || undefined;
  } while (pageToken);
  const seen = new Set<string>();
  const deduped = history.map(item => ({ ...item, messagesAdded: (item.messagesAdded || []).filter((entry: any) => {
    const id = entry?.message?.id;
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id); return true;
  }) })).filter(item => item.messagesAdded.length);
  return { history: deduped, historyId };
}

export async function fetchGmailInboxBackfill(accessToken: string, afterTimestamp: Date, fetcher: typeof fetch = fetch): Promise<any[]> {
  const items: any[] = [];
  const seen = new Set<string>();
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({ labelIds: 'INBOX', q: `after:${Math.floor(afterTimestamp.getTime() / 1000)}`, maxResults: '500' });
    if (pageToken) params.set('pageToken', pageToken);
    const response = await fetcher(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) throw new Error(`Gmail inbox backfill failed HTTP ${response.status}; history cursor was not advanced.`);
    const data: any = await response.json();
    for (const message of data.messages || []) if (!seen.has(message.id)) { seen.add(message.id); items.push({ messagesAdded: [{ message }] }); }
    pageToken = data.nextPageToken || undefined;
  } while (pageToken);
  return items;
}

export async function recoverOutboundAttempt(pool: any, workspaceId: string, input: {
  requestId?: string; messageId: string; threadId: string; rfcMessageId?: string;
  senderName: string; recipientEmail: string; subject: string; body: string; timestamp: string;
}): Promise<boolean> {
  if (!input.requestId) return false;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const attempt = await client.query(`SELECT outreach_thread_id FROM outbound_email_attempts WHERE workspace_id=$1 AND request_id=$2 FOR UPDATE`, [workspaceId, input.requestId]);
    if (!attempt.rowCount) { await client.query('ROLLBACK'); return false; }
    const thread = await client.query(`SELECT messages, lead_id, company_id FROM outreach_threads WHERE id=$1 AND workspace_id=$2 FOR UPDATE`, [attempt.rows[0].outreach_thread_id, workspaceId]);
    if (!thread.rowCount) { await client.query('ROLLBACK'); return false; }
    const messages = Array.isArray(thread.rows[0].messages) ? thread.rows[0].messages : [];
    const isNewMessage = !messages.some((message: any) => message.providerMessageId === input.messageId);
    if (isNewMessage) messages.push({
      id: `gmail-${input.messageId}`, sender: 'me', senderName: input.senderName || 'HUNTIQ',
      content: input.body, timestamp: input.timestamp, channel: 'email', deliveryStatus: 'sent',
      providerMessageId: input.messageId, providerThreadId: input.threadId,
      providerRfcMessageId: input.rfcMessageId
    });
    messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    await client.query(`UPDATE outreach_threads SET messages=$1, provider_thread_id=$2, provider_message_id=$3, provider_rfc_message_id=$4, status='contacted', metadata=metadata || jsonb_build_object('subject',$5,'lastMessageSnippet',$6), updated_at=now() WHERE id=$7 AND workspace_id=$8`, [JSON.stringify(messages), input.threadId, input.messageId, input.rfcMessageId || null, input.subject, input.body.slice(0, 160), attempt.rows[0].outreach_thread_id, workspaceId]);
    await client.query(`UPDATE outbound_email_attempts SET state='sent', provider_message_id=$3, provider_thread_id=$4, provider_rfc_message_id=$5, error_code=NULL, updated_at=now() WHERE workspace_id=$1 AND request_id=$2`, [workspaceId, input.requestId, input.messageId, input.threadId, input.rfcMessageId || null]);
    if (isNewMessage && thread.rows[0].lead_id) await client.query(`INSERT INTO activities (workspace_id, company_id, lead_id, type, title, description, metadata) VALUES ($1,$2,$3,'email_sent',$4,$5,$6::jsonb)`, [workspaceId, thread.rows[0].company_id, thread.rows[0].lead_id, `Email sent to ${input.recipientEmail}`, input.body.slice(0, 5000), JSON.stringify({ provider: 'gmail', providerMessageId: input.messageId, providerThreadId: input.threadId, subject: input.subject })]);
    await client.query('COMMIT');
    return true;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}

export async function linkUnmatchedInbound(pool: any, workspaceId: string, eventId: string, threadId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const event = await client.query(`SELECT * FROM inbound_email_events WHERE id=$1 AND workspace_id=$2 AND correlation_status='unresolved' AND reviewed_at IS NULL FOR UPDATE`, [eventId, workspaceId]);
    const thread = await client.query(`SELECT * FROM outreach_threads WHERE id=$1 AND workspace_id=$2 FOR UPDATE`, [threadId, workspaceId]);
    if (!event.rowCount || !thread.rowCount) throw Object.assign(new Error('Unmatched email or conversation was not found in this workspace.'), { statusCode: 404, code: 'UNMATCHED_OR_THREAD_NOT_FOUND' });
    const row = event.rows[0], target = thread.rows[0];
    if ((target.email || '').toLowerCase() !== (row.sender_email || '').toLowerCase()) throw Object.assign(new Error('The sender address does not match this conversation.'), { statusCode: 400, code: 'SENDER_MISMATCH' });
    const messages = Array.isArray(target.messages) ? target.messages : [];
    if (!messages.some((message: any) => message.providerMessageId === row.provider_message_id)) messages.push({ id: `gmail-${row.provider_message_id}`, sender: 'prospect', senderName: row.sender_name || target.contact_name, content: row.body_text || row.snippet || '', timestamp: row.message_date || row.received_at, channel: 'email', providerThreadId: row.provider_thread_id, providerMessageId: row.provider_message_id });
    messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    await client.query(`UPDATE outreach_threads SET messages=$1, status='replied', provider_thread_id=COALESCE(provider_thread_id,$2), provider_message_id=$3, metadata=metadata || jsonb_build_object('lastMessageSnippet',$4,'unread',true), updated_at=now() WHERE id=$5 AND workspace_id=$6`, [JSON.stringify(messages), row.provider_thread_id, row.provider_message_id, (row.body_text || row.snippet || '').slice(0, 160), threadId, workspaceId]);
    if (target.lead_id) await client.query(`INSERT INTO activities (workspace_id, company_id, lead_id, type, title, description, metadata) VALUES ($1,$2,$3,'email_reply',$4,$5,$6::jsonb)`, [workspaceId, target.company_id, target.lead_id, `Email reply from ${row.sender_email}`, (row.body_text || row.snippet || '').slice(0, 5000), JSON.stringify({ provider: 'gmail', providerMessageId: row.provider_message_id, providerThreadId: row.provider_thread_id, subject: row.subject })]);
    await client.query(`UPDATE inbound_email_events SET correlation_status='matched', matched_thread_id=$1, reviewed_at=now(), processing_at=NULL WHERE id=$2 AND workspace_id=$3`, [threadId, eventId, workspaceId]);
    await client.query('COMMIT');
    if (target.campaign_id || target.prospect_id) {
      const halt = await CampaignExecutionService.haltProspectSequence(workspaceId, { campaignId: target.campaign_id, prospectId: target.prospect_id, contactEmail: row.sender_email, userId: target.user_id, reason: `Prospect reply manually matched from Gmail thread ${row.provider_thread_id}` });
      if (!halt.success) console.warn(`[GMAIL_UNMATCHED] Reply was linked but campaign stop failed: ${sanitizeDiagnosticError(halt.error || 'unknown error')}`);
    }
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}

export class GmailReplySyncService {
  private static isProduction(): boolean {
    return config.nodeEnv === 'production' || process.env.VERCEL === '1';
  }

  private static testWatchHandler: ((workspaceId: string, accessToken: string, topic: string) => Promise<GmailWatchResult | null>) | null = null;

  public static setTestWatchHandler(handler: ((workspaceId: string, accessToken: string, topic: string) => Promise<GmailWatchResult | null>) | null): void {
    this.testWatchHandler = handler;
  }

  /**
   * Sets up or refreshes a Gmail Watch subscription on the user's inbox using Google Cloud Pub/Sub.
   * If topic is not configured, fetches baseline historyId from user profile.
   */
  public static async setupWatch(workspaceId: string, options?: { preserveHistory?: boolean }): Promise<GmailWatchResult> {
    const accessToken = await GoogleAuthService.getValidAccessToken(workspaceId);
    const activePool = postgresPool || pool;

    if (!accessToken) {
      if (activePool) {
        await activePool.query(
          `UPDATE workspace_integrations 
           SET sync_status = 'reauth_required', 
               last_sync_error = 'Google authorization expired or invalid; reauthentication required', 
               updated_at = now() 
           WHERE workspace_id = $1 AND provider = 'gmail'`,
          [workspaceId]
        );
      }
      return {
        success: false,
        isConfigured: false,
        error: 'Unable to retrieve valid Google access token for watch setup.'
      };
    }

    const pubsubTopic = (process.env.GOOGLE_PUBSUB_TOPIC || process.env.GCP_PUBSUB_TOPIC)?.trim() || 'projects/huntiq/topics/gmail-mailbox-events';

    // Hook for deterministic integration tests
    if (this.testWatchHandler) {
      const mockResult = await this.testWatchHandler(workspaceId, accessToken, pubsubTopic);
      if (mockResult) {
        if (mockResult.success && activePool) {
          const expDate = mockResult.expiration ? new Date(mockResult.expiration) : new Date(Date.now() + 7 * 86400000);
          await activePool.query(
            `UPDATE workspace_integrations 
             SET watch_history_id = CASE WHEN $5 THEN watch_history_id ELSE $1 END,
                 watch_expiration = $2, 
                 watch_resource_id = $3, 
                 sync_status = 'active', 
                 last_sync_error = null, 
                 updated_at = now() 
             WHERE workspace_id = $4 AND provider = 'gmail'`,
            [mockResult.historyId || '1000', expDate, mockResult.topicName || pubsubTopic, workspaceId, Boolean(options?.preserveHistory)]
          );
        } else if (!mockResult.success && activePool) {
          await activePool.query(
            `UPDATE workspace_integrations 
             SET last_sync_error = $1, updated_at = now() 
             WHERE workspace_id = $2 AND provider = 'gmail'`,
            [sanitizeDiagnosticError(mockResult.error || 'Test watch failed'), workspaceId]
          );
        }
        return mockResult;
      }
    }

    if (!process.env.GOOGLE_PUBSUB_TOPIC && !process.env.GCP_PUBSUB_TOPIC) {
      // Pub/Sub topic not configured in environment. Fetch baseline profile history ID.
      try {
        const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (profileRes.ok) {
          const profileData: any = await profileRes.json();
          const historyId = profileData.historyId ? String(profileData.historyId) : undefined;

          if (activePool && historyId) {
            await activePool.query(
              `UPDATE workspace_integrations 
               SET watch_history_id = CASE WHEN $3 THEN watch_history_id ELSE $1 END, sync_status = 'idle', updated_at = now()
               WHERE workspace_id = $2 AND provider = 'gmail'`,
              [historyId, workspaceId, Boolean(options?.preserveHistory)]
            );
          }

          return {
            success: true,
            isConfigured: false,
            historyId,
            error: 'Pub/Sub topic not configured. Baseline history initialized.'
          };
        }
      } catch (err: any) {
        console.warn('[GMAIL_WATCH] Failed to retrieve baseline profile history:', err.message);
      }

      return {
        success: false,
        isConfigured: false,
        error: 'GOOGLE_PUBSUB_TOPIC is not configured in environment variables.'
      };
    }

    try {
      const watchRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/watch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topicName: pubsubTopic,
          labelIds: ['INBOX']
        })
      });

      const watchData: any = await watchRes.json();
      if (!watchRes.ok) {
        const rawErrorMsg = watchData.error?.message || 'Failed to register Gmail watch with Google API';
        const errorMsg = sanitizeDiagnosticError(rawErrorMsg);
        console.error('[GMAIL_WATCH] Registration failed:', errorMsg);

        if (activePool) {
          await activePool.query(
            `UPDATE workspace_integrations 
             SET last_sync_error = $1, updated_at = now() 
             WHERE workspace_id = $2 AND provider = 'gmail'`,
            [errorMsg, workspaceId]
          );
        }

        return {
          success: false,
          isConfigured: true,
          error: errorMsg
        };
      }

      const historyId = String(watchData.historyId);
      const expirationDate = watchData.expiration ? new Date(Number(watchData.expiration)) : null;

      if (activePool) {
        await activePool.query(
          `UPDATE workspace_integrations 
           SET watch_history_id = CASE WHEN $5 THEN watch_history_id ELSE $1 END,
               watch_expiration = $2, 
               watch_resource_id = $3, 
               sync_status = 'active', 
               last_sync_error = null, 
               updated_at = now() 
           WHERE workspace_id = $4 AND provider = 'gmail'`,
          [historyId, expirationDate, pubsubTopic, workspaceId, Boolean(options?.preserveHistory)]
        );
      }

      console.log(`[GMAIL_WATCH] Watch established for workspace ${workspaceId}, historyId: ${historyId}`);
      return {
        success: true,
        isConfigured: true,
        historyId,
        expiration: expirationDate?.toISOString(),
        topicName: pubsubTopic
      };
    } catch (err: any) {
      const safeError = sanitizeDiagnosticError(err);
      console.error('[GMAIL_WATCH] Error establishing watch:', safeError);
      return {
        success: false,
        isConfigured: true,
        error: safeError
      };
    }
  }

  /**
   * Renews an existing Gmail watch subscription for a workspace before it expires.
   * Safe to call repeatedly; idempotent and updates watch_expiration.
   */
  public static async renewWatch(workspaceId: string): Promise<GmailWatchResult> {
    const activePool = postgresPool || pool;
    let accountEmail = '';
    if (activePool) {
      const integrationRes = await activePool.query(
        `SELECT is_active, sync_status, watch_expiration 
         FROM workspace_integrations 
         WHERE workspace_id = $1 AND provider = 'gmail' LIMIT 1`,
        [workspaceId]
      );

      if (integrationRes.rows.length === 0 || !integrationRes.rows[0].is_active || integrationRes.rows[0].sync_status === 'disconnected') {
        return {
          success: false,
          isConfigured: false,
          error: 'Integration is disconnected or inactive; renewal skipped.'
        };
      }

      if (integrationRes.rows[0].sync_status === 'reauth_required') {
        return {
          success: false,
          isConfigured: false,
          error: 'Google authorization expired or revoked; reauthentication required.'
        };
      }
      // Drain the old cursor before Gmail's watch response replaces it. Otherwise
      // messages between the old cursor and renewal can be silently skipped.
      if (!this.testWatchHandler) {
        const account = await activePool.query(`SELECT account_email FROM workspace_integrations WHERE workspace_id=$1 AND provider='gmail' LIMIT 1`, [workspaceId]);
        accountEmail = account.rows[0]?.account_email || '';
        const sync = await this.syncMailbox(workspaceId, accountEmail);
        if (!sync.success) return { success: false, isConfigured: true, error: `Inbox sync failed before watch renewal: ${sync.error || 'unknown sync error'}` };
      }
    }
    const renewal = await this.setupWatch(workspaceId, { preserveHistory: Boolean(activePool && !this.testWatchHandler) });
    if (!renewal.success || !activePool || this.testWatchHandler) return renewal;
    const catchup = await this.syncMailbox(workspaceId, accountEmail);
    if (!catchup.success) return { ...renewal, success: false, error: `Inbox sync failed after watch renewal: ${catchup.error || 'unknown sync error'}` };
    return renewal;
  }

  /**
   * Scans all active Gmail integrations across all workspaces and renews any
   * whose watch_expiration is within the renewal window (default 24 hours) or has expired.
   * Isolates failures so one workspace's error never prevents others from being renewed.
   * Idempotent: repeated scheduler invocations do not renew healthy watches unnecessarily.
   */
  public static async checkAndRenewAllWatches(options?: {
    renewalWindowHours?: number;
  }): Promise<WatchRenewalSummary> {
    const activePool = postgresPool || pool;
    if (!activePool) {
      return { checked: 0, renewed: 0, failed: 0, skipped: 0, details: [] };
    }

    const windowHours = options?.renewalWindowHours ?? 24;
    const renewalWindowMs = windowHours * 60 * 60 * 1000;
    const details: WatchRenewalDetail[] = [];
    let renewedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    try {
      // Find all active Gmail integrations across workspaces
      const allActiveRes = await activePool.query(
        `SELECT workspace_id, account_email, watch_expiration, sync_status 
         FROM workspace_integrations 
         WHERE provider = 'gmail' AND is_active = true AND status = 'active' AND sync_status != 'disconnected'`
      );

      const now = Date.now();

      for (const row of allActiveRes.rows) {
        const workspaceId = row.workspace_id;
        const accountEmail = row.account_email || '';

        // If integration requires re-authentication, skip
        if (row.sync_status === 'reauth_required') {
          skippedCount++;
          details.push({
            workspaceId,
            accountEmail,
            status: 'skipped',
            error: 'Reauthentication required'
          });
          continue;
        }

        const isExpiringSoon = isGmailWatchRenewalDue(row.watch_expiration, now, renewalWindowMs);

        if (!isExpiringSoon) {
          // Healthy watch outside renewal window: safe to skip (idempotency rule)
          skippedCount++;
          details.push({
            workspaceId,
            accountEmail,
            status: 'skipped',
            expiration: row.watch_expiration ? new Date(row.watch_expiration).toISOString() : undefined
          });
          continue;
        }

        // Inside renewal window or expired: attempt renewal
        try {
          const res = await this.renewWatch(workspaceId);
          if (res.success) {
            renewedCount++;
            details.push({
              workspaceId,
              accountEmail,
              status: 'renewed',
              expiration: res.expiration,
              historyId: res.historyId
            });
          } else {
            failedCount++;
            details.push({
              workspaceId,
              accountEmail,
              status: 'failed',
              error: sanitizeDiagnosticError(res.error || 'Failed to renew watch')
            });
          }
        } catch (err: any) {
          // Failure isolation: log error and continue with next workspace
          failedCount++;
          const safeError = sanitizeDiagnosticError(err);
          console.error(`[GMAIL_WATCH] Renewal error for workspace ${workspaceId}:`, safeError);
          details.push({
            workspaceId,
            accountEmail,
            status: 'failed',
            error: safeError
          });
        }
      }

      return {
        checked: allActiveRes.rows.length,
        renewed: renewedCount,
        failed: failedCount,
        skipped: skippedCount,
        details
      };
    } catch (err: any) {
      console.error('[GMAIL_WATCH] Error scanning for expiring watches:', sanitizeDiagnosticError(err));
      return {
        checked: 0,
        renewed: 0,
        failed: 1,
        skipped: 0,
        details,
        error: sanitizeDiagnosticError(err)
      };
    }
  }

  /**
   * Stops an active Gmail Watch subscription on user inbox via Google API.
   */
  public static async stopWatch(workspaceId: string): Promise<boolean> {
    const accessToken = await GoogleAuthService.getValidAccessToken(workspaceId);
    const activePool = postgresPool || pool;

    if (activePool) {
      await activePool.query(
        `UPDATE workspace_integrations 
         SET sync_status = 'disconnected', 
             watch_history_id = null, 
             watch_expiration = null, 
             watch_resource_id = null, 
             updated_at = now() 
         WHERE workspace_id = $1 AND provider = 'gmail'`,
        [workspaceId]
      );
    }

    if (!accessToken) return true;

    try {
      const stopRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/stop', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return stopRes.ok;
    } catch (err: any) {
      console.warn('[GMAIL_WATCH] Google stop endpoint notice:', err.message);
      return false;
    }
  }

  /**
   * Parses an RFC 2822 / 5322 From or To header into clean lowercase email and name.
   */
  public static parseEmailAddress(raw: string): { email: string; name?: string } {
    if (!raw || !raw.trim()) {
      return { email: '', name: '' };
    }

    const trimmed = raw.trim();
    // Match "Name" <email@example.com> or Name <email@example.com> or <email@example.com>
    const angleMatch = trimmed.match(/^(?:["']?([^"']*)["']?\s*)?<([^>]+)>/);
    if (angleMatch) {
      const name = (angleMatch[1] || '').trim();
      const email = (angleMatch[2] || '').trim().toLowerCase();
      return { email, name };
    }

    // Direct email without angle brackets, possibly in quotes or plain
    const cleaned = trimmed.replace(/^["']|["']$/g, '').trim().toLowerCase();
    const emailMatch = cleaned.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      return { email: emailMatch[0].toLowerCase(), name: '' };
    }

    return { email: cleaned, name: '' };
  }

  private static decodeBodyPart(part: any): string {
    if (!part) return '';
    const mime = String(part.mimeType || '').toLowerCase();
    const data = part.body?.data;
    if (data && mime === 'text/plain') return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    if (data && mime === 'text/html') return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8').replace(/<\/(p|div|br|li|tr)>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    for (const child of part.parts || []) { const decoded = this.decodeBodyPart(child); if (decoded) return decoded; }
    return '';
  }

  /**
   * Synchronizes the user's Gmail mailbox history since the last known watch_history_id.
   * Detects inbound replies, matches them to CRM outreach threads, halts campaign sequences if configured,
   * and idempotently records events in inbound_email_events.
   */
  public static async syncMailbox(
    workspaceId: string,
    accountEmail: string,
    targetHistoryId?: string
  ): Promise<SyncMailboxResult> {
    const activePool = postgresPool || pool;
    const accessToken = await GoogleAuthService.getValidAccessToken(workspaceId);

    if (!accessToken) {
      if (activePool) {
        await activePool.query(
          `UPDATE workspace_integrations 
           SET sync_status = 'reauth_required', 
               last_sync_error = 'Google authorization expired or invalid; reauthentication required', 
               updated_at = now() 
           WHERE workspace_id = $1 AND provider = 'gmail'`,
          [workspaceId]
        );
      }
      return {
        success: false,
        processedCount: 0,
        repliesCount: 0,
        error: 'REAUTH_REQUIRED'
      };
    }

    // Retrieve last synchronized historyId and settings
    let startHistoryId = targetHistoryId;
    let lastSyncedAt: Date | undefined;
    let stopSequenceSetting = true;

    if (activePool) {
      const integRes = await activePool.query(
        `SELECT watch_history_id, stop_sequence_on_reply, last_synced_at
         FROM workspace_integrations 
         WHERE workspace_id = $1 AND provider = 'gmail' LIMIT 1`,
        [workspaceId]
      );
      if (integRes.rows.length > 0) {
        if (integRes.rows[0].watch_history_id) {
          startHistoryId = integRes.rows[0].watch_history_id;
        }
        if (integRes.rows[0].last_synced_at) lastSyncedAt = new Date(integRes.rows[0].last_synced_at);
        if (integRes.rows[0].stop_sequence_on_reply !== undefined) {
          stopSequenceSetting = Boolean(integRes.rows[0].stop_sequence_on_reply);
        }
      }
    }

    if (!startHistoryId) {
      if (activePool && targetHistoryId) {
        await activePool.query(
          `UPDATE workspace_integrations 
           SET watch_history_id = $1, last_synced_at = now(), updated_at = now() 
           WHERE workspace_id = $2 AND provider = 'gmail'`,
          [targetHistoryId, workspaceId]
        );
      }
      return {
        success: true,
        processedCount: 0,
        repliesCount: 0,
        newHistoryId: targetHistoryId
      };
    }

    let processedCount = 0;
    let repliesCount = 0;
    let syncHaltFailed = false;
    let latestHistoryId = targetHistoryId || startHistoryId;

    try {
      let historyItems: any[];
      try {
        const pageResult = await fetchGmailHistoryPages(accessToken, String(startHistoryId));
        historyItems = pageResult.history;
        latestHistoryId = pageResult.historyId;
      } catch (error: any) {
        if (error.code !== 'HISTORY_CURSOR_EXPIRED') throw error;
        // Gmail may reject an old history cursor after prolonged outage. Reconcile
        // the inbox since the last completed sync, then adopt the fresh profile ID.
        const profile = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/profile`, { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(10000) });
        if (!profile.ok) throw new Error(`Gmail profile API error HTTP ${profile.status}; history cursor was not advanced.`);
        const profileData: any = await profile.json();
        latestHistoryId = String(profileData.historyId || startHistoryId);
        const after = new Date((lastSyncedAt?.getTime() || Date.now() - 30 * 86400000) - 5 * 60000);
        historyItems = await fetchGmailInboxBackfill(accessToken, after);
      }

      for (const item of historyItems) {
        const addedMessages = item.messagesAdded || [];

        for (const record of addedMessages) {
          const rawMessage = record.message;
          if (!rawMessage || !rawMessage.id) continue;

          const messageId = rawMessage.id;
          const threadId = rawMessage.threadId || messageId;

          // 2. Fetch full message details from Gmail REST API
          const msgRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?format=full`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          if (!msgRes.ok) throw new Error(`Gmail message API error HTTP ${msgRes.status}; cursor was not advanced.`);

          const msgData: any = await msgRes.json();
          const headers: Record<string, string> = {};
          for (const h of msgData.payload?.headers || []) {
            if (h.name && h.value) {
              headers[h.name.toLowerCase()] = h.value;
            }
          }

          const fromHeader = headers['from'] || '';
          const toHeader = headers['to'] || '';
          const subject = headers['subject'] || '(No Subject)';
          const inReplyTo = headers['in-reply-to']?.replace(/[<>]/g, '').trim();
          const references = headers['references'] || '';
          const parsedSender = this.parseEmailAddress(fromHeader);
          const snippet = msgData.snippet || '';
          const bodyText = this.decodeBodyPart(msgData.payload) || snippet;

          // 3. Ignore our own outbound messages!
          if (parsedSender.email === accountEmail.toLowerCase()) {
            if (activePool) await recoverOutboundAttempt(activePool, workspaceId, {
              requestId: headers['x-huntiq-send-id'], messageId, threadId,
              rfcMessageId: headers['message-id'], senderName: parsedSender.name || accountEmail,
              recipientEmail: this.parseEmailAddress(toHeader).email, subject, body: bodyText,
              timestamp: msgData.internalDate ? new Date(Number(msgData.internalDate)).toISOString() : new Date().toISOString()
            });
            continue;
          }

          processedCount++;
          if (!activePool) throw new Error('Database unavailable; inbound email was not persisted.');
          // Claim each Gmail message before applying it. A competing/out-of-order
          // Pub/Sub delivery sees the unique row and cannot append the reply twice.
          const claim = await activePool.query(`INSERT INTO inbound_email_events (
            workspace_id, provider, provider_message_id, provider_thread_id, sender_email, sender_name,
            recipient_email, subject, snippet, body_text, message_date, correlation_status, processing_at, received_at, created_at
          ) VALUES ($1,'gmail',$2,$3,$4,$5,$6,$7,$8,$9,$10,'unresolved',now(),now(),now())
          ON CONFLICT (workspace_id, provider, provider_message_id) DO UPDATE SET processing_at=now()
            WHERE inbound_email_events.correlation_status <> 'matched' AND (inbound_email_events.processing_at IS NULL OR inbound_email_events.processing_at < now() - interval '5 minutes') RETURNING id`, [
            workspaceId, messageId, threadId, parsedSender.email, parsedSender.name || null, accountEmail,
            subject.slice(0, 255), snippet.slice(0, 500), bodyText,
            msgData.internalDate ? new Date(Number(msgData.internalDate)) : new Date()
          ]);
          if (!claim.rowCount) {
            const existingEvent = await activePool.query(`SELECT correlation_status FROM inbound_email_events WHERE workspace_id=$1 AND provider='gmail' AND provider_message_id=$2 LIMIT 1`, [workspaceId, messageId]);
            if (existingEvent.rows[0]?.correlation_status === 'matched') continue;
            throw new Error('Inbound message is currently being processed; Gmail history cursor was not advanced.');
          }

          // 4. Strengthened Correlation Hierarchy
          // Priority 1: Gmail provider thread ID
          // Priority 2: In-Reply-To header matching known provider message ID
          // Priority 3: References header matching known message ID
          // Priority 4: Contact + active campaign relationship
          // Priority 5: Contact email fallback ONLY when unambiguous (1 active thread)
          let matchedThreadId: string | null = null;
          let matchedThread: any = null;
          let correlationStatus: 'matched' | 'unresolved' = 'unresolved';

          if (activePool) {
            // Priority 1: Match by exact Gmail provider thread ID
            const threadMatchRes = await activePool.query(
              `SELECT * FROM outreach_threads
               WHERE workspace_id = $1 AND provider_thread_id = $2 
               LIMIT 1`,
              [workspaceId, threadId]
            );

            if (threadMatchRes.rows.length > 0) {
              matchedThread = threadMatchRes.rows[0];
              matchedThreadId = matchedThread.id;
              correlationStatus = 'matched';
            } else if (inReplyTo) {
              // Priority 2: Match by In-Reply-To header
              const inReplyMatch = await activePool.query(
              `SELECT * FROM outreach_threads
                 WHERE workspace_id = $1 AND (provider_rfc_message_id = $2 OR messages @> $3::jsonb)
                 LIMIT 1`,
              [workspaceId, `<${inReplyTo}>`, JSON.stringify([{ providerRfcMessageId: `<${inReplyTo}>` }])]
              );
              if (inReplyMatch.rows.length > 0) {
                matchedThread = inReplyMatch.rows[0];
                matchedThreadId = matchedThread.id;
                correlationStatus = 'matched';
              }
            }

            // Priority 3: Check references header if still unmatched
            if (!matchedThread && references) {
              const refMatch = await activePool.query(
                `SELECT * FROM outreach_threads
                 WHERE workspace_id = $1 AND (provider_rfc_message_id = ANY($2::text[]) OR EXISTS (
                   SELECT 1 FROM jsonb_array_elements(COALESCE(messages, '[]'::jsonb)) m WHERE m->>'providerRfcMessageId' = ANY($2::text[])
                 )) LIMIT 1`,
              [workspaceId, references.match(/<[^>]+>/g) || []]
              );
              if (refMatch.rows.length > 0) {
                matchedThread = refMatch.rows[0];
                matchedThreadId = matchedThread.id;
                correlationStatus = 'matched';
              }
            }

            // Priority 4 & 5: Contact Email Fallback (only when unambiguous)
            if (!matchedThread) {
              const emailMatches = await activePool.query(
                `SELECT * FROM outreach_threads 
                 WHERE workspace_id = $1 AND LOWER(email) = $2 
                 ORDER BY updated_at DESC`,
                [workspaceId, parsedSender.email]
              );

              if (emailMatches.rows.length === 1) {
                // Unambiguous: exactly one thread exists for this contact
                matchedThread = emailMatches.rows[0];
                matchedThreadId = matchedThread.id;
                correlationStatus = 'matched';
              } else if (emailMatches.rows.length > 1) {
                // Ambiguous: multiple threads exist across different campaigns/contexts!
                // DO NOT GUESS. Persist safely and mark correlation as unresolved.
                correlationStatus = 'unresolved';
                console.log(
                  `[GMAIL_SYNC] Ambiguous thread match for ${parsedSender.email} (${emailMatches.rows.length} threads). Marking unresolved to protect campaign integrity.`
                );
              }
            }
          }

          // 5. If matched to an outreach thread, persist inbound reply & mark replied
          if (matchedThread && matchedThreadId && activePool) {
            const currentMessages = Array.isArray(matchedThread.messages) ? matchedThread.messages : [];
            const newReplyMessage = {
              id: `msg-inbound-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              sender: 'prospect',
              senderName: parsedSender.name || matchedThread.contact_name,
              content: bodyText,
              timestamp: msgData.internalDate ? new Date(Number(msgData.internalDate)).toISOString() : new Date().toISOString(),
              channel: 'email',
              status: 'replied',
              provider: 'gmail',
              providerMessageId: messageId,
              providerThreadId: threadId,
              providerRfcMessageId: headers['message-id']
            };

            const alreadyAttached = currentMessages.some((message: any) => message.providerMessageId === messageId);
            const updatedMessages = (alreadyAttached ? currentMessages : [...currentMessages, newReplyMessage]).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            await activePool.query(
              `UPDATE outreach_threads 
               SET status = 'replied',
                   provider_thread_id = COALESCE(provider_thread_id, $1),
                   provider_message_id = $5,
                   provider_rfc_message_id = $6,
                   messages = $2,
                   metadata = metadata || jsonb_build_object('lastMessageSnippet', $7, 'unread', true),
                   updated_at = now()
               WHERE id = $3 AND workspace_id = $4`,
              [threadId, JSON.stringify(updatedMessages), matchedThreadId, workspaceId, messageId, headers['message-id'] || null, bodyText.slice(0, 160)]
            );
            if (matchedThread.lead_id) await activePool.query(`INSERT INTO activities (workspace_id, company_id, lead_id, type, title, description, metadata)
              VALUES ($1, $2, $3, 'email_reply', $4, $5, $6::jsonb)`, [workspaceId, matchedThread.company_id, matchedThread.lead_id, `Email reply from ${parsedSender.email}`, bodyText.slice(0, 5000), JSON.stringify({ provider: 'gmail', providerMessageId: messageId, providerThreadId: threadId, subject })]);

            repliesCount++;

            // 6. STOP-ON-REPLY: Halt actual campaign sequences in production database
            const shouldStopSequence = matchedThread.stop_sequence_on_reply !== false && stopSequenceSetting;
            if (shouldStopSequence) {
              const haltRes = await CampaignExecutionService.haltProspectSequence(workspaceId, {
                campaignId: matchedThread.campaign_id,
                prospectId: matchedThread.prospect_id,
                contactEmail: parsedSender.email,
                userId: matchedThread.user_id,
                reason: `Prospect replied via Gmail (Thread: ${threadId})`
              });

              if (!haltRes.success) {
                syncHaltFailed = true;
                console.error(`[STOP_ON_REPLY] Campaign sequence halt failed for ${parsedSender.email}: ${haltRes.error}`);
                if (activePool) {
                  try {
                    await activePool.query(
                      `UPDATE workspace_integrations 
                       SET last_sync_error = $1, updated_at = now() 
                       WHERE workspace_id = $2 AND provider = 'gmail'`,
                      [`REPLY_RECORDED_BUT_SEQUENCE_UPDATE_FAILED: ${parsedSender.email}`, workspaceId]
                    );
                  } catch {}
                }
              } else {
                console.log(`[STOP_ON_REPLY] Successfully halted sequence for ${parsedSender.email} in workspace ${workspaceId}`);
              }
            }
          }

          await activePool.query(`UPDATE inbound_email_events SET correlation_status=$1, matched_thread_id=$2, processing_at=NULL WHERE workspace_id=$3 AND provider='gmail' AND provider_message_id=$4`, [correlationStatus, matchedThreadId, workspaceId, messageId]);
        }
      }

      // Update workspace_integrations with advanced historyId
      if (activePool && latestHistoryId) {
        if (!syncHaltFailed) {
          await activePool.query(
            `UPDATE workspace_integrations 
             SET watch_history_id = GREATEST(watch_history_id::numeric, $1::numeric)::text,
                 last_synced_at = now(), 
                 sync_status = 'idle', 
                 last_sync_error = null, 
                 updated_at = now() 
             WHERE workspace_id = $2 AND provider = 'gmail'`,
            [latestHistoryId, workspaceId]
          );
        } else {
          await activePool.query(
            `UPDATE workspace_integrations 
             SET watch_history_id = GREATEST(watch_history_id::numeric, $1::numeric)::text,
                 last_synced_at = now(), 
                 updated_at = now() 
             WHERE workspace_id = $2 AND provider = 'gmail'`,
            [latestHistoryId, workspaceId]
          );
        }
      }

      if (syncHaltFailed) {
        return {
          success: false,
          processedCount,
          repliesCount,
          newHistoryId: latestHistoryId,
          error: 'REPLY_RECORDED_BUT_SEQUENCE_UPDATE_FAILED'
        };
      }

      return {
        success: true,
        processedCount,
        repliesCount,
        newHistoryId: latestHistoryId
      };
    } catch (err: any) {
      console.error(`[GMAIL_SYNC] Error syncing mailbox for workspace ${workspaceId}:`, err.message);
      if (activePool) {
        try {
          await activePool.query(
            `UPDATE workspace_integrations 
             SET last_sync_error = $1, updated_at = now() 
             WHERE workspace_id = $2 AND provider = 'gmail'`,
            [err.message, workspaceId]
          );
        } catch {}
      }
      return {
        success: false,
        processedCount,
        repliesCount,
        error: this.isProduction() ? 'GMAIL_SYNC_FAILED' : (err.message || 'GMAIL_SYNC_FAILED')
      };
    }
  }
}
