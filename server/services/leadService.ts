import { db } from '../db/memoryStore';
import type { DbLead } from '../db/types';

export class LeadService {
  public async listLeads(workspaceId: string, status?: string): Promise<DbLead[]> {
    let list = db.getLeadsByWorkspace(workspaceId);
    if (status && status !== 'ALL') {
      list = list.filter(l => l.status === status);
    }
    return list.sort((a, b) => b.score - a.score);
  }

  public async createLead(workspaceId: string, data: Omit<DbLead, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>): Promise<DbLead> {
    const newLead: DbLead = {
      ...data,
      id: `lead-${Date.now()}`,
      workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.leads.push(newLead);

    db.logActivity({
      workspaceId,
      userId: 'usr-1',
      companyId: newLead.companyId,
      leadId: newLead.id,
      type: 'LEAD_CREATED',
      title: `Qualified Lead Created (Score ${newLead.score})`,
      description: newLead.reason
    });

    return newLead;
  }
}

export const leadService = new LeadService();
