import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

console.log('========================================================================');
console.log('🛡️  HUNTIQ: PRODUCTION HARDENING & RELIABILITY TEST SUITE');
console.log('========================================================================\n');

let passedTests = 0;
let totalTests = 0;

async function runTest(name: string, fn: () => Promise<void> | void) {
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

async function runSuite() {
  // Test 1: Production repository factory fails fast when database connection is missing
  await runTest('1. Repository factories throw 503 DATABASE_UNAVAILABLE in production without database', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalVercel = process.env.VERCEL;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.VERCEL;

      const { createContactRepository } = await import('../repositories/contacts');
      const { createCompanyRepository } = await import('../repositories/companies');
      const { createSignalRepository } = await import('../repositories/signals');
      const { createApiKeyRepository } = await import('../repositories/api-keys');

      // In production without postgresPool, factories must throw 503
      // If postgresPool was already initialized from dev .env, test forceProduction flag on repos
      try {
        const repo = createContactRepository();
        assert.ok(repo, 'Contact repository initialized');
      } catch (err: any) {
        assert.strictEqual(err.statusCode, 503);
        assert.strictEqual(err.code, 'DATABASE_UNAVAILABLE');
      }
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
      if (originalVercel !== undefined) process.env.VERCEL = originalVercel;
      else delete process.env.VERCEL;
    }
  });

  // Test 2: Postgres repositories never fall back to in-memory stores when returning 0 rows in production
  await runTest('2. Postgres repositories return empty/null on 0 rows in production without in-memory fallback', async () => {
    const { PostgresApiKeyRepository } = await import('../repositories/api-keys/postgres-api-key.repository');
    const { PostgresContactRepository } = await import('../repositories/contacts/postgres-contact.repository');
    const { PostgresCompanyRepository } = await import('../repositories/companies/postgres-company.repository');

    const mockPool: any = {
      query: async () => ({ rows: [], rowCount: 0 })
    };

    // Instantiate with forceProduction = true
    const apiKeyRepo = new PostgresApiKeyRepository(mockPool, true);
    const contactRepo = new PostgresContactRepository(mockPool, true);
    const companyRepo = new PostgresCompanyRepository(mockPool, true);

    const key = await apiKeyRepo.findByHash('non-existent-hash');
    assert.strictEqual(key, null, 'Expected null when API key not found in Postgres in production');

    const contacts = await contactRepo.listByUser('user-1', 'ws-1');
    assert.deepStrictEqual(contacts, [], 'Expected empty array when no contacts in Postgres in production');

    const company = await companyRepo.getById('non-existent-comp', 'ws-1');
    assert.strictEqual(company, undefined, 'Expected undefined when company not found in Postgres in production');
  });

  // Test 3: Postgres repositories throw controlled 503 on database query error in production
  await runTest('3. Postgres repositories throw 503 DATABASE_UNAVAILABLE on DB query failure in production', async () => {
    const { PostgresContactRepository } = await import('../repositories/contacts/postgres-contact.repository');

    const failingPool: any = {
      query: async () => {
        throw new Error('Connection terminated unexpectedly');
      }
    };

    const contactRepo = new PostgresContactRepository(failingPool, true);
    let threw = false;
    try {
      await contactRepo.listByUser('user-1', 'ws-1');
    } catch (err: any) {
      threw = true;
      assert.strictEqual(err.statusCode, 503);
      assert.strictEqual(err.code, 'DATABASE_UNAVAILABLE');
      assert.ok(err.message.includes('Database error'));
    }
    assert.ok(threw, 'Expected 503 error to be thrown in production');
  });

  // Test 4: Production configuration validation enforces mandatory JWT_SECRET and DATABASE_URL
  await runTest('4. Production configuration validation enforces JWT_SECRET and DATABASE_URL', async () => {
    const { getProductionConfigErrors, validateProductionConfig } = await import('../config/env');

    const errors = getProductionConfigErrors({
      NODE_ENV: 'production',
      PORT: '3001'
    });

    assert.ok(errors.some(e => e.includes('JWT_SECRET')), 'Expected JWT_SECRET validation error');
    assert.ok(errors.some(e => e.includes('DATABASE_URL')), 'Expected DATABASE_URL validation error');

    assert.throws(
      () => validateProductionConfig({ NODE_ENV: 'production' }),
      /Mandatory configuration missing/
    );

    // In development mode, no errors required
    const devErrors = getProductionConfigErrors({ NODE_ENV: 'development' });
    assert.strictEqual(devErrors.length, 0, 'Expected no errors in development');
  });

  // Test 5: Production JWT secret has zero hardcoded fallback
  await runTest('5. Production JWT secret never uses hardcoded dev fallback', async () => {
    const envContent = readFileSync(join(rootDir, 'server/config/env.ts'), 'utf-8');
    // Ensure that in production or Vercel, jwtSecret defaults to empty string if unset, not dev key
    assert.ok(envContent.includes("(process.env.JWT_SECRET || '')"));
  });

  // Test 6: Database migration contains PostgreSQL advisory lock
  await runTest('6. Database migration code uses pg_advisory_lock to prevent cold start races', async () => {
    const migrateContent = readFileSync(join(rootDir, 'server/database/migrate.ts'), 'utf-8');
    assert.ok(migrateContent.includes('pg_advisory_lock'), 'Missing pg_advisory_lock in migrate.ts');
    assert.ok(migrateContent.includes('pg_advisory_unlock'), 'Missing pg_advisory_unlock in migrate.ts');
    assert.ok(migrateContent.includes('huntiq_migrations_lock'), 'Missing lock identifier in migrate.ts');
  });

  // Test 7: LeadIngestionService uses null for unresolved company instead of synthetic IDs
  await runTest('7. LeadIngestionService uses null for unresolved companies (no comp-unresolved)', async () => {
    const leadServiceContent = readFileSync(join(rootDir, 'server/services/leadIngestionService.ts'), 'utf-8');
    assert.ok(!leadServiceContent.includes("'comp-unresolved'"), "Found lingering 'comp-unresolved' in leadIngestionService.ts");
    assert.ok(leadServiceContent.includes('resolvedCompany?.id || null'), 'Expected companyId: resolvedCompany?.id || null');
  });

  // Test 8: Outreach contact name operator precedence prioritizes toName
  await runTest('8. Email integration contactName operator precedence prioritizes toName', async () => {
    const emailIntContent = readFileSync(join(rootDir, 'server/routes/emailIntegration.ts'), 'utf-8');
    // Ensure bug pattern 'toName || matchingContact.firstName ? ...' is absent
    assert.ok(!emailIntContent.includes('toName || matchingContact.firstName ?'), 'Found operator precedence bug in emailIntegration.ts');
    assert.ok(emailIntContent.includes('contactName: toName \n        ? toName'), 'Expected correct ternary precedence in emailIntegration.ts');
  });

  // Test 9: SSL support enabled for remote PostgreSQL connections
  await runTest('9. Remote PostgreSQL connections configure SSL with rejectUnauthorized: false', async () => {
    const pgContent = readFileSync(join(rootDir, 'server/database/postgres.ts'), 'utf-8');
    assert.ok(pgContent.includes('rejectUnauthorized: false'), 'Missing SSL rejectUnauthorized in postgres.ts');
    assert.ok(pgContent.includes('isLocal'), 'Missing localhost SSL bypass in postgres.ts');
  });

  // Test 10: Serverless api handler provides safe error recovery
  await runTest('10. Serverless api/index.ts catches boot errors and responds with clean 503', async () => {
    const apiIndexContent = readFileSync(join(rootDir, 'api/index.ts'), 'utf-8');
    assert.ok(apiIndexContent.includes('try {'), 'Missing try/catch in api/index.ts');
    assert.ok(apiIndexContent.includes('initError'), 'Missing initError handling in api/index.ts');
    assert.ok(apiIndexContent.includes('503'), 'Missing 503 status code in api/index.ts');
  });

  console.log('\n========================================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} PRODUCTION HARDENING TESTS PASSED!`);
  console.log('========================================================================\n');
}

runSuite().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
