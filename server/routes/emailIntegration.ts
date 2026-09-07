import { Router, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import { EmailDispatchService, EmailProviderType } from '../services/emailDispatchService';
import { db } from '../db/memoryStore';
import { outreachRepository } from '../repositories/outreach';

export const emailIntegrationRouter = Router();

/**
 * GET /api/v1/integrations/email/config
 * Retrieves active email configuration status
 */
emailIntegrationRouter.get('/integrations/email/config', (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = (req.headers['x-workspace-id'] as string) || req.user?.workspaceId || 'ws-main';
  const cfg = EmailDispatchService.getConfig(workspaceId);

  // Return safe config (mask passwords and API keys)
  return res.json({
    success: true,
    data: {
      provider: cfg.provider,
      fromName: cfg.fromName,
      fromEmail: cfg.fromEmail,
      isConfigured: cfg.isConfigured,
      smtpHost: cfg.smtpHost,
      smtpPort: cfg.smtpPort,
      smtpUser: cfg.smtpUser ? `${cfg.smtpUser.slice(0, 3)}***` : undefined,
      hasApiKey: Boolean(cfg.resendApiKey),
      hasSmtpPass: Boolean(cfg.smtpPass)
    }
  });
});

/**
 * POST /api/v1/integrations/email/config
 * Updates email integration credentials for the workspace
 */
emailIntegrationRouter.post('/integrations/email/config', (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = (req.headers['x-workspace-id'] as string) || req.user?.workspaceId || 'ws-main';
  const {
    provider,
    fromName,
    fromEmail,
    resendApiKey,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass
  } = req.body || {};

  const validProviders: EmailProviderType[] = ['resend', 'gmail', 'smtp', 'simulation'];
  if (provider && !validProviders.includes(provider)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PROVIDER', message: `Provider must be one of: ${validProviders.join(', ')}` }
    });
  }

  const updated = EmailDispatchService.updateConfig(workspaceId, {
    provider: provider || 'simulation',
    fromName,
    fromEmail,
    resendApiKey,
    smtpHost,
    smtpPort: smtpPort ? Number(smtpPort) : undefined,
    smtpUser,
    smtpPass
  });

  return res.json({
    success: true,
    data: {
      provider: updated.provider,
      fromName: updated.fromName,
      fromEmail: updated.fromEmail,
      isConfigured: updated.isConfigured
    }
  });
});

/**
 * POST /api/v1/integrations/email/test
 * Sends a verification test email
 */
emailIntegrationRouter.post('/integrations/email/test', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = (req.headers['x-workspace-id'] as string) || req.user?.workspaceId || 'ws-main';
    const { toEmail } = req.body || {};

    const targetEmail = toEmail || req.user?.email;
    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_EMAIL', message: 'Target email is required to send verification email' }
      });
    }

    const result = await EmailDispatchService.sendTestEmail(targetEmail, workspaceId);

    return res.json({
      success: result.success,
      data: result
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'TEST_EMAIL_FAILED', message: err.message }
    });
  }
});

/**
 * POST /api/v1/integrations/email/send
 * Dispatches a live outreach email to an extracted prospect
 */
emailIntegrationRouter.post('/integrations/email/send', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = (req.headers['x-workspace-id'] as string) || req.user?.workspaceId || 'ws-main';
    const {
      to,
      toName,
      companyName,
      subject,
      content,
      campaignName,
      opportunityScore
    } = req.body || {};

    if (!to || !subject || !content) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'to, subject, and content are required' }
      });
    }

    // 1. Dispatch actual email via integration
    const dispatchResult = await EmailDispatchService.sendEmail({
      to,
      toName,
      subject,
      text: content,
      html: `<div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b;">${content.replace(/\n/g, '<br/>')}</div>`
    }, workspaceId);

    if (!dispatchResult.success) {
      return res.status(502).json({
        success: false,
        error: {
          code: 'DELIVERY_FAILED',
          message: dispatchResult.error || 'Failed to dispatch email via provider'
        },
        data: dispatchResult
      });
    }

    // 2. Persist / Log Outreach Thread in CRM
    const threadId = `outreach-dispatch-${Date.now()}`;
    const senderName = req.user?.fullName || 'Ayoola Ade';

    const newOutreach = await outreachRepository.create({
      id: threadId,
      companyName: companyName || to.split('@')[1],
      contactName: toName || to.split('@')[0],
      contactRole: 'Verified Prospect',
      email: to,
      emailStatus: 'verified',
      avatarBg: '#eff6ff',
      avatarColor: '#2563eb',
      subject,
      lastMessageSnippet: content.slice(0, 100),
      lastMessageTime: 'Just now',
      status: 'contacted',
      channel: 'email',
      campaignName: campaignName || 'Cold Scraper Outreach',
      opportunityScore: opportunityScore || 85,
      unread: false,
      thread: [
        {
          id: `msg-${Date.now()}`,
          sender: 'me',
          senderName,
          content,
          timestamp: 'Just now',
          channel: 'email',
          status: dispatchResult.status === 'sent' ? 'delivered' : 'sent',
          deliveredAt: dispatchResult.deliveredAt
        }
      ]
    }, workspaceId);

    // 3. Log Activity
    db.logActivity({
      workspaceId,
      userId: req.user?.id || 'usr-1',
      type: 'OUTREACH_SENT',
      title: `Dispatched Outreach Email to ${toName || to}`,
      description: `Subject: "${subject}" | Delivered via ${dispatchResult.provider} (ID: ${dispatchResult.messageId}).`
    });

    return res.json({
      success: true,
      data: {
        delivery: dispatchResult,
        outreach: newOutreach
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SEND_OUTREACH_ERROR', message: err.message }
    });
  }
});
