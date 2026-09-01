export * from './signal-repository';
export * from './postgres-signal.repository';
export * from './in-memory-signal.repository';

import { postgresPool } from '../../database/postgres';
import { InMemorySignalRepository } from './in-memory-signal.repository';
import type { SignalRepository } from './signal-repository';
import { PostgresSignalRepository } from './postgres-signal.repository';

export const createSignalRepository = (): SignalRepository => {
  if (postgresPool) return new PostgresSignalRepository(postgresPool);
  return new InMemorySignalRepository();
};
