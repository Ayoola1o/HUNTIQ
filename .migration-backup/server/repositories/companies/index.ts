export * from './company-repository';
export * from './in-memory-company.repository';
export * from './postgres-company.repository';

import { postgresPool } from '../../database/postgres';
import type { CompanyRepository } from './company-repository';
import { InMemoryCompanyRepository } from './in-memory-company.repository';
import { PostgresCompanyRepository } from './postgres-company.repository';

import { config } from '../../config/env';

export const createCompanyRepository = (): CompanyRepository => {
  if (postgresPool) return new PostgresCompanyRepository(postgresPool);
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize CompanyRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryCompanyRepository();
};

