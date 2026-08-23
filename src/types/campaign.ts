export type CampaignStatus = 'active' | 'draft' | 'paused' | 'completed';
export type CampaignChannel = 'email' | 'linkedin' | 'multichannel';

export interface CampaignSequenceStep {
  id: string;
  stepNumber: number;
  channel: 'email' | 'linkedin' | 'call' | 'whatsapp';
  title: string;
  delayDays: number;
  contentSnippet: string;
}

export interface TargetProspectItem {
  id: string;
  contactName: string;
  contactRole: string;
  companyName: string;
  domain: string;
  email: string;
  status: 'pending' | 'delivered' | 'opened' | 'replied' | 'converted';
  opportunityScore: number;
  lastTouch: string;
}

export interface CampaignItem {
  id: string;
  name: string;
  description: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  targetAudienceName: string;
  audienceCount: number;
  sentCount: number;
  openRate: number; // e.g. 64.2%
  replyRate: number; // e.g. 8.4%
  opportunitiesCount: number;
  expectedValue: number;
  createdAt: string;
  lastActivity: string;
  sequence: CampaignSequenceStep[];
  prospects: TargetProspectItem[];
}

export interface CampaignKpiSummary {
  activeCampaigns: number;
  totalAudience: number;
  totalReplies: number;
  opportunitiesCreated: number;
  pipelineGenerated: number;
}
