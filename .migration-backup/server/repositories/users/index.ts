export * from './user-repository';
export * from './postgres-user.repository';
export * from './in-memory-user.repository';

import { postgresPool } from '../../database/postgres';
import type { UserRepository } from './user-repository';
import { PostgresUserRepository } from './postgres-user.repository';
import { InMemoryUserRepository } from './in-memory-user.repository';

import { config } from '../../config/env';

export const createUserRepository = (): UserRepository => {
  if (postgresPool) {
    return new PostgresUserRepository(postgresPool);
  }
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize UserRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryUserRepository();
};
