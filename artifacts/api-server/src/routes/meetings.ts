import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { createMeetingRepository } from '../repositories/meetings';
import type { AuthenticatedRequest } from '../middleware/auth';

export const meetingsRouter = Router();
const meetingRepository = createMeetingRepository();

// 1. List meetings with optional filters & KPI summary
meetingsRouter.get('/meetings', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const meetingType = typeof req.query.meetingType === 'string' ? req.query.meetingType : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);

  const meetings = await meetingRepository.list(workspaceId, {
    status,
    meetingType,
    query
  });

  const upcomingMeetings = meetings.filter(m => m.status === 'upcoming').length;
  const todayCount = meetings.filter(m => m.scheduledTime.includes('Today')).length;
  const completedThisMonth = meetings.filter(m => m.status === 'completed').length;
  const bookedFromOutreach = 75; // percentage benchmark

  const kpiSummary = {
    upcomingMeetings,
    todayCount,
    completedThisMonth,
    bookedFromOutreach
  };

  const response: ApiResponse = {
    success: true,
    data: {
      meetings,
      kpiSummary
    },
    meta: {
      total: meetings.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 2. Get specific meeting by ID
meetingsRouter.get('/meetings/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const meeting = await meetingRepository.getById(id, workspaceId);

  if (!meeting) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'MEETING_NOT_FOUND',
        message: `Meeting with ID '${id}' was not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const response: ApiResponse = {
    success: true,
    data: meeting,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 3. Schedule a new meeting
meetingsRouter.post('/meetings', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const userId = req.user?.id;
  const payload = req.body;

  if (!payload || !payload.title || !payload.companyName) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_MEETING_PAYLOAD',
        message: 'Meeting title and company name are required to schedule a meeting.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  const created = await meetingRepository.create(payload, workspaceId, userId);

  const response: ApiResponse = {
    success: true,
    data: created,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(201).json(response);
});

// 4. Update meeting details or status
meetingsRouter.patch('/meetings/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updates = req.body;

  const updated = await meetingRepository.update(id, updates, workspaceId);

  if (!updated) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'MEETING_NOT_FOUND',
        message: `Meeting with ID '${id}' not found for update.`
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

// 5. Cancel meeting
meetingsRouter.post('/meetings/:id/cancel', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updated = await meetingRepository.update(id, { status: 'cancelled' }, workspaceId);

  if (!updated) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'MEETING_NOT_FOUND',
        message: `Meeting with ID '${id}' not found.`
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

// 6. Delete meeting
meetingsRouter.delete('/meetings/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = await meetingRepository.delete(id, workspaceId);

  if (!deleted) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'MEETING_NOT_FOUND',
        message: `Meeting with ID '${id}' not found for deletion.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const response: ApiResponse = {
    success: true,
    data: { id, deleted: true },
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});
