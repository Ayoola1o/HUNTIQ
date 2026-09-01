export * from './company-repository';
export * from './in-memory-company.repository';
export * from './postgres-company.repository';

import { postgresPool } from '../../database/postgres';
import type { CompanyRepository } from './company-repository';
import { InMemoryCompanyRepository } from './in-memory-company.repository';
import { PostgresCompanyRepository } from './postgres-company.repository';

export const createCompanyRepository = (): CompanyRepository => {
  if (postgresPool) return new PostgresCompanyRepository(postgresPool);
  return new InMemoryCompanyRepository();
};

