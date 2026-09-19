import React, { useState, useMemo } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { MarketFilterBar } from './MarketFilterBar';
import { MarketKpiCards } from './MarketKpiCards';
import { MarketTrendsOverTime } from './MarketTrendsOverTime';
import { MarketSignalsByType } from './MarketSignalsByType';
import { TopIndustriesCard } from './TopIndustriesCard';
import { MarketAiInsights } from './MarketAiInsights';
import { TopCompaniesSignalsCard } from './TopCompaniesSignalsCard';
import { GeographicHotspotsCard } from './GeographicHotspotsCard';
import { EmergingTrendsCard } from './EmergingTrendsCard';
import { LatestSignalsFeedCard } from './LatestSignalsFeedCard';
import { RecommendedActionsCard } from './RecommendedActionsCard';
import { IndustryIntelligenceDrawer } from './IndustryIntelligenceDrawer';
import { MarketBriefModal } from './MarketBriefModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import { CompanyResearchModal } from '../dashboard/CompanyResearchModal';
import type { IndustrySignalItem } from '../../types/market';
import { 
  Activity, 
  Sparkles, 
  FileDown
} from 'lucide-react';

interface MarketIntelligencePageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const MarketIntelligencePage: React.FC<MarketIntelligencePageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  // Filter States
  const [dateRange, setDateRange] = useState('30 days');
  const [geography, setGeography] = useState('All');
  const [industry, setIndustry] = useState('All');
  const [companySize, setCompanySize] = useState('All');
  const [signalType, setSignalType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState('total');

  // Modals & Drawers States
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<IndustrySignalItem | null>(null);

  // Active filter count calculator
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (dateRange !== '30 days') count++;
    if (geography !== 'All') count++;
    if (industry !== 'All') count++;
    if (companySize !== 'All') count++;
    if (signalType !== 'All') count++;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [dateRange, geography, industry, companySize, signalType, searchQuery]);

  const handleResetFilters = () => {
    setDateRange('30 days');
    setGeography('All');
    setIndustry('All');
    setCompanySize('All');
    setSignalType('All');
    setSearchQuery('');
  };

  const handleSelectIndustry = (ind: IndustrySignalItem) => {
    setSelectedIndustry(ind);
  };

  const handleExploreIndustryCompanies = (_industryName: string) => {
    setSelectedIndustry(null);
    onNavigate('companies');
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f4f6fa',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary)'
    }}>
      {/* Left Sidebar */}
      <DashboardSidebar
        activeNav="market-intel"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Top Header Bar */}
        <header style={{
          height: '62px',
          minHeight: '62px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          zIndex: 10
        }}>
          {/* Title & Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              backgroundColor: '#f5f3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ede9fe'
            }}>
              <Activity size={16} color="#7c3aed" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                  Market Intelligence
                </h1>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Live Sync
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Real-time insights, buying signals, and market trends across your target universe
              </p>
            </div>
          </div>

          {/* Right Header CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsBriefModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <FileDown size={13} color="#64748b" />
              <span>Export Market Report</span>
            </button>

            <button
              onClick={() => setIsCopilotOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Sparkles size={13} />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </header>

        {/* Global Filter Bar */}
        <MarketFilterBar
          dateRange={dateRange}
          onChangeDateRange={setDateRange}
          geography={geography}
          onChangeGeography={setGeography}
          industry={industry}
          onChangeIndustry={setIndustry}
          companySize={companySize}
          onChangeCompanySize={setCompanySize}
          signalType={signalType}
          onChangeSignalType={setSignalType}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onGenerateBrief={() => setIsBriefModalOpen(true)}
          activeFilterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
        />

        {/* Scrollable Intelligence Canvas */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '24px 0 40px 0'
        }}>
          {/* KPI Overview Cards */}
          <MarketKpiCards
            activeFilter={activeKpiFilter}
            onSelectKpi={setActiveKpiFilter}
          />

          {/* Row 1: Signals Over Time & Signals by Type */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '18px',
            padding: '0 32px'
          }}>
            <MarketTrendsOverTime />
            <MarketSignalsByType onSelectType={(type) => setSignalType(type)} />
          </div>

          {/* Row 2: Top Industries by Signal Volume & Market Insights (AI Layer) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.2fr',
            gap: '18px',
            padding: '0 32px'
          }}>
            <TopIndustriesCard onSelectIndustry={handleSelectIndustry} />
            <MarketAiInsights
              onExploreIndustry={(ind) => {
                setIndustry(ind);
                onNavigate('companies');
              }}
              onViewReport={() => setIsBriefModalOpen(true)}
            />
          </div>

          {/* Row 3: Top Companies Showing Buying Signals & Geographic Hotspots */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1.1fr',
            gap: '18px',
            padding: '0 32px'
          }}>
            <TopCompaniesSignalsCard
              onSelectCompany={(comp) => setResearchedCompany(comp)}
              onViewAllCompanies={() => onNavigate('companies')}
            />
            <GeographicHotspotsCard
              onSelectHotspot={(spot) => {
                setGeography(spot.country);
              }}
            />
          </div>

          {/* Row 4: Emerging Trends (Full Width 5-Column Grid) */}
          <div style={{ padding: '0 32px' }}>
            <EmergingTrendsCard
              onSelectTrend={(trend) => {
                setSearchQuery(trend.title);
              }}
            />
          </div>

          {/* Row 5: Latest Market Signals Feed & Recommended Sales Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '18px',
            padding: '0 32px'
          }}>
            <LatestSignalsFeedCard
              onInvestigateCompany={(comp) => setResearchedCompany(comp)}
              onViewAllSignals={() => onNavigate('signals')}
            />
            <RecommendedActionsCard
              onNavigate={onNavigate}
              onOpenResearch={(comp) => setResearchedCompany(comp)}
              onGenerateBrief={() => setIsBriefModalOpen(true)}
            />
          </div>
        </main>
      </div>

      {/* AI Copilot Interactive Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInvestigateCompany={(comp) => setResearchedCompany(comp)}
      />

      {/* 360° Company Research Intelligence Modal */}
      <CompanyResearchModal
        companyName={researchedCompany}
        onClose={() => setResearchedCompany(null)}
      />

      {/* Industry Intelligence Slide-out Drawer */}
      <IndustryIntelligenceDrawer
        industry={selectedIndustry}
        onClose={() => setSelectedIndustry(null)}
        onExploreCompanies={handleExploreIndustryCompanies}
        onInvestigateCompany={(comp) => setResearchedCompany(comp)}
      />

      {/* Executive AI Market Brief Modal */}
      <MarketBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        onNavigateToOutreach={() => onNavigate('campaigns')}
      />
    </div>
  );
};
