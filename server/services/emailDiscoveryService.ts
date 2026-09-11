import { discoveryJobRepository } from '../repositories/discovery-jobs';
import type { EmailDiscoveryJob, DiscoveryJobStatus } from '../repositories/discovery-jobs/discovery-job-repository';
import { emailScraperProvider } from '../providers/emailScraper/emailScraperProvider';
import { EmailScraperConfigManager } from '../providers/emailScraper/emailScraperConfig';
import { validateSafeScrapeUrl } from '../utils/urlValidator';
import { LeadIngestionService } from './leadIngestionService';
import type { HuntIQSyncPayload, HuntIQSyncResponse } from '../providers/emailScraper/emailScraperTypes';

export interface CreateDiscoveryRequestParams {
  workspaceId: string;
  userId?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  domain?: string | null;
  website?: string | null;
}

export class EmailDiscoveryService {
  /**
   * Initiates a discovery job for a company or domain.
   * Enforces server-side workspace isolation and validates URLs against SSRF.
   */
  public static async createScrapeJob(params: CreateDiscoveryRequestParams): Promise<EmailDiscoveryJob> {
    const { workspaceId, userId, companyId, companyName, domain, website } = params;

    if (!workspaceId) {
      throw new Error('Workspace ID is strictly required to create a discovery job');
    }

    const targetUrl = website || (domain ? `https://${domain}` : '');
    if (!targetUrl) {
      throw new Error('Target domain or website URL is required for email discovery');
    }

    // SSRF Validation
    const urlValidation = await validateSafeScrapeUrl(targetUrl);
    if (!urlValidation.safe) {
      throw new Error(`SSRF Prevention: ${urlValidation.error}`);
    }

    // 1. Create durable record in PostgreSQL repository with status 'QUEUED'
    const job = await discoveryJobRepository.createJob({
      workspaceId,
      companyId: companyId || null,
      provider: 'email-scraper',
      targetDomain: domain || urlValidation.url?.hostname || null,
      targetWebsite: targetUrl,
      createdBy: userId || null,
      metadata: { targetUrl, companyName: companyName || undefined }
    });

    // Record structured event
    await discoveryJobRepository.recordIntegrationEvent({
      workspaceId,
      jobId: job.id,
      eventType: 'EMAIL_DISCOVERY_REQUESTED',
      provider: 'email-scraper',
      payload: { targetUrl, companyId, companyName, domain }
    });

    // 2. Dispatch to external email-scraper provider if configured
    if (EmailScraperConfigManager.isConfigured()) {
      try {
        const scrapeResponse = await emailScraperProvider.createScrapeJob({
          url: targetUrl
        });

        // Transition to RUNNING
        const updatedJob = await discoveryJobRepository.updateJobStatus(
          job.id,
          workspaceId,
          'RUNNING',
          { externalJobId: scrapeResponse.jobId }
        );

        await discoveryJobRepository.recordIntegrationEvent({
          workspaceId,
          jobId: job.id,
          eventType: 'EMAIL_DISCOVERY_STARTED',
          provider: 'email-scraper',
          payload: { externalJobId: scrapeResponse.jobId }
        });

        return updatedJob || job;
      } catch (err: any) {
        // Transition to FAILED if provider errors
        const failedJob = await discoveryJobRepository.updateJobStatus(
          job.id,
          workspaceId,
          'FAILED',
          { error: { code: err.code || 'SCRAPER_DISPATCH_FAILED', message: err.message } }
        );

        await discoveryJobRepository.recordIntegrationEvent({
          workspaceId,
          jobId: job.id,
          eventType: 'EMAIL_DISCOVERY_FAILED',
          provider: 'email-scraper',
          payload: { error: err.message, code: err.code }
        });

        return failedJob || job;
      }
    }

    return job;
  }

  /**
   * Retrieves status of a discovery job, scoped strictly to workspace.
   */
  public static async getScrapeJobStatus(jobId: string, workspaceId: string): Promise<EmailDiscoveryJob | null> {
    if (!workspaceId) throw new Error('Workspace ID required');
    return discoveryJobRepository.getJobById(jobId, workspaceId);
  }

  /**
   * Lists discovery jobs for the workspace.
   */
  public static async listScrapeJobs(workspaceId: string, limit: number = 50): Promise<EmailDiscoveryJob[]> {
    if (!workspaceId) throw new Error('Workspace ID required');
    return discoveryJobRepository.listJobs(workspaceId, limit);
  }

  /**
   * Cancels an active scrape job.
   */
  public static async cancelScrapeJob(jobId: string, workspaceId: string): Promise<EmailDiscoveryJob | null> {
    if (!workspaceId) throw new Error('Workspace ID required');
    const job = await discoveryJobRepository.getJobById(jobId, workspaceId);
    if (!job) return null;

    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      return job;
    }

    return discoveryJobRepository.updateJobStatus(jobId, workspaceId, 'CANCELLED');
  }

  /**
   * Ingests and processes results delivered from email-scraper (e.g. via webhook).
   * Ensures idempotency and strict provenance tracking.
   */
  public static async processScrapeResult(
    payload: HuntIQSyncPayload,
    workspaceId: string
  ): Promise<HuntIQSyncResponse> {
    return LeadIngestionService.processScraperSync(payload, workspaceId);
  }
}
