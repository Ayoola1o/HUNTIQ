import { randomUUID } from 'crypto';
import type {
  DiscoveryJobRepository,
  EmailDiscoveryJob,
  CreateDiscoveryJobDto,
  DiscoveryJobStatus,
  ContactEvidenceDto,
  DiscoveryResultDto,
  IntegrationEventDto
} from './discovery-job-repository';

export class InMemoryDiscoveryJobRepository implements DiscoveryJobRepository {
  private jobs: Map<string, EmailDiscoveryJob> = new Map();
  private results: Map<string, DiscoveryResultDto> = new Map();
  private evidence: ContactEvidenceDto[] = [];
  private events: IntegrationEventDto[] = [];

  async createJob(data: CreateDiscoveryJobDto): Promise<EmailDiscoveryJob> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const job: EmailDiscoveryJob = {
      id,
      workspaceId: data.workspaceId,
      companyId: data.companyId || null,
      provider: data.provider || 'email-scraper',
      externalJobId: data.externalJobId || null,
      targetDomain: data.targetDomain || null,
      targetWebsite: data.targetWebsite || null,
      status: 'QUEUED',
      requestedAt: now,
      startedAt: null,
      completedAt: null,
      emailsFound: 0,
      error: null,
      metadata: data.metadata || {},
      createdBy: data.createdBy || null,
      createdAt: now,
      updatedAt: now
    };
    this.jobs.set(id, job);
    return { ...job };
  }

  async getJobById(id: string, workspaceId: string): Promise<EmailDiscoveryJob | null> {
    const job = this.jobs.get(id);
    if (!job || job.workspaceId !== workspaceId) return null;
    return { ...job };
  }

  async updateJobStatus(
    id: string,
    workspaceId: string,
    status: DiscoveryJobStatus,
    updates?: Partial<EmailDiscoveryJob>
  ): Promise<EmailDiscoveryJob | null> {
    const job = this.jobs.get(id);
    if (!job || job.workspaceId !== workspaceId) return null;

    const now = new Date().toISOString();
    job.status = status;
    job.updatedAt = now;

    if (status === 'RUNNING' && !job.startedAt) {
      job.startedAt = now;
    } else if (['COMPLETED', 'PARTIAL', 'CANCELLED', 'FAILED'].includes(status)) {
      job.completedAt = now;
    }

    if (updates) {
      if (updates.emailsFound !== undefined) job.emailsFound = updates.emailsFound;
      if (updates.externalJobId !== undefined) job.externalJobId = updates.externalJobId;
      if (updates.error !== undefined) job.error = updates.error;
      if (updates.metadata) job.metadata = { ...job.metadata, ...updates.metadata };
    }

    return { ...job };
  }

  async listJobs(workspaceId: string, limit: number = 50): Promise<EmailDiscoveryJob[]> {
    return Array.from(this.jobs.values())
      .filter(j => j.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(j => ({ ...j }));
  }

  async saveDiscoveryResult(result: DiscoveryResultDto): Promise<void> {
    const key = `${result.workspaceId}:${result.requestId}`;
    this.results.set(key, { ...result });
  }

  async getDiscoveryResultByRequestId(requestId: string, workspaceId: string): Promise<DiscoveryResultDto | null> {
    const key = `${workspaceId}:${requestId}`;
    const res = this.results.get(key);
    return res ? { ...res } : null;
  }

  async saveContactEvidence(evidenceList: ContactEvidenceDto[]): Promise<void> {
    for (const item of evidenceList) {
      const copy: ContactEvidenceDto = {
        ...item,
        id: item.id || randomUUID(),
        discoveredAt: item.discoveredAt || new Date().toISOString()
      };
      this.evidence.push(copy);
    }
  }

  async listEvidenceForContact(contactId: string, workspaceId: string): Promise<ContactEvidenceDto[]> {
    return this.evidence
      .filter(e => e.contactId === contactId && e.workspaceId === workspaceId)
      .map(e => ({ ...e }));
  }

  async listEvidenceForCompany(companyId: string, workspaceId: string): Promise<ContactEvidenceDto[]> {
    return this.evidence
      .filter(e => e.companyId === companyId && e.workspaceId === workspaceId)
      .map(e => ({ ...e }));
  }

  async recordIntegrationEvent(event: IntegrationEventDto): Promise<void> {
    this.events.push({ ...event });
  }

  // Clear helper for tests
  public clear(): void {
    this.jobs.clear();
    this.results.clear();
    this.evidence = [];
    this.events = [];
  }
}
