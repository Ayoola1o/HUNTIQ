export type DiscoveryMode = 'local_business' | 'ecommerce_niche' | 'competitor_gap';

export interface CompetitorBenchmark {
  name: string;
  domain?: string;
  rank: number | string;
  estimatedTraffic?: string;
  domainAuthority?: number;
  referringDomains?: number;
}

export interface DiscoveredBusiness {
  id: string;
  name: string;
  mode: DiscoveryMode;
  industry: string;
  category: string;
  location: string;
  address?: string;
  website?: string;
  hasWebsite: boolean;
  phone?: string;
  googleRating?: number;
  googleReviewCount?: number;
  seoOpportunityScore: number; // 0 - 100
  estimatedMonthlyOpportunity: string; // e.g. "₦350,000 - ₦750,000"
  commercialIntentKeywords: string[];
  topCompetitors: CompetitorBenchmark[];
  identifiedGaps: string[];
  recommendedService: string;
  leadMagnetTitle: string;
  leadMagnetType: string;
  createdAt: string;
}

export interface DiscoveryQuery {
  mode: DiscoveryMode;
  query?: string;
  location?: string;
  nicheOrIndustry?: string;
  radiusKm?: number;
  country?: string;
  minOpportunityScore?: number;
}

export interface DiscoveryKpiSummary {
  totalDiscovered: number;
  highOpportunityCount: number;
  avgOpportunityScore: number;
  estimatedPipelineValue: string;
}

export interface DiscoverySearchResult {
  businesses: DiscoveredBusiness[];
  kpiSummary: DiscoveryKpiSummary;
  query: DiscoveryQuery;
}

export interface NicheTemplate {
  id: string;
  title: string;
  mode: DiscoveryMode;
  industry: string;
  defaultLocation: string;
  defaultKeywords: string[];
  description: string;
}
