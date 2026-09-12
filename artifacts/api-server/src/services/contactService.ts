import { createContactRepository } from '../repositories/contacts';
import { DEFAULT_USER_ID, DEFAULT_WORKSPACE_ID } from '../middleware/auth';
import type { DbContact } from '../db/types';
import type { ContactItem, ContactsKpiData } from '../../src/types/contact';
import { db } from '../db/memoryStore';

export class ContactService {
  private repository = createContactRepository();

  public async listContacts(params: {
    tab?: string;
    search?: string;
    seniority?: string;
    department?: string;
    role?: string;
    companyId?: string;
    userId?: string;
    workspaceId?: string;
  } = {}): Promise<{ contacts: ContactItem[]; kpiSummary: ContactsKpiData }> {
    const userId = params.userId || DEFAULT_USER_ID;
    const workspaceId = params.workspaceId || DEFAULT_WORKSPACE_ID;
    const userContacts = await this.repository.listByUser(userId, workspaceId);
    let list = [...userContacts];

    if (params.tab && params.tab !== 'all') {
      if (params.tab === 'decision_makers') {
        list = list.filter(c => c.decisionRole === 'Decision Maker');
      } else if (params.tab === 'champions') {
        list = list.filter(c => c.decisionRole === 'Champion');
      } else if (params.tab === 'influencers') {
        list = list.filter(c => c.decisionRole === 'Influencer');
      } else if (params.tab === 'saved' || params.tab === 'bookmarked') {
        list = list.filter(c => c.isBookmarked);
      }
    }

    if (params.role && params.role !== 'All') {
      list = list.filter(c => c.decisionRole.toLowerCase() === params.role!.toLowerCase());
    }

    if (params.search?.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    const totalContacts = userContacts.length;
    const highInfluence = userContacts.filter(c => c.influenceScore >= 85).length;
    const replied = userContacts.filter(c => c.lastActivity.toLowerCase().includes('replied')).length;
    const contacted = userContacts.filter(c => c.lastActivity.toLowerCase().includes('sent') || c.lastActivity.toLowerCase().includes('opened')).length;

    const kpiSummary: ContactsKpiData = {
      totalContacts: totalContacts.toString(),
      totalContactsChange: totalContacts > 0 ? '+12% this month' : 'No contacts yet',
      newContacts: totalContacts > 0 ? String(Math.min(totalContacts, 18)) : '0',
      newContactsChange: '+5 this week',
      changedRoles: '4',
      changedRolesChange: '2 promotions',
      highInfluence: highInfluence.toString(),
      highInfluenceChange: highInfluence > 0 ? '88% avg score' : '0%',
      contacted: contacted.toString(),
      contactedChange: '+8 this week',
      replied: replied.toString(),
      repliedChange: '34% reply rate'
    };

    return { contacts: list, kpiSummary };
  }

  public async getById(id: string, userId?: string, workspaceId?: string): Promise<ContactItem | null> {
    return this.repository.getById(id, userId || DEFAULT_USER_ID, workspaceId || DEFAULT_WORKSPACE_ID);
  }

  public async createContact(input: Partial<ContactItem>, userId?: string, workspaceId?: string): Promise<ContactItem> {
    const uId = userId || DEFAULT_USER_ID;
    const wId = workspaceId || DEFAULT_WORKSPACE_ID;
    return this.repository.create(uId, wId, input);
  }

  public async updateContact(id: string, updates: Partial<ContactItem>, userId?: string, workspaceId?: string): Promise<ContactItem | null> {
    const uId = userId || DEFAULT_USER_ID;
    const wId = workspaceId || DEFAULT_WORKSPACE_ID;
    return this.repository.update(id, uId, wId, updates);
  }

  public async deleteContact(id: string, userId?: string, workspaceId?: string): Promise<boolean> {
    return this.repository.delete(id, userId || DEFAULT_USER_ID, workspaceId || DEFAULT_WORKSPACE_ID);
  }

  public async importContacts(importedList: Partial<ContactItem>[], userId?: string, workspaceId?: string): Promise<ContactItem[]> {
    const added: ContactItem[] = [];
    for (const item of importedList) {
      const created = await this.createContact({
        ...item,
        source: 'import'
      }, userId, workspaceId);
      added.push(created);
    }
    return added;
  }

  // Legacy DbContact support
  public async getContactsByCompany(companyId: string, workspaceId: string): Promise<DbContact[]> {
    return db.getContactsByCompany(companyId, workspaceId);
  }

  public async addContact(workspaceId: string, data: Omit<DbContact, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>): Promise<DbContact> {
    const newContact: DbContact = {
      ...data,
      id: `contact-${Date.now()}`,
      workspaceId,
      firstSeenAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.contacts.push(newContact);

    db.logActivity({
      workspaceId,
      userId: 'usr-1',
      companyId: newContact.companyId,
      contactId: newContact.id,
      type: 'CONTACT_ADDED',
      title: `Contact Verified: ${newContact.firstName} ${newContact.lastName}`,
      description: `${newContact.jobTitle} email verified with ${newContact.emailConfidence}% confidence.`
    });

    return newContact;
  }
}

export const contactService = new ContactService();
