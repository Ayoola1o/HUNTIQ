import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { createCampaignRepository } from '../repositories/campaigns';
import type { AuthenticatedRequest } from '../middleware/auth';

export const campaignsRouter = Router();
const campaignRepository = createCampaignRepository();

// 1. List campaigns with optional filters & KPI summary
campaignsRouter.get('/campaigns', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const channel = typeof req.query.channel === 'string' ? req.query.channel : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);

  const campaigns = await campaignRepository.list(workspaceId, {
    status,
    channel,
    query
  });

  const kpiSummary = {
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalAudience: campaigns.reduce((acc, c) => acc + (c.audienceCount || 0), 0),
    totalReplies: campaigns.reduce((acc, c) => acc + Math.round((c.sentCount || 0) * (c.replyRate || 0) / 100), 0),
    opportunitiesCreated: campaigns.reduce((acc, c) => acc + (c.opportunitiesCreated || 0), 0),
    pipelineGenerated: campaigns.reduce((acc, c) => acc + (c.expectedValue || 0), 0)
  };

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
campaignsRouter.get('/campaigns/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const campaign = await campaignRepository.getById(id, workspaceId);

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
campaignsRouter.post('/campaigns', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const userId = req.user?.id;
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

  const created = await campaignRepository.create(payload, workspaceId, userId);

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
campaignsRouter.patch('/campaigns/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updates = req.body;

  const updated = await campaignRepository.update(id, updates, workspaceId);

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
campaignsRouter.post('/campaigns/:id/toggle', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existing = await campaignRepository.getById(id, workspaceId);

  if (!existing) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'CAMPAIGN_NOT_FOUND',
        message: `Campaign with ID '${id}' not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const newStatus = existing.status === 'active' ? 'paused' : 'active';
  const updated = await campaignRepository.update(id, { status: newStatus }, workspaceId);

  const response: ApiResponse = {
    success: true,
    data: updated,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 6. Delete campaign
campaignsRouter.delete('/campaigns/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = await campaignRepository.delete(id, workspaceId);

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
