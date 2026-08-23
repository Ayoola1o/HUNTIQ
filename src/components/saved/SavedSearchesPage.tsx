import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { SavedSearchesKpiCards } from './SavedSearchesKpiCards';
import { SavedSearchCard } from './SavedSearchCard';
import { SavedSearchDetailModal } from './SavedSearchDetailModal';
import { CreateSavedSearchModal } from './CreateSavedSearchModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { SavedSearchItem, SavedSearchesKpiSummary } from '../../types/savedSearches';
import { 
  Bookmark, 
  Sparkles, 
  Search, 
  Plus
} from 'lucide-react';

interface SavedSearchesPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const SavedSearchesPage: React.FC<SavedSearchesPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [selectedSearch, setSelectedSearch] = useState<SavedSearchItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'needs_attention' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState('all');

  // Initial Mock Saved Searches Data
  const [searches, setSearches] = useState<SavedSearchItem[]>([
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
  ]);

  const kpiSummary: SavedSearchesKpiSummary = {
    totalSearches: searches.length,
    activeMonitoring: searches.filter(s => s.monitoringEnabled).length,
    newMatches: searches.reduce((acc, curr) => acc + curr.newMatchesCount, 0),
    newSignals: searches.reduce((acc, curr) => acc + curr.activeSignalsCount, 0),
    unreadAlerts: searches.reduce((acc, curr) => acc + curr.unreadAlertsCount, 0)
  };

  const handleToggleMonitoring = (searchId: string) => {
    setSearches(searches.map(s => {
      if (s.id === searchId) {
        return {
          ...s,
          monitoringEnabled: !s.monitoringEnabled,
          status: !s.monitoringEnabled ? 'active' : 'paused',
          lastUpdated: 'Just now'
        };
      }
      return s;
    }));
  };

  const handleRunSearch = (searchId: string) => {
    setSearches(searches.map(s => {
      if (s.id === searchId) {
        return {
          ...s,
          lastRunAt: 'Just now',
          lastUpdated: 'Just now',
          newMatchesCount: s.newMatchesCount + 2
        };
      }
      return s;
    }));
  };

  const handleDeleteSearch = (searchId: string) => {
    setSearches(searches.filter(s => s.id !== searchId));
  };

  const handleCreateSearch = (newSearch: SavedSearchItem) => {
    setSearches([newSearch, ...searches]);
  };

  const filteredSearches = searches.filter(s => {
    if (activeTab === 'active' && !s.monitoringEnabled) return false;
    if (activeTab === 'paused' && s.monitoringEnabled) return false;
    if (activeTab === 'needs_attention' && s.newMatchesCount === 0 && s.unreadAlertsCount === 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.filters.industries.some(i => i.toLowerCase().includes(q)) ||
        s.filters.locations.some(l => l.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f4f6fa',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)'
    }}>
      {/* Sidebar */}
      <DashboardSidebar
        activeNav="saved-searches"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
        paddingBottom: '40px'
      }}>
        {/* Top Header */}
        <header style={{
          height: '62px',
          minHeight: '62px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #dbeafe'
            }}>
              <Bookmark size={16} color="#2563eb" />
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Saved Searches & Monitoring
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Keep your best prospect searches and let HUNTIQ monitor what changes
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsCopilotOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f5f3ff',
                border: '1px solid #ddd6fe',
                color: '#6d28d9',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={13} />
              <span>Ask AI Copilot</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 16px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Plus size={14} />
              <span>+ New Search</span>
            </button>
          </div>
        </header>

        {/* KPI Metrics Row */}
        <div style={{ margin: '20px 0' }}>
          <SavedSearchesKpiCards
            summary={kpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={setActiveKpiFilter}
          />
        </div>

        {/* Filter Bar & Status Tabs */}
        <div style={{
          margin: '0 32px 18px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[
              { id: 'all', label: 'All Searches', count: searches.length },
              { id: 'active', label: 'Active Monitoring', count: searches.filter(s => s.monitoringEnabled).length },
              { id: 'needs_attention', label: 'Needs Attention', count: searches.filter(s => s.newMatchesCount > 0 || s.unreadAlertsCount > 0).length },
              { id: 'paused', label: 'Paused', count: searches.filter(s => !s.monitoringEnabled).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
                  color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                  boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '10.5px',
                  backgroundColor: activeTab === tab.id ? '#eff6ff' : '#eaecf0',
                  color: activeTab === tab.id ? '#2563eb' : '#64748b',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #eaecf0',
            borderRadius: '8px',
            padding: '6px 12px',
            width: '280px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search saved searches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '12px',
                color: '#0f172a',
                width: '100%',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Saved Searches Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: '16px',
          padding: '0 32px'
        }}>
          {filteredSearches.map((search) => (
            <SavedSearchCard
              key={search.id}
              search={search}
              onViewResults={(s) => {
                setSelectedSearch(s);
                setIsDetailModalOpen(true);
              }}
              onToggleMonitoring={handleToggleMonitoring}
              onRunSearch={handleRunSearch}
              onDelete={handleDeleteSearch}
            />
          ))}
        </div>
      </div>

      {/* Detail Results Modal */}
      <SavedSearchDetailModal
        search={selectedSearch}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onToggleMonitoring={handleToggleMonitoring}
        onRunSearch={handleRunSearch}
        onInvestigateCompany={() => {
          setIsDetailModalOpen(false);
          onNavigate('research');
        }}
      />

      {/* Create New Saved Search Modal */}
      <CreateSavedSearchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSearch={handleCreateSearch}
      />

      {/* AI Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInvestigateCompany={() => {
          setIsCopilotOpen(false);
          onNavigate('research');
        }}
      />
    </div>
  );
};
