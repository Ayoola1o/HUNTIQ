import assert from 'node:assert';
import http from 'node:http';
import { createApp } from '../app';
import { db } from '../db/memoryStore';
import { outreachRepository } from '../repositories/outreach';

async function runSuite() {
  console.log('========================================================================');
  console.log('📥 OPTION A: EXTERNAL SCRAPER LEAD & CONTACT INGESTION TEST');
  console.log('========================================================================\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const testWorkspace = `ws-ingest-${Date.now()}`;

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      throw err;
    }
  }

  try {
    await test('1. Successfully ingests external scraper contacts into HUNTIQ & generates review drafts', async () => {
      const email1 = `sarah.vance.${Date.now()}@novatech-solutions.io`;
      const email2 = `alex.miller.${Date.now()}@novatech-solutions.io`;

      const scraperPayload = {
        source: 'EXTERNAL_PLAYWRIGHT_SCRAPER',
        createOutreachDraft: true,
        leads: [
          {
            email: email1,
            name: 'Sarah Vance',
            jobTitle: 'VP of Engineering',
            companyName: 'NovaTech Solutions',
            website: 'https://novatech-solutions.io',
            phone: '+1 (555) 234-5678',
            mxStatus: 'deliverable',
            sourceUrl: 'https://novatech-solutions.io/about/leadership',
            socials: {
              linkedin: 'https://linkedin.com/in/sarah-vance-example',
              twitter: 'https://twitter.com/svance'
            }
          },
          {
            email: email2,
            firstName: 'Alex',
            lastName: 'Miller',
            jobTitle: 'Head of Growth',
            companyName: 'NovaTech Solutions',
            website: 'https://novatech-solutions.io',
            mxStatus: 'deliverable',
            sourceUrl: 'https://novatech-solutions.io/team'
          }
        ]
      };

      const res = await fetch(`${baseUrl}/api/v1/integrations/lead-ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': testWorkspace
        },
        body: JSON.stringify(scraperPayload)
      });

      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const json: any = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.totalReceived, 2);
      assert.strictEqual(json.data.ingestedCount, 2);
      assert.strictEqual(json.data.duplicateCount, 0);
      assert.strictEqual(json.data.outreachDraftsCount, 2);

      // Verify Contact records in memoryStore
      const contacts = db.contacts.filter(c => c.workspaceId === testWorkspace);
      assert.strictEqual(contacts.length, 2);
      const sarah = contacts.find(c => c.firstName === 'Sarah');
      assert.ok(sarah, 'Sarah contact not found');
      assert.strictEqual(sarah.lastName, 'Vance');
      assert.strictEqual(sarah.jobTitle, 'VP of Engineering');
      assert.strictEqual(sarah.emailStatus, 'VALID');

      // Verify Company was created
      const companies = db.companies.filter(c => c.workspaceId === testWorkspace);
      assert.strictEqual(companies.length, 1);
      assert.strictEqual(companies[0].name, 'NovaTech Solutions');
      assert.strictEqual(sarah.companyId, companies[0].id);

      // Verify Outreach Drafts created for review
      const outreachItems = await outreachRepository.list(testWorkspace);
      const drafts = outreachItems.filter(o => o.companyName === 'NovaTech Solutions');
      assert.strictEqual(drafts.length, 2);
      assert.strictEqual(drafts[0].status, 'draft');
      assert.strictEqual(drafts[0].thread[0].status, 'draft');
      assert.ok(drafts[0].subject.includes('NovaTech Solutions'));
    });

    await test('2. Handles deduplication gracefully when same contact is ingested again', async () => {
      const email = `sarah.vance.dedup@novatech-solutions.io`;
      const payload = {
        leads: [
          {
            email,
            name: 'Sarah Vance',
            companyName: 'NovaTech Solutions'
          }
        ]
      };

      // First call
      const res1 = await fetch(`${baseUrl}/api/v1/integrations/lead-ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': testWorkspace },
        body: JSON.stringify(payload)
      });
      const json1: any = await res1.json();
      assert.strictEqual(json1.data.ingestedCount, 1);

      // Second call (duplicate)
      const res2 = await fetch(`${baseUrl}/api/v1/integrations/lead-ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': testWorkspace },
        body: JSON.stringify(payload)
      });
      const json2: any = await res2.json();
      assert.strictEqual(json2.data.ingestedCount, 0);
      assert.strictEqual(json2.data.duplicateCount, 1);
    });

    await test('3. Accepts direct array of ScrapedEmailRecord for maximum scraper ease', async () => {
      const rawRecords = [
        {
          email: `direct.scraper.${Date.now()}@globaltech.com`,
          name: 'Morgan Stanley',
          jobTitle: 'Investment Lead',
          domain: 'globaltech.com',
          sourceUrl: 'https://globaltech.com/contacts'
        }
      ];

      const res = await fetch(`${baseUrl}/api/v1/integrations/lead-ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': testWorkspace },
        body: JSON.stringify(rawRecords)
      });

      assert.strictEqual(res.status, 200);
      const json: any = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.ingestedCount, 1);
    });

    await test('4. Status endpoint returns accurate workspace metrics', async () => {
      const res = await fetch(`${baseUrl}/api/v1/integrations/lead-ingest/status`, {
        headers: { 'x-workspace-id': testWorkspace }
      });
      assert.strictEqual(res.status, 200);
      const json: any = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.workspaceId, testWorkspace);
      assert.ok(json.data.ingestedContactsCount >= 3);
      assert.ok(Array.isArray(json.data.recentIngested));
    });

    console.log(`\n🎉 All ${passed}/${total} Option A Ingestion tests PASSED!\n`);
  } finally {
    server.close();
  }
}

runSuite().catch((err) => {
  console.error('\n❌ Test Suite Failed:\n', err);
  process.exit(1);
});
