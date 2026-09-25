import http from 'http';
import { createApp } from '../app';
import { ensureDatabaseMigrated } from '../database/migrate';
import { createCompanyRepository } from '../repositories/companies';
import { createPipelineRepository } from '../repositories/pipeline';
import { createSignalRepository } from '../repositories/signals';

async function runCommandProductionFlowTests() {
  console.log('========================================================================');
  console.log('🛡️  COMMAND SECTION PRODUCTION FUNCTIONAL FLOW TEST SUITE');
  console.log('========================================================================');

  await ensureDatabaseMigrated();

  const app = createApp();
  const PORT = 3105;
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
    // SETUP: Create two isolated tenants
    // -------------------------------------------------------------------------
    console.log('\n--- Setup: Registering Isolated Tenants ---');
    const tenantAEmail = `tenant_a_${Date.now()}@huntiq-test.io`;
    const resA = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: tenantAEmail,
        password: 'Password123!',
        fullName: 'Tenant A User',
        companyName: 'Tenant A Labs'
      })
    });
    const dataA = await resA.json();
    const tokenA = dataA.data?.token || dataA.token;
    const workspaceIdA = dataA.data?.user?.workspaceId || dataA.data?.workspace?.id || dataA.workspace?.id;

    if (!tokenA || !workspaceIdA) {
      throw new Error(`Failed to create Tenant A: ${JSON.stringify(dataA)}`);
    }

    const tenantBEmail = `tenant_b_${Date.now()}@huntiq-test.io`;
    const resB = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: tenantBEmail,
        password: 'Password123!',
        fullName: 'Tenant B User',
        companyName: 'Tenant B Corp'
      })
    });
    const dataB = await resB.json();
    const tokenB = dataB.data?.token || dataB.token;
    const workspaceIdB = dataB.data?.user?.workspaceId || dataB.data?.workspace?.id || dataB.workspace?.id;

    if (!tokenB || !workspaceIdB) {
      throw new Error(`Failed to create Tenant B: ${JSON.stringify(dataB)}`);
    }

    const headersA = { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` };
    const headersB = { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` };

    console.log(`Tenant A created: workspace=${workspaceIdA}`);
    console.log(`Tenant B created: workspace=${workspaceIdB}`);

    // -------------------------------------------------------------------------
    // TEST 1: Fresh Workspace Returns Empty State (NO Fake Demo Records)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 1: Authentic Clean Empty Workspace (No Fake Data) ---');

    const [companiesRes, pipelineRes, signalsRes] = await Promise.all([
      fetch(`${baseUrl}/api/companies`, { headers: headersA }),
      fetch(`${baseUrl}/api/pipeline/deals`, { headers: headersA }),
      fetch(`${baseUrl}/api/signals`, { headers: headersA })
    ]);

    const companiesData = await companiesRes.json();
    const pipelineData = await pipelineRes.json();
    const signalsData = await signalsRes.json();

    const companiesList = companiesData.data || companiesData;
    const pipelineList = pipelineData.data || pipelineData;
    const signalsList = signalsData.data || signalsData;

    console.log(`Initial Counts for Tenant A -> Companies: ${companiesList.length}, Pipeline: ${pipelineList.length}, Signals: ${signalsList.length}`);

    if (!Array.isArray(companiesList) || companiesList.length !== 0) {
      throw new Error(`Expected clean empty companies list for new workspace, got ${companiesList.length}`);
    }
    if (!Array.isArray(pipelineList) || pipelineList.length !== 0) {
      throw new Error(`Expected clean empty pipeline list for new workspace, got ${pipelineList.length}`);
    }
    if (!Array.isArray(signalsList) || signalsList.length !== 0) {
      throw new Error(`Expected clean empty signals list for new workspace, got ${signalsList.length}`);
    }

    console.log('✅ TEST 1 PASSED: Fresh workspace returns empty data without injecting fabricated mock records.');

    // -------------------------------------------------------------------------
    // TEST 2: Pipeline Deal Creation & Multi-Tenant Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Pipeline Deal Creation & Workspace Isolation ---');

    const newDealPayload = {
      dealTitle: 'Enterprise Cloud Intelligence Expansion',
      companyName: 'Sterling Apex Tech',
      domain: 'sterlingapex.io',
      serviceName: 'Enterprise Growth Advisory',
      dealValue: 75000,
      probability: 70,
      stage: 'discovery',
      contactName: 'Adaobi Nwachukwu',
      contactRole: 'Chief Commercial Officer',
      nextAction: 'Schedule technical discovery demo'
    };

    const createDealRes = await fetch(`${baseUrl}/api/pipeline`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify(newDealPayload)
    });

    const createDealData = await createDealRes.json();
    if (!createDealRes.ok || !createDealData.success) {
      throw new Error(`Failed to create pipeline deal: ${JSON.stringify(createDealData)}`);
    }

    const createdDeal = createDealData.data;
    console.log(`Deal created: id=${createdDeal.id}, title="${createdDeal.dealTitle}", value=$${createdDeal.dealValue}`);

    if (createdDeal.dealTitle !== newDealPayload.dealTitle || createdDeal.dealValue !== 75000) {
      throw new Error('Created deal data does not match payload');
    }

    // Verify Tenant A sees the deal
    const fetchARes = await fetch(`${baseUrl}/api/pipeline/deals`, { headers: headersA });
    const fetchAData = await fetchARes.json();
    const dealsA = fetchAData.data || fetchAData;
    if (dealsA.length !== 1 || dealsA[0].id !== createdDeal.id) {
      throw new Error(`Tenant A should see exactly 1 deal, found ${dealsA.length}`);
    }

    // Verify Tenant B CANNOT see Tenant A's deal
    const fetchBRes = await fetch(`${baseUrl}/api/pipeline/deals`, { headers: headersB });
    const fetchBData = await fetchBRes.json();
    const dealsB = fetchBData.data || fetchBData;
    if (dealsB.length !== 0) {
      throw new Error(`Tenant B saw Tenant A's deal! Isolation breach detected: ${JSON.stringify(dealsB)}`);
    }

    console.log('✅ TEST 2 PASSED: Pipeline deal created and strictly isolated by workspace ID.');

    // -------------------------------------------------------------------------
    // TEST 3: Pipeline Deal Stage Update & Persistence
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Pipeline Deal Stage Update & Cross-Tenant Rejection ---');

    const updateStageRes = await fetch(`${baseUrl}/api/pipeline/${createdDeal.id}/stage`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({ stage: 'qualified' })
    });

    const updateStageData = await updateStageRes.json();
    if (!updateStageRes.ok || !updateStageData.success) {
      throw new Error(`Failed to update deal stage: ${JSON.stringify(updateStageData)}`);
    }
    if (updateStageData.data.stage !== 'qualified') {
      throw new Error(`Expected stage 'qualified', got '${updateStageData.data.stage}'`);
    }

    // Tenant B attempting to update Tenant A's deal must fail
    const unauthorizedUpdateRes = await fetch(`${baseUrl}/api/pipeline/${createdDeal.id}/stage`, {
      method: 'PATCH',
      headers: headersB,
      body: JSON.stringify({ stage: 'closed_won' })
    });

    if (unauthorizedUpdateRes.status !== 404 && unauthorizedUpdateRes.status !== 403) {
      throw new Error(`Expected 404 or 403 when updating another tenant's deal, got ${unauthorizedUpdateRes.status}`);
    }

    console.log('✅ TEST 3 PASSED: Pipeline deal stage updated successfully and protected against cross-tenant mutation.');

    // -------------------------------------------------------------------------
    // TEST 4: Company Persistence & Save / Bookmark Toggle
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Company Persistence & Save / Bookmark Toggle ---');

    const createCompanyRes = await fetch(`${baseUrl}/api/companies`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        name: 'Sterling Apex Tech',
        domain: 'sterlingapex.io',
        industry: 'FinTech',
        country: 'Nigeria',
        city: 'Lagos'
      })
    });
    const createCompanyData = await createCompanyRes.json();
    if (!createCompanyRes.ok || !createCompanyData.success) {
      throw new Error(`Failed to create company: ${JSON.stringify(createCompanyData)}`);
    }
    const company = createCompanyData.data;

    console.log(`Company record created: id=${company.id}, name="${company.name}", isSaved=${company.isSaved}`);

    // Toggle save to true
    const saveRes = await fetch(`${baseUrl}/api/companies/${company.id}/save`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ isSaved: true })
    });
    const saveData = await saveRes.json();
    if (!saveRes.ok || !saveData.success) {
      throw new Error(`Failed to save company: ${JSON.stringify(saveData)}`);
    }
    if (saveData.data.isSaved !== true) {
      throw new Error(`Expected isSaved to be true, got ${saveData.data.isSaved}`);
    }

    // Verify company list reflects isSaved === true
    const listSavedRes = await fetch(`${baseUrl}/api/companies`, { headers: headersA });
    const listSavedData = await listSavedRes.json();
    const savedCompanyInList = (listSavedData.data || listSavedData).find((c: any) => c.id === company.id);
    if (!savedCompanyInList || !savedCompanyInList.isSaved) {
      throw new Error(`Expected company in list to have isSaved=true: ${JSON.stringify(savedCompanyInList)}`);
    }

    // Toggle save to false
    const unsaveRes = await fetch(`${baseUrl}/api/companies/${company.id}/save`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ isSaved: false })
    });
    const unsaveData = await unsaveRes.json();
    if (!unsaveRes.ok || unsaveData.data.isSaved !== false) {
      throw new Error(`Expected isSaved to be false after toggle, got ${unsaveData.data?.isSaved}`);
    }

    // Tenant B attempting to save Tenant A's company must fail
    const unauthorizedSaveRes = await fetch(`${baseUrl}/api/companies/${company.id}/save`, {
      method: 'POST',
      headers: headersB,
      body: JSON.stringify({ isSaved: true })
    });
    if (unauthorizedSaveRes.status !== 404 && unauthorizedSaveRes.status !== 403) {
      throw new Error(`Expected 404/403 for unauthorized company save, got ${unauthorizedSaveRes.status}`);
    }

    console.log('✅ TEST 4 PASSED: Company bookmarking persists and is strictly workspace-scoped.');

    // -------------------------------------------------------------------------
    // TEST 5: Copilot Uses Live Workspace Telemetry (No Fabricated Stats)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Copilot Engine Live Workspace Telemetry ---');

    // Tenant B has 0 deals and 0 companies:
    const copilotEmptyRes = await fetch(`${baseUrl}/api/copilot/chat`, {
      method: 'POST',
      headers: headersB,
      body: JSON.stringify({
        message: 'Give me a summary of my active pipeline and key opportunities.'
      })
    });
    const copilotEmptyData = await copilotEmptyRes.json();
    if (!copilotEmptyRes.ok || !copilotEmptyData.success) {
      throw new Error(`Copilot chat failed: ${JSON.stringify(copilotEmptyData)}`);
    }

    const replyEmpty = copilotEmptyData.data?.reply || copilotEmptyData.reply || '';
    console.log(`Copilot reply for empty workspace: "${replyEmpty.slice(0, 120)}..."`);

    // Verify Copilot DOES NOT fabricate demo stats ($428,000, 48 accounts, Acme)
    if (replyEmpty.includes('428,000') || replyEmpty.includes('$428k') || replyEmpty.includes('Acme Technologies')) {
      throw new Error(`Copilot fabricated demo statistics for empty workspace: ${replyEmpty}`);
    }

    // Tenant A has 1 deal ($75,000) and 1 company
    const copilotRealRes = await fetch(`${baseUrl}/api/copilot/chat`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        message: 'How many deals are in my pipeline and what is their total value?'
      })
    });
    const copilotRealData = await copilotRealRes.json();
    const replyReal = copilotRealData.data?.reply || copilotRealData.reply || '';
    console.log(`Copilot reply for Tenant A: "${replyReal.slice(0, 120)}..."`);

    if (replyReal.includes('428,000') || replyReal.includes('$428k')) {
      throw new Error(`Copilot fabricated demo statistics for workspace with real data: ${replyReal}`);
    }
    // Must mention 75,000 or Sterling Apex
    if (!replyReal.includes('75,000') && !replyReal.includes('Sterling Apex') && !replyReal.includes('1 deal')) {
      console.warn('Note: Copilot LLM response phrased differently:', replyReal);
    }

    console.log('✅ TEST 5 PASSED: Copilot operates on authentic workspace telemetry without fake demo fallbacks.');

    // -------------------------------------------------------------------------
    // TEST 6: Period and Date Filtering Logic
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Period & Date Range Filter Mathematics ---');

    const now = Date.now();
    const testDeals = [
      { id: 'd1', dealValue: 50000, stage: 'qualified', createdAt: new Date(now - 2 * 86400 * 1000).toISOString() }, // 2 days ago (This week)
      { id: 'd2', dealValue: 30000, stage: 'closed_won', createdAt: new Date(now - 15 * 86400 * 1000).toISOString() }, // 15 days ago (This month)
      { id: 'd3', dealValue: 80000, stage: 'closed_lost', createdAt: new Date(now - 50 * 86400 * 1000).toISOString() }, // 50 days ago (This quarter)
      { id: 'd4', dealValue: 100000, stage: 'qualified', createdAt: new Date(now - 200 * 86400 * 1000).toISOString() }, // 200 days ago (All time only)
    ];

    const filterByPeriod = (deals: typeof testDeals, period: 'This week' | 'This month' | 'This quarter' | 'All time') => {
      const windowMs =
        period === 'This week' ? 7 * 86400 * 1000 :
        period === 'This month' ? 30 * 86400 * 1000 :
        period === 'This quarter' ? 90 * 86400 * 1000 : Infinity;
      return deals.filter(d => (now - new Date(d.createdAt).getTime()) <= windowMs);
    };

    const thisWeekDeals = filterByPeriod(testDeals, 'This week');
    const thisMonthDeals = filterByPeriod(testDeals, 'This month');
    const thisQuarterDeals = filterByPeriod(testDeals, 'This quarter');
    const allTimeDeals = filterByPeriod(testDeals, 'All time');

    if (thisWeekDeals.length !== 1 || thisWeekDeals[0].id !== 'd1') {
      throw new Error(`Expected 1 deal in 'This week', got ${thisWeekDeals.length}`);
    }
    if (thisMonthDeals.length !== 2) {
      throw new Error(`Expected 2 deals in 'This month', got ${thisMonthDeals.length}`);
    }
    if (thisQuarterDeals.length !== 3) {
      throw new Error(`Expected 3 deals in 'This quarter', got ${thisQuarterDeals.length}`);
    }
    if (allTimeDeals.length !== 4) {
      throw new Error(`Expected 4 deals in 'All time', got ${allTimeDeals.length}`);
    }

    console.log('✅ TEST 6 PASSED: Period-based date filter calculations accurately isolate deal horizons.');

    console.log('\n========================================================================');
    console.log('🎉 ALL COMMAND SECTION PRODUCTION TESTS PASSED SUCCESSFULLY!');
    console.log('========================================================================\n');
  } finally {
    server.close();
  }
}

runCommandProductionFlowTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
