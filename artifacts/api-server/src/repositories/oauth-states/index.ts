export * from './oauth-state-repository';
export * from './postgres-oauth-state.repository';
export * from './in-memory-oauth-state.repository';

import { postgresPool } from '../../database/postgres';
import type { OAuthStateRepository } from './oauth-state-repository';
import { PostgresOAuthStateRepository } from './postgres-oauth-state.repository';
import { InMemoryOAuthStateRepository } from './in-memory-oauth-state.repository';
import { config } from '../../config/env';

export const createOAuthStateRepository = (): OAuthStateRepository => {
  if (postgresPool) {
    return new PostgresOAuthStateRepository(postgresPool);
  }
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize OAuthStateRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryOAuthStateRepository();
};
