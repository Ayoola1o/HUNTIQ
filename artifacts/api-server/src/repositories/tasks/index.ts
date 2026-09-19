import { postgresPool } from '../../database/connection';
import type { TaskRepository } from './task-repository';
import { PostgresTaskRepository } from './postgres-task.repository';
import { InMemoryTaskRepository } from './in-memory-task.repository';

export * from './task-repository';
export * from './postgres-task.repository';
export * from './in-memory-task.repository';

import { config } from '../../config/env';

export const createTaskRepository = (): TaskRepository => {
  if (postgresPool) {
    return new PostgresTaskRepository(postgresPool);
  }
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize TaskRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryTaskRepository();
};
