import React, { useState, useEffect, useCallback } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { MeetingsKpiCards } from './MeetingsKpiCards';
import { MeetingsList } from './MeetingsList';
import { MeetingDetailModal } from './MeetingDetailModal';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { MeetingItem, MeetingsKpiSummary } from '../../types/meetings';
import { 
  fetchMeetings, 
  scheduleMeeting as apiScheduleMeeting 
} from '../../api/meetings';
import { 
  Calendar, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

interface MeetingsPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const MeetingsPage: React.FC<MeetingsPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeKpiFilter, setActiveKpiFilter] = useState('upcoming');

  // Live API State
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [kpiSummary, setKpiSummary] = useState<MeetingsKpiSummary>({
    upcomingMeetings: 0,
    todayCount: 0,
    completedThisMonth: 0,
    bookedFromOutreach: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const loadMeetings = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchMeetings();
      setMeetings(response.meetings || []);
      if (response.kpiSummary) {
        setKpiSummary(response.kpiSummary);
      }
    } catch (err: any) {
      console.error('Failed to load meetings from API:', err);
      setErrorMessage(err?.message || 'Unable to connect to live meetings server');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const handleScheduleMeeting = async (newMeetingPayload: Partial<MeetingItem>) => {
    try {
      const created = await apiScheduleMeeting(newMeetingPayload);
      setMeetings(prev => [created, ...prev]);
      setSelectedMeeting(created);
      setActionToast(`Meeting "${created.title}" scheduled! AI brief ready.`);
      setTimeout(() => setActionToast(null), 3500);
      await loadMeetings(true);
    } catch (err: any) {
      console.error('Failed to schedule meeting via API:', err);
      setActionToast('Failed to schedule meeting');
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
        activeNav="meetings"
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
              <Calendar size={16} color="#2563eb" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Sales Meetings & AI Call Briefs
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
                  SYNCED
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Review scheduled demos, leverage AI pre-call briefs, and move deals across pipeline
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Sync Button */}
            <button
              onClick={() => loadMeetings(true)}
              disabled={isRefreshing}
              title="Sync meetings with live backend"
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
              onClick={() => setIsScheduleModalOpen(true)}
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
              <span>+ Schedule Meeting</span>
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
              onClick={() => loadMeetings(true)}
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
          <MeetingsKpiCards
            summary={kpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={setActiveKpiFilter}
          />
        </div>

        {/* Meetings List / Loading State */}
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
              Loading Scheduled Meetings...
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              Assembling AI prep briefs, agenda points, and market momentum signals
            </div>
          </div>
        ) : (
          <MeetingsList
            meetings={meetings}
            selectedMeetingId={selectedMeeting?.id || null}
            onSelectMeeting={(m) => setSelectedMeeting(m)}
            onScheduleMeeting={() => setIsScheduleModalOpen(true)}
          />
        )}
      </div>

      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        meeting={selectedMeeting}
        isOpen={Boolean(selectedMeeting)}
        onClose={() => setSelectedMeeting(null)}
        onNavigateToPipeline={() => {
          setSelectedMeeting(null);
          onNavigate('pipeline');
        }}
      />

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduleMeeting={handleScheduleMeeting}
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
