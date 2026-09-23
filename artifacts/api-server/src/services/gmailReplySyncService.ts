import { postgresPool, pool } from '../database/postgres';
import { config } from '../config/env';
import { GoogleAuthService } from './googleAuthService';
import { createActivityLogRepository } from '../repositories/activity-logs';

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
   * Sets up a Gmail Watch on the user's inbox using Google Cloud Pub/Sub.
   * If GOOGLE_PUBSUB_TOPIC is not configured, fetches baseline historyId from profile.
   */
  public static async setupWatch(workspaceId: string): Promise<GmailWatchResult> {
    const accessToken = await GoogleAuthService.getValidAccessToken(workspaceId);
    if (!accessToken) {
      return {
        success: false,
        isConfigured: false,
        error: 'Unable to retrieve valid Google access token for watch setup.'
      };
    }

    const pubsubTopic = process.env.GOOGLE_PUBSUB_TOPIC?.trim();
    const activePool = postgresPool || pool;

    if (!pubsubTopic) {
      // Pub/Sub topic not configured in environment. Fetch baseline profile history ID.
      try {
        const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const historyId = profileData.historyId;

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
            error: 'Pub/Sub topic not configured (GOOGLE_PUBSUB_TOPIC unset). Baseline history initialized.'
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
      console.error('[GMAIL_WATCH] Exception during watch setup:', err.message);
      return {
        success: false,
        isConfigured: true,
        error: err.message
      };
    }
  }

  /**
   * Stops Gmail Watch upon disconnect or account revocation.
   */
  public static async stopWatch(workspaceId: string): Promise<void> {
    try {
      const accessToken = await GoogleAuthService.getValidAccessToken(workspaceId);
      if (accessToken) {
        await fetch('https://gmail.googleapis.com/gmail/v1/users/me/stop', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
    } catch (err: any) {
      console.warn(`[GMAIL_WATCH] Notice stopping watch for workspace ${workspaceId}:`, err.message);
    }

    const activePool = postgresPool || pool;
    if (activePool) {
      try {
        await activePool.query(
          `UPDATE workspace_integrations 
           SET watch_resource_id = NULL, 
               watch_expiration = NULL, 
               sync_status = 'idle', 
               updated_at = now() 
           WHERE workspace_id = $1 AND provider = 'gmail'`,
          [workspaceId]
        );
      } catch {}
    }
  }

  /**
   * Extracts clean email address from standard RFC 'From: Name <email@domain.com>' header.
   */
  public static parseEmailAddress(rawFrom: string): { email: string; name?: string } {
    const trimmed = (rawFrom || '').trim();
    const match = trimmed.match(/^(?:"?([^"]*)"?\s)?(?:<?([^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)>?)$/);
    if (match) {
      return {
        name: match[1]?.trim() || undefined,
        email: match[2].toLowerCase().trim()
      };
    }
    return { email: trimmed.toLowerCase() };
  }

  /**
   * Synchronizes Gmail mailbox changes since last known historyId.
   * Matches inbound replies to outreach threads, enforces idempotency, updates statuses,
   * and triggers stop-on-reply sequence halting.
   */
  public static async syncMailbox(
    workspaceId: string,
    accountEmail: string,
    targetHistoryId?: string
  ): Promise<SyncMailboxResult> {
    const activePool = postgresPool || pool;
    if (!activePool && this.isProduction()) {
      const err = new Error('Database unavailable during Gmail reply sync.');
      (err as any).statusCode = 503;
      (err as any).code = 'DATABASE_UNAVAILABLE';
      throw err;
    }

    const accessToken = await GoogleAuthService.getValidAccessToken(workspaceId);
    if (!accessToken) {
      return {
        success: false,
        processedCount: 0,
        repliesCount: 0,
        error: 'Authentication required. Google access token is invalid or expired.'
      };
    }

    // Retrieve stored history ID
    let startHistoryId: string | null = null;
    let stopSequenceSetting = true;

    if (activePool) {
      const intRes = await activePool.query(
        `SELECT watch_history_id, stop_sequence_on_reply 
         FROM workspace_integrations 
         WHERE workspace_id = $1 AND provider = 'gmail' AND is_active = true`,
        [workspaceId]
      );
      if (intRes.rows.length > 0) {
        startHistoryId = intRes.rows[0].watch_history_id;
        if (intRes.rows[0].stop_sequence_on_reply !== undefined) {
          stopSequenceSetting = Boolean(intRes.rows[0].stop_sequence_on_reply);
        }
      }
    }

    // If no baseline history ID stored yet, set to targetHistoryId and return cleanly
    if (!startHistoryId) {
      if (targetHistoryId && activePool) {
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
      // Query Gmail history API for newly added messages
      const historyUrl = `https://gmail.googleapis.com/gmail/v1/users/me/history?startHistoryId=${encodeURIComponent(startHistoryId)}&historyTypes=messageAdded`;
      const historyRes = await fetch(historyUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!historyRes.ok) {
        // If 404 historyId not found (expired), reset history baseline
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

          // 1. Idempotency Check: Avoid processing duplicate inbound message IDs
          if (activePool) {
            const existing = await activePool.query(
              `SELECT id FROM inbound_email_events WHERE provider_message_id = $1 LIMIT 1`,
              [messageId]
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
          const parsedSender = this.parseEmailAddress(fromHeader);
          const snippet = msgData.snippet || '';

          // 3. Ignore our own outbound messages!
          if (parsedSender.email === accountEmail.toLowerCase()) {
            continue;
          }

          processedCount++;

          // 4. Match inbound reply to CRM outreach thread in the authenticated workspace
          let matchedThreadId: string | null = null;
          let matchedThread: any = null;

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
            } else {
              // Priority 2: Match by contact email in the workspace
              const emailMatchRes = await activePool.query(
                `SELECT * FROM outreach_threads 
                 WHERE workspace_id = $1 AND LOWER(email) = $2 
                 ORDER BY updated_at DESC LIMIT 1`,
                [workspaceId, parsedSender.email]
              );
              if (emailMatchRes.rows.length > 0) {
                matchedThread = emailMatchRes.rows[0];
                matchedThreadId = matchedThread.id;
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

            // 6. STOP-ON-REPLY: If enabled, halt pending sequence steps for this contact
            const shouldStopSequence = matchedThread.stop_sequence_on_reply !== false && stopSequenceSetting;
            if (shouldStopSequence) {
              try {
                const activityRepo = createActivityLogRepository();
                await activityRepo.log({
                  workspaceId,
                  userId: matchedThread.user_id || 'system',
                  action: 'SEQUENCE_HALTED',
                  entityType: 'outreach',
                  entityId: matchedThreadId,
                  details: `Follow-up sequence stopped automatically: prospect ${parsedSender.email} replied via Gmail (Thread: ${threadId})`
                });
                console.log(`[STOP_ON_REPLY] Halted sequence for contact ${parsedSender.email} in thread ${matchedThreadId}`);
              } catch (err: any) {
                console.warn('[STOP_ON_REPLY] Activity log warning:', err.message);
              }
            }
          }

          // 7. Record event in inbound_email_events table for audit & strict idempotency
          if (activePool) {
            try {
              await activePool.query(
                `INSERT INTO inbound_email_events (
                  workspace_id, provider, provider_message_id, provider_thread_id,
                  sender_email, recipient_email, subject, snippet, received_at, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
                ON CONFLICT (provider_message_id) DO NOTHING`,
                [
                  workspaceId,
                  'gmail',
                  messageId,
                  threadId,
                  parsedSender.email,
                  accountEmail,
                  subject.slice(0, 255),
                  snippet.slice(0, 500)
                ]
              );
            } catch (err: any) {
              console.warn('[GMAIL_SYNC] Idempotent event insert notice:', err.message);
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
        error: err.message
      };
    }
  }
}
