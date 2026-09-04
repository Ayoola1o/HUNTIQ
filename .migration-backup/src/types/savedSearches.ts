export type SavedSearchStatus = 'active' | 'paused' | 'archived';
export type SavedSearchType = 'ai_search' | 'advanced_search' | 'signal_search';
export type AlertFrequency = 'immediately' | 'daily' | 'weekly';

export interface SavedSearchActivityItem {
  id: string;
  timestamp: string;
  type: 'new_match' | 'signal_detected' | 'score_changed' | 'criteria_updated';
  title: string;
  detail: string;
  companyName?: string;
  score?: number;
}

export interface MatchedCompanyItem {
  id: string;
  companyName: string;
  domain: string;
  industry: string;
  location: string;
  opportunityScore: number;
  opportunityLevel: 'Very High' | 'High' | 'Medium';
  buyingIntent: 'Very High' | 'High' | 'Medium';
  matchedDate: string;
  isNewMatch: boolean;
  signals: string[];
}

export interface SavedSearchItem {
  id: string;
  name: string;
  description: string;
  searchType: SavedSearchType;
  naturalQuery?: string;
  status: SavedSearchStatus;
  monitoringEnabled: boolean;
  alertFrequency: AlertFrequency;
  createdAt: string;
  lastRunAt: string;
  lastUpdated: string;
  
  // Criteria & Filters
  filters: {
    industries: string[];
    locations: string[];
    companySizes: string[];
    revenueRanges?: string[];
  };
  signalsToWatch: string[];
  icpName: string;

  // Metrics
  totalMatches: number;
  newMatchesCount: number;
  highOpportunityCount: number;
  activeSignalsCount: number;
  unreadAlertsCount: number;

  // Alerts configuration
  alertSettings: {
    onNewMatch: boolean;
    onHighOpportunity: boolean;
    onHiringSignal: boolean;
    onExpansionSignal: boolean;
    onLeadershipSignal: boolean;
    onFundingSignal: boolean;
    onTechMigration: boolean;
  };

  // Recent matched companies & history
  matchedCompanies: MatchedCompanyItem[];
  activityHistory: SavedSearchActivityItem[];
}

export interface SavedSearchesKpiSummary {
  totalSearches: number;
  activeMonitoring: number;
  newMatches: number;
  newSignals: number;
  unreadAlerts: number;
}
