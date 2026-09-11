import { Router, Response } from 'express';
import crypto from 'node:crypto';
import type { AuthenticatedRequest } from '../middleware/auth';
import { LeadIngestionService, ExternalLeadPayload } from '../services/leadIngestionService';
import { EmailDiscoveryService } from '../services/emailDiscoveryService';
import { db } from '../db/memoryStore';
import { createApiKeyRepository } from '../repositories/api-keys';
import { EmailScraperConfigManager } from '../providers/emailScraper/emailScraperConfig';

export const leadIngestRouter = Router();
const apiKeyRepo = createApiKeyRepository();

/**
 * Helper to authenticate email-scraper integration webhook requests.
 * Derives the workspace strictly server-side from the verified credential.
 */
async function authenticateIntegrationRequest(req: AuthenticatedRequest): Promise<string | null> {
  // 1. Session or middleware user
  if (req.user?.workspaceId) {
    return req.user.workspaceId;
  }

  // 2. Bearer token or API key header
  const authHeader = req.headers.authorization;
  const rawKey = (req.headers['x-huntiq-api-key'] as string) ||
    (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null);

  if (!rawKey) return null;

  // Check against active API keys repository
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const matchedKey = await apiKeyRepo.findByHash(keyHash);
  if (matchedKey?.workspaceId) {
    return matchedKey.workspaceId;
  }

  // Check against configured provider key
  const scraperCfg = EmailScraperConfigManager.getConfig();
  if (scraperCfg.apiKey && rawKey === scraperCfg.apiKey && req.user?.workspaceId) {
    return req.user.workspaceId;
  }

  return null;
}

/**
 * POST /api/v1/integrations/email-scraper/webhook
 * Dedicated ingestion webhook for external Email Scraper integration (Contract v1.0).
 * Handles ping health-checks and structured contact discovery synchronization.
 */
leadIngestRouter.post('/integrations/email-scraper/webhook', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = await authenticateIntegrationRequest(req);
    if (!workspaceId) {
      return res.status(401).json({
        success: false,
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid or missing integration credentials. Unauthorized.'
      });
    }

    const payload = req.body;

    // Handle connection/health check ping
    if (payload && payload.action === 'ping') {
      return res.status(200).json({
        success: true,
        integration: 'huntiq',
        reachable: true,
        authenticated: true,
        message: 'HUNTIQ connection verified'
      });
    }

    // Validate payload schema
    if (!payload || typeof payload !== 'object' || !payload.requestId || !Array.isArray(payload.contacts)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PAYLOAD',
        message: 'Payload must include requestId and contacts array'
      });
    }

    if (payload.integration && payload.integration !== 'email-scraper') {
      return res.status(400).json({
        success: false,
        code: 'UNSUPPORTED_INTEGRATION',
        message: `Unsupported integration: ${payload.integration}`
      });
    }

    const result = await EmailDiscoveryService.processScrapeResult(payload, workspaceId);

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      code: 'WEBHOOK_PROCESSING_FAILED',
      message: err.message || 'An error occurred while processing webhook'
    });
  }
});

/**
 * POST /api/v1/integrations/lead-ingest
 * Ingests external lead records with strict server-side workspace isolation.
 */
leadIngestRouter.post('/integrations/lead-ingest', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = await authenticateIntegrationRequest(req);
    if (!workspaceId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Server-side workspace context could not be determined.'
        }
      });
    }

    const userId = req.user?.id;
    let leads: ExternalLeadPayload[] = [];
    let source = 'EXTERNAL_EMAIL_SCRAPER';

    if (Array.isArray(req.body)) {
      leads = req.body;
    } else if (req.body && typeof req.body === 'object') {
      if (Array.isArray(req.body.leads)) {
        leads = req.body.leads;
      } else if (Array.isArray(req.body.records)) {
        leads = req.body.records;
      } else if (req.body.email) {
        leads = [req.body];
      }
      if (req.body.source && typeof req.body.source === 'string') {
        source = req.body.source;
      }
    }

    if (!leads || leads.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_PAYLOAD',
          message: 'No leads provided in payload. Expected { leads: [...] } or array of lead objects.'
        }
      });
    }

    const result = await LeadIngestionService.ingestLeads(leads, {
      workspaceId,
      userId,
      source,
      createOutreachDraft: false // Strictly false: no unsolicited hallucinated drafts
    });

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${result.totalReceived} leads: ${result.ingestedCount} contacts created.`,
      data: result
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INGESTION_FAILED',
        message: err.message || 'An unexpected error occurred during lead ingestion'
      }
    });
  }
});

/**
 * GET /api/v1/integrations/lead-ingest/status
 * Returns ingestion summary metrics strictly scoped to authenticated workspace.
 */
leadIngestRouter.get('/integrations/lead-ingest/status', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = await authenticateIntegrationRequest(req);
  if (!workspaceId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const workspaceContacts = db.contacts.filter(c => c.workspaceId === workspaceId);
  const ingestedContacts = workspaceContacts.filter(c => 
    c.source === 'EXTERNAL_EMAIL_SCRAPER' || (c.source as string)?.includes('SCRAPER')
  );

  return res.json({
    success: true,
    data: {
      workspaceId,
      totalContacts: workspaceContacts.length,
      ingestedContactsCount: ingestedContacts.length,
      recentIngested: ingestedContacts.slice(-10).reverse()
    }
  });
});
