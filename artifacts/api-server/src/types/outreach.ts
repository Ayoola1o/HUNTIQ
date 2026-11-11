export type OutreachStatus = 'replied' | 'due_today' | 'scheduled' | 'needs_attention' | 'opened' | 'contacted' | 'draft';
export type OutreachChannel = 'email' | 'linkedin' | 'phone' | 'whatsapp';

export interface OutreachMessage {
  providerThreadId?: string;
  providerMessageId?: string;
  providerRfcMessageId?: string;
  deliveryStatus?: 'sending' | 'sent' | 'failed' | 'unknown';
  id: string;
  sender: 'me' | 'prospect';
  senderName: string;
  timestamp: string;
  channel: OutreachChannel;
  content: string;
}

export interface OutreachItem {
  providerThreadId?: string | null;
  providerMessageId?: string | null;
  providerRfcMessageId?: string | null;
  leadId?: string | null;
  contactId?: string | null;
  researchReportId?: string | null;
  emailStatus?: 'verified' | 'unverified' | 'not_found';
  deliveryStatus?: 'sending' | 'sent' | 'failed' | 'unknown';
  deliveryError?: string;
  evidenceSources?: Array<{ title: string; url: string }>;
  id: string;
  contactName: string;
  contactRole: string;
  companyName: string;
  domain?: string | null;
  email?: string | null;
  phone?: string | null;
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
  leadId?: string;
  contactId?: string;
  researchReportId?: string;
  domain?: string | null;
  phone?: string | null;
  address?: string | null;
  district?: string | null;
  contactName?: string | null;
  contactRole?: string | null;
  email?: string | null;
  emailStatus?: 'verified' | 'unverified' | 'not_found';
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
