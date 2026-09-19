import { postgresPool } from '../../database/postgres';
import { InMemoryJobRepository } from './in-memory-job.repository';
import type { JobRepository } from './job-repository';
import { PostgresJobRepository } from './postgres-job.repository';

export { InMemoryJobRepository } from './in-memory-job.repository';
export { PostgresJobRepository } from './postgres-job.repository';
export type { JobRepository } from './job-repository';

import { config } from '../../config/env';

export const createJobRepository = (): JobRepository => {
  if (postgresPool) return new PostgresJobRepository(postgresPool);
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize JobRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryJobRepository();
};

