import { config } from '../config/env';

export type DiscoveryJobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface DiscoveryJobRecord {
  id: string;
  workspaceId: string;
  userId: string;
  provider: 'APIFY_GOOGLE_MAPS' | 'APIFY_MOCK';
  query: string;
  location: string | null;
  radius: number | null;
  filters: Record<string, any>;
  status: DiscoveryJobStatus;
  startedAt: string;
  completedAt: string | null;
  resultCount: number;
  error: { code: string; message: string } | null;
  providerRunId: string | null;
  providerMetadata: {
    actorId?: string;
    datasetId?: string;
    durationMs?: number;
  } | null;
}

export class DiscoveryJobService {
  private static jobs: Map<string, DiscoveryJobRecord> = new Map();
  private static recentSearches: Map<string, { timestamp: number; resultCount: number }> = new Map();

  /**
   * Checks if workspace has exceeded maximum concurrent running jobs.
   */
  public static checkConcurrencyLimit(workspaceId: string): boolean {
    const runningJobs = Array.from(this.jobs.values()).filter(
      j => j.workspaceId === workspaceId && (j.status === 'RUNNING' || j.status === 'QUEUED')
    );
    return runningJobs.length >= config.mapsMaxConcurrentJobs;
  }

  /**
   * Checks if an identical search was triggered within the cooldown window (10 seconds).
   */
  public static checkCooldown(workspaceId: string, query: string, location?: string): boolean {
    const searchKey = `${workspaceId}:${query.toLowerCase().trim()}:${(location || '').toLowerCase().trim()}`;
    const recent = this.recentSearches.get(searchKey);
    if (!recent) return false;
    const elapsed = Date.now() - recent.timestamp;
    return elapsed < 10000; // 10s cooldown
  }

  /**
   * Registers a new discovery job.
   */
  public static createJob(params: {
    workspaceId: string;
    userId: string;
    provider: 'APIFY_GOOGLE_MAPS' | 'APIFY_MOCK';
    query: string;
    location?: string;
    radius?: number;
    filters?: Record<string, any>;
  }): DiscoveryJobRecord {
    const id = `job-disc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const job: DiscoveryJobRecord = {
      id,
      workspaceId: params.workspaceId,
      userId: params.userId,
      provider: params.provider,
      query: params.query,
      location: params.location || null,
      radius: params.radius || null,
      filters: params.filters || {},
      status: 'QUEUED',
      startedAt: new Date().toISOString(),
      completedAt: null,
      resultCount: 0,
      error: null,
      providerRunId: null,
      providerMetadata: null
    };

    this.jobs.set(id, job);

    const searchKey = `${params.workspaceId}:${params.query.toLowerCase().trim()}:${(params.location || '').toLowerCase().trim()}`;
    this.recentSearches.set(searchKey, { timestamp: Date.now(), resultCount: 0 });

    return job;
  }

  /**
   * Marks a job as completed.
   */
  public static completeJob(
    jobId: string,
    resultCount: number,
    providerRunId?: string | null,
    providerMetadata?: { actorId?: string; datasetId?: string; durationMs?: number } | null
  ): DiscoveryJobRecord | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    job.status = 'COMPLETED';
    job.completedAt = new Date().toISOString();
    job.resultCount = resultCount;
    job.providerRunId = providerRunId || null;
    job.providerMetadata = providerMetadata || null;

    return job;
  }

  /**
   * Marks a job as failed.
   */
  public static failJob(
    jobId: string,
    error: { code: string; message: string }
  ): DiscoveryJobRecord | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    job.status = 'FAILED';
    job.completedAt = new Date().toISOString();
    job.error = error;

    return job;
  }

  /**
   * Retrieves a job by ID (optionally scoped to workspace).
   */
  public static getJob(jobId: string, workspaceId?: string): DiscoveryJobRecord | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;
    if (workspaceId && job.workspaceId !== workspaceId) return undefined;
    return job;
  }

  /**
   * Updates job status and optional metadata.
   */
  public static updateStatus(
    jobId: string,
    status: DiscoveryJobStatus,
    meta?: { totalFound?: number; totalPersisted?: number; error?: { code: string; message: string } }
  ): DiscoveryJobRecord | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    job.status = status;
    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
      job.completedAt = new Date().toISOString();
    }
    if (meta?.totalFound !== undefined) {
      job.resultCount = meta.totalFound;
      (job as any).totalFound = meta.totalFound;
    }
    if (meta?.totalPersisted !== undefined) {
      (job as any).totalPersisted = meta.totalPersisted;
    }
    if (meta?.error) {
      job.error = meta.error;
    }
    return job;
  }

  /**
   * Lists discovery jobs for a workspace.
   */
  public static listJobs(workspaceId: string, limit: number = 20): DiscoveryJobRecord[] {
    return Array.from(this.jobs.values())
      .filter(j => j.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }

  // --- Instance Delegators ---
  public createJob(params: any): DiscoveryJobRecord {
    return DiscoveryJobService.createJob(params);
  }

  public getJob(jobId: string, workspaceId?: string): DiscoveryJobRecord | undefined {
    return DiscoveryJobService.getJob(jobId, workspaceId);
  }

  public listJobs(workspaceId: string, limit?: number): DiscoveryJobRecord[] {
    return DiscoveryJobService.listJobs(workspaceId, limit);
  }

  public updateStatus(jobId: string, status: DiscoveryJobStatus, meta?: any): DiscoveryJobRecord | undefined {
    return DiscoveryJobService.updateStatus(jobId, status, meta);
  }

  public completeJob(jobId: string, count: number, runId?: string | null, meta?: any): DiscoveryJobRecord | undefined {
    return DiscoveryJobService.completeJob(jobId, count, runId, meta);
  }

  public failJob(jobId: string, error: { code: string; message: string }): DiscoveryJobRecord | undefined {
    return DiscoveryJobService.failJob(jobId, error);
  }
}

