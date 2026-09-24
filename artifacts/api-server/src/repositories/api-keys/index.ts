export * from './api-key-repository';
export * from './postgres-api-key.repository';
export * from './in-memory-api-key.repository';

import { postgresPool } from '../../database/postgres';
import type { ApiKeyRepository } from './api-key-repository';
import { PostgresApiKeyRepository } from './postgres-api-key.repository';
import { InMemoryApiKeyRepository } from './in-memory-api-key.repository';
import { config } from '../../config/env';

export const createApiKeyRepository = (): ApiKeyRepository => {
  if (postgresPool) {
    return new PostgresApiKeyRepository(postgresPool);
  }
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize ApiKeyRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryApiKeyRepository();
};
