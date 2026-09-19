import type { MeetingItem } from '../../../src/types/meetings';
import type { MeetingRepository, MeetingFilterOptions } from './meeting-repository';

export class InMemoryMeetingRepository implements MeetingRepository {
  private static meetingsByWorkspace = new Map<string, MeetingItem[]>();

  constructor() {
    const defaultWs = 'ws-default-001';
    if (!InMemoryMeetingRepository.meetingsByWorkspace.has(defaultWs)) {
      InMemoryMeetingRepository.meetingsByWorkspace.set(defaultWs, [
        {
          id: 'meet-1',
          title: 'Executive Discovery & Headcount Expansion Strategy',
          meetingType: 'discovery',
          companyName: 'Acme Technologies',
          domain: 'acmetech.com',
          contactName: 'Jane Smith',
          contactRole: 'Head of People',
          contactAvatarBg: '#ef4444',
          contactAvatarColor: '#ffffff',
          scheduledTime: 'Tomorrow, 11:00 AM – 11:45 AM',
          durationMinutes: 45,
          meetingUrl: 'https://meet.google.com/hnt-acme-disc',
          status: 'upcoming',
          dealValue: 75000,
          opportunityScore: 94,
          aiPrepBrief: {
            keyTakeaway: 'Acme is scaling engineering headcount by 38 roles and opening Ghana and Kenya hubs.',
            recentSignals: ['Engineering Surge (38 roles)', 'Regional expansion into Ghana & Kenya'],
            suggestedQuestions: ['What are the primary hurdles in cross-border tech team onboarding?']
          },
          agenda: ['Review regional growth timeline', 'Explore HUNTIQ talent architecture', 'Next steps & pilot terms'],
          notes: 'Prepared after Jane accepted LinkedIn outreach hook.'
        }
      ]);
    }
  }

  public async list(workspaceId: string, filter?: MeetingFilterOptions): Promise<MeetingItem[]> {
    const list = InMemoryMeetingRepository.meetingsByWorkspace.get(workspaceId) || [];
    let filtered = [...list];

    if (filter?.status && filter.status !== 'all') {
      filtered = filtered.filter(m => m.status === filter.status);
    }
    if (filter?.meetingType && filter.meetingType !== 'all') {
      filtered = filtered.filter(m => m.meetingType === filter.meetingType);
    }
    if (filter?.query?.trim()) {
      const q = filter.query.toLowerCase().trim();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.companyName.toLowerCase().includes(q) ||
        m.contactName.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  public async getById(id: string, workspaceId: string): Promise<MeetingItem | undefined> {
    const list = InMemoryMeetingRepository.meetingsByWorkspace.get(workspaceId) || [];
    return list.find(m => m.id === id);
  }

  public async create(meeting: Partial<MeetingItem>, workspaceId: string, _userId?: string): Promise<MeetingItem> {
    const newItem: MeetingItem = {
      id: meeting.id || `meet-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: meeting.title || 'Executive Strategy Session',
      meetingType: meeting.meetingType || 'discovery',
      companyName: meeting.companyName || 'Target Company',
      domain: meeting.domain || '',
      contactName: meeting.contactName || 'Business Owner',
      contactRole: meeting.contactRole || 'Decision Maker',
      contactAvatarBg: meeting.contactAvatarBg || '#10b981',
      contactAvatarColor: meeting.contactAvatarColor || '#ffffff',
      scheduledTime: meeting.scheduledTime || 'Upcoming',
      durationMinutes: meeting.durationMinutes || 30,
      meetingUrl: meeting.meetingUrl || 'https://meet.google.com/hnt-exec-session',
      status: meeting.status || 'upcoming',
      dealValue: meeting.dealValue || 50000,
      opportunityScore: meeting.opportunityScore || 80,
      aiPrepBrief: meeting.aiPrepBrief || {
        keyTakeaway: 'Focus on growth bottlenecks and digital modernization.',
        recentSignals: ['Opportunity detected via HUNTIQ intelligence'],
        suggestedQuestions: ['What are the immediate priorities for this quarter?']
      },
      agenda: meeting.agenda || ['Introductions', 'Review current gaps', 'Proposed roadmap'],
      notes: meeting.notes || ''
    };

    const current = InMemoryMeetingRepository.meetingsByWorkspace.get(workspaceId) || [];
    current.unshift(newItem);
    InMemoryMeetingRepository.meetingsByWorkspace.set(workspaceId, current);

    return newItem;
  }

  public async update(id: string, partial: Partial<MeetingItem>, workspaceId: string): Promise<MeetingItem | undefined> {
    const list = InMemoryMeetingRepository.meetingsByWorkspace.get(workspaceId) || [];
    const index = list.findIndex(m => m.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...list[index],
      ...partial
    };
    list[index] = updated;
    return updated;
  }

  public async delete(id: string, workspaceId: string): Promise<boolean> {
    const list = InMemoryMeetingRepository.meetingsByWorkspace.get(workspaceId) || [];
    const filtered = list.filter(m => m.id !== id);
    if (filtered.length === list.length) return false;

    InMemoryMeetingRepository.meetingsByWorkspace.set(workspaceId, filtered);
    return true;
  }
}
