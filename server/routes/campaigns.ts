import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { campaignService } from '../services/campaignService';

export const campaignsRouter = Router();

// 1. List campaigns with optional filters & KPI summary
campaignsRouter.get('/campaigns', (req: Request, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const channel = typeof req.query.channel === 'string' ? req.query.channel : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);

  const { campaigns, kpiSummary } = campaignService.list({
    status,
    channel,
    query
  });

  const response: ApiResponse = {
    success: true,
    data: {
      campaigns,
      kpiSummary
    },
    meta: {
      total: campaigns.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 2. Get single campaign details by ID
campaignsRouter.get('/campaigns/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const campaign = campaignService.getById(id);

  if (!campaign) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'CAMPAIGN_NOT_FOUND',
        message: `Campaign with ID '${id}' was not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const response: ApiResponse = {
    success: true,
    data: campaign,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 3. Create a new campaign
campaignsRouter.post('/campaigns', (req: Request, res: Response) => {
  const payload = req.body;

  if (!payload || !payload.name) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_CAMPAIGN_PAYLOAD',
        message: 'Campaign name is required to initialize a campaign.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  const created = campaignService.create(payload);

  const response: ApiResponse = {
    success: true,
    data: created,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(201).json(response);
});

// 4. Update an existing campaign
campaignsRouter.patch('/campaigns/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updates = req.body;

  const updated = campaignService.update(id, updates);

  if (!updated) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'CAMPAIGN_NOT_FOUND',
        message: `Campaign with ID '${id}' not found for update.`
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

// 5. Toggle campaign active/paused status
campaignsRouter.post('/campaigns/:id/toggle', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const toggled = campaignService.toggleStatus(id);

  if (!toggled) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'CAMPAIGN_NOT_FOUND',
        message: `Campaign with ID '${id}' not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const response: ApiResponse = {
    success: true,
    data: toggled,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 6. Delete campaign
campaignsRouter.delete('/campaigns/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = campaignService.delete(id);

  if (!deleted) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'CAMPAIGN_NOT_FOUND',
        message: `Campaign with ID '${id}' not found for deletion.`
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
