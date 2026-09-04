export * from './api-key-repository';
export * from './postgres-api-key.repository';
export * from './in-memory-api-key.repository';

import { postgresPool } from '../../database/postgres';
import type { ApiKeyRepository } from './api-key-repository';
import { PostgresApiKeyRepository } from './postgres-api-key.repository';
import { InMemoryApiKeyRepository } from './in-memory-api-key.repository';

export const createApiKeyRepository = (): ApiKeyRepository => {
  if (postgresPool) {
    return new PostgresApiKeyRepository(postgresPool);
  }
  return new InMemoryApiKeyRepository();
};
