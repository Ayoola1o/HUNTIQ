import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { db } from '../db/memoryStore';
import { HiringSignalEngine } from '../engine';
import type { AuthenticatedRequest } from '../middleware/auth';

export const signalsRouter = Router();

/**
 * GET /api/signals
 * Lists buying signals with attached evidence
 */
signalsRouter.get('/signals', (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-main';
  const type = req.query.type as string | undefined;
  const companyId = req.query.companyId as string | undefined;

  let list = db.signals.filter(s => s.workspaceId === workspaceId);

  if (type && type !== 'all') {
    list = list.filter(s => s.type.toLowerCase() === type.toLowerCase());
  }

  if (companyId) {
    list = list.filter(s => s.companyId === companyId);
  }

  // Attach evidence to each signal
  const enriched = list.map(s => ({
    ...s,
    company: db.getCompanyById(s.companyId, workspaceId),
    evidence: db.getEvidenceBySignal(s.id, workspaceId)
  }));

  const response: ApiResponse = {
    success: true,
    data: enriched,
    meta: {
      total: enriched.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

/**
 * POST /api/signals/generate
 * Generates signals and verifiable evidence for a company based on its jobs
 */
signalsRouter.post('/signals/generate', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-main';
  const { companyId } = req.body || {};

  if (!companyId) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_COMPANY_ID', message: 'companyId is required to generate signals.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const company = db.getCompanyById(companyId, workspaceId);
  if (!company) {
    return res.status(404).json({
      success: false,
      error: { code: 'COMPANY_NOT_FOUND', message: `Company '${companyId}' was not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const jobs = db.getJobsByCompany(companyId, workspaceId);
  const bundles = HiringSignalEngine.generateSignals(company, jobs);

  const generatedSignals = [];

  for (const bundle of bundles) {
    const signalId = `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const signalRecord = {
      ...bundle.signal,
      id: signalId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.signals.push(signalRecord);

    const evidenceList = [];
    for (const ev of bundle.evidence) {
      const evRecord = {
        ...ev,
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        signalId,
        createdAt: new Date().toISOString()
      };
      db.evidence.push(evRecord);
      evidenceList.push(evRecord);
    }

    generatedSignals.push({
      signal: signalRecord,
      evidence: evidenceList,
      rationale: bundle.rationale,
      opportunityImpact: bundle.opportunityImpact
    });
  }

  res.status(200).json({
    success: true,
    data: {
      company,
      generatedCount: generatedSignals.length,
      signals: generatedSignals
    },
    meta: { timestamp: new Date().toISOString() }
  });
});

/**
 * GET /api/signals/:companyId
 * Retrieves all signals and proof evidence for a specific company
 */
signalsRouter.get('/signals/:companyId', (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-main';
  const { companyId } = req.params;

  const signals = db.getSignalsByCompany(companyId, workspaceId).map(s => ({
    ...s,
    evidence: db.getEvidenceBySignal(s.id, workspaceId)
  }));

  res.status(200).json({
    success: true,
    data: signals,
    meta: { timestamp: new Date().toISOString() }
  });
});
