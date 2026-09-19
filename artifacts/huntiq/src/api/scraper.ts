import { apiClient } from './client';

export interface ScrapedRecordDto {
  email: string;
  domain: string;
  type: 'role' | 'personal';
  sourceUrl: string;
  pageTitle?: string;
  contextSnippet?: string;
  depth?: number;
  discoveredAt: string;
  name?: string;
  jobTitle?: string;
  phone?: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  mxStatus?: 'deliverable' | 'undeliverable' | 'disposable' | 'unverified';
  mxRecords?: string[];
  validity?: {
    syntax: boolean;
    tld: boolean;
    isDisposable: boolean;
  };
}

export interface CrawlProgressDto {
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

export const scraperApi = {
  /**
   * Scrapes a single webpage URL
   */
  async scrapePage(url: string, timeout = 12000, verifyMx = true) {
    return apiClient.request<{
      success: boolean;
      data: {
        url: string;
        pageTitle: string;
        statusCode: number;
        count: number;
        records: ScrapedRecordDto[];
      };
    }>('/api/v1/scraper/page', {
      method: 'POST',
      body: JSON.stringify({ url, timeout, verifyMx }),
      timeoutMs: timeout + 3000
    });
  },

  /**
   * Starts an asynchronous deep crawl session on a domain
   */
  async startCrawl(params: {
    url: string;
    maxDepth?: number;
    maxPages?: number;
    sameDomainOnly?: boolean;
    timeout?: number;
    verifyMx?: boolean;
  }) {
    return apiClient.request<{
      success: boolean;
      data: {
        jobId: string;
        url: string;
        streamUrl: string;
      };
    }>('/api/v1/scraper/crawl', {
      method: 'POST',
      body: JSON.stringify(params),
      timeoutMs: 10000
    });
  },

  /**
   * Cancels a running crawl session
   */
  async cancelCrawl(jobId: string) {
    return apiClient.request<{
      success: boolean;
      data: { jobId: string; status: string };
    }>(`/api/v1/scraper/crawl/cancel/${jobId}`, {
      method: 'POST'
    });
  },

  /**
   * Batch scrapes multiple URLs
   */
  async batchScrape(urls: string[], timeout = 10000, verifyMx = true) {
    return apiClient.request<{
      success: boolean;
      data: {
        totalProcessed: number;
        uniqueEmailsFound: number;
        summary: Array<{ url: string; success: boolean; count: number; error?: string }>;
        records: ScrapedRecordDto[];
      };
    }>('/api/v1/scraper/batch', {
      method: 'POST',
      body: JSON.stringify({ urls, timeout, verifyMx }),
      timeoutMs: 30000
    });
  },

  /**
   * Saves scraped records as permanent HUNTIQ CRM contacts
   */
  async saveContacts(records: ScrapedRecordDto[], companyId?: string, companyName?: string) {
    return apiClient.request<{
      success: boolean;
      data: {
        savedCount: number;
        contacts: any[];
      };
    }>('/api/v1/scraper/save-contacts', {
      method: 'POST',
      body: JSON.stringify({ records, companyId, companyName })
    });
  }
};
