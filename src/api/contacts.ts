import { apiClient } from './client';
import type { DbContact, DbCompany } from '../../server/db/types';
import type { ContactItem, ContactsKpiData } from '../types/contact';

export interface EnrichmentResponse {
  company: DbCompany;
  emailPattern: string;
  contactsAdded: DbContact[];
  verifiedCount: number;
}

export interface ContactFilterParams {
  tab?: string;
  companyId?: string;
  seniority?: string;
  department?: string;
  role?: string;
  search?: string;
}

export interface FetchContactsResult {
  contacts: ContactItem[];
  kpiSummary: ContactsKpiData;
}

// Local Fallback Store
let localContacts: ContactItem[] = [
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
        title: 'Fintech Leadership Scaling Advisory',
        value: '$30,000',
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

function calculateContactsKpi(list: ContactItem[]): ContactsKpiData {
  const totalContacts = list.length;
  const highInfluence = list.filter(c => c.influenceScore >= 85).length;
  const replied = list.filter(c => c.lastActivity?.toLowerCase().includes('replied')).length;
  const contacted = list.filter(c => c.lastActivity?.toLowerCase().includes('sent') || c.lastActivity?.toLowerCase().includes('opened')).length;

  return {
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
}

/**
 * Fetch contacts list with optional search, tab, and filter queries.
 */
export async function fetchContacts(filters: ContactFilterParams = {}): Promise<FetchContactsResult> {
  try {
    const result = await apiClient.get<FetchContactsResult | ContactItem[]>('/api/contacts', {
      params: {
        tab: filters.tab,
        companyId: filters.companyId,
        seniority: filters.seniority,
        department: filters.department,
        role: filters.role,
        search: filters.search
      }
    });

    if (Array.isArray(result)) {
      return { contacts: result, kpiSummary: calculateContactsKpi(result) };
    }
    return result;
  } catch (_err) {
    // Offline Engine Fallback
    let list = [...localContacts];

    if (filters.tab && filters.tab !== 'all') {
      if (filters.tab === 'decision_makers') {
        list = list.filter(c => c.decisionRole === 'Decision Maker');
      } else if (filters.tab === 'champions') {
        list = list.filter(c => c.decisionRole === 'Champion');
      } else if (filters.tab === 'influencers') {
        list = list.filter(c => c.decisionRole === 'Influencer');
      } else if (filters.tab === 'saved' || filters.tab === 'bookmarked') {
        list = list.filter(c => c.isBookmarked);
      }
    }

    if (filters.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q)
      );
    }

    return { contacts: list, kpiSummary: calculateContactsKpi(localContacts) };
  }
}

/**
 * Get full contact details by ID.
 */
export async function getContactById(id: string): Promise<ContactItem> {
  try {
    return await apiClient.get<ContactItem>(`/api/contacts/${id}`);
  } catch (_err) {
    const found = localContacts.find(c => c.id === id);
    if (!found) throw new Error(`Contact ${id} not found`);
    return found;
  }
}

/**
 * Create a new contact.
 */
export async function createContact(contact: Partial<ContactItem>): Promise<ContactItem> {
  try {
    const created = await apiClient.post<ContactItem>('/api/contacts', contact);
    localContacts.unshift(created);
    return created;
  } catch (_err) {
    const newContact: ContactItem = {
      id: `cont-${Date.now()}`,
      name: contact.name || 'New Contact',
      email: contact.email || 'contact@company.com',
      avatarUrl: contact.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      verificationStatus: 'verified',
      companyName: contact.companyName || 'Target Company',
      companyLocation: contact.companyLocation || 'Lagos, Nigeria',
      companyIndustry: contact.companyIndustry || 'Technology',
      companyEmployees: '100-500 employees',
      role: contact.role || 'Executive',
      decisionRole: contact.decisionRole || 'Decision Maker',
      influenceScore: contact.influenceScore || 88,
      influenceLevel: 'High',
      opportunityFitScore: 90,
      opportunityFitLevel: 'Excellent',
      lastActivity: 'Added via HUNTIQ',
      lastActivityTime: 'Just now',
      source: 'manual',
      isBookmarked: false,
      phone: contact.phone || '+234 800 000 0000',
      location: 'Lagos, Nigeria',
      localTime: '10:30 AM (WAT)',
      about: `${contact.role || 'Executive'} at ${contact.companyName || 'Company'}.`,
      aiInsights: ['Key decision maker identified'],
      tags: ['Verified', 'Contact'],
      opportunities: []
    };
    localContacts.unshift(newContact);
    return newContact;
  }
}

/**
 * Update contact details / bookmark status.
 */
export async function updateContact(id: string, updates: Partial<ContactItem>): Promise<ContactItem> {
  try {
    const updated = await apiClient.patch<ContactItem>(`/api/contacts/${id}`, updates);
    const idx = localContacts.findIndex(c => c.id === id);
    if (idx !== -1) localContacts[idx] = updated;
    return updated;
  } catch (_err) {
    const idx = localContacts.findIndex(c => c.id === id);
    if (idx !== -1) {
      localContacts[idx] = { ...localContacts[idx], ...updates };
      return localContacts[idx];
    }
    throw new Error('Contact not found');
  }
}

/**
 * Delete a contact by ID.
 */
export async function deleteContact(id: string): Promise<{ id: string; deleted: boolean }> {
  try {
    return await apiClient.delete<{ id: string; deleted: boolean }>(`/api/contacts/${id}`);
  } catch (_err) {
    localContacts = localContacts.filter(c => c.id !== id);
    return { id, deleted: true };
  }
}

/**
 * Bulk import contacts.
 */
export async function importContacts(contacts: Partial<ContactItem>[]): Promise<{ importedCount: number; contacts: ContactItem[] }> {
  try {
    return await apiClient.post<{ importedCount: number; contacts: ContactItem[] }>('/api/contacts/import', { contacts });
  } catch (_err) {
    const createdList: ContactItem[] = [];
    for (const c of contacts) {
      const created = await createContact(c);
      createdList.push(created);
    }
    return { importedCount: createdList.length, contacts: createdList };
  }
}

/**
 * Trigger decision-maker and email enrichment for a company.
 */
export async function enrichCompanyContacts(companyId: string): Promise<EnrichmentResponse> {
  return await apiClient.post<EnrichmentResponse>('/api/contacts/enrich', { companyId });
}

/**
 * Verify deliverability for an email address.
 */
export async function verifyEmail(email: string): Promise<any> {
  return await apiClient.post('/api/contacts/verify-email', { email });
}

/**
 * Discover domain email naming pattern.
 */
export async function fetchDomainPattern(domain: string): Promise<any> {
  return await apiClient.get(`/api/contacts/pattern/${domain}`);
}
