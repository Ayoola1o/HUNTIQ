import type { OutreachItem, OutreachMessage } from '../../../src/types/outreach';
import type { OutreachRepository, OutreachFilterOptions } from './outreach-repository';

export class InMemoryOutreachRepository implements OutreachRepository {
  private static threadsByWorkspace = new Map<string, OutreachItem[]>();

  constructor() {
    const defaultWs = 'ws-default-001';
    if (!InMemoryOutreachRepository.threadsByWorkspace.has(defaultWs)) {
      InMemoryOutreachRepository.threadsByWorkspace.set(defaultWs, [
        {
          id: 'out-1',
          contactName: 'Jane Smith',
          contactRole: 'Head of People',
          companyName: 'Acme Technologies',
          domain: 'acmetech.com',
          email: 'jane@acmetech.com',
          phone: '+234 801 234 5678',
          avatarBg: '#ef4444',
          avatarColor: '#ffffff',
          subject: 'Talent architecture & executive search advisory',
          lastMessageSnippet: 'Thanks for reaching out! We are indeed actively expanding our engineering team in Lagos.',
          lastMessageTime: '10:42 AM',
          status: 'replied',
          channel: 'email',
          campaignName: 'Lagos Tech Scaleup Sequence',
          opportunityScore: 94,
          unread: true,
          thread: [
            {
              id: 'm-1',
              sender: 'me',
              senderName: 'Ayoola Ade',
              timestamp: 'Yesterday 2:15 PM',
              channel: 'email',
              content: 'Hi Jane, noticed Acme is hiring 38 roles. Would love to share insights on engineering onboarding.'
            },
            {
              id: 'm-2',
              sender: 'prospect',
              senderName: 'Jane Smith',
              timestamp: 'Today 10:42 AM',
              channel: 'email',
              content: 'Thanks for reaching out! We are indeed actively expanding our engineering team in Lagos. Let\'s speak next Tuesday.'
            }
          ]
        }
      ]);
    }
  }

  public async list(workspaceId: string, filter?: OutreachFilterOptions): Promise<OutreachItem[]> {
    const list = InMemoryOutreachRepository.threadsByWorkspace.get(workspaceId) || [];
    let filtered = [...list];

    if (filter?.status && filter.status !== 'all') {
      filtered = filtered.filter(t => t.status === filter.status);
    }
    if (filter?.channel && filter.channel !== 'all') {
      filtered = filtered.filter(t => t.channel === filter.channel);
    }
    if (filter?.query?.trim()) {
      const q = filter.query.toLowerCase().trim();
      filtered = filtered.filter(t =>
        t.contactName.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        t.subject.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  public async getById(id: string, workspaceId: string): Promise<OutreachItem | undefined> {
    const list = InMemoryOutreachRepository.threadsByWorkspace.get(workspaceId) || [];
    return list.find(t => t.id === id);
  }

  public async create(outreach: Partial<OutreachItem>, workspaceId: string, _userId?: string): Promise<OutreachItem> {
    const newItem: OutreachItem = {
      id: outreach.id || `out-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      contactName: outreach.contactName || 'Business Owner',
      contactRole: outreach.contactRole || 'Decision Maker',
      companyName: outreach.companyName || 'Target Company',
      domain: outreach.domain || '',
      email: outreach.email || null,
      phone: outreach.phone || null,
      avatarBg: outreach.avatarBg || '#6366f1',
      avatarColor: outreach.avatarColor || '#ffffff',
      subject: outreach.subject || 'Market Intelligence & Outreach Pitch',
      lastMessageSnippet: outreach.lastMessageSnippet || 'Pitch initiated',
      lastMessageTime: 'Just now',
      status: outreach.status || 'due_today',
      channel: outreach.channel || 'email',
      campaignName: outreach.campaignName || 'Direct Executive Pitch',
      opportunityScore: outreach.opportunityScore || 75,
      unread: false,
      thread: outreach.thread || []
    };

    const current = InMemoryOutreachRepository.threadsByWorkspace.get(workspaceId) || [];
    current.unshift(newItem);
    InMemoryOutreachRepository.threadsByWorkspace.set(workspaceId, current);

    return newItem;
  }

  public async update(id: string, partial: Partial<OutreachItem>, workspaceId: string): Promise<OutreachItem | undefined> {
    const list = InMemoryOutreachRepository.threadsByWorkspace.get(workspaceId) || [];
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...list[index],
      ...partial,
      lastMessageTime: 'Just now'
    };
    list[index] = updated;
    return updated;
  }

  public async addMessage(id: string, message: Omit<OutreachMessage, 'id' | 'timestamp'>, workspaceId: string): Promise<OutreachItem | undefined> {
    const list = InMemoryOutreachRepository.threadsByWorkspace.get(workspaceId) || [];
    const item = list.find(t => t.id === id);
    if (!item) return undefined;

    const msg: OutreachMessage = {
      ...message,
      id: `msg-${Date.now().toString(36)}`,
      timestamp: 'Just now'
    };

    item.thread.push(msg);
    item.lastMessageSnippet = msg.content.substring(0, 80);
    item.lastMessageTime = 'Just now';
    return item;
  }

  public async delete(id: string, workspaceId: string): Promise<boolean> {
    const list = InMemoryOutreachRepository.threadsByWorkspace.get(workspaceId) || [];
    const filtered = list.filter(t => t.id !== id);
    if (filtered.length === list.length) return false;

    InMemoryOutreachRepository.threadsByWorkspace.set(workspaceId, filtered);
    return true;
  }
}
