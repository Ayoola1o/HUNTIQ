export interface DbWorkspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbCompany {
  id: string;
  workspaceId: string;
  name: string;
  legalName?: string;
  domain: string;
  website?: string;
  industry: string;
  employeeCount: string;
  employeeRange?: string;
  country: string;
  state?: string;
  city: string;
  description: string;
  logoUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  foundedYear?: string;
  status: 'ACTIVE' | 'PROSPECT' | 'CHURNED' | 'ARCHIVED';
  firstSeenAt: string;
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbJobSource {
  id: string;
  workspaceId: string;
  companyId: string;
  provider: 'GREENHOUSE' | 'LEVER' | 'ASHBY' | 'WORKDAY' | 'CAREER_PAGE';
  sourceType: string;
  sourceUrl: string;
  companyIdentifier?: string;
  externalCompanyId?: string;
  lastSyncedAt?: string;
  syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface DbJob {
  id: string;
  workspaceId: string;
  companyId: string;
  sourceId?: string;
  externalId: string;
  title: string;
  description?: string;
  department?: string;
  functionArea?: string;
  seniority: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'DIRECTOR' | 'VP' | 'CXO';
  location: string;
  country?: string;
  remote: boolean;
  employmentType: string;
  jobUrl?: string;
  postedAt: string;
  status: 'OPEN' | 'CLOSED' | 'EXPIRED';
  firstSeenAt: string;
  lastSeenAt: string;
  closedAt?: string;
  rawPayload?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DbContact {
  id: string;
  workspaceId: string;
  companyId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department?: string;
  seniority?: string;
  email?: string;
  emailStatus: 'UNKNOWN' | 'VALID' | 'INVALID' | 'RISKY';
  emailConfidence: number;
  phone?: string;
  linkedinUrl?: string;
  source: string;
  sourceUrl?: string;
  firstSeenAt: string;
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbSignal {
  id: string;
  workspaceId: string;
  companyId: string;
  type: 'HIRING_ACCELERATION' | 'DEPARTMENT_EXPANSION' | 'LEADERSHIP_HIRING' | 'FUNDING' | 'EXPANSION' | 'TECH_CHANGE';
  title: string;
  summary: string;
  strength: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  detectedAt: string;
  observedFrom?: string;
  observedTo?: string;
  status: 'ACTIVE' | 'DISMISSED' | 'ACTED_UPON';
  createdAt: string;
  updatedAt: string;
}

export interface DbEvidence {
  id: string;
  workspaceId: string;
  signalId: string;
  companyId: string;
  sourceType: string;
  provider?: string;
  sourceUrl?: string;
  title: string;
  description: string;
  observedAt: string;
  retrievedAt: string;
  confidence: number;
  rawReference?: Record<string, any>;
  createdAt: string;
}

export interface DbLead {
  id: string;
  workspaceId: string;
  companyId: string;
  contactId?: string;
  signalId?: string;
  score: number;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  status: 'NEW' | 'CONTACTED' | 'IN_PIPELINE' | 'DISQUALIFIED';
  source: string;
  reason: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbActivity {
  id: string;
  workspaceId: string;
  userId: string;
  companyId?: string;
  contactId?: string;
  leadId?: string;
  type: 'LEAD_CREATED' | 'LEAD_VIEWED' | 'CONTACT_ADDED' | 'EMAIL_SENT' | 'NOTE_ADDED' | 'SIGNAL_VIEWED' | 'COMPANY_TRACKED';
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
