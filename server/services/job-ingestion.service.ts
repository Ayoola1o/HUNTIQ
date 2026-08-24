import { randomUUID } from 'node:crypto';
import { jobProviderRegistry } from '../providers/jobs/provider-registry';
import { createJobRepository } from '../repositories/jobs';
import type { JobRepository } from '../repositories/jobs/job-repository';
import type {
  JobProviderName,
  JobSource,
  JobSourceStatus,
  JobSyncResult,
} from '../providers/jobs/job-provider';

export interface CreateJobSourceInput {
  provider: JobProviderName;
  sourceUrl: string;
  companyIdentifier?: string;
}

/**
 * Coordinates provider fetches with persistence. The repository is currently
 * in-memory by default and can be swapped for PostgreSQL without changing
 * provider adapters or routes.
 */
export class JobIngestionService {
  constructor(private readonly repository: JobRepository = createJobRepository()) {}

  async listSources(): Promise<JobSource[]> {
    return this.repository.listSources();
  }

  async getSource(sourceId: string): Promise<JobSource | undefined> {
    return this.repository.getSource(sourceId);
  }

  async createSource(input: CreateJobSourceInput): Promise<JobSource> {
    try {
      const url = new URL(input.sourceUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol');
    } catch {
      throw new Error('sourceUrl must be a valid HTTP(S) URL.');
    }

    const provider = jobProviderRegistry.get(input.provider);
    if (provider && !provider.validateSource(input.sourceUrl)) {
      throw new Error(`The URL is not a valid ${input.provider} job source.`);
    }

    const now = new Date().toISOString();
    const source: JobSource = {
      id: randomUUID(),
      provider: input.provider,
      sourceUrl: input.sourceUrl,
      companyIdentifier: input.companyIdentifier,
      status: 'active',
      lastSyncStatus: 'never_synced',
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.createSource(source);
  }

  async setSourceStatus(sourceId: string, status: JobSourceStatus): Promise<JobSource | undefined> {
    return this.repository.updateSource(sourceId, { status, updatedAt: new Date().toISOString() });
  }

  async syncSource(sourceId: string): Promise<JobSyncResult> {
    const source = await this.repository.getSource(sourceId);
    if (!source) throw new Error(`Job source '${sourceId}' was not found.`);
    if (source.status !== 'active') throw new Error(`Job source '${sourceId}' is ${source.status}.`);

    const provider = jobProviderRegistry.get(source.provider);
    if (!provider) throw new Error(`The ${source.provider} provider has not been configured yet.`);

    const startedAt = new Date().toISOString();
    await this.repository.updateSource(sourceId, {
      lastSyncStatus: 'running',
      lastSyncError: undefined,
      updatedAt: startedAt,
    });

    try {
      const fetchedJobs = await provider.fetchJobs(source);
      const lastSeenAt = new Date().toISOString();
      const { created, updated } = await this.repository.upsertOpenJobs(source, fetchedJobs, lastSeenAt);
      await this.repository.updateSource(sourceId, {
        lastSyncedAt: lastSeenAt,
        lastSyncStatus: 'succeeded',
        lastSyncError: undefined,
        updatedAt: lastSeenAt,
      });
      return { sourceId, provider: source.provider, startedAt, completedAt: lastSeenAt, fetched: fetchedJobs.length, created, updated, failed: false };
    } catch (error) {
      const completedAt = new Date().toISOString();
      const message = error instanceof Error ? error.message : 'Unknown job provider error.';
      await this.repository.updateSource(sourceId, {
        lastSyncStatus: 'failed',
        lastSyncError: message,
        updatedAt: completedAt,
      });
      return { sourceId, provider: source.provider, startedAt, completedAt, fetched: 0, created: 0, updated: 0, failed: true, error: message };
    }
  }
}

export const jobIngestionService = new JobIngestionService();
