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
  SlidersHorizontal 
} from 'lucide-react';

interface OpportunitiesPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeKpiFilter, setActiveKpiFilter] = useState('all');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>('opp-1');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [inspectingScoreOpp, setInspectingScoreOpp] = useState<OpportunityItem | null>(null);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);

  // Initial mock dataset matching opp page.png
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([
    {
      id: 'opp-1',
      companyName: 'Acme Technologies',
      avatarLetter: 'A',
      avatarBg: '#dc2626',
      industry: 'Technology',
      employees: '250-500 employees',
      location: 'Lagos, Nigeria',
      score: 94,
      scoreTrend: 'up',
      priority: 'Hot',
      whyNow: 'Hiring 38 new employees + opened a new office + new COO',
      tags: ['Hiring', 'Expansion', 'Leadership'],
      estimatedValue: 35000,
      stage: 'Discovery',
      lastActivity: '2h ago',
      lastActivityType: 'signal',
      website: 'acmetech.com',
      revenue: '$25M - $50M',
      linkedInUrl: 'https://linkedin.com/company/acmetech',
      signals: [
        {
          id: 's-1',
          type: 'hiring',
          title: 'Hiring Surge',
          detail: '38 new job postings',
          timeAgo: '2h ago',
          confidence: 96
        },
        {
          id: 's-2',
          type: 'expansion',
          title: 'New Office',
          detail: 'Lagos, Nigeria',
          timeAgo: '3d ago',
          confidence: 94
        },
        {
          id: 's-3',
          type: 'leadership',
          title: 'Leadership Change',
          detail: 'New COO appointed',
          timeAgo: '5d ago',
          confidence: 92
        }
      ],
      scoreFactors: {
        icpFit: { score: 24, max: 25 },
        buyingIntent: { score: 23, max: 25 },
        triggerEvents: { score: 20, max: 20 },
        decisionMakerAccess: { score: 13, max: 15 },
        companySize: { score: 9, max: 10 },
        engagement: { score: 5, max: 5 }
      },
      bestNextStep: {
        actionText: 'Contact the Head of People to discuss workforce scaling and talent strategy.',
        targetRole: 'Head of People',
        targetName: 'Jane Smith'
      }
    },
    {
      id: 'opp-2',
      companyName: 'FinServe Ltd',
      avatarLetter: 'F',
      avatarBg: '#2563eb',
      industry: 'Financial Services',
      employees: '200-500',
      location: 'Lagos, Nigeria',
      score: 91,
      scoreTrend: 'up',
      priority: 'Hot',
      whyNow: 'Expansion into two new markets + increased funding',
      tags: ['Expansion', 'Funding'],
      estimatedValue: 28000,
      stage: 'Qualification',
      lastActivity: '5h ago',
      lastActivityType: 'stage_change',
      website: 'finserveltd.com',
      revenue: '$15M - $30M',
      linkedInUrl: 'https://linkedin.com/company/finserve',
      signals: [
        {
          id: 's-21',
          type: 'expansion',
          title: 'Market Expansion',
          detail: 'Announced Ghana & Kenya entry',
          timeAgo: '5h ago',
          confidence: 95
        },
        {
          id: 's-22',
          type: 'hiring',
          title: 'Senior Hiring',
          detail: 'Hiring HR Director & 12 Regional Leads',
          timeAgo: '2d ago',
          confidence: 90
        }
      ],
      scoreFactors: {
        icpFit: { score: 23, max: 25 },
        buyingIntent: { score: 22, max: 25 },
        triggerEvents: { score: 19, max: 20 },
        decisionMakerAccess: { score: 14, max: 15 },
        companySize: { score: 8, max: 10 },
        engagement: { score: 5, max: 5 }
      },
      bestNextStep: {
        actionText: 'Reach out to Michael Okoro regarding regional talent onboarding.',
        targetRole: 'HR Director',
        targetName: 'Michael Okoro'
      }
    },
    {
      id: 'opp-3',
      companyName: 'Delta Systems',
      avatarLetter: 'D',
      avatarBg: '#059669',
      industry: 'Software',
      employees: '100-250',
      location: 'Abuja, Nigeria',
      score: 87,
      scoreTrend: 'up',
      priority: 'High',
      whyNow: 'Researching cybersecurity solutions + tech stack modernization',
      tags: ['Technology', 'Intent'],
      estimatedValue: 22500,
      stage: 'Discovery',
      lastActivity: '1d ago',
      lastActivityType: 'signal',
      website: 'deltasystems.ng',
      revenue: '$8M - $18M',
      linkedInUrl: 'https://linkedin.com/company/deltasystems',
      signals: [
        {
          id: 's-31',
          type: 'hiring',
          title: 'Tech Modernization',
          detail: 'Evaluating enterprise training suites',
          timeAgo: '1d ago',
          confidence: 88
        }
      ],
      scoreFactors: {
        icpFit: { score: 22, max: 25 },
        buyingIntent: { score: 21, max: 25 },
        triggerEvents: { score: 18, max: 20 },
        decisionMakerAccess: { score: 13, max: 15 },
        companySize: { score: 9, max: 10 },
        engagement: { score: 4, max: 5 }
      },
      bestNextStep: {
        actionText: 'Send case study on engineering leadership scaling.',
        targetRole: 'CTO / Co-Founder',
        targetName: 'David Jonah'
      }
    },
    {
      id: 'opp-4',
      companyName: 'Vertex Solutions',
      avatarLetter: 'V',
      avatarBg: '#7c3aed',
      industry: 'IT Services',
      employees: '150-300',
      location: 'Lagos, Nigeria',
      score: 78,
      scoreTrend: 'up',
      priority: 'High',
      whyNow: 'Recently raised funding + scaling engineering team',
      tags: ['Funding', 'Hiring'],
      estimatedValue: 18000,
      stage: 'Qualification',
      lastActivity: '1d ago',
      lastActivityType: 'stage_change',
      website: 'vertexsolutions.com',
      revenue: '$10M - $20M',
      linkedInUrl: 'https://linkedin.com/company/vertexsolutions',
      signals: [
        {
          id: 's-41',
          type: 'hiring',
          title: 'Series A Funding',
          detail: 'Closed $6.5M growth round',
          timeAgo: '1d ago',
          confidence: 92
        }
      ],
      scoreFactors: {
        icpFit: { score: 20, max: 25 },
        buyingIntent: { score: 19, max: 25 },
        triggerEvents: { score: 17, max: 20 },
        decisionMakerAccess: { score: 12, max: 15 },
        companySize: { score: 7, max: 10 },
        engagement: { score: 3, max: 5 }
      },
      bestNextStep: {
        actionText: 'Connect on LinkedIn with VP of Operations.',
        targetRole: 'VP Operations',
        targetName: 'Kemi Balogun'
      }
    },
    {
      id: 'opp-5',
      companyName: 'Nimbus Analytics',
      avatarLetter: 'N',
      avatarBg: '#ea580c',
      industry: 'Data & Analytics',
      employees: '100-200',
      location: 'Abuja, Nigeria',
      score: 76,
      scoreTrend: 'up',
      priority: 'Medium',
      whyNow: 'New product launch + growing customer base',
      tags: ['Product Launch', 'Growth'],
      estimatedValue: 15000,
      stage: 'Discovery',
      lastActivity: '2d ago',
      lastActivityType: 'research',
      website: 'nimbusanalytics.io',
      revenue: '$5M - $12M',
      linkedInUrl: 'https://linkedin.com/company/nimbusanalytics',
      signals: [
        {
          id: 's-51',
          type: 'expansion',
          title: 'New Product Launch',
          detail: 'Enterprise AI Suite Rollout',
          timeAgo: '2d ago',
          confidence: 86
        }
      ],
      scoreFactors: {
        icpFit: { score: 19, max: 25 },
        buyingIntent: { score: 18, max: 25 },
        triggerEvents: { score: 16, max: 20 },
        decisionMakerAccess: { score: 12, max: 15 },
        companySize: { score: 7, max: 10 },
        engagement: { score: 4, max: 5 }
      },
      bestNextStep: {
        actionText: 'Offer complimentary org design review.',
        targetRole: 'Managing Director',
        targetName: 'Ibrahim Bello'
      }
    },
    {
      id: 'opp-6',
      companyName: 'Peak Consulting',
      avatarLetter: 'P',
      avatarBg: '#0284c7',
      industry: 'Professional Services',
      employees: '50-100',
      location: 'Lagos, Nigeria',
      score: 62,
      scoreTrend: 'up',
      priority: 'Medium',
      whyNow: 'Leadership transition + process improvement initiative',
      tags: ['Leadership'],
      estimatedValue: 12000,
      stage: 'Nurturing',
      lastActivity: '3d ago',
      lastActivityType: 'signal',
      website: 'peakconsulting.com',
      revenue: '$3M - $8M',
      linkedInUrl: 'https://linkedin.com/company/peakconsulting',
      signals: [
        {
          id: 's-61',
          type: 'leadership',
          title: 'Internal Restructuring',
          detail: 'New division created for enterprise coaching',
          timeAgo: '3d ago',
          confidence: 80
        }
      ],
      scoreFactors: {
        icpFit: { score: 17, max: 25 },
        buyingIntent: { score: 15, max: 25 },
        triggerEvents: { score: 14, max: 20 },
        decisionMakerAccess: { score: 9, max: 15 },
        companySize: { score: 5, max: 10 },
        engagement: { score: 2, max: 5 }
      },
      bestNextStep: {
        actionText: 'Follow up with monthly newsletter sequence.',
        targetRole: 'Partner',
        targetName: 'Sola Peters'
      }
    }
  ]);

  const selectedOpp = opportunities.find((o) => o.id === selectedOpportunityId) || opportunities[0];

  const handleAddOpportunity = (newOppData: Partial<OpportunityItem>) => {
    const newOpp: OpportunityItem = {
      id: `opp-${Date.now()}`,
      companyName: newOppData.companyName || 'New Company',
      avatarLetter: newOppData.avatarLetter || 'N',
      avatarBg: newOppData.avatarBg || '#6366f1',
      industry: newOppData.industry || 'Technology',
      employees: newOppData.employees || '100-250 employees',
      location: newOppData.location || 'Lagos, Nigeria',
      score: newOppData.score || 85,
      scoreTrend: 'up',
      priority: newOppData.priority || 'High',
      whyNow: newOppData.whyNow || 'High timing intent detected.',
      tags: newOppData.tags || ['Inbound'],
      estimatedValue: newOppData.estimatedValue || 25000,
      stage: newOppData.stage || 'Discovery',
      lastActivity: 'Just now',
      lastActivityType: 'stage_change',
      website: newOppData.website || 'example.com',
      revenue: newOppData.revenue || '$10M - $25M',
      linkedInUrl: newOppData.linkedInUrl || '#',
      signals: newOppData.signals || [],
      scoreFactors: newOppData.scoreFactors || {
        icpFit: { score: 22, max: 25 },
        buyingIntent: { score: 20, max: 25 },
        triggerEvents: { score: 18, max: 20 },
        decisionMakerAccess: { score: 12, max: 15 },
        companySize: { score: 9, max: 10 },
        engagement: { score: 4, max: 5 }
      },
      bestNextStep: newOppData.bestNextStep || {
        actionText: 'Reach out to primary decision maker.',
        targetRole: 'Executive',
        targetName: 'Decision Maker'
      }
    };

    setOpportunities((prev) => [newOpp, ...prev]);
    setSelectedOpportunityId(newOpp.id);
  };

  const handleStageChange = (id: string, newStage: OpportunityStage) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, stage: newStage, lastActivity: 'Just now' } : o))
    );
  };

  // Filter opportunities based on active tab
  const filteredOpportunities = opportunities.filter((opp) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'hot') return opp.priority === 'Hot';
    if (activeTab === 'high') return opp.priority === 'High';
    if (activeTab === 'medium') return opp.priority === 'Medium';
    if (activeTab === 'low') return opp.priority === 'Low';
    if (activeTab === 'won') return opp.stage === 'Closed Won';
    if (activeTab === 'lost') return opp.stage === 'Closed Lost';
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
        <header style={{
          padding: '16px 32px 14px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          {/* Title & Star */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                Opportunities
              </h1>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Star size={16} />
              </button>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
              Discover, evaluate and prioritize the best opportunities to win.
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
