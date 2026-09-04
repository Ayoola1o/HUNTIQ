import http from 'http';
import { createApp } from '../app';

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 HUNTIQ PERSISTENCE, REPOSITORIES & AUTH TEST SUITE');
  console.log('====================================================');

  const app = createApp();
  const PORT = 3098;
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(PORT, () => {
      console.log(`[TEST-SERVER] Listening on http://127.0.0.1:${PORT}`);
      resolve();
    });
  });

  const baseUrl = `http://127.0.0.1:${PORT}`;

  try {
    // 1. Health check
    console.log('\n--- 1. Health Telemetry Check ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthEnvelope = await healthRes.json();
    const healthData = healthEnvelope.data || healthEnvelope;
    console.log('Health status:', healthData.status, '| Uptime:', healthData.uptimeSeconds);
    if (healthData.status !== 'ok' && healthData.status !== 'degraded') throw new Error('Health check failed');
    console.log('✅ Health check passed (Service responding, repository driver operational)');

    // 2. Demo User Login
    console.log('\n--- 2. Demo User Login ---');
    const demoLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@huntiq.io', password: 'password123' })
    });
    const demoLoginEnvelope = await demoLoginRes.json();
    const demoLogin = demoLoginEnvelope.data || demoLoginEnvelope;
    if (!demoLogin.token || !demoLogin.user?.id) {
      throw new Error(`Demo login failed: ${JSON.stringify(demoLoginEnvelope)}`);
    }
    const demoToken = demoLogin.token;
    console.log('✅ Demo user authenticated:', demoLogin.user.email, '| ID:', demoLogin.user.id);

    // 3. Demo User Pipeline Deals
    console.log('\n--- 3. Demo User Deals Retrieval ---');
    const demoDealsRes = await fetch(`${baseUrl}/api/pipeline/deals`, {
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    const demoDealsEnvelope = await demoDealsRes.json();
    const demoDeals = Array.isArray(demoDealsEnvelope.data) ? demoDealsEnvelope.data : demoDealsEnvelope;
    console.log('Demo deals count:', demoDeals.length);
    if (!Array.isArray(demoDeals) || demoDeals.length < 2) {
      throw new Error('Expected pre-seeded deals for demo user');
    }
    console.log('✅ Demo user deals verified:', demoDeals.map((d: any) => d.dealTitle || d.title).join(', '));

    // 4. Register Brand New Tenant User
    console.log('\n--- 4. Register New Tenant User ---');
    const testEmail = `tester_${Date.now()}@huntiq.io`;
    const signupRes = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
        fullName: 'Enterprise Investigator',
        companyName: 'Quantum Intelligence Inc'
      })
    });
    const signupEnvelope = await signupRes.json();
    const signupData = signupEnvelope.data || signupEnvelope;
    if (!signupData.token || !signupData.user) {
      throw new Error(`Signup failed: ${JSON.stringify(signupEnvelope)}`);
    }
    const tenantToken = signupData.token;
    const tenantUser = signupData.user;
    console.log('✅ New tenant created:', tenantUser.email, '| ID:', tenantUser.id, '| Workspace:', tenantUser.workspaceId);

    // 5. Tenant Data Scoping: Fresh Deals Must Be Empty
    console.log('\n--- 5. Verify Isolation: New User Deals Must Be Empty ---');
    const tenantDealsRes1 = await fetch(`${baseUrl}/api/pipeline/deals`, {
      headers: { Authorization: `Bearer ${tenantToken}` }
    });
    const tenantDealsEnvelope1 = await tenantDealsRes1.json();
    const tenantDeals1 = Array.isArray(tenantDealsEnvelope1.data) ? tenantDealsEnvelope1.data : tenantDealsEnvelope1;
    console.log('New user initial deals count:', tenantDeals1.length);
    if (!Array.isArray(tenantDeals1) || tenantDeals1.length !== 0) {
      throw new Error(`Expected 0 deals for new tenant, received ${tenantDeals1.length}`);
    }
    console.log('✅ Strict isolation confirmed: New tenant cannot see demo deals');

    // 6. Create Deal Under New Tenant
    console.log('\n--- 6. Create Deal Under New Tenant ---');
    const createDealRes = await fetch(`${baseUrl}/api/pipeline/deals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenantToken}`
      },
      body: JSON.stringify({
        dealTitle: 'Acme Robotics High-Value Target',
        companyName: 'Acme Robotics',
        dealValue: 75000,
        stage: 'discovery',
        priority: 'high',
        opportunityScore: 92
      })
    });
    const createDealEnvelope = await createDealRes.json();
    const newDeal = createDealEnvelope.data || createDealEnvelope;
    if (!newDeal.id || (newDeal.dealTitle !== 'Acme Robotics High-Value Target' && newDeal.title !== 'Acme Robotics High-Value Target')) {
      throw new Error(`Failed to create tenant deal: ${JSON.stringify(createDealEnvelope)}`);
    }
    console.log('✅ Tenant deal created:', newDeal.id, '| Title:', newDeal.dealTitle || newDeal.title, '| Value: $' + newDeal.dealValue);

    // 7. Verify Tenant Deals Now Has Exactly 1 Deal
    console.log('\n--- 7. Fetch Tenant Deals Post-Creation ---');
    const tenantDealsRes2 = await fetch(`${baseUrl}/api/pipeline/deals`, {
      headers: { Authorization: `Bearer ${tenantToken}` }
    });
    const tenantDealsEnvelope2 = await tenantDealsRes2.json();
    const tenantDeals2 = Array.isArray(tenantDealsEnvelope2.data) ? tenantDealsEnvelope2.data : tenantDealsEnvelope2;
    if (tenantDeals2.length !== 1 || tenantDeals2[0].id !== newDeal.id) {
      throw new Error(`Expected exactly 1 deal for tenant, received: ${JSON.stringify(tenantDeals2)}`);
    }
    console.log('✅ Tenant deals verified:', tenantDeals2[0].dealTitle || tenantDeals2[0].title);

    // 8. Re-check Demo Isolation: Demo User Still Does NOT See Tenant Deal
    console.log('\n--- 8. Verify Demo User Cannot See Tenant Deal ---');
    const demoDealsRes2 = await fetch(`${baseUrl}/api/pipeline/deals`, {
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    const demoDealsEnvelope2 = await demoDealsRes2.json();
    const demoDeals2 = Array.isArray(demoDealsEnvelope2.data) ? demoDealsEnvelope2.data : demoDealsEnvelope2;
    const leakedDeal = demoDeals2.find((d: any) => d.id === newDeal.id);
    if (leakedDeal) {
      throw new Error('LEAK DETECTED: Demo user can see tenant deal!');
    }
    console.log('✅ Tenant isolation preserved: Demo user deals do NOT include tenant deal');

    // 9. API Key Lifecycle
    console.log('\n--- 9. Programmatic API Key Lifecycle ---');
    const createKeyRes = await fetch(`${baseUrl}/api/v1/auth/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenantToken}`
      },
      body: JSON.stringify({ name: 'CI/CD Pipeline Key' })
    });
    const keyEnvelope = await createKeyRes.json();
    const keyData = keyEnvelope.data || keyEnvelope;
    const apiKey = keyData.apiKey || keyData.secretKey;
    if (!apiKey || !apiKey.startsWith('hnt_live_')) {
      throw new Error(`Invalid API key generation: ${JSON.stringify(keyEnvelope)}`);
    }
    console.log('✅ Live API key generated:', keyData.keyPrefix, '| Full key length:', apiKey.length);

    // Authenticate via X-HUNTIQ-API-KEY header
    console.log('\n--- 10. Authenticate Using Generated API Key ---');
    const apiKeyDealsRes = await fetch(`${baseUrl}/api/pipeline/deals`, {
      headers: { 'X-HUNTIQ-API-KEY': apiKey }
    });
    const apiKeyDealsEnvelope = await apiKeyDealsRes.json();
    const apiKeyDeals = Array.isArray(apiKeyDealsEnvelope.data) ? apiKeyDealsEnvelope.data : apiKeyDealsEnvelope;
    if (apiKeyDeals.length !== 1 || (apiKeyDeals[0].dealTitle !== 'Acme Robotics High-Value Target' && apiKeyDeals[0].title !== 'Acme Robotics High-Value Target')) {
      throw new Error(`API key authentication failed to scope tenant deals: ${JSON.stringify(apiKeyDealsEnvelope)}`);
    }
    console.log('✅ API key authentication successful: Scoped to', tenantUser.email);

    // Revoke API Key
    console.log('\n--- 11. Revoke API Key ---');
    const deleteKeyRes = await fetch(`${baseUrl}/api/v1/auth/api-keys/${keyData.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tenantToken}` }
    });
    const deleteKeyData = await deleteKeyRes.json();
    if (!deleteKeyData.success) throw new Error('Failed to revoke API key');
    console.log('✅ API key successfully revoked');

    // 12. Activity Logs
    console.log('\n--- 12. Tenant Activity Logs ---');
    const activityRes = await fetch(`${baseUrl}/api/v1/auth/activity`, {
      headers: { Authorization: `Bearer ${tenantToken}` }
    });
    const activityEnvelope = await activityRes.json();
    const activityLogs = Array.isArray(activityEnvelope.data) ? activityEnvelope.data : activityEnvelope;
    console.log('Tenant activity entries count:', activityLogs.length);
    if (!Array.isArray(activityLogs) || activityLogs.length === 0) {
      throw new Error('Expected activity logs for new tenant');
    }
    console.log('Recent logs:', activityLogs.map((a: any) => `${a.action}: ${a.details}`).slice(0, 3).join(' | '));
    console.log('✅ Tenant activity tracking verified');

    // 13. Production Auth Hardening Verification: Simulate Production NODE_ENV
    console.log('\n--- 13. Production 401 Unauthorized Enforcement Check ---');
    process.env.NODE_ENV = 'production';
    const unauthenticatedRes = await fetch(`${baseUrl}/api/pipeline/deals`);
    process.env.NODE_ENV = 'test';
    if (unauthenticatedRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized in production, received HTTP ${unauthenticatedRes.status}`);
    }
    const unauthEnvelope = await unauthenticatedRes.json();
    if (unauthEnvelope.error?.code !== 'UNAUTHORIZED') {
      throw new Error(`Expected UNAUTHORIZED code, received ${JSON.stringify(unauthEnvelope)}`);
    }
    console.log('✅ Strict Production Security Verified: Missing auth rejected with 401 UNAUTHORIZED');

    console.log('\n====================================================');
    console.log('🎉 ALL PERSISTENCE, REPOSITORIES & AUTH TESTS PASSED 100%!');
    console.log('====================================================\n');
  } finally {
    server.close();
  }
}

runVerification().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
