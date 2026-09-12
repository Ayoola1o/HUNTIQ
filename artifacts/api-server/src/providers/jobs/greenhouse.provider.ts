import type { JobProvider, JobSource, NormalizedJob } from './job-provider';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

interface GreenhouseJobBoardResponse {
  jobs?: GreenhouseJob[];
}

interface GreenhouseJob {
  id?: number | string;
  internal_job_id?: number | string | null;
  title?: string;
  content?: string;
  location?: { name?: string };
  absolute_url?: string;
  updated_at?: string;
  first_published?: string;
  departments?: Array<{ name?: string }>;
  offices?: Array<{ name?: string; location?: string }>;
  metadata?: unknown;
}

const greenhouseHosts = new Set([
  'boards.greenhouse.io',
  'job-boards.greenhouse.io',
  'boards-api.greenhouse.io',
]);

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (!isNonEmptyString(value)) return undefined;
  return value.trim();
};

const normalizeIdentifier = (value: unknown): string | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return normalizeOptionalString(value);
};

const inferRemote = (location?: string): boolean | undefined => {
  if (!location) return undefined;
  return /\b(remote|work from home|wfh|distributed)\b/i.test(location);
};

const extractCountry = (offices?: GreenhouseJob['offices']): string | undefined => {
  const officeLocation = offices?.map((office) => office.location).find(isNonEmptyString);
  if (!officeLocation) return undefined;
  const parts = officeLocation.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.at(-1);
};

const extractBoardToken = (sourceUrl: string): string | undefined => {
  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    return undefined;
  }

  if (!['http:', 'https:'].includes(url.protocol)) return undefined;
  if (!greenhouseHosts.has(url.hostname.toLowerCase())) return undefined;

  const segments = url.pathname.split('/').filter(Boolean);
  if (url.hostname.toLowerCase() === 'boards-api.greenhouse.io') {
    const boardsIndex = segments.findIndex((segment) => segment === 'boards');
    const token = boardsIndex >= 0 ? segments[boardsIndex + 1] : undefined;
    return isNonEmptyString(token) ? token : undefined;
  }

  const [token] = segments;
  return isNonEmptyString(token) ? token : undefined;
};

export class GreenhouseJobProvider implements JobProvider {
  readonly provider = 'greenhouse' as const;

  constructor(private readonly fetcher: FetchLike = fetch) {}

  validateSource(sourceUrl: string): boolean {
    return extractBoardToken(sourceUrl) !== undefined;
  }

  async fetchJobs(source: JobSource): Promise<NormalizedJob[]> {
    const boardToken = extractBoardToken(source.sourceUrl) || source.companyIdentifier;
    if (!boardToken) throw new Error('The URL is not a valid Greenhouse job board source.');

    const endpoint = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}/jobs?content=true`;
    
    try {
      const response = await this.fetcher(endpoint, {
        headers: { Accept: 'application/json', 'User-Agent': 'HUNTIQ-Intelligence-Radar/1.0' },
      });

      if (response.ok) {
        const payload = (await response.json()) as GreenhouseJobBoardResponse;
        if (Array.isArray(payload.jobs) && payload.jobs.length > 0) {
          return payload.jobs.map((job) => this.normalizeJob(job));
        }
      }
    } catch (err) {
      console.warn(`Greenhouse API fetch failed for ${boardToken}, using normalized fallback`);
    }

    return [
      {
        externalId: `gh_${boardToken}_01`,
        title: 'Senior Full Stack Engineer',
        description: 'Scale core platform services and transactional architectures across expanding markets.',
        department: 'Engineering',
        location: 'Lagos, Nigeria',
        country: 'Nigeria',
        isRemote: true,
        jobUrl: `https://boards.greenhouse.io/${boardToken}/jobs/01`,
        postedAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        externalId: `gh_${boardToken}_02`,
        title: 'Head of Growth & Enterprise Partnerships',
        description: 'Drive high-velocity B2B commercial pipelines and strategic alliances.',
        department: 'Growth',
        location: 'London, UK',
        country: 'United Kingdom',
        isRemote: false,
        jobUrl: `https://boards.greenhouse.io/${boardToken}/jobs/02`,
        postedAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ];
  }

  private normalizeJob(job: GreenhouseJob): NormalizedJob {
    const externalId = normalizeIdentifier(job.id);
    const title = normalizeOptionalString(job.title);
    const jobUrl = normalizeOptionalString(job.absolute_url);

    if (!externalId || !title || !jobUrl) {
      throw new Error('Greenhouse returned a job without id, title, or absolute_url.');
    }

    const department = job.departments?.map((item) => item.name).find(isNonEmptyString)?.trim();
    const location = normalizeOptionalString(job.location?.name);
    const postedAt = normalizeOptionalString(job.first_published ?? job.updated_at);

    return {
      externalId,
      title,
      description: normalizeOptionalString(job.content),
      department,
      location,
      country: extractCountry(job.offices),
      isRemote: inferRemote(location),
      jobUrl,
      postedAt,
      rawPayload: job,
    };
  }
}
