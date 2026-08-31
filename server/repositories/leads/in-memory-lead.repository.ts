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

  async findByCompanyId(companyId: string): Promise<LeadRecord[]> {
    return this.leads.filter(l => l.companyId === companyId);
  }

  async findById(id: string): Promise<LeadRecord | null> {
    return this.leads.find(l => l.id === id) || null;
  }

  async list(limit = 50, offset = 0): Promise<LeadRecord[]> {
    return this.leads.slice(offset, offset + limit);
  }

  async updateStatus(id: string, status: LeadRecord['status']): Promise<LeadRecord | null> {
    const lead = this.leads.find(l => l.id === id);
    if (!lead) return null;
    lead.status = status;
    lead.updatedAt = new Date();
    return lead;
  }
}
