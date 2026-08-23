import React, { useState } from 'react';
import { DashboardSidebar } from '../dashboard/DashboardSidebar';
import { IntegrationsKpiCards } from './IntegrationsKpiCards';
import { IntegrationsGrid } from './IntegrationsGrid';
import { ConnectIntegrationModal } from './ConnectIntegrationModal';
import { ManageIntegrationModal } from './ManageIntegrationModal';
import { AiCopilotModal } from '../dashboard/AiCopilotModal';
import type { IntegrationItem, IntegrationsKpiSummary } from '../../types/integrations';
import { 
  Puzzle, 
  Sparkles 
} from 'lucide-react';

interface IntegrationsPageProps {
  onNavigate: (nav: string) => void;
  onGoToOnboarding?: () => void;
}

export const IntegrationsPage: React.FC<IntegrationsPageProps> = ({
  onNavigate,
  onGoToOnboarding
}) => {
  const [connectingItem, setConnectingItem] = useState<IntegrationItem | null>(null);
  const [managingItem, setManagingItem] = useState<IntegrationItem | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeKpiFilter, setActiveKpiFilter] = useState('connected');

  // Initial Mock Integrations
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    {
      id: 'int-gmail',
      name: 'Gmail & Google Workspace',
      brandColor: '#ea4335',
      bgColor: '#fef2f2',
      category: 'communication',
      description: 'Sync email threads, prospect replies, and communication engagement directly to HUNTIQ outreach.',
      status: 'connected',
      connectedAccount: 'ayoola@huntiq.ai',
      lastSync: '2 minutes ago',
      recordsProcessed: 4820,
      syncDirection: 'two_way',
      syncFrequency: 'Real-time (Webhooks)',
      syncConfig: { emailActivity: true, contacts: true, calendar: false, deals: false, pushSignals: false },
      fieldMappings: [
        { externalField: 'FromAddress', huntiqField: 'contactEmail' },
        { externalField: 'SubjectLine', huntiqField: 'threadSubject' },
        { externalField: 'SentTimestamp', huntiqField: 'activityTime' }
      ],
      activityLog: [
        { id: 'l1', timestamp: '2 mins ago', message: 'Synchronized 14 email thread replies and updated prospect status to Replied', type: 'success', recordsCount: 14 },
        { id: 'l2', timestamp: '1 hour ago', message: 'Routine webhook ping verified: 0 errors', type: 'info', recordsCount: 0 }
      ]
    },
    {
      id: 'int-gcal',
      name: 'Google Calendar',
      brandColor: '#4285f4',
      bgColor: '#eff6ff',
      category: 'calendar',
      description: 'Sync sales discovery calls and automatically link pre-call AI intelligence briefs to attendee profiles.',
      status: 'connected',
      connectedAccount: 'ayoola@huntiq.ai',
      lastSync: '5 minutes ago',
      recordsProcessed: 142,
      syncDirection: 'two_way',
      syncFrequency: 'Real-time (Webhooks)',
      syncConfig: { emailActivity: false, contacts: true, calendar: true, deals: false, pushSignals: false },
      fieldMappings: [
        { externalField: 'EventSummary', huntiqField: 'meetingTitle' },
        { externalField: 'StartTime', huntiqField: 'scheduledTime' },
        { externalField: 'AttendeeEmails', huntiqField: 'prospectContacts' }
      ],
      activityLog: [
        { id: 'l3', timestamp: '5 mins ago', message: 'Ingested 2 newly booked discovery calls from outreach link', type: 'success', recordsCount: 2 }
      ]
    },
    {
      id: 'int-hubspot',
      name: 'HubSpot CRM',
      brandColor: '#ff7a59',
      bgColor: '#fff7ed',
      category: 'crm',
      description: 'Bidirectional synchronization of verified contacts, high-intent companies, and closed-won deals.',
      status: 'connected',
      connectedAccount: 'HUNTIQ Production Hub',
      lastSync: '12 minutes ago',
      recordsProcessed: 8940,
      syncDirection: 'two_way',
      syncFrequency: 'Every 5 minutes',
      syncConfig: { emailActivity: true, contacts: true, calendar: true, deals: true, pushSignals: true },
      fieldMappings: [
        { externalField: 'firstname', huntiqField: 'contactName' },
        { externalField: 'company', huntiqField: 'companyName' },
        { externalField: 'dealstage', huntiqField: 'pipelineStage' }
      ],
      activityLog: [
        { id: 'l4', timestamp: '12 mins ago', message: 'Pushed 6 qualified opportunities and 38 buying signals to HubSpot', type: 'success', recordsCount: 44 }
      ]
    },
    {
      id: 'int-slack',
      name: 'Slack',
      brandColor: '#4a154b',
      bgColor: '#fdf4ff',
      category: 'communication',
      description: 'Stream instant buying signal alerts and hot prospect replies directly into sales team channels.',
      status: 'connected',
      connectedAccount: '#huntiq-signals',
      lastSync: '1 minute ago',
      recordsProcessed: 640,
      syncDirection: 'export',
      syncFrequency: 'Real-time',
      syncConfig: { emailActivity: false, contacts: false, calendar: false, deals: false, pushSignals: true },
      fieldMappings: [
        { externalField: 'Channel', huntiqField: 'alertChannel' }
      ],
      activityLog: [
        { id: 'l5', timestamp: '1 min ago', message: 'Dispatched alert for Acme Technologies hiring surge to #huntiq-signals', type: 'success', recordsCount: 1 }
      ]
    },
    {
      id: 'int-salesforce',
      name: 'Salesforce CRM',
      brandColor: '#00a1e0',
      bgColor: '#eff6ff',
      category: 'crm',
      description: 'Enterprise pipeline sync, lead assignment rules, and custom account field mapping.',
      status: 'reauth_required',
      connectedAccount: 'enterprise@corp.com',
      lastSync: '2 days ago',
      recordsProcessed: 12400,
      syncDirection: 'two_way',
      syncFrequency: 'Hourly',
      syncConfig: { emailActivity: true, contacts: true, calendar: false, deals: true, pushSignals: false },
      fieldMappings: [
        { externalField: 'LeadSource', huntiqField: 'signalAttribution' }
      ],
      activityLog: [
        { id: 'l6', timestamp: '2 days ago', message: 'OAuth refresh token expired. Re-authentication required to resume sync.', type: 'error', recordsCount: 0 }
      ]
    },
    {
      id: 'int-zapier',
      name: 'Zapier',
      brandColor: '#ff4a00',
      bgColor: '#fff7ed',
      category: 'automation',
      description: 'Trigger 5,000+ custom app workflows when new high-intent buying signals or replies are detected.',
      status: 'connected',
      connectedAccount: 'Active Webhook Trigger',
      lastSync: '8 minutes ago',
      recordsProcessed: 1820,
      syncDirection: 'export',
      syncFrequency: 'Real-time (Webhooks)',
      syncConfig: { emailActivity: false, contacts: true, calendar: false, deals: true, pushSignals: true },
      fieldMappings: [],
      activityLog: [
        { id: 'l7', timestamp: '8 mins ago', message: 'Triggered zap: Auto-create Notion research brief for verified signal', type: 'success', recordsCount: 1 }
      ]
    },
    // Available integrations catalog
    {
      id: 'int-pipedrive',
      name: 'Pipedrive CRM',
      brandColor: '#000000',
      bgColor: '#f1f5f9',
      category: 'crm',
      description: 'Automate visual pipeline deal creation and sync activities for sales teams using Pipedrive.',
      status: 'available',
      syncConfig: { emailActivity: true, contacts: true, calendar: true, deals: true, pushSignals: true },
      fieldMappings: [],
      activityLog: []
    },
    {
      id: 'int-outlook',
      name: 'Microsoft 365 Outlook',
      brandColor: '#0078d4',
      bgColor: '#eff6ff',
      category: 'communication',
      description: 'Connect Microsoft Exchange / Office 365 mailboxes for unified enterprise sales communication.',
      status: 'available',
      syncConfig: { emailActivity: true, contacts: true, calendar: true, deals: false, pushSignals: false },
      fieldMappings: [],
      activityLog: []
    },
    {
      id: 'int-make',
      name: 'Make.com (Integromat)',
      brandColor: '#6d28d9',
      bgColor: '#f5f3ff',
      category: 'automation',
      description: 'Build visual multi-step automations connecting HUNTIQ signals to external internal databases.',
      status: 'available',
      syncConfig: { emailActivity: false, contacts: true, calendar: false, deals: true, pushSignals: true },
      fieldMappings: [],
      activityLog: []
    },
    {
      id: 'int-sheets',
      name: 'Google Sheets Live Sync',
      brandColor: '#0f9d58',
      bgColor: '#ecfdf5',
      category: 'data',
      description: 'Continuously stream newly identified ICP prospects and signal triggers into collaborative spreadsheets.',
      status: 'available',
      syncConfig: { emailActivity: false, contacts: true, calendar: false, deals: true, pushSignals: true },
      fieldMappings: [],
      activityLog: []
    },
    {
      id: 'int-webhooks',
      name: 'Custom Webhooks & REST API',
      brandColor: '#0f172a',
      bgColor: '#f8fafc',
      category: 'automation',
      description: 'Broadcast secure JSON webhook events to your own server endpoints whenever deals or contacts change.',
      status: 'available',
      syncConfig: { emailActivity: false, contacts: true, calendar: false, deals: true, pushSignals: true },
      fieldMappings: [],
      activityLog: []
    },
    {
      id: 'int-zoom',
      name: 'Zoom Video Communications',
      brandColor: '#2d8cff',
      bgColor: '#eff6ff',
      category: 'calendar',
      description: 'Automatically generate dynamic Zoom conference links for scheduled discovery and demo calls.',
      status: 'available',
      syncConfig: { emailActivity: false, contacts: false, calendar: true, deals: false, pushSignals: false },
      fieldMappings: [],
      activityLog: []
    }
  ]);

  const kpiSummary: IntegrationsKpiSummary = {
    connectedCount: integrations.filter(i => i.status === 'connected' || i.status === 'synced').length,
    syncingCount: integrations.filter(i => i.status === 'syncing').length,
    attentionRequiredCount: integrations.filter(i => i.status === 'reauth_required' || i.status === 'error').length,
    availableCount: integrations.filter(i => i.status === 'available').length
  };

  const handleSyncNow = (itemId: string) => {
    setIntegrations(integrations.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'syncing',
          lastSync: 'Syncing now...'
        };
      }
      return item;
    }));

    setTimeout(() => {
      setIntegrations(prev => prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'connected',
            lastSync: 'Just now',
            activityLog: [
              {
                id: `act-${Date.now()}`,
                timestamp: 'Just now',
                message: 'Manual on-demand synchronization completed: 18 records refreshed.',
                type: 'success',
                recordsCount: 18
              },
              ...item.activityLog
            ]
          };
        }
        return item;
      }));
    }, 1500);
  };

  const handleConnected = (updatedItem: IntegrationItem) => {
    setIntegrations(integrations.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const handleUpdate = (updatedItem: IntegrationItem) => {
    setIntegrations(integrations.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const handleDisconnect = (itemId: string) => {
    setIntegrations(integrations.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          status: 'available',
          connectedAccount: undefined,
          lastSync: undefined
        };
      }
      return i;
    }));
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
        activeNav="integrations"
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
        paddingBottom: '40px',
        gap: '20px'
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
              <Puzzle size={16} color="#2563eb" />
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Workspace Integrations & Connected Apps
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.2 }}>
                Connect HUNTIQ to your CRM, communication mailboxes, calendar, and automation tools
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

        {/* KPI Metrics Row */}
        <div>
          <IntegrationsKpiCards
            summary={kpiSummary}
            activeFilter={activeKpiFilter}
            onSelectFilter={setActiveKpiFilter}
          />
        </div>

        {/* Integrations Grid (Connected & Available) */}
        <IntegrationsGrid
          integrations={integrations}
          onConnect={(item) => setConnectingItem(item)}
          onManage={(item) => setManagingItem(item)}
          onSyncNow={handleSyncNow}
        />
      </div>

      {/* Connect Integration Modal */}
      <ConnectIntegrationModal
        integration={connectingItem}
        isOpen={Boolean(connectingItem)}
        onClose={() => setConnectingItem(null)}
        onConnected={handleConnected}
      />

      {/* Manage Integration Drawer / Modal */}
      <ManageIntegrationModal
        integration={managingItem}
        isOpen={Boolean(managingItem)}
        onClose={() => setManagingItem(null)}
        onUpdateIntegration={handleUpdate}
        onDisconnect={handleDisconnect}
        onSyncNow={handleSyncNow}
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
