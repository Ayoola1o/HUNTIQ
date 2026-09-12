export * from './discovery-job-repository';
export * from './postgres-discovery-job.repository';
export * from './in-memory-discovery-job.repository';

import { postgresPool } from '../../database/postgres';
import type { DiscoveryJobRepository } from './discovery-job-repository';
import { PostgresDiscoveryJobRepository } from './postgres-discovery-job.repository';
import { InMemoryDiscoveryJobRepository } from './in-memory-discovery-job.repository';

import { config } from '../../config/env';

export const createDiscoveryJobRepository = (): DiscoveryJobRepository => {
  if (postgresPool) {
    return new PostgresDiscoveryJobRepository(postgresPool);
  }
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize DiscoveryJobRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryDiscoveryJobRepository();
};

export const discoveryJobRepository = createDiscoveryJobRepository();
