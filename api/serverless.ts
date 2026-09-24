import { createApp } from '../artifacts/api-server/src/app';

let app: any;
let initError: any = null;

try {
  app = createApp();
} catch (err: any) {
  initError = err;
  console.error('[HUNTIQ-API-BOOT] Server initialization error:', err);
}

export default function handler(req: any, res: any) {
  if (initError || !app) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: `Server failed to initialize: ${initError?.message || 'Unknown boot error'}. Please check environment variables.`,
      code: 'SERVER_INITIALIZATION_FAILED'
    }));
  }
  return app(req, res);
}

export { app };
