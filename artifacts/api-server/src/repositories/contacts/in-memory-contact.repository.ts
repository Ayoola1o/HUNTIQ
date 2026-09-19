import type { ContactItem, ContactSource } from '../../../src/types/contact';
import type { ContactRepository } from './contact-repository';

interface StoredContact extends ContactItem {
  userId: string;
  workspaceId: string;
}

export class InMemoryContactRepository implements ContactRepository {
  private static contacts: StoredContact[] = [];

  constructor() {
    if (InMemoryContactRepository.contacts.length === 0) {
      InMemoryContactRepository.contacts = [
        {
          id: 'contact-seed-001',
          userId: 'user-default-001',
          workspaceId: 'ws-default-001',
          name: 'Chidi Okafor',
          email: 'c.okafor@payapex.io',
          avatarUrl: '',
          verificationStatus: 'verified',
          companyName: 'PayApex Global',
          companyLocation: 'Lagos, Nigeria',
          companyIndustry: 'Fintech & Digital Banking',
          companyEmployees: '250-500',
          role: 'VP of Technology & Infrastructure',
          decisionRole: 'Decision Maker',
          influenceScore: 92,
          influenceLevel: 'High Influence',
          opportunityFitScore: 95,
          opportunityFitLevel: 'Strong Fit',
          lastActivity: 'Replied to architecture inquiry',
          lastActivityTime: '3 hours ago',
          source: 'linkedin' as ContactSource,
          isBookmarked: true,
          phone: '+234 803 123 4567',
          location: 'Victoria Island, Lagos',
          localTime: 'WAT (UTC+1)',
          about: 'Overseeing core engineering and cloud infrastructure transitions.',
          aiInsights: ['Leading $4M infrastructure modernization program'],
          tags: ['Decision Maker', 'Cloud Migration'],
          opportunities: []
        },
        {
          id: 'contact-seed-002',
          userId: 'user-default-001',
          workspaceId: 'ws-default-001',
          name: 'Dr. Amina Bello',
          email: 'a.bello@korahealth.co',
          avatarUrl: '',
          verificationStatus: 'verified',
          companyName: 'KoraHealth Labs',
          companyLocation: 'Nairobi, Kenya',
          companyIndustry: 'HealthTech & Diagnostics',
          companyEmployees: '100-250',
          role: 'Chief Operating Officer',
          decisionRole: 'Champion',
          influenceScore: 88,
          influenceLevel: 'High Influence',
          opportunityFitScore: 90,
          opportunityFitLevel: 'Strong Fit',
          lastActivity: 'Scheduled strategic roadmap review',
          lastActivityTime: 'Yesterday',
          source: 'email' as ContactSource,
          isBookmarked: true,
          phone: '+254 712 345 678',
          location: 'Westlands, Nairobi',
          localTime: 'EAT (UTC+3)',
          about: 'Spearheading regional clinical diagnostics footprint expansion.',
          aiInsights: ['Accelerating hiring across 4 clinics'],
          tags: ['Champion', 'Regional Expansion'],
          opportunities: []
        }
      ];
    }
  }

  public async listByUser(userId: string, workspaceId: string): Promise<ContactItem[]> {
    return InMemoryContactRepository.contacts
      .filter((c) => c.workspaceId === workspaceId && (c.userId === userId || !c.userId))
      .map(({ userId: _u, workspaceId: _w, ...contact }) => contact);
  }

  public async getById(id: string, userId: string, workspaceId: string): Promise<ContactItem | null> {
    const item = InMemoryContactRepository.contacts.find(
      (c) => c.id === id && c.workspaceId === workspaceId && (c.userId === userId || !c.userId)
    );
    if (!item) return null;
    const { userId: _u, workspaceId: _w, ...contact } = item;
    return contact;
  }

  public async create(userId: string, workspaceId: string, contact: Partial<ContactItem>): Promise<ContactItem> {
    const newContact: StoredContact = {
      id: contact.id || `contact-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      workspaceId,
      name: contact.name || 'Executive Contact',
      email: contact.email || '',
      avatarUrl: contact.avatarUrl || '',
      verificationStatus: contact.verificationStatus || 'unverified',
      companyName: contact.companyName || 'Enterprise Prospect',
      companyLocation: contact.companyLocation || 'Global',
      companyIndustry: contact.companyIndustry || 'Technology',
      companyEmployees: contact.companyEmployees || '50-250',
      role: contact.role || 'Executive',
      decisionRole: contact.decisionRole || 'Decision Maker',
      influenceScore: contact.influenceScore || 85,
      influenceLevel: (contact.influenceScore || 85) >= 85 ? 'High Influence' : 'Medium Influence',
      opportunityFitScore: contact.opportunityFitScore || 88,
      opportunityFitLevel: 'Strong Fit',
      lastActivity: contact.lastActivity || 'Created in HUNTIQ',
      lastActivityTime: 'Just now',
      source: contact.source || 'manual',
      isBookmarked: Boolean(contact.isBookmarked),
      phone: contact.phone || '',
      location: contact.location || 'Global',
      localTime: 'UTC',
      about: contact.about || 'Executive contact verified via HUNTIQ.',
      aiInsights: contact.aiInsights || [],
      tags: contact.tags || ['Key Account'],
      opportunities: contact.opportunities || []
    };
    InMemoryContactRepository.contacts.unshift(newContact);
    const { userId: _u, workspaceId: _w, ...created } = newContact;
    return created;
  }

  public async update(id: string, userId: string, workspaceId: string, updates: Partial<ContactItem>): Promise<ContactItem | null> {
    const index = InMemoryContactRepository.contacts.findIndex(
      (c) => c.id === id && c.workspaceId === workspaceId && (c.userId === userId || !c.userId)
    );
    if (index === -1) return null;
    InMemoryContactRepository.contacts[index] = {
      ...InMemoryContactRepository.contacts[index],
      ...updates
    };
    const { userId: _u, workspaceId: _w, ...updated } = InMemoryContactRepository.contacts[index];
    return updated;
  }

  public async delete(id: string, userId: string, workspaceId: string): Promise<boolean> {
    const prevLen = InMemoryContactRepository.contacts.length;
    InMemoryContactRepository.contacts = InMemoryContactRepository.contacts.filter(
      (c) => !(c.id === id && c.workspaceId === workspaceId && (c.userId === userId || !c.userId))
    );
    return InMemoryContactRepository.contacts.length < prevLen;
  }
}
