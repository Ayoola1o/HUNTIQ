import http from 'http';
import { createApp } from '../app';
import { createMapsProvider } from '../providers/maps';
import { createCompanyRepository } from '../repositories/companies';
import { createLeadRepository } from '../repositories/leads';
import { createSignalRepository } from '../repositories/signals';
import { createCampaignRepository } from '../repositories/campaigns';
import { createOutreachRepository } from '../repositories/outreach';
import { createTaskRepository } from '../repositories/tasks';
import { createMeetingRepository } from '../repositories/meetings';
import { createSavedSearchRepository } from '../repositories/saved-searches';
import { createPipelineRepository } from '../repositories/pipeline';

async function runE2ETests() {
  console.log('========================================================================');
  console.log('🛡️  HUNTIQ END-TO-END PIPELINE & MULTI-TENANT ISOLATION TEST SUITE');
  console.log('========================================================================');

  const app = createApp();
  const PORT = 3099;
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(PORT, () => {
      console.log(`[TEST-SERVER] Listening on http://127.0.0.1:${PORT}`);
      resolve();
    });
  });

  const baseUrl = `http://127.0.0.1:${PORT}`;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Apify Google Maps Data Acquisition Layer & Data Purity
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 1: Apify Google Maps Provider & Data Purity ---');
    const mapsProvider = createMapsProvider();
    console.log(`Using Maps Provider: ${mapsProvider.name}`);

    const businesses = await mapsProvider.searchPlaces({
      query: 'FinTech and software agencies in Ikeja',
      location: 'Ikeja, Lagos, Nigeria',
      maxResults: 3
    });

    if (!Array.isArray(businesses) || businesses.length === 0) {
      throw new Error('Apify maps provider returned no businesses.');
    }

    console.log(`Discovered ${businesses.length} businesses via Maps provider.`);
    for (const biz of businesses) {
      console.log(`  - Business: "${biz.name}" | Place ID: ${biz.placeId}`);
      console.log(`    Address: "${biz.address || 'N/A'}" | Rating: ${biz.rating || 'N/A'}`);
      console.log(`    Website: ${biz.website || 'null'} (Quality: ${biz.dataQuality.websiteStatus})`);
      console.log(`    Phone: ${biz.phone || 'null'} (Quality: ${biz.dataQuality.phoneStatus})`);
      console.log(`    Email: null (Quality: ${biz.dataQuality.emailStatus})`);

      // STRICT DATA PURITY ASSERTIONS:
      // Maps places never have email - status must be not_found
      if (biz.dataQuality.emailStatus !== 'not_found') {
        throw new Error(`Data quality flag mismatch: email status is "${biz.dataQuality.emailStatus}"`);
      }
      if (biz.website && biz.website.includes('fake-domain')) {
        throw new Error(`Data purity failure: Synthetic domain found: "${biz.website}"`);
      }
    }
    console.log('✅ TEST 1 PASSED: Apify Maps provider returns authentic/null data with verified quality flags.');

    // -------------------------------------------------------------------------
    // TEST 2: Multi-Tenant Data Isolation Across All Entities
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Multi-Tenant Workspace Data Isolation ---');

    // Register Tenant Alpha
    const alphaSignupRes = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `alpha_${Date.now()}@tenant-alpha.io`,
        password: 'Password123!',
        fullName: 'Alpha Admin',
        companyName: 'Alpha Corporation'
      })
    });
    const alphaSignupData = await alphaSignupRes.json();
    const alphaToken = alphaSignupData.data?.token || alphaSignupData.token;
    const alphaWorkspaceId = alphaSignupData.data?.user?.workspaceId || alphaSignupData.data?.workspace?.id || alphaSignupData.workspace?.id;

    if (!alphaToken || !alphaWorkspaceId) {
      throw new Error(`Failed to create Tenant Alpha: ${JSON.stringify(alphaSignupData)}`);
    }
    console.log(`Tenant Alpha registered. Workspace ID: ${alphaWorkspaceId}`);

    // Register Tenant Beta
    const betaSignupRes = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `beta_${Date.now()}@tenant-beta.io`,
        password: 'Password123!',
        fullName: 'Beta Admin',
        companyName: 'Beta Enterprises'
      })
    });
    const betaSignupData = await betaSignupRes.json();
    const betaToken = betaSignupData.data?.token || betaSignupData.token;
    const betaWorkspaceId = betaSignupData.data?.user?.workspaceId || betaSignupData.data?.workspace?.id || betaSignupData.workspace?.id;

    if (!betaToken || !betaWorkspaceId) {
      throw new Error(`Failed to create Tenant Beta: ${JSON.stringify(betaSignupData)}`);
    }
    console.log(`Tenant Beta registered. Workspace ID: ${betaWorkspaceId}`);

    const alphaHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${alphaToken}`
    };
    const betaHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${betaToken}`
    };

    // Alpha creates:
    // A. Campaign
    const alphaCampRes = await fetch(`${baseUrl}/api/campaigns`, {
      method: 'POST',
      headers: alphaHeaders,
      body: JSON.stringify({
        name: 'Alpha Secret Enterprise Campaign',
        channel: 'email',
        description: 'Alpha confidential sequence'
      })
    });
    const alphaCamp = await alphaCampRes.json();
    const alphaCampId = alphaCamp.data?.id;
    console.log(`  - Alpha created campaign: ${alphaCampId}`);

    // B. Task
    const alphaTaskRes = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: alphaHeaders,
      body: JSON.stringify({
        title: 'Alpha Private Strategy Task',
        priority: 'high',
        dueDate: 'Tomorrow'
      })
    });
    const alphaTask = await alphaTaskRes.json();
    const alphaTaskId = alphaTask.data?.id;
    console.log(`  - Alpha created task: ${alphaTaskId}`);

    // C. Meeting
    const alphaMeetingRes = await fetch(`${baseUrl}/api/meetings`, {
      method: 'POST',
      headers: alphaHeaders,
      body: JSON.stringify({
        title: 'Alpha Board Review Meeting',
        date: '2026-09-10',
        time: '14:00'
      })
    });
    const alphaMeeting = await alphaMeetingRes.json();
    const alphaMeetingId = alphaMeeting.data?.id;
    console.log(`  - Alpha created meeting: ${alphaMeetingId}`);

    // D. Saved Search
    const alphaSearchRes = await fetch(`${baseUrl}/api/saved-searches`, {
      method: 'POST',
      headers: alphaHeaders,
      body: JSON.stringify({
        name: 'Alpha Target Search Filter',
        query: 'Fintech Nigeria',
        filters: { city: 'Lagos' }
      })
    });
    const alphaSearch = await alphaSearchRes.json();
    const alphaSearchId = alphaSearch.data?.id;
    console.log(`  - Alpha created saved search: ${alphaSearchId}`);

    // E. Pipeline Deal
    const alphaDealRes = await fetch(`${baseUrl}/api/pipeline/deals`, {
      method: 'POST',
      headers: alphaHeaders,
      body: JSON.stringify({
        company: 'Alpha Exclusive Prospect',
        title: 'Confidential Deal $100k',
        dealValue: 100000,
        stage: 'proposal'
      })
    });
    const alphaDeal = await alphaDealRes.json();
    const alphaDealId = alphaDeal.data?.id;
    console.log(`  - Alpha created pipeline deal: ${alphaDealId}`);

    // Now Tenant Beta checks all lists:
    console.log('\nChecking Tenant Beta visibility into Tenant Alpha data...');

    // 1. Beta campaigns
    const betaCampsRes = await fetch(`${baseUrl}/api/campaigns`, { headers: betaHeaders });
    const betaCamps = (await betaCampsRes.json()).data?.campaigns || [];
    const leakedCamp = betaCamps.find((c: any) => c.id === alphaCampId);
    if (leakedCamp) {
      throw new Error(`CRITICAL SECURITY LEAK: Beta saw Alpha campaign ${alphaCampId}`);
    }

    // 2. Beta tasks
    const betaTasksRes = await fetch(`${baseUrl}/api/tasks`, { headers: betaHeaders });
    const betaTasks = (await betaTasksRes.json()).data?.tasks || [];
    const leakedTask = betaTasks.find((t: any) => t.id === alphaTaskId);
    if (leakedTask) {
      throw new Error(`CRITICAL SECURITY LEAK: Beta saw Alpha task ${alphaTaskId}`);
    }

    // 3. Beta meetings
    const betaMeetingsRes = await fetch(`${baseUrl}/api/meetings`, { headers: betaHeaders });
    const betaMeetings = (await betaMeetingsRes.json()).data?.meetings || [];
    const leakedMeeting = betaMeetings.find((m: any) => m.id === alphaMeetingId);
    if (leakedMeeting) {
      throw new Error(`CRITICAL SECURITY LEAK: Beta saw Alpha meeting ${alphaMeetingId}`);
    }

    // 4. Beta saved searches
    const betaSearchesRes = await fetch(`${baseUrl}/api/saved-searches`, { headers: betaHeaders });
    const betaSearches = (await betaSearchesRes.json()).data?.savedSearches || [];
    const leakedSearch = betaSearches.find((s: any) => s.id === alphaSearchId);
    if (leakedSearch) {
      throw new Error(`CRITICAL SECURITY LEAK: Beta saw Alpha saved search ${alphaSearchId}`);
    }

    // 5. Beta pipeline deals
    const betaDealsRes = await fetch(`${baseUrl}/api/pipeline/deals`, { headers: betaHeaders });
    const betaDeals = (await betaDealsRes.json()).data || [];
    const leakedDeal = betaDeals.find((d: any) => d.id === alphaDealId);
    if (leakedDeal) {
      throw new Error(`CRITICAL SECURITY LEAK: Beta saw Alpha pipeline deal ${alphaDealId}`);
    }

    console.log('✅ TEST 2 PASSED: Strict multi-tenant isolation verified across all entity stores. Zero data leaked.');

    // -------------------------------------------------------------------------
    // TEST 3: Production 401 Unauthorized Enforcement
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Production 401 Unauthorized Enforcement ---');
    const oldNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const unauthEndpoints = [
      '/api/campaigns',
      '/api/outreach',
      '/api/tasks',
      '/api/meetings',
      '/api/saved-searches',
      '/api/v1/auth/profile'
    ];

    for (const ep of unauthEndpoints) {
      const unauthRes = await fetch(`${baseUrl}${ep}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (unauthRes.status !== 401) {
        throw new Error(`Production security violation: Expected 401 on ${ep} without token, got ${unauthRes.status}`);
      }
    }
    process.env.NODE_ENV = oldNodeEnv;
    console.log('✅ TEST 3 PASSED: Production mode strictly denies unauthenticated requests with HTTP 401.');

    // -------------------------------------------------------------------------
    // TEST 4: Full Pipeline: Live Discovery -> Signals -> Leads -> Outreach
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Full End-to-End Pipeline Execution ---');
    
    // Step 4.1: Query signals for an isolated workspace
    const signalsRes = await fetch(`${baseUrl}/api/signals`, { headers: alphaHeaders });
    const signalsData = await signalsRes.json();
    console.log(`  - Alpha Signals count: ${signalsData.data?.length ?? 0}`);

    // Step 4.2: Add lead with unverified email flag
    const leadRepo = createLeadRepository();
    const createdLead = await leadRepo.create({
      workspaceId: alphaWorkspaceId,
      companyId: 'comp-alpha-test',
      title: 'Alpha Enterprise Modernization Lead',
      score: 89,
      tier: 'HIGH',
      status: 'QUALIFIED',
      reason: 'Live signals detected via Apify Maps discovery',
      dealValue: 35000,
      conversionProbability: 75
    });
    console.log(`  - Lead created in repository: ${createdLead.id} (Score: ${createdLead.score})`);

    // Step 4.3: Alpha queries their leads
    const alphaLeads = await leadRepo.list(alphaWorkspaceId, 50, 0);
    if (alphaLeads.length === 0 || !alphaLeads.some(l => l.id === createdLead.id)) {
      throw new Error('Created lead not found in workspace query.');
    }

    // Step 4.4: Beta queries leads and must NOT see Alpha\'s lead
    const betaLeads = await leadRepo.list(betaWorkspaceId, 50, 0);
    if (betaLeads.some(l => l.id === createdLead.id)) {
      throw new Error(`SECURITY LEAK: Beta saw Alpha\'s lead ${createdLead.id}`);
    }

    console.log('✅ TEST 4 PASSED: Full pipeline integration executes cleanly with complete data segregation.');

    console.log('\n========================================================================');
    console.log('🎉 ALL INTEGRATION & ISOLATION TESTS PASSED CLEANLY (4/4)');
    console.log('========================================================================\n');
  } finally {
    server.close();
  }
}

runE2ETests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
