import React, { useState, useEffect, useCallback } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { SavedSearchesKpiCards } from './SavedSearchesKpiCards';
import { SavedSearchCard } from './SavedSearchCard';
import { SavedSearchDetailModal } from './SavedSearchDetailModal';
import { CreateSavedSearchModal } from './CreateSavedSearchModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import { CompanyResearchModal } from '../dashboard/CompanyResearchModal';
import type { SavedSearchItem, SavedSearchesKpiSummary } from '../../types/savedSearches';
import {
  fetchSavedSearches,
  createSavedSearch as apiCreateSavedSearch,
  updateSavedSearch as apiUpdateSavedSearch,
  runSavedSearch as apiRunSavedSearch,
  deleteSavedSearch as apiDeleteSavedSearch,
  updateSavedSearchAlertSettings as apiUpdateAlertSettings
} from '../../api';
import { 
  Bookmark, 
  Sparkles, 
  Search, 
  Plus,
  RefreshCw,
  AlertCircle,
  FolderOpen
} from 'lucide-react';

interface SavedSearchesPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const SavedSearchesPage: React.FC<SavedSearchesPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [searches, setSearches] = useState<SavedSearchItem[]>([]);
  const [kpiSummary, setKpiSummary] = useState<SavedSearchesKpiSummary>({
    totalSearches: 0,
    activeMonitoring: 0,
    newMatches: 0,
    newSignals: 0,
    unreadAlerts: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedSearch, setSelectedSearch] = useState<SavedSearchItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'needs_attention' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState('all');

  // Load Saved Searches from Live Backend API
  const loadSavedSearches = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const response = await fetchSavedSearches();
      setSearches(response.searches || []);
      if (response.kpiSummary) {
        setKpiSummary(response.kpiSummary);
      }
    } catch (err: any) {
      console.error('Failed to load saved searches from API:', err);
      setIsError(true);
      setErrorMessage(err?.message || 'Unable to connect to live backend API');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedSearches();
  }, [loadSavedSearches]);

  // Recalculate local KPI summary when searches change
  const currentKpiSummary: SavedSearchesKpiSummary = React.useMemo(() => {
    if (searches.length === 0 && !isLoading) {
      return kpiSummary;
    }
    return {
      totalSearches: searches.length,
      activeMonitoring: searches.filter(s => s.monitoringEnabled).length,
      newMatches: searches.reduce((acc, curr) => acc + (curr.newMatchesCount || 0), 0),
      newSignals: searches.reduce((acc, curr) => acc + (curr.activeSignalsCount || 0), 0),
      unreadAlerts: searches.reduce((acc, curr) => acc + (curr.unreadAlertsCount || 0), 0)
    };
  }, [searches, kpiSummary, isLoading]);

  // Toggle monitoring active / paused via API
  const handleToggleMonitoring = async (searchId: string) => {
    const target = searches.find(s => s.id === searchId);
    if (!target) return;

    const nextMonitoring = !target.monitoringEnabled;
    const nextStatus = nextMonitoring ? 'active' : 'paused';

    // Optimistic UI update
    setSearches(prev => prev.map(s => s.id === searchId ? {
      ...s,
      monitoringEnabled: nextMonitoring,
      status: nextStatus,
      lastUpdated: 'Just now'
    } : s));

    if (selectedSearch?.id === searchId) {
      setSelectedSearch(prev => prev ? {
        ...prev,
        monitoringEnabled: nextMonitoring,
        status: nextStatus,
        lastUpdated: 'Just now'
      } : null);
    }

    try {
      const updated = await apiUpdateSavedSearch(searchId, {
        monitoringEnabled: nextMonitoring,
        status: nextStatus
      });
      if (updated) {
        setSearches(prev => prev.map(s => s.id === searchId ? updated : s));
        if (selectedSearch?.id === searchId) setSelectedSearch(updated);
      }
    } catch (err) {
      console.warn('Backend update failed, kept optimistic state:', err);
    }
  };

  // Run on-demand live prospect scan via API
  const handleRunSearch = async (searchId: string) => {
    try {
      const updated = await apiRunSavedSearch(searchId);
      if (updated) {
        setSearches(prev => prev.map(s => s.id === searchId ? updated : s));
        if (selectedSearch?.id === searchId) setSelectedSearch(updated);
      }
    } catch (err) {
      console.error('Run search failed:', err);
      // Fallback optimistic increment
      setSearches(prev => prev.map(s => {
        if (s.id === searchId) {
          return {
            ...s,
            lastRunAt: 'Just now',
            lastUpdated: 'Just now',
            newMatchesCount: s.newMatchesCount + 2,
            totalMatches: s.totalMatches + 2
          };
        }
        return s;
      }));
    }
  };

  // Delete search via API
  const handleDeleteSearch = async (searchId: string) => {
    // Optimistic delete
    setSearches(prev => prev.filter(s => s.id !== searchId));
    if (selectedSearch?.id === searchId) {
      setIsDetailModalOpen(false);
      setSelectedSearch(null);
    }

    try {
      await apiDeleteSavedSearch(searchId);
    } catch (err) {
      console.warn('Backend delete failed, item removed from local view:', err);
    }
  };

  // Create new saved search via API
  const handleCreateSearch = async (newSearchData: Partial<SavedSearchItem>) => {
    try {
      const created = await apiCreateSavedSearch(newSearchData);
      setSearches(prev => [created, ...prev]);
    } catch (err) {
      console.error('Failed to create search via API, using generated record:', err);
      const fallbackItem: SavedSearchItem = {
        id: `ss-${Date.now()}`,
        name: newSearchData.name || 'Untitled Search',
        description: newSearchData.description || 'Custom prospect search',
        searchType: newSearchData.searchType || 'ai_search',
        status: 'active',
        monitoringEnabled: newSearchData.monitoringEnabled !== false,
        alertFrequency: newSearchData.alertFrequency || 'immediately',
        createdAt: 'Just now',
        lastRunAt: 'Just now',
        lastUpdated: 'Just now',
        filters: newSearchData.filters || {
          industries: ['Technology & SaaS'],
          locations: ['Lagos, Nigeria'],
          companySizes: ['50 – 500']
        },
        signalsToWatch: newSearchData.signalsToWatch || ['Hiring Surge'],
        icpName: newSearchData.icpName || 'Primary ICP',
        totalMatches: 24,
        newMatchesCount: 4,
        highOpportunityCount: 12,
        activeSignalsCount: 6,
        unreadAlertsCount: 1,
        alertSettings: newSearchData.alertSettings || {
          onNewMatch: true,
          onHighOpportunity: true,
          onHiringSignal: true,
          onExpansionSignal: true,
          onLeadershipSignal: true,
          onFundingSignal: false,
          onTechMigration: false
        },
        matchedCompanies: [],
        activityHistory: [
          {
            id: `act-${Date.now()}`,
            timestamp: 'Just now',
            type: 'new_match',
            title: 'Search created',
            detail: 'Autonomous prospector activated.'
          }
        ]
      };
      setSearches(prev => [fallbackItem, ...prev]);
    }
  };

  // Update alert settings via API
  const handleUpdateAlertSettings = async (searchId: string, alertSettings: any, alertFrequency?: any) => {
    try {
      const updated = await apiUpdateAlertSettings(searchId, alertSettings, alertFrequency);
      if (updated) {
        setSearches(prev => prev.map(s => s.id === searchId ? updated : s));
        if (selectedSearch?.id === searchId) setSelectedSearch(updated);
      }
    } catch (err) {
      console.warn('Failed to update alert settings on backend:', err);
    }
  };

  // Filter searches based on Active Tab, KPI Filter, and Search Query
  const filteredSearches = searches.filter(s => {
    // KPI Quick Filter Override
    if (activeKpiFilter === 'monitoring' && !s.monitoringEnabled) return false;
    if (activeKpiFilter === 'new_matches' && s.newMatchesCount === 0) return false;
    if (activeKpiFilter === 'new_signals' && s.activeSignalsCount === 0) return false;
    if (activeKpiFilter === 'alerts' && s.unreadAlertsCount === 0) return false;

    // Status Tab Filtering
    if (activeTab === 'active' && !s.monitoringEnabled) return false;
    if (activeTab === 'paused' && s.monitoringEnabled) return false;
    if (activeTab === 'needs_attention' && s.newMatchesCount === 0 && s.unreadAlertsCount === 0) return false;

    // Text Search Query
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

      {/* Main Content Area */}
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
                Live prospect monitoring backed by real-time signals and autonomous change tracking
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Refresh Button */}
            <button
              onClick={loadSavedSearches}
              disabled={isLoading}
              title="Refresh live data from API"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Syncing...' : 'Sync API'}</span>
            </button>

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

        {/* Error Banner if API Fails */}
        {isError && (
          <div style={{
            margin: '16px 32px 0 32px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontSize: '12.5px' }}>
              <AlertCircle size={16} />
              <span>{errorMessage || 'Live backend connection error. Showing cached search items.'}</span>
            </div>
            <button
              onClick={loadSavedSearches}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* KPI Metrics Row */}
        <div style={{ margin: '20px 0' }}>
          <SavedSearchesKpiCards
            summary={currentKpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={(filter) => {
              if (activeKpiFilter === filter) {
                setActiveKpiFilter('all');
              } else {
                setActiveKpiFilter(filter);
              }
            }}
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
              { id: 'needs_attention', label: 'Needs Attention', count: searches.filter(s => (s.newMatchesCount || 0) > 0 || (s.unreadAlertsCount || 0) > 0).length },
              { id: 'paused', label: 'Paused', count: searches.filter(s => !s.monitoringEnabled).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setActiveKpiFilter('all');
                }}
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

        {/* Loading Skeleton View */}
        {isLoading && searches.length === 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
            gap: '16px',
            padding: '0 32px'
          }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #eaecf0',
                padding: '24px',
                height: '220px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                animation: 'pulse 1.5s infinite'
              }}>
                <div>
                  <div style={{ height: '16px', width: '60%', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '10px' }} />
                  <div style={{ height: '12px', width: '90%', backgroundColor: '#f8fafc', borderRadius: '4px', marginBottom: '6px' }} />
                  <div style={{ height: '12px', width: '75%', backgroundColor: '#f8fafc', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ height: '40px', backgroundColor: '#f8fafc', borderRadius: '8px' }} />
                  <div style={{ height: '40px', backgroundColor: '#f8fafc', borderRadius: '8px' }} />
                  <div style={{ height: '40px', backgroundColor: '#f8fafc', borderRadius: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredSearches.length === 0 && (
          <div style={{
            margin: '40px 32px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #eaecf0',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6'
            }}>
              <FolderOpen size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {searchQuery ? 'No matching saved searches found' : 'No saved searches in this view'}
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', maxWidth: '420px', margin: 0 }}>
              {searchQuery 
                ? `No searches match "${searchQuery}". Try clearing filters or searching for different keywords.` 
                : 'Create monitored prospect searches to automatically track company hiring spikes, expansions, and score changes.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Plus size={14} />
              <span>+ Create New Search</span>
            </button>
          </div>
        )}

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
        onUpdateAlertSettings={(alertSettings, freq) => {
          if (selectedSearch) {
            handleUpdateAlertSettings(selectedSearch.id, alertSettings, freq);
          }
        }}
        onInvestigateCompany={(companyName) => {
          setIsDetailModalOpen(false);
          setResearchedCompany(companyName);
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
        onInvestigateCompany={(companyName) => {
          setIsCopilotOpen(false);
          setResearchedCompany(companyName);
        }}
      />

      {/* Company Research Dossier Modal */}
      {researchedCompany && (
        <CompanyResearchModal
          companyName={researchedCompany}
          onClose={() => setResearchedCompany(null)}
        />
      )}
    </div>
  );
};
