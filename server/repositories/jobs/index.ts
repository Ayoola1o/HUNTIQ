import { postgresPool } from '../../database/postgres';
import { InMemoryJobRepository } from './in-memory-job.repository';
import type { JobRepository } from './job-repository';
import { PostgresJobRepository } from './postgres-job.repository';

export { InMemoryJobRepository } from './in-memory-job.repository';
export { PostgresJobRepository } from './postgres-job.repository';
export type { JobRepository } from './job-repository';

export const createJobRepository = (): JobRepository => {
  if (postgresPool) return new PostgresJobRepository(postgresPool);
  return new InMemoryJobRepository();
};

