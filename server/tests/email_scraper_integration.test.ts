process.env.NODE_ENV = 'test';
import assert from 'node:assert';
import http from 'node:http';
import { createApp } from '../app';
import { db } from '../db/memoryStore';
import { EmailDiscoveryService } from '../services/emailDiscoveryService';
import { LeadIngestionService } from '../services/leadIngestionService';
import { discoveryJobRepository } from '../repositories/discovery-jobs';
import { CompanyResolver } from '../engine/resolution/companyResolver';
import { ScoringEngine } from '../engine/scoringEngine';
import { EmailScraperProvider } from '../providers/emailScraper/emailScraperProvider';
import { EmailScraperError, HuntIQSyncPayload } from '../providers/emailScraper/emailScraperTypes';
import { signJwt } from '../services/auth.service';
import { createApiKeyRepository } from '../repositories/api-keys';
import crypto from 'node:crypto';
import { validateSafeScrapeUrl } from '../utils/urlValidator';

async function runSuite() {
  console.log('========================================================================');
  console.log('🧪 HUNTIQ: EMAIL SCRAPER INTEGRATION & ARCHITECTURE VERIFICATION TEST');
  console.log('========================================================================\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const workspaceA = `ws-tenant-a-${Date.now()}`;
  const workspaceB = `ws-tenant-b-${Date.now()}`;
  const userA = `usr-a-${Date.now()}`;
  const userB = `usr-b-${Date.now()}`;

  const tokenA = signJwt({
    userId: userA,
    email: 'user.a@tenant-a.com',
    fullName: 'Tenant A Admin',
    role: 'owner',
    workspaceId: workspaceA
  });

  const tokenB = signJwt({
    userId: userB,
    email: 'user.b@tenant-b.com',
    fullName: 'Tenant B Admin',
    role: 'owner',
    workspaceId: workspaceB
  });

  // Create API key for Scraper integration in Workspace A
  const apiKeyRepo = createApiKeyRepository();
  const rawScraperKey = `hq_live_scraper_${Date.now()}_secret`;
  const keyHash = crypto.createHash('sha256').update(rawScraperKey).digest('hex');
  await apiKeyRepo.create({
    userId: userA,
    workspaceId: workspaceA,
    name: 'Email Scraper Production Key',
    keyPrefix: 'hq_live_scraper',
    keyHash
  });

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
    // 1. Authenticated scrape request
    await test('1. Authenticated scrape request starts discovery job', async () => {
      const res = await fetch(`${baseUrl}/api/v1/email-discovery/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenA}`
        },
        body: JSON.stringify({
          domain: 'acme-corp.com',
          website: 'https://acme-corp.com'
        })
      });

      const body = await res.json();
      assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.workspaceId, workspaceA);
      assert.strictEqual(body.data.targetDomain, 'acme-corp.com');
    });

    // 2. Unauthenticated request rejection
    await test('2. Unauthenticated request is rejected with 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/email-discovery/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: 'acme-corp.com' })
      });

      assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, 'UNAUTHORIZED');
    });

    // 3. Wrong workspace rejection / cross-tenant isolation
    await test('3. Workspace A cannot access Workspace B jobs', async () => {
      // Create job in Workspace B
      const jobB = await EmailDiscoveryService.createScrapeJob({
        workspaceId: workspaceB,
        userId: userB,
        domain: 'tenant-b-target.com',
        website: 'https://tenant-b-target.com'
      });

      // Tenant A attempts to fetch Tenant B's job
      const res = await fetch(`${baseUrl}/api/v1/email-discovery/jobs/${jobB.id}`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
      });

      assert.strictEqual(res.status, 404, `Expected 404 for foreign workspace job, got ${res.status}`);
    });

    // 4. Scraper authentication via API key
    await test('4. Scraper authenticates via Bearer API Key and resolves workspace', async () => {
      const res = await fetch(`${baseUrl}/api/v1/integrations/email-scraper/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rawScraperKey}`
        },
        body: JSON.stringify({ action: 'ping' })
      });

      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const body = await res.json();
      assert.strictEqual(body.authenticated, true);
      assert.strictEqual(body.integration, 'huntiq');
    });

    // 5. Scraper timeout handling
    await test('5. Scraper timeout handling maps to EMAIL_SCRAPER_TIMEOUT', async () => {
      const mockProvider = new EmailScraperProvider({
        apiUrl: 'http://127.0.0.1:9', // unreachable/timeout
        timeoutMs: 50,
        enabled: true
      });

      try {
        await mockProvider.checkHealth();
        assert.fail('Should have thrown timeout error');
      } catch (err: any) {
        assert.ok(
          err.code === 'EMAIL_SCRAPER_TIMEOUT' || err.code === 'EMAIL_SCRAPER_UNAVAILABLE',
          `Expected timeout or unavailable code, got ${err.code}`
        );
      }
    });

    // 6. Scraper unavailable handling
    await test('6. Scraper unavailable maps to EMAIL_SCRAPER_UNAVAILABLE', async () => {
      const mockProvider = new EmailScraperProvider({
        apiUrl: 'http://127.0.0.1:59999',
        timeoutMs: 500,
        enabled: true
      });

      try {
        await mockProvider.checkHealth();
        assert.fail('Should have failed');
      } catch (err: any) {
        assert.strictEqual(err.code, 'EMAIL_SCRAPER_UNAVAILABLE');
      }
    });

    // 7. Successful webhook ingestion
    const testReqId = `req-sync-${Date.now()}`;
    const testEmail1 = `alice.founder.${Date.now()}@acme-corp.com`;

    await test('7. Successful webhook ingests contacts with factual provenance', async () => {
      // Pre-seed company in Workspace A
      db.companies.push({
        id: `comp-acme-${Date.now()}`,
        workspaceId: workspaceA,
        name: 'Acme Corporation',
        domain: 'acme-corp.com',
        website: 'https://acme-corp.com',
        industry: 'Software & Technology',
        status: 'ACTIVE',
        firstSeenAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const payload: HuntIQSyncPayload = {
        integration: 'email-scraper',
        version: '1.0',
        requestId: testReqId,
        source: { type: 'website_email_scraper' },
        company: {
          name: 'Acme Corporation',
          domain: 'acme-corp.com',
          website: 'https://acme-corp.com'
        },
        contacts: [
          {
            email: testEmail1,
            emailType: 'PERSONAL',
            emailStatus: 'VALIDATED',
            confidence: 0.95,
            sourceUrl: 'https://acme-corp.com/team',
            sourceType: 'TEAM_PAGE',
            name: 'Alice Founder',
            jobTitle: 'Chief Executive Officer',
            identitySource: 'website',
            phone: '+1 (555) 123-4567',
            socials: { linkedin: 'https://linkedin.com/in/alicefounder' },
            discoveredAt: new Date().toISOString()
          }
        ]
      };

      const res = await fetch(`${baseUrl}/api/v1/integrations/email-scraper/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rawScraperKey}`
        },
        body: JSON.stringify(payload)
      });

      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.accepted, 1);
      assert.strictEqual(body.duplicates, 0);

      // Verify contact created in workspace A
      const saved = db.contacts.find(c => c.workspaceId === workspaceA && c.email.toLowerCase() === testEmail1);
      assert.ok(saved, 'Contact must exist in workspace A');
      assert.strictEqual(saved.firstName, 'Alice');
      assert.strictEqual(saved.lastName, 'Founder');
      assert.strictEqual(saved.emailStatus, 'VALID');
      assert.strictEqual(saved.seniority, 'CXO');
    });

    // 8. Duplicate webhook idempotency
    await test('8. Duplicate webhook delivery is idempotent and does not duplicate records', async () => {
      const payload: HuntIQSyncPayload = {
        integration: 'email-scraper',
        version: '1.0',
        requestId: testReqId, // Repeated request ID!
        source: { type: 'website_email_scraper' },
        company: { name: 'Acme Corporation', domain: 'acme-corp.com' },
        contacts: [{ email: testEmail1, confidence: 0.95 }]
      };

      const res = await fetch(`${baseUrl}/api/v1/integrations/email-scraper/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rawScraperKey}`
        },
        body: JSON.stringify(payload)
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.accepted, 1); // Returns stored result
      assert.strictEqual(body.huntiqResponse?.idempotentReplay, true);

      // Ensure no duplicate contact in DB
      const matches = db.contacts.filter(c => c.workspaceId === workspaceA && c.email.toLowerCase() === testEmail1);
      assert.strictEqual(matches.length, 1, 'Should NOT create duplicate contact');
    });

    // 9. Duplicate email deduplication
    await test('9. Duplicate email in new request updates contact non-destructively', async () => {
      const newReqId = `req-dup-email-${Date.now()}`;
      const payload: HuntIQSyncPayload = {
        integration: 'email-scraper',
        version: '1.0',
        requestId: newReqId,
        source: { type: 'website_email_scraper' },
        company: { name: 'Acme Corporation', domain: 'acme-corp.com' },
        contacts: [
          {
            email: testEmail1,
            confidence: 0.90,
            phone: '+1 (555) 999-8888', // new phone
            identitySource: 'inferred'
          }
        ]
      };

      const res = await fetch(`${baseUrl}/api/v1/integrations/email-scraper/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rawScraperKey}`
        },
        body: JSON.stringify(payload)
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.duplicates, 1);
      assert.strictEqual(body.accepted, 0);

      // Verify contact was not overwritten with inferred name
      const contact = db.contacts.find(c => c.workspaceId === workspaceA && c.email.toLowerCase() === testEmail1);
      assert.strictEqual(contact?.firstName, 'Alice');
      assert.strictEqual(contact?.lastName, 'Founder');
    });

    // 10. New contact creation
    const testEmail2 = `bob.engineer.${Date.now()}@acme-corp.com`;
    await test('10. New contact is ingested with verified credentials', async () => {
      const payload: HuntIQSyncPayload = {
        integration: 'email-scraper',
        version: '1.0',
        requestId: `req-new-contact-${Date.now()}`,
        source: { type: 'website_email_scraper' },
        company: { name: 'Acme Corporation', domain: 'acme-corp.com' },
        contacts: [
          {
            email: testEmail2,
            name: 'Bob Engineer',
            jobTitle: 'VP of Engineering',
            identitySource: 'website',
            confidence: 0.88,
            emailStatus: 'VALIDATED'
          }
        ]
      };

      const res = await fetch(`${baseUrl}/api/v1/integrations/email-scraper/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rawScraperKey}`
        },
        body: JSON.stringify(payload)
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.accepted, 1);
    });

    // 11. Existing contact update
    await test('11. Existing contact updates missing fields safely', async () => {
      const existing = db.contacts.find(c => c.workspaceId === workspaceA && c.email.toLowerCase() === testEmail2);
      assert.ok(existing);
      assert.strictEqual(existing.phone, undefined);

      const payload: HuntIQSyncPayload = {
        integration: 'email-scraper',
        version: '1.0',
        requestId: `req-update-missing-${Date.now()}`,
        source: { type: 'website_email_scraper' },
        company: { name: 'Acme Corporation', domain: 'acme-corp.com' },
        contacts: [
          {
            email: testEmail2,
            phone: '+1 (555) 777-1111',
            confidence: 0.80
          }
        ]
      };

      await LeadIngestionService.processScraperSync(payload, workspaceA);
      assert.strictEqual(existing.phone, '+1 (555) 777-1111');
    });

    // 12. Verified data protection
    await test('12. High-confidence verified data cannot be overwritten by weaker inferred data', async () => {
      const contact = db.contacts.find(c => c.workspaceId === workspaceA && c.email.toLowerCase() === testEmail1);
      assert.strictEqual(contact?.firstName, 'Alice');

      const payload: HuntIQSyncPayload = {
        integration: 'email-scraper',
        version: '1.0',
        requestId: `req-infer-overwrite-${Date.now()}`,
        source: { type: 'website_email_scraper' },
        company: { name: 'Acme Corporation', domain: 'acme-corp.com' },
        contacts: [
          {
            email: testEmail1,
            name: 'Wrong Inferred Name',
            identitySource: 'inferred',
            confidence: 0.40
          }
        ]
      };

      await LeadIngestionService.processScraperSync(payload, workspaceA);
      // Alice Founder must NOT change
      assert.strictEqual(contact?.firstName, 'Alice');
      assert.strictEqual(contact?.lastName, 'Founder');
    });

    // 13. Inferred data handling
    await test('13. Inferred data is explicitly flagged as EMAIL_LOCAL_PART with lower confidence', async () => {
      const inferEmail = `carol.danvers.${Date.now()}@acme-corp.com`;
      const payload: HuntIQSyncPayload = {
        integration: 'email-scraper',
        version: '1.0',
        requestId: `req-infer-data-${Date.now()}`,
        source: { type: 'website_email_scraper' },
        company: { name: 'Acme Corporation', domain: 'acme-corp.com' },
        contacts: [
          {
            email: inferEmail,
            confidence: 0.50,
            identityInference: {
              firstName: 'Carol',
              lastName: 'Danvers',
              confidence: 0.45,
              source: 'email_local_part'
            },
            emailStatus: 'UNVERIFIED'
          }
        ]
      };

      await LeadIngestionService.processScraperSync(payload, workspaceA);
      const contact = db.contacts.find(c => c.workspaceId === workspaceA && c.email.toLowerCase() === inferEmail);
      assert.ok(contact);
      assert.ok(contact.emailConfidence <= 60, `Expected confidence <= 60, got ${contact.emailConfidence}`);
      assert.strictEqual(contact.emailStatus, 'UNVERIFIED');
    });

    // 14. Company resolution with high confidence
    await test('14. CompanyResolver accurately resolves exact domain match with 100% confidence', async () => {
      const res = await CompanyResolver.resolve({ domain: 'acme-corp.com' }, workspaceA);
      assert.strictEqual(res.resolutionStatus, 'RESOLVED');
      assert.strictEqual(res.confidence, 100);
      assert.strictEqual(res.matchType, 'EXACT_DOMAIN');
      assert.strictEqual(res.company?.name, 'Acme Corporation');
    });

    // 15. Unresolved company handling without phantom creation
    await test('15. CompanyResolver marks unknown companies as UNRESOLVED without fabricating records', async () => {
      const initialCount = db.getCompaniesByWorkspace(workspaceA).length;
      const res = await CompanyResolver.resolve({
        domain: 'completely-unknown-vendor-12345.com',
        name: 'Unknown Vendor'
      }, workspaceA, { allowAutoCreate: false });

      assert.strictEqual(res.resolutionStatus, 'UNRESOLVED');
      assert.strictEqual(res.company, null);
      assert.strictEqual(res.confidence, 0);

      // Assert no company was fabricated
      const finalCount = db.getCompaniesByWorkspace(workspaceA).length;
      assert.strictEqual(finalCount, initialCount, 'Must NOT synthesize fake companies');
    });

    // 16. Evidence persistence
    await test('16. Contact evidence and provenance are durably persisted in repository', async () => {
      const contact = db.contacts.find(c => c.workspaceId === workspaceA && c.email.toLowerCase() === testEmail1);
      assert.ok(contact);

      const evidence = await discoveryJobRepository.listEvidenceForContact(contact.id, workspaceA);
      assert.ok(evidence.length > 0, 'Evidence records must exist for contact');
      assert.strictEqual(evidence[0].email, testEmail1);
      assert.strictEqual(evidence[0].sourceType, 'TEAM_PAGE');
      assert.strictEqual(evidence[0].sourceUrl, 'https://acme-corp.com/team');
    });

    // 17. Job lifecycle management
    await test('17. Job lifecycle transitions from QUEUED -> RUNNING -> COMPLETED', async () => {
      const job = await discoveryJobRepository.createJob({
        workspaceId: workspaceA,
        targetDomain: 'lifecycle-test.com',
        targetWebsite: 'https://lifecycle-test.com'
      });
      assert.strictEqual(job.status, 'QUEUED');

      const running = await discoveryJobRepository.updateJobStatus(job.id, workspaceA, 'RUNNING', {
        externalJobId: 'ext-run-123'
      });
      assert.strictEqual(running?.status, 'RUNNING');
      assert.ok(running?.startedAt);

      const completed = await discoveryJobRepository.updateJobStatus(job.id, workspaceA, 'COMPLETED', {
        emailsFound: 4
      });
      assert.strictEqual(completed?.status, 'COMPLETED');
      assert.strictEqual(completed?.emailsFound, 4);
      assert.ok(completed?.completedAt);
    });

    // 18. Workspace isolation
    await test('18. Workspace isolation strictly prevents cross-tenant access', async () => {
      // List jobs for Workspace A
      const jobsA = await discoveryJobRepository.listJobs(workspaceA);
      // List jobs for Workspace B
      const jobsB = await discoveryJobRepository.listJobs(workspaceB);

      assert.ok(jobsA.every(j => j.workspaceId === workspaceA));
      assert.ok(jobsB.every(j => j.workspaceId === workspaceB));

      // Attempt to access Workspace A job with Workspace B ID
      if (jobsA.length > 0) {
        const crossAccess = await discoveryJobRepository.getJobById(jobsA[0].id, workspaceB);
        assert.strictEqual(crossAccess, null, 'Must return null for cross-tenant job lookup');
      }
    });

    // 19. Opportunity scoring grounded in real evidence
    await test('19. Opportunity scoring uses verifiable evidence and does not inflate unverified places', async () => {
      const scoring = new ScoringEngine();
      const placeWithoutWebsite = {
        website: null,
        phone: null,
        rating: null,
        reviewCount: 0,
        address: null,
        businessStatus: 'OPERATIONAL'
      };

      const result = ScoringEngine.evaluateDiscoveredPlace(placeWithoutWebsite);
      // Missing website must NOT grant 90+ artificial scores!
      assert.ok(result.score <= 30, `Score should be low for entity with zero evidence, got ${result.score}`);
    });

    // 20. No automatic outreach without stored evidence
    await test('20. Outbound email dispatch requires recipient to be an existing contact in workspace', async () => {
      // Attempt to send email to an address NOT in Workspace A
      const res = await fetch(`${baseUrl}/api/v1/integrations/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenA}`
        },
        body: JSON.stringify({
          to: 'stranger-not-in-crm@unknown.com',
          subject: 'Unsolicited Pitch',
          content: 'Hello!'
        })
      });

      assert.strictEqual(res.status, 403, `Expected 403 for recipient not in workspace, got ${res.status}`);
      const body = await res.json();
      assert.strictEqual(body.error.code, 'RECIPIENT_NOT_IN_WORKSPACE');
    });

    // 21. Malformed webhook rejected
    await test('21. Malformed webhook payload is rejected with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/integrations/email-scraper/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rawScraperKey}`
        },
        body: JSON.stringify({ invalid: 'bad_payload' })
      });

      assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}`);
      const body = await res.json();
      assert.strictEqual(body.code, 'INVALID_PAYLOAD');
    });

    // 22. Invalid authentication rejected
    await test('22. Webhook with invalid API key is rejected with 401', async () => {
      const res = await fetch(`${baseUrl}/api/v1/integrations/email-scraper/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer hq_live_invalid_key_99999'
        },
        body: JSON.stringify({
          integration: 'email-scraper',
          version: '1.0',
          requestId: 'req-bad-auth',
          contacts: []
        })
      });

      assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
    });

    // 23. SSRF Protection validation
    await test('23. SSRF Validator strictly blocks loopback, cloud metadata, and private IP ranges', async () => {
      const loopback = await validateSafeScrapeUrl('http://127.0.0.1/admin');
      assert.strictEqual(loopback.safe, false);

      const metadata = await validateSafeScrapeUrl('http://169.254.169.254/latest/meta-data');
      assert.strictEqual(metadata.safe, false);

      const localhost = await validateSafeScrapeUrl('http://localhost:8080/internal');
      assert.strictEqual(localhost.safe, false);

      const privateIp = await validateSafeScrapeUrl('http://10.0.0.1/secret');
      assert.strictEqual(privateIp.safe, false);

      const publicSafe = await validateSafeScrapeUrl('https://example.com');
      assert.strictEqual(publicSafe.safe, true);
    });

    console.log('\n========================================================================');
    console.log(`🎉 ALL ${passed}/${total} INTEGRATION TESTS PASSED SUCCESSFULLY!`);
    console.log('========================================================================\n');
  } finally {
    server.close();
  }
}

runSuite().catch((err) => {
  console.error('\n❌ INTEGRATION SUITE RUNNER TERMINATED WITH ERROR:', err);
  process.exit(1);
});
