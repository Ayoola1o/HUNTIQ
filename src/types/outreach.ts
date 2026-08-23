export type OutreachStatus = 'replied' | 'due_today' | 'scheduled' | 'needs_attention' | 'opened';
export type OutreachChannel = 'email' | 'linkedin' | 'phone' | 'whatsapp';

export interface OutreachMessage {
  id: string;
  sender: 'me' | 'prospect';
  senderName: string;
  timestamp: string;
  channel: OutreachChannel;
  content: string;
}

export interface OutreachItem {
  id: string;
  contactName: string;
  contactRole: string;
  companyName: string;
  domain: string;
  email: string;
  phone?: string;
  avatarBg: string;
  avatarColor: string;
  subject: string;
  lastMessageSnippet: string;
  lastMessageTime: string;
  status: OutreachStatus;
  channel: OutreachChannel;
  campaignName?: string;
  opportunityScore: number;
  unread: boolean;
  thread: OutreachMessage[];
}

export interface OutreachKpiSummary {
  dueToday: number;
  scheduled: number;
  replies: number;
  needsAttention: number;
  responseRate: number; // percentage
}
