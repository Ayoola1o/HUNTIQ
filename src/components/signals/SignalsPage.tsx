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

  // Modals state
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);

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
                padding: '1px 5px'
              }}>
                12
              </span>
            </div>

            {/* User Avatar */}
            <div style={{
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
              color: '#334155'
            }}>
              AA
            </div>

            {/* Date Range Selector */}
            <button
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
              <span>May 16, 2025 - May 30, 2025</span>
            </button>

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
        onApply={() => {}}
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
