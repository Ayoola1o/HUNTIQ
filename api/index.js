let app = null;
let initError = null;

try {
  const mod = await import('../artifacts/api-server/dist/index.mjs');
  app = mod.app || mod.default;
} catch (err) {
  initError = err;
  console.error('[HUNTIQ-API-BOOT] Error loading pre-bundled server:', err);
}

export default function handler(req, res) {
  if (initError || !app) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: `Server initialization failed: ${initError?.message || 'Server bundle unavailable'}. Please verify build completed.`,
      code: 'SERVER_INITIALIZATION_FAILED'
    }));
  }
  return app(req, res);
}

export { app };
