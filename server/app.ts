import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/error';
import { authenticateApiKeyOrJwt } from './middleware/auth';
import { healthRouter } from './routes/health';
import { companiesRouter } from './routes/companies';
import { prospectsRouter } from './routes/prospects';
import { signalsRouter } from './routes/signals';
import { researchRouter } from './routes/research';
import { pipelineRouter } from './routes/pipeline';
import { copilotRouter } from './routes/copilot';
import { jobsRouter } from './routes/jobs';
import { contactsRouter } from './routes/contacts';
import { leadsRouter } from './routes/leads';
import { savedSearchesRouter } from './routes/savedSearches';
import { campaignsRouter } from './routes/campaigns';
import { outreachRouter } from './routes/outreach';
import { tasksRouter } from './routes/tasks';
import { meetingsRouter } from './routes/meetings';
import { discoveryRouter } from './routes/discovery';
import { seoAuditRouter } from './routes/seoAudit';
import { competitorsRouter } from './routes/competitors';
import { opportunityScoringRouter } from './routes/opportunityScoring';
import { authRouter } from './routes/auth';
import { scraperRouter } from './routes/scraper';
import { emailIntegrationRouter } from './routes/emailIntegration';
import { leadIngestRouter } from './routes/leadIngest';
import { emailDiscoveryRouter } from './routes/emailDiscovery';
import { registerDefaultJobProviders } from './providers/jobs';

export const createApp = () => {
  registerDefaultJobProviders();

  const app = express();

  // Basic security & parsing middleware
  app.use(corsMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Global Auth / API Key inspector
  app.use(authenticateApiKeyOrJwt);

  // Mount Auth Endpoints
  app.use('/api/v1/auth', authRouter);
  app.use('/api/auth', authRouter);
  app.use('/v1/auth', authRouter);
  app.use('/auth', authRouter);

  // Mount API Endpoints under /api and root serverless aliases
  app.use('/api', healthRouter);
  app.use('/health', healthRouter);
  app.use('/api', companiesRouter);
  app.use('/api', prospectsRouter);
  app.use('/api', signalsRouter);
  app.use('/api', researchRouter);
  app.use('/api', pipelineRouter);
  app.use('/api', copilotRouter);
  app.use('/api', jobsRouter);
  app.use('/api', contactsRouter);
  app.use('/api', leadsRouter);
  app.use('/api', savedSearchesRouter);
  app.use('/api', campaignsRouter);
  app.use('/api', outreachRouter);
  app.use('/api', tasksRouter);
  app.use('/api', meetingsRouter);
  app.use('/api', discoveryRouter);
  app.use('/api', seoAuditRouter);
  app.use('/api', competitorsRouter);
  app.use('/api', opportunityScoringRouter);
  app.use('/api', scraperRouter);
  app.use('/api/v1', scraperRouter);
  app.use('/api', emailIntegrationRouter);
  app.use('/api/v1', emailIntegrationRouter);
  app.use('/api', leadIngestRouter);
  app.use('/api/v1', leadIngestRouter);
  app.use('/api', emailDiscoveryRouter);
  app.use('/api/v1', emailDiscoveryRouter);

  // Root fallback info
  app.get('/', (_req, res) => {
    res.json({
      service: 'huntiq-api',
      status: 'online',
      docs: '/api/health'
    });
  });

  // Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
