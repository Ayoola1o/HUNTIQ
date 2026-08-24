import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { db } from '../db/memoryStore';
import { ingestionEngine, JobNormalizer } from '../engine';
import { jobService } from '../services/jobService';
import { companyService } from '../services/companyService';
import type { AuthenticatedRequest } from '../middleware/auth';

export const jobsRouter = Router();

/**
 * POST /api/jobs/sync
 * Live job ingestion from Greenhouse / Lever / Ashby.
 */
jobsRouter.post('/jobs/sync', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-main';
  const { companyId, domain, companyName, provider, boardToken } = req.body || {};

  try {
    let targetCompany = companyId ? db.getCompanyById(companyId, workspaceId) : undefined;

    if (!targetCompany && domain) {
      targetCompany = db.getCompanyByDomain(domain, workspaceId);
    }

    // Auto-resolve company if not in database
    if (!targetCompany) {
      const resolvedName = companyName || (domain ? domain.split('.')[0] : boardToken || 'Target Account');
      const resolvedDomain = domain || (boardToken ? `${boardToken}.com` : 'company.com');

      targetCompany = await companyService.upsertCompany(workspaceId, {
        name: resolvedName.charAt(0).toUpperCase() + resolvedName.slice(1),
        domain: resolvedDomain,
        city: 'Lagos',
        industry: 'Technology & FinTech'
      });
    }

    // Ensure JobSource exists
    let source = db.jobSources.find(s => s.companyId === targetCompany.id);
    if (!source) {
      source = {
        id: `source-${Date.now()}`,
        workspaceId,
        companyId: targetCompany.id,
        provider: provider || 'GREENHOUSE',
        sourceType: 'ATS_API',
        sourceUrl: `https://boards.greenhouse.io/${boardToken || targetCompany.domain.split('.')[0]}`,
        companyIdentifier: boardToken || targetCompany.domain.split('.')[0],
        syncStatus: 'SUCCESS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.jobSources.push(source);
    }

    // Execute live ingestion & signal generation
    const syncResult = await ingestionEngine.syncCompanyJobs(targetCompany.id, workspaceId);
    const velocity = await jobService.calculateHiringVelocity(targetCompany.id, workspaceId);

    const response: ApiResponse = {
      success: true,
      data: {
        company: targetCompany,
        jobsIngested: syncResult.jobsCount,
        signalsGenerated: syncResult.signalsGenerated,
        leadsGenerated: syncResult.leadsGenerated,
        velocity
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    res.status(200).json(response);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'JOB_SYNC_ERROR',
        message: err.message || 'Failed to sync external jobs.'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  }
});

/**
 * GET /api/jobs
 * Query jobs with filters
 */
jobsRouter.get('/jobs', (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-main';
  const { companyId, department, seniority, remote, status } = req.query as Record<string, string | undefined>;

  let list = db.jobs.filter(j => j.workspaceId === workspaceId);

  if (companyId) {
    list = list.filter(j => j.companyId === companyId);
  }
  if (department && department !== 'All') {
    list = list.filter(j => j.department?.toLowerCase().includes(department.toLowerCase()));
  }
  if (seniority && seniority !== 'All') {
    list = list.filter(j => j.seniority?.toLowerCase() === seniority.toLowerCase());
  }
  if (remote === 'true') {
    list = list.filter(j => j.remote);
  }
  if (status) {
    list = list.filter(j => j.status?.toLowerCase() === status.toLowerCase());
  }

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
 * GET /api/jobs/velocity/:companyId
 * Compute real-time hiring acceleration & velocity metrics
 */
jobsRouter.get('/jobs/velocity/:companyId', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-main';
  const { companyId } = req.params;

  const velocity = await jobService.calculateHiringVelocity(companyId, workspaceId);

  res.status(200).json({
    success: true,
    data: velocity,
    meta: { timestamp: new Date().toISOString() }
  });
});

/**
 * POST /api/jobs/normalize
 * Real-time job title and description normalization runner
 */
jobsRouter.post('/jobs/normalize', (req: Request, res: Response) => {
  const { title, department, location, content, url } = req.body || {};

  if (!title) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_TITLE', message: 'Job title is required to normalize.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const normalized = JobNormalizer.normalize({
    title,
    department,
    location,
    content,
    url
  });

  res.status(200).json({
    success: true,
    data: normalized,
    meta: { timestamp: new Date().toISOString() }
  });
});
