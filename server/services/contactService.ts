import { db } from '../db/memoryStore';
import { persistentStore, DEFAULT_USER_ID, DEFAULT_WORKSPACE_ID } from '../db/persistentStore';
import type { DbContact } from '../db/types';
import type { ContactItem, ContactsKpiData } from '../../src/types/contact';

export class ContactService {
  public listContacts(params: {
    tab?: string;
    search?: string;
    seniority?: string;
    department?: string;
    role?: string;
    companyId?: string;
    userId?: string;
    workspaceId?: string;
  } = {}): { contacts: ContactItem[]; kpiSummary: ContactsKpiData } {
    const userId = params.userId || DEFAULT_USER_ID;
    const userContacts = persistentStore.getContactsByUser(userId, params.workspaceId);
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

  public getById(id: string, userId?: string): ContactItem | undefined {
    return persistentStore.getContactById(id, userId || DEFAULT_USER_ID);
  }

  public createContact(input: Partial<ContactItem>, userId?: string, workspaceId?: string): ContactItem {
    const uId = userId || DEFAULT_USER_ID;
    const wId = workspaceId || DEFAULT_WORKSPACE_ID;
    const id = input.id || `cont-${Date.now()}`;
    const name = input.name || 'Unknown Contact';
    const company = input.companyName || 'Target Company';
    const role = input.role || 'Executive';

    const newContact: ContactItem = {
      id,
      name,
      email: input.email || `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      avatarUrl: input.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      verificationStatus: input.verificationStatus || 'verified',
      companyName: company,
      companyLocation: input.companyLocation || 'Lagos, Nigeria',
      companyIndustry: input.companyIndustry || 'Technology',
      companyEmployees: input.companyEmployees || '100-500 employees',
      role,
      decisionRole: input.decisionRole || (role.toLowerCase().includes('head') || role.toLowerCase().includes('director') || role.toLowerCase().includes('vp') ? 'Decision Maker' : 'Influencer'),
      influenceScore: input.influenceScore || 88,
      influenceLevel: input.influenceLevel || 'High',
      opportunityFitScore: input.opportunityFitScore || 90,
      opportunityFitLevel: input.opportunityFitLevel || 'Excellent',
      lastActivity: 'Contact added',
      lastActivityTime: 'Just now',
      source: input.source || 'manual',
      isBookmarked: input.isBookmarked || false,
      phone: input.phone || '+234 800 000 0000',
      location: input.location || input.companyLocation || 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: input.about || `${role} at ${company}.`,
      aiInsights: input.aiInsights || [
        `Key contact at ${company}`,
        'High potential alignment with executive initiatives'
      ],
      tags: input.tags || ['Verified', 'Contact'],
      opportunities: input.opportunities || [
        {
          id: `opp-${Date.now()}`,
          title: `${company} Engagement`,
          value: '$20,000',
          score: 88,
          scoreLevel: 'High'
        }
      ],
      linkedinUrl: input.linkedinUrl
    };

    return persistentStore.saveContact(uId, wId, newContact);
  }

  public updateContact(id: string, updates: Partial<ContactItem>, userId?: string, workspaceId?: string): ContactItem | undefined {
    const uId = userId || DEFAULT_USER_ID;
    const wId = workspaceId || DEFAULT_WORKSPACE_ID;
    const existing = persistentStore.getContactById(id, uId);
    if (!existing) return undefined;

    const merged = {
      ...existing,
      ...updates
    };

    return persistentStore.saveContact(uId, wId, merged);
  }

  public deleteContact(id: string, userId?: string): boolean {
    return persistentStore.deleteContact(userId || DEFAULT_USER_ID, id);
  }

  public importContacts(importedList: Partial<ContactItem>[], userId?: string, workspaceId?: string): ContactItem[] {
    const added: ContactItem[] = [];
    for (const item of importedList) {
      const created = this.createContact({
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
