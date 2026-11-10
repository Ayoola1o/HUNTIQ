import { Router } from 'express';
import type { Request, Response } from 'express';
import type { PoolClient } from 'pg';
import type { ApiResponse } from '../types/api';
import { researchEngine } from '../engine-client/researchEngine';
import { researchService } from '../services/researchService';
import type { AuthenticatedRequest } from '../middleware/auth';
import { groundedSearch, mobilePerformance, publicDomain } from '../services/liveDiscovery';
import { postgresPool } from '../database/connection';

export const researchRouter = Router();

researchRouter.post('/research/discover', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.workspaceId) return res.status(401).json({ error: { message: 'Sign in to use Web Discovery.' } });
  const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
  if (!query || query.length > 350) return res.status(400).json({ error: { message: 'Enter a search of up to 350 characters.' } });
  try {
    const result = await groundedSearch(
      'Find up to six matching businesses using only the provided web search results. Resolve each to its official public domain; omit uncertain matches. Consider physical and online businesses, blogs, newsletters and ecommerce. Do not claim a requested weakness is present until investigated. Output only one line per business as name | domain | short reason. Return no heading or markdown.',
      query
    );
    const candidates = new Map<string, { name: string; domain: string; reason: string }>();
    const returnedDomains = new Set(result.sources.map(source => new URL(source.url).hostname.replace(/^www\./, '')));
    for (const line of result.text.split('\n')) {
      const [name, rawDomain, reason] = line.split('|').map(value => value.trim().replace(/\*\*/g, ''));
      const domain = publicDomain(rawDomain);
      if (domain && returnedDomains.has(domain) && name && reason && candidates.size < 6) candidates.set(domain, { name, domain, reason });
    }
    return res.json({ data: { candidates: [...candidates.values()], sources: result.sources } });
  } catch (error: any) {
    return res.status(error.statusCode || 502).json({ error: { message: error.statusCode ? error.message : 'Web Discovery did not complete. Try again.' } });
  }
});

researchRouter.post('/research/360', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  const userId = req.user?.id;
  if (!workspaceId || !userId) return res.status(401).json({ error: { message: 'Sign in to run 360 Research.' } });
  const domain = publicDomain(req.body?.domain);
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 180) : '';
  if (!name || !domain || req.body?.confirmed !== true) {
    return res.status(400).json({ error: { message: 'Confirm the business name and its official public domain.' } });
  }
  try {
    const [report, performance] = await Promise.all([
      groundedSearch(
        'Build a concise 360 report for the exact official domain supplied. Cite dated primary sources. Use headings for Identity and public business contacts, Website and conversion, Comparable competitors, Three opportunities, and Industry scenarios. Distinguish observed facts from inferences and future scenarios. If sources disagree on the company identity, say so and do not mix them. Treat page speed as unmeasured; HUNTIQ adds an independent measurement. Do not invent contact information, private metrics, or quotes. If there is too little evidence for a forecast, say so. End with one short suggested outreach observation that is supported by evidence.',
        `${name} ${domain} official business website, services and public contacts`
      ),
      mobilePerformance(domain)
    ]);
    const dossier = { kind: 'grounded-360', name, domain, ...report, performance, checkedAt: new Date().toISOString() };
    const saved = postgresPool && process.env.DISCOVERY_EVIDENCE_STORAGE_ENABLED === 'true'
      ? await postgresPool.query('INSERT INTO research_reports (workspace_id, user_id, company_name, domain, dossier_data) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [workspaceId, userId, name, domain, JSON.stringify(dossier)])
      : null;
    return res.json({ data: { ...dossier, id: saved?.rows[0].id ?? null } });
  } catch (error: any) {
    return res.status(error.statusCode || 502).json({ error: { message: error.statusCode ? error.message : 'The 360 report could not be completed or saved.' } });
  }
});

researchRouter.get('/research/360', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  const userId = req.user?.id;
  if (!workspaceId || !userId) return res.status(401).json({ error: { message: 'Sign in to view reports.' } });
  if (!postgresPool) return res.json({ data: [] });
  try {
    const { rows } = await postgresPool.query(
      "SELECT id, dossier_data FROM research_reports WHERE workspace_id = $1 AND user_id = $2 AND dossier_data->>'kind' = 'grounded-360' ORDER BY created_at DESC LIMIT 12",
      [workspaceId, userId]
    );
    return res.json({ data: rows.map(row => ({ ...row.dossier_data, id: row.id })) });
  } catch {
    return res.status(503).json({ error: { message: 'Saved 360 reports are temporarily unavailable.' } });
  }
});

researchRouter.post('/research/360/:id/lead', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  const userId = req.user?.id;
  if (!workspaceId || !userId) return res.status(401).json({ error: { message: 'Sign in to save a lead.' } });
  if (!postgresPool) return res.status(503).json({ error: { message: 'Lead storage is unavailable.' } });
  if (process.env.DISCOVERY_EVIDENCE_STORAGE_ENABLED !== 'true') {
    return res.status(503).json({ error: { message: 'Saving discovery evidence is disabled.' } });
  }
  const id = String(req.params.id);
  const observation = typeof req.body?.observation === 'string' ? req.body.observation.trim().slice(0, 2000) : '';
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id) || !observation) {
    return res.status(400).json({ error: { message: 'Select a saved report and add a verified observation first.' } });
  }
  let client: PoolClient | undefined;
  try {
    client = await postgresPool.connect();
    await client.query('BEGIN');
    const { rows } = await client.query(
      "SELECT company_name, domain, dossier_data FROM research_reports WHERE id = $1 AND workspace_id = $2 AND user_id = $3 AND dossier_data->>'kind' = 'grounded-360' FOR UPDATE",
      [id, workspaceId, userId]
    );
    const report = rows[0];
    if (!report) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: { message: 'Saved 360 report not found.' } });
    }
    let leadId = report.dossier_data.leadId;
    if (!leadId) {
      await client.query(
        'INSERT INTO companies (workspace_id, name, domain, website) VALUES ($1, $2, $3, $4) ON CONFLICT (workspace_id, domain) DO NOTHING',
        [workspaceId, report.company_name, report.domain, `https://${report.domain}/`]
      );
      const company = await client.query('SELECT id FROM companies WHERE workspace_id = $1 AND domain = $2', [workspaceId, report.domain]);
      const sources = (report.dossier_data.sources as { url: string }[]).map(source => source.url);
      if (report.dossier_data.performance?.status === 'measured') sources.push(report.dossier_data.performance.source);
      const lead = await client.query(
        "INSERT INTO leads (workspace_id, company_id, title, reason, summary, score, tier, status, deal_value, conversion_probability) VALUES ($1, $2, $3, $4, $5, 0, 'LOW', 'NEW', 0, 0) RETURNING id",
        [workspaceId, company.rows[0].id, report.company_name, 'Reviewed 360 research', [observation, ...sources].join('\n')]
      );
      leadId = lead.rows[0].id;
      await client.query("UPDATE research_reports SET dossier_data = jsonb_set(dossier_data, '{leadId}', to_jsonb($1::text)) WHERE id = $2 AND workspace_id = $3",
        [leadId, id, workspaceId]);
    }
    await client.query('COMMIT');
    return res.json({ data: { leadId } });
  } catch {
    await client?.query('ROLLBACK').catch(() => {});
    return res.status(503).json({ error: { message: 'The lead could not be saved. Your research report is still available.' } });
  } finally {
    client?.release();
  }
});

/**
 * GET /api/research/reports
 * List company research reports with status and search filtering + KPI summary
 */
researchRouter.get('/research/reports', (req: AuthenticatedRequest, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);

  const { reports, kpiSummary } = researchService.listReports({
    status,
    query,
    userId: req.user?.id,
    workspaceId: req.user?.workspaceId
  });

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
researchRouter.get('/research/reports/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const report = researchService.getById(id, req.user?.id, req.user?.workspaceId);

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
researchRouter.post('/research/reports', (req: AuthenticatedRequest, res: Response) => {
  const { companyName, domain, industry } = req.body || {};

  if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_COMPANY_NAME', message: 'companyName is required to generate a report.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const report = researchService.generateReport(
    companyName.trim(),
    domain,
    industry,
    req.user?.id,
    req.user?.workspaceId
  );

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
researchRouter.post('/research/reports/:id/refresh', (req: AuthenticatedRequest, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const refreshed = researchService.refreshReport(id, req.user?.id, req.user?.workspaceId);

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
researchRouter.patch('/research/reports/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updated = researchService.updateReport(id, req.body || {}, req.user?.id, req.user?.workspaceId);


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
researchRouter.delete('/research/reports/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = researchService.deleteReport(id, req.user?.id, req.user?.workspaceId);

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
  const { companyName } = (req.body as any) || {};

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
