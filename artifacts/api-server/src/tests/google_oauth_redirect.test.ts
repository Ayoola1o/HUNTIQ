import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';

async function run() {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = '';
  process.env.VERCEL = '0';
  process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3001/api/v1/auth/google/callback';
  const { GoogleAuthService } = await import('../services/googleAuthService');
  const { googleAuthRouter } = await import('../routes/googleAuth');
  const app = express();
  app.use('/api/v1', googleAuthRouter);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const callback = () => fetch(`http://127.0.0.1:${address.port}/api/v1/auth/google/callback`, { redirect: 'manual' });
  try {
    assert.match(GoogleAuthService.redirectUri, /^http:\/\/localhost:3001\//);
    assert.match((await callback()).headers.get('location') || '', /^http:\/\/localhost:5173\//);
    process.env.VERCEL = '1';
    const response = await callback();
    assert.equal(response.headers.get('location'), '/?view=integrations&google_auth=error&code=MISSING_OAUTH_PARAMETERS');
    assert.throws(() => GoogleAuthService.redirectUri, { code: 'INVALID_GOOGLE_REDIRECT_URI' });
    process.env.GOOGLE_REDIRECT_URI = 'https://huntiq-drab.vercel.app/api/v1/auth/google/callback';
    assert.equal(GoogleAuthService.redirectUri, process.env.GOOGLE_REDIRECT_URI);
    console.log('Local and Vercel OAuth redirect checks passed.');
  } finally {
    server.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
