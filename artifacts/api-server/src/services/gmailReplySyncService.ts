import { postgresPool, pool } from '../database/postgres';
import { config } from '../config/env';
import { GoogleAuthService } from './googleAuthService';
import { createActivityLogRepository } from '../repositories/activity-logs';
import { CampaignExecutionService } from './campaignExecutionService';

export interface GmailWatchResult {
  success: boolean;
  historyId?: string;
  expiration?: string;
  topicName?: string;
  isConfigured: boolean;
  error?: string;
}

export interface SyncMailboxResult {
  success: boolean;
  processedCount: number;
  repliesCount: number;
  newHistoryId?: string;
  error?: string;
}

export class GmailReplySyncService {
  private static isProduction(): boolean {
    return config.nodeEnv === 'production' || process.env.VERCEL === '1';
  }

  /**
   * Sets up or refreshes a Gmail Watch subscription on the user's inbox using Google Cloud Pub/Sub.
   * If topic is not configured, fetches baseline historyId from user profile.
   */
  public static async setupWatch(workspaceId: string): Promise<GmailWatchResult> {
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

    const pubsubTopic = (process.env.GOOGLE_PUBSUB_TOPIC || process.env.GCP_PUBSUB_TOPIC)?.trim();

    if (!pubsubTopic) {
      // Pub/Sub topic not configured in environment. Fetch baseline profile history ID.
      try {
        const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const historyId = profileData.historyId ? String(profileData.historyId) : undefined;

          if (activePool && historyId) {
            await activePool.query(
              `UPDATE workspace_integrations 
               SET watch_history_id = $1, sync_status = 'idle', updated_at = now() 
               WHERE workspace_id = $2 AND provider = 'gmail'`,
              [historyId, workspaceId]
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

      const watchData = await watchRes.json();
      if (!watchRes.ok) {
        const errorMsg = watchData.error?.message || 'Failed to register Gmail watch with Google API';
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
           SET watch_history_id = $1, 
               watch_expiration = $2, 
               watch_resource_id = $3, 
               sync_status = 'active', 
               last_sync_error = null, 
               updated_at = now() 
           WHERE workspace_id = $4 AND provider = 'gmail'`,
          [historyId, expirationDate, pubsubTopic, workspaceId]
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
      console.error('[GMAIL_WATCH] Error establishing watch:', err.message);
      return {
        success: false,
        isConfigured: true,
        error: err.message
      };
    }
  }

  /**
   * Renews an existing Gmail watch subscription for a workspace before it expires.
   * Safe to call repeatedly; idempotent and updates watch_expiration.
   */
  public static async renewWatch(workspaceId: string): Promise<GmailWatchResult> {
    const activePool = postgresPool || pool;
    if (activePool) {
      const integrationRes = await activePool.query(
        `SELECT is_active, sync_status, watch_expiration 
         FROM workspace_integrations 
         WHERE workspace_id = $1 AND provider = 'gmail' LIMIT 1`,
        [workspaceId]
      );

      if (integrationRes.rows.length === 0 || !integrationRes.rows[0].is_active) {
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
    }

    return this.setupWatch(workspaceId);
  }

  /**
   * Scans all active Gmail integrations across all workspaces and renews any
   * whose watch_expiration is within the next 24 hours or has already passed.
   */
  public static async checkAndRenewAllWatches(): Promise<{ checked: number; renewed: number }> {
    const activePool = postgresPool || pool;
    if (!activePool) return { checked: 0, renewed: 0 };

    try {
      const expiringRes = await activePool.query(
        `SELECT workspace_id, watch_expiration 
         FROM workspace_integrations 
         WHERE provider = 'gmail' 
           AND is_active = true 
           AND sync_status != 'reauth_required'
           AND (watch_expiration IS NULL OR watch_expiration < now() + interval '24 hours')`
      );

      let renewed = 0;
      for (const row of expiringRes.rows) {
        const res = await this.renewWatch(row.workspace_id);
        if (res.success) renewed++;
      }

      return { checked: expiringRes.rows.length, renewed };
    } catch (err: any) {
      console.error('[GMAIL_WATCH] Error scanning for expiring watches:', err.message);
      return { checked: 0, renewed: 0 };
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
    let stopSequenceSetting = true;

    if (activePool) {
      const integRes = await activePool.query(
        `SELECT watch_history_id, stop_sequence_on_reply 
         FROM workspace_integrations 
         WHERE workspace_id = $1 AND provider = 'gmail' LIMIT 1`,
        [workspaceId]
      );
      if (integRes.rows.length > 0) {
        if (integRes.rows[0].watch_history_id) {
          startHistoryId = integRes.rows[0].watch_history_id;
        }
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
    let latestHistoryId = targetHistoryId || startHistoryId;

    try {
      const historyUrl = `https://gmail.googleapis.com/gmail/v1/users/me/history?startHistoryId=${encodeURIComponent(startHistoryId)}&historyTypes=messageAdded`;
      const historyRes = await fetch(historyUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!historyRes.ok) {
        if (historyRes.status === 404 && targetHistoryId && activePool) {
          await activePool.query(
            `UPDATE workspace_integrations 
             SET watch_history_id = $1, last_synced_at = now(), updated_at = now() 
             WHERE workspace_id = $2 AND provider = 'gmail'`,
            [targetHistoryId, workspaceId]
          );
        }
        return {
          success: false,
          processedCount: 0,
          repliesCount: 0,
          error: `Gmail history API error HTTP ${historyRes.status}`
        };
      }

      const historyData = await historyRes.json();
      latestHistoryId = String(historyData.historyId || latestHistoryId);
      const historyItems = historyData.history || [];

      for (const item of historyItems) {
        const addedMessages = item.messagesAdded || [];

        for (const record of addedMessages) {
          const rawMessage = record.message;
          if (!rawMessage || !rawMessage.id) continue;

          const messageId = rawMessage.id;
          const threadId = rawMessage.threadId || messageId;

          // 1. Composite Idempotency Check on (workspace_id, provider, provider_message_id)
          if (activePool) {
            const existing = await activePool.query(
              `SELECT id FROM inbound_email_events 
               WHERE workspace_id = $1 AND provider = 'gmail' AND provider_message_id = $2 
               LIMIT 1`,
              [workspaceId, messageId]
            );
            if (existing.rows.length > 0) {
              continue;
            }
          }

          // 2. Fetch full message details from Gmail REST API
          const msgRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?format=full`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          if (!msgRes.ok) continue;

          const msgData = await msgRes.json();
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
          const references = headers['references']?.replace(/[<>]/g, '').trim();
          const parsedSender = this.parseEmailAddress(fromHeader);
          const snippet = msgData.snippet || '';

          // 3. Ignore our own outbound messages!
          if (parsedSender.email === accountEmail.toLowerCase()) {
            continue;
          }

          processedCount++;

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
                 WHERE workspace_id = $1 AND provider_message_id = $2 
                 LIMIT 1`,
                [workspaceId, inReplyTo]
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
                 WHERE workspace_id = $1 AND provider_message_id = $2 
                 LIMIT 1`,
                [workspaceId, references]
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
              sender: 'contact',
              senderName: parsedSender.name || matchedThread.contact_name,
              content: snippet,
              timestamp: 'Just now',
              channel: 'email',
              status: 'replied',
              provider: 'gmail',
              providerMessageId: messageId,
              providerThreadId: threadId
            };

            const updatedMessages = [...currentMessages, newReplyMessage];

            await activePool.query(
              `UPDATE outreach_threads 
               SET status = 'replied',
                   provider_thread_id = COALESCE(provider_thread_id, $1),
                   messages = $2,
                   updated_at = now()
               WHERE id = $3 AND workspace_id = $4`,
              [threadId, JSON.stringify(updatedMessages), matchedThreadId, workspaceId]
            );

            repliesCount++;

            // 6. STOP-ON-REPLY: Halt actual campaign sequences in production database
            const shouldStopSequence = matchedThread.stop_sequence_on_reply !== false && stopSequenceSetting;
            if (shouldStopSequence) {
              await CampaignExecutionService.haltProspectSequence(workspaceId, {
                campaignId: matchedThread.campaign_id,
                prospectId: matchedThread.prospect_id,
                contactEmail: parsedSender.email,
                userId: matchedThread.user_id,
                reason: `Prospect replied via Gmail (Thread: ${threadId})`
              });
              console.log(`[STOP_ON_REPLY] Successfully halted sequence for ${parsedSender.email} in workspace ${workspaceId}`);
            }
          }

          // 7. Record event in inbound_email_events table with composite uniqueness
          if (activePool) {
            try {
              await activePool.query(
                `INSERT INTO inbound_email_events (
                  workspace_id, provider, provider_message_id, provider_thread_id,
                  sender_email, recipient_email, subject, snippet, correlation_status,
                  matched_thread_id, received_at, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())
                ON CONFLICT (workspace_id, provider, provider_message_id) DO NOTHING`,
                [
                  workspaceId,
                  'gmail',
                  messageId,
                  threadId,
                  parsedSender.email,
                  accountEmail,
                  subject.slice(0, 255),
                  snippet.slice(0, 500),
                  correlationStatus,
                  matchedThreadId
                ]
              );
            } catch (err: any) {
              console.warn('[GMAIL_SYNC] Composite event insert notice:', err.message);
            }
          }
        }
      }

      // Update workspace_integrations with advanced historyId
      if (activePool && latestHistoryId) {
        await activePool.query(
          `UPDATE workspace_integrations 
           SET watch_history_id = $1, 
               last_synced_at = now(), 
               sync_status = 'idle', 
               last_sync_error = null, 
               updated_at = now() 
           WHERE workspace_id = $2 AND provider = 'gmail'`,
          [latestHistoryId, workspaceId]
        );
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
