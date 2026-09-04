import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import type { PipelineDealItem } from '../../src/types/pipeline';
import type { AuthenticatedRequest } from '../middleware/auth';
import { persistentStore, DEFAULT_USER_ID, DEFAULT_WORKSPACE_ID } from '../db/persistentStore';

export const pipelineRouter = Router();

// Backward compatibility bridge for autonomous engines
export const pipelineDealsDb: any = new Proxy([] as any[], {
  get(target, prop) {
    const deals = persistentStore.getPipelineDealsByUser(DEFAULT_USER_ID, DEFAULT_WORKSPACE_ID);
    if (prop === 'unshift' || prop === 'push') {
      return (deal: any) => {
        return persistentStore.savePipelineDeal(DEFAULT_USER_ID, DEFAULT_WORKSPACE_ID, deal);
      };
    }
    if (prop === 'length') {
      return deals.length;
    }
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      return deals[Number(prop)];
    }
    const val = Reflect.get(deals, prop);
    return typeof val === 'function' ? val.bind(deals) : val;
  }
});

pipelineRouter.get('/pipeline', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || DEFAULT_USER_ID;
  const workspaceId = req.user?.workspaceId || DEFAULT_WORKSPACE_ID;
  const userDeals = persistentStore.getPipelineDealsByUser(userId, workspaceId);

  const totalValue = userDeals.reduce((acc, d) => acc + (d.dealValue || 0), 0);
  const weightedValue = userDeals.reduce((acc, d) => acc + (d.dealValue * (d.probability / 100)), 0);
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

pipelineRouter.get('/pipeline/deals', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || DEFAULT_USER_ID;
  const workspaceId = req.user?.workspaceId || DEFAULT_WORKSPACE_ID;
  const userDeals = persistentStore.getPipelineDealsByUser(userId, workspaceId);

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

pipelineRouter.post('/pipeline/deals', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || DEFAULT_USER_ID;
  const workspaceId = req.user?.workspaceId || DEFAULT_WORKSPACE_ID;
  const ownerName = req.user?.fullName || 'Pipeline Lead';

  const newDeal: PipelineDealItem = {
    id: req.body.id || `deal-${Date.now()}`,
    companyName: req.body.companyName || 'Target Account',
    domain: req.body.domain || 'domain.com',
    dealTitle: req.body.dealTitle || 'Strategic Opportunity',
    serviceName: req.body.serviceName || 'Consulting',
    dealValue: Number(req.body.dealValue) || 20000,
    probability: Number(req.body.probability) || 50,
    opportunityScore: Number(req.body.opportunityScore) || 85,
    stage: req.body.stage || 'contacted',
    stageEnteredAt: 'Just now',
    expectedCloseDate: req.body.expectedCloseDate || 'In 30 days',
    ownerName: req.body.ownerName || ownerName,
    contactName: req.body.contactName || 'Executive Lead',
    contactRole: req.body.contactRole || 'Decision Maker',
    contactAvatarBg: '#eff6ff',
    contactAvatarColor: '#1d4ed8',
    lastActivity: 'Added via HUNTIQ Backend API',
    nextAction: 'Send introductory message',
    nextActionDueDate: 'Tomorrow',
    priority: 'High',
    activities: []
  };

  const saved = persistentStore.savePipelineDeal(userId, workspaceId, newDeal);

  res.status(201).json({
    success: true,
    data: saved,
    meta: { timestamp: new Date().toISOString() }
  });
});

pipelineRouter.patch('/pipeline/deals/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id || DEFAULT_USER_ID;
  const workspaceId = req.user?.workspaceId || DEFAULT_WORKSPACE_ID;

  const existing = persistentStore.getPipelineDealById(id, userId);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { code: 'DEAL_NOT_FOUND', message: `Deal with ID '${id}' was not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const updated: PipelineDealItem = {
    ...existing,
    ...req.body,
    stageEnteredAt: req.body.stage && req.body.stage !== existing.stage ? 'Just now' : existing.stageEnteredAt
  };

  const saved = persistentStore.savePipelineDeal(userId, workspaceId, updated);

  res.status(200).json({
    success: true,
    data: saved,
    meta: { timestamp: new Date().toISOString() }
  });
});

pipelineRouter.delete('/pipeline/deals/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id || DEFAULT_USER_ID;

  const deleted = persistentStore.deletePipelineDeal(userId, id);
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
