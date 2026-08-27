import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import type { PipelineDealItem } from '../../src/types/pipeline';

export const pipelineRouter = Router();

// In-memory mock database store for development
export let pipelineDealsDb: PipelineDealItem[] = [
  {
    id: 'deal-1',
    companyName: 'Acme Technologies',
    domain: 'acme.io',
    dealTitle: 'Enterprise Talent Scaling & Mgmt',
    serviceName: 'HR Advisory Suite',
    dealValue: 25000,
    probability: 75,
    opportunityScore: 94,
    stage: 'proposal',
    stageEnteredAt: '2 days ago',
    expectedCloseDate: 'Aug 30, 2026',
    ownerName: 'Ayoola Ade',
    contactName: 'Jane Smith',
    contactRole: 'Head of People',
    contactAvatarBg: '#eff6ff',
    contactAvatarColor: '#1d4ed8',
    lastActivity: 'Proposal sent yesterday',
    nextAction: 'Executive follow-up call',
    nextActionDueDate: 'Tomorrow, 2 PM',
    priority: 'High',
    activities: []
  },
  {
    id: 'deal-2',
    companyName: 'FinServe Ltd',
    domain: 'finserve.africa',
    dealTitle: 'Regional Expansion Advisory',
    serviceName: 'Expansion Strategy',
    dealValue: 35000,
    probability: 60,
    opportunityScore: 91,
    stage: 'meeting',
    stageEnteredAt: '4 days ago',
    expectedCloseDate: 'Sep 15, 2026',
    ownerName: 'Ayoola Ade',
    contactName: 'Michael Okoro',
    contactRole: 'HR Director',
    contactAvatarBg: '#fef3c7',
    contactAvatarColor: '#b45309',
    lastActivity: 'Discovery call held',
    nextAction: 'Draft custom scoping deck',
    nextActionDueDate: 'Thursday',
    priority: 'High',
    activities: []
  }
];

pipelineRouter.get('/pipeline/deals', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: pipelineDealsDb,
    meta: {
      total: pipelineDealsDb.length,
      timestamp: new Date().toISOString()
    }
  };
  res.status(200).json(response);
});

pipelineRouter.post('/pipeline/deals', (req: Request, res: Response) => {
  const newDeal: PipelineDealItem = {
    id: `deal-${Date.now()}`,
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
    ownerName: 'Ayoola Ade',
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

  pipelineDealsDb.unshift(newDeal);

  res.status(201).json({
    success: true,
    data: newDeal,
    meta: { timestamp: new Date().toISOString() }
  });
});

pipelineRouter.patch('/pipeline/deals/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = pipelineDealsDb.findIndex(d => d.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'DEAL_NOT_FOUND', message: `Deal with ID '${id}' was not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  pipelineDealsDb[index] = {
    ...pipelineDealsDb[index],
    ...req.body,
    stageEnteredAt: req.body.stage ? 'Just now' : pipelineDealsDb[index].stageEnteredAt
  };

  res.status(200).json({
    success: true,
    data: pipelineDealsDb[index],
    meta: { timestamp: new Date().toISOString() }
  });
});
