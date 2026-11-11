import React, { useState, useEffect, useCallback } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { OutreachKpiCards } from './OutreachKpiCards';
import { OutreachConversationView } from './OutreachConversationView';
import { NewOutreachModal } from './NewOutreachModal';
import { GmailConnectionBadge } from './GmailConnectionBadge';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { OutreachItem, OutreachKpiSummary } from '../../types/outreach';
import { 
  fetchOutreachList, 
  sendOutreachMessage as apiSendOutreachMessage, 
  createOutreach as apiCreateOutreach,
  syncGmailInbox, fetchUnmatchedEmails, linkUnmatchedEmail, type UnmatchedInboundEmail
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

  // Handle Google OAuth callback feedback in URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const googleAuth = url.searchParams.get('google_auth');
    const email = url.searchParams.get('email');
    const reason = url.searchParams.get('reason');

    if (googleAuth === 'success') {
      setActionToast(`🎉 Google Gmail account connected successfully${email ? ` (${email})` : ''}!`);
      setTimeout(() => setActionToast(null), 5000);
      url.searchParams.delete('google_auth');
      url.searchParams.delete('email');
      window.history.replaceState({}, '', url.toString());
    } else if (googleAuth === 'error') {
      setErrorMessage(`Google OAuth error: ${reason || 'Authorization was cancelled or failed'}`);
      setTimeout(() => setErrorMessage(null), 6000);
      url.searchParams.delete('google_auth');
      url.searchParams.delete('reason');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

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
  const [unmatchedEmails, setUnmatchedEmails] = useState<UnmatchedInboundEmail[]>([]);
  const [unmatchedTargets, setUnmatchedTargets] = useState<Record<string, string>>({});

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

  const syncInbox = async () => {
    setIsRefreshing(true); setErrorMessage(null);
    try {
      const result = await syncGmailInbox();
      if (!result.success) throw new Error(result.error || 'Gmail inbox sync failed.');
      await loadOutreach(true);
      setUnmatchedEmails(await fetchUnmatchedEmails());
      setActionToast(`Inbox synced: ${result.repliesCount} matched reply(ies), ${result.processedCount} new message(s).`);
    } catch (error: any) { setErrorMessage(error?.message || 'Gmail inbox sync failed.'); }
    finally { setIsRefreshing(false); }
  };

  useEffect(() => { void fetchUnmatchedEmails().then(setUnmatchedEmails).catch(() => undefined); }, []);

  const handleSendMessage = async (conversationId: string, text: string, requestId: string) => {
    try {
      const updated = await apiSendOutreachMessage(conversationId, text, 'email', requestId);
      setConversations(prev => prev.map(c => c.id === conversationId ? updated : c));
      setActionToast(updated.channel === 'email' ? 'Gmail accepted the message.' : 'Message logged in Outreach.');
      setTimeout(() => setActionToast(null), 3000);
    } catch (err: any) {
      console.error('Failed to send outreach message:', err);
      setActionToast(err?.message || 'Failed to send message');
      setTimeout(() => setActionToast(null), 3000);
      throw err;
    }
  };

  const handleCreateOutreach = async (newItemPayload: Partial<OutreachItem>) => {
    try {
      const created = await apiCreateOutreach(newItemPayload);
      setConversations(prev => [created, ...prev]);
      setActiveConversationId(created.id);
      setActionToast(created.channel === 'email' ? `Gmail accepted the message for ${created.contactName}.` : 'Message logged in Outreach.');
      setTimeout(() => setActionToast(null), 3500);

      // Auto-push deal to pipeline if pitched from prospect intelligence
      if (activePitchDraft && !activePitchDraft.fromCopilot) {
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
      setActionToast(err?.message || 'Failed to start outreach');
      setTimeout(() => setActionToast(null), 3000);
      throw err;
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
            {/* Gmail OAuth Integration Badge */}
            <GmailConnectionBadge />

            {/* Sync Button */}
            <button
              onClick={syncInbox}
              disabled={isRefreshing}
              title="Sync Gmail inbox and refresh Outreach conversations"
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

        {unmatchedEmails.length > 0 && <section style={{ margin: '14px 32px 0', padding: 16, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10 }}>
          <strong style={{ fontSize: 13 }}>Unmatched inbox · {unmatchedEmails.length}</strong>
          <p style={{ fontSize: 12, color: '#7c2d12' }}>These replies could not be matched confidently. Review the full message and choose a conversation only when the sender matches.</p>
          {unmatchedEmails.map(message => {
            const senderMatches = conversations.filter(item => item.channel === 'email' && item.email?.toLowerCase() === message.sender_email?.toLowerCase());
            const selectedThreadId = unmatchedTargets[message.id] || (senderMatches.length === 1 ? senderMatches[0].id : '');
            return <article key={message.id} style={{ padding: 12, marginTop: 8, background: '#fff', borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{message.sender_name || message.sender_email} · {message.sender_email} · {message.subject}</div>
            <pre style={{ whiteSpace: 'pre-wrap', font: 'inherit', fontSize: 12 }}>{message.body_text}</pre>
            <select value={selectedThreadId} onChange={e => setUnmatchedTargets(current => ({ ...current, [message.id]: e.target.value }))} style={{ maxWidth: '100%', padding: 6, marginRight: 8 }}>
              <option value="">{senderMatches.length ? 'Choose conversation to link' : 'No conversation for this sender'}</option>
              {senderMatches.map(item => <option key={item.id} value={item.id}>{item.contactName} · {item.companyName}</option>)}
              {senderMatches.length === 0 && conversations.filter(item => item.channel === 'email').map(item => <option key={item.id} value={item.id}>{item.contactName} · {item.email} · {item.companyName}</option>)}
            </select>
            <button disabled={!selectedThreadId} onClick={async () => {
              try { await linkUnmatchedEmail(message.id, selectedThreadId); setUnmatchedEmails(await fetchUnmatchedEmails()); await loadOutreach(true); }
              catch (error: any) { setErrorMessage(error?.message || 'Could not link reply.'); }
            }} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', cursor: selectedThreadId ? 'pointer' : 'not-allowed' }}>Link reviewed message</button>
          </article>;})}
        </section>}

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
