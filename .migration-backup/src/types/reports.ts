export type ReportType = 
  | 'sales' 
  | 'market' 
  | 'pipeline' 
  | 'prospecting' 
  | 'campaign' 
  | 'contact' 
  | 'executive_brief';

export type ReportStatus = 'ready' | 'generating' | 'scheduled' | 'failed';

export interface ReportMetricRow {
  metric: string;
  current: string;
  previous: string;
  change: string;
  isPositive: boolean;
}

export interface ReportOpportunityItem {
  companyName: string;
  score: number;
  value: number;
  signal: string;
}

export interface SignalAttributionItem {
  signal: string;
  oppCount: number;
  pipelineValue: number;
}

export interface FunnelStageItem {
  stage: string;
  count: number;
  conversionPct: number;
}

export interface ReportRecommendation {
  title: string;
  detail: string;
  actionText: string;
  actionRoute: string;
}

export interface ReportItem {
  id: string;
  name: string;
  type: ReportType;
  period: string;
  createdAt: string;
  createdBy: string;
  ownerAvatarBg: string;
  ownerAvatarColor: string;
  status: ReportStatus;
  isScheduled?: boolean;
  isShared?: boolean;
  summary: string;
  kpiMetrics: ReportMetricRow[];
  topOpportunities: ReportOpportunityItem[];
  signalAttribution: SignalAttributionItem[];
  funnelStages: FunnelStageItem[];
  recommendations: ReportRecommendation[];
  confidenceScore: number;
  sourcesCount: number;
}

export interface ReportsKpiSummary {
  totalGenerated: number;
  scheduledCount: number;
  sharedCount: number;
  thisMonthCount: number;
}
