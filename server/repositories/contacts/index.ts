export * from './contact-repository';
export * from './postgres-contact.repository';
export * from './in-memory-contact.repository';

import { postgresPool } from '../../database/postgres';
import type { ContactRepository } from './contact-repository';
import { PostgresContactRepository } from './postgres-contact.repository';
import { InMemoryContactRepository } from './in-memory-contact.repository';

export const createContactRepository = (): ContactRepository => {
  if (postgresPool) {
    return new PostgresContactRepository(postgresPool);
  }
  return new InMemoryContactRepository();
};
