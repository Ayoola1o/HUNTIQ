import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { OpportunitiesKpiCards } from './OpportunitiesKpiCards';
import { OpportunityTable } from './OpportunityTable';
import { OpportunityDrawer } from './OpportunityDrawer';
import { OpportunityAnalytics } from './OpportunityAnalytics';
import { NewOpportunityModal } from './NewOpportunityModal';
import { ScoreBreakdownModal } from './ScoreBreakdownModal';
import { OpportunityFiltersModal } from './OpportunityFiltersModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import { CompanyResearchModal } from '../dashboard/CompanyResearchModal';
import type { OpportunityItem, OpportunityStage } from '../../types/opportunity';
import { 
  Star, 
  Search, 
  Sparkles, 
  Bell, 
  Calendar, 
  SlidersHorizontal,
  RefreshCw,
  Zap
} from 'lucide-react';

import { useHuntiq } from '../../context/HuntiqContext';
import { autoQualifyLeads } from '../../api';
import { MobileBottomNav } from '../navigation/MobileBottomNav';

interface OpportunitiesPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const { opportunities: dynamicOpportunities, signals, isLiveBackend, isDataLoading, dataLoadError, refreshData, addDealToPipeline } = useHuntiq();
  const [activeTab, setActiveTab] = useState('all');
  const [activeKpiFilter, setActiveKpiFilter] = useState('all');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [syncToastIsError, setSyncToastIsError] = useState(false);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [inspectingScoreOpp, setInspectingScoreOpp] = useState<OpportunityItem | null>(null);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);

  // Search & Filter & UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [isStarred, setIsStarred] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{
    minScore: number;
    selectedIndustries: string[];
    selectedLocations: string[];
    selectedSignals: string[];
  } | null>(null);

  // Live dataset from Huntiq engine
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(() => dynamicOpportunities || []);

  const handleApplyFilters = (filters: {
    minScore: number;
    selectedIndustries: string[];
    selectedLocations: string[];
    selectedSignals: string[];
  }) => {
    setAppliedFilters(filters);
    setSyncToast(`Filters applied: Min Score ${filters.minScore} | ${filters.selectedIndustries.length} industries | ${filters.selectedLocations.length} regions`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Reactively synchronize whenever live backend data refreshes
  React.useEffect(() => {
    if (dynamicOpportunities) {
      setOpportunities(dynamicOpportunities);
      if (dynamicOpportunities.length === 0) {
        setSelectedOpportunityId(null);
      } else if (!selectedOpportunityId || !dynamicOpportunities.some((o) => o.id === selectedOpportunityId)) {
        setSelectedOpportunityId(dynamicOpportunities[0].id);
      }
    }
  }, [dynamicOpportunities]);

  const handleQuickLiveSync = async () => {
    setIsSyncing(true);
    setSyncToastIsError(false);
    try {
      // Run auto qualification across all workspace companies
      await autoQualifyLeads();
      // Reload fresh data into state
      await refreshData();
      setSyncToast('Live data refreshed. Opportunities rescored from workspace data.');
      setTimeout(() => setSyncToast(null), 4000);
    } catch (_err) {
      setSyncToastIsError(true);
      setSyncToast('Refresh failed. Backend may be unavailable.');
      setTimeout(() => setSyncToast(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const selectedOpp = opportunities.find((o) => o.id === selectedOpportunityId) || opportunities[0];

  /**
   * handleAddOpportunity
   * Routes new opportunity creation through the backend pipeline endpoint.
   * The backend is authoritative for record identity and persistence.
   * On failure: the deal is rolled back by addDealToPipeline's internal rollback logic.
   */
  const handleAddOpportunity = async (newOppData: Partial<OpportunityItem>) => {
    setSyncToastIsError(false);
    try {
      await addDealToPipeline({
        companyName: newOppData.companyName || 'New Target Account',
        domain: newOppData.website,
        dealTitle: newOppData.companyName
          ? `${newOppData.companyName} - New Opportunity`
          : 'New Strategic Opportunity',
        dealValue: newOppData.estimatedValue || 0,
        probability: newOppData.score ? Math.min(90, Math.round(newOppData.score * 0.9)) : 50,
        opportunityScore: newOppData.score,
        stage: 'contacted',
        contactRole: newOppData.bestNextStep?.targetRole || 'Executive',
        nextAction: newOppData.bestNextStep?.actionText || 'Initial outreach',
        priority: (newOppData.priority === 'Medium' || newOppData.priority === 'Low')
          ? newOppData.priority
          : 'High',
      });
      setSyncToast('Opportunity added to your CRM pipeline.');
      setTimeout(() => setSyncToast(null), 4000);
      setIsNewModalOpen(false);
    } catch (err: any) {
      setSyncToastIsError(true);
      setSyncToast(`Failed to create opportunity: ${err?.message || 'Backend error'}`);
      setTimeout(() => setSyncToast(null), 5000);
    }
  };

  /**
   * handleStageChange
   * Opportunity stage is currently a derived/computed view from company+signal data.
   * The opportunity concept does not yet have a dedicated backend persistence endpoint.
   * Stage changes are not persisted — this is displayed honestly to the user.
   *
   * TRACK-OPP-STAGE-01: Implement a dedicated backend opportunity stage endpoint
   * and wire it here when the backend contract is established.
   */
  const handleStageChange = (_id: string, _newStage: OpportunityStage) => {
    // Not yet implemented: opportunity stage changes are not persisted to the backend.
    // Silently ignoring would hide a missing feature — instead we show an error toast.
    setSyncToastIsError(true);
    setSyncToast('Stage changes are not yet persisted. This will be available in a future update.');
    setTimeout(() => setSyncToast(null), 4000);
  };

  // Filter opportunities based on search query, active tab, and modal filters
  const filteredOpportunities = opportunities.filter((opp) => {
    // Date Range Filter
    if (dateRange !== 'All Time') {
      const now = Date.now();
      const idMatch = opp.id.match(/^opp-(\d+)$/);
      if (idMatch) {
        const oppTime = Number(idMatch[1]);
        if (!isNaN(oppTime)) {
          if (dateRange === 'Today' && oppTime < now - 24 * 3600 * 1000) return false;
          if (dateRange === 'Last 7 Days' && oppTime < now - 7 * 86400 * 1000) return false;
          if (dateRange === 'Last 30 Days' && oppTime < now - 30 * 86400 * 1000) return false;
          if (dateRange === 'This Quarter' && oppTime < now - 90 * 86400 * 1000) return false;
        }
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        opp.companyName.toLowerCase().includes(q) ||
        opp.industry.toLowerCase().includes(q) ||
        opp.location.toLowerCase().includes(q) ||
        opp.whyNow.toLowerCase().includes(q) ||
        (opp.tags && opp.tags.some((t) => t.toLowerCase().includes(q)));
      if (!matchesSearch) return false;
    }

    // Active tab filter
    if (activeTab === 'hot' && opp.priority !== 'Hot') return false;
    if (activeTab === 'high' && opp.priority !== 'High') return false;
    if (activeTab === 'medium' && opp.priority !== 'Medium') return false;
    if (activeTab === 'low' && opp.priority !== 'Low') return false;
    if (activeTab === 'won' && opp.stage !== 'Closed Won') return false;
    if (activeTab === 'lost' && opp.stage !== 'Closed Lost') return false;

    // Applied modal filters
    if (appliedFilters) {
      if (opp.score < appliedFilters.minScore) return false;
      if (
        appliedFilters.selectedIndustries.length > 0 &&
        !appliedFilters.selectedIndustries.some((ind) =>
          opp.industry.toLowerCase().includes(ind.toLowerCase())
        )
      ) {
        return false;
      }
      if (
        appliedFilters.selectedLocations.length > 0 &&
        !appliedFilters.selectedLocations.some((loc) =>
          opp.location.toLowerCase().includes(loc.toLowerCase())
        )
      ) {
        return false;
      }
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
      {/* Left Global Navigation Sidebar */}
      <DashboardSidebar
        activeNav="opportunities"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Opportunities Center Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Top Header */}
        <header 
          className="mobile-header-pad"
          style={{
            padding: '16px 32px 14px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #eaecf0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            flexShrink: 0
          }}
        >
          {/* Title, Star, and Live Status Badge */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontSize: 'clamp(18px, 4vw, 22px)',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                Opportunities
              </h1>
              <button
                onClick={() => setIsStarred(!isStarred)}
                title={isStarred ? 'Unfavorite view' : 'Favorite view'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isStarred ? '#f59e0b' : '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Star size={16} fill={isStarred ? '#f59e0b' : 'none'} />
              </button>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: isLiveBackend ? '#ecfdf5' : '#f8fafc',
                border: `1px solid ${isLiveBackend ? '#a7f3d0' : '#e2e8f0'}`,
                fontSize: '11px',
                fontWeight: 600,
                color: isLiveBackend ? '#059669' : '#64748b'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isLiveBackend ? '#10b981' : '#94a3b8'
                }} />
                {isLiveBackend ? 'Live Data Feed' : 'Intelligence Engine'}
              </div>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
              Discover, evaluate and prioritize high-intent opportunities powered by live hiring telemetry.
            </p>
          </div>

          {/* Search, Live Sync, Copilot CTA, Date & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Quick Live ATS Sync Button */}
            <button
              onClick={handleQuickLiveSync}
              disabled={isSyncing || isDataLoading}
              title="Trigger live ATS sync for Paystack, Moniepoint & run autonomous opportunity scoring"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                height: '38px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#0f172a',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              {isSyncing ? (
                <RefreshCw size={14} className="animate-spin" color="#4f46e5" />
              ) : (
                <Zap size={14} color="#f59e0b" fill="#f59e0b" />
              )}
              <span>{isSyncing ? 'Syncing Live Jobs...' : 'Live Ingestion Sync'}</span>
            </button>

            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0 12px',
              height: '38px',
              width: 'min(240px, 100%)',
              flex: '1 1 180px',
              gap: '8px'
            }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search opportunities, industries, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  width: '100%'
                }}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: 0
                  }}
                >
                  ✕
                </button>
              ) : (
                <span className="desktop-only" style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '1px 4px'
                }}>
                  ⌘ K
                </span>
              )}
            </div>

            {/* Ask AI Copilot Button */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#0b0f19',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                height: '38px',
                padding: '0 14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <Sparkles size={14} color="#a5b4fc" />
              <span>Ask AI Copilot</span>
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => onNavigate('signals')}
                title="View signals & live notifications"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <Bell size={16} />
              </button>
              {signals.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#e11d48',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  borderRadius: '10px',
                  padding: '1px 5px',
                  pointerEvents: 'none'
                }}>
                  {Math.min(99, signals.length)}
                </span>
              )}
            </div>

            {/* User Avatar */}
            <div
              onClick={() => onNavigate('profile')}
              title="View your profile & account settings"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12.5px',
                fontWeight: 800,
                color: '#334155',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              AA
            </div>

            {/* Date Range Selector Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  height: '38px',
                  padding: '0 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <Calendar size={14} color="#64748b" />
                <span>{dateRange}</span>
              </button>

              {isDateMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  minWidth: '200px',
                  padding: '6px'
                }}>
                  {['Today', 'Last 7 Days', 'Last 30 Days', 'This Quarter', 'All Time'].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRange(range);
                        setIsDateMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: dateRange === range ? 700 : 500,
                        color: dateRange === range ? '#4f46e5' : '#334155',
                        backgroundColor: dateRange === range ? '#f5f3ff' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setIsFiltersModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                height: '38px',
                padding: '0 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <SlidersHorizontal size={14} color="#64748b" />
              <span>Filters</span>
            </button>
          </div>
        </header>

        {/* Scrollable Body Canvas */}
        <main 
          className="mobile-bottom-pad"
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '20px 0 36px'
          }}
        >
          {/* Load / mutation error banner */}
          {(dataLoadError) && (
            <div style={{
              margin: '0 32px',
              padding: '10px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              fontWeight: 600,
              color: '#b91c1c',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.08)'
            }}>
              <span>{dataLoadError}</span>
            </div>
          )}

          {/* Feedback Toast (success/error) */}
          {syncToast && (
            <div style={{
              margin: '0 32px',
              padding: '10px 16px',
              backgroundColor: syncToastIsError ? '#fef2f2' : '#ecfdf5',
              border: `1px solid ${syncToastIsError ? '#fca5a5' : '#6ee7b7'}`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              fontWeight: 600,
              color: syncToastIsError ? '#b91c1c' : '#065f46',
              boxShadow: syncToastIsError
                ? '0 2px 6px rgba(220, 38, 38, 0.08)'
                : '0 2px 6px rgba(16, 185, 129, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={15} color={syncToastIsError ? '#dc2626' : '#059669'} fill={syncToastIsError ? '#dc2626' : '#059669'} />
                <span>{syncToast}</span>
              </div>
              <button
                onClick={() => setSyncToast(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: syncToastIsError ? '#b91c1c' : '#047857',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Top 6 KPI Summary Cards */}
          <OpportunitiesKpiCards
            activeFilter={activeKpiFilter}
            onSelectKpi={(f) => {
              setActiveKpiFilter(f);
              if (f === 'hot') setActiveTab('hot');
              else if (f === 'high') setActiveTab('high');
              else setActiveTab('all');
            }}
          />

          {/* Middle Table & Detail Drawer Row */}
          <div style={{
            display: 'flex',
            gap: '18px',
            padding: '0 32px',
            alignItems: 'flex-start'
          }}>
            {/* Opportunity Table */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <OpportunityTable
                opportunities={filteredOpportunities}
                selectedOpportunityId={selectedOpportunityId}
                onSelectOpportunity={(opp) => setSelectedOpportunityId(opp.id)}
                onOpenNewModal={() => setIsNewModalOpen(true)}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onStageChange={handleStageChange}
              />
            </div>

            {/* Opportunity Detail Drawer (Right side) */}
            {selectedOpp && (
              <OpportunityDrawer
                opp={selectedOpp}
                onClose={() => setSelectedOpportunityId(null)}
                onOpenScoreBreakdown={(opp) => setInspectingScoreOpp(opp)}
                onStartOutreach={(opp) => setResearchedCompany(opp.companyName)}
                onViewCompany={(name) => setResearchedCompany(name)}
                onAddToPipeline={(opp) => {
                  addDealToPipeline({
                    companyName: opp.companyName,
                    domain: opp.website,
                    dealTitle: `${opp.companyName} - High-Intent Expansion Advisory`,
                    serviceName: 'Enterprise Growth Advisory',
                    dealValue: opp.estimatedValue,
                    probability: Math.min(90, Math.round(opp.score * 0.9)),
                    opportunityScore: opp.score,
                    stage: 'contacted',
                    contactName: opp.bestNextStep?.targetName || 'Executive Decision Maker',
                    contactRole: opp.bestNextStep?.targetRole || 'Leadership Team',
                    nextAction: opp.bestNextStep?.actionText || 'Send tailored executive brief'
                  });
                  setSyncToast(`Promoted ${opp.companyName} ($${opp.estimatedValue.toLocaleString()}) to CRM Pipeline!`);
                  setTimeout(() => setSyncToast(null), 4000);
                }}
              />
            )}
          </div>

          {/* Bottom Analytics Row */}
          <OpportunityAnalytics />
        </main>
      </div>

      {/* Modals */}
      <NewOpportunityModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddOpportunity={handleAddOpportunity}
      />

      <ScoreBreakdownModal
        opp={inspectingScoreOpp}
        onClose={() => setInspectingScoreOpp(null)}
      />

      <OpportunityFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApply={handleApplyFilters}
      />

      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInvestigateCompany={(comp) => setResearchedCompany(comp)}
      />

      <CompanyResearchModal
        companyName={researchedCompany}
        onClose={() => setResearchedCompany(null)}
      />

      {/* Mobile One-Thumb Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
