export type DiscoveryJobStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'CANCELLED'
  | 'FAILED';

export interface EmailDiscoveryJob {
  id: string;
  workspaceId: string;
  companyId?: string | null;
  provider: string;
  externalJobId?: string | null;
  targetDomain?: string | null;
  targetWebsite?: string | null;
  status: DiscoveryJobStatus;
  requestedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  emailsFound: number;
  error?: { code: string; message: string } | null;
  metadata?: Record<string, any>;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscoveryJobDto {
  workspaceId: string;
  companyId?: string | null;
  provider?: string;
  externalJobId?: string | null;
  targetDomain?: string | null;
  targetWebsite?: string | null;
  createdBy?: string | null;
  metadata?: Record<string, any>;
}

export interface ContactEvidenceDto {
  id?: string;
  workspaceId: string;
  contactId: string;
  companyId: string;
  discoveryJobId?: string | null;
  email: string;
  emailType?: 'PERSONAL' | 'ROLE_BASED' | 'UNKNOWN';
  emailStatus?: 'FOUND' | 'VALIDATED' | 'UNVERIFIED' | 'INVALID' | 'BOUNCED';
  confidence: number;
  sourceUrl?: string | null;
  sourceType?: string;
  name?: string | null;
  jobTitle?: string | null;
  identitySource?: 'WEBSITE' | 'EMAIL_LOCAL_PART' | 'SURROUNDING_TEXT' | 'DOM_PATTERN' | 'INFERRED';
  identityInference?: Record<string, any> | null;
  phone?: string | null;
  socials?: Record<string, any>;
  contextSnippet?: string | null;
  discoveredAt?: string;
}

export interface DiscoveryResultDto {
  jobId?: string | null;
  workspaceId: string;
  companyId?: string | null;
  requestId: string;
  rawPayload: Record<string, any>;
  resolutionStatus: 'RESOLVED' | 'UNRESOLVED';
  acceptedCount: number;
  rejectedCount: number;
  duplicateCount: number;
}

export interface IntegrationEventDto {
  workspaceId: string;
  jobId?: string | null;
  eventType: string;
  provider?: string;
  payload?: Record<string, any>;
}

export interface DiscoveryJobRepository {
  createJob(data: CreateDiscoveryJobDto): Promise<EmailDiscoveryJob>;
  getJobById(id: string, workspaceId: string): Promise<EmailDiscoveryJob | null>;
  updateJobStatus(
    id: string,
    workspaceId: string,
    status: DiscoveryJobStatus,
    updates?: Partial<EmailDiscoveryJob>
  ): Promise<EmailDiscoveryJob | null>;
  listJobs(workspaceId: string, limit?: number): Promise<EmailDiscoveryJob[]>;
  saveDiscoveryResult(result: DiscoveryResultDto): Promise<void>;
  getDiscoveryResultByRequestId(requestId: string, workspaceId: string): Promise<DiscoveryResultDto | null>;
  saveContactEvidence(evidenceList: ContactEvidenceDto[]): Promise<void>;
  listEvidenceForContact(contactId: string, workspaceId: string): Promise<ContactEvidenceDto[]>;
  listEvidenceForCompany(companyId: string, workspaceId: string): Promise<ContactEvidenceDto[]>;
  recordIntegrationEvent(event: IntegrationEventDto): Promise<void>;
}
