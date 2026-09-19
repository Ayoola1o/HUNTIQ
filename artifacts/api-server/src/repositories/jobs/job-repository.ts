import type { JobSource, JobSourceStatus, JobSyncStatus, NormalizedJob } from '../../providers/jobs/job-provider';

export type StoredJob = NormalizedJob & {
  sourceId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  status: 'open' | 'closed';
};

export interface JobSourcePatch {
  status?: JobSourceStatus;
  lastSyncedAt?: string;
  lastSyncStatus?: JobSyncStatus;
  lastSyncError?: string;
  updatedAt: string;
}

export interface UpsertJobsResult {
  created: number;
  updated: number;
}

export interface JobRepository {
  listSources(): Promise<JobSource[]>;
  getSource(sourceId: string): Promise<JobSource | undefined>;
  createSource(source: JobSource): Promise<JobSource>;
  updateSource(sourceId: string, patch: JobSourcePatch): Promise<JobSource | undefined>;
  upsertOpenJobs(source: JobSource, jobs: NormalizedJob[], seenAt: string): Promise<UpsertJobsResult>;
}

