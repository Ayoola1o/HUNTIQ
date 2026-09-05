import { postgresPool } from '../../database/connection';
import type { OutreachRepository } from './outreach-repository';
import { PostgresOutreachRepository } from './postgres-outreach.repository';
import { InMemoryOutreachRepository } from './in-memory-outreach.repository';

export * from './outreach-repository';
export * from './postgres-outreach.repository';
export * from './in-memory-outreach.repository';

export const createOutreachRepository = (): OutreachRepository => {
  if (postgresPool) {
    return new PostgresOutreachRepository(postgresPool);
  }
  return new InMemoryOutreachRepository();
};
