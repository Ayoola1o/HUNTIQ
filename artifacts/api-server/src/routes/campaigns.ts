import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { createCampaignRepository } from '../repositories/campaigns';
import { createContactRepository } from '../repositories/contacts';
import { postgresPool } from '../database/connection';
import { EmailDispatchService } from '../services/emailDispatchService';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedRequest } from '../middleware/auth';

export const campaignsRouter = Router();
const campaignRepository = createCampaignRepository();
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i;
function isEmailStep(step: unknown): boolean {
  if (!step || typeof step !== 'object') return false;
  const { channel, title, contentSnippet, delayDays } = step as Record<string, unknown>;
  return channel === 'email' && typeof title === 'string' && Boolean(title.trim()) && !/[\r\n]/.test(title)
    && typeof contentSnippet === 'string' && Boolean(contentSnippet.trim())
    && typeof delayDays === 'number' && Number.isFinite(delayDays) && delayDays >= 0;
}

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
      opportunitiesCreated: campaigns.reduce((acc, c) => acc + (c.opportunitiesCount ?? c.opportunitiesCreated ?? 0), 0),
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

  if (typeof payload?.name !== 'string' || !payload.name.trim()) {
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
    const requestedIds: unknown = payload.contactIds ?? [];
    if (!Array.isArray(requestedIds) || requestedIds.some(id => typeof id !== 'string' || !id.trim())) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_RECIPIENTS', message: 'Select contacts from your workspace.' } });
    }
    const subject = typeof payload.subject === 'string' ? payload.subject.trim() : '';
    const body = typeof payload.body === 'string' ? payload.body.trim() : '';
    if (requestedIds.length && (!subject || !body || /[\r\n]/.test(subject))) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_SEQUENCE', message: 'An email subject and message are required.' } });
    }
    const selectedIds = new Set<string>(requestedIds);
    const selectedContacts = selectedIds.size && userId
      ? (await createContactRepository().listByUser(userId, workspaceId)).filter(contact => selectedIds.has(contact.id))
      : [];
    const emails = new Set<string>();
    const prospects = selectedContacts.flatMap(contact => {
      const email = contact.email.trim().toLowerCase();
      if (!emailPattern.test(email) || emails.has(email)) return [];
      emails.add(email);
      return [{
        id: contact.id,
        contactName: contact.name,
        contactRole: contact.role,
        companyName: contact.companyName,
        email,
        emailStatus: contact.verificationStatus === 'verified' ? 'verified' as const : 'unverified' as const,
        status: 'pending' as const,
        opportunityScore: contact.opportunityFitScore ?? 0,
        lastTouch: 'Awaiting launch'
      }];
    });
    if (prospects.length !== selectedIds.size) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_RECIPIENTS', message: 'Some contacts are unavailable or have invalid or duplicate email addresses. Reopen the draft form and select recipients again.' } });
    }
    const created = await campaignRepository.create({
      name: payload.name.trim(),
      description: typeof payload.description === 'string' ? payload.description : '',
      channel: 'email',
      status: 'draft',
      targetAudienceName: 'Selected workspace contacts',
      audienceCount: prospects.length,
      prospects,
      sequence: subject && body ? [{
        id: randomUUID(), stepNumber: 1, channel: 'email', title: subject, delayDays: 0, contentSnippet: body
      }] : []
    }, workspaceId, userId);

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

  if (status !== 'active' && status !== 'paused') {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_STATUS',
        message: 'Campaigns can only be queued or paused here.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  try {
    const campaign = await campaignRepository.getById(id, workspaceId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: { code: 'CAMPAIGN_NOT_FOUND', message: 'Campaign not found.' } });
    }
    if (campaign.status === status) return res.json({ success: true, data: campaign });
    if (status === 'active') {
      if ((campaign.status !== 'draft' && campaign.status !== 'paused') || campaign.channel !== 'email'
          || !campaign.prospects.length || campaign.prospects.some(p => !emailPattern.test(p.email ?? ''))
          || !campaign.sequence.length || campaign.sequence.some(step => !isEmailStep(step))) {
        return res.status(409).json({ success: false, error: { code: 'CAMPAIGN_NOT_READY', message: 'An email campaign needs valid recipients and a complete email sequence before it can be queued.' } });
      }
      if (!postgresPool || !(await EmailDispatchService.hasLiveProvider(workspaceId))) {
        return res.status(409).json({ success: false, error: { code: 'DELIVERY_UNAVAILABLE', message: 'Connect a live email provider and database before queuing delivery.' } });
      }
    } else if (campaign.status !== 'active') {
      return res.status(409).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Only an active campaign can be paused.' } });
    }
    const updated = await campaignRepository.update(id, { status }, workspaceId, campaign.status);

    if (!updated) {
      const errorResponse: ApiResponse = {
        success: false,
        error: {
          code: 'CAMPAIGN_CHANGED',
          message: 'Campaign status changed. Refresh and try again.'
        }
      };
      return res.status(409).json(errorResponse);
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

  if (!Array.isArray(sequence) || !sequence.length || sequence.some(step => !isEmailStep(step))) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_SEQUENCE',
        message: 'Sequence must contain valid email steps.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  try {
    const updated = await campaignRepository.update(id, { sequence }, workspaceId, 'draft');

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

// 7. Execute next step for a specific prospect
campaignsRouter.post('/campaigns/:id/prospects/:prospectId/execute-step', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const prospectId = Array.isArray(req.params.prospectId) ? req.params.prospectId[0] : req.params.prospectId;

  try {
    const { CampaignExecutionService } = await import('../services/campaignExecutionService');
    const result = await CampaignExecutionService.executeNextStepForProspect(workspaceId, campaignId, prospectId);

    return res.status(200).json({
      success: result.executed,
      data: result,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'EXECUTION_FAILED', message: err.message }
    });
  }
});

// 8. Process all due campaign steps across active campaigns
campaignsRouter.post('/campaigns/process-due', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  try {
    const { CampaignExecutionService } = await import('../services/campaignExecutionService');
    const result = await CampaignExecutionService.processDueCampaignSteps(workspaceId);

    return res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'PROCESS_DUE_FAILED', message: err.message }
    });
  }
});

// 9. Recover stale or abandoned sending records
campaignsRouter.post('/campaigns/recover-stale', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  try {
    const { CampaignExecutionService } = await import('../services/campaignExecutionService');
    const result = await CampaignExecutionService.recoverStaleSendingRecords(workspaceId);

    return res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'RECOVERY_FAILED', message: err.message }
    });
  }
});

