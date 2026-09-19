export type SettingsSection = 
  | 'workspace' 
  | 'profile' 
  | 'team' 
  | 'pipeline' 
  | 'icp' 
  | 'scoring' 
  | 'ai' 
  | 'notifications' 
  | 'security' 
  | 'billing';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Sales Rep' | 'Analyst';
  status: 'Active' | 'Invited' | 'Suspended';
  lastActive: string;
  avatarBg: string;
  avatarColor: string;
}

export interface WorkspaceConfig {
  workspaceName: string;
  workspaceSlug: string;
  defaultCurrency: 'USD' | 'NGN' | 'GBP' | 'EUR';
  timezone: string;
  dateFormat: string;
  defaultLandingView: string;
}

export interface UserProfileConfig {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  phone: string;
}

export interface IcpConfig {
  targetIndustries: string[];
  companySizeMin: number;
  companySizeMax: number;
  targetGeographies: string[];
  decisionMakerRoles: string[];
  minOpportunityValue: number;
}

export interface ScoringWeights {
  buyingSignalsWeight: number;
  icpFitWeight: number;
  hiringSurgeWeight: number;
  decisionMakerWeight: number;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsed: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  ipAddress: string;
}
