import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import type { PipelineDealItem } from '../../src/types/pipeline';
import type { AuthenticatedRequest } from '../middleware/auth';
import { createPipelineRepository } from '../repositories/pipeline';
import { DEFAULT_USER_ID, DEFAULT_WORKSPACE_ID } from '../middleware/auth';

export const pipelineRouter = Router();
const pipelineRepository = createPipelineRepository();

// Backward compatibility bridge for autonomous engines
export const pipelineDealsDb: any = new Proxy([] as any[], {
  get(target, prop) {
    if (prop === 'unshift' || prop === 'push') {
      return (deal: any) => {
        return pipelineRepository.create(DEFAULT_USER_ID, DEFAULT_WORKSPACE_ID, deal);
      };
    }
    return Reflect.get(target, prop);
  }
});

pipelineRouter.get('/pipeline', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || DEFAULT_USER_ID;
  const workspaceId = req.user?.workspaceId || DEFAULT_WORKSPACE_ID;
  const userDeals = await pipelineRepository.listByUser(userId, workspaceId);

  const totalValue = userDeals.reduce((acc, d) => acc + (d.dealValue || 0), 0);
  const weightedValue = userDeals.reduce((acc, d) => acc + ((d.dealValue || 0) * ((d.probability || 50) / 100)), 0);
  const activeDeals = userDeals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;

  const response: ApiResponse = {
    success: true,
    data: {
      deals: userDeals,
      summary: {
        totalDeals: userDeals.length,
        activeDeals,
        pipelineValue: totalValue,
        expectedRevenue: Math.round(weightedValue),
        avgDealSize: userDeals.length > 0 ? Math.round(totalValue / userDeals.length) : 0,
        winRate: userDeals.length > 0 ? 72 : 0
      }
    },
    meta: {
      total: userDeals.length,
      timestamp: new Date().toISOString()
    }
  };
  res.status(200).json(response);
});

pipelineRouter.get('/pipeline/deals', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || DEFAULT_USER_ID;
  const workspaceId = req.user?.workspaceId || DEFAULT_WORKSPACE_ID;
  const userDeals = await pipelineRepository.listByUser(userId, workspaceId);

  const response: ApiResponse = {
    success: true,
    data: userDeals,
    meta: {
      total: userDeals.length,
      timestamp: new Date().toISOString()
    }
  };
  res.status(200).json(response);
});

pipelineRouter.post('/pipeline/deals', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || DEFAULT_USER_ID;
  const workspaceId = req.user?.workspaceId || DEFAULT_WORKSPACE_ID;

  const dealPayload: Partial<PipelineDealItem> = {
    id: req.body.id,
    company: req.body.company || req.body.companyName || 'Target Account',
    companyName: req.body.companyName || req.body.company || 'Target Account',
    domain: req.body.domain || 'domain.com',
    title: req.body.title || req.body.dealTitle || 'Strategic Opportunity',
    dealTitle: req.body.dealTitle || req.body.title || 'Strategic Opportunity',
    dealValue: Number(req.body.dealValue) || 20000,
    probability: Number(req.body.probability) || 50,
    priority: req.body.priority || 'Medium',
    stage: req.body.stage || 'Discovery',
    contactName: req.body.contactName || 'Executive Lead',
    contactRole: req.body.contactRole || 'Decision Maker',
    contactEmail: req.body.contactEmail || 'contact@prospect.com',
    expectedCloseDate: req.body.expectedCloseDate || 'In 30 days',
    lastActivity: req.body.lastActivity || 'Added via HUNTIQ Backend API',
    lastActivityType: req.body.lastActivityType || 'signal',
    nextAction: req.body.nextAction || 'Send introductory message',
    nextActionDueDate: req.body.nextActionDueDate || 'Tomorrow',
    notes: req.body.notes || '',
    website: req.body.website,
    revenue: req.body.revenue,
    linkedInUrl: req.body.linkedInUrl,
    source: req.body.source || 'AI_RADAR',
    opportunityType: req.body.opportunityType || 'HIGH_GROWTH',
    digitalGapScore: req.body.digitalGapScore,
    digitalAudit: req.body.digitalAudit,
    scoreFactors: req.body.scoreFactors,
    signals: req.body.signals || [],
    activities: req.body.activities || []
  };

  const saved = await pipelineRepository.create(userId, workspaceId, dealPayload);

  res.status(201).json({
    success: true,
    data: saved,
    meta: { timestamp: new Date().toISOString() }
  });
});

pipelineRouter.patch('/pipeline/deals/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id || DEFAULT_USER_ID;
  const workspaceId = req.user?.workspaceId || DEFAULT_WORKSPACE_ID;

  const existing = await pipelineRepository.getById(id, userId, workspaceId);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { code: 'DEAL_NOT_FOUND', message: `Deal with ID '${id}' was not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const saved = await pipelineRepository.update(id, userId, workspaceId, req.body);

  res.status(200).json({
    success: true,
    data: saved,
    meta: { timestamp: new Date().toISOString() }
  });
});

pipelineRouter.delete('/pipeline/deals/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id || DEFAULT_USER_ID;
  const workspaceId = req.user?.workspaceId || DEFAULT_WORKSPACE_ID;

  const deleted = await pipelineRepository.delete(id, userId, workspaceId);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: { code: 'DEAL_NOT_FOUND', message: `Deal with ID '${id}' was not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  res.status(200).json({
    success: true,
    message: 'Deal deleted successfully.',
    data: { id, deleted: true }
  });
});
