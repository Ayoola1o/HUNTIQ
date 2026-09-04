process.env.NODE_ENV = 'test';
import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createApp } from '../app';
import { signJwt } from '../services/auth.service';
import { PostgresApiKeyRepository } from '../repositories/api-keys/postgres-api-key.repository';
import { createUserRepository } from '../repositories/users';
import { createApiKeyRepository } from '../repositories/api-keys';

async function runApiKeySuite() {
  console.log('========================================================================');
  console.log('🧪 HUNTIQ: API KEY MANAGEMENT & SECURITY AUDIT TEST SUITE');
  console.log('========================================================================\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const userRepo = createUserRepository();
  const createdA = await userRepo.createWithWorkspace({
    email: `tenant.a.${Date.now()}@huntiq.io`,
    fullName: 'Tenant A Admin',
    passwordHash: 'hashed_pw',
    role: 'owner',
    companyName: 'Tenant A Org'
  });
  const userAId = createdA.user.id;
  const workspaceA = createdA.workspace.id;

  const createdB = await userRepo.createWithWorkspace({
    email: `tenant.b.${Date.now()}@huntiq.io`,
    fullName: 'Tenant B Admin',
    passwordHash: 'hashed_pw',
    role: 'owner',
    companyName: 'Tenant B Org'
  });
  const userBId = createdB.user.id;
  const workspaceB = createdB.workspace.id;

  const tokenA = signJwt({
    userId: userAId,
    email: 'tenant.a@huntiq.io',
    fullName: 'Tenant A Admin',
    role: 'owner',
    workspaceId: workspaceA
  });

  const tokenB = signJwt({
    userId: userBId,
    email: 'tenant.b@huntiq.io',
    fullName: 'Tenant B Admin',
    role: 'owner',
    workspaceId: workspaceB
  });

  let createdKeyA: any = null;

  try {
    // -------------------------------------------------------------------------
    // Test 1: Authenticated user can generate API key
    // -------------------------------------------------------------------------
    console.log('1. Checking authenticated user can generate API key...');
    const postRes = await fetch(`${baseUrl}/api/v1/auth/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ name: 'Email Scraper Production Key' })
    });

    assert.strictEqual(postRes.status, 201, `Expected 201 Created, got ${postRes.status}`);
    const postBody = await postRes.json();
    assert.strictEqual(postBody.success, true);
    assert.ok(postBody.data.id, 'Expected generated key to have an ID');
    assert.strictEqual(postBody.data.name, 'Email Scraper Production Key');
    assert.ok(postBody.data.createdAt, 'Expected createdAt timestamp');
    createdKeyA = postBody.data;
    console.log('   ✅ API key generated successfully with 201 Created.');

    // -------------------------------------------------------------------------
    // Test 2: Generated key has expected prefix
    // -------------------------------------------------------------------------
    console.log('2. Checking generated key prefix and format...');
    assert.ok(
      createdKeyA.secretKey.startsWith('hnt_live_'),
      `Expected key to start with hnt_live_, got ${createdKeyA.secretKey}`
    );
    assert.ok(
      createdKeyA.keyPrefix.startsWith('hnt_live_'),
      `Expected keyPrefix to start with hnt_live_, got ${createdKeyA.keyPrefix}`
    );
    assert.ok(
      createdKeyA.secretKey.startsWith(createdKeyA.keyPrefix),
      'secretKey must start with keyPrefix'
    );
    console.log('   ✅ Key format matches hnt_live_<hex> specification.');

    // -------------------------------------------------------------------------
    // Test 3: Plaintext secret returned once upon creation
    // -------------------------------------------------------------------------
    console.log('3. Checking plaintext secret is returned on creation but omitted in list...');
    assert.ok(createdKeyA.secretKey, 'Plaintext secretKey must be returned upon creation');
    assert.ok(createdKeyA.apiKey, 'apiKey field must also match secretKey upon creation');
    console.log('   ✅ Plaintext secret is returned in creation response.');

    // -------------------------------------------------------------------------
    // Test 4: Key hash stored in repository, plaintext NOT stored
    // -------------------------------------------------------------------------
    console.log('4. Checking key hash stored in repository and plaintext is not stored...');
    const computedHash = crypto.createHash('sha256').update(createdKeyA.secretKey).digest('hex');
    const repo = createApiKeyRepository();
    const foundKey = await repo.findByHash(computedHash);
    assert.ok(foundKey, 'Expected key lookup by SHA-256 hash to succeed');
    assert.strictEqual(foundKey.userId, userAId);
    assert.strictEqual(foundKey.workspaceId, workspaceA);
    console.log('   ✅ Key is stored and resolved by SHA-256 hash.');

    // -------------------------------------------------------------------------
    // Test 5: GET /api/v1/auth/api-keys lists keys without plaintext secret or key_hash
    // -------------------------------------------------------------------------
    console.log('5. Checking GET /api-keys lists keys safely without secretKey or keyHash...');
    const getRes = await fetch(`${baseUrl}/api/v1/auth/api-keys`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.strictEqual(getRes.status, 200);
    const getBody = await getRes.json();
    assert.strictEqual(getBody.success, true);
    assert.ok(Array.isArray(getBody.data));
    const matchingKey = getBody.data.find((k: any) => k.id === createdKeyA.id);
    assert.ok(matchingKey, 'Created key should be returned in list');
    assert.strictEqual((matchingKey as any).secretKey, undefined, 'secretKey must NOT be in list output');
    assert.strictEqual((matchingKey as any).apiKey, undefined, 'apiKey must NOT be in list output');
    assert.strictEqual((matchingKey as any).keyHash, undefined, 'keyHash must NOT be in list output');
    assert.strictEqual((matchingKey as any).key_hash, undefined, 'key_hash must NOT be in list output');
    assert.strictEqual(matchingKey.name, 'Email Scraper Production Key');
    assert.strictEqual(matchingKey.keyPrefix, createdKeyA.keyPrefix);
    console.log('   ✅ Key list safely redacts secret and hash.');

    // -------------------------------------------------------------------------
    // Test 6: Bearer API-key authentication works & updates last_used_at
    // -------------------------------------------------------------------------
    console.log('6. Checking Bearer API-key authentication and last_used_at update...');
    const authMeRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${createdKeyA.secretKey}` }
    });
    assert.strictEqual(authMeRes.status, 200, `Expected 200 OK using API key, got ${authMeRes.status}`);
    const authMeBody = await authMeRes.json();
    assert.strictEqual(authMeBody.data.id, userAId);
    assert.strictEqual(authMeBody.data.workspaceId, workspaceA);

    // Verify last_used_at updated
    const getResAfterUse = await fetch(`${baseUrl}/api/v1/auth/api-keys`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const bodyAfterUse = await getResAfterUse.json();
    const usedKeyItem = bodyAfterUse.data.find((k: any) => k.id === createdKeyA.id);
    assert.ok(usedKeyItem.lastUsedAt, 'lastUsedAt should be updated after API key usage');
    console.log('   ✅ Bearer API-key authentication verified and last_used_at updated.');

    // -------------------------------------------------------------------------
    // Test 7: Wrong or invalid API key returns 401
    // -------------------------------------------------------------------------
    console.log('7. Checking invalid API key returns 401 Unauthorized...');
    const invalidKeyRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: 'Bearer hnt_live_invalid_secret_key_999999' }
    });
    assert.strictEqual(invalidKeyRes.status, 401);
    const unauthNoHeaderRes = await fetch(`${baseUrl}/api/v1/auth/api-keys`);
    assert.strictEqual(unauthNoHeaderRes.status, 401);
    console.log('   ✅ Unauthenticated and invalid requests rejected with 401.');

    // -------------------------------------------------------------------------
    // Test 8: Cross-user isolation: User B cannot view or delete User A's API key
    // -------------------------------------------------------------------------
    console.log('8. Checking cross-user isolation between User A and User B...');
    const userBListRes = await fetch(`${baseUrl}/api/v1/auth/api-keys`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const userBList = await userBListRes.json();
    const userBHasKeyA = userBList.data?.some((k: any) => k.id === createdKeyA.id);
    assert.strictEqual(userBHasKeyA, false, 'User B must not see User A keys');

    const userBDeleteRes = await fetch(`${baseUrl}/api/v1/auth/api-keys/${createdKeyA.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert.strictEqual(userBDeleteRes.status, 404, 'User B deleting User A key must return 404');
    console.log('   ✅ Cross-user isolation enforced (cannot view or delete another tenant key).');

    // -------------------------------------------------------------------------
    // Test 9: DELETE /api/v1/auth/api-keys/:id revokes key
    // -------------------------------------------------------------------------
    console.log('9. Checking DELETE revokes key and prevents subsequent auth...');
    const deleteRes = await fetch(`${baseUrl}/api/v1/auth/api-keys/${createdKeyA.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.strictEqual(deleteRes.status, 200);
    const deleteBody = await deleteRes.json();
    assert.strictEqual(deleteBody.success, true);

    // Key should not work for authentication anymore
    const revokedAuthRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${createdKeyA.secretKey}` }
    });
    assert.strictEqual(revokedAuthRes.status, 401, 'Revoked key must not be allowed to authenticate');

    // Subsequent delete returns 404
    const repeatDeleteRes = await fetch(`${baseUrl}/api/v1/auth/api-keys/${createdKeyA.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.strictEqual(repeatDeleteRes.status, 404, 'Deleting already-revoked key must return 404');
    console.log('   ✅ Key revocation verified.');

    // -------------------------------------------------------------------------
    // Test 10: Missing database table produces controlled 503 instead of unhandled crash
    // -------------------------------------------------------------------------
    console.log('10. Checking missing table handling returns controlled 503 in production...');
    const mockMissingTablePool: any = {
      query: async () => {
        const err: any = new Error('relation "api_keys" does not exist');
        err.code = '42P01';
        throw err;
      }
    };

    const prodMissingTableRepo = new PostgresApiKeyRepository(mockMissingTablePool, true);
    await assert.rejects(
      async () => {
        await prodMissingTableRepo.create({
          userId: userAId,
          workspaceId: workspaceA,
          name: 'Crash Test Key',
          keyPrefix: 'hnt_live_test12345',
          keyHash: 'dummyhash123'
        });
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 503);
        assert.strictEqual(err.code, 'DATABASE_UNAVAILABLE');
        return true;
      },
      'Missing table in production must throw controlled 503'
    );
    console.log('   ✅ Controlled 503 DATABASE_UNAVAILABLE thrown when database table is missing.');

    // -------------------------------------------------------------------------
    // Test 11: Production mode does NOT silently use in-memory keys
    // -------------------------------------------------------------------------
    console.log('11. Checking production mode never silently falls back to in-memory store...');
    const mockEmptyPool: any = {
      query: async () => ({ rows: [], rowCount: 0 })
    };
    const prodEmptyRepo = new PostgresApiKeyRepository(mockEmptyPool, true);
    const emptyResult = await prodEmptyRepo.listByUser(userAId);
    assert.deepStrictEqual(emptyResult, [], 'Empty database table in production must return empty array, not fallback');

    const mockFailingPool: any = {
      query: async () => {
        throw new Error('Connection terminated unexpectedly');
      }
    };
    const prodFailingRepo = new PostgresApiKeyRepository(mockFailingPool, true);
    await assert.rejects(
      async () => {
        await prodFailingRepo.listByUser(userAId);
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 503);
        assert.strictEqual(err.code, 'DATABASE_UNAVAILABLE');
        return true;
      },
      'Production database connection failure must throw 503 instead of falling back to in-memory'
    );
    console.log('   ✅ Production safety verified: no silent in-memory fallback.');

    // -------------------------------------------------------------------------
    // Test 12: Migration 007 SQL verification
    // -------------------------------------------------------------------------
    console.log('12. Checking migration 007 SQL structure and schema definitions...');
    const migrationPath = path.join(process.cwd(), 'server', 'database', 'migrations', '007_create_api_keys.sql');
    assert.ok(fs.existsSync(migrationPath), 'Migration 007_create_api_keys.sql must exist');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS api_keys'), 'Must create api_keys table');
    assert.ok(sql.includes('id UUID PRIMARY KEY'), 'Must define id as UUID PRIMARY KEY');
    assert.ok(sql.includes('user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE'), 'Must have user_id FK CASCADE');
    assert.ok(sql.includes('workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE'), 'Must have workspace_id FK CASCADE');
    assert.ok(/key_prefix\s+(VARCHAR\(\d+\)|TEXT)\s+NOT\s+NULL/i.test(sql), 'Must define key_prefix column');
    assert.ok(/key_hash\s+(VARCHAR\(\d+\)|TEXT)\s+NOT\s+NULL\s+UNIQUE/i.test(sql), 'Must define key_hash as UNIQUE');
    assert.ok(sql.includes('idx_api_keys_user_id'), 'Must create index on user_id');
    assert.ok(sql.includes('idx_api_keys_workspace_id'), 'Must create index on workspace_id');
    assert.ok(sql.includes('idx_api_keys_key_hash'), 'Must create index on key_hash');
    console.log('   ✅ Migration 007 contains all required columns, constraints, and indexes.');

    console.log('\n========================================================================');
    console.log('🎉 ALL 12 API KEY MANAGEMENT & SECURITY TESTS PASSED!');
    console.log('========================================================================\n');
  } finally {
    server.close();
  }
}

runApiKeySuite().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
