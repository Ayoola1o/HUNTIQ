import { postgresPool } from '../../database/connection';
import type { TaskRepository } from './task-repository';
import { PostgresTaskRepository } from './postgres-task.repository';
import { InMemoryTaskRepository } from './in-memory-task.repository';

export * from './task-repository';
export * from './postgres-task.repository';
export * from './in-memory-task.repository';

export const createTaskRepository = (): TaskRepository => {
  if (postgresPool) {
    return new PostgresTaskRepository(postgresPool);
  }
  return new InMemoryTaskRepository();
};
