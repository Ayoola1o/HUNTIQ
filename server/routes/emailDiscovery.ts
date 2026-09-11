import { Router, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import { EmailDiscoveryService } from '../services/emailDiscoveryService';

export const emailDiscoveryRouter = Router();

/**
 * POST /api/v1/email-discovery/jobs
 * POST /api/v1/integrations/email-scraper/discover
 * Initiates an email discovery job for a company/domain.
 */
emailDiscoveryRouter.post(
  ['/email-discovery/jobs', '/integrations/email-scraper/discover'],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const workspaceId = req.user?.workspaceId;
      if (!workspaceId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
      }

      const { companyId, companyName, domain, website } = req.body || {};
      if (!domain && !website) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_TARGET', message: 'Either domain or website is required' }
        });
      }

      const job = await EmailDiscoveryService.createScrapeJob({
        workspaceId,
        userId: req.user?.id,
        companyId,
        companyName,
        domain,
        website
      });

      return res.status(201).json({
        success: true,
        data: job
      });
    } catch (err: any) {
      const statusCode = err.message?.includes('SSRF') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        error: {
          code: err.code || 'DISCOVERY_JOB_FAILED',
          message: err.message || 'Failed to start email discovery job'
        }
      });
    }
  }
);

/**
 * GET /api/v1/email-discovery/jobs
 * GET /api/v1/integrations/email-scraper/jobs
 * Lists discovery jobs for authenticated workspace.
 */
emailDiscoveryRouter.get(
  ['/email-discovery/jobs', '/integrations/email-scraper/jobs'],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const workspaceId = req.user?.workspaceId;
      if (!workspaceId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
      }

      const limit = parseInt(String(req.query.limit || '50'), 10);
      const jobs = await EmailDiscoveryService.listScrapeJobs(workspaceId, limit);

      return res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message }
      });
    }
  }
);

/**
 * GET /api/v1/email-discovery/jobs/:id
 * GET /api/v1/integrations/email-scraper/jobs/:id
 * Retrieves job status, scoped strictly to authenticated workspace.
 */
emailDiscoveryRouter.get(
  ['/email-discovery/jobs/:id', '/integrations/email-scraper/jobs/:id'],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const workspaceId = req.user?.workspaceId;
      if (!workspaceId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
      }

      const job = await EmailDiscoveryService.getScrapeJobStatus(req.params.id, workspaceId);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: { code: 'JOB_NOT_FOUND', message: 'Discovery job not found in this workspace' }
        });
      }

      return res.status(200).json({
        success: true,
        data: job
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message }
      });
    }
  }
);

/**
 * POST /api/v1/email-discovery/jobs/:id/cancel
 * POST /api/v1/integrations/email-scraper/jobs/:id/cancel
 * Cancels an active discovery job.
 */
emailDiscoveryRouter.post(
  ['/email-discovery/jobs/:id/cancel', '/integrations/email-scraper/jobs/:id/cancel'],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const workspaceId = req.user?.workspaceId;
      if (!workspaceId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
      }

      const job = await EmailDiscoveryService.cancelScrapeJob(req.params.id, workspaceId);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: { code: 'JOB_NOT_FOUND', message: 'Discovery job not found in this workspace' }
        });
      }

      return res.status(200).json({
        success: true,
        data: job
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message }
      });
    }
  }
);
