export type PipelineStage = 'contacted' | 'meeting' | 'proposal' | 'negotiation' | 'won' | 'lost';

export type PipelineViewMode = 'kanban' | 'list' | 'forecast';

export type PipelineQuickFilter = 'all' | 'my_deals' | 'at_risk' | 'closing_soon';

export interface DealActivityLog {
  id: string;
  timestamp: string;
  type: 'email' | 'meeting' | 'proposal_viewed' | 'call' | 'note' | 'stage_changed';
  title: string;
  detail: string;
}

export interface PipelineDealItem {
  id: string;
  companyName: string;
  domain: string;
  dealTitle: string;
  serviceName: string;
  dealValue: number; // e.g. 18000 ($18,000)
  probability: number; // e.g. 72 (72%)
  opportunityScore: number; // e.g. 94 (94/100)
  stage: PipelineStage;
  stageEnteredAt: string;
  expectedCloseDate: string;
  ownerName: string;
  contactName: string;
  contactRole: string;
  contactAvatarBg: string;
  contactAvatarColor: string;
  lastActivity: string;
  nextAction: string;
  nextActionDueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  isAtRisk?: boolean;
  atRiskReason?: string;
  lostReason?: string;
  activities: DealActivityLog[];
}

export interface PipelineKpiSummary {
  activeDeals: number;
  pipelineValue: number;
  expectedRevenue: number;
  winRate: number; // percentage e.g. 24.8%
  avgDealSize: number;
  avgSalesCycle: number; // in days e.g. 31
}
