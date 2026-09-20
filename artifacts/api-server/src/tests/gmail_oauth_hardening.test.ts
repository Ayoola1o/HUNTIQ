import assert from 'node:assert';
import crypto from 'node:crypto';
import { CryptoService } from '../services/cryptoService';
import { GoogleAuthService } from '../services/googleAuthService';
import { InMemoryOAuthStateRepository } from '../repositories/oauth-states/in-memory-oauth-state.repository';
import { PostgresOAuthStateRepository } from '../repositories/oauth-states/postgres-oauth-state.repository';
import { hasValidTld } from '../engine/scraper/emailExtractor';

console.log('========================================================================');
console.log('🛡️  HUNTIQ: GMAIL OAUTH 2.0 & PRODUCTION HARDENING TEST SUITE');
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
  // Test 1: AES-256-GCM Token Encryption & Decryption
  await runTest('1. CryptoService: Round-trip AES-256-GCM encryption & decryption', () => {
    const rawTokens = [
      'ya29.a0AXooCgu_sample_access_token_with_high_entropy_12345',
      '1//04sample_refresh_token_very_long_and_secret_67890',
      'short_token'
    ];

    for (const raw of rawTokens) {
      const encrypted = CryptoService.encryptToken(raw);
      assert.ok(encrypted.startsWith('enc:v1:'), 'Encrypted token must have enc:v1: prefix');
      assert.notStrictEqual(encrypted, raw, 'Encrypted token must not match raw plaintext');

      const parts = encrypted.slice('enc:v1:'.length).split(':');
      assert.strictEqual(parts.length, 3, 'Encrypted format must be enc:v1:<iv>:<tag>:<ciphertext>');

      const decrypted = CryptoService.decryptToken(encrypted);
      assert.strictEqual(decrypted, raw, 'Decrypted token must exactly match raw token');
    }
  });

  // Test 2: CryptoService: Unique IVs prevent deterministic ciphertexts
  await runTest('2. CryptoService: Different IVs produce unique ciphertexts for identical plaintext', () => {
    const token = 'ya29.identical_access_token_value';
    const enc1 = CryptoService.encryptToken(token);
    const enc2 = CryptoService.encryptToken(token);

    assert.notStrictEqual(enc1, enc2, 'Two encryptions of same plaintext must produce different ciphertexts');
    assert.strictEqual(CryptoService.decryptToken(enc1), token);
    assert.strictEqual(CryptoService.decryptToken(enc2), token);
  });

  // Test 3: CryptoService: Tamper detection & legacy fallback
  await runTest('3. CryptoService: Tampered ciphertext fails auth tag check; legacy plaintext passes', () => {
    const token = 'sample_token_for_integrity';
    const encrypted = CryptoService.encryptToken(token);
    
    // Tamper with the ciphertext portion
    const parts = encrypted.slice('enc:v1:'.length).split(':');
    const tamperedCiphertext = parts[2].slice(0, -2) + (parts[2].slice(-2) === 'aa' ? 'bb' : 'aa');
    const tampered = `enc:v1:${parts[0]}:${parts[1]}:${tamperedCiphertext}`;

    assert.throws(() => {
      CryptoService.decryptToken(tampered);
    }, /Unsupported state or unable to authenticate data|Invalid encrypted token format/i);

    // Legacy unencrypted plaintext fallback
    const legacyPlaintext = 'legacy_plaintext_token_without_prefix';
    const legacyResult = CryptoService.decryptToken(legacyPlaintext);
    assert.strictEqual(legacyResult, legacyPlaintext, 'Plaintext tokens without prefix should pass through untouched');
  });

  // Test 4: OAuth State Single-Use and Provider Binding
  await runTest('4. OAuth State: Bound to workspace, user, single-use consumption and provider check', async () => {
    const repo = new InMemoryOAuthStateRepository();
    const stateToken = crypto.randomBytes(32).toString('hex');
    const workspaceId = '00000000-0000-0000-0000-000000000001';
    const userId = 'user-001';

    // Create state
    const record = await repo.create({
      stateToken,
      userId,
      workspaceId,
      provider: 'gmail',
      returnPath: '/integrations?tab=google',
      ttlSeconds: 600
    });

    assert.strictEqual(record.stateToken, stateToken);
    assert.strictEqual(record.workspaceId, workspaceId);
    assert.strictEqual(record.userId, userId);
    assert.strictEqual(record.provider, 'gmail');
    assert.strictEqual(record.usedAt, null);

    // Wrong provider cannot consume
    const wrongProviderConsume = await repo.consume(stateToken, 'slack');
    assert.strictEqual(wrongProviderConsume, null, 'Consuming with mismatched provider must return null');

    // First valid consume succeeds
    const firstConsume = await repo.consume(stateToken, 'gmail');
    assert.ok(firstConsume, 'First consume should succeed');
    assert.strictEqual(firstConsume.workspaceId, workspaceId);
    assert.strictEqual(firstConsume.userId, userId);
    assert.ok(firstConsume.usedAt !== null, 'usedAt should be recorded');

    // Second consume fails (Single-use!)
    const secondConsume = await repo.consume(stateToken, 'gmail');
    assert.strictEqual(secondConsume, null, 'Second consume of same state token must return null (single-use)');
  });

  // Test 5: OAuth State Expiration Check
  await runTest('5. OAuth State: Expired state tokens cannot be consumed', async () => {
    const repo = new InMemoryOAuthStateRepository();
    const stateToken = crypto.randomBytes(32).toString('hex');

    // Create expired state (negative TTL)
    await repo.create({
      stateToken,
      userId: 'user-002',
      workspaceId: '00000000-0000-0000-0000-000000000002',
      provider: 'gmail',
      ttlSeconds: -10
    });

    const consumed = await repo.consume(stateToken, 'gmail');
    assert.strictEqual(consumed, null, 'Expired state token must not be consumable');
  });

  // Test 6: Return URL Allowlist & Open Redirect Protection
  await runTest('6. Return URL Allowlist: Rejects open redirects, allows safe paths & trusted origins', () => {
    // Safe relative paths
    assert.strictEqual(GoogleAuthService.sanitizeReturnUrl('/integrations'), '/integrations');
    assert.strictEqual(GoogleAuthService.sanitizeReturnUrl('/outreach?view=active'), '/outreach?view=active');
    assert.strictEqual(GoogleAuthService.sanitizeReturnUrl('/'), '/');

    // Open redirects - must default to safe /integrations
    assert.strictEqual(GoogleAuthService.sanitizeReturnUrl('https://evil-attacker.com/login'), '/integrations');
    assert.strictEqual(GoogleAuthService.sanitizeReturnUrl('//evil-attacker.com/steal'), '/integrations');
    assert.strictEqual(GoogleAuthService.sanitizeReturnUrl('javascript:alert(1)'), '/integrations');
    assert.strictEqual(GoogleAuthService.sanitizeReturnUrl('data:text/html,<script>alert(1)</script>'), '/integrations');

    // Allowed CORS origin
    const allowed = GoogleAuthService.sanitizeReturnUrl('http://localhost:5173/integrations?status=connected');
    assert.strictEqual(allowed, 'http://localhost:5173/integrations?status=connected');
  });

  // Test 7: Production Database Error Handling (503 Guard)
  await runTest('7. Production Database Guard: Throws 503 DATABASE_UNAVAILABLE when DB fails in prod', async () => {
    // Mock Postgres client that fails
    const failingPool: any = {
      query: async () => {
        throw new Error('Connection refused to PostgreSQL cluster');
      }
    };

    const prodStateRepo = new PostgresOAuthStateRepository(failingPool, true /* forceProduction */);

    try {
      await prodStateRepo.create({
        stateToken: 'test_token',
        userId: 'u1',
        workspaceId: '00000000-0000-0000-0000-000000000001',
        provider: 'gmail'
      });
      assert.fail('Expected create to throw 503');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 503);
      assert.strictEqual(err.code, 'DATABASE_UNAVAILABLE');
    }

    try {
      await prodStateRepo.consume('test_token', 'gmail');
      assert.fail('Expected consume to throw 503');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 503);
      assert.strictEqual(err.code, 'DATABASE_UNAVAILABLE');
    }
  });

  // Test 8: Test Email Format & Rate Limiter Logic
  await runTest('8. Email Syntax & TLD Verification for Gmail Test Dispatches', () => {
    const validEmails = [
      'founder@startup.io',
      'sales.lead@company.co.uk',
      'ceo+testing@enterprise.com'
    ];

    const invalidEmails = [
      'invalid-email-without-at',
      '@nodomain.com',
      'user@.com',
      'user@domain.png', // asset extension rejected as TLD
      'user@domain.js',  // asset extension rejected as TLD
      'user@' + 'a'.repeat(260) + '.com' // exceeds 254 chars
    ];

    for (const email of validEmails) {
      assert.ok(email.length <= 254, `${email} should be under 254 chars`);
      assert.ok(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), `${email} should pass email regex`);
      assert.ok(hasValidTld(email), `${email} should have valid TLD`);
    }

    for (const email of invalidEmails) {
      const isOk = email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && hasValidTld(email);
      assert.strictEqual(isOk, false, `${email} should be rejected as invalid email syntax or TLD`);
    }
  });

  console.log('\n========================================================================');
  console.log(`🎉 ALL TESTS PASSED: ${passedTests} / ${totalTests} test cases verified!`);
  console.log('========================================================================\n');
}

runSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
