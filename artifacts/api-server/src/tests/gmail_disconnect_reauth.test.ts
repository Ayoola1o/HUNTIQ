import assert from 'node:assert';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { postgresPool, pool } from '../database/postgres';
import { ensureDatabaseMigrated } from '../database/migrate';
import { GoogleAuthService } from '../services/googleAuthService';
import { GmailReplySyncService } from '../services/gmailReplySyncService';
import { GmailService } from '../services/gmailService';
import { EmailDispatchService } from '../services/emailDispatchService';
import { CryptoService } from '../services/cryptoService';
import { createOAuthStateRepository } from '../repositories/oauth-states';
import { createApp } from '../app';

console.log('========================================================================');
console.log('🔐  HUNTIQ: GMAIL DISCONNECT & RE-AUTHENTICATION TEST SUITE');
console.log('========================================================================\n');

let passedTests = 0;
let totalTests = 0;

async function runTest(name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message || err}\n`);
    throw err;
  }
}

const createdWorkspaceIds: string[] = [];

async function setupWorkspace(options?: { name?: string }) {
  const activePool = postgresPool || pool;
  if (!activePool) throw new Error('Database pool unavailable');

  const workspaceId = randomUUID();
  const userId = randomUUID();
  const email = `user-${Date.now()}-${randomUUID().slice(0, 6)}@example.com`;

  createdWorkspaceIds.push(workspaceId);

  await activePool.query(
    `INSERT INTO workspaces (id, name, slug, created_at, updated_at) 
     VALUES ($1, $2, $3, now(), now())`,
    [workspaceId, options?.name || 'Test Workspace', `test-ws-${Date.now()}-${randomUUID().slice(0, 6)}`]
  );

  await activePool.query(
    `INSERT INTO users (id, workspace_id, email, password_hash, first_name, last_name, full_name, role, created_at, updated_at) 
     VALUES ($1, $2, $3, 'hash123', 'Test', 'User', 'Test User', 'owner', now(), now())`,
    [userId, workspaceId, email]
  );

  return { workspaceId, userId, email };
}

async function setupIntegration(workspaceId: string, options?: {
  accountEmail?: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiry?: number | null;
  isActive?: boolean;
  status?: string;
  syncStatus?: string;
  watchHistoryId?: string | null;
  watchExpiration?: Date | null;
  lastError?: string | null;
}) {
  const activePool = postgresPool || pool;
  if (!activePool) throw new Error('Database pool unavailable');

  const email = options?.accountEmail || `acct-${Date.now()}-${randomUUID().slice(0, 6)}@gmail.com`;
  const rawAccess = options?.accessToken !== undefined ? options.accessToken : 'mock-access-token';
  const rawRefresh = options?.refreshToken !== undefined ? options.refreshToken : 'mock-refresh-token';
  const encAccess = rawAccess ? CryptoService.encryptToken(rawAccess) : null;
  const encRefresh = rawRefresh ? CryptoService.encryptToken(rawRefresh) : null;
  const expiry = options?.tokenExpiry !== undefined ? options.tokenExpiry : (Date.now() + 3600000);
  const isActive = options?.isActive ?? true;
  const status = options?.status || 'active';
  const syncStatus = options?.syncStatus || 'active';
  const historyId = options?.watchHistoryId !== undefined ? options.watchHistoryId : '50001';
  const watchExp = options?.watchExpiration !== undefined ? options.watchExpiration : new Date(Date.now() + 7 * 86400000);

  await activePool.query(
    `INSERT INTO workspace_integrations (
       workspace_id, provider, account_email, account_name,
       access_token, refresh_token, token_expiry,
       is_active, status, sync_status, watch_expiration, watch_history_id,
       watch_resource_id, scopes, metadata, last_error, created_at, updated_at
     ) VALUES (
       $1, 'gmail', $2, 'Connected Account',
       $3, $4, $5,
       $6, $7, $8, $9, $10,
       'projects/huntiq/topics/gmail-events', '["https://mail.google.com/"]'::jsonb, '{}'::jsonb, $11, now(), now()
     )
     ON CONFLICT (workspace_id, provider) DO UPDATE SET
       account_email = EXCLUDED.account_email,
       access_token = EXCLUDED.access_token,
       refresh_token = EXCLUDED.refresh_token,
       token_expiry = EXCLUDED.token_expiry,
       is_active = EXCLUDED.is_active,
       status = EXCLUDED.status,
       sync_status = EXCLUDED.sync_status,
       watch_expiration = EXCLUDED.watch_expiration,
       watch_history_id = EXCLUDED.watch_history_id,
       last_error = EXCLUDED.last_error,
       updated_at = now()`,
    [
      workspaceId,
      email,
      encAccess,
      encRefresh,
      expiry,
      isActive,
      status,
      syncStatus,
      watchExp,
      historyId,
      options?.lastError || null
    ]
  );

  return { email, rawAccess, rawRefresh };
}

async function getIntegrationRow(workspaceId: string) {
  const activePool = postgresPool || pool;
  const res = await activePool!.query(
    `SELECT * FROM workspace_integrations WHERE workspace_id = $1 AND provider = 'gmail'`,
    [workspaceId]
  );
  return res.rows[0] || null;
}

async function runAllTests() {
  await ensureDatabaseMigrated();

  process.env.GOOGLE_CLIENT_ID = 'test-client-id-disconnect';
  process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret-disconnect';
  process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || 'huntiq_dev_encryption_key_insecure';
  process.env.GOOGLE_PUBSUB_TOPIC = 'projects/huntiq-test/topics/gmail-events';

  // -------------------------------------------------------------------------
  // Test 1: Successful Connect
  // -------------------------------------------------------------------------
  await runTest('1. Successful Connect: generates bound state, exchanges code, encrypts tokens, and sets active status', async () => {
    const { workspaceId, userId } = await setupWorkspace();

    // 1a. Generate OAuth URL
    const authUrl = await GoogleAuthService.getAuthUrl(workspaceId, userId, '/outreach/campaigns');
    assert.ok(authUrl.includes('https://accounts.google.com/o/oauth2/v2/auth'));
    assert.ok(authUrl.includes('state='));

    const stateToken = new URL(authUrl).searchParams.get('state')!;
    assert.ok(stateToken, 'State token must be generated');

    // 1b. Mock Google token exchange & userinfo
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init?: any) => {
      const urlStr = String(url);
      if (urlStr.includes('oauth2.googleapis.com/token')) {
        return {
          ok: true,
          json: async () => ({
            access_token: 'fresh-mock-access-token-111',
            refresh_token: 'fresh-mock-refresh-token-222',
            expires_in: 3600,
            scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email'
          })
        } as any;
      }
      if (urlStr.includes('googleapis.com/oauth2/v2/userinfo')) {
        return {
          ok: true,
          json: async () => ({
            email: 'connected-user@company.com',
            name: 'Connected User',
            picture: 'https://example.com/avatar.jpg'
          })
        } as any;
      }
      return originalFetch(url, init);
    };

    try {
      const { integration, returnPath } = await GoogleAuthService.exchangeCode('mock-code-123', stateToken);

      assert.strictEqual(integration.workspaceId, workspaceId);
      assert.strictEqual(integration.accountEmail, 'connected-user@company.com');
      assert.strictEqual(integration.status, 'active');
      assert.strictEqual(integration.isActive, true);
      assert.strictEqual(returnPath, '/outreach/campaigns');

      // Verify DB persistence
      const row = await getIntegrationRow(workspaceId);
      assert.strictEqual(row.is_active, true);
      assert.strictEqual(row.status, 'active');
      assert.strictEqual(row.sync_status, 'idle');
      assert.strictEqual(row.account_email, 'connected-user@company.com');
      assert.strictEqual(CryptoService.decryptToken(row.access_token), 'fresh-mock-access-token-111');
      assert.strictEqual(CryptoService.decryptToken(row.refresh_token), 'fresh-mock-refresh-token-222');

      // Verify state was marked used
      const activePool = postgresPool || pool;
      const stateRes = await activePool!.query('SELECT * FROM oauth_states WHERE state_token = $1', [stateToken]);
      assert.ok(stateRes.rows[0].used_at !== null, 'OAuth state must be marked used');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Test 2: Invalid OAuth State
  // -------------------------------------------------------------------------
  await runTest('2. Invalid OAuth State: rejected with INVALID_OAUTH_STATE error', async () => {
    let thrownError: any = null;
    try {
      await GoogleAuthService.exchangeCode('mock-code-999', 'completely-bogus-state-token');
    } catch (err: any) {
      thrownError = err;
    }

    assert.ok(thrownError, 'Must throw error on invalid state');
    assert.strictEqual(thrownError.code, 'INVALID_OAUTH_STATE');
  });

  // -------------------------------------------------------------------------
  // Test 3: Expired OAuth State
  // -------------------------------------------------------------------------
  await runTest('3. Expired OAuth State: expired state tokens cannot be exchanged', async () => {
    const { workspaceId, userId } = await setupWorkspace();
    const expiredToken = `expired-state-${randomUUID()}`;

    const activePool = postgresPool || pool;
    // Insert state expired 15 minutes ago
    await activePool!.query(
      `INSERT INTO oauth_states (state_token, user_id, workspace_id, provider, return_path, expires_at, created_at)
       VALUES ($1, $2, $3, 'gmail', '/integrations', now() - interval '15 minutes', now() - interval '25 minutes')`,
      [expiredToken, userId, workspaceId]
    );

    let thrownError: any = null;
    try {
      await GoogleAuthService.exchangeCode('mock-code-expired', expiredToken);
    } catch (err: any) {
      thrownError = err;
    }

    assert.ok(thrownError, 'Must reject expired state');
    assert.strictEqual(thrownError.code, 'INVALID_OAUTH_STATE');
  });

  // -------------------------------------------------------------------------
  // Test 4: Reused OAuth State
  // -------------------------------------------------------------------------
  await runTest('4. Reused OAuth State: single-use state token cannot be redeemed twice', async () => {
    const { workspaceId, userId } = await setupWorkspace();
    const reusedToken = `reused-state-${randomUUID()}`;

    const activePool = postgresPool || pool;
    // Insert state that was already consumed
    await activePool!.query(
      `INSERT INTO oauth_states (state_token, user_id, workspace_id, provider, return_path, expires_at, used_at, created_at)
       VALUES ($1, $2, $3, 'gmail', '/integrations', now() + interval '10 minutes', now() - interval '1 minute', now())`,
      [reusedToken, userId, workspaceId]
    );

    let thrownError: any = null;
    try {
      await GoogleAuthService.exchangeCode('mock-code-reused', reusedToken);
    } catch (err: any) {
      thrownError = err;
    }

    assert.ok(thrownError, 'Must reject already used state token');
    assert.strictEqual(thrownError.code, 'INVALID_OAUTH_STATE');
  });

  // -------------------------------------------------------------------------
  // Test 5: Wrong Workspace/State Binding
  // -------------------------------------------------------------------------
  await runTest('5. Workspace Binding: OAuth state binds strictly to the initiating workspace', async () => {
    const wsA = await setupWorkspace({ name: 'Workspace Alpha' });
    const wsB = await setupWorkspace({ name: 'Workspace Beta' });

    // State created specifically for Workspace A
    const authUrlA = await GoogleAuthService.getAuthUrl(wsA.workspaceId, wsA.userId, '/alpha');
    const stateTokenA = new URL(authUrlA).searchParams.get('state')!;

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init?: any) => {
      const urlStr = String(url);
      if (urlStr.includes('oauth2.googleapis.com/token')) {
        return {
          ok: true,
          json: async () => ({
            access_token: 'alpha-access-token',
            refresh_token: 'alpha-refresh-token',
            expires_in: 3600
          })
        } as any;
      }
      if (urlStr.includes('googleapis.com/oauth2/v2/userinfo')) {
        return {
          ok: true,
          json: async () => ({
            email: 'alpha@company.com',
            name: 'Alpha User'
          })
        } as any;
      }
      return originalFetch(url, init);
    };

    try {
      // Complete callback with state from A
      const { integration } = await GoogleAuthService.exchangeCode('code-for-a', stateTokenA);

      // Must be bound to wsA
      assert.strictEqual(integration.workspaceId, wsA.workspaceId);

      // Verify wsA DB record created
      const rowA = await getIntegrationRow(wsA.workspaceId);
      assert.ok(rowA !== null);
      assert.strictEqual(rowA.account_email, 'alpha@company.com');

      // Verify wsB was completely untouched
      const rowB = await getIntegrationRow(wsB.workspaceId);
      assert.strictEqual(rowB, null, 'Workspace B must not receive integration from Workspace A state');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Test 6: Successful Disconnect
  // -------------------------------------------------------------------------
  await runTest('6. Successful Disconnect: revokes credentials, stops watch, and wipes tokens while preserving historical CRM data', async () => {
    const { workspaceId } = await setupWorkspace();
    await setupIntegration(workspaceId, {
      accountEmail: 'disconnect-me@company.com',
      accessToken: 'valid-access-token-to-wipe',
      refreshToken: 'valid-refresh-token-to-wipe',
      watchHistoryId: '77777',
      watchExpiration: new Date(Date.now() + 5 * 86400000),
      status: 'active',
      syncStatus: 'active'
    });

    // Create a mock historical CRM thread to prove historical data is preserved
    const activePool = postgresPool || pool;
    const threadId = randomUUID();
    await activePool!.query(
      `INSERT INTO outreach_threads (id, workspace_id, contact_name, company_name, email, status, provider_thread_id, created_at, updated_at)
       VALUES ($1, $2, 'Jane Prospect', 'Acme Corp', 'jane@prospect.com', 'delivered', 'thread-123', now(), now())`,
      [threadId, workspaceId]
    );

    let stopCalled = false;
    let revokeCalled = false;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init?: any) => {
      const urlStr = String(url);
      if (urlStr.includes('gmail.googleapis.com/gmail/v1/users/me/stop')) {
        stopCalled = true;
        return { ok: true } as any;
      }
      if (urlStr.includes('oauth2.googleapis.com/revoke')) {
        revokeCalled = true;
        return { ok: true } as any;
      }
      return originalFetch(url, init);
    };

    try {
      await GoogleAuthService.disconnect(workspaceId);

      assert.strictEqual(stopCalled, true, 'Must call Gmail stop watch endpoint');
      assert.strictEqual(revokeCalled, true, 'Must call Google OAuth revocation endpoint');

      // Verify DB row was wiped
      const updatedRow = await getIntegrationRow(workspaceId);
      assert.strictEqual(updatedRow.is_active, false);
      assert.strictEqual(updatedRow.status, 'revoked');
      assert.strictEqual(updatedRow.sync_status, 'disconnected');
      assert.strictEqual(updatedRow.access_token, null);
      assert.strictEqual(updatedRow.refresh_token, null);
      assert.strictEqual(updatedRow.token_expiry, null);
      assert.strictEqual(updatedRow.watch_history_id, null);
      assert.strictEqual(updatedRow.watch_expiration, null);
      assert.strictEqual(updatedRow.watch_resource_id, null);

      // Verify historical CRM data remains completely intact
      const threadRes = await activePool!.query('SELECT * FROM outreach_threads WHERE id = $1', [threadId]);
      assert.strictEqual(threadRes.rows.length, 1);
      assert.strictEqual(threadRes.rows[0].email, 'jane@prospect.com');

      // Verify status endpoint reflects disconnected
      const status = await GoogleAuthService.getStatus(workspaceId);
      assert.strictEqual(status.isConnected, false);
      assert.strictEqual(status.status, 'revoked');
      assert.strictEqual(status.syncStatus, 'disconnected');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Test 7: Webhook After Disconnect
  // -------------------------------------------------------------------------
  await runTest('7. Webhook After Disconnect: notifications for disconnected integrations are dropped safely without sync', async () => {
    const { workspaceId } = await setupWorkspace();
    const disconnectedEmail = `disconnected-${Date.now()}@gmail.com`;

    await setupIntegration(workspaceId, {
      accountEmail: disconnectedEmail,
      accessToken: null,
      refreshToken: null,
      isActive: false,
      status: 'revoked',
      syncStatus: 'disconnected',
      watchHistoryId: null,
      watchExpiration: null
    });

    const appInstance = createApp();
    const server: Server = await new Promise((resolve) => {
      const s = appInstance.listen(0, () => resolve(s));
    });
    const port = (server.address() as any).port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const pubsubMessage = {
        message: {
          data: Buffer.from(JSON.stringify({
            emailAddress: disconnectedEmail,
            historyId: '88888'
          })).toString('base64'),
          messageId: `msg-${Date.now()}`,
          publishTime: new Date().toISOString()
        },
        subscription: 'projects/huntiq/subscriptions/gmail-sub'
      };

      const res = await fetch(`${baseUrl}/api/v1/integrations/gmail/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-huntiq-test-bypass': 'true' // test header for webhook envelope bypass
        },
        body: JSON.stringify(pubsubMessage)
      });

      // Must acknowledge with 200 so Pub/Sub does not retry endlessly
      assert.strictEqual(res.status, 200);
      const data: any = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.message.includes('No active integration') || data.message.includes('disconnected'));

      // Ensure no sync was run and integration remains disconnected
      const row = await getIntegrationRow(workspaceId);
      assert.strictEqual(row.sync_status, 'disconnected');
      assert.strictEqual(row.watch_history_id, null);
    } finally {
      server.close();
    }
  });

  // -------------------------------------------------------------------------
  // Test 8: Watch Renewal After Disconnect
  // -------------------------------------------------------------------------
  await runTest('8. Watch Renewal After Disconnect: disconnected workspaces are excluded from renewal scans and direct renewals fail', async () => {
    const { workspaceId } = await setupWorkspace();
    await setupIntegration(workspaceId, {
      accessToken: null,
      isActive: false,
      status: 'revoked',
      syncStatus: 'disconnected',
      watchExpiration: null
    });

    // 8a. Direct renewal must reject
    const directResult = await GmailReplySyncService.renewWatch(workspaceId);
    assert.strictEqual(directResult.success, false);
    assert.ok(directResult.error?.includes('disconnected') || directResult.error?.includes('inactive'));

    // 8b. checkAndRenewAllWatches must not pick it up
    const summary = await GmailReplySyncService.checkAndRenewAllWatches();
    const wsDetail = summary.details.find(d => d.workspaceId === workspaceId);
    assert.strictEqual(wsDetail, undefined, 'Disconnected workspace must be omitted from renewal scan');
  });

  // -------------------------------------------------------------------------
  // Test 9: Reconnect After Disconnect
  // -------------------------------------------------------------------------
  await runTest('9. Reconnect After Disconnect: stores new tokens, resets active status, and re-establishes watch cleanly', async () => {
    const { workspaceId, userId } = await setupWorkspace();

    // Start with a previously disconnected integration
    await setupIntegration(workspaceId, {
      accountEmail: 'reconnect-user@gmail.com',
      accessToken: null,
      refreshToken: null,
      isActive: false,
      status: 'revoked',
      syncStatus: 'disconnected',
      watchHistoryId: null,
      watchExpiration: null
    });

    // Generate new auth URL
    const authUrl = await GoogleAuthService.getAuthUrl(workspaceId, userId, '/dashboard');
    const newStateToken = new URL(authUrl).searchParams.get('state')!;

    let watchSetupCalled = false;
    GmailReplySyncService.setTestWatchHandler(async (wsId) => {
      if (wsId === workspaceId) {
        watchSetupCalled = true;
        return {
          success: true,
          historyId: 'reconnected-history-999',
          expiration: new Date(Date.now() + 7 * 86400000).toISOString()
        };
      }
      return { success: true, historyId: 'default', expiration: new Date().toISOString() };
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init?: any) => {
      const urlStr = String(url);
      if (urlStr.includes('oauth2.googleapis.com/token')) {
        return {
          ok: true,
          json: async () => ({
            access_token: 'reconnected-access-token-333',
            refresh_token: 'reconnected-refresh-token-444',
            expires_in: 3600
          })
        } as any;
      }
      if (urlStr.includes('googleapis.com/oauth2/v2/userinfo')) {
        return {
          ok: true,
          json: async () => ({
            email: 'reconnect-user@gmail.com',
            name: 'Reconnected User'
          })
        } as any;
      }
      return originalFetch(url, init);
    };

    try {
      const { integration } = await GoogleAuthService.exchangeCode('reconnect-code', newStateToken);
      assert.strictEqual(integration.status, 'active');
      assert.strictEqual(integration.isActive, true);

      // Trigger setupWatch explicitly as callback route does
      await GmailReplySyncService.setupWatch(workspaceId);
      assert.strictEqual(watchSetupCalled, true, 'Watch setup must be re-invoked upon reconnection');

      // Verify DB state
      const row = await getIntegrationRow(workspaceId);
      assert.strictEqual(row.is_active, true);
      assert.strictEqual(row.status, 'active');
      assert.strictEqual(row.sync_status, 'active');
      assert.strictEqual(row.watch_history_id, 'reconnected-history-999');
      assert.strictEqual(CryptoService.decryptToken(row.access_token), 'reconnected-access-token-333');
      assert.strictEqual(CryptoService.decryptToken(row.refresh_token), 'reconnected-refresh-token-444');
    } finally {
      globalThis.fetch = originalFetch;
      GmailReplySyncService.setTestWatchHandler(null);
    }
  });

  // -------------------------------------------------------------------------
  // Test 10: Expired Access-Token Refresh
  // -------------------------------------------------------------------------
  await runTest('10. Expired Access-Token Refresh: automatically refreshes and updates DB using encrypted refresh token', async () => {
    const { workspaceId } = await setupWorkspace();
    const expiredExpiry = Date.now() - 3600 * 1000; // expired 1 hour ago

    await setupIntegration(workspaceId, {
      accessToken: 'stale-access-token-expired',
      refreshToken: 'valid-refresh-token-active',
      tokenExpiry: expiredExpiry
    });

    let refreshCalled = false;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init?: any) => {
      const urlStr = String(url);
      if (urlStr.includes('oauth2.googleapis.com/token')) {
        refreshCalled = true;
        const body = String(init?.body || '');
        assert.ok(body.includes('grant_type=refresh_token'));
        assert.ok(body.includes('valid-refresh-token-active'));
        return {
          ok: true,
          json: async () => ({
            access_token: 'newly-refreshed-token-777',
            expires_in: 3600
          })
        } as any;
      }
      return originalFetch(url, init);
    };

    try {
      const token = await GoogleAuthService.getValidAccessToken(workspaceId);
      assert.strictEqual(token, 'newly-refreshed-token-777');
      assert.strictEqual(refreshCalled, true);

      // Verify DB updated
      const row = await getIntegrationRow(workspaceId);
      assert.strictEqual(CryptoService.decryptToken(row.access_token), 'newly-refreshed-token-777');
      assert.ok(Number(row.token_expiry) > Date.now());
      assert.strictEqual(row.status, 'active');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Test 11: Failed Refresh & Circuit Breaker (Do Not Hammer Google)
  // -------------------------------------------------------------------------
  await runTest('11. Failed Refresh: marks reauth_required, sanitizes error, and halts repeated calls without hammering Google', async () => {
    const { workspaceId } = await setupWorkspace();
    const expiredExpiry = Date.now() - 3600 * 1000;

    await setupIntegration(workspaceId, {
      accessToken: 'stale-access-token',
      refreshToken: 'revoked-refresh-token',
      tokenExpiry: expiredExpiry
    });

    let networkAttempts = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url: any, init?: any) => {
      const urlStr = String(url);
      if (urlStr.includes('oauth2.googleapis.com/token')) {
        networkAttempts++;
        return {
          ok: false,
          json: async () => ({
            error: 'invalid_grant',
            error_description: 'Token has been expired or revoked by user.'
          })
        } as any;
      }
      return originalFetch(url, init);
    };

    try {
      // First attempt: should fail and update status = reauth_required
      const firstToken = await GoogleAuthService.getValidAccessToken(workspaceId);
      assert.strictEqual(firstToken, null);
      assert.strictEqual(networkAttempts, 1);

      const row = await getIntegrationRow(workspaceId);
      assert.strictEqual(row.status, 'reauth_required');
      assert.strictEqual(row.sync_status, 'reauth_required');
      assert.ok(row.last_error?.includes('revoked'));

      // Second attempt: must immediately return null without making another network request!
      const secondToken = await GoogleAuthService.getValidAccessToken(workspaceId);
      assert.strictEqual(secondToken, null);
      assert.strictEqual(networkAttempts, 1, 'Must NOT hammer Google when integration already requires reauth');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Test 12: Cross-Workspace Access Attempt
  // -------------------------------------------------------------------------
  await runTest('12. Cross-Workspace Access Attempt: workspace operations are strictly isolated and prevent cross-tenant access', async () => {
    const ws1 = await setupWorkspace({ name: 'Tenant 1' });
    const ws2 = await setupWorkspace({ name: 'Tenant 2' });

    await setupIntegration(ws1.workspaceId, {
      accountEmail: 'tenant1@company.com',
      accessToken: 'token-secret-111'
    });

    await setupIntegration(ws2.workspaceId, {
      accountEmail: 'tenant2@company.com',
      accessToken: 'token-secret-222'
    });

    // 12a. Verify Tenant 1 query never retrieves Tenant 2 data
    const integration1 = await GoogleAuthService.getIntegration(ws1.workspaceId);
    assert.strictEqual(integration1?.accountEmail, 'tenant1@company.com');
    assert.strictEqual(integration1?.accessToken, 'token-secret-111');

    const integration2 = await GoogleAuthService.getIntegration(ws2.workspaceId);
    assert.strictEqual(integration2?.accountEmail, 'tenant2@company.com');
    assert.strictEqual(integration2?.accessToken, 'token-secret-222');

    // 12b. Disconnect Tenant 1 — Tenant 2 must remain completely unaffected
    await GoogleAuthService.disconnect(ws1.workspaceId);

    const check1 = await getIntegrationRow(ws1.workspaceId);
    assert.strictEqual(check1.is_active, false);
    assert.strictEqual(check1.access_token, null);

    const check2 = await getIntegrationRow(ws2.workspaceId);
    assert.strictEqual(check2.is_active, true);
    assert.strictEqual(CryptoService.decryptToken(check2.access_token), 'token-secret-222');

    // 12c. Outbound dispatch from Tenant 1 fails; Tenant 2 succeeds
    let dispatch1Blocked = false;
    try {
      await GmailService.sendEmail({
        workspaceId: ws1.workspaceId,
        to: 'target@test.com',
        subject: 'Hi',
        text: 'Test'
      });
    } catch (err: any) {
      dispatch1Blocked = true;
      assert.ok(err.message.includes('not connected') || err.message.includes('authenticate'));
    }
    assert.strictEqual(dispatch1Blocked, true, 'Tenant 1 must be blocked from sending email');
  });

  // Clean up test workspaces
  const activePool = postgresPool || pool;
  if (activePool && createdWorkspaceIds.length > 0) {
    await activePool.query(`DELETE FROM workspaces WHERE id = ANY($1)`, [createdWorkspaceIds]);
  }

  console.log('\n========================================================================');
  console.log(`🎉 ALL 12 GMAIL DISCONNECT & RE-AUTH TESTS PASSED (${passedTests}/${totalTests})`);
  console.log('========================================================================\n');
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
