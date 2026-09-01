import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { researchEngine } from '../../src/engine/researchEngine';
import { researchService } from '../services/researchService';

export const researchRouter = Router();

/**
 * GET /api/research/reports
 * List company research reports with status and search filtering + KPI summary
 */
researchRouter.get('/research/reports', (req: Request, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);

  const { reports, kpiSummary } = researchService.listReports({ status, query });

  const response: ApiResponse = {
    success: true,
    data: {
      reports,
      kpiSummary
    },
    meta: {
      total: reports.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

/**
 * GET /api/research/reports/:id
 * Retrieve a specific research report
 */
researchRouter.get('/research/reports/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const report = researchService.getById(id);

  if (!report) {
    return res.status(404).json({
      success: false,
      error: { code: 'REPORT_NOT_FOUND', message: `Research report with ID '${id}' was not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  res.status(200).json({
    success: true,
    data: report,
    meta: { timestamp: new Date().toISOString() }
  });
});

/**
 * POST /api/research/reports
 * Generate a new deep research report for a target company
 */
researchRouter.post('/research/reports', (req: Request, res: Response) => {
  const { companyName, domain, industry } = req.body || {};

  if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_COMPANY_NAME', message: 'companyName is required to generate a report.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const report = researchService.generateReport(companyName.trim(), domain, industry);

  res.status(201).json({
    success: true,
    data: report,
    meta: { timestamp: new Date().toISOString() }
  });
});

/**
 * POST /api/research/reports/:id/refresh
 * Re-scan and refresh a research report
 */
researchRouter.post('/research/reports/:id/refresh', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const refreshed = researchService.refreshReport(id);

  if (!refreshed) {
    return res.status(404).json({
      success: false,
      error: { code: 'REPORT_NOT_FOUND', message: `Research report with ID '${id}' was not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  res.status(200).json({
    success: true,
    data: refreshed,
    meta: { timestamp: new Date().toISOString() }
  });
});

/**
 * PATCH /api/research/reports/:id
 * Update report status or details
 */
researchRouter.patch('/research/reports/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updated = researchService.updateReport(id, req.body || {});

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'REPORT_NOT_FOUND', message: `Research report with ID '${id}' was not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  res.status(200).json({
    success: true,
    data: updated,
    meta: { timestamp: new Date().toISOString() }
  });
});

/**
 * DELETE /api/research/reports/:id
 * Delete a research report
 */
researchRouter.delete('/research/reports/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = researchService.deleteReport(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: { code: 'REPORT_NOT_FOUND', message: `Research report with ID '${id}' was not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  res.status(200).json({
    success: true,
    data: { id, deleted: true },
    meta: { timestamp: new Date().toISOString() }
  });
});

/**
 * POST /api/research/generate (Legacy dossier)
 */
researchRouter.post('/research/generate', (req: Request, res: Response) => {
  const { companyName } = req.body || {};

  if (!companyName) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_COMPANY_NAME',
        message: 'companyName is required to generate a research brief.'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const dossier = researchEngine.generateDossier(companyName);

  res.status(200).json({
    success: true,
    data: dossier,
    meta: { timestamp: new Date().toISOString() }
  });
});
