export interface SearchCriteria {
  naturalQuery: string;
  tab: 'ai' | 'advanced';
  industries: string[];
  locations: string[];
  companySize: string;
  revenue: string;
  businessType: string;
  technologies: string[];
  yearsInBusiness: string;
  icpFit: string;
  signals: string[];
}

export interface QuickTemplate {
  id: string;
  title: string;
  description: string;
  iconType: 'growth' | 'hiring' | 'funding' | 'leadership' | 'tech';
  iconColor: string;
  iconBg: string;
  preset: Partial<SearchCriteria>;
}

export interface SearchEstimation {
  estimatedCompanies: string;
  highOpportunityMatches: string;
  averageScore: number;
  researchSources: string;
  dataFreshness: string;
}
