import { apiClient } from './client';
import type { 
  OutreachItem, 
  OutreachKpiSummary, 
  OutreachMessage, 
  OutreachStatus, 
  OutreachChannel 
} from '../types/outreach';

export interface FetchOutreachResult {
  conversations: OutreachItem[];
  kpiSummary: OutreachKpiSummary;
}

// Resilient Offline Fallback Store
let localConversations: OutreachItem[] = [
  {
    id: 'out-1',
    contactName: 'Jane Smith',
    contactRole: 'Head of People',
    companyName: 'Acme Technologies',
    domain: 'acmetech.com',
    email: 'jane@acmetech.com',
    phone: '+234 801 234 5678',
    avatarBg: '#fbcfe8',
    avatarColor: '#9d174d',
    subject: 'Workforce scaling frameworks & management ramp',
    lastMessageSnippet: 'We have 38 new openings and need a coaching structure. What is your typical timeline for a management enablement sprint?',
    lastMessageTime: '12m ago',
    status: 'replied',
    channel: 'email',
    campaignName: 'Lagos Tech Hiring Surge',
    opportunityScore: 94,
    unread: true,
    thread: [
      {
        id: 'm-1',
        sender: 'me',
        senderName: 'Ayoola Ade',
        timestamp: 'Yesterday 10:30 AM',
        channel: 'email',
        content: 'Hi Jane, I noticed Acme Technologies recently posted 38 job openings across engineering and operations. Rapid headcount scaling often creates management bottlenecks—we help growth companies reduce onboarding time by 40%.'
      },
      {
        id: 'm-2',
        sender: 'prospect',
        senderName: 'Jane Smith',
        timestamp: 'Today 9:15 AM',
        channel: 'email',
        content: 'Hi Ayoola, this is very timely. We are onboarding 14 new team leads next month and our current training is fragmented. What is your typical timeline for a management enablement sprint?'
      }
    ]
  },
  {
    id: 'out-2',
    contactName: 'Oluwaseun Adewale',
    contactRole: 'VP People Operations',
    companyName: 'Flutterwave',
    domain: 'flutterwave.com',
    email: 'oluwaseun@flutterwave.com',
    phone: '+234 803 111 2233',
    avatarBg: '#ede9fe',
    avatarColor: '#5b21b6',
    subject: 'Cross-border compliance team enablement',
    lastMessageSnippet: 'Thanks for sharing the case study. Let us do a brief intro call this week to explore syllabus alignment.',
    lastMessageTime: '1h ago',
    status: 'replied',
    channel: 'email',
    campaignName: 'Pan-African FinTech Outreach',
    opportunityScore: 96,
    unread: false,
    thread: [
      {
        id: 'm-3',
        sender: 'me',
        senderName: 'Ayoola Ade',
        timestamp: 'May 14',
        channel: 'email',
        content: 'Hi Oluwaseun, congrats on the recent licenses across West Africa! We work with high-growth FinTechs to train multi-jurisdiction compliance officers.'
      },
      {
        id: 'm-4',
        sender: 'prospect',
        senderName: 'Oluwaseun Adewale',
        timestamp: 'Today 8:00 AM',
        channel: 'email',
        content: 'Thanks for sharing the case study. Let us do a brief intro call this week to explore syllabus alignment.'
      }
    ]
  },
  {
    id: 'out-3',
    contactName: 'Tunde Bakare',
    contactRole: 'CTO',
    companyName: 'CloudNova Technologies',
    domain: 'cloudnova.io',
    email: 'tunde@cloudnova.io',
    phone: '+234 802 888 9900',
    avatarBg: '#dbeafe',
    avatarColor: '#1e40af',
    subject: 'Technical leadership onboarding curriculum',
    lastMessageSnippet: 'Follow-up step 2 due today based on AWS cloud migration signal.',
    lastMessageTime: 'Yesterday',
    status: 'due_today',
    channel: 'email',
    campaignName: 'Lagos Tech Hiring Surge',
    opportunityScore: 91,
    unread: false,
    thread: [
      {
        id: 'm-5',
        sender: 'me',
        senderName: 'Ayoola Ade',
        timestamp: '3 days ago',
        channel: 'email',
        content: 'Hi Tunde, noticed CloudNova is migrating core workloads to AWS cloud. Are you planning internal architecture upskilling for senior devs?'
      }
    ]
  },
  {
    id: 'out-4',
    contactName: 'Babafemi Lawson',
    contactRole: 'VP Operations',
    companyName: 'Paystack',
    domain: 'paystack.com',
    email: 'babafemi@paystack.com',
    avatarBg: '#d1fae5',
    avatarColor: '#065f46',
    subject: 'Operations scaling & cross-border merchant rails',
    lastMessageSnippet: 'Scheduled sequence step 3 via LinkedIn InMail tomorrow at 9:00 AM.',
    lastMessageTime: 'May 15',
    status: 'scheduled',
    channel: 'linkedin',
    opportunityScore: 92,
    unread: false,
    thread: [
      {
        id: 'm-6',
        sender: 'me',
        senderName: 'Ayoola Ade',
        timestamp: 'May 12',
        channel: 'linkedin',
        content: 'Hi Babafemi, congrats on expanding settlement partnerships! Would love to share our merchant operations framework.'
      }
    ]
  },
  {
    id: 'out-5',
    contactName: 'Kemi Adebayo',
    contactRole: 'Chief Commercial Officer',
    companyName: 'Nimbus Analytics',
    domain: 'nimbusanalytics.com',
    email: 'kemi@nimbusanalytics.com',
    avatarBg: '#fee2e2',
    avatarColor: '#991b1b',
    subject: 'Enterprise sales team coaching SLA',
    lastMessageSnippet: 'Prospect opened proposal 4 times today without reply. Follow-up recommended.',
    lastMessageTime: '3h ago',
    status: 'needs_attention',
    channel: 'email',
    opportunityScore: 86,
    unread: true,
    thread: [
      {
        id: 'm-7',
        sender: 'me',
        senderName: 'Ayoola Ade',
        timestamp: 'May 10',
        channel: 'email',
        content: 'Hi Kemi, following up on our scope call last week with the revised pricing schedule.'
      }
    ]
  }
];

function calculateLocalKpi(list: OutreachItem[]): OutreachKpiSummary {
  const dueToday = list.filter(o => o.status === 'due_today').length;
  const scheduled = list.filter(o => o.status === 'scheduled').length;
  const replies = list.filter(o => o.status === 'replied').length;
  const needsAttention = list.filter(o => o.status === 'needs_attention').length;
  const totalSent = list.reduce((acc, curr) => acc + curr.thread.filter(m => m.sender === 'me').length, 0);
  const responseRate = totalSent > 0 ? Math.round((replies / totalSent) * 100) : 34;

  return {
    dueToday,
    scheduled,
    replies,
    needsAttention,
    responseRate
  };
}

/**
 * Fetch all outreach threads with optional filters.
 */
export async function fetchOutreachList(params?: {
  status?: string;
  channel?: string;
  query?: string;
}): Promise<FetchOutreachResult> {
  try {
    const result = await apiClient.get<FetchOutreachResult | OutreachItem[]>('/api/outreach', {
      params: {
        status: params?.status,
        channel: params?.channel,
        q: params?.query
      }
    });

    if (Array.isArray(result)) {
      return { conversations: result, kpiSummary: calculateLocalKpi(result) };
    }
    return result;
  } catch (_err) {
    // Offline Engine Fallback
    let list = [...localConversations];

    if (params?.status && params.status !== 'all') {
      list = list.filter(c => c.status.toLowerCase() === params.status?.toLowerCase());
    }

    if (params?.channel && params.channel !== 'all') {
      list = list.filter(c => c.channel.toLowerCase() === params.channel?.toLowerCase());
    }

    if (params?.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(c =>
        c.contactName.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.lastMessageSnippet.toLowerCase().includes(q)
      );
    }

    return { conversations: list, kpiSummary: calculateLocalKpi(localConversations) };
  }
}

/**
 * Get single outreach conversation by ID.
 */
export async function getOutreachById(id: string): Promise<OutreachItem> {
  try {
    return await apiClient.get<OutreachItem>(`/api/outreach/${id}`);
  } catch (_err) {
    const found = localConversations.find(c => c.id === id);
    if (!found) throw new Error(`Outreach conversation ${id} not found`);
    return found;
  }
}

/**
 * Send a reply/message in an active conversation thread.
 */
export async function sendOutreachMessage(
  id: string,
  content: string,
  channel: OutreachChannel = 'email'
): Promise<OutreachItem> {
  try {
    const updated = await apiClient.post<OutreachItem>(`/api/outreach/${id}/messages`, {
      content,
      channel
    });
    const idx = localConversations.findIndex(c => c.id === id);
    if (idx !== -1) localConversations[idx] = updated;
    return updated;
  } catch (_err) {
    const idx = localConversations.findIndex(c => c.id === id);
    if (idx !== -1) {
      const newMessage: OutreachMessage = {
        id: `msg-${Date.now()}`,
        sender: 'me',
        senderName: 'Ayoola Ade',
        timestamp: 'Just now',
        channel,
        content
      };
      localConversations[idx].thread.push(newMessage);
      localConversations[idx].lastMessageSnippet = content.substring(0, 120);
      localConversations[idx].lastMessageTime = 'Just now';
      localConversations[idx].status = 'scheduled';
      localConversations[idx].unread = false;
      return localConversations[idx];
    }
    throw new Error('Conversation not found');
  }
}

/**
 * Start a brand new outreach conversation.
 */
export async function createOutreach(payload: Partial<OutreachItem>): Promise<OutreachItem> {
  try {
    const created = await apiClient.post<OutreachItem>('/api/outreach', payload);
    localConversations.unshift(created);
    return created;
  } catch (_err) {
    const contactName = payload.contactName || 'Decision Maker';
    const companyName = payload.companyName || 'Target Company';
    const channel: OutreachChannel = payload.channel || 'email';
    const subject = payload.subject || `${companyName} scaling & operational readiness`;
    const initialContent = payload.lastMessageSnippet || `Hi ${contactName.split(' ')[0]}, saw your recent team momentum—would love to connect.`;

    const newConversation: OutreachItem = {
      id: `out-${Date.now()}`,
      contactName,
      contactRole: payload.contactRole || 'Executive',
      companyName,
      domain: payload.domain || null,
      email: payload.email || null,
      phone: payload.phone || null,
      emailStatus: payload.email ? 'verified' : 'not_found',
      avatarBg: payload.avatarBg || '#eff6ff',
      avatarColor: payload.avatarColor || '#1d4ed8',
      subject,
      lastMessageSnippet: initialContent,
      lastMessageTime: 'Just now',
      status: payload.status || 'scheduled',
      channel,
      campaignName: payload.campaignName || 'Direct Outreach',
      opportunityScore: payload.opportunityScore || 90,
      unread: false,
      thread: [
        {
          id: `msg-${Date.now()}`,
          sender: 'me',
          senderName: 'Ayoola Ade',
          timestamp: 'Just now',
          channel,
          content: initialContent
        }
      ]
    };

    localConversations.unshift(newConversation);
    return newConversation;
  }
}

/**
 * Update status of an outreach conversation.
 */
export async function updateOutreachStatus(id: string, status: OutreachStatus): Promise<OutreachItem> {
  try {
    const updated = await apiClient.patch<OutreachItem>(`/api/outreach/${id}/status`, { status });
    const idx = localConversations.findIndex(c => c.id === id);
    if (idx !== -1) localConversations[idx] = updated;
    return updated;
  } catch (_err) {
    const idx = localConversations.findIndex(c => c.id === id);
    if (idx !== -1) {
      localConversations[idx].status = status;
      return localConversations[idx];
    }
    throw new Error('Conversation not found');
  }
}
