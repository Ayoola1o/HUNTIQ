import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { CompaniesKpiCards } from './CompaniesKpiCards';
import { CompanyTable } from './CompanyTable';
import { CompanyDrawer } from './CompanyDrawer';
import { CompanyAnalytics } from './CompanyAnalytics';
import { AddToListModal } from './AddToListModal';
import { ScoreBreakdownModal } from '../opportunities/ScoreBreakdownModal';
import { OpportunityFiltersModal } from '../opportunities/OpportunityFiltersModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import { CompanyResearchModal } from '../dashboard/CompanyResearchModal';
import type { CompanyItem } from '../../types/company';
import type { OpportunityItem } from '../../types/opportunity';
import { 
  Search, 
  Sparkles, 
  Bell, 
  Calendar, 
  SlidersHorizontal, 
  Upload,
  Plus
} from 'lucide-react';

import { useHuntiq } from '../../context/HuntiqContext';
import { MobileBottomNav } from '../navigation/MobileBottomNav';

interface CompaniesPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const CompaniesPage: React.FC<CompaniesPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const { companies: dynamicCompanies, toggleSaveCompany } = useHuntiq();
  const [activeTab, setActiveTab] = useState('all');
  const [activeKpiFilter, setActiveKpiFilter] = useState('total');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Modals state
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);
  const [listModalCompany, setListModalCompany] = useState<CompanyItem | null>(null);
  const [scoreBreakdownTarget, setScoreBreakdownTarget] = useState<OpportunityItem | null>(null);

  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{
    minScore?: number;
    selectedIndustries?: string[];
    selectedLocations?: string[];
    selectedSignals?: string[];
  }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const companies = React.useMemo(() => {
    const base = dynamicCompanies || [];
    return base.map(c => ({
      ...c,
      isSaved: savedMap[c.id] !== undefined ? savedMap[c.id] : Boolean(c.isSaved)
    }));
  }, [dynamicCompanies, savedMap]);

  const selectedComp = companies.find((c) => c.id === selectedCompanyId) || (companies.length > 0 ? companies[0] : null);

  const handleToggleSave = async (companyId: string) => {
    const current = companies.find(c => c.id === companyId)?.isSaved;
    const nextSaved = !current;
    setSavedMap((prev) => ({ ...prev, [companyId]: nextSaved }));

    try {
      await toggleSaveCompany(companyId);
      setToastMessage(nextSaved ? 'Company saved to bookmarks' : 'Company removed from bookmarks');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to toggle save company:', err);
      setSavedMap((prev) => {
        const copy = { ...prev };
        delete copy[companyId];
        return copy;
      });
      setToastMessage('Failed to update bookmark');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Company Name', 'Industry', 'Employees', 'Revenue', 'Location', 'Opportunity Score'];
    const rows = filteredCompanies.map(c => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.industry || ''}"`,
      `"${c.employees || ''}"`,
      `"${c.revenue || ''}"`,
      `"${c.location || ''}"`,
      c.opportunityScore || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `huntiq_companies_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage(`Exported ${filteredCompanies.length} companies to CSV!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveToList = (listName: string) => {
    if (listModalCompany) {
      setToastMessage(`Added ${listModalCompany.name} to "${listName}"!`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setToastMessage('Target filters applied successfully');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredCompanies = companies.filter((c) => {
    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        c.name.toLowerCase().includes(q) ||
        (c.industry && c.industry.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q));
      if (!matches) return false;
    }

    // Applied modal filters
    if (appliedFilters.minScore && (c.opportunityScore || 0) < appliedFilters.minScore) {
      return false;
    }

    if (appliedFilters.selectedIndustries && appliedFilters.selectedIndustries.length > 0) {
      const matchesIndustry = appliedFilters.selectedIndustries.some(ind => 
        c.industry?.toLowerCase().includes(ind.toLowerCase())
      );
      if (!matchesIndustry) return false;
    }

    if (appliedFilters.selectedLocations && appliedFilters.selectedLocations.length > 0) {
      const matchesLoc = appliedFilters.selectedLocations.some(loc => 
        c.location?.toLowerCase().includes(loc.toLowerCase())
      );
      if (!matchesLoc) return false;
    }

    // Tab filtering
    if (activeTab === 'high-opportunity' && (c.opportunityScore || 0) < 80) return false;
    if (activeTab === 'recently-added' && !(c.lastActivity?.includes('h ago') || c.lastActivity?.includes('1d ago') || c.lastActivity?.includes('2d ago'))) return false;
    if (activeTab === 'saved' && !c.isSaved) return false;

    // KPI Card filtering
    if (activeKpiFilter === 'high-opportunity' && (c.opportunityScore || 0) < 80) return false;
    if (activeKpiFilter === 'new' && !(c.lastActivity?.includes('h ago') || c.lastActivity?.includes('1d ago') || c.lastActivity?.includes('2d ago') || c.lastActivity?.includes('Just now'))) return false;
    if (activeKpiFilter === 'with-signals' && (c.signalsCount || 0) === 0 && (!c.activeSignals || c.activeSignals.length === 0)) return false;

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
        activeNav="companies"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Companies Canvas */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {toastMessage && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '32px',
            zIndex: 100,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{toastMessage}</span>
          </div>
        )}
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
          {/* Title */}
          <div>
            <h1 style={{
              fontSize: 'clamp(18px, 4vw, 22px)',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              Companies
            </h1>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
              Discover and analyze companies in your target market.
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
                title="View Buying Signals & Alerts"
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
            <div 
              onClick={() => onNavigate('profile')}
              title="View User Profile"
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
                cursor: 'pointer'
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
                  top: '42px',
                  right: 0,
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 40,
                  minWidth: '140px',
                  padding: '6px'
                }}>
                  {['Today', 'Last 7 days', 'Last 30 days', 'This quarter'].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setDateRange(opt);
                        setIsDateMenuOpen(false);
                      }}
                      style={{
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: dateRange === opt ? 700 : 500,
                        color: dateRange === opt ? '#4f46e5' : '#334155',
                        backgroundColor: dateRange === opt ? '#f5f3ff' : 'transparent',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {opt}
                    </div>
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

            {/* Export Button */}
            <button
              onClick={handleExportCsv}
              title="Export filtered directory to CSV"
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
              <Upload size={14} color="#64748b" />
              <span>Export</span>
            </button>

            {/* + Add to List Button */}
            <button
              onClick={() => setListModalCompany(selectedComp)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                height: '38px',
                padding: '0 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Plus size={15} />
              <span>Add to List</span>
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
          <CompaniesKpiCards
            activeFilter={activeKpiFilter}
            onSelectKpi={(f) => setActiveKpiFilter(f)}
            companies={companies}
          />

          {/* Middle Table & Detail Preview Drawer */}
          <div style={{
            display: 'flex',
            gap: '18px',
            padding: '0 32px',
            alignItems: 'flex-start'
          }}>
            {/* Main Company Table */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <CompanyTable
                companies={filteredCompanies}
                selectedCompanyId={selectedCompanyId}
                onSelectCompany={(comp) => setSelectedCompanyId(comp.id)}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onToggleSave={handleToggleSave}
              />
            </div>

            {/* Right Company Intelligence Preview Drawer */}
            {selectedComp && (
              <CompanyDrawer
                company={selectedComp}
                onClose={() => setSelectedCompanyId(null)}
                onViewProfile={(comp) => setResearchedCompany(comp.name)}
                onAddToList={(comp) => setListModalCompany(comp)}
                onViewScoreBreakdown={(comp) => setScoreBreakdownTarget({
                  id: comp.id,
                  companyName: comp.name,
                  avatarLetter: comp.logoInitial || comp.name.charAt(0),
                  avatarBg: comp.logoBg || '#ef4444',
                  industry: comp.industry,
                  employees: comp.employees,
                  location: comp.location,
                  score: comp.opportunityScore,
                  scoreTrend: 'up',
                  priority: comp.opportunityLevel === 'Very High' ? 'Hot' : comp.opportunityLevel === 'High' ? 'High' : 'Medium',
                  whyNow: comp.description,
                  tags: [comp.industry, comp.location],
                  estimatedValue: 25000,
                  stage: 'Discovery',
                  lastActivity: comp.lastActivity,
                  lastActivityType: 'signal',
                  website: comp.domain,
                  revenue: comp.revenue,
                  linkedInUrl: comp.socials.linkedin || '',
                  signals: [],
                  scoreFactors: {
                    icpFit: { score: 28, max: 30 },
                    buyingIntent: { score: 23, max: 25 },
                    triggerEvents: { score: 18, max: 20 },
                    decisionMakerAccess: { score: 10, max: 10 },
                    companySize: { score: 10, max: 10 },
                    engagement: { score: 5, max: 5 }
                  },
                  bestNextStep: {
                    actionText: 'Initiate outreach to leadership team',
                    targetRole: 'COO / Head of People',
                    targetName: 'Jane Smith'
                  }
                })}
              />
            )}
          </div>

          {/* Bottom 3-Column Analytics */}
          <CompanyAnalytics companies={companies} />
        </main>
      </div>

      {/* Modals */}
      <AddToListModal
        isOpen={!!listModalCompany}
        onClose={() => setListModalCompany(null)}
        company={listModalCompany}
        onSave={handleSaveToList}
      />

      <ScoreBreakdownModal
        opp={scoreBreakdownTarget}
        onClose={() => setScoreBreakdownTarget(null)}
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
