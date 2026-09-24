import { Router, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import { EmailDispatchService, EmailProviderType } from '../services/emailDispatchService';
import { outreachRepository } from '../repositories/outreach';
import { createContactRepository } from '../repositories/contacts';
import { createActivityLogRepository } from '../repositories/activity-logs';

export const emailIntegrationRouter = Router();

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * GET /api/v1/integrations/email/config
 * Retrieves active email configuration status scoped to authenticated workspace.
 */
emailIntegrationRouter.get('/integrations/email/config', (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

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
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

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
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const { toEmail } = req.body || {};
    const targetEmail = toEmail || req.user?.email;
    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_EMAIL', message: 'Target email is required to send verification email' }
      });
    }

    const result = await EmailDispatchService.sendTestEmail(targetEmail, workspaceId);

    if (!result.success) {
      return res.status(502).json({
        success: false,
        error: { code: 'TEST_EMAIL_FAILED', message: 'Failed to dispatch verification email.' }
      });
    }

    return res.json({
      success: result.success,
      data: result
    });
  } catch (err: any) {
    console.error('[EMAIL_INTEGRATION] Test email dispatch failed securely');
    return res.status(500).json({
      success: false,
      error: { code: 'TEST_EMAIL_FAILED', message: 'Failed to send verification test email. Please check provider configuration.' }
    });
  }
});

/**
 * POST /api/v1/integrations/email/send
 * Dispatches a live outreach email to an extracted prospect.
 * Strictly verifies recipient belongs to a contact in the authenticated workspace.
 */
emailIntegrationRouter.post('/integrations/email/send', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const {
      to,
      toName,
      companyName,
      subject,
      content,
      campaignName,
      opportunityScore,
      campaignId,
      prospectId
    } = req.body || {};

    if (!to || !subject || !content) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'to, subject, and content are required' }
      });
    }

    const cleanTo = to.toLowerCase().trim();

    // Security Guard: Verify recipient exists in the authenticated workspace using the contact repository
    let matchingContact: {
      id: string;
      workspaceId: string;
      firstName: string;
      lastName: string;
      email: string;
      jobTitle?: string;
      companyId?: string | null;
    } | null = null;

    try {
      const contactRepo = createContactRepository();
      const contacts = await contactRepo.listByUser(req.user?.id || '', workspaceId);
      const found = contacts.find(c => c.email && c.email.toLowerCase() === cleanTo);
      if (found) {
        const nameParts = (found.name || '').trim().split(/\s+/);
        matchingContact = {
          id: found.id,
          workspaceId,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: found.email!,
          jobTitle: found.role || 'Prospect',
          companyId: null
        };
      }
    } catch (err: any) {
      console.warn('[EMAIL_INTEGRATION] Failed to query contacts repository:', err.message);
    }

    if (!matchingContact) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'RECIPIENT_NOT_IN_WORKSPACE',
          message: 'Recipient email must belong to a contact within the authenticated workspace'
        }
      });
    }

    // Sanitize and escape HTML
    const sanitizedContent = escapeHtml(content);
    const safeHtml = `<div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b;">${sanitizedContent.replace(/\n/g, '<br/>')}</div>`;

    // 1. Dispatch actual email via integration
    const dispatchResult = await EmailDispatchService.sendEmail({
      to: cleanTo,
      toName,
      subject,
      text: content,
      html: safeHtml
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

    // 2. Persist Outreach Thread in CRM
    const threadId = `outreach-dispatch-${Date.now()}`;
    const senderName = req.user?.fullName || 'Account Executive';

    const newOutreach = await outreachRepository.create({
      id: threadId,
      companyName: companyName || cleanTo.split('@')[1],
      contactName: toName 
        ? toName 
        : (matchingContact?.firstName 
            ? `${matchingContact.firstName} ${matchingContact.lastName || ''}`.trim() 
            : cleanTo.split('@')[0]),
      contactRole: matchingContact.jobTitle || 'Prospect',
      email: cleanTo,
      emailStatus: 'verified',
      avatarBg: '#eff6ff',
      avatarColor: '#2563eb',
      subject,
      lastMessageSnippet: content.slice(0, 100),
      lastMessageTime: 'Just now',
      status: 'contacted',
      channel: 'email',
      campaignName: campaignName || 'Outreach Campaign',
      opportunityScore: opportunityScore || 75,
      unread: false,
      campaignId: campaignId || null,
      prospectId: prospectId || null,
      provider: dispatchResult.provider,
      providerThreadId: (dispatchResult as any).threadId || null,
      providerMessageId: dispatchResult.messageId,
      thread: [
        {
          id: `msg-${Date.now()}`,
          sender: 'me',
          senderName,
          content,
          timestamp: 'Just now',
          channel: 'email',
          status: dispatchResult.status === 'sent' ? 'delivered' : 'sent',
          deliveredAt: dispatchResult.deliveredAt,
          provider: dispatchResult.provider,
          providerMessageId: dispatchResult.messageId,
          providerThreadId: (dispatchResult as any).threadId || null
        }
      ]
    } as any, workspaceId);

    // 3. Log Activity via ActivityLogRepository
    if (req.user?.id) {
      try {
        const activityRepo = createActivityLogRepository();
        await activityRepo.log({
          workspaceId,
          userId: req.user.id,
          action: 'OUTREACH_SENT',
          entityType: 'contact',
          entityId: matchingContact.id,
          details: `Dispatched Outreach Email to ${toName || cleanTo}: "${subject}" via ${dispatchResult.provider}`
        });
      } catch (err: any) {
        console.warn('[EMAIL_INTEGRATION] Failed to log activity:', err.message);
      }
    }

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
