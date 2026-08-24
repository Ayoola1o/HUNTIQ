import type { Pool } from 'pg';
import type { CompanyItem } from '../../../src/types/company';
import type { CompanyRepository, CompanySearchParams, CreateCompanyInput } from './company-repository';

const defaultWorkspaceId = '00000000-0000-0000-0000-000000000001';

interface CompanyRow {
  id: string;
  name: string;
  domain: string | null;
  website: string | null;
  industry: string | null;
  employee_range: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  description: string | null;
  logo_url: string | null;
  linkedin_url: string | null;
  founded_year: number | null;
  updated_at: Date | string;
}

const compactLocation = (...parts: Array<string | null | undefined>): string => parts.filter(Boolean).join(', ');

const scoreColorFor = (score: number): string => {
  if (score >= 90) return '#10b981';
  if (score >= 75) return '#6366f1';
  if (score >= 50) return '#f59e0b';
  return '#64748b';
};

const opportunityLevelFor = (score: number): CompanyItem['opportunityLevel'] => {
  if (score >= 90) return 'Very High';
  if (score >= 75) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
};

const mapCompanyRow = (row: CompanyRow): CompanyItem => {
  const location = compactLocation(row.city, row.state, row.country) || 'Unknown';
  const score = 0;

  return {
    id: row.id,
    name: row.name,
    domain: row.domain ?? '',
    logoUrl: row.logo_url ?? undefined,
    industry: row.industry ?? 'Unknown',
    employees: row.employee_range ?? 'Unknown',
    revenue: 'Unknown',
    location,
    opportunityScore: score,
    opportunityLevel: opportunityLevelFor(score),
    scoreColor: scoreColorFor(score),
    scoreTrend: [],
    signalsCount: 0,
    activeSignals: [],
    lastActivity: 'No activity yet',
    description: row.description ?? '',
    founded: row.founded_year ? String(row.founded_year) : '',
    headquarters: location,
    socials: {
      linkedin: row.linkedin_url ?? undefined,
    },
  };
};

export class PostgresCompanyRepository implements CompanyRepository {
  constructor(private readonly pool: Pool) {}

  async list(params: CompanySearchParams = {}): Promise<CompanyItem[]> {
    const values: unknown[] = [defaultWorkspaceId];
    const conditions = ['workspace_id = $1'];

    if (params.query) {
      values.push(`%${params.query}%`);
      conditions.push(`(name ilike $${values.length} or coalesce(domain, '') ilike $${values.length})`);
    }

    if (params.industry && params.industry !== 'All') {
      values.push(`%${params.industry}%`);
      conditions.push(`coalesce(industry, '') ilike $${values.length}`);
    }

    const result = await this.pool.query<CompanyRow>(
      `select * from companies where ${conditions.join(' and ')} order by updated_at desc, name asc`,
      values,
    );
    return result.rows.map(mapCompanyRow);
  }

  async getById(companyId: string): Promise<CompanyItem | undefined> {
    const result = await this.pool.query<CompanyRow>(
      'select * from companies where workspace_id = $1 and id = $2 limit 1',
      [defaultWorkspaceId, companyId],
    );
    return result.rows[0] ? mapCompanyRow(result.rows[0]) : undefined;
  }

  async create(input: CreateCompanyInput): Promise<CompanyItem> {
    const result = await this.pool.query<CompanyRow>(
      `insert into companies (
        workspace_id, name, domain, website, industry, employee_range, country, state, city,
        description, logo_url, linkedin_url, founded_year
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      on conflict (workspace_id, domain) do update set
        name = excluded.name,
        website = excluded.website,
        industry = excluded.industry,
        employee_range = excluded.employee_range,
        country = excluded.country,
        state = excluded.state,
        city = excluded.city,
        description = excluded.description,
        logo_url = excluded.logo_url,
        linkedin_url = excluded.linkedin_url,
        founded_year = excluded.founded_year,
        updated_at = now()
      returning *`,
      [
        defaultWorkspaceId,
        input.name,
        input.domain ?? null,
        input.website ?? null,
        input.industry ?? null,
        input.employeeRange ?? null,
        input.country ?? null,
        input.state ?? null,
        input.city ?? null,
        input.description ?? null,
        input.logoUrl ?? null,
        input.linkedinUrl ?? null,
        input.foundedYear ?? null,
      ],
    );
    return mapCompanyRow(result.rows[0]);
  }
}

