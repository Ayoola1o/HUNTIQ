export type IntegrationCategory = 
  | 'all' 
  | 'crm' 
  | 'communication' 
  | 'calendar' 
  | 'data' 
  | 'automation' 
  | 'enrichment';

export type IntegrationStatus = 
  | 'connected' 
  | 'syncing' 
  | 'synced' 
  | 'error' 
  | 'reauth_required' 
  | 'disconnected' 
  | 'available';

export interface FieldMapping {
  externalField: string;
  huntiqField: string;
}

export interface IntegrationActivity {
  id: string;
  timestamp: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  recordsCount: number;
}

export interface SyncConfig {
  emailActivity: boolean;
  contacts: boolean;
  calendar: boolean;
  deals: boolean;
  pushSignals: boolean;
}

export interface IntegrationItem {
  id: string;
  name: string;
  brandColor: string;
  bgColor: string;
  category: 'crm' | 'communication' | 'calendar' | 'data' | 'automation' | 'enrichment';
  description: string;
  status: IntegrationStatus;
  connectedAccount?: string;
  lastSync?: string;
  recordsProcessed?: number;
  syncDirection?: 'import' | 'export' | 'two_way';
  syncFrequency?: string;
  syncConfig: SyncConfig;
  fieldMappings: FieldMapping[];
  activityLog: IntegrationActivity[];
}

export interface IntegrationsKpiSummary {
  connectedCount: number;
  syncingCount: number;
  attentionRequiredCount: number;
  availableCount: number;
}
