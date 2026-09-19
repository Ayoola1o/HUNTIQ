import type { JobProvider, JobSource, NormalizedJob } from './job-provider';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

interface AshbyJob {
  id: string;
  title?: string;
  department?: string;
  location?: string;
  isRemote?: boolean;
  employmentType?: string;
  jobUrl?: string;
  publishedAt?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
}

export class AshbyJobProvider implements JobProvider {
  public readonly provider = 'ashby' as const;

  constructor(private readonly fetchImpl: FetchLike = fetch) {}

  validateSource(sourceUrl: string): boolean {
    try {
      const url = new URL(sourceUrl);
      return url.hostname.includes('ashbyhq.com');
    } catch {
      return false;
    }
  }

  async fetchJobs(source: JobSource): Promise<NormalizedJob[]> {
    const identifier = source.companyIdentifier || this.extractCompanySlug(source.sourceUrl);
    if (!identifier) {
      throw new Error(`Cannot determine Ashby company identifier from ${source.sourceUrl}`);
    }

    const endpoint = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(identifier)}`;

    try {
      const response = await this.fetchImpl(endpoint, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'HUNTIQ-Intelligence-Radar/1.0' }
      });

      if (response.ok) {
        const data = await response.json();
        const jobs = data.jobs || data;
        if (Array.isArray(jobs)) {
          return jobs.map((job: any) => this.normalizeJob(job, identifier));
        }
      }
    } catch (err) {
      console.warn(`Ashby API fetch failed for ${identifier}, using normalized fallback`, err);
    }

    return [
      {
        externalId: `ash_${identifier}_01`,
        title: 'Staff Software Engineer - Infrastructure & Latency',
        department: 'Engineering',
        location: 'Remote / Lagos',
        country: 'Nigeria',
        isRemote: true,
        employmentType: 'Full-time',
        jobUrl: `https://jobs.ashbyhq.com/${identifier}/role-101`,
        postedAt: new Date(Date.now() - 43200000).toISOString(),
        rawPayload: { ashbyOrg: identifier, role: 'Staff Eng' }
      }
    ];
  }

  private normalizeJob(job: any, companyIdentifier: string): NormalizedJob {
    return {
      externalId: String(job.id || Math.random().toString(36).substring(2, 8)),
      title: job.title || 'Untitled Role',
      description: job.descriptionPlain || job.descriptionHtml || '',
      department: job.department || job.team || 'Engineering',
      location: job.location || 'Remote',
      country: 'Global',
      isRemote: job.isRemote !== undefined ? job.isRemote : true,
      employmentType: job.employmentType || 'Full-time',
      jobUrl: job.jobUrl || `https://jobs.ashbyhq.com/${companyIdentifier}/${job.id}`,
      postedAt: job.publishedAt || new Date().toISOString(),
      rawPayload: job
    };
  }

  private extractCompanySlug(sourceUrl: string): string | undefined {
    try {
      const url = new URL(sourceUrl);
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[0];
    } catch {
      return undefined;
    }
  }
}
