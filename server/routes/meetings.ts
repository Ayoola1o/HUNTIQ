import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { meetingService } from '../services/meetingService';

export const meetingsRouter = Router();

// 1. List meetings with optional filters & KPI summary
meetingsRouter.get('/meetings', (req: Request, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const meetingType = typeof req.query.meetingType === 'string' ? req.query.meetingType : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);

  const { meetings, kpiSummary } = meetingService.list({
    status,
    meetingType,
    query
  });

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

// 2. Get meeting by ID
meetingsRouter.get('/meetings/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const meeting = meetingService.getById(id);

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
meetingsRouter.post('/meetings', (req: Request, res: Response) => {
  const payload = req.body;

  if (!payload || !payload.companyName || !payload.contactName) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_MEETING_PAYLOAD',
        message: 'Company name and contact name are required to schedule a meeting.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  const created = meetingService.create(payload);

  const response: ApiResponse = {
    success: true,
    data: created,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(201).json(response);
});

// 4. Update meeting fields
meetingsRouter.patch('/meetings/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updates = req.body;

  const updated = meetingService.update(id, updates);

  if (!updated) {
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
    data: updated,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 5. Update debrief notes
meetingsRouter.patch('/meetings/:id/notes', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { notes } = req.body || {};

  const updated = meetingService.updateNotes(id, notes || '');

  if (!updated) {
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
    data: updated,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 6. Delete meeting
meetingsRouter.delete('/meetings/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = meetingService.delete(id);

  if (!deleted) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'MEETING_NOT_FOUND',
        message: `Meeting with ID '${id}' was not found for deletion.`
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
