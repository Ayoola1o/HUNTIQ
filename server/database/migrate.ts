import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { config } from '../config/env';

const migrationsDirectory = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

let migrationInFlight: Promise<void> | null = null;
let migrationCompleted = false;

export const runMigrations = async (poolOrUrl?: Pool | string) => {
  const connectionString = typeof poolOrUrl === 'string' ? poolOrUrl : config.databaseUrl;
  if (!connectionString && !(poolOrUrl instanceof Pool)) {
    throw new Error('DATABASE_URL is required to run database migrations.');
  }

  const pool = poolOrUrl instanceof Pool ? poolOrUrl : new Pool({ connectionString });
  const shouldClosePool = !(poolOrUrl instanceof Pool);
  const client = await pool.connect();

  try {
    await client.query(`
      create table if not exists schema_migrations (
        id text primary key,
        applied_at timestamptz not null default now()
      )
    `);

    const files = (await readdir(migrationsDirectory))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const applied = await client.query('select id from schema_migrations where id = $1 limit 1', [file]);
      if (applied.rowCount && applied.rowCount > 0) {
        continue;
      }

      const sql = await readFile(join(migrationsDirectory, file), 'utf8');
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into schema_migrations (id) values ($1)', [file]);
        await client.query('commit');
        console.log(`[HUNTIQ-MIGRATE] Applied ${file}`);
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    }
    migrationCompleted = true;
  } finally {
    client.release();
    if (shouldClosePool) {
      await pool.end();
    }
  }
};

/**
 * Ensures all database migrations are applied once per process.
 * Safe to call concurrently on server boot or serverless invocation.
 */
export const ensureDatabaseMigrated = async (poolOrUrl?: Pool | string): Promise<void> => {
  if (migrationCompleted) return;
  if (!config.databaseUrl && !poolOrUrl) return;

  if (!migrationInFlight) {
    migrationInFlight = runMigrations(poolOrUrl)
      .then(() => {
        migrationCompleted = true;
      })
      .catch((err) => {
        migrationInFlight = null;
        console.error('[HUNTIQ-MIGRATE] Auto-migration error:', err.message || err);
        throw err;
      });
  }
  return migrationInFlight;
};

// If run directly via CLI (e.g. npm run db:migrate)
const isMain = process.argv[1] && (
  process.argv[1].endsWith('migrate.ts') || 
  process.argv[1].endsWith('migrate.js')
);

if (isMain) {
  runMigrations()
    .then(() => {
      console.log('[HUNTIQ-MIGRATE] All database migrations completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[HUNTIQ-MIGRATE] Migration failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    });
}

