import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { createCampaignRepository } from '../repositories/campaigns';
import type { AuthenticatedRequest } from '../middleware/auth';

export const campaignsRouter = Router();
const campaignRepository = createCampaignRepository();

// 1. List campaigns with optional filters & KPI summary
campaignsRouter.get('/campaigns', async (req: AuthenticatedRequest, res: Response) => {
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

    return res.status(200).json(response);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: { code: err.code || 'DATABASE_UNAVAILABLE', message: 'Failed to list campaigns.' }
    });
  }
});

// 2. Get single campaign details by ID
campaignsRouter.get('/campaigns/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
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

    return res.status(200).json(response);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: { code: err.code || 'DATABASE_UNAVAILABLE', message: 'Failed to retrieve campaign.' }
    });
  }
});

// 3. Create a new campaign
campaignsRouter.post('/campaigns', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const userId = req.user?.id;
  const payload = req.body;

  if (!payload || !payload.name) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_CAMPAIGN_PAYLOAD',
        message: 'Campaign name is required.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  try {
    const created = await campaignRepository.create(payload, workspaceId, userId);

    const response: ApiResponse = {
      success: true,
      data: created,
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return res.status(201).json(response);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: { code: err.code || 'DATABASE_UNAVAILABLE', message: 'Failed to create campaign.' }
    });
  }
});

// 4. Update campaign status (draft -> active -> paused -> completed)
campaignsRouter.patch('/campaigns/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body || {};

  const validStatuses = ['draft', 'active', 'paused', 'completed'];
  if (!status || !validStatuses.includes(status)) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_STATUS',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      }
    };
    return res.status(400).json(errorResponse);
  }

  try {
    const updated = await campaignRepository.update(id, { status }, workspaceId);

    if (!updated) {
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
      error: { code: err.code || 'DATABASE_UNAVAILABLE', message: 'Failed to update campaign status.' }
    });
  }
});

// 5. Update campaign sequence steps
campaignsRouter.put('/campaigns/:id/sequence', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { sequence } = req.body || {};

  if (!Array.isArray(sequence)) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_SEQUENCE',
        message: 'Sequence must be an array of steps.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  try {
    const updated = await campaignRepository.update(id, { sequence }, workspaceId);

    if (!updated) {
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
      error: { code: err.code || 'DATABASE_UNAVAILABLE', message: 'Failed to update sequence.' }
    });
  }
});

// 6. Delete a campaign
campaignsRouter.delete('/campaigns/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const deleted = await campaignRepository.delete(id, workspaceId);

    if (!deleted) {
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
      data: { id, deleted: true },
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return res.status(200).json(response);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: { code: err.code || 'DATABASE_UNAVAILABLE', message: 'Failed to delete campaign.' }
    });
  }
});
