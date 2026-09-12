import { ApiClient } from './client';

export interface DiscoverContactsParams {
  website?: string;
  domain?: string;
  companyName?: string;
  companyId?: string;
}

export interface EmailDiscoveryJobDto {
  id: string;
  workspaceId: string;
  companyId: string | null;
  provider: 'email-scraper';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  targetDomain: string | null;
  targetWebsite: string;
  contactsFound: number;
  emailsFound: number;
  metadata?: Record<string, any>;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailDiscoveryResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class EmailDiscoveryApi {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  /**
   * Initiates contact discovery for a target website/domain.
   * Calls POST /api/v1/integrations/email-scraper/discover
   */
  public async discoverContacts(params: DiscoverContactsParams): Promise<EmailDiscoveryJobDto> {
    const res = await this.client.request<EmailDiscoveryResponse<EmailDiscoveryJobDto>>(
      '/api/v1/integrations/email-scraper/discover',
      {
        method: 'POST',
        body: JSON.stringify(params),
        timeoutMs: 15000
      }
    );

    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to initiate contact discovery');
    }

    return res.data;
  }

  /**
   * Fetches discovery job status.
   * Calls GET /api/v1/integrations/email-scraper/jobs/:jobId
   */
  public async getJobStatus(jobId: string): Promise<EmailDiscoveryJobDto> {
    const res = await this.client.request<EmailDiscoveryResponse<EmailDiscoveryJobDto>>(
      `/api/v1/integrations/email-scraper/jobs/${encodeURIComponent(jobId)}`,
      {
        method: 'GET',
        timeoutMs: 10000
      }
    );

    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Discovery job not found');
    }

    return res.data;
  }

  /**
   * Lists discovery jobs for current workspace.
   * Calls GET /api/v1/integrations/email-scraper/jobs
   */
  public async listJobs(limit: number = 20): Promise<EmailDiscoveryJobDto[]> {
    const res = await this.client.request<EmailDiscoveryResponse<EmailDiscoveryJobDto[]>>(
      '/api/v1/integrations/email-scraper/jobs',
      {
        method: 'GET',
        params: { limit },
        timeoutMs: 10000
      }
    );

    if (!res.success || !res.data) {
      return [];
    }

    return res.data;
  }

  /**
   * Cancels an active discovery job.
   * Calls POST /api/v1/integrations/email-scraper/jobs/:jobId/cancel
   */
  public async cancelJob(jobId: string): Promise<EmailDiscoveryJobDto> {
    const res = await this.client.request<EmailDiscoveryResponse<EmailDiscoveryJobDto>>(
      `/api/v1/integrations/email-scraper/jobs/${encodeURIComponent(jobId)}/cancel`,
      {
        method: 'POST',
        timeoutMs: 10000
      }
    );

    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to cancel discovery job');
    }

    return res.data;
  }
}

export const emailDiscoveryApi = new EmailDiscoveryApi();
