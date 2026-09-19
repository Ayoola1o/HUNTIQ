export interface MarketKpiItem {
  id: string;
  title: string;
  value: string;
  change: string;
  comparisonText: string;
  iconBg: string;
  iconColor: string;
  sparklineColor: string;
  sparklineData: number[];
}

export interface IndustrySignalItem {
  id: string;
  name: string;
  signalsCount: number;
  signalsFormatted: string;
  trend: string;
  trendPositive: boolean;
  opportunityIndex: number;
  opportunityDensity: number; // e.g. 0.42 (42%)
  companiesAffected: number;
  hiringGrowth: string;
  expansionGrowth: string;
  fundingGrowth: string;
  whyItMatters: string;
  sparkline: number[];
  iconBg: string;
  iconColor: string;
  topCompanies: string[];
}

export interface CompanySignalRow {
  id: string;
  name: string;
  logoBg: string;
  logoColor: string;
  logoInitial: string;
  industry: string;
  location: string;
  topSignal: string;
  signalType: 'hiring' | 'expansion' | 'funding' | 'leadership' | 'technology' | 'news';
  signalsCount: number;
  intensity: number; // 1 to 5
  intensityColor: string;
  opportunityScore: number;
  scoreLevel: 'Very High' | 'High' | 'Medium';
}

export interface LatestMarketSignalItem {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  industry: string;
  location: string;
  timeAgo: string;
  signalType: 'hiring' | 'expansion' | 'funding' | 'leadership' | 'technology' | 'news';
  strength: 'Very High' | 'High' | 'Medium' | 'Low';
  confidence: number;
  evidence: string;
  aiInterpretation: string;
  iconBg: string;
  iconColor: string;
}

export interface EmergingTrendItem {
  id: string;
  title: string;
  growth: string;
  growthPct: number;
  description: string;
  category: string;
  signalCount: number;
  velocity: 'Fast Rising' | 'High Growth' | 'Emerging';
  iconType: 'ai' | 'security' | 'remote' | 'sustainability' | 'fintech';
  iconBg: string;
  iconColor: string;
}

export interface GeographicHotspot {
  id: string;
  city: string;
  state?: string;
  country: string;
  intensity: 'High' | 'Medium' | 'Low';
  signalCount: number;
  icpFit: number;
  highIntentCount: number;
  opportunityIndex: number;
  topIndustry: string;
  growth: string;
}

export interface MarketAiInsightItem {
  id: string;
  title: string;
  category: string;
  observation: string;
  evidence: string;
  interpretation: string;
  commercialImplication: string;
  recommendedAction: string;
  actionCta: string;
  confidence: number;
  sampleCompaniesCount: number;
  industryTarget?: string;
}

export interface RecommendedActionItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  actionText: string;
  targetNav: string;
}
