import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { CampaignKpiCards } from './CampaignKpiCards';
import { CampaignsTable } from './CampaignsTable';
import { CampaignDetailModal } from './CampaignDetailModal';
import { CreateCampaignModal } from './CreateCampaignModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { CampaignItem, CampaignKpiSummary } from '../../types/campaign';
import { 
  Send, 
  Sparkles, 
  Plus 
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

  // Initial Mock Campaigns
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([
    {
      id: 'camp-1',
      name: 'Lagos Tech Hiring Surge Sequence',
      description: 'Outreach to HR leaders at high-growth tech scaleups expanding headcounts by 20%+',
      channel: 'multichannel',
      status: 'active',
      targetAudienceName: 'Lagos Technology Growth Companies',
      audienceCount: 184,
      sentCount: 142,
      openRate: 68.4,
      replyRate: 9.2,
      opportunitiesCount: 12,
      expectedValue: 74000,
      createdAt: 'May 10, 2025',
      lastActivity: '12 new emails dispatched today',
      sequence: [
        {
          id: 'sq-1',
          stepNumber: 1,
          channel: 'email',
          title: 'AI Signal-Based Value Intro',
          delayDays: 0,
          contentSnippet: 'I noticed your recent 38 openings and expansion into Ghana... We help scaleups reduce new-hire ramp by 40%.'
        },
        {
          id: 'sq-2',
          stepNumber: 2,
          channel: 'linkedin',
          title: 'LinkedIn InMail Follow-up',
          delayDays: 3,
          contentSnippet: 'Saw your rapid headcount growth—wanted to share our workforce scaling framework.'
        },
        {
          id: 'sq-3',
          stepNumber: 3,
          channel: 'call',
          title: 'Cold Call Opener & Meeting Hook',
          delayDays: 6,
          contentSnippet: 'Following up on my note regarding management training for your expanding team.'
        }
      ],
      prospects: [
        {
          id: 'p-1',
          contactName: 'Jane Smith',
          contactRole: 'Head of People',
          companyName: 'Acme Technologies',
          domain: 'acmetech.com',
          email: 'jane@acmetech.com',
          status: 'replied',
          opportunityScore: 94,
          lastTouch: 'Replied yesterday'
        },
        {
          id: 'p-2',
          contactName: 'Tunde Bakare',
          contactRole: 'CTO',
          companyName: 'CloudNova Technologies',
          domain: 'cloudnova.io',
          email: 'tunde@cloudnova.io',
          status: 'opened',
          opportunityScore: 91,
          lastTouch: 'Opened email 2h ago'
        }
      ]
    },
    {
      id: 'camp-2',
      name: 'Pan-African FinTech Compliance Outreach',
      description: 'Engaging VP People & Chief Compliance Officers navigating multi-market central bank licenses.',
      channel: 'email',
      status: 'active',
      targetAudienceName: 'Pan-African FinTech Scaleups',
      audienceCount: 96,
      sentCount: 78,
      openRate: 72.1,
      replyRate: 8.5,
      opportunitiesCount: 8,
      expectedValue: 62000,
      createdAt: 'May 12, 2025',
      lastActivity: 'Step 2 sent to 14 contacts',
      sequence: [
        {
          id: 'sq-4',
          stepNumber: 1,
          channel: 'email',
          title: 'Cross-Border Compliance Scaling Intro',
          delayDays: 0,
          contentSnippet: 'Congratulations on recent licensing in West Africa. We help FinTechs prepare compliance officers.'
        },
        {
          id: 'sq-5',
          stepNumber: 2,
          channel: 'email',
          title: 'Case Study & Framework Sharing',
          delayDays: 4,
          contentSnippet: 'Here is how we helped a top payment scaleup cut compliance onboarding time.'
        }
      ],
      prospects: [
        {
          id: 'p-3',
          contactName: 'Oluwaseun Adewale',
          contactRole: 'VP People',
          companyName: 'Flutterwave',
          domain: 'flutterwave.com',
          email: 'oluwaseun@flutterwave.com',
          status: 'replied',
          opportunityScore: 96,
          lastTouch: 'Discovery meeting booked'
        }
      ]
    },
    {
      id: 'camp-3',
      name: 'Abuja Public & Commercial Modernization',
      description: 'Advisory and org design outreach to enterprise operators in Abuja.',
      channel: 'linkedin',
      status: 'paused',
      targetAudienceName: 'Abuja Commercial Enterprise',
      audienceCount: 54,
      sentCount: 30,
      openRate: 54.0,
      replyRate: 4.8,
      opportunitiesCount: 4,
      expectedValue: 48000,
      createdAt: 'May 04, 2025',
      lastActivity: 'Campaign paused by user',
      sequence: [
        {
          id: 'sq-6',
          stepNumber: 1,
          channel: 'linkedin',
          title: 'InMail Introduction',
          delayDays: 0,
          contentSnippet: 'Connecting regarding enterprise workflow frameworks.'
        }
      ],
      prospects: []
    }
  ]);

  const kpiSummary: CampaignKpiSummary = {
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalAudience: campaigns.reduce((acc, c) => acc + c.audienceCount, 0),
    totalReplies: Math.round(campaigns.reduce((acc, c) => acc + (c.sentCount * (c.replyRate / 100)), 0)),
    opportunitiesCreated: campaigns.reduce((acc, c) => acc + c.opportunitiesCount, 0),
    pipelineGenerated: campaigns.reduce((acc, c) => acc + c.expectedValue, 0)
  };

  const handleToggleStatus = (campId: string) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === campId) {
        return {
          ...c,
          status: c.status === 'active' ? 'paused' : 'active'
        };
      }
      return c;
    }));
  };

  const handleCreateCampaign = (newCamp: CampaignItem) => {
    setCampaigns([newCamp, ...campaigns]);
    setSelectedCampaign(newCamp);
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
              <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Outreach Campaigns & Sequences
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Build, launch and monitor automated multi-channel sequences
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

        {/* KPI Metrics Row */}
        <div style={{ margin: '20px 0' }}>
          <CampaignKpiCards
            summary={kpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={setActiveKpiFilter}
          />
        </div>

        {/* Campaigns Table */}
        <CampaignsTable
          campaigns={campaigns}
          selectedCampaignId={selectedCampaign?.id || null}
          onSelectCampaign={(c) => setSelectedCampaign(c)}
          onToggleStatus={handleToggleStatus}
          onCreateCampaign={() => setIsCreateModalOpen(true)}
        />
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
