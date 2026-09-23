import { Router } from 'express';
import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import { GoogleAuthService } from '../services/googleAuthService';
import { GmailService } from '../services/gmailService';
import { GmailReplySyncService } from '../services/gmailReplySyncService';
import { hasValidTld } from '../engine/scraper/emailExtractor';
import { postgresPool, pool } from '../database/postgres';

export const googleAuthRouter = Router();

// Test email rate limiter: max 5 sends per 15 minutes per workspace
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const testEmailRateLimits = new Map<string, RateLimitRecord>();

function checkTestEmailRateLimit(workspaceId: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const limit = 5;

  const current = testEmailRateLimits.get(workspaceId);
  if (!current || now > current.resetAt) {
    testEmailRateLimits.set(workspaceId, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  current.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * GET /api/v1/auth/google/url
 * Returns the OAuth 2.0 authorization URL for connecting Gmail.
 * Cryptographically binds state to the authenticated user and workspace.
 */
googleAuthRouter.get(['/auth/google/url', '/google/url'], async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  const userId = req.user?.id;

  if (!workspaceId || !userId) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'GOOGLE_AUTH_REQUIRED',
        message: 'Authentication required. Please log in to connect Google services.'
      }
    });
  }

  const rawReturnUrl = typeof req.query.returnUrl === 'string' ? req.query.returnUrl : undefined;
  const safeReturnUrl = GoogleAuthService.sanitizeReturnUrl(rawReturnUrl);

  if (!GoogleAuthService.isConfigured()) {
    return res.status(200).json({
      success: false,
      error: {
        code: 'GOOGLE_NOT_CONFIGURED',
        message: 'Google OAuth Client ID and Secret are not configured in environment variables.'
      },
      data: {
        isConfigured: false,
        setupGuide: {
          step1: 'Create a Project in Google Cloud Console (https://console.cloud.google.com)',
          step2: 'Enable the Gmail API in APIs & Services',
          step3: 'Create an OAuth 2.0 Client ID (Web application)',
          step4: 'Add http://localhost:3001/api/v1/auth/google/callback to Authorized redirect URIs',
          step5: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env'
        }
      }
    });
  }

  try {
    const authUrl = await GoogleAuthService.getAuthUrl(workspaceId, userId, safeReturnUrl);
    return res.json({
      success: true,
      data: {
        authUrl,
        isConfigured: true
      }
    });
  } catch (err: any) {
    console.error('[GOOGLE_AUTH] Failed to generate OAuth consent URL');
    const status = err.statusCode || 500;
    const code = err.code || 'OAUTH_URL_GENERATION_FAILED';
    return res.status(status).json({
      success: false,
      error: {
        code,
        message: 'Unable to initialize Google authentication consent. Please try again.'
      }
    });
  }
});

/**
 * GET /api/v1/auth/google/callback
 * Public redirect callback endpoint from Google OAuth consent screen.
 * Consumes single-use server-side cryptographically bound state.
 */
googleAuthRouter.get(['/auth/google/callback', '/google/callback'], async (req: Request, res: Response) => {
  const { code, state, error } = req.query as {
    code?: string;
    state?: string;
    error?: string;
  };

  const defaultReturnUrl = 'http://localhost:5173/?view=integrations';

  if (error) {
    console.warn('[GOOGLE_AUTH] Callback received error from Google');
    return res.redirect(`${defaultReturnUrl}&google_auth=error&code=GOOGLE_ACCESS_DENIED`);
  }

  if (!code || !state) {
    return res.redirect(`${defaultReturnUrl}&google_auth=error&code=MISSING_OAUTH_PARAMETERS`);
  }

  try {
    const { integration, returnPath } = await GoogleAuthService.exchangeCode(code, state);
    const joinChar = returnPath.includes('?') ? '&' : '?';

    // Automatically initialize Gmail Watch / history baseline upon successful connection
    GmailReplySyncService.setupWatch(integration.workspaceId).catch((watchErr) => {
      console.warn('[GOOGLE_AUTH] Watch setup deferred:', watchErr.message || watchErr);
    });

    console.log(`[GOOGLE_AUTH] Successfully authenticated Gmail for workspace ${integration.workspaceId}`);
    return res.redirect(
      `${returnPath}${joinChar}google_auth=success&email=${encodeURIComponent(integration.accountEmail)}`
    );
  } catch (err: any) {
    console.error('[GOOGLE_AUTH] Token exchange failed securely:', err.code || 'UNKNOWN_ERROR');
    const safeCode = err.code || 'OAUTH_EXCHANGE_FAILED';
    const joinChar = defaultReturnUrl.includes('?') ? '&' : '?';
    return res.redirect(
      `${defaultReturnUrl}${joinChar}google_auth=error&code=${encodeURIComponent(safeCode)}`
    );
  }
});

/**
 * GET /api/v1/auth/google/status
 * Checks Gmail connection status for the authenticated workspace.
 */
googleAuthRouter.get(['/auth/google/status', '/google/status'], async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'GOOGLE_AUTH_REQUIRED', message: 'Authentication required' }
    });
  }

  try {
    const status = await GoogleAuthService.getStatus(workspaceId);
    return res.json({
      success: true,
      data: status
    });
  } catch (err: any) {
    console.error('[GOOGLE_AUTH] Status check failed for workspace:', workspaceId);
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'STATUS_CHECK_FAILED',
        message: 'Unable to check Gmail connection status. Please try again later.'
      }
    });
  }
});

/**
 * POST /api/v1/auth/google/disconnect
 * Disconnects the Google account for the authenticated workspace, revoking tokens remotely and in DB.
 */
googleAuthRouter.post(['/auth/google/disconnect', '/google/disconnect'], async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'GOOGLE_AUTH_REQUIRED', message: 'Authentication required' }
    });
  }

  try {
    await GoogleAuthService.disconnect(workspaceId);
    return res.json({
      success: true,
      data: { isConnected: false, status: 'revoked' }
    });
  } catch (err: any) {
    console.error('[GOOGLE_AUTH] Disconnect failed for workspace:', workspaceId);
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'GOOGLE_DISCONNECT_FAILED',
        message: 'Failed to disconnect Gmail account. Please try again.'
      }
    });
  }
});

/**
 * POST /api/v1/auth/google/settings
 * Updates Gmail integration settings (e.g. stopSequenceOnReply).
 */
googleAuthRouter.post(['/auth/google/settings', '/google/settings'], async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'GOOGLE_AUTH_REQUIRED', message: 'Authentication required' }
    });
  }

  const { stopSequenceOnReply } = req.body || {};
  if (stopSequenceOnReply === undefined || typeof stopSequenceOnReply !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETER', message: 'stopSequenceOnReply boolean parameter is required.' }
    });
  }

  const activePool = postgresPool || pool;
  if (activePool) {
    try {
      await activePool.query(
        `UPDATE workspace_integrations 
         SET stop_sequence_on_reply = $1, updated_at = now() 
         WHERE workspace_id = $2 AND provider = 'gmail'`,
        [stopSequenceOnReply, workspaceId]
      );
    } catch (err: any) {
      return res.status(503).json({
        success: false,
        error: { code: 'DATABASE_UNAVAILABLE', message: 'Failed to update integration settings.' }
      });
    }
  }

  return res.json({
    success: true,
    data: { stopSequenceOnReply }
  });
});

/**
 * POST /api/v1/auth/google/sync
 * Manually triggers Gmail mailbox sync for the authenticated workspace.
 */
googleAuthRouter.post(['/auth/google/sync', '/google/sync'], async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'GOOGLE_AUTH_REQUIRED', message: 'Authentication required' }
    });
  }

  const integration = await GoogleAuthService.getIntegration(workspaceId);
  if (!integration || !integration.isActive) {
    return res.status(400).json({
      success: false,
      error: { code: 'GOOGLE_NOT_CONNECTED', message: 'Gmail is not connected for this workspace.' }
    });
  }

  try {
    const result = await GmailReplySyncService.syncMailbox(workspaceId, integration.accountEmail);
    return res.json({
      success: result.success,
      data: result
    });
  } catch (err: any) {
    console.error('[GOOGLE_AUTH] Sync error for workspace:', workspaceId);
    return res.status(500).json({
      success: false,
      error: { code: 'SYNC_FAILED', message: 'Mailbox synchronization encountered an error.' }
    });
  }
});

/**
 * POST /api/v1/integrations/gmail/webhook
 * Google Cloud Pub/Sub Push Webhook for Gmail mailbox change notifications.
 */
googleAuthRouter.post(['/integrations/gmail/webhook', '/gmail/webhook'], async (req: Request, res: Response) => {
  // 1. Optional token verification if GOOGLE_PUBSUB_VERIFICATION_TOKEN is set
  const expectedToken = process.env.GOOGLE_PUBSUB_VERIFICATION_TOKEN?.trim();
  if (expectedToken) {
    const queryToken = req.query.token;
    const headerToken = req.headers['x-goog-pubsub-token'];
    if (queryToken !== expectedToken && headerToken !== expectedToken) {
      console.warn('[GMAIL_WEBHOOK] Rejected Pub/Sub webhook with invalid verification token');
      return res.status(403).json({ error: 'Invalid verification token' });
    }
  }

  // 2. Validate envelope format
  const pubsubMessage = req.body?.message;
  if (!pubsubMessage || !pubsubMessage.data) {
    return res.status(400).json({ error: 'Malformed Pub/Sub message payload' });
  }

  try {
    // 3. Decode base64 notification payload
    const decodedString = Buffer.from(pubsubMessage.data, 'base64').toString('utf8');
    const parsedData = JSON.parse(decodedString);
    const { emailAddress, historyId } = parsedData;

    if (!emailAddress) {
      return res.status(400).json({ error: 'Missing emailAddress in Pub/Sub data' });
    }

    // 4. Safely locate workspace integration from database using account email (never trusting client-supplied workspace ID)
    const activePool = postgresPool || pool;
    if (activePool) {
      const matchRes = await activePool.query(
        `SELECT workspace_id, account_email, status, is_active 
         FROM workspace_integrations 
         WHERE account_email = $1 AND provider = 'gmail' AND is_active = true 
         LIMIT 1`,
        [emailAddress.toLowerCase().trim()]
      );

      if (matchRes.rows.length === 0) {
        // Return 200 so Pub/Sub does not endlessly retry notifications for disconnected accounts
        return res.status(200).json({ success: true, message: 'No active integration found for account' });
      }

      const row = matchRes.rows[0];
      const workspaceId = row.workspace_id;

      // 5. Trigger idempotent history synchronization
      await GmailReplySyncService.syncMailbox(workspaceId, row.account_email, historyId ? String(historyId) : undefined);
    }

    // Acknowledge receipt to Google Pub/Sub
    return res.status(200).json({ success: true, message: 'Notification processed' });
  } catch (err: any) {
    console.error('[GMAIL_WEBHOOK] Error processing push notification:', err.message);
    // Return 200 to acknowledge unrecoverable parse errors, or 500 for transient DB failure
    const status = err.code === 'DATABASE_UNAVAILABLE' ? 500 : 200;
    return res.status(status).json({ success: false, error: 'Processing error' });
  }
});

/**
 * POST /api/v1/auth/google/test
 * Sends a test verification email via the connected Gmail account.
 * Rate limited to 5 tests per 15 minutes per workspace.
 */
googleAuthRouter.post(['/auth/google/test', '/google/test'], async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'GOOGLE_AUTH_REQUIRED', message: 'Authentication required' }
    });
  }

  // Rate Limiting Check
  const rateLimit = checkTestEmailRateLimit(workspaceId);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', rateLimit.retryAfterSeconds);
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many test emails sent. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`
      }
    });
  }

  const { toEmail } = req.body || {};
  const rawTargetEmail = toEmail || req.user?.email;

  if (!rawTargetEmail || typeof rawTargetEmail !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_EMAIL', message: 'Target email is required.' }
    });
  }

  const targetEmail = rawTargetEmail.trim().toLowerCase();

  // Strict email syntax and length validation
  if (targetEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail) || !hasValidTld(targetEmail)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_EMAIL_SYNTAX', message: 'The provided test email address is invalid.' }
    });
  }

  try {
    const result = await GmailService.sendEmail({
      workspaceId,
      to: targetEmail,
      subject: '[HUNTIQ] Google Gmail API Integration Verified',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #2563eb; margin: 0 0 12px 0;">🎉 HUNTIQ Gmail Integration Active!</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">
            This test email confirms that HUNTIQ has successfully authenticated with your Google account via OAuth 2.0 and is authorized to send emails through the official Gmail API.
          </p>
          <div style="background: #f8fafc; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #475569;">
            <div><strong>Provider:</strong> Google Gmail API (OAuth 2.0)</div>
            <div><strong>Recipient:</strong> ${targetEmail}</div>
            <div><strong>Timestamp:</strong> ${new Date().toUTCString()}</div>
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 16px 0 0 0;">
            All future outreach pitches from HUNTIQ will now be dispatched from your personal inbox with optimal deliverability.
          </p>
        </div>
      `,
      text: 'HUNTIQ Gmail Integration Verified via OAuth 2.0'
    });

    if (!result.success) {
      return res.status(502).json({
        success: false,
        error: { code: 'TEST_EMAIL_FAILED', message: 'Failed to dispatch email via Gmail API.' }
      });
    }

    return res.json({
      success: true,
      data: result
    });
  } catch (err: any) {
    console.error('[GOOGLE_AUTH] Test email dispatch failed securely');
    return res.status(500).json({
      success: false,
      error: { code: 'TEST_EMAIL_FAILED', message: 'Failed to send test email through connected Gmail account.' }
    });
  }
});
