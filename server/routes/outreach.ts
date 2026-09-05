import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { createOutreachRepository } from '../repositories/outreach';
import type { AuthenticatedRequest } from '../middleware/auth';

export const outreachRouter = Router();
const outreachRepository = createOutreachRepository();

// 1. List conversations with optional filters & KPI summary
outreachRouter.get('/outreach', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const channel = typeof req.query.channel === 'string' ? req.query.channel : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);

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

  res.status(200).json(response);
});

// 2. Get specific conversation by ID
outreachRouter.get('/outreach/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
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

  res.status(200).json(response);
});

// 3. Start a new outreach conversation
outreachRouter.post('/outreach', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
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

  const created = await outreachRepository.create(payload, workspaceId, userId);

  const response: ApiResponse = {
    success: true,
    data: created,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(201).json(response);
});

// 4. Send a reply/message in an existing thread
outreachRouter.post('/outreach/:id/messages', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { content, channel } = req.body || {};

  if (!content?.trim()) {
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
  const updated = await outreachRepository.addMessage(id, {
    sender: 'me',
    senderName,
    channel: channel || 'email',
    content: content.trim()
  }, workspaceId);

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

  res.status(200).json(response);
});

// 5. Update conversation status
outreachRouter.patch('/outreach/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body || {};

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

  res.status(200).json(response);
});

// 6. Mark conversation as read
outreachRouter.post('/outreach/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updated = await outreachRepository.update(id, { unread: false }, workspaceId);

  const response: ApiResponse = {
    success: true,
    data: updated,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});
