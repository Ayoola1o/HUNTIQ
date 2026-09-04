export * from './activity-log-repository';
export * from './postgres-activity-log.repository';
export * from './in-memory-activity-log.repository';

import { postgresPool } from '../../database/postgres';
import type { ActivityLogRepository } from './activity-log-repository';
import { PostgresActivityLogRepository } from './postgres-activity-log.repository';
import { InMemoryActivityLogRepository } from './in-memory-activity-log.repository';

export const createActivityLogRepository = (): ActivityLogRepository => {
  if (postgresPool) {
    return new PostgresActivityLogRepository(postgresPool);
  }
  return new InMemoryActivityLogRepository();
};
