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

export interface ProspectPitchPayload {
  companyName: string;
  domain?: string;
  phone?: string;
  address?: string;
  district?: string;
  contactName?: string;
  contactRole?: string;
  email?: string;
  opportunityScore?: number;
  seoScore?: number;
  competitorGapScore?: number;
  commercialIntentKeywords?: string[];
  topCompetitors?: Array<{ name: string; rank: string; domain?: string }>;
  identifiedGaps?: string[];
  recommendedPackage?: string;
  estimatedValue?: number;
  leadMagnet?: { title: string; type: string };
  suggestedSubject?: string;
  suggestedBody?: string;
  pitchSource?: 'niche-discovery' | 'seo-audit' | 'competitor-analysis' | 'opportunity-score' | 'geo-radar';
}
