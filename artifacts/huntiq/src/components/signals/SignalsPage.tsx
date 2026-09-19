import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { SignalsKpiCards } from './SignalsKpiCards';
import { SignalTable } from './SignalTable';
import { SignalDrawer } from './SignalDrawer';
import { SignalAnalytics } from './SignalAnalytics';
import { OpportunityFiltersModal } from '../opportunities/OpportunityFiltersModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import { CompanyResearchModal } from '../dashboard/CompanyResearchModal';
import type { SignalItem } from '../../types/signal';
import { useHuntiq } from '../../context/HuntiqContext';
import { MobileBottomNav } from '../navigation/MobileBottomNav';
import { 
  Radio, 
  Search, 
  Sparkles, 
  Bell, 
  Calendar, 
  SlidersHorizontal 
} from 'lucide-react';

interface SignalsPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const SignalsPage: React.FC<SignalsPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const { signals, companies } = useHuntiq();
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [activeKpiFilter, setActiveKpiFilter] = useState('total');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);

  // Date Range and Filter states
  const [dateRange, setDateRange] = useState('May 16, 2025 - May 30, 2025');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<{
    minScore: number;
    selectedIndustries: string[];
    selectedLocations: string[];
    selectedSignals: string[];
  } | null>(null);

  // Modals state
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);

  const handleApplyFilters = (filters: {
    minScore: number;
    selectedIndustries: string[];
    selectedLocations: string[];
    selectedSignals: string[];
  }) => {
    setAppliedFilters(filters);
    setToastMessage(`Filters applied: Min Score ${filters.minScore} | ${filters.selectedLocations.length} locations | ${filters.selectedSignals.length} signal types`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedSig: SignalItem | undefined = (selectedSignalId ? signals.find((s: SignalItem) => s.id === selectedSignalId) : null) || signals[0];

  const filteredSignals = signals.filter((sig: SignalItem) => {
    // Type Filter
    if (activeTypeFilter !== 'all' && sig.type !== activeTypeFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCompany = String(sig.companyName || '').toLowerCase().includes(q);
      const matchTitle = String(sig.title || '').toLowerCase().includes(q);
      const matchSubtitle = String(sig.subtitle || '').toLowerCase().includes(q);
      const matchLoc = String(sig.location || '').toLowerCase().includes(q);
      if (!matchCompany && !matchTitle && !matchSubtitle && !matchLoc) return false;
    }

    // KPI Card Filter
    if (activeKpiFilter === 'new') {
      const timeStr = String(sig.detectedTime || sig.detectedTimestamp || '');
      return timeStr.includes('ago') || timeStr.includes('Just now') || timeStr.includes('Today') || !timeStr;
    }
    if (activeKpiFilter === 'high_impact') {
      return sig.impactLevel === 'Very High' || sig.impactLevel === 'High' || (sig.impactScore || 0) >= 85;
    }
    if (activeKpiFilter === 'hot_companies') {
      const sigCompName = String(sig.companyName || '').toLowerCase();
      const comp = companies.find((c) => String(c.name || '').toLowerCase() === sigCompName);
      return comp ? (comp.opportunityScore || 0) >= 80 : (sig.impactScore || 0) >= 85;
    }

    // Applied Modal Filters
    if (appliedFilters) {
      if ((sig.impactScore || 70) < appliedFilters.minScore) return false;
      if (
        appliedFilters.selectedLocations.length > 0 &&
        !appliedFilters.selectedLocations.some((loc) =>
          String(sig.location || '').toLowerCase().includes(loc.toLowerCase())
        )
      ) {
        return false;
      }
      if (
        appliedFilters.selectedSignals.length > 0 &&
        !appliedFilters.selectedSignals.some((s) =>
          String(sig.title || '').toLowerCase().includes(s.toLowerCase()) ||
          String(sig.type || '').toLowerCase().includes(s.toLowerCase())
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
        activeNav="signals"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Signals Canvas */}
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
          {/* Title & Antenna Icon */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontSize: 'clamp(18px, 4vw, 22px)',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                Signals
              </h1>
              <div style={{
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Radio size={18} />
              </div>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
              Real-time buying signals and market events across your target market.
            </p>
          </div>

          {/* Search, Copilot CTA, Date & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0 12px',
              height: '38px',
              width: 'min(280px, 100%)',
              flex: '1 1 180px',
              gap: '8px'
            }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search companies, people, signals..."
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
                title="View signals & notifications"
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
                12
              </span>
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
                  {['Today', 'Last 7 Days', 'Last 30 Days', 'May 16, 2025 - May 30, 2025', 'This Quarter'].map((range) => (
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
          {/* Filter Feedback Toast */}
          {toastMessage && (
            <div style={{
              margin: '0 32px',
              padding: '10px 16px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1e40af',
              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.1)'
            }}>
              <span>{toastMessage}</span>
              <button
                onClick={() => setToastMessage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1d4ed8',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 6 Top Summary KPI Cards */}
          <SignalsKpiCards
            activeFilter={activeKpiFilter}
            onSelectKpi={(f) => setActiveKpiFilter(f)}
          />

          {/* Middle Table & Detail Drawer */}
          <div style={{
            display: 'flex',
            gap: '18px',
            padding: '0 32px',
            alignItems: 'flex-start'
          }}>
            {/* Main Signal Table */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <SignalTable
                signals={filteredSignals}
                selectedSignalId={selectedSignalId}
                onSelectSignal={(sig) => setSelectedSignalId(sig.id)}
                activeTypeFilter={activeTypeFilter}
                onSelectTypeFilter={setActiveTypeFilter}
              />
            </div>

            {/* Right Signal Intelligence Drawer */}
            {selectedSig && (
              <SignalDrawer
                signal={selectedSig}
                onClose={() => setSelectedSignalId(null)}
                onStartOutreach={(sig) => setResearchedCompany(sig.companyName)}
                onViewCompany={(name) => setResearchedCompany(name)}
              />
            )}
          </div>

          {/* Bottom 3-Column Analytics */}
          <SignalAnalytics />
        </main>
      </div>

      {/* Modals */}
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
