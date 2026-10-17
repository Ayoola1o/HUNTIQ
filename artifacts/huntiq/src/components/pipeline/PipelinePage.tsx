import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  List,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { useHuntiq } from '../../context/HuntiqContext';
import { MobileBottomNav } from '../navigation/MobileBottomNav';
import {
  fetchPipelineDeals,
  createPipelineDeal,
  updatePipelineDeal
} from '../../api/pipeline';

interface PipelinePageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const PipelinePage: React.FC<PipelinePageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [deals, setDeals] = useState<PipelineDealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [selectedDeal, setSelectedDeal] = useState<PipelineDealItem | null>(null);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [initialStageForNew, setInitialStageForNew] = useState<PipelineStage>('contacted');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [viewMode, setViewMode] = useState<PipelineViewMode>('kanban');
  const [quickFilter, setQuickFilter] = useState<PipelineQuickFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState('active_deals');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Live Deals from Backend API
  const loadDeals = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);
    try {
      const data = await fetchPipelineDeals();
      setDeals(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch pipeline deals:', err);
      setIsError(true);
      setErrorMessage(err?.message || 'Unable to connect to live pipeline API');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  // Dynamic KPI Summary calculated from real deals state
  const activeDealsList = useMemo(() => deals.filter(d => d.stage !== 'lost'), [deals]);
  const activeInFlight = useMemo(() => activeDealsList.filter(d => d.stage !== 'won'), [activeDealsList]);
  const pipelineVal = useMemo(() => activeInFlight.reduce((sum, d) => sum + (d.dealValue || 0), 0), [activeInFlight]);
  const expectedRev = useMemo(() => activeInFlight.reduce((sum, d) => sum + Math.round((d.dealValue || 0) * ((d.probability || 50) / 100)), 0), [activeInFlight]);
  const closedDeals = useMemo(() => deals.filter(d => d.stage === 'won' || d.stage === 'lost'), [deals]);
  const wonDeals = useMemo(() => deals.filter(d => d.stage === 'won'), [deals]);
  const dynamicWinRate = closedDeals.length > 0 ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;
  const dynamicAvgDealSize = activeInFlight.length > 0 ? Math.round(pipelineVal / activeInFlight.length) : (deals.length > 0 ? Math.round(pipelineVal / deals.length) : 0);
  const dynamicSalesCycle = deals.length > 0 ? 28 : 0;

  const kpiSummary: PipelineKpiSummary = {
    activeDeals: activeInFlight.length,
    pipelineValue: pipelineVal,
    expectedRevenue: expectedRev,
    winRate: dynamicWinRate,
    avgDealSize: dynamicAvgDealSize,
    avgSalesCycle: dynamicSalesCycle
  };

  // Live Stage Mutation
  const handleMoveDealStage = async (dealId: string, newStage: PipelineStage) => {
    const target = deals.find(d => d.id === dealId);
    if (!target) return;

    const newProb = newStage === 'won' ? 100 : newStage === 'negotiation' ? 75 : newStage === 'proposal' ? 60 : newStage === 'meeting' ? 45 : 25;
    const prevStage = target.stage;
    const prevProb = target.probability;

    // Optimistic update
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
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
    setSelectedDeal(prev => prev && prev.id === dealId ? {
      ...prev,
      stage: newStage,
      probability: newProb,
      stageEnteredAt: 'Just now',
      lastActivity: `Stage updated to ${newStage}`
    } : prev);

    showToast(`Stage updated to ${newStage}`);

    try {
      await updatePipelineDeal(dealId, {
        stage: newStage,
        probability: newProb,
        lastActivity: `Stage updated to ${newStage}`
      });
    } catch (err: any) {
      console.warn('Failed to update deal on backend:', err);
      // Rollback
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: prevStage, probability: prevProb } : d));
      setSelectedDeal(prev => prev && prev.id === dealId ? {
        ...prev,
        stage: prevStage,
        probability: prevProb
      } : prev);
      showToast(err?.message || 'Failed to update deal stage on server');
    }
  };

  // Create Deal via API
  const handleCreateDeal = async (newDeal: PipelineDealItem) => {
    try {
      const created = await createPipelineDeal(newDeal);
      const savedDeal: PipelineDealItem = {
        ...newDeal,
        ...(created || {})
      };
      setDeals(prev => [savedDeal, ...prev]);
      setSelectedDeal(savedDeal);
      showToast(`Deal "${savedDeal.dealTitle}" added to pipeline`);
    } catch (err: any) {
      console.error('Failed to create pipeline deal via API:', err);
      setDeals(prev => [newDeal, ...prev]);
      setSelectedDeal(newDeal);
      showToast('Deal created locally');
    }
  };

  const filteredDeals = deals.filter(d => {
    if (quickFilter === 'at_risk' && !d.isAtRisk) return false;
    if (quickFilter === 'closing_soon' && (d.probability || 0) < 70) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (d.companyName || '').toLowerCase().includes(q) ||
        (d.dealTitle || '').toLowerCase().includes(q) ||
        (d.serviceName || '').toLowerCase().includes(q) ||
        (d.contactName || '').toLowerCase().includes(q)
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
            {/* Live Refresh Button */}
            <button
              onClick={loadDeals}
              disabled={isLoading}
              title="Sync live pipeline deals from API"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Syncing...' : 'Sync Deals'}</span>
            </button>

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

        {/* Error Alert */}
        {isError && (
          <div style={{
            margin: '0 20px 16px 20px',
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontSize: '12px' }}>
              <AlertCircle size={16} />
              <span>{errorMessage || 'Failed to load pipeline deals.'}</span>
            </div>
            <button
              onClick={loadDeals}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #f87171',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#b91c1c',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Clean Empty State Banner if no deals exist */}
        {!isLoading && !isError && deals.length === 0 && (
          <div style={{
            margin: '0 20px 20px 20px',
            backgroundColor: '#ffffff',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '14px',
            padding: '28px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Kanban size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                Your Sales Pipeline is Empty
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', maxWidth: '420px' }}>
                Track enterprise opportunities, move deals across custom stages, and forecast probability-weighted revenue.
              </div>
            </div>
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
                padding: '7px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Plus size={14} />
              <span>Add First Opportunity</span>
            </button>
          </div>
        )}

        {/* Primary Pipeline View (Kanban Board or List View) */}
        {viewMode === 'kanban' ? (
          <PipelineKanbanBoard
            deals={filteredDeals}
            onSelectDeal={(deal) => setSelectedDeal(deal)}
            onMoveDealStage={handleMoveDealStage}
            onQuickAddDeal={(st) => {
              setInitialStageForNew(st);
              setIsNewDealModalOpen(true);
            }}
          />
        ) : (
          <div style={{
            margin: '0 32px 32px 32px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #eaecf0',
            boxShadow: '0 4px 20px -2px rgba(16, 24, 40, 0.04)',
            overflow: 'hidden'
          }}>
            <div className="mobile-table-wrapper">
              <div style={{ minWidth: '850px' }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 1.6fr 1fr 1.2fr 1.2fr 2fr 1.4fr 100px',
                  padding: '12px 20px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #eaecf0',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#64748b'
                }}>
                  <div>Deal & Opportunity</div>
                  <div>Company</div>
                  <div>Value</div>
                  <div>Probability</div>
                  <div>Stage</div>
                  <div>Next Action</div>
                  <div>Contact</div>
                  <div style={{ textAlign: 'right' }}>Action</div>
                </div>

                {/* Table Body */}
                {filteredDeals.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    No deals match the selected criteria.
                  </div>
                ) : (
                  filteredDeals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2.5fr 1.6fr 1fr 1.2fr 1.2fr 2fr 1.4fr 100px',
                        padding: '14px 20px',
                        borderBottom: '1px solid #f1f5f9',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          {deal.dealTitle}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {deal.serviceName}
                        </div>
                      </div>

                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                        {deal.companyName}
                      </div>

                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                        ${deal.dealValue.toLocaleString()}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '40px',
                          height: '6px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${deal.probability}%`,
                            height: '100%',
                            backgroundColor: deal.probability >= 70 ? '#10b981' : deal.probability >= 40 ? '#6366f1' : '#f59e0b'
                          }} />
                        </div>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>
                          {deal.probability}%
                        </span>
                      </div>

                      <div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'capitalize',
                          backgroundColor: deal.stage === 'won' ? '#ecfdf5' : deal.stage === 'lost' ? '#fef2f2' : '#eff6ff',
                          color: deal.stage === 'won' ? '#059669' : deal.stage === 'lost' ? '#dc2626' : '#2563eb',
                          border: `1px solid ${deal.stage === 'won' ? '#a7f3d0' : deal.stage === 'lost' ? '#fecaca' : '#bfdbfe'}`
                        }}>
                          {deal.stage}
                        </span>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                          {deal.nextAction}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                          Due: {deal.nextActionDueDate}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                          {deal.contactName}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                          {deal.contactRole}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDeal(deal);
                          }}
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
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

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile One-Thumb Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
