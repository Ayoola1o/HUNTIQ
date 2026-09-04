import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { PipelineKpiCards } from './PipelineKpiCards';
import { PipelineKanbanBoard } from './PipelineKanbanBoard';
import { DealDetailModal } from './DealDetailModal';
import { NewDealModal } from './NewDealModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { PipelineDealItem, PipelineKpiSummary, PipelineStage, PipelineViewMode, PipelineQuickFilter } from '../../types/pipeline';
import { 
  Kanban, 
  Sparkles, 
  Search, 
  Plus, 
  List 
} from 'lucide-react';

import { useHuntiq } from '../../context/HuntiqContext';
import { MobileBottomNav } from '../navigation/MobileBottomNav';

interface PipelinePageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const PipelinePage: React.FC<PipelinePageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const { pipelineDeals } = useHuntiq();
  const [selectedDeal, setSelectedDeal] = useState<PipelineDealItem | null>(null);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [initialStageForNew, setInitialStageForNew] = useState<PipelineStage>('contacted');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [viewMode, setViewMode] = useState<PipelineViewMode>('kanban');
  const [quickFilter, setQuickFilter] = useState<PipelineQuickFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState('active_deals');

  // Live Deals Data from Central Store with fallback
  const [deals, setDeals] = useState<PipelineDealItem[]>(() => 
    pipelineDeals && pipelineDeals.length > 0 ? pipelineDeals : [
    {
      id: 'deal-1',
      companyName: 'Acme Technologies',
      domain: 'acmetech.com',
      dealTitle: 'Workforce Scaling & Management Enablement',
      serviceName: 'Workforce Strategy + Leadership Coaching',
      dealValue: 18000,
      probability: 75,
      opportunityScore: 94,
      stage: 'negotiation',
      stageEnteredAt: 'Yesterday',
      expectedCloseDate: 'May 31, 2025',
      ownerName: 'Ayoola Ade',
      contactName: 'Jane Smith',
      contactRole: 'Head of People & Culture',
      contactAvatarBg: '#fbcfe8',
      contactAvatarColor: '#9d174d',
      lastActivity: 'Negotiation call held yesterday',
      nextAction: 'Send revised contract SLA',
      nextActionDueDate: 'Tomorrow',
      priority: 'High',
      activities: [
        { id: 'a1', timestamp: 'Yesterday', type: 'call', title: 'Contract negotiation call', detail: 'Agreed on scope of 3-month regional leadership ramp.' },
        { id: 'a2', timestamp: 'May 14', type: 'proposal_viewed', title: 'Proposal viewed (3 times)', detail: 'Jane Smith and Michael Okoro reviewed pricing section.' }
      ]
    },
    {
      id: 'deal-2',
      companyName: 'Flutterwave',
      domain: 'flutterwave.com',
      dealTitle: 'Cross-Border Compliance Team Enablement',
      serviceName: 'Compliance Leadership Training',
      dealValue: 32000,
      probability: 60,
      opportunityScore: 96,
      stage: 'proposal',
      stageEnteredAt: '2 days ago',
      expectedCloseDate: 'June 15, 2025',
      ownerName: 'Ayoola Ade',
      contactName: 'Oluwaseun Adewale',
      contactRole: 'VP of People Operations',
      contactAvatarBg: '#ede9fe',
      contactAvatarColor: '#5b21b6',
      lastActivity: 'Proposal sent May 15',
      nextAction: 'Follow up on executive review',
      nextActionDueDate: 'In 2 days',
      priority: 'High',
      activities: [
        { id: 'a3', timestamp: 'May 15', type: 'email', title: 'Comprehensive proposal delivered', detail: 'Outlined curriculum for 45 incoming compliance hires.' }
      ]
    },
    {
      id: 'deal-3',
      companyName: 'Paystack',
      domain: 'paystack.com',
      dealTitle: 'Regional Sales Manager Onboarding Framework',
      serviceName: 'Sales Enablement & Coaching',
      dealValue: 24000,
      probability: 50,
      opportunityScore: 92,
      stage: 'meeting',
      stageEnteredAt: 'May 14',
      expectedCloseDate: 'June 20, 2025',
      ownerName: 'Ayoola Ade',
      contactName: 'Bisi Daniels',
      contactRole: 'Head of Sales Enablement',
      contactAvatarBg: '#fef3c7',
      contactAvatarColor: '#b45309',
      lastActivity: 'Demo meeting scheduled',
      nextAction: 'Discovery & capability presentation',
      nextActionDueDate: 'Thursday 2:00 PM',
      priority: 'High',
      activities: [
        { id: 'a4', timestamp: 'May 14', type: 'meeting', title: 'Meeting confirmed', detail: 'Scheduled 30-min discovery call via Google Meet.' }
      ]
    },
    {
      id: 'deal-4',
      companyName: 'CloudNova Technologies',
      domain: 'cloudnova.io',
      dealTitle: 'Engineering Leadership Onboarding Program',
      serviceName: 'Technical Leadership Coaching',
      dealValue: 12500,
      probability: 30,
      opportunityScore: 91,
      stage: 'contacted',
      stageEnteredAt: 'May 16',
      expectedCloseDate: 'July 10, 2025',
      ownerName: 'Ayoola Ade',
      contactName: 'Tunde Bakare',
      contactRole: 'Chief Technology Officer',
      contactAvatarBg: '#dbeafe',
      contactAvatarColor: '#1e40af',
      lastActivity: 'AI Personalized email sent',
      nextAction: 'Follow-up on LinkedIn',
      nextActionDueDate: 'Friday',
      priority: 'Medium',
      activities: [
        { id: 'a5', timestamp: 'May 16', type: 'email', title: 'Cold email delivered', detail: 'Referenced recent 14 engineering hires and AWS migration.' }
      ]
    },
    {
      id: 'deal-5',
      companyName: 'Vertex Solutions',
      domain: 'vertexsolutions.ng',
      dealTitle: 'Executive Succession & Retention Program',
      serviceName: 'Executive Search & Retainer',
      dealValue: 22000,
      probability: 70,
      opportunityScore: 88,
      stage: 'negotiation',
      stageEnteredAt: 'May 12',
      expectedCloseDate: 'May 28, 2025',
      ownerName: 'Ayoola Ade',
      contactName: 'Emeka Nwosu',
      contactRole: 'Managing Director',
      contactAvatarBg: '#ecfdf5',
      contactAvatarColor: '#059669',
      lastActivity: 'Pricing SLA sent',
      nextAction: 'Final sign-off follow up',
      nextActionDueDate: 'Today',
      priority: 'High',
      activities: [
        { id: 'a6', timestamp: 'May 12', type: 'call', title: 'Pricing discussion', detail: 'Negotiated payment terms to 50% upfront, 50% milestone.' }
      ]
    },
    {
      id: 'deal-6',
      companyName: 'Nimbus Analytics',
      domain: 'nimbusanalytics.com',
      dealTitle: 'Commercial Team Training Workshop',
      serviceName: 'Employee Training & Upskilling',
      dealValue: 9500,
      probability: 100,
      opportunityScore: 86,
      stage: 'won',
      stageEnteredAt: 'May 16',
      expectedCloseDate: 'May 16, 2025',
      ownerName: 'Ayoola Ade',
      contactName: 'Kemi Adebayo',
      contactRole: 'Chief Commercial Officer',
      contactAvatarBg: '#fee2e2',
      contactAvatarColor: '#991b1b',
      lastActivity: 'Contract signed & deposit paid',
      nextAction: 'Project kickoff on Monday',
      nextActionDueDate: 'May 19',
      priority: 'Medium',
      activities: [
        { id: 'a7', timestamp: 'May 16', type: 'stage_changed', title: 'Deal marked as Won', detail: 'Full agreement signed. $9,500 contract finalized.' }
      ]
    },
    {
      id: 'deal-7',
      companyName: 'Delta Systems',
      domain: 'deltasystems.com',
      dealTitle: 'HR Digital Transformation Advisory',
      serviceName: 'HR Strategy & Org Design',
      dealValue: 18000,
      probability: 45,
      opportunityScore: 84,
      stage: 'proposal',
      stageEnteredAt: 'May 10',
      expectedCloseDate: 'June 05, 2025',
      ownerName: 'Ayoola Ade',
      contactName: 'David Jonah',
      contactRole: 'COO',
      contactAvatarBg: '#f5f3ff',
      contactAvatarColor: '#6d28d9',
      lastActivity: 'Proposal opened 2 days ago',
      nextAction: 'Re-engage COO via WhatsApp',
      nextActionDueDate: 'Today',
      priority: 'High',
      isAtRisk: true,
      atRiskReason: 'Proposal viewed 4 times but no feedback in 6 days.',
      activities: [
        { id: 'a8', timestamp: 'May 10', type: 'proposal_viewed', title: 'Proposal opened', detail: 'Decision maker opened proposal from Lagos.' }
      ]
    }
  ]);

  // Sync deals from context
  React.useEffect(() => {
    if (pipelineDeals && pipelineDeals.length > 0) {
      setDeals(pipelineDeals);
    }
  }, [pipelineDeals]);

  const activeDealsList = deals.filter(d => d.stage !== 'lost');
  const pipelineVal = activeDealsList.filter(d => d.stage !== 'won').reduce((sum, d) => sum + d.dealValue, 0);
  const expectedRev = activeDealsList.filter(d => d.stage !== 'won').reduce((sum, d) => sum + Math.round(d.dealValue * (d.probability / 100)), 0);

  const kpiSummary: PipelineKpiSummary = {
    activeDeals: activeDealsList.filter(d => d.stage !== 'won').length,
    pipelineValue: pipelineVal,
    expectedRevenue: expectedRev,
    winRate: 24.8,
    avgDealSize: Math.round(pipelineVal / Math.max(1, activeDealsList.filter(d => d.stage !== 'won').length)),
    avgSalesCycle: 31
  };

  const handleMoveDealStage = (dealId: string, newStage: PipelineStage) => {
    setDeals(deals.map(d => {
      if (d.id === dealId) {
        const newProb = newStage === 'won' ? 100 : newStage === 'negotiation' ? 75 : newStage === 'proposal' ? 60 : newStage === 'meeting' ? 45 : 25;
        return {
          ...d,
          stage: newStage,
          probability: newProb,
          stageEnteredAt: 'Just now',
          lastActivity: `Stage updated to ${newStage}`
        };
      }
      return d;
    }));
  };

  const handleCreateDeal = (newDeal: PipelineDealItem) => {
    setDeals([newDeal, ...deals]);
    setSelectedDeal(newDeal);
  };

  const filteredDeals = deals.filter(d => {
    if (quickFilter === 'at_risk' && !d.isAtRisk) return false;
    if (quickFilter === 'closing_soon' && d.probability < 70) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.companyName.toLowerCase().includes(q) ||
        d.dealTitle.toLowerCase().includes(q) ||
        d.serviceName.toLowerCase().includes(q) ||
        d.contactName.toLowerCase().includes(q)
      );
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
      {/* Sidebar */}
      <DashboardSidebar
        activeNav="pipeline"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Content Area */}
      <div 
        className="mobile-bottom-pad"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflowY: 'auto'
        }}
      >
        {/* Top Header */}
        <header 
          className="mobile-header-pad"
          style={{
            minHeight: '62px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #eaecf0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '12px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #dbeafe',
              flexShrink: 0
            }}>
              <Kanban size={16} color="#2563eb" />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Sales Pipeline & Deal Forecasting
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Manage active opportunities, move deals across stages, and forecast revenue
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsCopilotOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f5f3ff',
                border: '1px solid #ddd6fe',
                color: '#6d28d9',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={13} />
              <span>Ask AI Copilot</span>
            </button>

            <button
              onClick={() => {
                setInitialStageForNew('contacted');
                setIsNewDealModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 16px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Plus size={14} />
              <span>+ New Opportunity</span>
            </button>
          </div>
        </header>

        {/* KPI Metrics Row */}
        <div style={{ margin: '20px 0' }}>
          <PipelineKpiCards
            summary={kpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={setActiveKpiFilter}
          />
        </div>

        {/* View Switcher & Filter Bar */}
        <div style={{
          margin: '0 32px 18px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Quick Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[
              { id: 'all', label: 'All Deals', count: deals.length },
              { id: 'my_deals', label: 'My Deals', count: deals.length },
              { id: 'at_risk', label: 'At Risk', count: deals.filter(d => d.isAtRisk).length },
              { id: 'closing_soon', label: 'Closing Soon', count: deals.filter(d => d.probability >= 70).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setQuickFilter(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: quickFilter === tab.id ? '#ffffff' : 'transparent',
                  color: quickFilter === tab.id ? '#4f46e5' : '#64748b',
                  boxShadow: quickFilter === tab.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '10.5px',
                  backgroundColor: quickFilter === tab.id ? '#eff6ff' : '#eaecf0',
                  color: quickFilter === tab.id ? '#2563eb' : '#64748b',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search + View Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #eaecf0',
              borderRadius: '8px',
              padding: '6px 12px',
              width: '260px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search deals, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  fontSize: '12px',
                  color: '#0f172a',
                  width: '100%',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* View Mode Toggle */}
            <div style={{
              display: 'flex',
              backgroundColor: '#ffffff',
              border: '1px solid #eaecf0',
              borderRadius: '8px',
              padding: '2px'
            }}>
              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'kanban' ? '#eff6ff' : 'transparent',
                  color: viewMode === 'kanban' ? '#2563eb' : '#64748b',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Kanban size={13} />
                <span>Kanban</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? '#eff6ff' : 'transparent',
                  color: viewMode === 'list' ? '#2563eb' : '#64748b',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <List size={13} />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Pipeline View (Kanban Board) */}
        <PipelineKanbanBoard
          deals={filteredDeals}
          onSelectDeal={(deal) => setSelectedDeal(deal)}
          onMoveDealStage={handleMoveDealStage}
          onQuickAddDeal={(st) => {
            setInitialStageForNew(st);
            setIsNewDealModalOpen(true);
          }}
        />
      </div>

      {/* Deal Detail Modal */}
      <DealDetailModal
        deal={selectedDeal}
        isOpen={Boolean(selectedDeal)}
        onClose={() => setSelectedDeal(null)}
        onUpdateStage={handleMoveDealStage}
        onNavigateToResearch={() => {
          setSelectedDeal(null);
          onNavigate('research');
        }}
        onNavigateToOutreach={() => {
          setSelectedDeal(null);
          onNavigate('campaigns');
        }}
      />

      {/* New Deal Creation Modal */}
      <NewDealModal
        isOpen={isNewDealModalOpen}
        initialStage={initialStageForNew}
        onClose={() => setIsNewDealModalOpen(false)}
        onCreateDeal={handleCreateDeal}
      />

      {/* AI Copilot Modal */}
      <AiCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onInvestigateCompany={() => {
          setIsCopilotOpen(false);
          onNavigate('research');
        }}
      />

      {/* Mobile One-Thumb Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
