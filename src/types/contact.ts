export type DecisionRole = 'Decision Maker' | 'Influencer' | 'Champion' | 'Other';
export type ContactSource = 'linkedin' | 'email' | 'globe' | 'import' | 'manual';
export type VerificationStatus = 'verified' | 'likely' | 'unverified';

export interface ContactOpportunity {
  id: string;
  title: string;
  value: string;
  score: number;
  scoreLevel: string;
}

export interface ContactItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  verificationStatus: VerificationStatus;
  companyName: string;
  companyLocation: string;
  companyIndustry: string;
  companyEmployees: string;
  role: string;
  decisionRole: DecisionRole;
  influenceScore: number;
  influenceLevel: string;
  opportunityFitScore: number;
  opportunityFitLevel: string;
  lastActivity: string;
  lastActivityTime: string;
  source: ContactSource;
  isBookmarked: boolean;
  phone: string;
  location: string;
  localTime: string;
  about: string;
  aiInsights: string[];
  tags: string[];
  opportunities: ContactOpportunity[];
  linkedinUrl?: string;
  activities?: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export interface ContactsKpiData {
  totalContacts: string;
  totalContactsChange: string;
  newContacts: string;
  newContactsChange: string;
  changedRoles: string;
  changedRolesChange: string;
  highInfluence: string;
  highInfluenceChange: string;
  contacted: string;
  contactedChange: string;
  replied: string;
  repliedChange: string;
}
