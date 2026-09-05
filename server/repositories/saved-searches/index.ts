import { postgresPool } from '../../database/connection';
import type { SavedSearchRepository } from './saved-search-repository';
import { PostgresSavedSearchRepository } from './postgres-saved-search.repository';
import { InMemorySavedSearchRepository } from './in-memory-saved-search.repository';

export * from './saved-search-repository';
export * from './postgres-saved-search.repository';
export * from './in-memory-saved-search.repository';

export const createSavedSearchRepository = (): SavedSearchRepository => {
  if (postgresPool) {
    return new PostgresSavedSearchRepository(postgresPool);
  }
  return new InMemorySavedSearchRepository();
};
