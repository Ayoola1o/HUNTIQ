export * from './contact-repository';
export * from './postgres-contact.repository';
export * from './in-memory-contact.repository';

import { postgresPool } from '../../database/postgres';
import type { ContactRepository } from './contact-repository';
import { PostgresContactRepository } from './postgres-contact.repository';
import { InMemoryContactRepository } from './in-memory-contact.repository';

import { config } from '../../config/env';

export const createContactRepository = (): ContactRepository => {
  if (postgresPool) {
    return new PostgresContactRepository(postgresPool);
  }
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize ContactRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryContactRepository();
};
