/**
 * Structured types for HUNTIQ Web & Email Contact Scraper Engine
 */

export interface ScrapedEmailRecord {
  /** Normalized lowercase email address */
  email: string;
  /** Host domain of the email address (e.g. acme.org) */
  domain: string;
  /** Email categorization: 'role' (e.g. info@, support@) vs 'personal' */
  type: 'role' | 'personal';
  /** The full URL where the email was located */
  sourceUrl: string;
  /** HTML Page Title where the email was discovered */
  pageTitle?: string;
  /** Surrounding text snippet where the email was mentioned */
  contextSnippet?: string;
  /** Depth level in crawler where the page was visited */
  depth?: number;
  /** ISO timestamp of discovery */
  discoveredAt: string;
  /** Inferred or extracted person / team name */
  name?: string;
  /** Inferred or detected job title / executive role */
  jobTitle?: string;
  /** Contact phone number if discovered */
  phone?: string;
  /** Social profiles discovered on source page */
  socials?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  /** Live MX record deliverability status */
  mxStatus?: 'deliverable' | 'undeliverable' | 'disposable' | 'unverified';
  /** Resolved MX mail exchange servers */
  mxRecords?: string[];
  /** Validation and metadata flags */
  validity?: {
    syntax: boolean;
    tld: boolean;
    isDisposable: boolean;
  };
}

export interface CrawlProgress {
  url: string;
  depth: number;
  pagesVisited: number;
  maxPages: number;
  queueLength: number;
  emailsFoundOnPage: number;
  totalUniqueEmails: number;
  pageTitle?: string;
  statusCode?: number;
}

export interface HttpScraperOptions {
  timeout?: number;
  headers?: Record<string, string>;
  userAgent?: string;
}

export interface WebsiteCrawlerOptions {
  maxDepth?: number;
  maxPages?: number;
  sameDomainOnly?: boolean;
  timeout?: number;
  delayMs?: number;
  userAgent?: string;
  onPageVisited?: (url: string, depth: number, emailCount: number) => void;
  onProgress?: (progress: CrawlProgress) => void;
  onRecordFound?: (record: ScrapedEmailRecord) => void;
  onError?: (url: string, error: Error) => void;
  isCancelled?: () => boolean;
}

export interface VerificationResult {
  status: 'deliverable' | 'undeliverable' | 'disposable';
  mxRecords: string[];
}
