import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { SettingsNav } from './SettingsNav';
import { WorkspaceSettingsPanel } from './WorkspaceSettingsPanel';
import { TeamSettingsPanel } from './TeamSettingsPanel';
import { IcpSettingsPanel } from './IcpSettingsPanel';
import { ScoringSettingsPanel } from './ScoringSettingsPanel';
import { AiSettingsPanel } from './AiSettingsPanel';
import { SecuritySettingsPanel } from './SecuritySettingsPanel';
import { BillingSettingsPanel } from './BillingSettingsPanel';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { 
  SettingsSection, 
  WorkspaceConfig, 
  TeamMember, 
  IcpConfig, 
  ScoringWeights 
} from '../../types/settings';
import { 
  Settings, 
  Sparkles 
} from 'lucide-react';
import { useHuntiq } from '../../context/HuntiqContext';

interface SettingsPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const { currentUser, onboardingData, saveOnboardingData } = useHuntiq();
  const [activeSection, setActiveSection] = useState<SettingsSection>('workspace');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // State configurations initialized from profile onboarding data
  const [workspaceConfig, setWorkspaceConfig] = useState<WorkspaceConfig>(() => ({
    workspaceName: onboardingData?.workspaceName || currentUser?.companyName || 'HUNTIQ Revenue Team',
    workspaceSlug: (onboardingData?.workspaceName || currentUser?.companyName || 'huntiq-prod').toLowerCase().replace(/[^a-z0-9]/g, '-'),
    defaultCurrency: (currentUser?.defaultCurrency as 'USD' | 'NGN' | 'GBP' | 'EUR') || 'USD',
    timezone: 'Africa/Lagos',
    dateFormat: 'MM/DD/YYYY',
    defaultLandingView: 'dashboard'
  }));

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 'tm-1', name: 'Ayoola Ade', email: 'ayoola@huntiq.ai', role: 'Owner', status: 'Active', lastActive: 'Now', avatarBg: '#eff6ff', avatarColor: '#1d4ed8' },
    { id: 'tm-2', name: 'Sarah Jenkins', email: 'sarah@huntiq.ai', role: 'Manager', status: 'Active', lastActive: '2h ago', avatarBg: '#fbcfe8', avatarColor: '#9d174d' },
    { id: 'tm-3', name: 'David Okafor', email: 'david@huntiq.ai', role: 'Sales Rep', status: 'Active', lastActive: 'Yesterday', avatarBg: '#dbeafe', avatarColor: '#1e40af' }
  ]);

  const [icpConfig, setIcpConfig] = useState<IcpConfig>(() => ({
    targetIndustries: onboardingData?.industries?.length ? onboardingData.industries : ['FinTech & Digital Banking', 'Enterprise SaaS', 'B2B Logistics & Supply Chain', 'Telecommunications'],
    companySizeMin: 50,
    companySizeMax: 500,
    targetGeographies: onboardingData?.geographicMarkets?.length ? onboardingData.geographicMarkets : ['Nigeria', 'Kenya', 'Ghana', 'South Africa'],
    decisionMakerRoles: onboardingData?.targetBuyerRoles?.length ? onboardingData.targetBuyerRoles : ['Head of People', 'VP Operations', 'Chief Executive Officer', 'Chief Commercial Officer'],
    minOpportunityValue: onboardingData?.averageDealValue || 10000
  }));

  // Sync state when onboardingData updates or loads
  React.useEffect(() => {
    if (onboardingData) {
      setWorkspaceConfig((prev) => ({
        ...prev,
        workspaceName: onboardingData.workspaceName || prev.workspaceName
      }));
      setIcpConfig((prev) => ({
        ...prev,
        targetIndustries: onboardingData.industries?.length ? onboardingData.industries : prev.targetIndustries,
        targetGeographies: onboardingData.geographicMarkets?.length ? onboardingData.geographicMarkets : prev.targetGeographies,
        decisionMakerRoles: onboardingData.targetBuyerRoles?.length ? onboardingData.targetBuyerRoles : prev.decisionMakerRoles,
        minOpportunityValue: onboardingData.averageDealValue || prev.minOpportunityValue
      }));
    }
  }, [onboardingData]);

  const [scoringWeights, setScoringWeights] = useState<ScoringWeights>({
    buyingSignalsWeight: 35,
    icpFitWeight: 25,
    hiringSurgeWeight: 20,
    decisionMakerWeight: 20
  });

  const handleInviteMember = (email: string, role: TeamMember['role']) => {
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      status: 'Invited',
      lastActive: 'Never',
      avatarBg: '#f1f5f9',
      avatarColor: '#475569'
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const handleSaveWorkspace = (newCfg: WorkspaceConfig) => {
    setWorkspaceConfig(newCfg);
    if (onboardingData) {
      saveOnboardingData({
        ...onboardingData,
        workspaceName: newCfg.workspaceName
      }).catch(() => {});
    }
  };

  const handleSaveIcp = (newIcp: IcpConfig) => {
    setIcpConfig(newIcp);
    if (onboardingData) {
      saveOnboardingData({
        ...onboardingData,
        industries: newIcp.targetIndustries,
        geographicMarkets: newIcp.targetGeographies,
        targetBuyerRoles: newIcp.decisionMakerRoles,
        averageDealValue: newIcp.minOpportunityValue
      }).catch(() => {});
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
        activeNav="settings"
        onSelectNav={onNavigate}
        onGoToOnboarding={onGoToOnboarding}
      />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
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
              <Settings size={16} color="#2563eb" />
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Workspace Settings & Configuration
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Control algorithmic scoring rules, workspace defaults, members, and AI models
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
          </div>
        </header>

        {/* 2-Level Settings Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', flexWrap: 'nowrap' }}>
          <SettingsNav
            activeSection={activeSection}
            onSelectSection={(sec) => setActiveSection(sec)}
          />

          <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
            {activeSection === 'workspace' && (
              <WorkspaceSettingsPanel
                config={workspaceConfig}
                onSave={handleSaveWorkspace}
              />
            )}

            {activeSection === 'profile' && (
              <WorkspaceSettingsPanel
                config={workspaceConfig}
                onSave={handleSaveWorkspace}
              />
            )}

            {activeSection === 'team' && (
              <TeamSettingsPanel
                members={teamMembers}
                onInviteMember={handleInviteMember}
                onRemoveMember={handleRemoveMember}
              />
            )}

            {activeSection === 'pipeline' && (
              <IcpSettingsPanel
                config={icpConfig}
                onSave={handleSaveIcp}
              />
            )}

            {activeSection === 'icp' && (
              <IcpSettingsPanel
                config={icpConfig}
                onSave={handleSaveIcp}
              />
            )}

            {activeSection === 'scoring' && (
              <ScoringSettingsPanel
                weights={scoringWeights}
                onSave={setScoringWeights}
              />
            )}

            {activeSection === 'ai' && (
              <AiSettingsPanel />
            )}

            {activeSection === 'notifications' && (
              <AiSettingsPanel />
            )}

            {activeSection === 'security' && (
              <SecuritySettingsPanel />
            )}

            {activeSection === 'billing' && (
              <BillingSettingsPanel />
            )}
          </div>
        </div>
      </div>

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
