import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { AiSearchInput } from './AiSearchInput';
import { QuickStartTemplates } from './QuickStartTemplates';
import { AdvancedFilterForm } from './AdvancedFilterForm';
import { SearchSummaryPanel } from './SearchSummaryPanel';
import { SaveSearchModal } from './SaveSearchModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import { CompanyResearchModal } from '../dashboard/CompanyResearchModal';
import type { SearchCriteria, QuickTemplate, SearchEstimation } from '../../types/prospectHunter';
import { 
  Sparkles, 
  Search, 
  Bell, 
  Calendar, 
  Bookmark
} from 'lucide-react';

interface FindProspectsPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const FindProspectsPage: React.FC<FindProspectsPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'advanced'>('ai');

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

  // Modals state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);

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
    // Navigate directly to opportunities / search results
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
        overflow: 'hidden'
      }}>
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
              width: '280px',
              gap: '8px'
            }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search companies, people, signals..."
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  width: '100%'
                }}
              />
              <span style={{
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

            {/* Save Search Button */}
            <button
              onClick={() => setIsSaveModalOpen(true)}
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
              <Bookmark size={14} color="#64748b" />
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
          {/* Top Tab Selector: AI Prospect Search vs Advanced Search */}
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
          </div>

          {/* 2-Column Main Form + Summary Grid */}
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
        </main>
      </div>

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        criteria={criteria}
        onSave={(_name, _auto) => {}}
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
