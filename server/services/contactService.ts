import { db } from '../db/memoryStore';
import type { DbContact } from '../db/types';
import type { ContactItem, ContactsKpiData } from '../../src/types/contact';

export class ContactService {
  private contacts: ContactItem[] = [
    {
      id: 'cont-1',
      name: 'Jane Smith',
      email: 'jane.smith@acmetech.com',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: 'Acme Technologies',
      companyLocation: 'Lagos, Nigeria',
      companyIndustry: 'Technology',
      companyEmployees: '250-500 employees',
      role: 'Head of People',
      decisionRole: 'Decision Maker',
      influenceScore: 94,
      influenceLevel: 'Very High',
      opportunityFitScore: 94,
      opportunityFitLevel: 'Excellent',
      lastActivity: 'Email opened',
      lastActivityTime: '2h ago',
      source: 'linkedin',
      isBookmarked: false,
      phone: '+234 801 234 5678',
      location: 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'Head of People leading HR strategy, talent management and organizational development.',
      aiInsights: [
        'Strong decision maker for HR & People initiatives',
        'High engagement with HR content',
        'Recently expanded team by 34% in 90 days',
        'Opened new office in Victoria Island, Lagos'
      ],
      tags: ['Decision Maker', 'HR', 'High Influence', 'Hiring'],
      opportunities: [
        {
          id: 'opp-1',
          title: 'HR Consulting & Training',
          value: '$25,000',
          score: 94,
          scoreLevel: 'High'
        },
        {
          id: 'opp-2',
          title: 'Leadership Development',
          value: '$15,000',
          score: 82,
          scoreLevel: 'High'
        }
      ]
    },
    {
      id: 'cont-2',
      name: 'Michael Okoro',
      email: 'michael.okoro@finserve.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: 'FinServe Ltd',
      companyLocation: 'Lagos, Nigeria',
      companyIndustry: 'Financial Services',
      companyEmployees: '200-500 employees',
      role: 'HR Director',
      decisionRole: 'Decision Maker',
      influenceScore: 88,
      influenceLevel: 'High',
      opportunityFitScore: 91,
      opportunityFitLevel: 'Excellent',
      lastActivity: 'Replied to email',
      lastActivityTime: '5h ago',
      source: 'email',
      isBookmarked: false,
      phone: '+234 802 345 6789',
      location: 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'HR Director managing regional workforce across West Africa for high-growth fintech operations.',
      aiInsights: [
        'Key executive budget holder for compensation & organizational structure',
        'Actively scaling engineering and compliance teams post Series B'
      ],
      tags: ['Decision Maker', 'HR', 'Fintech', 'Executive'],
      opportunities: [
        {
          id: 'opp-3',
          title: 'Regional Expansion Advisory',
          value: '$35,000',
          score: 91,
          scoreLevel: 'High'
        }
      ]
    },
    {
      id: 'cont-3',
      name: 'Babafemi Lawson',
      email: 'babafemi@paystack.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: 'Paystack',
      companyLocation: 'Lagos, Nigeria',
      companyIndustry: 'FinTech & Payments',
      companyEmployees: '300-500 employees',
      role: 'VP of Operations',
      decisionRole: 'Decision Maker',
      influenceScore: 92,
      influenceLevel: 'Very High',
      opportunityFitScore: 94,
      opportunityFitLevel: 'Excellent',
      lastActivity: 'Meeting held',
      lastActivityTime: 'Yesterday',
      source: 'linkedin',
      isBookmarked: true,
      phone: '+234 803 456 7890',
      location: 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'Operations executive driving scaling, process automation and cross-border settlement partnerships.',
      aiInsights: [
        'Authority on operational procurement and enterprise tech implementations',
        'Spearheading expansion across francophone West Africa'
      ],
      tags: ['Executive', 'Operations', 'Decision Maker', 'Payments'],
      opportunities: [
        {
          id: 'opp-4',
          title: 'Cross-Border Compliance Platform',
          value: '$48,000',
          score: 94,
          scoreLevel: 'High'
        }
      ]
    },
    {
      id: 'cont-4',
      name: 'Oluwaseun Adewale',
      email: 'oluwaseun@flutterwave.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: 'Flutterwave',
      companyLocation: 'Lagos / San Francisco',
      companyIndustry: 'FinTech & Banking',
      companyEmployees: '500-1000 employees',
      role: 'Head of Talent Acquisition',
      decisionRole: 'Influencer',
      influenceScore: 82,
      influenceLevel: 'High',
      opportunityFitScore: 89,
      opportunityFitLevel: 'High',
      lastActivity: 'Proposal sent',
      lastActivityTime: '2d ago',
      source: 'email',
      isBookmarked: false,
      phone: '+234 805 678 9012',
      location: 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: 'Leading pan-African talent sourcing and technical recruiting initiatives.',
      aiInsights: [
        'Manages recruitment agency vendors and executive search engagements',
        'Hiring aggressively across 14 African countries'
      ],
      tags: ['Recruiting', 'Talent', 'Influencer', 'Hiring'],
      opportunities: [
        {
          id: 'opp-5',
          title: 'Talent Acquisition Framework & Enablement',
          value: '$30,000',
          score: 89,
          scoreLevel: 'High'
        }
      ]
    }
  ];

  public listContacts(params: {
    tab?: string;
    search?: string;
    seniority?: string;
    department?: string;
    role?: string;
    companyId?: string;
  } = {}): { contacts: ContactItem[]; kpiSummary: ContactsKpiData } {
    let list = [...this.contacts];

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

    const totalContacts = this.contacts.length;
    const highInfluence = this.contacts.filter(c => c.influenceScore >= 85).length;
    const replied = this.contacts.filter(c => c.lastActivity.toLowerCase().includes('replied')).length;
    const contacted = this.contacts.filter(c => c.lastActivity.toLowerCase().includes('sent') || c.lastActivity.toLowerCase().includes('opened')).length;

    const kpiSummary: ContactsKpiData = {
      totalContacts: totalContacts.toString(),
      totalContactsChange: '+12% this month',
      newContacts: '18',
      newContactsChange: '+5 this week',
      changedRoles: '4',
      changedRolesChange: '2 new promotions',
      highInfluence: highInfluence.toString(),
      highInfluenceChange: '88% avg score',
      contacted: contacted.toString(),
      contactedChange: '+8 this week',
      replied: replied.toString(),
      repliedChange: '34% reply rate'
    };

    return { contacts: list, kpiSummary };
  }

  public getById(id: string): ContactItem | undefined {
    return this.contacts.find(c => c.id === id);
  }

  public createContact(input: Partial<ContactItem>): ContactItem {
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

    this.contacts.unshift(newContact);
    return newContact;
  }

  public updateContact(id: string, updates: Partial<ContactItem>): ContactItem | undefined {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    this.contacts[index] = {
      ...this.contacts[index],
      ...updates
    };

    return this.contacts[index];
  }

  public deleteContact(id: string): boolean {
    const len = this.contacts.length;
    this.contacts = this.contacts.filter(c => c.id !== id);
    return this.contacts.length < len;
  }

  public importContacts(importedList: Partial<ContactItem>[]): ContactItem[] {
    const added: ContactItem[] = [];
    for (const item of importedList) {
      const created = this.createContact({
        ...item,
        source: 'import'
      });
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
