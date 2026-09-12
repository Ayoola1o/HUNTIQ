import { apiClient } from './client';
import type { 
  SavedSearchItem, 
  SavedSearchesKpiSummary, 
  MatchedCompanyItem, 
  SavedSearchActivityItem 
} from '../types/savedSearches';

export interface FetchSavedSearchesResult {
  searches: SavedSearchItem[];
  kpiSummary: SavedSearchesKpiSummary;
}

// Initial Local Fallback Store
let localSavedSearches: SavedSearchItem[] = [
  {
    id: 'search-1',
    name: 'Lagos Technology Growth Companies',
    description: 'Technology companies in Lagos with 50–500 employees showing strong hiring surges and regional expansion.',
    searchType: 'ai_search',
    status: 'active',
    monitoringEnabled: true,
    alertFrequency: 'immediately',
    createdAt: '3 days ago',
    lastRunAt: '12m ago',
    lastUpdated: '12m ago',
    filters: {
      industries: ['Technology & SaaS', 'FinTech'],
      locations: ['Lagos, Nigeria'],
      companySizes: ['50 – 500']
    },
    signalsToWatch: ['Hiring Surge', 'Regional Expansion', 'New Leadership'],
    icpName: 'Peak Consulting Growth ICP',
    totalMatches: 184,
    newMatchesCount: 12,
    highOpportunityCount: 68,
    activeSignalsCount: 24,
    unreadAlertsCount: 3,
    alertSettings: {
      onNewMatch: true,
      onHighOpportunity: true,
      onHiringSignal: true,
      onExpansionSignal: true,
      onLeadershipSignal: true,
      onFundingSignal: false,
      onTechMigration: false
    },
    matchedCompanies: [
      {
        id: 'mc-1',
        companyName: 'Acme Technologies',
        domain: 'acmetech.com',
        industry: 'Technology & SaaS',
        location: 'Lagos, Nigeria',
        opportunityScore: 94,
        opportunityLevel: 'Very High',
        buyingIntent: 'Very High',
        matchedDate: '12m ago',
        isNewMatch: true,
        signals: ['Hiring Surge (38 roles)', 'New COO Appointed', 'Expansion into Ghana']
      },
      {
        id: 'mc-2',
        companyName: 'CloudNova Technologies',
        domain: 'cloudnova.io',
        industry: 'Cloud Infrastructure',
        location: 'Lagos, Nigeria',
        opportunityScore: 91,
        opportunityLevel: 'Very High',
        buyingIntent: 'High',
        matchedDate: '1h ago',
        isNewMatch: true,
        signals: ['AWS Migration', '14 Engineering Openings']
      }
    ],
    activityHistory: [
      {
        id: 'act-1',
        timestamp: '12m ago',
        type: 'new_match',
        title: '3 New Matching Companies Discovered',
        detail: 'Acme Technologies, PayZone & FinTrack matched your Lagos Tech ICP.',
        companyName: 'Acme Technologies',
        score: 94
      }
    ]
  },
  {
    id: 'search-2',
    name: 'Executive Leadership Hires in FinTech',
    description: 'Companies appointing new C-level officers or VPs in West Africa over the past 30 days.',
    searchType: 'ai_search',
    status: 'active',
    monitoringEnabled: true,
    alertFrequency: 'daily',
    createdAt: '5 days ago',
    lastRunAt: '1h ago',
    lastUpdated: '1h ago',
    filters: {
      industries: ['Financial Services', 'FinTech'],
      locations: ['Lagos, Nigeria', 'Accra, Ghana'],
      companySizes: ['100 – 500']
    },
    signalsToWatch: ['Leadership Change', 'Executive Appointment'],
    icpName: 'Executive Search ICP',
    totalMatches: 42,
    newMatchesCount: 4,
    highOpportunityCount: 18,
    activeSignalsCount: 11,
    unreadAlertsCount: 2,
    alertSettings: {
      onNewMatch: true,
      onHighOpportunity: true,
      onHiringSignal: false,
      onExpansionSignal: true,
      onLeadershipSignal: true,
      onFundingSignal: false,
      onTechMigration: false
    },
    matchedCompanies: [],
    activityHistory: []
  }
];

function calculateLocalKpi(searches: SavedSearchItem[]): SavedSearchesKpiSummary {
  return {
    totalSearches: searches.length,
    activeMonitoring: searches.filter(s => s.monitoringEnabled).length,
    newMatches: searches.reduce((acc, curr) => acc + (curr.newMatchesCount || 0), 0),
    newSignals: searches.reduce((acc, curr) => acc + (curr.activeSignalsCount || 0), 0),
    unreadAlerts: searches.reduce((acc, curr) => acc + (curr.unreadAlertsCount || 0), 0)
  };
}

/**
 * Fetch all saved searches with optional status, type, and text queries.
 */
export async function fetchSavedSearches(params?: {
  status?: string;
  searchType?: string;
  monitoring?: boolean;
  query?: string;
}): Promise<FetchSavedSearchesResult> {
  try {
    const result = await apiClient.get<FetchSavedSearchesResult | SavedSearchItem[]>('/api/saved-searches', {
      params: {
        status: params?.status,
        searchType: params?.searchType,
        monitoring: params?.monitoring,
        q: params?.query
      }
    });

    if (Array.isArray(result)) {
      return { searches: result, kpiSummary: calculateLocalKpi(result) };
    }
    return result;
  } catch (_err) {
    // Offline Engine Fallback
    let list = [...localSavedSearches];
    if (params?.status && params.status !== 'all') {
      list = list.filter(s => s.status === params.status);
    }
    if (params?.searchType && params.searchType !== 'all') {
      list = list.filter(s => s.searchType === params.searchType);
    }
    if (params?.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }
    return { searches: list, kpiSummary: calculateLocalKpi(localSavedSearches) };
  }
}

/**
 * Get full saved search details by ID.
 */
export async function getSavedSearchById(id: string): Promise<SavedSearchItem> {
  try {
    return await apiClient.get<SavedSearchItem>(`/api/saved-searches/${id}`);
  } catch (_err) {
    const found = localSavedSearches.find(s => s.id === id);
    if (!found) throw new Error(`Saved search ${id} not found`);
    return found;
  }
}

/**
 * Create a new saved search and trigger initial scan.
 */
export async function createSavedSearch(payload: Partial<SavedSearchItem>): Promise<SavedSearchItem> {
  try {
    const created = await apiClient.post<SavedSearchItem>('/api/saved-searches', payload);
    localSavedSearches.unshift(created);
    return created;
  } catch (_err) {
    const newSearch: SavedSearchItem = {
      id: `search-${Date.now()}`,
      name: payload.name || 'Custom Monitored Search',
      description: payload.description || 'Target companies monitored in real-time.',
      searchType: payload.searchType || 'ai_search',
      status: 'active',
      monitoringEnabled: payload.monitoringEnabled ?? true,
      alertFrequency: payload.alertFrequency || 'immediately',
      createdAt: 'Just now',
      lastRunAt: 'Just now',
      lastUpdated: 'Just now',
      filters: payload.filters || {
        industries: ['Technology & SaaS'],
        locations: ['Lagos, Nigeria'],
        companySizes: ['50 – 500']
      },
      signalsToWatch: payload.signalsToWatch || ['Hiring Surge', 'Expansion'],
      icpName: payload.icpName || 'Default ICP',
      totalMatches: 12,
      newMatchesCount: 2,
      highOpportunityCount: 5,
      activeSignalsCount: 4,
      unreadAlertsCount: 1,
      alertSettings: payload.alertSettings || {
        onNewMatch: true,
        onHighOpportunity: true,
        onHiringSignal: true,
        onExpansionSignal: true,
        onLeadershipSignal: true,
        onFundingSignal: false,
        onTechMigration: false
      },
      matchedCompanies: [
        {
          id: `mc-${Date.now()}`,
          companyName: 'Acme Technologies',
          domain: 'acmetech.com',
          industry: 'Technology & SaaS',
          location: 'Lagos, Nigeria',
          opportunityScore: 94,
          opportunityLevel: 'Very High',
          buyingIntent: 'Very High',
          matchedDate: 'Just now',
          isNewMatch: true,
          signals: ['Hiring Surge (38 roles)', 'Expansion']
        }
      ],
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          type: 'new_match',
          title: 'Initial Scan Completed',
          detail: 'Prospector engine completed scan for your criteria.'
        }
      ]
    };
    localSavedSearches.unshift(newSearch);
    return newSearch;
  }
}

/**
 * Update existing saved search metadata or criteria.
 */
export async function updateSavedSearch(id: string, updates: Partial<SavedSearchItem>): Promise<SavedSearchItem> {
  try {
    const updated = await apiClient.patch<SavedSearchItem>(`/api/saved-searches/${id}`, updates);
    const idx = localSavedSearches.findIndex(s => s.id === id);
    if (idx !== -1) localSavedSearches[idx] = updated;
    return updated;
  } catch (_err) {
    const idx = localSavedSearches.findIndex(s => s.id === id);
    if (idx !== -1) {
      localSavedSearches[idx] = { ...localSavedSearches[idx], ...updates };
      return localSavedSearches[idx];
    }
    throw new Error('Search not found');
  }
}

/**
 * Manually trigger an on-demand scan for new matches.
 */
export async function runSavedSearch(id: string): Promise<SavedSearchItem> {
  try {
    return await apiClient.post<SavedSearchItem>(`/api/saved-searches/${id}/run`);
  } catch (_err) {
    const idx = localSavedSearches.findIndex(s => s.id === id);
    if (idx !== -1) {
      localSavedSearches[idx] = {
        ...localSavedSearches[idx],
        lastRunAt: 'Just now',
        totalMatches: (localSavedSearches[idx].totalMatches || 0) + 1
      };
      return localSavedSearches[idx];
    }
    throw new Error('Search not found');
  }
}

/**
 * Pause background monitoring for a saved search.
 */
export async function pauseSavedSearch(id: string): Promise<SavedSearchItem> {
  try {
    return await apiClient.post<SavedSearchItem>(`/api/saved-searches/${id}/pause`);
  } catch (_err) {
    return updateSavedSearch(id, { monitoringEnabled: false, status: 'paused' });
  }
}

/**
 * Resume background monitoring for a saved search.
 */
export async function resumeSavedSearch(id: string): Promise<SavedSearchItem> {
  try {
    return await apiClient.post<SavedSearchItem>(`/api/saved-searches/${id}/resume`);
  } catch (_err) {
    return updateSavedSearch(id, { monitoringEnabled: true, status: 'active' });
  }
}

/**
 * Delete a saved search by ID.
 */
export async function deleteSavedSearch(id: string): Promise<{ id: string; deleted: boolean }> {
  try {
    return await apiClient.delete<{ id: string; deleted: boolean }>(`/api/saved-searches/${id}`);
  } catch (_err) {
    localSavedSearches = localSavedSearches.filter(s => s.id !== id);
    return { id, deleted: true };
  }
}

/**
 * Fetch matched companies list for a search.
 */
export async function fetchSavedSearchResults(id: string): Promise<MatchedCompanyItem[]> {
  try {
    return await apiClient.get<MatchedCompanyItem[]>(`/api/saved-searches/${id}/results`);
  } catch (_err) {
    const found = localSavedSearches.find(s => s.id === id);
    return found?.matchedCompanies || [];
  }
}

/**
 * Fetch activity audit trail for a search.
 */
export async function fetchSavedSearchActivity(id: string): Promise<SavedSearchActivityItem[]> {
  try {
    return await apiClient.get<SavedSearchActivityItem[]>(`/api/saved-searches/${id}/activity`);
  } catch (_err) {
    const found = localSavedSearches.find(s => s.id === id);
    return found?.activityHistory || [];
  }
}

/**
 * Update alert notification settings and cadence for a search.
 */
export async function updateSavedSearchAlertSettings(
  id: string,
  alertSettings: SavedSearchItem['alertSettings'],
  alertFrequency?: string
): Promise<SavedSearchItem> {
  try {
    return await apiClient.patch<SavedSearchItem>(`/api/saved-searches/${id}/alert-settings`, {
      alertSettings,
      alertFrequency
    });
  } catch (_err) {
    return updateSavedSearch(id, { alertSettings, alertFrequency: alertFrequency as any });
  }
}
