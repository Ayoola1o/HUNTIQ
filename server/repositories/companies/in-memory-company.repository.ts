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

import { seedCompanies } from '../../db/seeds';

export class InMemoryCompanyRepository implements CompanyRepository {
  private readonly companies = new Map<string, CompanyItem>();

  constructor() {
    for (const c of seedCompanies) {
      this.companies.set(c.id, {
        id: c.id,
        name: c.name,
        domain: c.domain,
        website: c.website,
        industry: c.industry,
        employees: c.employeeRange || String(c.employeeCount),
        revenue: '$20M - $50M',
        location: `${c.city || ''}, ${c.country || ''}`.replace(/^, |, $/g, ''),
        opportunityScore: 92,
        opportunityLevel: 'Hot',
        scoreColor: '#10b981',
        scoreTrend: [85, 88, 92],
        signalsCount: 3,
        activeSignals: ['Hiring Surge', 'Leadership Expansion'],
        lastActivity: 'New engineering hiring detected',
        description: c.description,
        founded: c.foundedYear,
        headquarters: `${c.city || ''}, ${c.country || ''}`.replace(/^, |, $/g, ''),
        socials: { linkedin: c.linkedinUrl, twitter: c.twitterUrl }
      });
    }
  }

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

