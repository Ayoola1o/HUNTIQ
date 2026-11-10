import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { createLeadRepository } from '../repositories/leads';
import { createCompanyRepository } from '../repositories/companies';
import { serverScoringEngine } from '../engine/scoringEngine';
import { AutomaticLeadEngine } from '../engine/leads/automaticLeadEngine';
import { leadService } from '../services/leadService';
import { postgresPool } from '../database/connection';
import type { AuthenticatedRequest } from '../middleware/auth';

export const leadsRouter = Router();
const leadRepository = createLeadRepository();
const companyRepository = createCompanyRepository();

/**
 * GET /api/leads
 * Query qualified leads
 */
leadsRouter.get('/leads', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }
  const { status } = req.query as { status?: string };

  try {
    const list = await leadService.listLeads(workspaceId, status);
    // Discovery leads are persisted directly so the evidence and lead can be saved in one transaction.
    const persisted = postgresPool ? await postgresPool.query<typeof list[number]>(`
      SELECT l.id, l.workspace_id AS "workspaceId", l.company_id AS "companyId",
             l.contact_id AS "contactId", l.signal_id AS "signalId", l.score,
             'Tier 3' AS tier, l.status, 'RESEARCH_360' AS source, l.reason, l.summary,
             l.created_at AS "createdAt", l.updated_at AS "updatedAt"
      FROM leads l
      WHERE l.workspace_id = $1 AND ($2::text IS NULL OR l.status = $2)
        AND EXISTS (
          SELECT 1 FROM research_reports r
          WHERE r.workspace_id = l.workspace_id AND r.dossier_data->>'kind' = 'grounded-360'
            AND r.dossier_data->>'leadId' = l.id::text
        )
      ORDER BY l.created_at DESC
    `, [workspaceId, status && status !== 'ALL' ? status : null]) : null;
    const combined = new Map([...list, ...(persisted?.rows || [])].map(lead => [lead.id, lead]));
    return res.status(200).json({
      success: true,
      data: [...combined.values()].sort((a, b) => b.score - a.score),
      meta: { total: combined.size, timestamp: new Date().toISOString() }
    });
  } catch {
    return res.status(503).json({ success: false, error: { code: 'LEADS_UNAVAILABLE', message: 'Could not load leads.' } });
  }
});

/**
 * POST /api/leads/evaluate
 * Evaluate company, score opportunity, and auto-generate lead & pipeline deal if threshold met
 */
leadsRouter.post('/leads/evaluate', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }
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

  let lead: any = await leadRepository.findById(companyId, workspaceId);

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
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

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
      error: { code: 'AUTO_QUALIFY_ERROR', message: 'Failed to run automatic lead qualification.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }
});

/**
 * POST /api/leads/:id/promote
 * Promotes a lead directly to the active CRM pipeline
 */
leadsRouter.post('/leads/:id/promote', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }
  const { id } = req.params;
  const { customDealValue } = req.body || {};

  try {
    const deal = await AutomaticLeadEngine.promoteLeadToPipeline(id as string, workspaceId, customDealValue);

    res.status(200).json({
      success: true,
      data: deal,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'PROMOTE_ERROR', message: 'Failed to promote lead to pipeline.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }
});

/**
 * PATCH /api/leads/:id/status
 * Updates lead status
 */
leadsRouter.patch('/leads/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }
  const { id } = req.params;
  const { status } = req.body || {};

  const lead = await leadRepository.updateStatus(id as string, status, workspaceId);
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
