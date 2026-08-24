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

  // Mount API Endpoints under /api
  app.use('/api', healthRouter);
  app.use('/api', companiesRouter);
  app.use('/api', prospectsRouter);
  app.use('/api', signalsRouter);
  app.use('/api', researchRouter);
  app.use('/api', pipelineRouter);
  app.use('/api', copilotRouter);
  app.use('/api', jobsRouter);
  app.use('/api', contactsRouter);
  app.use('/api', leadsRouter);

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
