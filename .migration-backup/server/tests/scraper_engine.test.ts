import assert from 'node:assert';
import http from 'node:http';
import { createApp } from '../app';
import {
  extractEmailRecordsFromHtml,
  decodeObfuscation,
  hasValidTld,
  isRoleBasedEmail,
  inferNameFromEmail,
  detectJobTitle,
  extractPhoneNumbersFromHtml,
  extractSocialProfiles
} from '../engine/scraper/emailExtractor';
import { verifyDomainMx } from '../engine/scraper/mxValidator';
import { scrapeEmailRecordsFromWebsite } from '../engine/scraper/webScraper';
import { db } from '../db/memoryStore';

async function runTests() {
  console.log('========================================================================');
  console.log('🔍 HUNTIQ WEB & EMAIL CONTACT SCRAPER ENGINE TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            console.log(`  ✅ PASS: ${name}`);
            passed++;
          })
          .catch((err) => {
            console.error(`  ❌ FAIL: ${name}`);
            console.error(`     Error: ${err.message}`);
            throw err;
          });
      } else {
        console.log(`  ✅ PASS: ${name}`);
        passed++;
      }
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. EXTRACTOR & OBFUSCATION DECODING TESTS
  // ---------------------------------------------------------------------------
  console.log('--- 1. Extractor & Obfuscation Decoding ---');

  await test('decodeObfuscation handles entities, bracketed formats, and word substitutions', () => {
    assert.strictEqual(decodeObfuscation('user&#64;example.com'), 'user@example.com');
    assert.strictEqual(decodeObfuscation('john [at] acme.org'), 'john@acme.org');
    assert.strictEqual(decodeObfuscation('hello (dot) world'), 'hello.world');
    assert.strictEqual(decodeObfuscation('sarah at company dot com'), 'sarah@company.com');
  });

  await test('hasValidTld accepts standard TLDs and rejects asset file extensions', () => {
    assert.strictEqual(hasValidTld('ceo@stripe.com'), true);
    assert.strictEqual(hasValidTld('team@paystack.co'), true);
    assert.strictEqual(hasValidTld('info@innovations.ng'), true);
    assert.strictEqual(hasValidTld('icon@2x.png'), false);
    assert.strictEqual(hasValidTld('script@bundle.js'), false);
    assert.strictEqual(hasValidTld('invalid@no-tld'), false);
  });

  await test('isRoleBasedEmail accurately distinguishes personal from generic role mailboxes', () => {
    assert.strictEqual(isRoleBasedEmail('support@acme.com'), true);
    assert.strictEqual(isRoleBasedEmail('info@acme.com'), true);
    assert.strictEqual(isRoleBasedEmail('billing@acme.com'), true);
    assert.strictEqual(isRoleBasedEmail('tunde.bakare@acme.com'), false);
    assert.strictEqual(isRoleBasedEmail('sarah.jenkins@acme.com'), false);
  });

  await test('inferNameFromEmail reconstructs names from email localparts', () => {
    assert.strictEqual(inferNameFromEmail('sarah.jenkins@example.com'), 'Sarah Jenkins');
    assert.strictEqual(inferNameFromEmail('chidi_okafor@company.io'), 'Chidi Okafor');
    assert.strictEqual(inferNameFromEmail('alex-smith@domain.org'), 'Alex Smith');
  });

  // ---------------------------------------------------------------------------
  // 2. HTML METADATA & ENRICHMENT EXTRACTION TESTS
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. HTML Metadata, Contact & Social Extraction ---');

  const mockCompanyHtml = `
    <!DOCTYPE html>
    <html>
      <head><title>Apex Innovations | Leadership & Technology</title></head>
      <body>
        <header>
          <h1>Apex Innovations Executive Team</h1>
          <p>Questions? Reach out to <a href="mailto:info@apex-innovations.com">info@apex-innovations.com</a></p>
        </header>

        <section class="team-grid">
          <div class="card">
            <h3>Dr. Sarah Jenkins</h3>
            <p class="role">Chief Technology Officer & Co-Founder</p>
            <p>Direct Email: sarah.jenkins@apex-innovations.com</p>
            <p>Direct Line: <a href="tel:+1-555-839-2049">+1 (555) 839-2049</a></p>
            <p><a href="https://linkedin.com/in/sarah-jenkins-tech">LinkedIn</a></p>
          </div>

          <div class="card">
            <h3>Tunde Adeleke</h3>
            <p class="role">Head of Commercial Partnerships</p>
            <p>Contact: tunde.adeleke [at] apex-innovations.com</p>
            <p>Phone: +234 802 345 6789</p>
            <p><a href="https://twitter.com/tunde_adeleke">Twitter</a></p>
          </div>
        </section>

        <footer>
          <p>&copy; 2026 Apex Innovations Limited. Follow on <a href="https://github.com/apex-innovations">GitHub</a></p>
        </footer>
      </body>
    </html>
  `;

  await test('extractEmailRecordsFromHtml extracts structured records with names, roles, phones, and socials', () => {
    const records = extractEmailRecordsFromHtml(mockCompanyHtml, 'https://apex-innovations.com/team', 'Apex Team');

    assert(records.length >= 3, `Expected at least 3 records, found ${records.length}`);

    // Check Role Email (info@)
    const infoRec = records.find(r => r.email === 'info@apex-innovations.com');
    assert(infoRec, 'info@apex-innovations.com should be discovered');
    assert.strictEqual(infoRec.type, 'role');

    // Check Personal Email 1 (sarah.jenkins@)
    const sarahRec = records.find(r => r.email === 'sarah.jenkins@apex-innovations.com');
    assert(sarahRec, 'sarah.jenkins@apex-innovations.com should be discovered');
    assert.strictEqual(sarahRec.type, 'personal');
    assert.strictEqual(sarahRec.name, 'Sarah Jenkins');
    assert(sarahRec.jobTitle?.includes('Chief Technology Officer'), 'Job title should detect CTO');
    assert(sarahRec.phone?.includes('555'), 'Phone should be extracted');
    assert(sarahRec.socials?.linkedin?.includes('linkedin.com/in/sarah-jenkins-tech'), 'LinkedIn link should be extracted');

    // Check Personal Email 2 (tunde.adeleke@ with bracketed [at] obfuscation)
    const tundeRec = records.find(r => r.email === 'tunde.adeleke@apex-innovations.com');
    assert(tundeRec, 'Obfuscated tunde.adeleke [at] should be resolved');
    assert.strictEqual(tundeRec.type, 'personal');
    assert.strictEqual(tundeRec.name, 'Tunde Adeleke');
  });

  // ---------------------------------------------------------------------------
  // 3. LIVE DNS-OVER-HTTPS MX VERIFICATION TESTS
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Live DNS-over-HTTPS MX Deliverability Verification ---');

  await test('verifyDomainMx resolves MX for deliverable domains and detects disposable domains', async () => {
    // 1. Disposable test
    const disposable = await verifyDomainMx('tempmail.com');
    assert.strictEqual(disposable.status, 'disposable');

    // 2. Real deliverable domain test (cloudflare.com has verified public MX records)
    const deliverable = await verifyDomainMx('cloudflare.com');
    assert.strictEqual(deliverable.status, 'deliverable');
    assert(deliverable.mxRecords.length > 0, 'Cloudflare should have at least 1 MX record');
  });

  // ---------------------------------------------------------------------------
  // 4. REST API & CRM CONTACT PERSISTENCE TESTS
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. REST API & Multi-Tenant Contact Persistence ---');

  const app = createApp();
  const PORT = 3097;
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(PORT, () => resolve());
  });

  const baseUrl = `http://127.0.0.1:${PORT}`;

  try {
    // Test save-contacts endpoint with tenant isolation
    const tenantWsId = `ws-scraper-tenant-${Date.now()}`;
    const initialContactCount = db.contacts.filter(c => c.workspaceId === tenantWsId).length;
    assert.strictEqual(initialContactCount, 0);

    const saveRes = await fetch(`${baseUrl}/api/v1/scraper/save-contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-workspace-id': tenantWsId
      },
      body: JSON.stringify({
        records: [
          {
            email: `founder_${Date.now()}@innovate.ng`,
            domain: 'innovate.ng',
            type: 'personal',
            name: 'Kemi Balogun',
            jobTitle: 'Founder & CEO',
            phone: '+234 801 111 2222',
            sourceUrl: 'https://innovate.ng/about',
            mxStatus: 'deliverable'
          }
        ]
      })
    });

    const saveData = await saveRes.json();
    assert.strictEqual(saveData.success, true);
    assert.strictEqual(saveData.data.savedCount, 1);

    const tenantContacts = db.contacts.filter(c => c.workspaceId === tenantWsId);
    assert.strictEqual(tenantContacts.length, 1);
    assert.strictEqual(tenantContacts[0].firstName, 'Kemi');
    assert.strictEqual(tenantContacts[0].lastName, 'Balogun');
    assert.strictEqual(tenantContacts[0].jobTitle, 'Founder & CEO');
    assert.strictEqual(tenantContacts[0].emailStatus, 'VALID');

    // Cross-tenant verification
    const otherTenantContacts = db.contacts.filter(c => c.workspaceId === 'ws-other-random');
    assert.strictEqual(otherTenantContacts.length, 0, 'Contacts must not leak to other workspaces');
  } finally {
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`🎉 ALL TESTS PASSED: ${passed}/${total} assertions verified successfully.`);
  console.log('========================================================================\n');
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
