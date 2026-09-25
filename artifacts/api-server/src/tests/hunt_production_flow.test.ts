import http from 'http';
import { createApp } from '../app';
import { ensureDatabaseMigrated } from '../database/migrate';

async function runHuntProductionFlowTests() {
  console.log('========================================================================');
  console.log('🏹  HUNT SECTION PRODUCTION FUNCTIONAL FLOW TEST SUITE');
  console.log('========================================================================');

  await ensureDatabaseMigrated();

  const app = createApp();
  const PORT = 3108;
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
    // SETUP: Register two isolated tenants
    // -------------------------------------------------------------------------
    console.log('\n--- Setup: Registering Isolated Tenants ---');
    const tenantAEmail = `hunt_tenant_a_${Date.now()}@huntiq-test.io`;
    const resA = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: tenantAEmail,
        password: 'Password123!',
        fullName: 'Hunt Tenant A User',
        companyName: 'Hunt Tenant A Ventures'
      })
    });
    const dataA = await resA.json();
    const tokenA = dataA.data?.token || dataA.token;
    const workspaceIdA = dataA.data?.user?.workspaceId || dataA.data?.workspace?.id || dataA.workspace?.id;

    if (!tokenA || !workspaceIdA) {
      throw new Error(`Failed to create Tenant A: ${JSON.stringify(dataA)}`);
    }

    const tenantBEmail = `hunt_tenant_b_${Date.now()}@huntiq-test.io`;
    const resB = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: tenantBEmail,
        password: 'Password123!',
        fullName: 'Hunt Tenant B User',
        companyName: 'Hunt Tenant B Capital'
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
    // TEST 1: Strict Zero Demo Data Policy for Brand New Tenants
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 1: Authentic Clean Empty Workspace (No Demo Fallbacks) ---');

    const [contactsRes, savedSearchesRes, researchRes] = await Promise.all([
      fetch(`${baseUrl}/api/contacts`, { headers: headersA }),
      fetch(`${baseUrl}/api/saved-searches`, { headers: headersA }),
      fetch(`${baseUrl}/api/research/reports`, { headers: headersA })
    ]);

    const contactsData = await contactsRes.json();
    const savedSearchesData = await savedSearchesRes.json();
    const researchData = await researchRes.json();

    const contactsList = contactsData.data?.contacts ?? contactsData.contacts ?? [];
    const searchesList = savedSearchesData.data?.searches ?? savedSearchesData.searches ?? [];
    const reportsList = researchData.data?.reports ?? researchData.reports ?? [];

    console.log(`Tenant A Initial Counts -> Contacts: ${contactsList.length}, Saved Searches: ${searchesList.length}, Research Reports: ${reportsList.length}`);

    if (contactsList.length !== 0) {
      throw new Error(`Expected clean empty contacts list for new workspace, got ${contactsList.length}`);
    }
    if (searchesList.length !== 0) {
      throw new Error(`Expected clean empty saved searches for new workspace, got ${searchesList.length}`);
    }
    if (reportsList.length !== 0) {
      throw new Error(`Expected clean empty research reports for new workspace, got ${reportsList.length}`);
    }

    console.log('✅ TEST 1 PASSED: Strict zero demo data confirmed across all HUNT endpoints.');

    // -------------------------------------------------------------------------
    // TEST 2: Contacts CRUD & Multi-Tenant Workspace Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Contacts CRUD & Multi-Tenant Isolation ---');

    // Create contact in Workspace A
    const createContactRes = await fetch(`${baseUrl}/api/contacts`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        name: 'Adebayo Adeleke',
        email: 'adebayo@lagostech.io',
        role: 'Chief Technology Officer',
        companyName: 'Lagos Tech Hub',
        companyLocation: 'Lagos, Nigeria',
        decisionRole: 'Decision Maker',
        influenceScore: 92,
        influenceLevel: 'High',
        opportunityFitScore: 88,
        opportunityFitLevel: 'High',
        phone: '+234 801 234 5678',
        source: 'Apollo'
      })
    });

    const createdContactJson = await createContactRes.json();
    const contactA = createdContactJson.data || createdContactJson;

    if (!contactA || !contactA.id) {
      throw new Error(`Failed to create contact for Tenant A: ${JSON.stringify(createdContactJson)}`);
    }

    console.log(`Created contact in Workspace A: ${contactA.id} (${contactA.name})`);

    // Verify Workspace A can fetch this contact
    const listARes = await fetch(`${baseUrl}/api/contacts`, { headers: headersA });
    const listAJson = await listARes.json();
    const listAContacts = listAJson.data?.contacts ?? listAJson.contacts ?? [];

    if (listAContacts.length !== 1 || listAContacts[0].id !== contactA.id) {
      throw new Error(`Expected Workspace A to have 1 contact matching created ID, got: ${JSON.stringify(listAContacts)}`);
    }

    // CRITICAL ISOLATION CHECK: Verify Workspace B cannot see Workspace A's contact
    const listBRes = await fetch(`${baseUrl}/api/contacts`, { headers: headersB });
    const listBJson = await listBRes.json();
    const listBContacts = listBJson.data?.contacts ?? listBJson.contacts ?? [];

    if (listBContacts.length !== 0) {
      throw new Error(`SECURITY BREACH: Workspace B can see contacts from Workspace A! Got ${listBContacts.length} items`);
    }

    // Verify Workspace B cannot fetch Workspace A's contact by ID
    const getBRes = await fetch(`${baseUrl}/api/contacts/${contactA.id}`, { headers: headersB });
    if (getBRes.status !== 404 && getBRes.status !== 403) {
      const getBData = await getBRes.json();
      throw new Error(`SECURITY BREACH: Workspace B accessed Workspace A contact by ID with status ${getBRes.status}: ${JSON.stringify(getBData)}`);
    }

    // Update contact in Workspace A via PATCH
    const updateContactRes = await fetch(`${baseUrl}/api/contacts/${contactA.id}`, {
      method: 'PATCH',
      headers: headersA,
      body: JSON.stringify({
        role: 'VP of Engineering & Architecture',
        influenceScore: 96
      })
    });
    const updatedContactJson = await updateContactRes.json();
    const updatedContact = updatedContactJson.data || updatedContactJson;

    if (updatedContact.role !== 'VP of Engineering & Architecture') {
      throw new Error(`Failed to update contact role: ${JSON.stringify(updatedContact)}`);
    }

    // Delete contact in Workspace A
    const deleteContactRes = await fetch(`${baseUrl}/api/contacts/${contactA.id}`, {
      method: 'DELETE',
      headers: headersA
    });

    if (!deleteContactRes.ok) {
      throw new Error(`Failed to delete contact: ${deleteContactRes.statusText}`);
    }

    const listAAfterDeleteRes = await fetch(`${baseUrl}/api/contacts`, { headers: headersA });
    const listAAfterDeleteJson = await listAAfterDeleteRes.json();
    const listAAfterDeleteContacts = listAAfterDeleteJson.data?.contacts ?? listAAfterDeleteJson.contacts ?? [];

    if (listAAfterDeleteContacts.length !== 0) {
      throw new Error(`Expected 0 contacts in Workspace A after deletion, got ${listAAfterDeleteContacts.length}`);
    }

    console.log('✅ TEST 2 PASSED: Contacts CRUD and multi-tenant isolation verified.');

    // -------------------------------------------------------------------------
    // TEST 3: Saved Searches CRUD, Execution & Workspace Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Saved Searches CRUD & Multi-Tenant Isolation ---');

    // Create saved search in Workspace A
    const createSearchRes = await fetch(`${baseUrl}/api/saved-searches`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        name: 'West Africa FinTech Series A',
        description: 'B2B payment infrastructure startups in Lagos and Accra',
        searchType: 'ai_search',
        naturalQuery: 'Fintech Series A hiring engineers',
        monitoringEnabled: true,
        filters: {
          industries: ['Financial Technology', 'Software'],
          locations: ['Lagos, Nigeria', 'Accra, Ghana'],
          companySizes: ['50 – 500']
        },
        signalsToWatch: ['Hiring Surge', 'Funding Round']
      })
    });

    const createdSearchJson = await createSearchRes.json();
    const searchA = createdSearchJson.data || createdSearchJson;

    if (!searchA || !searchA.id) {
      throw new Error(`Failed to create saved search for Tenant A: ${JSON.stringify(createdSearchJson)}`);
    }

    console.log(`Created saved search in Workspace A: ${searchA.id} ("${searchA.name}")`);

    // Verify Workspace A gets the saved search
    const getSearchesARes = await fetch(`${baseUrl}/api/saved-searches`, { headers: headersA });
    const getSearchesAJson = await getSearchesARes.json();
    const searchesA = getSearchesAJson.data?.searches ?? getSearchesAJson.searches ?? [];

    if (searchesA.length !== 1 || searchesA[0].id !== searchA.id) {
      throw new Error(`Expected Workspace A to have 1 saved search, got: ${searchesA.length}`);
    }

    // CRITICAL ISOLATION CHECK: Workspace B must have 0 saved searches
    const getSearchesBRes = await fetch(`${baseUrl}/api/saved-searches`, { headers: headersB });
    const getSearchesBJson = await getSearchesBRes.json();
    const searchesB = getSearchesBJson.data?.searches ?? getSearchesBJson.searches ?? [];

    if (searchesB.length !== 0) {
      throw new Error(`SECURITY BREACH: Workspace B can see saved searches from Workspace A! Got ${searchesB.length} items`);
    }

    // Run saved search on-demand in Workspace A
    const runSearchRes = await fetch(`${baseUrl}/api/saved-searches/${searchA.id}/run`, {
      method: 'POST',
      headers: headersA
    });
    const runSearchJson = await runSearchRes.json();
    const ranSearch = runSearchJson.data || runSearchJson;

    if (!ranSearch || !ranSearch.lastRunAt) {
      throw new Error(`Expected lastRunAt to be updated after running search: ${JSON.stringify(runSearchJson)}`);
    }

    // Toggle monitoring in Workspace A via toggle-monitoring route
    const toggleRes = await fetch(`${baseUrl}/api/saved-searches/${searchA.id}/toggle-monitoring`, {
      method: 'POST',
      headers: headersA
    });
    const toggledJson = await toggleRes.json();
    const toggledSearch = toggledJson.data || toggledJson;

    if (toggledSearch.monitoringEnabled !== false) {
      throw new Error(`Expected search monitoring to be toggled off: ${JSON.stringify(toggledSearch)}`);
    }

    // Delete saved search in Workspace A
    const deleteSearchRes = await fetch(`${baseUrl}/api/saved-searches/${searchA.id}`, {
      method: 'DELETE',
      headers: headersA
    });

    if (!deleteSearchRes.ok) {
      throw new Error(`Failed to delete saved search: ${deleteSearchRes.statusText}`);
    }

    const postDeleteSearchesRes = await fetch(`${baseUrl}/api/saved-searches`, { headers: headersA });
    const postDeleteSearchesJson = await postDeleteSearchesRes.json();
    const postDeleteSearches = postDeleteSearchesJson.data?.searches ?? postDeleteSearchesJson.searches ?? [];

    if (postDeleteSearches.length !== 0) {
      throw new Error(`Expected 0 saved searches in Workspace A after deletion, got ${postDeleteSearches.length}`);
    }

    console.log('✅ TEST 3 PASSED: Saved searches CRUD, execution, and workspace isolation verified.');

    // -------------------------------------------------------------------------
    // TEST 4: Company Persistence & Bookmarking Toggle
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Company Persistence & Bookmarking Toggle ---');

    // Create a target company in Workspace A
    const createCompanyRes = await fetch(`${baseUrl}/api/companies`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        name: 'Helium Health Tech',
        domain: 'heliumhealth.com',
        industry: 'Healthcare Technology',
        location: 'Lagos, Nigeria',
        employeeCount: 180,
        revenue: '$15M',
        opportunityScore: 91,
        buyingIntent: 'high'
      })
    });

    const createCompanyJson = await createCompanyRes.json();
    const companyA = createCompanyJson.data || createCompanyJson;

    if (!companyA || !companyA.id) {
      throw new Error(`Failed to create company for Tenant A: ${JSON.stringify(createCompanyJson)}`);
    }

    // Toggle bookmark ON
    const bookmarkOnRes = await fetch(`${baseUrl}/api/companies/${companyA.id}/save`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ isSaved: true })
    });
    const bookmarkOnJson = await bookmarkOnRes.json();
    const savedComp = bookmarkOnJson.data || bookmarkOnJson;

    if (savedComp.isSaved !== true) {
      throw new Error(`Expected isSaved: true on bookmarking company: ${JSON.stringify(bookmarkOnJson)}`);
    }

    // Toggle bookmark OFF
    const bookmarkOffRes = await fetch(`${baseUrl}/api/companies/${companyA.id}/save`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({ isSaved: false })
    });
    const bookmarkOffJson = await bookmarkOffRes.json();
    const unsavedComp = bookmarkOffJson.data || bookmarkOffJson;

    if (unsavedComp.isSaved !== false) {
      throw new Error(`Expected isSaved: false after toggling bookmark off: ${JSON.stringify(bookmarkOffJson)}`);
    }

    console.log('✅ TEST 4 PASSED: Company bookmarking toggle and persistence verified.');

    // -------------------------------------------------------------------------
    // TEST 5: Company Research Dossier Generation & Refresh
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Research Dossier Generation & Real KPI Computation ---');

    const generateReportRes = await fetch(`${baseUrl}/api/research/reports`, {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({
        companyName: 'Moniepoint Financial',
        domain: 'moniepoint.com'
      })
    });

    const reportJson = await generateReportRes.json();
    const report = reportJson.data || reportJson;

    if (!report || !report.id || report.companyName !== 'Moniepoint Financial') {
      throw new Error(`Failed to generate research report: ${JSON.stringify(reportJson)}`);
    }

    console.log(`Generated research report: ${report.id} for ${report.companyName}`);

    // Verify report appears in research list with computed KPIs
    const listReportsRes = await fetch(`${baseUrl}/api/research/reports`, { headers: headersA });
    const listReportsJson = await listReportsRes.json();
    const reports = listReportsJson.data?.reports ?? listReportsJson.reports ?? [];
    const kpis = listReportsJson.data?.kpiSummary ?? listReportsJson.kpiSummary;

    if (reports.length !== 1 || reports[0].id !== report.id) {
      throw new Error(`Expected 1 report in research list, got ${reports.length}`);
    }

    if (!kpis || kpis.totalReports !== 1) {
      throw new Error(`Expected kpiSummary.totalReports === 1, got: ${JSON.stringify(kpis)}`);
    }

    // Refresh research report
    const refreshRes = await fetch(`${baseUrl}/api/research/reports/${report.id}/refresh`, {
      method: 'POST',
      headers: headersA
    });
    const refreshedJson = await refreshRes.json();
    const refreshed = refreshedJson.data || refreshedJson;

    if (!refreshed || refreshed.id !== report.id) {
      throw new Error(`Failed to refresh research report: ${JSON.stringify(refreshedJson)}`);
    }

    console.log('✅ TEST 5 PASSED: Research dossier generation, refresh, and dynamic KPIs verified.');

    console.log('\n========================================================================');
    console.log('🎉 ALL HUNT SECTION PRODUCTION TESTS PASSED WITH 100% SUCCESS!');
    console.log('========================================================================\n');
  } finally {
    server.close();
  }
}

runHuntProductionFlowTests().catch((err) => {
  console.error('\n❌ HUNT TEST SUITE FAILED:', err);
  process.exit(1);
});
