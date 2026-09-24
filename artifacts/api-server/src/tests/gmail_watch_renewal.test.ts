import assert from 'node:assert';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { postgresPool, pool } from '../database/postgres';
import { ensureDatabaseMigrated } from '../database/migrate';
import { GmailReplySyncService, type GmailWatchResult } from '../services/gmailReplySyncService';
import { SchedulerService } from '../services/schedulerService';
import { GoogleAuthService } from '../services/googleAuthService';
import { CryptoService } from '../services/cryptoService';
import { createApp } from '../app';

console.log('========================================================================');
console.log('📬  HUNTIQ: GMAIL WATCH RENEWAL PRODUCTION-ACTIVE TEST SUITE');
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

// Track created test workspaces for cleanup
const createdWorkspaceIds: string[] = [];

async function setupWorkspaceAndIntegration(options?: {
  accountEmail?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: number;
  watchExpiration?: Date | null;
  watchHistoryId?: string;
  watchResourceId?: string;
  isActive?: boolean;
  syncStatus?: string;
}) {
  const activePool = postgresPool || pool;
  if (!activePool) throw new Error('Database pool unavailable for integration tests');

  const workspaceId = randomUUID();
  const userId = randomUUID();
  const email = options?.accountEmail || `test-${Date.now()}-${randomUUID().slice(0, 6)}@example.com`;

  createdWorkspaceIds.push(workspaceId);

  // 1. Create Workspace
  await activePool.query(
    `INSERT INTO workspaces (id, name, slug, created_at, updated_at) 
     VALUES ($1, 'Test Workspace', $2, now(), now())`,
    [workspaceId, `test-ws-${Date.now()}-${randomUUID().slice(0, 6)}`]
  );

  // 2. Create User
  await activePool.query(
    `INSERT INTO users (id, workspace_id, email, password_hash, first_name, last_name, full_name, role, created_at, updated_at) 
     VALUES ($1, $2, $3, 'hash123', 'Test', 'User', 'Test User', 'owner', now(), now())`,
    [userId, workspaceId, email]
  );

  // 3. Create Gmail Integration with encrypted tokens
  const rawAccess = options?.accessToken || 'mock-initial-access-token-123';
  const rawRefresh = options?.refreshToken || 'mock-initial-refresh-token-456';
  const encAccess = CryptoService.encryptToken(rawAccess);
  const encRefresh = CryptoService.encryptToken(rawRefresh);
  const expiry = options?.tokenExpiry ?? (Date.now() + 3600000); // 1 hour in future by default
  const isActive = options?.isActive ?? true;
  const syncStatus = options?.syncStatus || 'active';
  const watchExp = options?.watchExpiration === undefined ? null : options.watchExpiration;
  const historyId = options?.watchHistoryId || '50000';
  const resourceId = options?.watchResourceId || 'mock-resource-id';

  await activePool.query(
    `INSERT INTO workspace_integrations (
       workspace_id, provider, account_email, account_name,
       access_token, refresh_token, token_expiry,
       is_active, sync_status, watch_expiration, watch_history_id,
       watch_resource_id, scopes, metadata, created_at, updated_at
     ) VALUES (
       $1, 'gmail', $2, 'Test Account',
       $3, $4, $5,
       $6, $7, $8, $9,
       $10, '["https://mail.google.com/"]'::jsonb, '{}'::jsonb, now(), now()
     )`,
    [
      workspaceId,
      email,
      encAccess,
      encRefresh,
      expiry,
      isActive,
      syncStatus,
      watchExp,
      historyId,
      resourceId
    ]
  );

  return { workspaceId, userId, email, rawAccess, rawRefresh };
}

async function getIntegration(workspaceId: string) {
  const activePool = postgresPool || pool;
  const res = await activePool!.query(
    `SELECT * FROM workspace_integrations WHERE workspace_id = $1 AND provider = 'gmail'`,
    [workspaceId]
  );
  return res.rows[0] || null;
}

async function runAllTests() {
  await ensureDatabaseMigrated();

  // Ensure test environment encryption key and pubsub topic
  process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || 'huntiq_dev_encryption_key_insecure';
  process.env.GOOGLE_PUBSUB_TOPIC = 'projects/huntiq-test/topics/gmail-events';

  // -------------------------------------------------------------------------
  // Test 1: Renewal function executes
  // -------------------------------------------------------------------------
  await runTest('1. Renewal function executes and checks all active Gmail integrations', async () => {
    const { workspaceId } = await setupWorkspaceAndIntegration({
      watchExpiration: null // uninitialized watch
    });

    let mockHandlerCalled = false;
    GmailReplySyncService.setTestWatchHandler(async (wsId, token, topic) => {
      if (wsId === workspaceId) {
        mockHandlerCalled = true;
        assert.ok(token, 'Must receive valid access token');
        assert.strictEqual(topic, 'projects/huntiq-test/topics/gmail-events');
        return {
          success: true,
          historyId: '60001',
          expiration: new Date(Date.now() + 7 * 86400000).toISOString(),
          topicName: topic
        };
      }
      return null;
    });

    const summary = await GmailReplySyncService.checkAndRenewAllWatches();
    assert.ok(summary.checked >= 1, 'Should check at least 1 integration');
    assert.ok(summary.renewed >= 1, 'Should renew at least 1 integration');
    assert.strictEqual(mockHandlerCalled, true, 'Mock watch handler must be invoked');

    const updated = await getIntegration(workspaceId);
    assert.strictEqual(updated.watch_history_id, '60001');
    assert.strictEqual(updated.sync_status, 'active');
    assert.ok(updated.watch_expiration !== null);
    assert.strictEqual(updated.last_sync_error, null);
  });

  // -------------------------------------------------------------------------
  // Test 2: Watches within renewal window are renewed
  // -------------------------------------------------------------------------
  await runTest('2. Watches within renewal window (<= 24h) are renewed before expiration', async () => {
    // Watch expires in 6 hours (well inside 24h window)
    const sixHoursFromNow = new Date(Date.now() + 6 * 3600 * 1000);
    const { workspaceId } = await setupWorkspaceAndIntegration({
      watchExpiration: sixHoursFromNow,
      watchHistoryId: '70001'
    });

    const expectedNewExpiration = new Date(Date.now() + 7 * 86400000);
    GmailReplySyncService.setTestWatchHandler(async (wsId) => {
      if (wsId === workspaceId) {
        return {
          success: true,
          historyId: '70002',
          expiration: expectedNewExpiration.toISOString()
        };
      }
      return null;
    });

    const summary = await GmailReplySyncService.checkAndRenewAllWatches({ renewalWindowHours: 24 });
    const wsDetail = summary.details.find(d => d.workspaceId === workspaceId);
    assert.ok(wsDetail, 'Workspace detail must be present in renewal summary');
    assert.strictEqual(wsDetail?.status, 'renewed');

    const updated = await getIntegration(workspaceId);
    assert.strictEqual(updated.watch_history_id, '70002');
    const newExpTime = new Date(updated.watch_expiration).getTime();
    assert.ok(newExpTime > Date.now() + 6 * 86400000, 'Expiration must be extended ~7 days');
  });

  // -------------------------------------------------------------------------
  // Test 3: Watches outside renewal window are not unnecessarily renewed
  // -------------------------------------------------------------------------
  await runTest('3. Watches outside renewal window (> 24h) are not unnecessarily renewed (skipped for idempotency)', async () => {
    // Watch expires in 5 days (well outside 24h window)
    const fiveDaysFromNow = new Date(Date.now() + 5 * 86400000);
    const { workspaceId } = await setupWorkspaceAndIntegration({
      watchExpiration: fiveDaysFromNow,
      watchHistoryId: '80001'
    });

    let renewedWorkspaces: string[] = [];
    GmailReplySyncService.setTestWatchHandler(async (wsId) => {
      renewedWorkspaces.push(wsId);
      return {
        success: true,
        historyId: '80002',
        expiration: new Date(Date.now() + 7 * 86400000).toISOString()
      };
    });

    const summary = await GmailReplySyncService.checkAndRenewAllWatches({ renewalWindowHours: 24 });
    const wsDetail = summary.details.find(d => d.workspaceId === workspaceId);
    assert.ok(wsDetail, 'Workspace detail must be present');
    assert.strictEqual(wsDetail?.status, 'skipped', 'Watch expiring in 5 days must be skipped');
    assert.ok(!renewedWorkspaces.includes(workspaceId), 'Renewal handler must NOT be called for healthy watch');

    const updated = await getIntegration(workspaceId);
    assert.strictEqual(updated.watch_history_id, '80001', 'History ID must remain unchanged');
    assert.strictEqual(new Date(updated.watch_expiration).getTime(), fiveDaysFromNow.getTime());
  });

  // -------------------------------------------------------------------------
  // Test 4: Expired watches are recovered
  // -------------------------------------------------------------------------
  await runTest('4. Expired watches are safely recovered and re-established', async () => {
    // Watch expired 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000);
    const { workspaceId } = await setupWorkspaceAndIntegration({
      watchExpiration: twoHoursAgo,
      watchHistoryId: '85001',
      syncStatus: 'expired'
    });

    const newExp = new Date(Date.now() + 7 * 86400000);
    GmailReplySyncService.setTestWatchHandler(async (wsId) => {
      if (wsId === workspaceId) {
        return {
          success: true,
          historyId: '85002',
          expiration: newExp.toISOString()
        };
      }
      return null;
    });

    const summary = await GmailReplySyncService.checkAndRenewAllWatches();
    const wsDetail = summary.details.find(d => d.workspaceId === workspaceId);
    assert.strictEqual(wsDetail?.status, 'renewed');

    const updated = await getIntegration(workspaceId);
    assert.strictEqual(updated.watch_history_id, '85002');
    assert.strictEqual(updated.sync_status, 'active');
    assert.ok(new Date(updated.watch_expiration).getTime() > Date.now());
  });

  // -------------------------------------------------------------------------
  // Test 5: OAuth refresh is handled automatically
  // -------------------------------------------------------------------------
  await runTest('5. Expired OAuth credentials are automatically refreshed before watch renewal', async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id-renewal';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret-renewal';

    // Access token expired 1 hour ago, but valid refresh token exists
    const oneHourAgo = Date.now() - 3600 * 1000;
    const { workspaceId } = await setupWorkspaceAndIntegration({
      accessToken: 'old-expired-token',
      refreshToken: 'valid-refresh-token-999',
      tokenExpiry: oneHourAgo,
      watchExpiration: null
    });

    // Mock global fetch for Google's token refresh endpoint
    const originalFetch = globalThis.fetch;
    let refreshEndpointCalled = false;
    let receivedTokenInWatch: string | null = null;

    globalThis.fetch = async (url: any, init?: any) => {
      const urlStr = String(url);
      if (urlStr.includes('oauth2.googleapis.com/token')) {
        refreshEndpointCalled = true;
        const bodyStr = String(init?.body || '');
        assert.ok(bodyStr.includes('grant_type=refresh_token'), 'Must request refresh_token grant');
        assert.ok(bodyStr.includes('valid-refresh-token-999'), 'Must provide refresh token');
        return {
          ok: true,
          json: async () => ({
            access_token: 'fresh-refreshed-access-token-001',
            expires_in: 3600
          })
        } as any;
      }
      return originalFetch(url, init);
    };

    GmailReplySyncService.setTestWatchHandler(async (wsId, token) => {
      if (wsId === workspaceId) {
        receivedTokenInWatch = token;
        return {
          success: true,
          historyId: '90001',
          expiration: new Date(Date.now() + 7 * 86400000).toISOString()
        };
      }
      return null;
    });

    try {
      const summary = await GmailReplySyncService.checkAndRenewAllWatches();
      const wsDetail = summary.details.find(d => d.workspaceId === workspaceId);
      assert.strictEqual(wsDetail?.status, 'renewed');
      assert.strictEqual(refreshEndpointCalled, true, 'OAuth token refresh endpoint must be invoked');
      assert.strictEqual(receivedTokenInWatch, 'fresh-refreshed-access-token-001', 'Watch renewal must receive newly refreshed token');

      // Verify new token persisted in DB (encrypted)
      const updated = await getIntegration(workspaceId);
      const decryptedToken = CryptoService.decryptToken(updated.access_token);
      assert.strictEqual(decryptedToken, 'fresh-refreshed-access-token-001');
      assert.ok(Number(updated.token_expiry) > Date.now());
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Test 6: Failed workspace does not stop other renewals (failure isolation)
  // -------------------------------------------------------------------------
  await runTest('6. Workspace failure is isolated: failure on workspace A does not block workspace B', async () => {
    // Workspace A will fail
    const wsA = await setupWorkspaceAndIntegration({
      accountEmail: `fail-${Date.now()}@example.com`,
      watchExpiration: null
    });
    // Workspace B will succeed
    const wsB = await setupWorkspaceAndIntegration({
      accountEmail: `succeed-${Date.now()}@example.com`,
      watchExpiration: null
    });

    GmailReplySyncService.setTestWatchHandler(async (wsId) => {
      if (wsId === wsA.workspaceId) {
        return {
          success: false,
          error: 'Gmail 429: Too Many Requests / Rate limit exceeded'
        };
      }
      if (wsId === wsB.workspaceId) {
        return {
          success: true,
          historyId: '91002',
          expiration: new Date(Date.now() + 7 * 86400000).toISOString()
        };
      }
      return null;
    });

    const summary = await GmailReplySyncService.checkAndRenewAllWatches();
    const detailA = summary.details.find(d => d.workspaceId === wsA.workspaceId);
    const detailB = summary.details.find(d => d.workspaceId === wsB.workspaceId);

    assert.ok(detailA, 'Detail A must exist');
    assert.strictEqual(detailA?.status, 'failed');
    assert.ok(detailA?.error?.includes('Rate limit'), 'Error diagnostic must be safely recorded');

    assert.ok(detailB, 'Detail B must exist');
    assert.strictEqual(detailB?.status, 'renewed');
    assert.strictEqual(detailB?.historyId, '91002');

    // Confirm DB states
    const integrationA = await getIntegration(wsA.workspaceId);
    assert.ok(integrationA.last_sync_error?.includes('Rate limit'));

    const integrationB = await getIntegration(wsB.workspaceId);
    assert.strictEqual(integrationB.watch_history_id, '91002');
    assert.strictEqual(integrationB.last_sync_error, null);
  });

  // -------------------------------------------------------------------------
  // Test 7: Workspace isolation is preserved
  // -------------------------------------------------------------------------
  await runTest('7. Workspace isolation is preserved across distinct tenant databases', async () => {
    const ws1 = await setupWorkspaceAndIntegration({
      accountEmail: `ws1-${Date.now()}@alpha.com`,
      accessToken: 'token-ws1',
      watchExpiration: new Date(Date.now() + 1000), // expiring soon
      watchHistoryId: 'ws1-hist-1'
    });

    const ws2 = await setupWorkspaceAndIntegration({
      accountEmail: `ws2-${Date.now()}@beta.com`,
      accessToken: 'token-ws2',
      watchExpiration: new Date(Date.now() + 5 * 86400000), // healthy (5 days)
      watchHistoryId: 'ws2-hist-original'
    });

    GmailReplySyncService.setTestWatchHandler(async (wsId) => {
      if (wsId === ws1.workspaceId) {
        return {
          success: true,
          historyId: 'ws1-hist-renewed',
          expiration: new Date(Date.now() + 7 * 86400000).toISOString()
        };
      }
      return {
        success: true,
        historyId: 'default-hist',
        expiration: new Date(Date.now() + 7 * 86400000).toISOString()
      };
    });

    await GmailReplySyncService.checkAndRenewAllWatches();

    // Verify WS1 renewed
    const rec1 = await getIntegration(ws1.workspaceId);
    assert.strictEqual(rec1.watch_history_id, 'ws1-hist-renewed');

    // Verify WS2 completely untouched
    const rec2 = await getIntegration(ws2.workspaceId);
    assert.strictEqual(rec2.watch_history_id, 'ws2-hist-original');
    assert.strictEqual(rec2.account_email, ws2.email);
    assert.strictEqual(CryptoService.decryptToken(rec2.access_token), 'token-ws2');
  });

  // -------------------------------------------------------------------------
  // Test 8: Scheduler invokes renewal function & updates telemetry
  // -------------------------------------------------------------------------
  await runTest('8. Scheduler invokes renewal function directly and via authenticated HTTP cron endpoint', async () => {
    const { workspaceId } = await setupWorkspaceAndIntegration({
      watchExpiration: null
    });

    GmailReplySyncService.setTestWatchHandler(async (wsId) => {
      if (wsId === workspaceId) {
        return {
          success: true,
          historyId: 'scheduler-hist-888',
          expiration: new Date(Date.now() + 7 * 86400000).toISOString()
        };
      }
      return {
        success: true,
        historyId: 'other-ws-hist',
        expiration: new Date(Date.now() + 7 * 86400000).toISOString()
      };
    });

    // 8a. Test direct SchedulerService.runWatchRenewalJob() invocation
    const directSummary = await SchedulerService.runWatchRenewalJob();
    assert.ok(directSummary.renewed >= 1);

    const schedulerStatus = SchedulerService.getStatus();
    assert.ok(schedulerStatus.totalWatchRenewalsRun >= 1);
    assert.ok(schedulerStatus.lastWatchRenewalAt !== null);
    assert.strictEqual(schedulerStatus.lastWatchRenewalResult?.renewed, directSummary.renewed);

    // 8b. Test HTTP cron endpoint with authentication
    const testSecret = 'test-huntiq-cron-secret-2026';
    process.env.CRON_SECRET = testSecret;

    // Start ephemeral HTTP server on random port
    const appInstance = createApp();
    const server: Server = await new Promise((resolve) => {
      const s = appInstance.listen(0, () => resolve(s));
    });
    const port = (server.address() as any).port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      // Unauthorized request should fail with 401
      const unauthRes = await fetch(`${baseUrl}/api/v1/cron/renew-watches`, {
        method: 'POST'
      });
      assert.strictEqual(unauthRes.status, 401, 'Request without CRON_SECRET must be rejected with 401');

      // Authorized request with x-cron-secret header should succeed
      const authRes = await fetch(`${baseUrl}/api/v1/cron/renew-watches`, {
        method: 'POST',
        headers: {
          'x-cron-secret': testSecret
        }
      });
      assert.strictEqual(authRes.status, 200, 'Authorized cron request must return 200 OK');
      const body: any = await authRes.json();
      assert.strictEqual(body.success, true);
      assert.ok(typeof body.data.checked === 'number');
    } finally {
      delete process.env.CRON_SECRET;
      server.close();
    }
  });

  // -------------------------------------------------------------------------
  // Test 9: Repeated scheduler invocation is safe and idempotent
  // -------------------------------------------------------------------------
  await runTest('9. Repeated scheduler execution is safe, idempotent, and prevents redundant renewals', async () => {
    const { workspaceId } = await setupWorkspaceAndIntegration({
      watchExpiration: null // Needs immediate renewal
    });

    let invocationCount = 0;
    GmailReplySyncService.setTestWatchHandler(async (wsId) => {
      if (wsId === workspaceId) {
        invocationCount++;
        return {
          success: true,
          historyId: `idempotent-hist-${invocationCount}`,
          expiration: new Date(Date.now() + 7 * 86400000).toISOString()
        };
      }
      return {
        success: true,
        historyId: 'other-hist',
        expiration: new Date(Date.now() + 7 * 86400000).toISOString()
      };
    });

    // Run 1: Should renew the integration
    const run1 = await SchedulerService.runWatchRenewalJob();
    const detail1 = run1.details.find(d => d.workspaceId === workspaceId);
    assert.strictEqual(detail1?.status, 'renewed');
    assert.strictEqual(invocationCount, 1);

    const afterRun1 = await getIntegration(workspaceId);
    assert.strictEqual(afterRun1.watch_history_id, 'idempotent-hist-1');

    // Run 2: Immediately execute scheduler again
    // Since watch was just renewed with 7-day expiration, it is outside 24h window and must be skipped
    const run2 = await SchedulerService.runWatchRenewalJob();
    const detail2 = run2.details.find(d => d.workspaceId === workspaceId);
    assert.strictEqual(detail2?.status, 'skipped', 'Subsequent run must skip freshly renewed watch');
    assert.strictEqual(invocationCount, 1, 'Handler must not be invoked a second time');

    const afterRun2 = await getIntegration(workspaceId);
    assert.strictEqual(afterRun2.watch_history_id, 'idempotent-hist-1', 'State must remain intact');
    assert.strictEqual(afterRun2.sync_status, 'active');
  });

  // Clean up test workspaces
  const activePool = postgresPool || pool;
  if (activePool && createdWorkspaceIds.length > 0) {
    await activePool.query(
      `DELETE FROM workspaces WHERE id = ANY($1)`,
      [createdWorkspaceIds]
    );
  }

  // Reset test handler
  GmailReplySyncService.setTestWatchHandler(null);

  console.log('\n========================================================================');
  console.log(`🎉 ALL 9 GMAIL WATCH RENEWAL TESTS PASSED (${passedTests}/${totalTests})`);
  console.log('========================================================================\n');
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
