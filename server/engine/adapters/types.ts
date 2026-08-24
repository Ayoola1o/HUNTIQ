export interface JobPostingRaw {
  id: string;
  title: string;
  location?: string;
  department?: string;
  content?: string;
  url?: string;
  updatedAt?: string;
  raw: any;
}

export interface JobPostingNormalized {
  externalId: string;
  title: string;
  department: string;
  functionArea: string;
  seniority: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'DIRECTOR' | 'VP' | 'CXO';
  location: string;
  country: string;
  remote: boolean;
  employmentType: string;
  jobUrl: string;
  postedAt: string;
  descriptionSnippet: string;
  rawPayload: any;
}

export interface IJobSourceAdapter {
  readonly provider: 'GREENHOUSE' | 'LEVER' | 'ASHBY' | 'WORKDAY' | 'CAREER_PAGE';
  fetchJobs(companyIdentifier: string): Promise<JobPostingRaw[]>;
  normalizeJob(raw: JobPostingRaw): JobPostingNormalized;
}
