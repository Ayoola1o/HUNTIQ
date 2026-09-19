export const supportedJobProviders = ['greenhouse', 'lever', 'ashby'] as const;

export type JobProviderName = (typeof supportedJobProviders)[number];
export type JobSourceStatus = 'active' | 'paused' | 'error';
export type JobSyncStatus = 'never_synced' | 'running' | 'succeeded' | 'failed';

export interface JobSource {
  id: string;
  provider: JobProviderName;
  sourceUrl: string;
  companyIdentifier?: string;
  status: JobSourceStatus;
  lastSyncedAt?: string;
  lastSyncStatus: JobSyncStatus;
  lastSyncError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedJob {
  externalId: string;
  title: string;
  description?: string;
  department?: string;
  location?: string;
  country?: string;
  isRemote?: boolean;
  employmentType?: string;
  jobUrl: string;
  postedAt?: string;
  rawPayload: unknown;
}

export interface JobProvider {
  readonly provider: JobProviderName;
  validateSource(sourceUrl: string): boolean;
  fetchJobs(source: JobSource): Promise<NormalizedJob[]>;
}

export interface JobSyncResult {
  sourceId: string;
  provider: JobProviderName;
  startedAt: string;
  completedAt: string;
  fetched: number;
  created: number;
  updated: number;
  failed: boolean;
  error?: string;
}
