import { Router } from 'express';
import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import { GoogleAuthService } from '../services/googleAuthService';
import { GmailService } from '../services/gmailService';

export const googleAuthRouter = Router();

/**
 * GET /api/v1/auth/google/url
 * Returns the OAuth 2.0 authorization URL for connecting Gmail.
 */
googleAuthRouter.get(['/auth/google/url', '/google/url'], (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const returnUrl = typeof req.query.returnUrl === 'string' ? req.query.returnUrl : undefined;

  if (!GoogleAuthService.isConfigured()) {
    return res.status(200).json({
      success: false,
      error: {
        code: 'GOOGLE_OAUTH_NOT_CONFIGURED',
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
    const authUrl = GoogleAuthService.getAuthUrl(workspaceId, returnUrl);
    return res.json({
      success: true,
      data: {
        authUrl,
        isConfigured: true
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'OAUTH_URL_GENERATION_FAILED', message: err.message }
    });
  }
});

/**
 * GET /api/v1/auth/google/callback
 * Public redirect callback endpoint from Google OAuth consent screen.
 */
googleAuthRouter.get(['/auth/google/callback', '/google/callback'], async (req: Request, res: Response) => {
  const { code, state, error } = req.query as {
    code?: string;
    state?: string;
    error?: string;
  };

  let returnUrl = 'http://localhost:5173/?view=outreach';
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (decoded.returnUrl) returnUrl = decoded.returnUrl;
    } catch {}
  }

  const joinChar = returnUrl.includes('?') ? '&' : '?';

  if (error) {
    console.warn('[GOOGLE_AUTH] Callback received error from Google:', error);
    return res.redirect(`${returnUrl}${joinChar}google_auth=error&reason=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${returnUrl}${joinChar}google_auth=error&reason=missing_code`);
  }

  try {
    const integration = await GoogleAuthService.exchangeCode(code, state);
    console.log(`[GOOGLE_AUTH] Successfully authenticated Gmail for ${integration.accountEmail}`);
    return res.redirect(
      `${returnUrl}${joinChar}google_auth=success&email=${encodeURIComponent(integration.accountEmail)}`
    );
  } catch (err: any) {
    console.error('[GOOGLE_AUTH] Token exchange failed:', err.message);
    return res.redirect(
      `${returnUrl}${joinChar}google_auth=error&reason=${encodeURIComponent(err.message || 'token_exchange_failed')}`
    );
  }
});

/**
 * GET /api/v1/auth/google/status
 * Checks Gmail connection status for the authenticated workspace.
 */
googleAuthRouter.get(['/auth/google/status', '/google/status'], async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  try {
    const status = await GoogleAuthService.getStatus(workspaceId);
    return res.json({
      success: true,
      data: status
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'STATUS_CHECK_FAILED', message: err.message }
    });
  }
});

/**
 * POST /api/v1/auth/google/disconnect
 * Disconnects the Google account for the authenticated workspace.
 */
googleAuthRouter.post(['/auth/google/disconnect', '/google/disconnect'], async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  try {
    await GoogleAuthService.disconnect(workspaceId);
    return res.json({
      success: true,
      data: { isConnected: false }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DISCONNECT_FAILED', message: err.message }
    });
  }
});

/**
 * POST /api/v1/auth/google/test
 * Sends a test verification email via the connected Gmail account.
 */
googleAuthRouter.post(['/auth/google/test', '/google/test'], async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const { toEmail } = req.body || {};
  const targetEmail = toEmail || req.user?.email;

  if (!targetEmail) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_EMAIL', message: 'Target email is required.' }
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
            <div><strong>Timestamp:</strong> ${new Date().toUTCString()}</div>
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 16px 0 0 0;">
            All future outreach pitches from HUNTIQ will now be dispatched from your personal inbox with optimal deliverability.
          </p>
        </div>
      `,
      text: 'HUNTIQ Gmail Integration Verified via OAuth 2.0'
    });

    return res.json({
      success: result.success,
      data: result
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'GMAIL_TEST_FAILED', message: err.message }
    });
  }
});
