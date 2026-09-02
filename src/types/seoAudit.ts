export type CoreWebVitalsRating = 'Good' | 'Needs Improvement' | 'Poor';
export type IndexabilityStatus = 'Indexed' | 'Warning' | 'Blocked';
export type NapConsistencyStatus = 'Consistent' | 'Discrepancies Found' | 'Missing';

export interface KeywordGapItem {
  keyword: string;
  searchVolume: number;
  competitorRank: number | string;
  prospectRank: number | string;
  commercialIntent: 'High' | 'Very High' | 'Moderate';
  cpcEstimate: string;
}

export interface TechnicalSeoAudit {
  score: number; // 0 - 100
  https: boolean;
  mobileOptimization: boolean;
  pageSpeedScore: number; // 0 - 100
  coreWebVitals: CoreWebVitalsRating;
  brokenLinksCount: number;
  indexability: IndexabilityStatus;
  xmlSitemap: boolean;
  robotsTxt: boolean;
  canonicalTags: boolean;
}

export interface OnPageSeoAudit {
  score: number; // 0 - 100
  titleOptimizationPct: number; // 0 - 100%
  metaDescriptionsPct: number;  // 0 - 100%
  headingStructurePct: number;   // 0 - 100%
  keywordTargetingPct: number;   // 0 - 100%
  internalLinkingPct: number;    // 0 - 100%
  imageOptimizationPct: number;  // 0 - 100%
}

export interface LocalSeoAudit {
  score: number; // 0 - 100
  googleBusinessPresence: boolean;
  googleRating: number;
  reviewCount: number;
  reviewResponsesPct: number;
  napConsistency: NapConsistencyStatus;
  localLandingPages: boolean;
  localSchema: boolean;
  localCitationsCount: number;
}

export interface ContentAndKeywordAudit {
  score: number; // 0 - 100
  totalIndexedKeywords: number;
  page1Keywords: number;
  missedCommercialKeywords: KeywordGapItem[];
  contentPagesCount: number;
  contentFreshness: string;
}

export interface BacklinkAndAuthorityAudit {
  score: number; // 0 - 100
  domainAuthority: number; // 0 - 100
  referringDomains: number;
  backlinksTotal: number;
  competitorAvgDA: number;
  competitorAvgReferringDomains: number;
}

export interface SeoIssueItem {
  category: 'Technical' | 'On-page' | 'Local' | 'Keywords' | 'Backlinks';
  title: string;
  description: string;
  impact: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface SeoAuditResult {
  id: string;
  businessId: string;
  businessName: string;
  domain?: string;
  location: string;
  niche: string;
  overallSeoScore: number; // 0 - 100
  seoOpportunityScore: number; // 0 - 100
  estimatedMonthlyRevenueOpportunity: string;
  recommendedServicePackage: string;
  technical: TechnicalSeoAudit;
  onPage: OnPageSeoAudit;
  local: LocalSeoAudit;
  contentAndKeywords: ContentAndKeywordAudit;
  backlinks: BacklinkAndAuthorityAudit;
  criticalIssues: SeoIssueItem[];
  auditedAt: string;
}

export interface RunSeoAuditPayload {
  businessId?: string;
  businessName: string;
  domain?: string;
  location?: string;
  niche?: string;
}
