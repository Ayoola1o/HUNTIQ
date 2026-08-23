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
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [activeKpiFilter, setActiveKpiFilter] = useState('total');
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>('sig-1');

  // Modals state
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);

  // Mock signals dataset matching signal page.png
  const [signals] = useState<SignalItem[]>([
    {
      id: 'sig-1',
      title: 'Hiring Surge',
      subtitle: '38 new job postings',
      companyName: 'Acme Technologies',
      location: 'Lagos, Nigeria',
      type: 'hiring',
      impactLevel: 'High',
      impactScore: 92,
      detectedTime: '2h ago',
      detectedTimestamp: 'May 16, 2025 • 2:34 PM',
      whyItMatters: 'Rapid hiring across multiple departments indicates growth and need for new solutions.',
      whatHappened: 'Acme Technologies posted 38 new job openings across 7 departments in the last 7 days.',
      source: 'LinkedIn Jobs',
      sourceType: 'linkedin',
      confidence: 'High (92%)',
      firstDetected: 'May 16, 2025',
      lastUpdated: 'May 16, 2025 • 2:34 PM',
      affectedDepartments: [
        { name: 'Engineering', count: 14 },
        { name: 'Product', count: 8 },
        { name: 'Sales', count: 6 },
        { name: 'Marketing', count: 5 },
        { name: 'Operations', count: 5 }
      ],
      recommendedAction: 'Contact the Head of People or COO to discuss how we can support their growth and hiring goals.',
      targetRole: 'Head of People'
    },
    {
      id: 'sig-2',
      title: 'New Office Opened',
      subtitle: 'Lagos Headquarters',
      companyName: 'Acme Technologies',
      location: 'Lagos, Nigeria',
      type: 'expansion',
      impactLevel: 'High',
      impactScore: 88,
      detectedTime: '3h ago',
      detectedTimestamp: 'May 16, 2025 • 1:15 PM',
      whyItMatters: 'Opened a second office in Lagos to support West Africa operations.',
      whatHappened: 'Acme Technologies completed corporate registration for a new enterprise engineering hub.',
      source: 'Company Press Release',
      sourceType: 'globe',
      confidence: 'Very High (96%)',
      firstDetected: 'May 16, 2025',
      lastUpdated: 'May 16, 2025 • 1:15 PM',
      recommendedAction: 'Send congratulatory note on regional expansion and introduce scalable team structure services.',
      targetRole: 'Chief Operating Officer'
    },
    {
      id: 'sig-3',
      title: 'Leadership Change',
      subtitle: 'New COO appointed',
      companyName: 'Acme Technologies',
      location: 'Lagos, Nigeria',
      type: 'leadership',
      impactLevel: 'High',
      impactScore: 90,
      detectedTime: '5h ago',
      detectedTimestamp: 'May 16, 2025 • 11:30 AM',
      whyItMatters: 'New COO with enterprise scaling experience joined the leadership team.',
      whatHappened: 'Former Microsoft regional director appointed as Chief Operating Officer.',
      source: 'TechCabal News',
      sourceType: 'news',
      confidence: 'High (94%)',
      firstDetected: 'May 16, 2025',
      lastUpdated: 'May 16, 2025 • 11:30 AM',
      recommendedAction: 'Engage new COO on executive coaching and leadership alignment during transition.',
      targetRole: 'Chief Operating Officer'
    },
    {
      id: 'sig-4',
      title: 'Funding Raised',
      subtitle: '$12M Series B',
      companyName: 'FinServe Ltd',
      location: 'Lagos, Nigeria',
      type: 'funding',
      impactLevel: 'High',
      impactScore: 94,
      detectedTime: '1d ago',
      detectedTimestamp: 'May 15, 2025 • 4:00 PM',
      whyItMatters: 'Raised $12M Series B to expand product and enter new markets.',
      whatHappened: 'FinServe Ltd secured $12M led by international venture partners to fuel West Africa fintech expansion.',
      source: 'Disrupt Africa',
      sourceType: 'globe',
      confidence: 'Very High (98%)',
      firstDetected: 'May 15, 2025',
      lastUpdated: 'May 15, 2025 • 4:00 PM',
      recommendedAction: 'Schedule briefing with HR Director regarding scaling headcount post-funding.',
      targetRole: 'HR Director'
    },
    {
      id: 'sig-5',
      title: 'Technology Change',
      subtitle: 'Implemented AWS',
      companyName: 'Delta Systems',
      location: 'Abuja, Nigeria',
      type: 'technology',
      impactLevel: 'Medium',
      impactScore: 68,
      detectedTime: '1d ago',
      detectedTimestamp: 'May 15, 2025 • 1:45 PM',
      whyItMatters: 'Migrated core infrastructure to AWS - opportunity for cloud optimization services.',
      whatHappened: 'Detected DNS & cloud architecture switch to Amazon Web Services enterprise tier.',
      source: 'BuiltWith Radar',
      sourceType: 'news',
      confidence: 'Medium (84%)',
      firstDetected: 'May 15, 2025',
      lastUpdated: 'May 15, 2025 • 1:45 PM',
      recommendedAction: 'Provide engineering team training on agile cloud workflows.',
      targetRole: 'CTO'
    },
    {
      id: 'sig-6',
      title: 'Hiring Surge',
      subtitle: '22 new job postings',
      companyName: 'Vertex Solutions',
      location: 'Lagos, Nigeria',
      type: 'hiring',
      impactLevel: 'Medium',
      impactScore: 72,
      detectedTime: '1d ago',
      detectedTimestamp: 'May 15, 2025 • 10:20 AM',
      whyItMatters: 'Hiring engineers and product managers.',
      whatHappened: 'Vertex Solutions opened 22 new technical positions on careers portal.',
      source: 'LinkedIn Jobs',
      sourceType: 'linkedin',
      confidence: 'High (89%)',
      firstDetected: 'May 15, 2025',
      lastUpdated: 'May 15, 2025 • 10:20 AM',
      recommendedAction: 'Offer structured technical recruitment and onboarding frameworks.',
      targetRole: 'VP Talent'
    },
    {
      id: 'sig-7',
      title: 'Industry News',
      subtitle: 'Market expansion',
      companyName: 'Nimbus Analytics',
      location: 'Lagos, Nigeria',
      type: 'news',
      impactLevel: 'Medium',
      impactScore: 65,
      detectedTime: '2d ago',
      detectedTimestamp: 'May 14, 2025 • 3:10 PM',
      whyItMatters: 'Announced entry into 3 new West African countries.',
      whatHappened: 'Nimbus Analytics announced official launch in Ghana, Ivory Coast, and Senegal.',
      source: 'BusinessDay',
      sourceType: 'news',
      confidence: 'Medium (82%)',
      firstDetected: 'May 14, 2025',
      lastUpdated: 'May 14, 2025 • 3:10 PM',
      recommendedAction: 'Connect with Managing Director to discuss multi-country cultural training.',
      targetRole: 'Managing Director'
    },
    {
      id: 'sig-8',
      title: 'Regulatory Change',
      subtitle: 'New data protection law',
      companyName: 'Peak Consulting',
      location: 'Lagos, Nigeria',
      type: 'compliance',
      impactLevel: 'High',
      impactScore: 84,
      detectedTime: '2d ago',
      detectedTimestamp: 'May 14, 2025 • 9:00 AM',
      whyItMatters: 'New data protection law takes effect in July 2025.',
      whatHappened: 'Nigeria Data Protection Act mandatory compliance guidelines released for enterprise services.',
      source: 'NDPC Official Gazette',
      sourceType: 'compliance',
      confidence: 'Very High (100%)',
      firstDetected: 'May 14, 2025',
      lastUpdated: 'May 14, 2025 • 9:00 AM',
      recommendedAction: 'Update internal compliance advisory frameworks for enterprise clients.',
      targetRole: 'Managing Partner'
    }
  ]);

  const selectedSig = signals.find((s) => s.id === selectedSignalId) || signals[0];

  const filteredSignals = signals.filter((sig) => {
    if (activeTypeFilter === 'all') return true;
    return sig.type === activeTypeFilter;
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
        <header style={{
          padding: '16px 32px 14px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          {/* Title & Antenna Icon */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '22px',
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
    </div>
  );
};
