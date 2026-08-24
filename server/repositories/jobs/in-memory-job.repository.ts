import type { JobSource, NormalizedJob } from '../../providers/jobs/job-provider';
import type { JobRepository, JobSourcePatch, StoredJob, UpsertJobsResult } from './job-repository';

export class InMemoryJobRepository implements JobRepository {
  private readonly sources = new Map<string, JobSource>();
  private readonly jobs = new Map<string, StoredJob>();

  async listSources(): Promise<JobSource[]> {
    return [...this.sources.values()];
  }

  async getSource(sourceId: string): Promise<JobSource | undefined> {
    return this.sources.get(sourceId);
  }

  async createSource(source: JobSource): Promise<JobSource> {
    this.sources.set(source.id, source);
    return source;
  }

  async updateSource(sourceId: string, patch: JobSourcePatch): Promise<JobSource | undefined> {
    const source = this.sources.get(sourceId);
    if (!source) return undefined;

    const updatedSource: JobSource = {
      ...source,
      ...patch,
    };

    this.sources.set(sourceId, updatedSource);
    return updatedSource;
  }

  async upsertOpenJobs(source: JobSource, jobs: NormalizedJob[], seenAt: string): Promise<UpsertJobsResult> {
    let created = 0;
    let updated = 0;

    for (const job of jobs) {
      const key = `${source.id}:${job.externalId}`;
      const existing = this.jobs.get(key);
      this.jobs.set(key, {
        ...existing,
        ...job,
        sourceId: source.id,
        firstSeenAt: existing?.firstSeenAt ?? seenAt,
        lastSeenAt: seenAt,
        status: 'open',
      });
      if (existing) updated += 1;
      else created += 1;
    }

    return { created, updated };
  }
}

