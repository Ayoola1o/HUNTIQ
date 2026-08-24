import { apiClient } from './client';
import type { DbJob, DbCompany } from '../../server/db/types';

export interface JobSyncResult {
  company: DbCompany;
  jobsIngested: number;
  signalsGenerated: number;
  leadsGenerated: number;
  velocity: {
    activeJobsCount: number;
    velocityScore: number;
    acceleration: 'HIGH' | 'MODERATE' | 'STABLE' | 'DECLINING';
    departments: Record<string, number>;
  };
}

export interface JobFilterParams {
  companyId?: string;
  department?: string;
  seniority?: string;
  remote?: boolean;
  status?: string;
}

export async function syncCompanyJobs(params: {
  companyId?: string;
  domain?: string;
  companyName?: string;
  provider?: 'GREENHOUSE' | 'LEVER' | 'ASHBY';
  boardToken?: string;
}): Promise<JobSyncResult> {
  return await apiClient.post<JobSyncResult>('/api/jobs/sync', params);
}

export async function fetchJobs(filters: JobFilterParams = {}): Promise<DbJob[]> {
  return await apiClient.get<DbJob[]>('/api/jobs', {
    params: {
      companyId: filters.companyId,
      department: filters.department,
      seniority: filters.seniority,
      remote: filters.remote,
      status: filters.status
    }
  });
}

export async function fetchJobVelocity(companyId: string): Promise<{
  activeJobsCount: number;
  velocityScore: number;
  acceleration: string;
  departments: Record<string, number>;
}> {
  return await apiClient.get(`/api/jobs/velocity/${companyId}`);
}

export async function normalizeRawJob(raw: {
  title: string;
  department?: string;
  location?: string;
  content?: string;
  url?: string;
}): Promise<any> {
  return await apiClient.post('/api/jobs/normalize', raw);
}
