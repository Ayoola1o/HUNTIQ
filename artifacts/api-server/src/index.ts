import { createApp } from './app';
import { config, validateProductionConfig } from './config/env';
import { SchedulerService } from './services/schedulerService';

const isServerless = Boolean(process.env.VERCEL);

export const app = createApp();

if (!isServerless) {
  // Fail fast in standalone production server if required configuration is missing
  validateProductionConfig();

  const server = app.listen(config.port, () => {
    console.log(`[HUNTIQ-API] Server running on port ${config.port} in ${config.nodeEnv} mode`);
    console.log(`[HUNTIQ-API] Health Telemetry: http://localhost:${config.port}/api/health`);

    // Start production background scheduler (watch renewals + campaign steps)
    SchedulerService.start();
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('[HUNTIQ-API] Shutting down gracefully...');
    SchedulerService.stop();
    server.close(() => {
      console.log('[HUNTIQ-API] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export { createApp };
export default app;
