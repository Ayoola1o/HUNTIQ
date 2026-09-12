import { postgresPool } from '../../database/connection';
import type { SavedSearchRepository } from './saved-search-repository';
import { PostgresSavedSearchRepository } from './postgres-saved-search.repository';
import { InMemorySavedSearchRepository } from './in-memory-saved-search.repository';

export * from './saved-search-repository';
export * from './postgres-saved-search.repository';
export * from './in-memory-saved-search.repository';

import { config } from '../../config/env';

export const createSavedSearchRepository = (): SavedSearchRepository => {
  if (postgresPool) {
    return new PostgresSavedSearchRepository(postgresPool);
  }
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize SavedSearchRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemorySavedSearchRepository();
};
