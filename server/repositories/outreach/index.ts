import { postgresPool } from '../../database/connection';
import type { OutreachRepository } from './outreach-repository';
import { PostgresOutreachRepository } from './postgres-outreach.repository';
import { InMemoryOutreachRepository } from './in-memory-outreach.repository';
import { config } from '../../config/env';

export * from './outreach-repository';
export * from './postgres-outreach.repository';
export * from './in-memory-outreach.repository';

export const createOutreachRepository = (): OutreachRepository => {
  if (postgresPool) {
    return new PostgresOutreachRepository(postgresPool);
  }
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize OutreachRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryOutreachRepository();
};

export const outreachRepository = createOutreachRepository();
