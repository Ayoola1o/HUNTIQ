import React, { useState, useEffect, useCallback } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { OutreachKpiCards } from './OutreachKpiCards';
import { OutreachConversationView } from './OutreachConversationView';
import { NewOutreachModal } from './NewOutreachModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { OutreachItem, OutreachKpiSummary } from '../../types/outreach';
import { 
  fetchOutreachList, 
  sendOutreachMessage as apiSendOutreachMessage, 
  createOutreach as apiCreateOutreach 
} from '../../api/outreach';
import { 
  Send, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { useHuntiq } from '../../context/HuntiqContext';

interface OutreachPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const OutreachPage: React.FC<OutreachPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const { activePitchDraft, clearActivePitchDraft, addDealToPipeline } = useHuntiq();
  const [isNewOutreachModalOpen, setIsNewOutreachModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeKpiFilter, setActiveKpiFilter] = useState('due_today');

  // Auto-open modal when redirected here from a prospect pitch
  useEffect(() => {
    if (activePitchDraft) {
      setIsNewOutreachModalOpen(true);
    }
  }, [activePitchDraft]);

  // Live Conversations & KPI State
  const [conversations, setConversations] = useState<OutreachItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [kpiSummary, setKpiSummary] = useState<OutreachKpiSummary>({
    dueToday: 0,
    scheduled: 0,
    replies: 0,
    needsAttention: 0,
    responseRate: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const loadOutreach = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchOutreachList();
      setConversations(response.conversations || []);
      if (response.kpiSummary) {
        setKpiSummary(response.kpiSummary);
      }
      if (response.conversations?.length > 0 && !activeConversationId) {
        setActiveConversationId(response.conversations[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load outreach from API:', err);
      setErrorMessage(err?.message || 'Unable to connect to live outreach server');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeConversationId]);

  useEffect(() => {
    loadOutreach();
  }, [loadOutreach]);

  const handleSendMessage = async (conversationId: string, text: string) => {
    try {
      const updated = await apiSendOutreachMessage(conversationId, text);
      setConversations(prev => prev.map(c => c.id === conversationId ? updated : c));
      setActionToast('Message dispatched successfully');
      setTimeout(() => setActionToast(null), 3000);
    } catch (err: any) {
      console.error('Failed to send outreach message:', err);
      setActionToast('Failed to send message');
      setTimeout(() => setActionToast(null), 3000);
    }
  };

  const handleCreateOutreach = async (newItemPayload: Partial<OutreachItem>) => {
    try {
      const created = await apiCreateOutreach(newItemPayload);
      setConversations(prev => [created, ...prev]);
      setActiveConversationId(created.id);
      setActionToast(`Pitch dispatched to ${created.contactName}!`);
      setTimeout(() => setActionToast(null), 3500);

      // Auto-push deal to pipeline if pitched from prospect intelligence
      if (activePitchDraft) {
        addDealToPipeline({
          companyName: newItemPayload.companyName || activePitchDraft.companyName,
          domain: newItemPayload.domain || activePitchDraft.domain || '',
          dealTitle: `${activePitchDraft.recommendedPackage || 'Search Modernization'} (${activePitchDraft.companyName})`,
          serviceName: activePitchDraft.recommendedPackage || 'Turnkey SEO Suite',
          dealValue: activePitchDraft.estimatedValue || 18000,
          opportunityScore: activePitchDraft.opportunityScore || 85,
          stage: 'contacted',
          contactName: newItemPayload.contactName || activePitchDraft.contactName || 'Decision Maker',
          contactRole: newItemPayload.contactRole || activePitchDraft.contactRole || 'Managing Director'
        });
        clearActivePitchDraft();
      }

      await loadOutreach(true);
    } catch (err: any) {
      console.error('Failed to start outreach:', err);
      setActionToast('Failed to start outreach');
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
        activeNav="outreach"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto'
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
                  Outreach & Sales Communications
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
                  LIVE INBOX
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Manage prospect conversations, handle replies and accelerate sales follow-ups
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Sync Button */}
            <button
              onClick={() => loadOutreach(true)}
              disabled={isRefreshing}
              title="Sync outreach inbox with live backend"
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
              onClick={() => setIsNewOutreachModalOpen(true)}
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
              <span>+ New Outreach</span>
            </button>
          </div>
        </header>

        {/* Action Toast Banner */}
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
            fontWeight: 600
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
              onClick={() => loadOutreach(true)}
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
          <OutreachKpiCards
            summary={kpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={setActiveKpiFilter}
          />
        </div>

        {/* Split Sales Inbox / Loading State */}
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
              Loading Outreach Conversations...
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              Connecting to live multi-channel communications inbox
            </div>
          </div>
        ) : (
          <OutreachConversationView
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={(c) => setActiveConversationId(c.id)}
            onSendMessage={handleSendMessage}
            onCreateDealFromOutreach={() => {
              onNavigate('pipeline');
            }}
            onScheduleMeetingFromOutreach={() => {
              onNavigate('meetings');
            }}
            onNavigateToResearch={() => {
              onNavigate('research');
            }}
          />
        )}
      </div>

      {/* New Outreach Modal */}
      <NewOutreachModal
        isOpen={isNewOutreachModalOpen}
        onClose={() => {
          setIsNewOutreachModalOpen(false);
          clearActivePitchDraft();
        }}
        onCreateOutreach={handleCreateOutreach}
        initialPayload={activePitchDraft}
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
