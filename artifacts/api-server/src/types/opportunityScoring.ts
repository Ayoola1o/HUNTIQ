export type OpportunityFactorName = 
  | 'Search Demand'
  | 'Competitor Advantage'
  | 'Prospect Weakness'
  | 'Commercial Intent'
  | 'Ability To Fix'
  | 'Estimated Business Value';

export interface OpportunityFactor {
  name: OpportunityFactorName;
  score: number; // 0 - 100
  weight: number; // e.g. 0.20
  weightedScore: number;
  rationale: string;
  level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
}

export interface PillarScores {
  seoHealth: number;       // e.g. 54 / 100
  competitorGap: number;   // e.g. 81 / 100
  keywordGap: number;      // e.g. 76 / 100
  contentGap: number;      // e.g. 83 / 100
}

export interface TopOpportunityBullet {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  detail: string;
}

export interface OpportunityScoringResult {
  id: string;
  prospectId: string;
  prospectName: string;
  niche: string;
  location: string;
  domain?: string;
  seoOpportunityScore: number; // 0 - 100 (Higher = Stronger Sales Prospect)
  estimatedMonthlyOpportunity: string; // e.g. "₦850,000 – ₦2,100,000"
  estimatedAnnualOpportunity: string;  // e.g. "₦10.2M – ₦25.2M"
  pillars: PillarScores;
  factors: OpportunityFactor[];
  topOpportunities: TopOpportunityBullet[];
  commercialDiagnosis: string;
  recommendedService: string;
  scoredAt: string;
}

export interface CalculateOpportunityPayload {
  prospectId?: string;
  prospectName: string;
  niche?: string;
  location?: string;
  domain?: string;
  rawSeoScore?: number;
  hasWebsite?: boolean;
}
