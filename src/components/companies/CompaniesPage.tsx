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

interface CompaniesPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const CompaniesPage: React.FC<CompaniesPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const { companies: dynamicCompanies } = useHuntiq();
  const [activeTab, setActiveTab] = useState('all');
  const [activeKpiFilter, setActiveKpiFilter] = useState('total');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>('comp-1');

  // Modals state
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);
  const [listModalCompany, setListModalCompany] = useState<CompanyItem | null>(null);
  const [scoreBreakdownTarget, setScoreBreakdownTarget] = useState<OpportunityItem | null>(null);

  // Live dataset from Huntiq engine with fallback
  const [companies, setCompanies] = useState<CompanyItem[]>(() => 
    dynamicCompanies && dynamicCompanies.length > 0 ? dynamicCompanies : [
    {
      id: 'comp-1',
      name: 'Acme Technologies',
      domain: 'acmetech.com',
      logoBg: '#ef4444',
      logoColor: '#ffffff',
      logoInitial: 'A',
      industry: 'Technology',
      employees: '250 – 500',
      revenue: '$25M – $50M',
      location: 'Lagos, Nigeria',
      opportunityScore: 94,
      opportunityLevel: 'Very High',
      scoreColor: '#059669',
      scoreTrend: [74, 82, 86, 91, 94],
      isSaved: false,
      signalsCount: 6,
      activeSignals: [
        {
          type: 'hiring',
          title: 'Hiring Surge',
          description: '38 new job postings',
          time: '2h ago',
          iconType: 'hiring'
        },
        {
          type: 'expansion',
          title: 'Expansion',
          description: 'Opened new office in Lagos',
          time: '1d ago',
          iconType: 'expansion'
        },
        {
          type: 'leadership',
          title: 'Leadership Change',
          description: 'New COO appointed',
          time: '3d ago',
          iconType: 'leadership'
        },
        {
          type: 'technology',
          title: 'Technology Change',
          description: 'Migrating to AWS cloud',
          time: '5d ago',
          iconType: 'technology'
        }
      ],
      lastActivity: '2h ago',
      description: 'Acme Technologies provides innovative software solutions and digital transformation services to businesses across Africa.',
      founded: '2016',
      headquarters: 'Lagos, Nigeria',
      socials: {
        linkedin: 'https://linkedin.com/company/acme-technologies',
        twitter: 'https://twitter.com/acmetech',
        facebook: 'https://facebook.com/acmetech'
      }
    },
    {
      id: 'comp-2',
      name: 'FinServe Ltd',
      domain: 'finserve.com',
      logoBg: '#2563eb',
      logoColor: '#ffffff',
      logoInitial: 'F',
      industry: 'Financial Services',
      employees: '200 – 500',
      revenue: '$10M – $25M',
      location: 'Lagos, Nigeria',
      opportunityScore: 91,
      opportunityLevel: 'Very High',
      scoreColor: '#059669',
      scoreTrend: [68, 76, 84, 89, 91],
      isSaved: true,
      signalsCount: 5,
      activeSignals: [
        {
          type: 'funding',
          title: 'Funding Raised',
          description: '$12M Series B closed',
          time: '1d ago',
          iconType: 'funding'
        },
        {
          type: 'expansion',
          title: 'Regional Expansion',
          description: 'Launched in Kenya & Ghana',
          time: '2d ago',
          iconType: 'expansion'
        }
      ],
      lastActivity: '5h ago',
      description: 'FinServe Ltd is a premier fintech infrastructure platform enabling seamless payment switching across West Africa.',
      founded: '2019',
      headquarters: 'Lagos, Nigeria',
      socials: {
        linkedin: 'https://linkedin.com/company/finserve',
        twitter: 'https://twitter.com/finserve'
      }
    },
    {
      id: 'comp-3',
      name: 'Delta Systems',
      domain: 'deltasystems.ng',
      logoBg: '#10b981',
      logoColor: '#ffffff',
      logoInitial: 'D',
      industry: 'Software',
      employees: '100 – 250',
      revenue: '$5M – $10M',
      location: 'Abuja, Nigeria',
      opportunityScore: 87,
      opportunityLevel: 'High',
      scoreColor: '#059669',
      scoreTrend: [65, 72, 79, 83, 87],
      isSaved: false,
      signalsCount: 4,
      activeSignals: [
        {
          type: 'technology',
          title: 'Technology Modernization',
          description: 'Migrated infrastructure to AWS',
          time: '1d ago',
          iconType: 'technology'
        },
        {
          type: 'leadership',
          title: 'New VP Engineering',
          description: 'Hired senior tech leader from UK',
          time: '4d ago',
          iconType: 'leadership'
        }
      ],
      lastActivity: '1d ago',
      description: 'Enterprise ERP and cloud business process automation software built for public and private institutions.',
      founded: '2015',
      headquarters: 'Abuja, Nigeria',
      socials: {
        linkedin: 'https://linkedin.com/company/deltasystems'
      }
    },
    {
      id: 'comp-4',
      name: 'Vertex Solutions',
      domain: 'vertexsol.com',
      logoBg: '#8b5cf6',
      logoColor: '#ffffff',
      logoInitial: 'V',
      industry: 'IT Services',
      employees: '150 – 300',
      revenue: '$10M – $25M',
      location: 'Lagos, Nigeria',
      opportunityScore: 78,
      opportunityLevel: 'High',
      scoreColor: '#059669',
      scoreTrend: [60, 68, 72, 75, 78],
      isSaved: false,
      signalsCount: 5,
      activeSignals: [
        {
          type: 'hiring',
          title: 'Hiring Surge',
          description: '22 technical openings posted',
          time: '1d ago',
          iconType: 'hiring'
        }
      ],
      lastActivity: '1d ago',
      description: 'Vertex Solutions provides outsourced IT management, cybersecurity compliance, and cloud architecture.',
      founded: '2017',
      headquarters: 'Lagos, Nigeria',
      socials: {
        linkedin: 'https://linkedin.com/company/vertexsolutions'
      }
    },
    {
      id: 'comp-5',
      name: 'Nimbus Analytics',
      domain: 'nimbusanalytics.com',
      logoBg: '#ea580c',
      logoColor: '#ffffff',
      logoInitial: 'N',
      industry: 'Data & Analytics',
      employees: '100 – 200',
      revenue: '$5M – $10M',
      location: 'Lagos, Nigeria',
      opportunityScore: 76,
      opportunityLevel: 'High',
      scoreColor: '#d97706',
      scoreTrend: [58, 64, 70, 73, 76],
      isSaved: false,
      signalsCount: 4,
      activeSignals: [
        {
          type: 'expansion',
          title: 'Market Entry',
          description: 'Announced launch in 3 countries',
          time: '2d ago',
          iconType: 'expansion'
        }
      ],
      lastActivity: '2d ago',
      description: 'Business intelligence and customer telemetry analytics for high-volume retail and logistics companies.',
      founded: '2020',
      headquarters: 'Lagos, Nigeria',
      socials: {
        linkedin: 'https://linkedin.com/company/nimbusanalytics'
      }
    },
    {
      id: 'comp-6',
      name: 'Peak Consulting',
      domain: 'peakconsulting.com',
      logoBg: '#2563eb',
      logoColor: '#ffffff',
      logoInitial: 'P',
      industry: 'Professional Services',
      employees: '50 – 100',
      revenue: '$3M – $5M',
      location: 'Lagos, Nigeria',
      opportunityScore: 62,
      opportunityLevel: 'Medium',
      scoreColor: '#d97706',
      scoreTrend: [50, 54, 58, 60, 62],
      isSaved: false,
      signalsCount: 4,
      activeSignals: [
        {
          type: 'compliance',
          title: 'Regulatory Change',
          description: 'New data protection advisory',
          time: '2d ago',
          iconType: 'compliance'
        }
      ],
      lastActivity: '2d ago',
      description: 'Boutique management advisory focused on enterprise human capital strategy and organizational redesign.',
      founded: '2018',
      headquarters: 'Lagos, Nigeria',
      socials: {
        linkedin: 'https://linkedin.com/company/peakconsulting'
      }
    },
    {
      id: 'comp-7',
      name: 'Nova HealthTech',
      domain: 'novahealthtech.com',
      logoBg: '#ef4444',
      logoColor: '#ffffff',
      logoInitial: 'N',
      industry: 'Healthcare',
      employees: '50 – 100',
      revenue: '$3M – $5M',
      location: 'Abuja, Nigeria',
      opportunityScore: 58,
      opportunityLevel: 'Medium',
      scoreColor: '#d97706',
      scoreTrend: [45, 49, 52, 55, 58],
      isSaved: false,
      signalsCount: 3,
      activeSignals: [
        {
          type: 'news',
          title: 'Partnership Announcement',
          description: 'Partnered with federal hospitals',
          time: '3d ago',
          iconType: 'news'
        }
      ],
      lastActivity: '3d ago',
      description: 'Telemedicine and health records interoperability software connecting patients with specialized medical care.',
      founded: '2021',
      headquarters: 'Abuja, Nigeria',
      socials: {
        linkedin: 'https://linkedin.com/company/novahealthtech'
      }
    },
    {
      id: 'comp-8',
      name: 'Bluechip Industries',
      domain: 'bluechipind.com',
      logoBg: '#06b6d4',
      logoColor: '#ffffff',
      logoInitial: 'B',
      industry: 'Manufacturing',
      employees: '500 – 1,000',
      revenue: '$50M – $100M',
      location: 'Port Harcourt, Nigeria',
      opportunityScore: 53,
      opportunityLevel: 'Medium',
      scoreColor: '#d97706',
      scoreTrend: [42, 45, 48, 50, 53],
      isSaved: false,
      signalsCount: 3,
      activeSignals: [
        {
          type: 'expansion',
          title: 'Plant Expansion',
          description: 'Commissioned automated packaging unit',
          time: '3d ago',
          iconType: 'expansion'
        }
      ],
      lastActivity: '3d ago',
      description: 'Large-scale industrial manufacturer of packaging goods, consumer materials, and chemical processing solutions.',
      founded: '2008',
      headquarters: 'Port Harcourt, Nigeria',
      socials: {
        linkedin: 'https://linkedin.com/company/bluechipindustries'
      }
    }
  ]);

  const selectedComp = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const handleToggleSave = (companyId: string) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, isSaved: !c.isSaved } : c
      )
    );
  };

  const filteredCompanies = companies.filter((c) => {
    if (activeTab === 'high-opportunity') return c.opportunityScore >= 80;
    if (activeTab === 'recently-added') return c.lastActivity.includes('h ago') || c.lastActivity.includes('1d ago');
    if (activeTab === 'saved') return c.isSaved;
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
          {/* Title */}
          <div>
            <h1 style={{
              fontSize: '22px',
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
        <main style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '20px 0 36px'
        }}>
          {/* 6 Top Summary KPI Cards */}
          <CompaniesKpiCards
            activeFilter={activeKpiFilter}
            onSelectKpi={(f) => setActiveKpiFilter(f)}
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
          <CompanyAnalytics />
        </main>
      </div>

      {/* Modals */}
      <AddToListModal
        isOpen={!!listModalCompany}
        onClose={() => setListModalCompany(null)}
        company={listModalCompany}
        onSave={(_list) => {}}
      />

      <ScoreBreakdownModal
        opp={scoreBreakdownTarget}
        onClose={() => setScoreBreakdownTarget(null)}
      />

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
    </div>
  );
};
