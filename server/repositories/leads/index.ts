export * from './lead-repository';
export * from './postgres-lead.repository';
export * from './in-memory-lead.repository';

import { postgresPool } from '../../database/postgres';
import { InMemoryLeadRepository } from './in-memory-lead.repository';
import type { LeadRepository } from './lead-repository';
import { PostgresLeadRepository } from './postgres-lead.repository';

import { config } from '../../config/env';

export const createLeadRepository = (): LeadRepository => {
  if (postgresPool) return new PostgresLeadRepository(postgresPool);
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize LeadRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryLeadRepository();
};
