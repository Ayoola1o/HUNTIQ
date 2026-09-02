import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { outreachService } from '../services/outreachService';

export const outreachRouter = Router();

// 1. List conversations with optional filters & KPI summary
outreachRouter.get('/outreach', (req: Request, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const channel = typeof req.query.channel === 'string' ? req.query.channel : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);

  const { conversations, kpiSummary } = outreachService.list({
    status,
    channel,
    query
  });

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
outreachRouter.get('/outreach/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const conversation = outreachService.getById(id);

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
outreachRouter.post('/outreach', (req: Request, res: Response) => {
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

  const created = outreachService.create(payload);

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
outreachRouter.post('/outreach/:id/messages', (req: Request, res: Response) => {
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

  const updated = outreachService.sendMessage(id, content.trim(), channel);

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
outreachRouter.patch('/outreach/:id/status', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body || {};

  const updated = outreachService.updateStatus(id, status);

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
outreachRouter.post('/outreach/:id/read', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updated = outreachService.markAsRead(id);

  const response: ApiResponse = {
    success: true,
    data: updated,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});
