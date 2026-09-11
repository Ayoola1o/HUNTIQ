import { EmailScraperConfigManager, EmailScraperConfig } from './emailScraperConfig';
import {
  EmailScraperError,
  StartScrapeJobParams,
  StartScrapeJobResponse,
  ScrapeJobStatusResponse
} from './emailScraperTypes';

export class EmailScraperProvider {
  private config: EmailScraperConfig;

  constructor(customConfig?: Partial<EmailScraperConfig>) {
    const base = EmailScraperConfigManager.getConfig();
    this.config = {
      ...base,
      ...customConfig
    };
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'HUNTIQ-Intelligence-Engine/1.0'
    };
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      headers['X-HUNTIQ-API-KEY'] = this.config.apiKey;
    }
    return headers;
  }

  private ensureConfigured(): void {
    if (!this.config.enabled || !this.config.apiUrl) {
      throw new EmailScraperError(
        'EMAIL_SCRAPER_NOT_CONFIGURED',
        'Email Scraper service is not configured. Set EMAIL_SCRAPER_API_URL in environment.'
      );
    }
  }

  private mapFetchError(err: any): EmailScraperError {
    if (err instanceof EmailScraperError) return err;

    if (err.name === 'TimeoutError' || err.name === 'AbortError' || err.message?.includes('timeout')) {
      return new EmailScraperError(
        'EMAIL_SCRAPER_TIMEOUT',
        `Request to Email Scraper timed out after ${this.config.timeoutMs}ms`,
        408,
        err
      );
    }

    if (
      err.code === 'ECONNREFUSED' ||
      err.code === 'ENOTFOUND' ||
      err.code === 'ECONNRESET' ||
      err.message?.includes('fetch failed')
    ) {
      return new EmailScraperError(
        'EMAIL_SCRAPER_UNAVAILABLE',
        `Email Scraper service is unavailable at ${this.config.apiUrl}: ${err.message}`,
        503,
        err
      );
    }

    return new EmailScraperError(
      'EMAIL_DISCOVERY_FAILED',
      err.message || 'An unexpected error occurred while communicating with Email Scraper',
      500,
      err
    );
  }

  /**
   * Health check for email-scraper service
   */
  public async checkHealth(): Promise<{ status: string; uptime?: number }> {
    this.ensureConfigured();
    try {
      const res = await fetch(`${this.config.apiUrl}/api/health`, {
        method: 'GET',
        headers: this.buildHeaders(),
        signal: AbortSignal.timeout(this.config.timeoutMs)
      });

      if (!res.ok) {
        throw new EmailScraperError(
          'EMAIL_SCRAPER_UNAVAILABLE',
          `Email scraper health check failed with HTTP ${res.status}`,
          res.status
        );
      }

      return await res.json();
    } catch (err: any) {
      throw this.mapFetchError(err);
    }
  }

  /**
   * Starts a crawl scrape job on the external email-scraper service
   */
  public async createScrapeJob(params: StartScrapeJobParams): Promise<StartScrapeJobResponse> {
    this.ensureConfigured();
    try {
      const res = await fetch(`${this.config.apiUrl}/api/scrape/crawl`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          url: params.url,
          maxDepth: params.maxDepth ?? 2,
          maxPages: params.maxPages ?? 15,
          sameDomainOnly: params.sameDomainOnly ?? true,
          timeout: params.timeout ?? this.config.timeoutMs
        }),
        signal: AbortSignal.timeout(this.config.timeoutMs)
      });

      if (res.status === 401 || res.status === 403) {
        throw new EmailScraperError(
          'EMAIL_SCRAPER_AUTH_FAILED',
          `Authentication failed with Email Scraper (HTTP ${res.status}). Check EMAIL_SCRAPER_API_KEY.`,
          res.status
        );
      }

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new EmailScraperError(
          'EMAIL_SCRAPER_INVALID_RESPONSE',
          `Email scraper returned non-JSON response: ${text.slice(0, 100)}`,
          res.status
        );
      }

      if (!res.ok) {
        throw new EmailScraperError(
          'EMAIL_DISCOVERY_FAILED',
          data.error || data.message || `Scraper returned HTTP ${res.status}`,
          res.status
        );
      }

      return {
        success: true,
        jobId: data.jobId,
        streamUrl: data.streamUrl
      };
    } catch (err: any) {
      throw this.mapFetchError(err);
    }
  }

  /**
   * Scrapes a single webpage directly
   */
  public async scrapeSinglePage(url: string, timeout?: number): Promise<{ records: any[] }> {
    this.ensureConfigured();
    try {
      const res = await fetch(`${this.config.apiUrl}/api/scrape/page`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          url,
          timeout: timeout ?? this.config.timeoutMs
        }),
        signal: AbortSignal.timeout(this.config.timeoutMs)
      });

      if (res.status === 401 || res.status === 403) {
        throw new EmailScraperError(
          'EMAIL_SCRAPER_AUTH_FAILED',
          `Authentication failed with Email Scraper (HTTP ${res.status})`,
          res.status
        );
      }

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new EmailScraperError(
          'EMAIL_SCRAPER_INVALID_RESPONSE',
          `Email scraper returned invalid response: ${text.slice(0, 100)}`,
          res.status
        );
      }

      if (!res.ok) {
        throw new EmailScraperError(
          'EMAIL_DISCOVERY_FAILED',
          data.error || data.message || `HTTP ${res.status}`,
          res.status
        );
      }

      return data;
    } catch (err: any) {
      throw this.mapFetchError(err);
    }
  }
}

export const emailScraperProvider = new EmailScraperProvider();
