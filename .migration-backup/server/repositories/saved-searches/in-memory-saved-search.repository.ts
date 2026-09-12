import type { SavedSearchItem } from '../../../src/types/savedSearches';
import type { SavedSearchRepository, SavedSearchFilterOptions } from './saved-search-repository';

export class InMemorySavedSearchRepository implements SavedSearchRepository {
  private static searchesByWorkspace = new Map<string, SavedSearchItem[]>();

  constructor() {
    const defaultWs = 'ws-default-001';
    if (!InMemorySavedSearchRepository.searchesByWorkspace.has(defaultWs)) {
      InMemorySavedSearchRepository.searchesByWorkspace.set(defaultWs, [
        {
          id: 'ss-1',
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
          signalsToWatch: ['Hiring Surge', 'Regional Expansion'],
          icpName: 'Growth Scaleup ICP',
          totalMatches: 184,
          newMatchesCount: 12,
          highOpportunityCount: 68,
          activeSignalsCount: 24,
          unreadAlertsCount: 3,
          alertSettings: {
            emailNotifications: true,
            inAppAlerts: true,
            slackWebhook: false,
            scoreThreshold: 80
          },
          matchedCompanies: [],
          recentActivity: []
        }
      ]);
    }
  }

  public async list(workspaceId: string, filter?: SavedSearchFilterOptions): Promise<SavedSearchItem[]> {
    const list = InMemorySavedSearchRepository.searchesByWorkspace.get(workspaceId) || [];
    let filtered = [...list];

    if (filter?.status && filter.status !== 'all') {
      filtered = filtered.filter(s => s.status === filter.status);
    }
    if (filter?.searchType && filter.searchType !== 'all') {
      filtered = filtered.filter(s => s.searchType === filter.searchType);
    }
    if (filter?.monitoring !== undefined) {
      filtered = filtered.filter(s => s.monitoringEnabled === filter.monitoring);
    }
    if (filter?.query?.trim()) {
      const q = filter.query.toLowerCase().trim();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.icpName.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  public async getById(id: string, workspaceId: string): Promise<SavedSearchItem | undefined> {
    const list = InMemorySavedSearchRepository.searchesByWorkspace.get(workspaceId) || [];
    return list.find(s => s.id === id);
  }

  public async create(search: Partial<SavedSearchItem>, workspaceId: string, _userId?: string): Promise<SavedSearchItem> {
    const newItem: SavedSearchItem = {
      id: search.id || `ss-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: search.name || 'Untitled Search',
      description: search.description || '',
      searchType: search.searchType || 'advanced_search',
      status: search.status || 'active',
      monitoringEnabled: search.monitoringEnabled ?? true,
      alertFrequency: search.alertFrequency || 'daily',
      createdAt: 'Just now',
      lastRunAt: 'Just now',
      lastUpdated: 'Just now',
      filters: search.filters || { industries: [], locations: [], companySizes: [] },
      signalsToWatch: search.signalsToWatch || [],
      icpName: search.icpName || 'Custom ICP',
      totalMatches: search.totalMatches || 0,
      newMatchesCount: search.newMatchesCount || 0,
      highOpportunityCount: search.highOpportunityCount || 0,
      activeSignalsCount: search.activeSignalsCount || 0,
      unreadAlertsCount: 0,
      alertSettings: search.alertSettings || { emailNotifications: true, inAppAlerts: true, slackWebhook: false, scoreThreshold: 75 },
      matchedCompanies: search.matchedCompanies || [],
      recentActivity: search.recentActivity || []
    };

    const current = InMemorySavedSearchRepository.searchesByWorkspace.get(workspaceId) || [];
    current.unshift(newItem);
    InMemorySavedSearchRepository.searchesByWorkspace.set(workspaceId, current);

    return newItem;
  }

  public async update(id: string, partial: Partial<SavedSearchItem>, workspaceId: string): Promise<SavedSearchItem | undefined> {
    const list = InMemorySavedSearchRepository.searchesByWorkspace.get(workspaceId) || [];
    const index = list.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...list[index],
      ...partial,
      lastUpdated: 'Just now'
    };
    list[index] = updated;
    return updated;
  }

  public async delete(id: string, workspaceId: string): Promise<boolean> {
    const list = InMemorySavedSearchRepository.searchesByWorkspace.get(workspaceId) || [];
    const filtered = list.filter(s => s.id !== id);
    if (filtered.length === list.length) return false;

    InMemorySavedSearchRepository.searchesByWorkspace.set(workspaceId, filtered);
    return true;
  }
}
