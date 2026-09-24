import { Router } from 'express';
import type { Request, Response } from 'express';
import { SchedulerService } from '../services/schedulerService';

export const cronRouter = Router();

/**
 * Middleware to verify cron authorization.
 * If CRON_SECRET is configured in environment, ensures either:
 * - Header 'x-cron-secret' matches CRON_SECRET, or
 * - Header 'Authorization' matches 'Bearer <CRON_SECRET>', or
 * - Request is authenticated user/admin.
 */
function verifyCronAuth(req: Request, res: Response, next: () => void) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return next(); // Unrestricted when CRON_SECRET is not configured (dev/test)
  }

  const headerSecret = req.headers['x-cron-secret'];
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

  if (headerSecret === cronSecret || bearerToken === cronSecret) {
    return next();
  }


  return res.status(401).json({
    success: false,
    error: {
      code: 'CRON_UNAUTHORIZED',
      message: 'Unauthorized cron request. Valid x-cron-secret or Authorization header required.'
    }
  });
}

/**
 * POST /api/cron/renew-watches (or /api/v1/cron/renew-watches)
 * Triggers Gmail watch renewal across all eligible workspaces.
 * Trace: scheduler/cron -> application endpoint/job -> GmailReplySyncService.checkAndRenewAllWatches()
 */
cronRouter.post(['/cron/renew-watches', '/jobs/renew-watches', '/auth/google/watch/renew-all'], verifyCronAuth, async (_req: Request, res: Response) => {
  try {
    const summary = await SchedulerService.runWatchRenewalJob();
    return res.status(200).json({
      success: true,
      data: summary,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('[CRON_JOB] Watch renewal endpoint failed:', err.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'WATCH_RENEWAL_JOB_FAILED',
        message: err.message
      }
    });
  }
});

/**
 * POST /api/cron/campaigns (or /api/v1/cron/campaigns)
 * Triggers due campaign sequence processing across active campaigns.
 */
cronRouter.post(['/cron/campaigns', '/jobs/campaigns'], verifyCronAuth, async (req: Request, res: Response) => {
  try {
    const workspaceId = (req as any).user?.workspaceId || (req.query.workspaceId as string);
    const result = await SchedulerService.runCampaignExecutionJob(workspaceId);
    return res.status(200).json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'CAMPAIGN_JOB_FAILED',
        message: err.message
      }
    });
  }
});

/**
 * POST /api/cron/run-all (or /api/v1/cron/run-all)
 * Triggers all background jobs (watch renewal + due campaign steps).
 */
cronRouter.post(['/cron/run-all', '/jobs/run-all'], verifyCronAuth, async (req: Request, res: Response) => {
  try {
    const watchSummary = await SchedulerService.runWatchRenewalJob();
    const workspaceId = (req as any).user?.workspaceId || (req.query.workspaceId as string);
    const campaignResult = await SchedulerService.runCampaignExecutionJob(workspaceId);

    return res.status(200).json({
      success: true,
      data: {
        watchRenewal: watchSummary,
        campaignExecution: campaignResult
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'CRON_RUN_ALL_FAILED',
        message: err.message
      }
    });
  }
});

/**
 * GET /api/cron/status (or /api/v1/cron/status)
 * Returns scheduler health, telemetry, intervals, and last execution results.
 */
cronRouter.get(['/cron/status', '/jobs/status'], verifyCronAuth, (_req: Request, res: Response) => {
  const status = SchedulerService.getStatus();
  return res.status(200).json({
    success: true,
    data: status,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});
