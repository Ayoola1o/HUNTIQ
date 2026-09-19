import React, { useState, useEffect, useCallback } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { CampaignKpiCards } from './CampaignKpiCards';
import { CampaignsTable } from './CampaignsTable';
import { CampaignDetailModal } from './CampaignDetailModal';
import { CreateCampaignModal } from './CreateCampaignModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { CampaignItem, CampaignKpiSummary } from '../../types/campaign';
import { 
  fetchCampaigns, 
  createCampaign as apiCreateCampaign, 
  toggleCampaignStatus as apiToggleCampaignStatus 
} from '../../api/campaigns';
import { 
  Send, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

interface CampaignsPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeKpiFilter, setActiveKpiFilter] = useState('active_campaigns');

  // Live API State
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [kpiSummary, setKpiSummary] = useState<CampaignKpiSummary>({
    activeCampaigns: 0,
    totalAudience: 0,
    totalReplies: 0,
    opportunitiesCreated: 0,
    pipelineGenerated: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const loadCampaigns = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchCampaigns();
      setCampaigns(response.campaigns || []);
      if (response.kpiSummary) {
        setKpiSummary(response.kpiSummary);
      }
    } catch (err: any) {
      console.error('Failed to load campaigns from API:', err);
      setErrorMessage(err?.message || 'Unable to connect to live outreach engine');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleToggleStatus = async (campId: string) => {
    try {
      const updated = await apiToggleCampaignStatus(campId);
      setCampaigns(prev => prev.map(c => c.id === campId ? updated : c));
      
      // Update selected campaign if currently inspecting
      if (selectedCampaign?.id === campId) {
        setSelectedCampaign(updated);
      }

      setActionToast(`Campaign status updated to ${updated.status.toUpperCase()}`);
      setTimeout(() => setActionToast(null), 3500);

      // Re-calculate KPI metrics
      const activeCount = campaigns.filter(c => c.id === campId ? updated.status === 'active' : c.status === 'active').length;
      setKpiSummary(prev => ({ ...prev, activeCampaigns: activeCount }));
    } catch (err: any) {
      console.error('Failed to toggle campaign status:', err);
      setActionToast('Failed to update campaign status');
      setTimeout(() => setActionToast(null), 3000);
    }
  };

  const handleCreateCampaign = async (newCampPayload: Partial<CampaignItem>) => {
    try {
      const created = await apiCreateCampaign(newCampPayload);
      setCampaigns(prev => [created, ...prev]);
      setSelectedCampaign(created);
      setActionToast(`Campaign "${created.name}" launched with ${created.sequence.length}-step sequence!`);
      setTimeout(() => setActionToast(null), 4000);
      await loadCampaigns(true);
    } catch (err: any) {
      console.error('Failed to create campaign via API:', err);
      setActionToast('Failed to create campaign');
      setTimeout(() => setActionToast(null), 3000);
    }
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
      {/* Sidebar */}
      <DashboardSidebar
        activeNav="campaigns"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
        paddingBottom: '40px'
      }}>
        {/* Top Header */}
        <header style={{
          height: '62px',
          minHeight: '62px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #dbeafe'
            }}>
              <Send size={16} color="#2563eb" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Outreach Campaigns & Sequences
                </h1>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  LIVE ENGINE ACTIVE
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Signal-driven multi-channel sequences generated automatically from live market momentum
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Refresh Button */}
            <button
              onClick={() => loadCampaigns(true)}
              disabled={isRefreshing}
              title="Refresh campaign metrics and live dispatches"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#475569',
                cursor: isRefreshing ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
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
              onClick={() => setIsCreateModalOpen(true)}
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
              <span>+ Create Campaign</span>
            </button>
          </div>
        </header>

        {/* Action / Sync Toast Banner */}
        {actionToast && (
          <div style={{
            margin: '12px 32px 0',
            padding: '10px 16px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#065f46',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-in-out'
          }}>
            <CheckCircle2 size={15} color="#059669" />
            <span>{actionToast}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div style={{
            margin: '12px 32px 0',
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#991b1b',
            fontWeight: 600
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#dc2626" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => loadCampaigns(true)}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* KPI Metrics Row */}
        <div style={{ margin: '20px 0' }}>
          <CampaignKpiCards
            summary={kpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={setActiveKpiFilter}
          />
        </div>

        {/* Campaigns Table / Loading State */}
        {isLoading ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #eaecf0',
            margin: '0 32px',
            padding: '60px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <Loader2 size={32} color="#4f46e5" className="animate-spin" />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Loading Outreach Campaigns...
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              Synchronizing multi-channel sequence performance and response analytics
            </div>
          </div>
        ) : (
          <CampaignsTable
            campaigns={campaigns}
            selectedCampaignId={selectedCampaign?.id || null}
            onSelectCampaign={(c) => setSelectedCampaign(c)}
            onToggleStatus={handleToggleStatus}
            onCreateCampaign={() => setIsCreateModalOpen(true)}
          />
        )}
      </div>

      {/* Campaign Detail Modal */}
      <CampaignDetailModal
        campaign={selectedCampaign}
        isOpen={Boolean(selectedCampaign)}
        onClose={() => setSelectedCampaign(null)}
        onNavigateToPipeline={() => {
          setSelectedCampaign(null);
          onNavigate('pipeline');
        }}
      />

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCampaign={handleCreateCampaign}
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
    </div>
  );
};
