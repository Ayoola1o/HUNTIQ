import { createApp } from './app';
import { config } from './config/env';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[HUNTIQ-API] Server running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`[HUNTIQ-API] Health Telemetry: http://localhost:${config.port}/api/health`);
});
