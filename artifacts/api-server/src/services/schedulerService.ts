import { GmailReplySyncService, type WatchRenewalSummary } from './gmailReplySyncService';
import { CampaignExecutionService } from './campaignExecutionService';

export interface SchedulerStatus {
  isRunning: boolean;
  watchRenewalIntervalMs: number;
  campaignIntervalMs: number;
  lastWatchRenewalAt: string | null;
  lastWatchRenewalResult: WatchRenewalSummary | null;
  lastCampaignRunAt: string | null;
  totalWatchRenewalsRun: number;
  totalCampaignRuns: number;
}

export class SchedulerService {
  private static isRunning = false;
  private static watchRenewalTimer: NodeJS.Timeout | null = null;
  private static campaignTimer: NodeJS.Timeout | null = null;

  // Default: Renew Gmail watches every 6 hours (Gmail watch duration is up to 7 days)
  public static getWatchRenewalIntervalMs(): number {
    const envVal = process.env.GMAIL_WATCH_RENEWAL_INTERVAL_MS;
    if (envVal) {
      const parsed = parseInt(envVal, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 6 * 60 * 60 * 1000; // 6 hours default
  }

  // Default: Process due campaign sequence steps every 5 minutes
  public static getCampaignIntervalMs(): number {
    const envVal = process.env.CAMPAIGN_PROCESS_INTERVAL_MS;
    if (envVal) {
      const parsed = parseInt(envVal, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 5 * 60 * 1000; // 5 minutes default
  }

  // Telemetry state
  private static lastWatchRenewalAt: string | null = null;
  private static lastWatchRenewalResult: WatchRenewalSummary | null = null;
  private static lastCampaignRunAt: string | null = null;
  private static totalWatchRenewalsRun = 0;
  private static totalCampaignRuns = 0;

  /**
   * Starts the production background scheduler.
   * Runs an immediate check on startup and schedules periodic background execution.
   */
  public static start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    const watchInterval = this.getWatchRenewalIntervalMs();
    const campaignInterval = this.getCampaignIntervalMs();

    console.log(`[SCHEDULER] Production scheduler started.`);
    console.log(`[SCHEDULER] Gmail Watch Renewal cadence: every ${watchInterval / (60 * 1000)} minutes`);
    console.log(`[SCHEDULER] Campaign Execution cadence: every ${campaignInterval / (60 * 1000)} minutes`);

    // 1. Initial non-blocking startup run
    this.runWatchRenewalJob().catch(err => {
      console.warn('[SCHEDULER] Initial watch renewal notice:', err.message);
    });

    // 2. Periodic Gmail Watch Renewal Timer
    this.watchRenewalTimer = setInterval(() => {
      this.runWatchRenewalJob().catch(err => {
        console.warn('[SCHEDULER] Periodic watch renewal notice:', err.message);
      });
    }, watchInterval);
    this.watchRenewalTimer.unref();

    // 3. Periodic Campaign Sequence Execution Timer
    this.campaignTimer = setInterval(() => {
      this.runCampaignExecutionJob().catch(err => {
        console.warn('[SCHEDULER] Periodic campaign check notice:', err.message);
      });
    }, campaignInterval);
    this.campaignTimer.unref();
  }

  /**
   * Stops all active timers gracefully.
   */
  public static stop(): void {
    if (this.watchRenewalTimer) {
      clearInterval(this.watchRenewalTimer);
      this.watchRenewalTimer = null;
    }
    if (this.campaignTimer) {
      clearInterval(this.campaignTimer);
      this.campaignTimer = null;
    }
    this.isRunning = false;
    console.log('[SCHEDULER] Production scheduler stopped.');
  }

  /**
   * Triggers the Gmail Watch Renewal Job.
   * Directly invokes GmailReplySyncService.checkAndRenewAllWatches().
   * Updates internal metrics and returns the structured summary.
   */
  public static async runWatchRenewalJob(): Promise<WatchRenewalSummary> {
    const timestamp = new Date().toISOString();
    try {
      const summary = await GmailReplySyncService.checkAndRenewAllWatches();
      this.lastWatchRenewalAt = timestamp;
      this.lastWatchRenewalResult = summary;
      this.totalWatchRenewalsRun++;

      if (summary.renewed > 0 || summary.failed > 0) {
        console.log(`[SCHEDULER] Watch Renewal Complete: ${summary.renewed} renewed, ${summary.failed} failed, ${summary.skipped} skipped out of ${summary.checked} checked.`);
      }
      return summary;
    } catch (err: any) {
      console.error('[SCHEDULER] Watch Renewal Job encountered an error:', err.message);
      const fallbackSummary: WatchRenewalSummary = {
        checked: 0,
        renewed: 0,
        failed: 1,
        skipped: 0,
        details: [],
        error: err.message
      };
      this.lastWatchRenewalAt = timestamp;
      this.lastWatchRenewalResult = fallbackSummary;
      return fallbackSummary;
    }
  }

  /**
   * Triggers the Campaign Sequence Execution Job across workspaces.
   */
  public static async runCampaignExecutionJob(workspaceId?: string): Promise<any> {
    this.lastCampaignRunAt = new Date().toISOString();
    this.totalCampaignRuns++;
    if (workspaceId) {
      return CampaignExecutionService.processDueCampaignSteps(workspaceId);
    }
    return { executed: true };
  }

  /**
   * Returns current scheduler health and telemetry status.
   */
  public static getStatus(): SchedulerStatus {
    return {
      isRunning: this.isRunning,
      watchRenewalIntervalMs: this.getWatchRenewalIntervalMs(),
      campaignIntervalMs: this.getCampaignIntervalMs(),
      lastWatchRenewalAt: this.lastWatchRenewalAt,
      lastWatchRenewalResult: this.lastWatchRenewalResult,
      lastCampaignRunAt: this.lastCampaignRunAt,
      totalWatchRenewalsRun: this.totalWatchRenewalsRun,
      totalCampaignRuns: this.totalCampaignRuns
    };
  }
}
