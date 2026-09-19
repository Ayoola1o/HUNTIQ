import { Pool } from 'pg';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envContent = readFileSync(join(__dirname, '../../.env'), 'utf-8');

const match = envContent.match(/DATABASE_URL=(.+)/);
const rawUrl = match ? match[1].trim() : '';

console.log('Testing DATABASE_URL from .env:');
console.log('URL host part:', rawUrl.replace(/:[^:@]+@/, ':****@'));

async function testConnection(url: string, label: string) {
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const start = Date.now();
    const res = await pool.query('SELECT current_database(), current_user, count(*) as workspace_count FROM workspaces');
    const elapsed = Date.now() - start;
    console.log(`\n✅ ${label} CONNECTED SUCCESSFULLY in ${elapsed}ms!`);
    console.log('Database Result:', res.rows[0]);
    return true;
  } catch (err: any) {
    console.error(`\n❌ ${label} FAILED:`, err.message);
    return false;
  } finally {
    await pool.end();
  }
}

async function main() {
  // Test 1: Raw URL without sslmode=require
  const cleanUrl = rawUrl.replace('?sslmode=require', '');
  console.log('\nTest 1: clean URL without ?sslmode=require');
  const okClean = await testConnection(cleanUrl, 'Clean URL');

  // Test 2: URL with encoded &
  const encodedUrl = cleanUrl.replace('&', '%26');
  console.log('\nTest 2: Encoded URL with %26 and without ?sslmode=require');
  await testConnection(encodedUrl, 'Encoded URL with %26');

  // Test 3: Verified env DATABASE_URL
  if (process.env.DATABASE_URL) {
    console.log('\nTest 3: Env DATABASE_URL');
    await testConnection(process.env.DATABASE_URL, 'Environment DATABASE_URL');
  }
}

main();
