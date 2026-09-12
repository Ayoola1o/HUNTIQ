export * from './signal-repository';
export * from './postgres-signal.repository';
export * from './in-memory-signal.repository';

import { postgresPool } from '../../database/postgres';
import { InMemorySignalRepository } from './in-memory-signal.repository';
import type { SignalRepository } from './signal-repository';
import { PostgresSignalRepository } from './postgres-signal.repository';

import { config } from '../../config/env';

export const createSignalRepository = (): SignalRepository => {
  if (postgresPool) return new PostgresSignalRepository(postgresPool);
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize SignalRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemorySignalRepository();
};
