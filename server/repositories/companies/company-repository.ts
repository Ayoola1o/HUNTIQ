import type { CompanyItem } from '../../../src/types/company';

export interface CompanySearchParams {
  query?: string;
  industry?: string;
}

export interface CreateCompanyInput {
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  employeeRange?: string;
  country?: string;
  state?: string;
  city?: string;
  description?: string;
  logoUrl?: string;
  linkedinUrl?: string;
  foundedYear?: number;
}

export interface CompanyRepository {
  list(params?: CompanySearchParams, workspaceId?: string): Promise<CompanyItem[]>;
  getById(companyId: string, workspaceId?: string): Promise<CompanyItem | undefined>;
  create(input: CreateCompanyInput, workspaceId?: string): Promise<CompanyItem>;
}
