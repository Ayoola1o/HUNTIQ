export * from './activity-log-repository';
export * from './postgres-activity-log.repository';
export * from './in-memory-activity-log.repository';

import { postgresPool } from '../../database/postgres';
import type { ActivityLogRepository } from './activity-log-repository';
import { PostgresActivityLogRepository } from './postgres-activity-log.repository';
import { InMemoryActivityLogRepository } from './in-memory-activity-log.repository';

import { config } from '../../config/env';

export const createActivityLogRepository = (): ActivityLogRepository => {
  if (postgresPool) {
    return new PostgresActivityLogRepository(postgresPool);
  }
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize ActivityLogRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryActivityLogRepository();
};
