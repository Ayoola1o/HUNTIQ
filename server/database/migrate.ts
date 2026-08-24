import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { config } from '../config/env';

const migrationsDirectory = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

const runMigrations = async () => {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is required to run database migrations.');
  }

  const pool = new Pool({ connectionString: config.databaseUrl });
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
        console.log(`Skipping ${file}`);
        continue;
      }

      const sql = await readFile(join(migrationsDirectory, file), 'utf8');
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into schema_migrations (id) values ($1)', [file]);
        await client.query('commit');
        console.log(`Applied ${file}`);
      } catch (error) {
        await client.query('rollback');
        throw error;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

