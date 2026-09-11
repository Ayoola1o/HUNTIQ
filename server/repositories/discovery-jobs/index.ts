export * from './discovery-job-repository';
export * from './postgres-discovery-job.repository';
export * from './in-memory-discovery-job.repository';

import { postgresPool } from '../../database/postgres';
import type { DiscoveryJobRepository } from './discovery-job-repository';
import { PostgresDiscoveryJobRepository } from './postgres-discovery-job.repository';
import { InMemoryDiscoveryJobRepository } from './in-memory-discovery-job.repository';

export const createDiscoveryJobRepository = (): DiscoveryJobRepository => {
  if (postgresPool) {
    return new PostgresDiscoveryJobRepository(postgresPool);
  }
  return new InMemoryDiscoveryJobRepository();
};

export const discoveryJobRepository = createDiscoveryJobRepository();
