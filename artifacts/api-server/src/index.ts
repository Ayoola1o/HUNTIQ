import { createApp } from './app';
import { config, validateProductionConfig } from './config/env';
import { GmailReplySyncService } from './services/gmailReplySyncService';

// Fail fast in standalone production server if required configuration is missing
validateProductionConfig();

const app = createApp();

app.listen(config.port, () => {
  console.log(`[HUNTIQ-API] Server running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`[HUNTIQ-API] Health Telemetry: http://localhost:${config.port}/api/health`);

  // Background recurring Gmail Watch renewal (runs on boot and every 6 hours)
  const WATCH_RENEWAL_INTERVAL_MS = 6 * 60 * 60 * 1000;
  GmailReplySyncService.checkAndRenewAllWatches().catch(err => {
    console.warn('[WATCH_RENEWAL] Initial check notice:', err.message);
  });
  const watchRenewalTimer = setInterval(() => {
    GmailReplySyncService.checkAndRenewAllWatches().catch(err => {
      console.warn('[WATCH_RENEWAL] Periodic check notice:', err.message);
    });
  }, WATCH_RENEWAL_INTERVAL_MS);
  watchRenewalTimer.unref();
});
