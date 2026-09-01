export * from './lead-repository';
export * from './postgres-lead.repository';
export * from './in-memory-lead.repository';

import { postgresPool } from '../../database/postgres';
import { InMemoryLeadRepository } from './in-memory-lead.repository';
import type { LeadRepository } from './lead-repository';
import { PostgresLeadRepository } from './postgres-lead.repository';

export const createLeadRepository = (): LeadRepository => {
  if (postgresPool) return new PostgresLeadRepository(postgresPool);
  return new InMemoryLeadRepository();
};
