export interface CompetitorProfile {
  id: string;
  name: string;
  domain: string;
  seoScore: number;
  estimatedTraffic: string;
  domainAuthority: number;
  organicKeywords: number;
  referringDomains: number;
  contentPages: number;
  reviews: number;
  localVisibilityScore: number;
  technicalScore: number;
  topRankingKeywords: string[];
  advantages: string[];
}

export interface CompetitorComparisonRow {
  metric: string;
  prospectValue: string | number;
  competitorAvg: string | number;
  gapDirection: 'LAGGING' | 'PARITY' | 'LEADING';
  commercialImplication: string;
}

export interface CompetitorAnalysisResult {
  id: string;
  prospectId: string;
  prospectName: string;
  location: string;
  niche: string;
  competitors: CompetitorProfile[];
  comparisonMetrics: CompetitorComparisonRow[];
  whyCompetitorsAreWinning: string[];
  competitiveGapSummary: {
    trafficGap: string;
    authorityGap: string;
    leadGap: string;
  };
  analyzedAt: string;
}

export interface RunCompetitorAnalysisPayload {
  prospectId?: string;
  prospectName: string;
  location?: string;
  niche?: string;
  domain?: string;
}
