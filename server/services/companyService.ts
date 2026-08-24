import { db } from '../db/memoryStore';
import type { DbCompany } from '../db/types';

export class CompanyService {
  public async listCompanies(workspaceId: string, query?: string, industry?: string): Promise<DbCompany[]> {
    let list = db.getCompaniesByWorkspace(workspaceId);

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.domain.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }

    if (industry && industry !== 'All') {
      list = list.filter(c => c.industry.toLowerCase().includes(industry.toLowerCase()));
    }

    return list;
  }

  public async getCompanyById(id: string, workspaceId: string): Promise<DbCompany | undefined> {
    return db.getCompanyById(id, workspaceId);
  }

  public async getCompanyByDomain(domain: string, workspaceId: string): Promise<DbCompany | undefined> {
    return db.getCompanyByDomain(domain, workspaceId);
  }

  public async upsertCompany(workspaceId: string, data: Partial<DbCompany> & { name: string; domain: string }): Promise<DbCompany> {
    const existing = db.getCompanyByDomain(data.domain, workspaceId);

    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date().toISOString() });
      return existing;
    }

    const newCompany: DbCompany = {
      id: `comp-${Date.now()}`,
      workspaceId,
      name: data.name,
      legalName: data.legalName,
      domain: data.domain.toLowerCase().trim(),
      website: data.website || `https://${data.domain}`,
      industry: data.industry || 'Technology & Services',
      employeeCount: data.employeeCount || '100',
      employeeRange: data.employeeRange || '50-200',
      country: data.country || 'Nigeria',
      state: data.state,
      city: data.city || 'Lagos',
      description: data.description || '',
      logoUrl: data.logoUrl,
      linkedinUrl: data.linkedinUrl,
      status: 'ACTIVE',
      firstSeenAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.companies.push(newCompany);

    db.logActivity({
      workspaceId,
      userId: 'usr-1',
      companyId: newCompany.id,
      type: 'COMPANY_TRACKED',
      title: `New Company Tracked: ${newCompany.name}`,
      description: `Discovered and indexed ${newCompany.domain} in ${newCompany.city}.`
    });

    return newCompany;
  }
}

export const companyService = new CompanyService();
