import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { OutreachKpiCards } from './OutreachKpiCards';
import { OutreachConversationView } from './OutreachConversationView';
import { NewOutreachModal } from './NewOutreachModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { OutreachItem, OutreachKpiSummary } from '../../types/outreach';
import { 
  Send, 
  Sparkles, 
  Plus 
} from 'lucide-react';

interface OutreachPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const OutreachPage: React.FC<OutreachPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [isNewOutreachModalOpen, setIsNewOutreachModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeKpiFilter, setActiveKpiFilter] = useState('due_today');

  // Initial Mock Conversations
  const [conversations, setConversations] = useState<OutreachItem[]>([
    {
      id: 'out-1',
      contactName: 'Jane Smith',
      contactRole: 'Head of People',
      companyName: 'Acme Technologies',
      domain: 'acmetech.com',
      email: 'jane@acmetech.com',
      avatarBg: '#fbcfe8',
      avatarColor: '#9d174d',
      subject: 'Workforce scaling frameworks & management ramp',
      lastMessageSnippet: 'We have 38 new openings and need a coaching structure. What is your typical timeline?',
      lastMessageTime: '12m ago',
      status: 'replied',
      channel: 'email',
      campaignName: 'Lagos Tech Hiring Surge',
      opportunityScore: 94,
      unread: true,
      thread: [
        {
          id: 'm1',
          sender: 'me',
          senderName: 'Ayoola Ade',
          timestamp: 'Yesterday 10:30 AM',
          channel: 'email',
          content: 'Hi Jane, I noticed Acme Technologies recently posted 38 job openings across engineering and operations. Rapid headcount scaling often creates management bottlenecks—we help growth companies reduce onboarding time by 40%.'
        },
        {
          id: 'm2',
          sender: 'prospect',
          senderName: 'Jane Smith',
          timestamp: 'Today 9:15 AM',
          channel: 'email',
          content: 'Hi Ayoola, this is very timely. We are onboarding 14 new team leads next month and our current training is fragmented. What is your typical timeline for a management enablement sprint?'
        }
      ]
    },
    {
      id: 'out-2',
      contactName: 'Oluwaseun Adewale',
      contactRole: 'VP People Operations',
      companyName: 'Flutterwave',
      domain: 'flutterwave.com',
      email: 'oluwaseun@flutterwave.com',
      avatarBg: '#ede9fe',
      avatarColor: '#5b21b6',
      subject: 'Cross-border compliance team enablement',
      lastMessageSnippet: 'Thanks for sharing the case study. Let us do a brief intro call.',
      lastMessageTime: '1h ago',
      status: 'replied',
      channel: 'email',
      campaignName: 'Pan-African FinTech Outreach',
      opportunityScore: 96,
      unread: false,
      thread: [
        {
          id: 'm3',
          sender: 'me',
          senderName: 'Ayoola Ade',
          timestamp: 'May 14',
          channel: 'email',
          content: 'Hi Oluwaseun, congrats on the recent licenses across West Africa! We work with high-growth FinTechs to train multi-jurisdiction compliance officers.'
        },
        {
          id: 'm4',
          sender: 'prospect',
          senderName: 'Oluwaseun Adewale',
          timestamp: 'Today 8:00 AM',
          channel: 'email',
          content: 'Thanks for sharing the case study. Let us do a brief intro call this week to explore syllabus alignment.'
        }
      ]
    },
    {
      id: 'out-3',
      contactName: 'Tunde Bakare',
      contactRole: 'CTO',
      companyName: 'CloudNova Technologies',
      domain: 'cloudnova.io',
      email: 'tunde@cloudnova.io',
      avatarBg: '#dbeafe',
      avatarColor: '#1e40af',
      subject: 'Technical leadership onboarding curriculum',
      lastMessageSnippet: 'Follow-up step 2 due today based on AWS migration signal.',
      lastMessageTime: 'Yesterday',
      status: 'due_today',
      channel: 'email',
      opportunityScore: 91,
      unread: false,
      thread: [
        {
          id: 'm5',
          sender: 'me',
          senderName: 'Ayoola Ade',
          timestamp: 'May 12',
          channel: 'email',
          content: 'Hi Tunde, noticed CloudNova just expanded its cloud infrastructure team. Would love to share our quick guide on mentoring senior staff engineers.'
        }
      ]
    }
  ]);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversations[0]?.id || null);

  const kpiSummary: OutreachKpiSummary = {
    dueToday: 24,
    scheduled: 38,
    replies: 12,
    needsAttention: 9,
    responseRate: 8.4
  };

  const handleSendMessage = (conversationId: string, text: string) => {
    setConversations(conversations.map(c => {
      if (c.id === conversationId) {
        const newMsg = {
          id: `m-${Date.now()}`,
          sender: 'me' as const,
          senderName: 'Ayoola Ade',
          timestamp: 'Just now',
          channel: 'email' as const,
          content: text
        };
        return {
          ...c,
          lastMessageSnippet: text,
          lastMessageTime: 'Just now',
          thread: [...c.thread, newMsg]
        };
      }
      return c;
    }));
  };

  const handleCreateOutreach = (newItem: OutreachItem) => {
    setConversations([newItem, ...conversations]);
    setActiveConversationId(newItem.id);
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
              <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Outreach & Sales Communications
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Manage prospect conversations, handle replies and accelerate sales follow-ups
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

        {/* KPI Metrics Row */}
        <div style={{ margin: '20px 0' }}>
          <OutreachKpiCards
            summary={kpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={setActiveKpiFilter}
          />
        </div>

        {/* Split Sales Inbox */}
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
      </div>

      {/* New Outreach Modal */}
      <NewOutreachModal
        isOpen={isNewOutreachModalOpen}
        onClose={() => setIsNewOutreachModalOpen(false)}
        onCreateOutreach={handleCreateOutreach}
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
