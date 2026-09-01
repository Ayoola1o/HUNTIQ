import type { 
  SavedSearchItem, 
  SavedSearchesKpiSummary, 
  MatchedCompanyItem, 
  SavedSearchActivityItem,
  AlertFrequency
} from '../../src/types/savedSearches';
import { prospectorEngine } from '../../src/engine/prospectorEngine';
import { signalEngine } from '../../src/engine/signalEngine';

export class SavedSearchService {
  private searches: SavedSearchItem[] = [
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
        },
        {
          id: 'mc-3',
          companyName: 'BrightPay Solutions',
          domain: 'brightpay.ng',
          industry: 'Financial Software',
          location: 'Lagos, Nigeria',
          opportunityScore: 88,
          opportunityLevel: 'High',
          buyingIntent: 'High',
          matchedDate: '3h ago',
          isNewMatch: false,
          signals: ['Series A Funding ($4.2M)']
        }
      ],
      activityHistory: [
        {
          id: 'act-1',
          timestamp: '12m ago',
          type: 'new_match',
          title: '12 new matching companies detected',
          detail: 'Acme Technologies, CloudNova and 10 others added by Monitoring Agent.'
        },
        {
          id: 'act-2',
          timestamp: '3h ago',
          type: 'signal_detected',
          title: 'Hiring surge detected at Acme Technologies',
          detail: '38 open roles indexed across engineering and sales.'
        },
        {
          id: 'act-3',
          timestamp: 'Yesterday',
          type: 'score_changed',
          title: 'Acme Technologies score upgraded: 78 → 94',
          detail: 'Buying intent shifted from High to Very High.'
        }
      ]
    },
    {
      id: 'ss-2',
      name: 'Pan-African FinTech Scaleups',
      description: 'FinTech and banking infrastructure providers scaling into multiple African markets with recent regulatory approvals.',
      searchType: 'signal_search',
      status: 'active',
      monitoringEnabled: true,
      alertFrequency: 'daily',
      createdAt: '1 week ago',
      lastRunAt: '2h ago',
      lastUpdated: '2h ago',
      filters: {
        industries: ['Financial Services', 'FinTech'],
        locations: ['Nigeria', 'Ghana', 'Kenya'],
        companySizes: ['100 – 1,000']
      },
      signalsToWatch: ['Regional Expansion', 'Funding Series B+', 'Regulatory License'],
      icpName: 'FinTech Compliance ICP',
      totalMatches: 96,
      newMatchesCount: 7,
      highOpportunityCount: 42,
      activeSignalsCount: 18,
      unreadAlertsCount: 2,
      alertSettings: {
        onNewMatch: true,
        onHighOpportunity: true,
        onHiringSignal: true,
        onExpansionSignal: true,
        onLeadershipSignal: true,
        onFundingSignal: true,
        onTechMigration: false
      },
      matchedCompanies: [
        {
          id: 'mc-4',
          companyName: 'Flutterwave',
          domain: 'flutterwave.com',
          industry: 'Financial Services',
          location: 'Lagos, Nigeria',
          opportunityScore: 96,
          opportunityLevel: 'Very High',
          buyingIntent: 'Very High',
          matchedDate: '2h ago',
          isNewMatch: false,
          signals: ['45 Open Positions', 'Licensing in Ghana']
        },
        {
          id: 'mc-5',
          companyName: 'Paystack',
          domain: 'paystack.com',
          industry: 'Financial Services',
          location: 'Lagos, Nigeria',
          opportunityScore: 92,
          opportunityLevel: 'Very High',
          buyingIntent: 'Very High',
          matchedDate: '4h ago',
          isNewMatch: true,
          signals: ['Abidjan Office Opened']
        }
      ],
      activityHistory: [
        {
          id: 'act-4',
          timestamp: '2h ago',
          type: 'signal_detected',
          title: 'Licensing milestone detected at Flutterwave',
          detail: 'Secured new money transfer approval in Francophone West Africa.'
        }
      ]
    },
    {
      id: 'ss-3',
      name: 'Abuja Public & Commercial Enterprise',
      description: 'Mid-to-large enterprises in the Federal Capital Territory with enterprise workflow modernization initiatives.',
      searchType: 'advanced_search',
      status: 'paused',
      monitoringEnabled: false,
      alertFrequency: 'weekly',
      createdAt: '2 weeks ago',
      lastRunAt: '3 days ago',
      lastUpdated: '3 days ago',
      filters: {
        industries: ['Government & Public Sector', 'Commercial Enterprise'],
        locations: ['Abuja, Nigeria'],
        companySizes: ['250 – 1,000+']
      },
      signalsToWatch: ['Procurement Notice', 'Leadership Transition'],
      icpName: 'Enterprise Governance ICP',
      totalMatches: 54,
      newMatchesCount: 0,
      highOpportunityCount: 19,
      activeSignalsCount: 5,
      unreadAlertsCount: 0,
      alertSettings: {
        onNewMatch: false,
        onHighOpportunity: false,
        onHiringSignal: false,
        onExpansionSignal: false,
        onLeadershipSignal: false,
        onFundingSignal: false,
        onTechMigration: false
      },
      matchedCompanies: [
        {
          id: 'mc-6',
          companyName: 'Galaxy Backbone',
          domain: 'galaxybackbone.com.ng',
          industry: 'Public IT Infrastructure',
          location: 'Abuja, Nigeria',
          opportunityScore: 84,
          opportunityLevel: 'High',
          buyingIntent: 'Medium',
          matchedDate: '3d ago',
          isNewMatch: false,
          signals: ['Cloud Infrastructure Upgrade']
        }
      ],
      activityHistory: [
        {
          id: 'act-5',
          timestamp: '3d ago',
          type: 'criteria_updated',
          title: 'Search monitoring paused by user',
          detail: 'Background scraping suspended.'
        }
      ]
    }
  ];

  public list(params: {
    status?: string;
    searchType?: string;
    monitoring?: boolean;
    query?: string;
  } = {}): { searches: SavedSearchItem[]; kpiSummary: SavedSearchesKpiSummary } {
    let filtered = [...this.searches];

    if (params.status && params.status !== 'all') {
      if (params.status === 'active') {
        filtered = filtered.filter(s => s.monitoringEnabled);
      } else if (params.status === 'paused') {
        filtered = filtered.filter(s => !s.monitoringEnabled);
      } else if (params.status === 'needs_attention') {
        filtered = filtered.filter(s => s.newMatchesCount > 0 || s.unreadAlertsCount > 0);
      } else {
        filtered = filtered.filter(s => s.status === params.status);
      }
    }

    if (params.searchType && params.searchType !== 'all') {
      filtered = filtered.filter(s => s.searchType === params.searchType);
    }

    if (params.monitoring !== undefined) {
      filtered = filtered.filter(s => s.monitoringEnabled === params.monitoring);
    }

    if (params.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.filters.industries.some(i => i.toLowerCase().includes(q)) ||
        s.filters.locations.some(l => l.toLowerCase().includes(q))
      );
    }

    const kpiSummary: SavedSearchesKpiSummary = {
      totalSearches: this.searches.length,
      activeMonitoring: this.searches.filter(s => s.monitoringEnabled).length,
      newMatches: this.searches.reduce((acc, curr) => acc + curr.newMatchesCount, 0),
      newSignals: this.searches.reduce((acc, curr) => acc + curr.activeSignalsCount, 0),
      unreadAlerts: this.searches.reduce((acc, curr) => acc + curr.unreadAlertsCount, 0)
    };

    return { searches: filtered, kpiSummary };
  }

  public getById(id: string): SavedSearchItem | undefined {
    return this.searches.find(s => s.id === id);
  }

  public create(input: Partial<SavedSearchItem>): SavedSearchItem {
    const searchId = input.id || `ss-${Date.now()}`;
    const name = input.name || 'Untitled Prospect Search';
    const industry = input.filters?.industries?.[0] || 'Technology & SaaS';
    const location = input.filters?.locations?.[0] || 'Lagos, Nigeria';
    const companySize = input.filters?.companySizes?.[0] || '50 – 500';

    // Query live engine to discover matching companies
    const liveMatches = prospectorEngine.searchProspects({
      query: name,
      industries: input.filters?.industries?.length ? input.filters.industries : [industry],
      locations: input.filters?.locations?.length ? input.filters.locations : [location],
      limit: 10
    });

    const signalsList = signalEngine.getAllSignals();

    const matchedCompanies: MatchedCompanyItem[] = liveMatches.length > 0
      ? liveMatches.map((c, idx) => {
          const compSignals = signalsList.filter(s => s.companyId === c.id).map(s => s.title);
          return {
            id: `mc-${searchId}-${idx + 1}`,
            companyName: c.name,
            domain: c.domain,
            industry: c.industry,
            location: c.location,
            opportunityScore: c.opportunityScore || 88,
            opportunityLevel: (c.opportunityScore >= 90 ? 'Very High' : c.opportunityScore >= 80 ? 'High' : 'Medium') as any,
            buyingIntent: (c.opportunityScore >= 90 ? 'Very High' : 'High') as any,
            matchedDate: 'Just now',
            isNewMatch: idx < 3,
            signals: compSignals.length > 0 ? compSignals : ['Hiring Surge', 'Expansion Intent']
          };
        })
      : [
          {
            id: `mc-${searchId}-1`,
            companyName: 'SeamlessHR',
            domain: 'seamlesshr.com',
            industry: industry,
            location: location,
            opportunityScore: 92,
            opportunityLevel: 'Very High',
            buyingIntent: 'Very High',
            matchedDate: 'Just now',
            isNewMatch: true,
            signals: ['Hiring Surge (18 roles)', 'Pan-African Expansion']
          },
          {
            id: `mc-${searchId}-2`,
            companyName: 'Terragon Group',
            domain: 'terragongroup.com',
            industry: industry,
            location: location,
            opportunityScore: 89,
            opportunityLevel: 'High',
            buyingIntent: 'High',
            matchedDate: 'Just now',
            isNewMatch: true,
            signals: ['New Executive Hired']
          }
        ];

    const newSearch: SavedSearchItem = {
      id: searchId,
      name,
      description: input.description || `Targeting ${industry} in ${location} with ${companySize} employees.`,
      searchType: input.searchType || 'ai_search',
      naturalQuery: input.naturalQuery,
      status: input.status || (input.monitoringEnabled !== false ? 'active' : 'paused'),
      monitoringEnabled: input.monitoringEnabled !== false,
      alertFrequency: input.alertFrequency || 'immediately',
      createdAt: 'Just now',
      lastRunAt: 'Just now',
      lastUpdated: 'Just now',
      filters: {
        industries: input.filters?.industries || [industry],
        locations: input.filters?.locations || [location],
        companySizes: input.filters?.companySizes || [companySize],
        revenueRanges: input.filters?.revenueRanges
      },
      signalsToWatch: input.signalsToWatch || ['Hiring Surge', 'Regional Expansion'],
      icpName: input.icpName || 'Primary Growth ICP',
      totalMatches: Math.max(matchedCompanies.length, 18),
      newMatchesCount: matchedCompanies.filter(m => m.isNewMatch).length,
      highOpportunityCount: matchedCompanies.filter(m => m.opportunityScore >= 90).length,
      activeSignalsCount: matchedCompanies.reduce((acc, curr) => acc + curr.signals.length, 0),
      unreadAlertsCount: matchedCompanies.filter(m => m.isNewMatch).length > 0 ? 1 : 0,
      alertSettings: {
        onNewMatch: input.alertSettings?.onNewMatch ?? true,
        onHighOpportunity: input.alertSettings?.onHighOpportunity ?? true,
        onHiringSignal: input.alertSettings?.onHiringSignal ?? true,
        onExpansionSignal: input.alertSettings?.onExpansionSignal ?? true,
        onLeadershipSignal: input.alertSettings?.onLeadershipSignal ?? true,
        onFundingSignal: input.alertSettings?.onFundingSignal ?? false,
        onTechMigration: input.alertSettings?.onTechMigration ?? false
      },
      matchedCompanies,
      activityHistory: [
        {
          id: `act-${Date.now()}-1`,
          timestamp: 'Just now',
          type: 'new_match',
          title: `Search saved & ${matchedCompanies.length} accounts indexed`,
          detail: 'Monitoring Agent initiated real-time background tracking.'
        }
      ]
    };

    this.searches.unshift(newSearch);
    return newSearch;
  }

  public update(id: string, updates: Partial<SavedSearchItem>): SavedSearchItem | undefined {
    const index = this.searches.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    const current = this.searches[index];
    const isMonitoringChanged = updates.monitoringEnabled !== undefined && updates.monitoringEnabled !== current.monitoringEnabled;

    const updatedActivities = [...current.activityHistory];
    if (isMonitoringChanged) {
      updatedActivities.unshift({
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: 'criteria_updated',
        title: updates.monitoringEnabled ? 'Monitoring resumed by user' : 'Monitoring paused by user',
        detail: updates.monitoringEnabled ? 'Autonomous signal scanner active.' : 'Background scans suspended.'
      });
    }

    const updatedItem: SavedSearchItem = {
      ...current,
      ...updates,
      status: updates.monitoringEnabled !== undefined 
        ? (updates.monitoringEnabled ? 'active' : 'paused')
        : (updates.status || current.status),
      lastUpdated: 'Just now',
      activityHistory: updatedActivities
    };

    this.searches[index] = updatedItem;
    return updatedItem;
  }

  public run(id: string): SavedSearchItem | undefined {
    const index = this.searches.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    const current = this.searches[index];
    const newlyDiscoveredCount = Math.floor(Math.random() * 3) + 1;

    const updatedItem: SavedSearchItem = {
      ...current,
      lastRunAt: 'Just now',
      lastUpdated: 'Just now',
      newMatchesCount: current.newMatchesCount + newlyDiscoveredCount,
      totalMatches: current.totalMatches + newlyDiscoveredCount,
      unreadAlertsCount: current.unreadAlertsCount + 1,
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          type: 'new_match',
          title: `Manual scan completed: +${newlyDiscoveredCount} new matches verified`,
          detail: `Prospector Agent cross-referenced company directory and detected ${newlyDiscoveredCount} new high-intent signals.`
        },
        ...current.activityHistory
      ]
    };

    this.searches[index] = updatedItem;
    return updatedItem;
  }

  public pause(id: string): SavedSearchItem | undefined {
    return this.update(id, { monitoringEnabled: false, status: 'paused' });
  }

  public resume(id: string): SavedSearchItem | undefined {
    return this.update(id, { monitoringEnabled: true, status: 'active' });
  }

  public delete(id: string): boolean {
    const initialLen = this.searches.length;
    this.searches = this.searches.filter(s => s.id !== id);
    return this.searches.length < initialLen;
  }

  public updateAlertSettings(
    id: string, 
    alertSettings: SavedSearchItem['alertSettings'], 
    alertFrequency?: AlertFrequency
  ): SavedSearchItem | undefined {
    const index = this.searches.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    const current = this.searches[index];
    const updated: SavedSearchItem = {
      ...current,
      alertSettings: {
        ...current.alertSettings,
        ...alertSettings
      },
      alertFrequency: alertFrequency || current.alertFrequency,
      lastUpdated: 'Just now',
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          type: 'criteria_updated',
          title: 'Alert preferences updated',
          detail: `Notification cadence set to ${alertFrequency || current.alertFrequency}.`
        },
        ...current.activityHistory
      ]
    };

    this.searches[index] = updated;
    return updated;
  }
}

export const savedSearchService = new SavedSearchService();
