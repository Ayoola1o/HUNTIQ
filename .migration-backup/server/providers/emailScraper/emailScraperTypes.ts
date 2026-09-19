/**
 * Data contracts and type definitions for external email-scraper provider integration.
 */

export type HuntIQSourceType =
  | 'WEBSITE'
  | 'CONTACT_PAGE'
  | 'TEAM_PAGE'
  | 'ABOUT_PAGE'
  | 'FOOTER'
  | 'RAW_TEXT'
  | 'OTHER';

export type HuntIQEmailType =
  | 'PERSONAL'
  | 'ROLE_BASED'
  | 'UNKNOWN';

export type HuntIQEmailStatus =
  | 'FOUND'
  | 'VALIDATED'
  | 'UNVERIFIED'
  | 'INVALID'
  | 'BOUNCED';

export interface HuntIQIdentityInference {
  firstName?: string;
  lastName?: string;
  confidence: number;
  source: 'email_local_part' | 'surrounding_text' | 'dom_pattern' | string;
}

export interface HuntIQContact {
  email: string;
  emailType?: HuntIQEmailType;
  emailStatus?: HuntIQEmailStatus;
  confidence: number;
  sourceUrl?: string | null;
  sourceType?: HuntIQSourceType;
  name?: string | null;
  jobTitle?: string | null;
  identityInference?: HuntIQIdentityInference;
  identitySource?: 'website' | 'inferred' | string;
  phone?: string | null;
  socials?: Record<string, string | undefined>;
  contextSnippet?: string;
  depth?: number;
  discoveredAt?: string;
  mxRecords?: string[];
}

export interface HuntIQCompany {
  name?: string | null;
  domain?: string | null;
  website?: string | null;
}

export interface HuntIQSyncPayload {
  integration: 'email-scraper';
  version: '1.0';
  requestId: string;
  source: {
    type: 'website_email_scraper' | 'batch_scraper' | 'raw_text_extractor' | string;
    jobId?: string;
  };
  company: HuntIQCompany;
  contacts: HuntIQContact[];
}

export interface HuntIQSyncResponse {
  success: boolean;
  requestId: string;
  accepted: number;
  rejected: number;
  duplicates: number;
  errors: string[];
  huntiqResponse?: any;
}

export interface StartScrapeJobParams {
  url: string;
  maxDepth?: number;
  maxPages?: number;
  sameDomainOnly?: boolean;
  timeout?: number;
}

export interface StartScrapeJobResponse {
  success: boolean;
  jobId: string;
  streamUrl?: string;
}

export interface ScrapeJobStatusResponse {
  jobId: string;
  status: 'running' | 'completed' | 'cancelled' | 'error';
  totalRecords?: number;
  pagesVisited?: number;
  errors?: number;
  durationMs?: number;
  records?: HuntIQContact[];
}

export class EmailScraperError extends Error {
  constructor(
    public code:
      | 'EMAIL_SCRAPER_NOT_CONFIGURED'
      | 'EMAIL_SCRAPER_UNAVAILABLE'
      | 'EMAIL_SCRAPER_TIMEOUT'
      | 'EMAIL_SCRAPER_AUTH_FAILED'
      | 'EMAIL_SCRAPER_INVALID_RESPONSE'
      | 'EMAIL_DISCOVERY_FAILED',
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'EmailScraperError';
  }
}
