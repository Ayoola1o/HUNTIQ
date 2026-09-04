import type { IJobSourceAdapter, JobPostingRaw, JobPostingNormalized } from './types';
import { JobNormalizer } from '../normalizer/jobNormalizer';

export class AshbyAdapter implements IJobSourceAdapter {
  public readonly provider = 'ASHBY' as const;

  public async fetchJobs(companyIdentifier: string): Promise<JobPostingRaw[]> {
    // In production, queries: `https://api.ashbyhq.com/posting-api/job-board/${companyIdentifier}`
    return [
      {
        id: `ash_${companyIdentifier}_01`,
        title: 'Director of Business Banking & Merchant Growth',
        location: 'Lagos, Nigeria',
        department: 'Business Banking',
        url: `https://jobs.ashbyhq.com/${companyIdentifier}/301`,
        updatedAt: new Date().toISOString(),
        raw: { ashbyId: companyIdentifier }
      }
    ];
  }

  public normalizeJob(raw: JobPostingRaw): JobPostingNormalized {
    const { department, functionArea } = JobNormalizer.extractDepartment(raw.title, raw.department);
    const seniority = JobNormalizer.extractSeniority(raw.title);
    const remote = JobNormalizer.isRemote(raw.title, raw.location);

    return {
      externalId: raw.id,
      title: raw.title,
      department,
      functionArea,
      seniority,
      location: raw.location || 'Lagos, Nigeria',
      country: 'Nigeria',
      remote,
      employmentType: 'FULL_TIME',
      jobUrl: raw.url || '',
      postedAt: raw.updatedAt || new Date().toISOString(),
      descriptionSnippet: raw.title,
      rawPayload: raw.raw
    };
  }
}

export const ashbyAdapter = new AshbyAdapter();
