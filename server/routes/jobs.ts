import { Router } from 'express';
import type { Request, Response } from 'express';
import { supportedJobProviders, type JobProviderName } from '../providers/jobs/job-provider';
import { jobProviderRegistry } from '../providers/jobs/provider-registry';
import { jobIngestionService } from '../services/job-ingestion.service';

export const jobsRouter = Router();

jobsRouter.get('/job-sources', async (_req: Request, res: Response) => {
  const sources = await jobIngestionService.listSources();
  res.json({
    success: true,
    data: sources,
    meta: { total: sources.length, timestamp: new Date().toISOString() },
  });
});

jobsRouter.get('/job-providers', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: supportedJobProviders.map((provider) => ({ provider, configured: jobProviderRegistry.has(provider) })),
    meta: { timestamp: new Date().toISOString() },
  });
});

jobsRouter.post('/job-sources', async (req: Request, res: Response) => {
  const { provider, sourceUrl, companyIdentifier } = req.body ?? {};
  if (!supportedJobProviders.includes(provider) || typeof sourceUrl !== 'string' || !sourceUrl.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JOB_SOURCE', message: 'provider and sourceUrl are required.' },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  try {
    const source = await jobIngestionService.createSource({
      provider: provider as JobProviderName,
      sourceUrl: sourceUrl.trim(),
      companyIdentifier: typeof companyIdentifier === 'string' ? companyIdentifier.trim() : undefined,
    });
    return res.status(201).json({ success: true, data: source, meta: { timestamp: new Date().toISOString() } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create the job source.';
    return res.status(400).json({ success: false, error: { code: 'INVALID_JOB_SOURCE', message }, meta: { timestamp: new Date().toISOString() } });
  }
});

jobsRouter.post('/job-sources/:id/sync', async (req: Request, res: Response) => {
  const sourceId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const result = await jobIngestionService.syncSource(sourceId);
    return res.status(result.failed ? 502 : 200).json({ success: !result.failed, data: result, meta: { timestamp: new Date().toISOString() } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sync the job source.';
    const status = await jobIngestionService.getSource(sourceId) ? 409 : 404;
    return res.status(status).json({ success: false, error: { code: 'JOB_SYNC_UNAVAILABLE', message }, meta: { timestamp: new Date().toISOString() } });
  }
});
