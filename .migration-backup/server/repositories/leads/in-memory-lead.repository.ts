import type { LeadRecord, LeadRepository } from './lead-repository';

export class InMemoryLeadRepository implements LeadRepository {
  private leads: LeadRecord[] = [];

  async create(lead: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeadRecord> {
    const record: LeadRecord = {
      ...lead,
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.leads.push(record);
    return record;
  }

  async upsert(lead: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeadRecord> {
    const existingIndex = this.leads.findIndex(
      l => l.companyId === lead.companyId && l.contactId === lead.contactId && l.signalId === lead.signalId
    );

    if (existingIndex >= 0) {
      const updated: LeadRecord = {
        ...this.leads[existingIndex],
        ...lead,
        updatedAt: new Date()
      };
      this.leads[existingIndex] = updated;
      return updated;
    }

    return this.create(lead);
  }

  async findByCompanyId(companyId: string, workspaceId?: string): Promise<LeadRecord[]> {
    return this.leads.filter(l => l.companyId === companyId && (!workspaceId || l.workspaceId === workspaceId));
  }

  async findById(id: string, workspaceId?: string): Promise<LeadRecord | null> {
    return this.leads.find(l => l.id === id && (!workspaceId || l.workspaceId === workspaceId)) || null;
  }

  async list(workspaceId?: string, limit = 50, offset = 0): Promise<LeadRecord[]> {
    let filtered = this.leads;
    if (workspaceId) {
      filtered = filtered.filter(l => l.workspaceId === workspaceId);
    }
    return filtered.slice(offset, offset + limit);
  }

  async updateStatus(id: string, status: LeadRecord['status'], workspaceId?: string): Promise<LeadRecord | null> {
    const lead = this.leads.find(l => l.id === id && (!workspaceId || l.workspaceId === workspaceId));
    if (!lead) return null;
    lead.status = status;
    lead.updatedAt = new Date();
    return lead;
  }
}
