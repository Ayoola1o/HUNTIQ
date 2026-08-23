import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { MeetingsKpiCards } from './MeetingsKpiCards';
import { MeetingsList } from './MeetingsList';
import { MeetingDetailModal } from './MeetingDetailModal';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { MeetingItem, MeetingsKpiSummary } from '../../types/meetings';
import { 
  Calendar, 
  Sparkles, 
  Plus 
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

  // Initial Mock Meetings
  const [meetings, setMeetings] = useState<MeetingItem[]>([
    {
      id: 'meet-1',
      title: 'Workforce Enablement & Leadership Framework Pitch',
      meetingType: 'demo',
      companyName: 'Acme Technologies',
      domain: 'acmetech.com',
      contactName: 'Jane Smith',
      contactRole: 'Head of People & Culture',
      contactAvatarBg: '#fbcfe8',
      contactAvatarColor: '#9d174d',
      scheduledTime: 'Today, 2:00 PM (WAT)',
      durationMinutes: 30,
      meetingUrl: 'https://meet.google.com/hnt-acme-pitch',
      status: 'upcoming',
      dealValue: 18000,
      opportunityScore: 94,
      aiPrepBrief: {
        keyTakeaway: 'Jane is facing 38 new openings and wants a 3-month coaching curriculum for 14 incoming team leads.',
        recentSignals: ['38 New job postings in Lagos', 'Series A funding raised ($4.2M)', 'Promoted 3 team leads to directors'],
        suggestedQuestions: [
          'What is your target go-live date for the new team leads?',
          'How are you currently measuring management velocity during ramp?'
        ]
      },
      agenda: ['Introductions & Context (5m)', 'Curriculum Demo & Scope (15m)', 'Pricing SLA & Next Steps (10m)'],
      notes: ''
    },
    {
      id: 'meet-2',
      title: 'FinTech Compliance Team Onboarding Discovery',
      meetingType: 'discovery',
      companyName: 'Flutterwave',
      domain: 'flutterwave.com',
      contactName: 'Oluwaseun Adewale',
      contactRole: 'VP People Operations',
      contactAvatarBg: '#ede9fe',
      contactAvatarColor: '#5b21b6',
      scheduledTime: 'Tomorrow, 11:30 AM (WAT)',
      durationMinutes: 30,
      meetingUrl: 'https://meet.google.com/hnt-flw-discovery',
      status: 'upcoming',
      dealValue: 32000,
      opportunityScore: 96,
      aiPrepBrief: {
        keyTakeaway: 'Flutterwave recently obtained cross-border licensing and is scaling compliance headcount by 45 hires.',
        recentSignals: ['Ghana and Egypt regulatory approvals', 'Headcount surge +24% in Q1'],
        suggestedQuestions: [
          'What are the core jurisdictional frameworks your team leads need to be certified on?',
          'Would a blended asynchronous + coach model fit your distributed teams?'
        ]
      },
      agenda: ['Licensing Context (5m)', 'Needs Assessment (15m)', 'Capability Fit & Next Steps (10m)'],
      notes: ''
    },
    {
      id: 'meet-3',
      title: 'Commercial Team Training Workshop Scope Call',
      meetingType: 'negotiation',
      companyName: 'Nimbus Analytics',
      domain: 'nimbusanalytics.com',
      contactName: 'Kemi Adebayo',
      contactRole: 'Chief Commercial Officer',
      contactAvatarBg: '#fee2e2',
      contactAvatarColor: '#991b1b',
      scheduledTime: 'May 16 (Completed)',
      durationMinutes: 45,
      meetingUrl: 'https://meet.google.com/hnt-nimbus-close',
      status: 'completed',
      dealValue: 9500,
      opportunityScore: 86,
      aiPrepBrief: {
        keyTakeaway: 'Finalized commercial terms for $9,500 kickoff.',
        recentSignals: ['Deal won and contract signed'],
        suggestedQuestions: []
      },
      agenda: ['Contract Review', 'Sign-off'],
      notes: 'Deal finalized successfully.'
    }
  ]);

  const kpiSummary: MeetingsKpiSummary = {
    upcomingMeetings: meetings.filter(m => m.status === 'upcoming').length,
    todayCount: 1,
    completedThisMonth: 28,
    bookedFromOutreach: 75
  };

  const handleScheduleMeeting = (newMeeting: MeetingItem) => {
    setMeetings([newMeeting, ...meetings]);
    setSelectedMeeting(newMeeting);
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
              <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Sales Meetings & AI Call Briefs
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Review scheduled demos, leverage AI pre-call briefs, and move deals across pipeline
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

        {/* KPI Metrics Row */}
        <div style={{ margin: '20px 0' }}>
          <MeetingsKpiCards
            summary={kpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={setActiveKpiFilter}
          />
        </div>

        {/* Meetings List */}
        <MeetingsList
          meetings={meetings}
          selectedMeetingId={selectedMeeting?.id || null}
          onSelectMeeting={(m) => setSelectedMeeting(m)}
          onScheduleMeeting={() => setIsScheduleModalOpen(true)}
          onNavigateToPipeline={() => onNavigate('pipeline')}
        />
      </div>

      {/* Meeting Detail & AI Brief Modal */}
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
