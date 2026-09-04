export * from './user-repository';
export * from './postgres-user.repository';
export * from './in-memory-user.repository';

import { postgresPool } from '../../database/postgres';
import type { UserRepository } from './user-repository';
import { PostgresUserRepository } from './postgres-user.repository';
import { InMemoryUserRepository } from './in-memory-user.repository';

export const createUserRepository = (): UserRepository => {
  if (postgresPool) {
    return new PostgresUserRepository(postgresPool);
  }
  return new InMemoryUserRepository();
};
