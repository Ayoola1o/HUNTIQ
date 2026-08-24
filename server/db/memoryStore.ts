import {
  seedWorkspace,
  seedCompanies,
  seedJobSources,
  seedJobs,
  seedContacts,
  seedSignals,
  seedEvidence,
  seedLeads,
  seedActivities
} from './seeds';
import type {
  DbWorkspace,
  DbCompany,
  DbJobSource,
  DbJob,
  DbContact,
  DbSignal,
  DbEvidence,
  DbLead,
  DbActivity
} from './types';

export class MemoryDatabase {
  public workspaces: DbWorkspace[] = [seedWorkspace];
  public companies: DbCompany[] = [...seedCompanies];
  public jobSources: DbJobSource[] = [...seedJobSources];
  public jobs: DbJob[] = [...seedJobs];
  public contacts: DbContact[] = [...seedContacts];
  public signals: DbSignal[] = [...seedSignals];
  public evidence: DbEvidence[] = [...seedEvidence];
  public leads: DbLead[] = [...seedLeads];
  public activities: DbActivity[] = [...seedActivities];

  // Helper to filter by workspace isolation
  public getCompaniesByWorkspace(workspaceId: string): DbCompany[] {
    return this.companies.filter(c => c.workspaceId === workspaceId);
  }

  public getCompanyById(id: string, workspaceId: string): DbCompany | undefined {
    return this.companies.find(c => c.id === id && c.workspaceId === workspaceId);
  }

  public getCompanyByDomain(domain: string, workspaceId: string): DbCompany | undefined {
    return this.companies.find(c => c.domain.toLowerCase() === domain.toLowerCase() && c.workspaceId === workspaceId);
  }

  public getJobsByCompany(companyId: string, workspaceId: string): DbJob[] {
    return this.jobs.filter(j => j.companyId === companyId && j.workspaceId === workspaceId);
  }

  public getContactsByCompany(companyId: string, workspaceId: string): DbContact[] {
    return this.contacts.filter(c => c.companyId === companyId && c.workspaceId === workspaceId);
  }

  public getSignalsByCompany(companyId: string, workspaceId: string): DbSignal[] {
    return this.signals.filter(s => s.companyId === companyId && s.workspaceId === workspaceId);
  }

  public getEvidenceBySignal(signalId: string, workspaceId: string): DbEvidence[] {
    return this.evidence.filter(e => e.signalId === signalId && e.workspaceId === workspaceId);
  }

  public getLeadsByWorkspace(workspaceId: string): DbLead[] {
    return this.leads.filter(l => l.workspaceId === workspaceId);
  }

  public logActivity(activity: Omit<DbActivity, 'id' | 'createdAt'>): DbActivity {
    const record: DbActivity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.activities.unshift(record);
    return record;
  }
}

export const db = new MemoryDatabase();
