import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { createLeadRepository } from '../repositories/leads';
import { createCompanyRepository } from '../repositories/companies';
import { serverScoringEngine } from '../engine/scoringEngine';
import { AutomaticLeadEngine } from '../engine/leads/automaticLeadEngine';
import { leadService } from '../services/leadService';
import type { AuthenticatedRequest } from '../middleware/auth';

export const leadsRouter = Router();
const leadRepository = createLeadRepository();
const companyRepository = createCompanyRepository();

/**
 * GET /api/leads
 * Query qualified leads
 */
leadsRouter.get('/leads', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const { status } = req.query as { status?: string };

  const list = await leadService.listLeads(workspaceId, status);

  res.status(200).json({
    success: true,
    data: list,
    meta: {
      total: list.length,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * POST /api/leads/evaluate
 * Evaluate company, score opportunity, and auto-generate lead & pipeline deal if threshold met
 */
leadsRouter.post('/leads/evaluate', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const { companyId } = req.body || {};

  if (!companyId) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_COMPANY_ID', message: 'companyId is required to evaluate.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const company = await companyRepository.getById(companyId, workspaceId);
  if (!company) {
    return res.status(404).json({
      success: false,
      error: { code: 'COMPANY_NOT_FOUND', message: `Company '${companyId}' not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const evaluation = serverScoringEngine.evaluate(
    company as any,
    [],
    [],
    []
  );

  let lead = await leadRepository.findById(companyId, workspaceId);

  if (!lead && evaluation.totalScore >= 75) {
    lead = await leadService.createLead(workspaceId, {
      companyId: company.id,
      score: evaluation.totalScore,
      tier: evaluation.tier,
      status: 'NEW',
      source: 'AUTONOMOUS_RADAR',
      reason: `${evaluation.keyDrivers.join(' • ')}`,
      summary: `${company.name} scored ${evaluation.totalScore}/100. ${evaluation.recommendedAction}`
    });
  }

  const response: ApiResponse = {
    success: true,
    data: {
      company,
      evaluation,
      lead: lead || null
    },
    meta: { timestamp: new Date().toISOString() }
  };

  res.status(200).json(response);
});

/**
 * POST /api/leads/auto-qualify
 * Runs autonomous qualification across all workspace accounts
 */
leadsRouter.post('/leads/auto-qualify', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';

  try {
    const result = await AutomaticLeadEngine.runAutoQualification(workspaceId);

    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'AUTO_QUALIFY_ERROR', message: err.message },
      meta: { timestamp: new Date().toISOString() }
    });
  }
});

/**
 * POST /api/leads/:id/promote
 * Promotes a lead directly to the active CRM pipeline
 */
leadsRouter.post('/leads/:id/promote', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const { id } = req.params;
  const { customDealValue } = req.body || {};

  try {
    const deal = await AutomaticLeadEngine.promoteLeadToPipeline(id, workspaceId, customDealValue);

    res.status(200).json({
      success: true,
      data: deal,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'PROMOTE_ERROR', message: err.message },
      meta: { timestamp: new Date().toISOString() }
    });
  }
});

/**
 * PATCH /api/leads/:id/status
 * Updates lead status
 */
leadsRouter.patch('/leads/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const { id } = req.params;
  const { status } = req.body || {};

  const lead = await leadRepository.updateStatus(id, status, workspaceId);
  if (!lead) {
    return res.status(404).json({
      success: false,
      error: { code: 'LEAD_NOT_FOUND', message: `Lead '${id}' not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  res.status(200).json({
    success: true,
    data: lead,
    meta: { timestamp: new Date().toISOString() }
  });
});
