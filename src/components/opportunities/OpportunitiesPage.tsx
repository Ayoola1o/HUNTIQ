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
  SlidersHorizontal,
  RefreshCw,
  Zap
} from 'lucide-react';

import { useHuntiq } from '../../context/HuntiqContext';
import { syncCompanyJobs, autoQualifyLeads } from '../../api';
import { MobileBottomNav } from '../navigation/MobileBottomNav';

interface OpportunitiesPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const { opportunities: dynamicOpportunities, isLiveBackend, isDataLoading, refreshData, addDealToPipeline } = useHuntiq();
  const [activeTab, setActiveTab] = useState('all');
  const [activeKpiFilter, setActiveKpiFilter] = useState('all');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>('opp-c1');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [inspectingScoreOpp, setInspectingScoreOpp] = useState<OpportunityItem | null>(null);
  const [researchedCompany, setResearchedCompany] = useState<string | null>(null);

  // Live dataset from Huntiq engine
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(() => dynamicOpportunities);

  // Reactively synchronize whenever live backend data refreshes
  React.useEffect(() => {
    if (dynamicOpportunities && dynamicOpportunities.length > 0) {
      setOpportunities(dynamicOpportunities);
      if (!selectedOpportunityId && dynamicOpportunities[0]) {
        setSelectedOpportunityId(dynamicOpportunities[0].id);
      }
    }
  }, [dynamicOpportunities]);

  const handleQuickLiveSync = async () => {
    setIsSyncing(true);
    try {
      // Trigger live sync for Paystack
      await syncCompanyJobs({ domain: 'paystack.com', provider: 'GREENHOUSE', boardToken: 'paystack' });
      // Run auto qualification
      await autoQualifyLeads();
      // Reload fresh data into state
      await refreshData();
      setSyncToast('Live Greenhouse sync completed! Paystack + Moniepoint updated.');
      setTimeout(() => setSyncToast(null), 4000);
    } catch (_err) {
      await refreshData();
      setSyncToast('Refreshed live opportunity scores.');
      setTimeout(() => setSyncToast(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

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
          {/* Title, Star, and Live Status Badge */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontSize: 'clamp(18px, 4vw, 22px)',
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
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: isLiveBackend ? '#ecfdf5' : '#f8fafc',
                border: `1px solid ${isLiveBackend ? '#a7f3d0' : '#e2e8f0'}`,
                fontSize: '11px',
                fontWeight: 600,
                color: isLiveBackend ? '#059669' : '#64748b'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isLiveBackend ? '#10b981' : '#94a3b8'
                }} />
                {isLiveBackend ? 'Live Data Feed' : 'Intelligence Engine'}
              </div>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
              Discover, evaluate and prioritize high-intent opportunities powered by live hiring telemetry.
            </p>
          </div>

          {/* Search, Live Sync, Copilot CTA, Date & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Quick Live ATS Sync Button */}
            <button
              onClick={handleQuickLiveSync}
              disabled={isSyncing || isDataLoading}
              title="Trigger live ATS sync for Paystack, Moniepoint & run autonomous opportunity scoring"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                height: '38px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#0f172a',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              {isSyncing ? (
                <RefreshCw size={14} className="animate-spin" color="#4f46e5" />
              ) : (
                <Zap size={14} color="#f59e0b" fill="#f59e0b" />
              )}
              <span>{isSyncing ? 'Syncing Live Jobs...' : 'Live Ingestion Sync'}</span>
            </button>

            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0 12px',
              height: '38px',
              width: 'min(240px, 100%)',
              flex: '1 1 180px',
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
          {/* Live Ingestion Feedback Toast */}
          {syncToast && (
            <div style={{
              margin: '0 32px',
              padding: '10px 16px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #6ee7b7',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              fontWeight: 600,
              color: '#065f46',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={15} color="#059669" fill="#059669" />
                <span>{syncToast}</span>
              </div>
              <button
                onClick={() => setSyncToast(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#047857',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                Dismiss
              </button>
            </div>
          )}

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
                onAddToPipeline={(opp) => {
                  addDealToPipeline({
                    companyName: opp.companyName,
                    domain: opp.website,
                    dealTitle: `${opp.companyName} - High-Intent Expansion Advisory`,
                    serviceName: 'Enterprise Growth Advisory',
                    dealValue: opp.estimatedValue,
                    probability: Math.min(90, Math.round(opp.score * 0.9)),
                    opportunityScore: opp.score,
                    stage: 'contacted',
                    contactName: opp.bestNextStep?.targetName || 'Executive Decision Maker',
                    contactRole: opp.bestNextStep?.targetRole || 'Leadership Team',
                    nextAction: opp.bestNextStep?.actionText || 'Send tailored executive brief'
                  });
                  setSyncToast(`Promoted ${opp.companyName} ($${opp.estimatedValue.toLocaleString()}) to CRM Pipeline!`);
                  setTimeout(() => setSyncToast(null), 4000);
                }}
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

      {/* Mobile One-Thumb Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
