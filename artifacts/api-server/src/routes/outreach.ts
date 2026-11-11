import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { createOutreachRepository } from '../repositories/outreach';
import type { AuthenticatedRequest } from '../middleware/auth';
import { GmailService } from '../services/gmailService';
import { randomUUID } from 'node:crypto';
import { postgresPool } from '../database/postgres';

export const outreachRouter = Router();
const outreachRepository = createOutreachRepository();
const emailPattern = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;

// 1. List conversations with optional filters & KPI summary
outreachRouter.get('/outreach', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const channel = typeof req.query.channel === 'string' ? req.query.channel : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);

  try {
    const conversations = await outreachRepository.list(workspaceId, {
      status,
      channel,
      query
    });

    const dueToday = conversations.filter(c => c.status === 'due_today').length;
    const scheduled = conversations.filter(c => c.status === 'scheduled').length;
    const replies = conversations.filter(c => c.status === 'replied').length;
    const needsAttention = conversations.filter(c => c.status === 'needs_attention').length;
    const totalOutreach = conversations.length;
    const responseRate = totalOutreach > 0 ? Math.round((replies / totalOutreach) * 100) : 0;

    const kpiSummary = {
      dueToday,
      scheduled,
      replies,
      needsAttention,
      responseRate
    };

    const response: ApiResponse = {
      success: true,
      data: {
        conversations,
        kpiSummary
      },
      meta: {
        total: conversations.length,
        timestamp: new Date().toISOString()
      }
    };

    return res.status(200).json(response);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'OUTREACH_FETCH_FAILED',
        message: 'Unable to list outreach conversations.'
      }
    });
  }
});

// 2. Get specific conversation by ID
outreachRouter.get('/outreach/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const conversation = await outreachRepository.getById(id, workspaceId);

    if (!conversation) {
      const errorResponse: ApiResponse = {
        success: false,
        error: {
          code: 'OUTREACH_NOT_FOUND',
          message: `Conversation with ID '${id}' was not found.`
        }
      };
      return res.status(404).json(errorResponse);
    }

    const response: ApiResponse = {
      success: true,
      data: conversation,
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return res.status(200).json(response);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'DATABASE_UNAVAILABLE',
        message: 'Unable to retrieve conversation.'
      }
    });
  }
});

// 3. Start a new outreach conversation
outreachRouter.post('/outreach', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const userId = req.user?.id;
  const payload = req.body;

  if (!payload || !payload.contactName || !payload.companyName) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_OUTREACH_PAYLOAD',
        message: 'Contact name and company name are required to start an outreach thread.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  let sentToGmail = false;
  let requestId: string | null = null;
  let emailAttemptStarted = false;
  let gmailDelivery: { messageId: string; threadId?: string; rfcMessageId?: string } | null = null;
  try {
    const channel = payload.channel || 'email';
    const content = typeof payload.lastMessageSnippet === 'string' ? payload.lastMessageSnippet.trim() : '';
    requestId = typeof payload.requestId === 'string' && /^[0-9a-f-]{36}$/i.test(payload.requestId) ? payload.requestId : randomUUID();
    let verifiedContact: any;
    let retryThread: any;
    if (channel === 'email') {
      const email = typeof payload.email === 'string' ? payload.email.trim() : '';
      const subject = typeof payload.subject === 'string' ? payload.subject.trim() : '';
      if (!emailPattern.test(email) || !subject || /[\r\n]/.test(subject) || !content) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_EMAIL', message: 'A verified recipient email, subject, and message are required.' } });
      }
      if (!postgresPool || !payload.leadId || !payload.contactId || !payload.researchReportId) {
        return res.status(409).json({ success: false, error: { code: 'VERIFIED_LEAD_REQUIRED', message: 'Email outreach requires a saved lead, saved research, and a verified contact.' } });
      }
      const result = await postgresPool.query(`
        SELECT c.id, c.full_name, c.title, c.email, company.name AS company_name, company.domain
        FROM leads l
        JOIN companies company ON company.id=l.company_id AND company.workspace_id=l.workspace_id
        JOIN contacts c ON c.id = $3 AND c.workspace_id = l.workspace_id AND c.company_id = l.company_id
        JOIN research_reports r ON r.id = $4 AND r.workspace_id = l.workspace_id AND r.dossier_data->>'leadId' = l.id::text AND r.dossier_data->>'kind' = 'grounded-360'
        WHERE l.id = $1 AND l.workspace_id = $2 AND lower(c.email_status) = 'verified'
          AND lower(btrim(c.email)) = lower(btrim($5))
        LIMIT 1
      `, [payload.leadId, workspaceId, payload.contactId, payload.researchReportId, email]);
      verifiedContact = result.rows[0];
      if (!verifiedContact) return res.status(400).json({ success: false, error: { code: 'CONTACT_NOT_VERIFIED', message: 'Recipient is missing, unverified, or is not linked to this saved lead and research.' } });
      const prior = await postgresPool.query('SELECT state, outreach_thread_id FROM outbound_email_attempts WHERE workspace_id=$1 AND request_id=$2 LIMIT 1', [workspaceId, requestId]);
      if (prior.rowCount) {
        if (prior.rows[0].state !== 'failed') return res.status(409).json({ success: false, error: { code: 'SEND_ALREADY_ATTEMPTED', message: prior.rows[0].state === 'sent' ? 'This email was already sent.' : 'This email already has a delivery attempt. Check its status before retrying.' } });
        retryThread = await outreachRepository.getById(prior.rows[0].outreach_thread_id, workspaceId);
        if (!retryThread) return res.status(409).json({ success: false, error: { code: 'SEND_RETRY_UNAVAILABLE', message: 'The failed email draft could not be recovered. Start a new draft.' } });
        const claimed = await postgresPool.query(`UPDATE outbound_email_attempts SET state='sending', recipient_email=$3, subject=$4, body_text=$5, error_code=NULL, updated_at=now() WHERE workspace_id=$1 AND request_id=$2 AND state='failed' RETURNING id`, [workspaceId, requestId, verifiedContact.email, subject, content]);
        if (!claimed.rowCount) return res.status(409).json({ success: false, error: { code: 'SEND_ALREADY_ATTEMPTED', message: 'Another request is already retrying this message.' } });
      }
    }
    const created = retryThread || await outreachRepository.create({
      ...payload,
      contactName: verifiedContact?.full_name || payload.contactName,
      contactRole: verifiedContact?.title || '',
      companyName: verifiedContact?.company_name || payload.companyName,
      domain: verifiedContact?.domain || payload.domain || '',
      email: verifiedContact?.email || payload.email,
      emailStatus: channel === 'email' ? 'verified' : payload.emailStatus,
      channel, status: 'draft', thread: []
    }, workspaceId, userId);

    if (channel === 'email') {
      const attempt = retryThread ? { rowCount: 1 } as any : await postgresPool!.query(`INSERT INTO outbound_email_attempts
        (workspace_id, outreach_thread_id, request_id, recipient_email, subject, body_text, state)
        VALUES ($1, $2, $3, $4, $5, $6, 'sending') ON CONFLICT (workspace_id, request_id) DO NOTHING RETURNING id`,
      [workspaceId, created.id, requestId, verifiedContact.email, payload.subject.trim(), content]);
      if (!attempt.rowCount) return res.status(409).json({ success: false, error: { code: 'SEND_ALREADY_ATTEMPTED', message: 'This email already has a delivery attempt. Check its status before retrying.' } });
      emailAttemptStarted = true;
      const sent = await GmailService.sendEmail({ workspaceId, to: verifiedContact.email, toName: verifiedContact.full_name, subject: payload.subject.trim(), text: content, requestId: requestId || undefined });
      if (!sent.success) {
        await postgresPool?.query(`UPDATE outbound_email_attempts SET state='failed', error_code='GMAIL_REJECTED', updated_at=now() WHERE workspace_id=$1 AND request_id=$2`, [workspaceId, requestId]);
        return res.status(502).json({ success: false, error: { code: 'GMAIL_SEND_FAILED', message: 'Gmail rejected this message. It remains a draft in HUNTIQ.' } });
      }
      sentToGmail = true;
      gmailDelivery = { messageId: sent.messageId, threadId: sent.threadId, rfcMessageId: sent.rfcMessageId };
      const delivery = { providerMessageId: sent.messageId, providerThreadId: sent.threadId, providerRfcMessageId: sent.rfcMessageId };
      await postgresPool?.query(`UPDATE outbound_email_attempts SET state='sent', provider_message_id=$3, provider_thread_id=$4, provider_rfc_message_id=$5, updated_at=now() WHERE workspace_id=$1 AND request_id=$2`,
        [workspaceId, requestId, sent.messageId, sent.threadId || null, sent.rfcMessageId || null]);
      const updated = await outreachRepository.addMessage(created.id, {
        sender: 'me', senderName: req.user?.fullName || 'HUNTIQ', channel: 'email', content,
        ...delivery, deliveryStatus: 'sent'
      }, workspaceId);
      await postgresPool?.query(`INSERT INTO activities (workspace_id, company_id, lead_id, type, title, description, metadata)
        SELECT $1, l.company_id, l.id, 'email_sent', $4, $5, $6::jsonb FROM leads l WHERE l.id=$2 AND l.workspace_id=$1`,
      [workspaceId, payload.leadId, payload.contactId, `Email sent to ${verifiedContact.email}`, content.slice(0, 5000), JSON.stringify({ provider: 'gmail', providerMessageId: sent.messageId, providerThreadId: sent.threadId, subject: payload.subject.trim() })]);
      if (updated) Object.assign(created, updated, delivery, { status: 'contacted', deliveryStatus: 'sent' });
      await postgresPool!.query("UPDATE outreach_threads SET status='contacted', updated_at=now() WHERE id=$1 AND workspace_id=$2", [created.id, workspaceId]);
    }

    const response: ApiResponse = {
      success: true,
        data: created,
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return res.status(201).json(response);
  } catch (err: any) {
    try {
      if (requestId && gmailDelivery) await postgresPool?.query(`UPDATE outbound_email_attempts SET state='sent', provider_message_id=$3, provider_thread_id=$4, provider_rfc_message_id=$5, error_code=NULL, updated_at=now() WHERE workspace_id=$1 AND request_id=$2 AND state='sending'`, [workspaceId, requestId, gmailDelivery.messageId, gmailDelivery.threadId || null, gmailDelivery.rfcMessageId || null]);
      else if (requestId && emailAttemptStarted) await postgresPool?.query(`UPDATE outbound_email_attempts SET state=$3, error_code=$4, updated_at=now() WHERE workspace_id=$1 AND request_id=$2 AND state='sending'`, [workspaceId, requestId, err.deliveryOutcomeUnknown ? 'unknown' : 'failed', err.deliveryOutcomeUnknown ? 'DELIVERY_OUTCOME_UNKNOWN' : 'PRE_SEND_FAILURE']);
    } catch {}
    if (emailAttemptStarted) return res.status(502).json({ success: false, error: { code: gmailDelivery ? 'GMAIL_ACCEPTED_SAVE_PENDING' : err.deliveryOutcomeUnknown ? 'DELIVERY_OUTCOME_UNKNOWN' : 'GMAIL_SEND_FAILED', message: gmailDelivery ? 'Gmail accepted the email, but HUNTIQ could not finish saving it. Check Gmail Sent; inbox sync will recover it.' : err.deliveryOutcomeUnknown ? 'Gmail delivery could not be confirmed. Check Gmail Sent before retrying this draft.' : 'Gmail could not send this email. The draft remains saved and can be retried.' } });
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'OUTREACH_CREATE_FAILED',
        message: sentToGmail
          ? 'Gmail accepted the email, but HUNTIQ could not save it. Check Gmail Sent before retrying.'
          : 'Failed to send or save this outreach conversation. Check the Gmail connection and try again.'
      }
    });
  }
});

// 4. Send a reply/message in an existing thread
outreachRouter.post('/outreach/:id/messages', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { content } = req.body || {};

  if (typeof content !== 'string' || !content.trim()) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_MESSAGE_CONTENT',
        message: 'Message content cannot be empty.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  const senderName = req.user?.fullName || 'Ayoola Ade';
  const requestId = typeof req.body?.requestId === 'string' && /^[0-9a-f-]{36}$/i.test(req.body.requestId) ? req.body.requestId : randomUUID();
  let sentToGmail = false;
  let emailAttemptStarted = false;
  try {
    const conversation = await outreachRepository.getById(id, workspaceId);
    if (!conversation) return res.status(404).json({ success: false, error: { code: 'OUTREACH_NOT_FOUND', message: 'Conversation not found.' } });
    let delivery: { providerMessageId: string; providerThreadId?: string; providerRfcMessageId?: string } | undefined;
    const actualChannel = conversation.channel;
    if (actualChannel === 'email') {
      if (!postgresPool || !conversation.leadId || !conversation.contactId || !conversation.researchReportId) {
        return res.status(409).json({ success: false, error: { code: 'VERIFIED_LEAD_REQUIRED', message: 'This email thread is not linked to a saved lead, research report, and verified contact.' } });
      }
      const verified = await postgresPool.query(`SELECT 1 FROM leads l JOIN contacts c ON c.id=$3 AND c.workspace_id=l.workspace_id AND c.company_id=l.company_id JOIN research_reports r ON r.id=$4 AND r.workspace_id=l.workspace_id AND r.dossier_data->>'leadId'=l.id::text AND r.dossier_data->>'kind'='grounded-360' WHERE l.id=$1 AND l.workspace_id=$2 AND lower(c.email_status)='verified' AND lower(btrim(c.email))=lower(btrim($5)) LIMIT 1`,
        [conversation.leadId, workspaceId, conversation.contactId, conversation.researchReportId, conversation.email || '']);
      if (!verified.rowCount) return res.status(400).json({ success: false, error: { code: 'CONTACT_NOT_VERIFIED', message: 'The saved recipient is no longer verified. Update the lead contact before sending.' } });
      if (!conversation.email || !emailPattern.test(conversation.email)) return res.status(400).json({ success: false, error: { code: 'INVALID_EMAIL', message: 'The saved verified contact has no valid email address.' } });
      const prior = await postgresPool.query('SELECT state FROM outbound_email_attempts WHERE workspace_id=$1 AND request_id=$2 LIMIT 1', [workspaceId, requestId]);
      if (prior.rowCount && prior.rows[0].state !== 'failed') return res.status(409).json({ success: false, error: { code: 'SEND_ALREADY_ATTEMPTED', message: 'This message already has a delivery attempt. Check Gmail and Outreach before retrying.' } });
      if (prior.rowCount) {
        const claimed = await postgresPool.query(`UPDATE outbound_email_attempts SET state='sending', body_text=$3, error_code=NULL, updated_at=now() WHERE workspace_id=$1 AND request_id=$2 AND state='failed' RETURNING id`, [workspaceId, requestId, content.trim()]);
        if (!claimed.rowCount) return res.status(409).json({ success: false, error: { code: 'SEND_ALREADY_ATTEMPTED', message: 'Another request is already retrying this message.' } });
      } else {
        const createdAttempt = await postgresPool.query(`INSERT INTO outbound_email_attempts (workspace_id, outreach_thread_id, request_id, recipient_email, subject, body_text, state) VALUES ($1,$2,$3,$4,$5,$6,'sending') ON CONFLICT (workspace_id, request_id) DO NOTHING RETURNING id`, [workspaceId, id, requestId, conversation.email, conversation.subject, content.trim()]);
        if (!createdAttempt.rowCount) return res.status(409).json({ success: false, error: { code: 'SEND_ALREADY_ATTEMPTED', message: 'Another request already started delivery for this message.' } });
      }
      emailAttemptStarted = true;
      const sent = await GmailService.sendEmail({
        workspaceId, to: conversation.email, subject: conversation.subject.replace(/[\r\n]/g, ' '),
        text: content.trim(), threadId: conversation.providerThreadId || undefined,
        replyToMessageId: conversation.providerMessageId || undefined, requestId
      });
      if (!sent.success) {
        await postgresPool.query(`UPDATE outbound_email_attempts SET state='failed', error_code='GMAIL_REJECTED', updated_at=now() WHERE workspace_id=$1 AND request_id=$2`, [workspaceId, requestId]);
        return res.status(502).json({ success: false, error: { code: 'GMAIL_SEND_FAILED', message: 'Gmail rejected this reply. It was not added as a sent message.' } });
      }
      sentToGmail = true;
      delivery = { providerMessageId: sent.messageId, providerThreadId: sent.threadId, providerRfcMessageId: sent.rfcMessageId };
      await postgresPool.query(`UPDATE outbound_email_attempts SET state='sent', provider_message_id=$3, provider_thread_id=$4, provider_rfc_message_id=$5, updated_at=now() WHERE workspace_id=$1 AND request_id=$2`, [workspaceId, requestId, sent.messageId, sent.threadId || null, sent.rfcMessageId || null]);
    }
    const updated = await outreachRepository.addMessage(id, {
      sender: 'me',
      senderName,
      channel: actualChannel,
      content: content.trim(),
      ...delivery
    }, workspaceId);
    if (actualChannel === 'email' && conversation.leadId) await postgresPool?.query(`INSERT INTO activities (workspace_id, company_id, lead_id, type, title, description, metadata) SELECT $1, company_id, lead_id, 'email_sent', $3, $4, $5::jsonb FROM outreach_threads WHERE id=$2 AND workspace_id=$1`, [workspaceId, id, `Email sent to ${conversation.email}`, content.trim().slice(0, 5000), JSON.stringify({ provider: 'gmail', providerMessageId: delivery?.providerMessageId })]);

    if (!updated) {
      if (sentToGmail) throw new Error('Conversation no longer exists.');
      const errorResponse: ApiResponse = {
        success: false,
        error: {
          code: 'OUTREACH_NOT_FOUND',
          message: `Conversation with ID '${id}' was not found.`
        }
      };
      return res.status(404).json(errorResponse);
    }

    const response: ApiResponse = {
      success: true,
      data: updated,
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return res.status(200).json(response);
  } catch (err: any) {
    try { if (emailAttemptStarted) await postgresPool?.query(`UPDATE outbound_email_attempts SET state=$3, error_code=$4, updated_at=now() WHERE workspace_id=$1 AND request_id=$2 AND state='sending'`, [workspaceId, requestId, err.deliveryOutcomeUnknown ? 'unknown' : sentToGmail ? 'sent' : 'failed', err.deliveryOutcomeUnknown ? 'DELIVERY_OUTCOME_UNKNOWN' : sentToGmail ? null : 'PRE_SEND_FAILURE']); } catch {}
    if (emailAttemptStarted) return res.status(502).json({ success: false, error: { code: err.deliveryOutcomeUnknown ? 'DELIVERY_OUTCOME_UNKNOWN' : sentToGmail ? 'GMAIL_ACCEPTED_SAVE_PENDING' : 'GMAIL_SEND_FAILED', message: err.deliveryOutcomeUnknown ? 'Gmail delivery could not be confirmed. Check Gmail Sent before retrying this message.' : sentToGmail ? 'Gmail accepted the message, but HUNTIQ could not finish saving it. Check Gmail Sent; inbox sync will recover it.' : 'Gmail could not send this message. Your draft remains available to retry.' } });
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'DATABASE_UNAVAILABLE',
        message: sentToGmail
          ? 'Gmail accepted the email, but HUNTIQ could not save it. Check Gmail Sent before retrying.'
          : 'Failed to send outreach message. Check the Gmail connection and try again.'
      }
    });
  }
});

// 5. Update conversation status
outreachRouter.patch('/outreach/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body || {};

  try {
    const updated = await outreachRepository.update(id, { status }, workspaceId);

    if (!updated) {
      const errorResponse: ApiResponse = {
        success: false,
        error: {
          code: 'OUTREACH_NOT_FOUND',
          message: `Conversation with ID '${id}' was not found.`
        }
      };
      return res.status(404).json(errorResponse);
    }

    const response: ApiResponse = {
      success: true,
      data: updated,
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return res.status(200).json(response);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'DATABASE_UNAVAILABLE',
        message: 'Failed to update conversation status.'
      }
    });
  }
});

// 6. Mark conversation as read
outreachRouter.post('/outreach/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const updated = await outreachRepository.update(id, { unread: false }, workspaceId);

    const response: ApiResponse = {
      success: true,
      data: updated,
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return res.status(200).json(response);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'DATABASE_UNAVAILABLE',
        message: 'Failed to mark conversation as read.'
      }
    });
  }
});
