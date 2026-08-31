import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { AiSearchInput } from './AiSearchInput';
import { QuickStartTemplates } from './QuickStartTemplates';
import { AdvancedFilterForm } from './AdvancedFilterForm';
import { SearchSummaryPanel } from './SearchSummaryPanel';
import { SaveSearchModal } from './SaveSearchModal';
import { MapProspectingRadar } from './MapProspectingRadar';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import { CompanyResearchModal } from '../dashboard/CompanyResearchModal';
import type { SearchCriteria, QuickTemplate, SearchEstimation } from '../../types/prospectHunter';
import { 
  Sparkles, 
  Search, 
  Calendar, 
  Bookmark,
  CheckCircle2,
  Trash2,
  ChevronDown,
  FolderDown
} from 'lucide-react';

interface SavedSearchRecord {
  id: string;
  name: string;
  createdAt: string;
  autoAlert: boolean;
  criteria: SearchCriteria;
}

interface FindProspectsPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const FindProspectsPage: React.FC<FindProspectsPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'advanced' | 'geo-radar'>('ai');

  // Search criteria state matching Find Prospects page.png
  const [criteria, setCriteria] = useState<SearchCriteria>({
    naturalQuery: '',
    tab: 'ai',
    industries: ['Technology'],
    locations: ['Lagos, Nigeria'],
    companySize: '50 - 500 employees',
    revenue: '$10M - $50M',
    businessType: 'B2B',
    technologies: [],
    yearsInBusiness: 'All',
    icpFit: 'All',
    signals: [
      'Hiring Activity',
      'Funding Raised',
      'Expansion',
      'Leadership Change',
      'Technology Change',
      'New Office',
      'News Mentions'
    ]
  });

  // Dynamic Estimation based on criteria
  const [estimation, setEstimation] = useState<SearchEstimation>({
    estimatedCompanies: '1,240 - 2,180',
    highOpportunityMatches: '120 - 250',
    averageScore: 68,
    researchSources: '15+ sources',
    dataFreshness: 'Real-time'
  });

  // Saved searches persistent state
  const [savedSearches, setSavedSearches] = useState<SavedSearchRecord[]>(() => {
    try {
      const stored = localStorage.getItem('huntiq_saved_searches');
      if (stored) return JSON.parse(stored);
    } catch (_e) {}
    return [
      {
        id: 'saved-1',
        name: 'Lagos Tech & HR Scaleups',
        createdAt: '2026-08-30T10:00:00Z',
        autoAlert: true,
        criteria: {
          naturalQuery: 'High-growth B2B SaaS in Lagos with hiring surges',
          tab: 'ai',
          industries: ['Technology', 'Financial Services'],
          locations: ['Lagos, Nigeria'],
          companySize: '50 - 500 employees',
          revenue: '$10M - $50M',
          businessType: 'B2B',
          technologies: ['React', 'PostgreSQL'],
          yearsInBusiness: '3-10 years',
          icpFit: 'High Propensity',
          signals: ['Hiring Activity', 'Funding Raised', 'Expansion']
        }
      }
    ];
  });

  // Modals state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);
  const [isSavedSearchesOpen, setIsSavedSearchesOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('Last 30 Days (Real-Time)');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);

  // Sync saved searches to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('huntiq_saved_searches', JSON.stringify(savedSearches));
    } catch (_e) {}
  }, [savedSearches]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCriteriaChange = (updates: Partial<SearchCriteria>) => {
    setCriteria((prev) => {
      const next = { ...prev, ...updates };

      // Update live estimation dynamically
      let count = 1500;
      if (next.industries.length > 0) count -= 200;
      if (next.locations.length > 0) count -= 150;
      if (next.signals.length > 4) count += 300;

      setEstimation({
        estimatedCompanies: `${Math.max(400, count - 300).toLocaleString()} - ${(count + 500).toLocaleString()}`,
        highOpportunityMatches: `${Math.max(40, Math.round(count * 0.1))} - ${Math.round(count * 0.2)}`,
        averageScore: next.signals.length > 3 ? 74 : 68,
        researchSources: '15+ sources',
        dataFreshness: 'Real-time'
      });

      return next;
    });
  };

  const handleSaveSearch = (name: string, autoAlert: boolean) => {
    const newRecord: SavedSearchRecord = {
      id: `saved-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      autoAlert,
      criteria: { ...criteria }
    };

    setSavedSearches(prev => [newRecord, ...prev]);
    showToast(`✅ Saved search "${name}" successfully! Real-time alerts enabled.`);
  };

  const handleLoadSavedSearch = (saved: SavedSearchRecord) => {
    setCriteria(saved.criteria);
    setIsSavedSearchesOpen(false);
    showToast(`Loaded saved search "${saved.name}"`);
  };

  const handleDeleteSavedSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSearches(prev => prev.filter(s => s.id !== id));
    showToast('Search deleted');
  };

  const handleSelectTemplate = (template: QuickTemplate) => {
    if (template.preset.naturalQuery) {
      setCriteria((prev) => ({
        ...prev,
        naturalQuery: template.preset.naturalQuery!,
        signals: template.preset.signals || prev.signals,
        companySize: template.preset.companySize || prev.companySize,
        revenue: template.preset.revenue || prev.revenue
      }));
    }
  };

  const handleImproveWithAi = () => {
    setCriteria((prev) => ({
      ...prev,
      naturalQuery: 'Find high-growth B2B technology companies in Lagos with 50-500 employees, hiring surges in engineering & sales, and recent Series A/B funding rounds.',
      industries: ['Technology', 'Financial Services'],
      locations: ['Lagos, Nigeria'],
      companySize: '50 - 500 employees',
      revenue: '$10M - $50M',
      businessType: 'B2B',
      signals: ['Hiring Activity', 'Funding Raised', 'Expansion', 'Leadership Change', 'Technology Change']
    }));
  };

  const handleExecuteSearch = () => {
    onNavigate('opportunities');
  };

  const handleResetFilters = () => {
    setCriteria({
      naturalQuery: '',
      tab: 'ai',
      industries: [],
      locations: [],
      companySize: '50 - 500 employees',
      revenue: '$10M - $50M',
      businessType: 'B2B',
      technologies: [],
      yearsInBusiness: 'All',
      icpFit: 'All',
      signals: ['Hiring Activity', 'Expansion']
    });
  };

  const handleClearAll = () => {
    setCriteria({
      naturalQuery: '',
      tab: 'ai',
      industries: [],
      locations: [],
      companySize: 'All',
      revenue: 'All',
      businessType: 'All',
      technologies: [],
      yearsInBusiness: 'All',
      icpFit: 'All',
      signals: []
    });
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
      {/* Left Global Navigation Sidebar */}
      <DashboardSidebar
        activeNav="find-prospects"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Prospect Hunter Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Toast Notification */}
        {toastMessage && (
          <div style={{
            position: 'absolute',
            top: '76px',
            right: '32px',
            zIndex: 100,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <header style={{
          padding: '16px 32px 14px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          {/* Title & Sparkle Icon */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                Find Prospects
              </h1>
              <div style={{
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Sparkles size={18} />
              </div>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
              Use AI or advanced filters to discover companies that match your ideal customer profile.
            </p>
          </div>

          {/* Search, Copilot CTA, Date & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0 12px',
              height: '38px',
              width: '260px',
              gap: '8px'
            }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                value={criteria.naturalQuery}
                onChange={(e) => handleCriteriaChange({ naturalQuery: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch()}
                placeholder="Search companies, signals..."
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  width: '100%'
                }}
              />
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
                <ChevronDown size={12} color="#94a3b8" />
              </button>

              {isDateMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                  padding: '6px',
                  width: '200px',
                  zIndex: 80
                }}>
                  {['Last 7 Days (Surge)', 'Last 14 Days (Velocity)', 'Last 30 Days (Real-Time)', 'Last 90 Days (Quarterly)'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setDateRange(opt);
                        setIsDateMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: dateRange === opt ? '#f1f5f9' : 'transparent',
                        color: dateRange === opt ? '#4f46e5' : '#334155',
                        fontSize: '12px',
                        fontWeight: dateRange === opt ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Searches Dropdown Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsSavedSearchesOpen(!isSavedSearchesOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isSavedSearchesOpen ? '#eef2ff' : '#ffffff',
                  border: isSavedSearchesOpen ? '1px solid #818cf8' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  height: '38px',
                  padding: '0 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isSavedSearchesOpen ? '#4f46e5' : '#334155',
                  cursor: 'pointer'
                }}
              >
                <FolderDown size={14} color="#6366f1" />
                <span>Saved ({savedSearches.length})</span>
                <ChevronDown size={12} color="#94a3b8" />
              </button>

              {/* Saved Searches Dropdown Menu */}
              {isSavedSearchesOpen && (
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 15px 35px -5px rgba(0,0,0,0.2)',
                  padding: '8px',
                  width: '320px',
                  zIndex: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{
                    padding: '6px 8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>Your Saved Queries</span>
                    <span>{savedSearches.length} saved</span>
                  </div>

                  {savedSearches.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                      No saved searches yet. Click "Save Search" to bookmark queries.
                    </div>
                  ) : (
                    savedSearches.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleLoadSavedSearch(item)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                            {item.name}
                          </span>
                          <button
                            onClick={(e) => handleDeleteSavedSearch(item.id, e)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '2px 4px'
                            }}
                            title="Delete saved search"
                          >
                            <Trash2 size={13} color="#ef4444" />
                          </button>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {item.criteria.naturalQuery || `${item.criteria.industries.join(', ')} • ${item.criteria.locations.join(', ')}`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Save Search Button */}
            <button
              onClick={() => setIsSaveModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#4f46e5',
                border: 'none',
                borderRadius: '10px',
                height: '38px',
                padding: '0 14px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Bookmark size={14} color="#ffffff" />
              <span>Save Search</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Top Tab Selector: AI Prospect Search vs Advanced Search vs Live Geo Radar */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#eef2f6',
            borderRadius: '10px',
            padding: '3px',
            width: 'fit-content'
          }}>
            <button
              onClick={() => setActiveTab('ai')}
              style={{
                padding: '7px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'ai' ? '#ffffff' : 'transparent',
                color: activeTab === 'ai' ? '#4f46e5' : '#64748b',
                fontWeight: activeTab === 'ai' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'ai' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              AI Prospect Search
            </button>

            <button
              onClick={() => setActiveTab('advanced')}
              style={{
                padding: '7px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'advanced' ? '#ffffff' : 'transparent',
                color: activeTab === 'advanced' ? '#4f46e5' : '#64748b',
                fontWeight: activeTab === 'advanced' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'advanced' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Advanced Search
            </button>

            <button
              onClick={() => setActiveTab('geo-radar')}
              style={{
                padding: '7px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'geo-radar' ? '#ffffff' : 'transparent',
                color: activeTab === 'geo-radar' ? '#4f46e5' : '#64748b',
                fontWeight: activeTab === 'geo-radar' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'geo-radar' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🗺️ Live Geo Radar & Map Scraper</span>
              <span style={{ fontSize: '10px', backgroundColor: '#ecfdf5', color: '#059669', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                Live
              </span>
            </button>
          </div>

          {activeTab === 'geo-radar' ? (
            <MapProspectingRadar onNavigateToOpportunities={() => onNavigate('opportunities')} />
          ) : (
            /* 2-Column Main Form + Summary Grid */
            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start'
            }}>
              {/* Left Column: AI Box + Templates + Filters */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
                {/* AI Natural Language Search Box */}
                <AiSearchInput
                  value={criteria.naturalQuery}
                  onChange={(val) => handleCriteriaChange({ naturalQuery: val })}
                  onSubmit={handleExecuteSearch}
                  onImprove={handleImproveWithAi}
                />

                {/* Quick Start 5 Templates */}
                <QuickStartTemplates onSelectTemplate={handleSelectTemplate} />

                {/* Advanced Filters Section */}
                <AdvancedFilterForm
                  criteria={criteria}
                  onChangeCriteria={handleCriteriaChange}
                  onSubmit={handleExecuteSearch}
                  onReset={handleResetFilters}
                  onClearAll={handleClearAll}
                />
              </div>

              {/* Right Column: Search Summary & Live Expectations */}
              <SearchSummaryPanel
                criteria={criteria}
                estimation={estimation}
              />
            </div>
          )}
        </main>
      </div>

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        criteria={criteria}
        onSave={handleSaveSearch}
      />

      {/* AI Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInvestigateCompany={(comp) => setResearchedCompany(comp)}
      />

      {/* Company Research Modal */}
      <CompanyResearchModal
        companyName={researchedCompany}
        onClose={() => setResearchedCompany(null)}
      />
    </div>
  );
};
