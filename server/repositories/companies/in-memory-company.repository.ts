import { randomUUID } from 'node:crypto';
import type { CompanyItem } from '../../../src/types/company';
import type { CompanyRepository, CompanySearchParams, CreateCompanyInput } from './company-repository';

const emptyCompanyDefaults = (company: Pick<CompanyItem, 'id' | 'name'> & Partial<CompanyItem>): CompanyItem => ({
  id: company.id,
  name: company.name,
  domain: company.domain ?? '',
  logoUrl: company.logoUrl,
  industry: company.industry ?? 'Unknown',
  employees: company.employees ?? 'Unknown',
  revenue: company.revenue ?? 'Unknown',
  location: company.location ?? 'Unknown',
  opportunityScore: company.opportunityScore ?? 0,
  opportunityLevel: company.opportunityLevel ?? 'Low',
  scoreColor: company.scoreColor ?? '#64748b',
  scoreTrend: company.scoreTrend ?? [],
  signalsCount: company.signalsCount ?? 0,
  activeSignals: company.activeSignals ?? [],
  lastActivity: company.lastActivity ?? 'No activity yet',
  description: company.description ?? '',
  founded: company.founded ?? '',
  headquarters: company.headquarters ?? company.location ?? '',
  socials: company.socials ?? {},
});

export class InMemoryCompanyRepository implements CompanyRepository {
  private readonly companies = new Map<string, CompanyItem>();

  async list(params: CompanySearchParams = {}): Promise<CompanyItem[]> {
    const query = params.query?.toLowerCase();
    const industry = params.industry?.toLowerCase();

    return [...this.companies.values()].filter((company) => {
      if (query && !company.name.toLowerCase().includes(query) && !company.domain.toLowerCase().includes(query)) {
        return false;
      }
      if (industry && params.industry !== 'All' && !company.industry.toLowerCase().includes(industry)) {
        return false;
      }
      return true;
    });
  }

  async getById(companyId: string): Promise<CompanyItem | undefined> {
    return this.companies.get(companyId);
  }

  async create(input: CreateCompanyInput): Promise<CompanyItem> {
    const location = [input.city, input.state, input.country].filter(Boolean).join(', ');
    const company = emptyCompanyDefaults({
      id: randomUUID(),
      name: input.name,
      domain: input.domain ?? '',
      logoUrl: input.logoUrl,
      industry: input.industry,
      employees: input.employeeRange,
      location,
      description: input.description,
      founded: input.foundedYear ? String(input.foundedYear) : '',
      headquarters: location,
      socials: { linkedin: input.linkedinUrl },
    });

    this.companies.set(company.id, company);
    return company;
  }
}

