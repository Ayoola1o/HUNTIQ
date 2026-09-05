import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { db } from '../db/memoryStore';
import { HiringSignalEngine } from '../engine';
import type { AuthenticatedRequest } from '../middleware/auth';
import { createSignalRepository } from '../repositories/signals';
import { createCompanyRepository } from '../repositories/companies';

export const signalsRouter = Router();

/**
 * GET /api/signals
 * Lists buying signals with attached evidence
 */
signalsRouter.get('/signals', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-main';
  const type = req.query.type as string | undefined;
  const companyId = req.query.companyId as string | undefined;

  const signalRepo = createSignalRepository();
  const companyRepo = createCompanyRepository();

  let signals: any[] = [];
  try {
    if (companyId) {
      signals = await signalRepo.findByCompanyId(companyId, workspaceId);
    } else if (type && type !== 'all') {
      signals = await signalRepo.findByType(type, workspaceId);
    } else {
      signals = await signalRepo.list(50, 0, workspaceId);
    }
  } catch {
    signals = [];
  }

  // Fallback to memory store if repository returns empty
  if (signals.length === 0) {
    let list = db.signals.filter(s => s.workspaceId === workspaceId);
    if (type && type !== 'all') {
      list = list.filter(s => s.type.toLowerCase() === type.toLowerCase());
    }
    if (companyId) {
      list = list.filter(s => s.companyId === companyId);
    }
    signals = list;
  }

  // Attach evidence and company to each signal
  const enriched = await Promise.all(signals.map(async s => {
    let comp: any = null;
    try {
      comp = await companyRepo.getById(s.companyId, workspaceId);
    } catch {
      comp = null;
    }
    if (!comp) {
      comp = db.getCompanyById(s.companyId, workspaceId);
    }

    return {
      ...s,
      company: comp,
      evidence: db.getEvidenceBySignal(s.id, workspaceId)
    };
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

  const companyRepo = createCompanyRepository();
  const signalRepo = createSignalRepository();

  let company: any = null;
  try {
    company = await companyRepo.getById(companyId, workspaceId);
  } catch {
    company = null;
  }
  if (!company) {
    company = db.getCompanyById(companyId, workspaceId);
  }

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
      workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.signals.push(signalRecord);

    try {
      await signalRepo.create({
        workspaceId,
        companyId,
        type: bundle.signal.type,
        title: bundle.signal.title,
        summary: bundle.signal.summary,
        strength: bundle.signal.strength as any,
        confidence: bundle.signal.confidence,
        detectedAt: new Date(),
        metadata: {
          rationale: bundle.rationale,
          opportunityImpact: bundle.opportunityImpact
        }
      });
    } catch {
      // InMemory fallback
    }

    const evidenceList = [];
    for (const ev of bundle.evidence) {
      const evRecord = {
        ...ev,
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        signalId,
        workspaceId,
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
signalsRouter.get('/signals/:companyId', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-main';
  const { companyId } = req.params;

  const signalRepo = createSignalRepository();
  let signals: any[] = [];
  try {
    signals = await signalRepo.findByCompanyId(companyId, workspaceId);
  } catch {
    signals = [];
  }

  if (signals.length === 0) {
    signals = db.getSignalsByCompany(companyId, workspaceId);
  }

  const enriched = signals.map(s => ({
    ...s,
    evidence: db.getEvidenceBySignal(s.id, workspaceId)
  }));

  res.status(200).json({
    success: true,
    data: enriched,
    meta: { timestamp: new Date().toISOString() }
  });
});
