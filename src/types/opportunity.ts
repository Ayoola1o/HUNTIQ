export type OpportunityPriority = 'Hot' | 'High' | 'Medium' | 'Low' | 'Won' | 'Lost';
export type OpportunityStage = 'Discovery' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Nurturing' | 'Closed Won' | 'Closed Lost';

export interface OpportunitySignalItem {
  id: string;
  type: string;
  title: string;
  detail: string;
  timeAgo: string;
  confidence: number;
}

export interface ScoreFactors {
  icpFit: { score: number; max: number };
  buyingIntent: { score: number; max: number };
  triggerEvents: { score: number; max: number };
  decisionMakerAccess: { score: number; max: number };
  companySize: { score: number; max: number };
  engagement: { score: number; max: number };
}

export interface OpportunityItem {
  id: string;
  companyName: string;
  avatarLetter: string;
  avatarBg: string;
  industry: string;
  employees: string;
  location: string;
  score: number;
  scoreTrend: 'up' | 'down' | 'neutral';
  priority: OpportunityPriority;
  whyNow: string;
  tags: string[];
  estimatedValue: number;
  stage: OpportunityStage;
  lastActivity: string;
  lastActivityType: 'signal' | 'stage_change' | 'outreach' | 'research';
  website: string;
  revenue: string;
  linkedInUrl: string;
  signals: OpportunitySignalItem[];
  scoreFactors: ScoreFactors;
  bestNextStep: {
    actionText: string;
    targetRole: string;
    targetName: string;
  };
}
