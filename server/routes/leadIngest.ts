import { Router, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import { LeadIngestionService, ExternalLeadPayload } from '../services/leadIngestionService';
import { db } from '../db/memoryStore';

export const leadIngestRouter = Router();

/**
 * POST /api/v1/integrations/lead-ingest
 * Ingests external email scraper records into HUNTIQ Contacts and queues Outreach Drafts for review.
 * Accepts:
 *  - { leads: ExternalLeadPayload[], source?: string, createOutreachDraft?: boolean }
 *  - OR raw array: ExternalLeadPayload[]
 */
leadIngestRouter.post('/integrations/lead-ingest', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaceId = (req.headers['x-workspace-id'] as string) || req.user?.workspaceId || 'ws-main';
    const userId = req.user?.id || 'usr-1';

    let leads: ExternalLeadPayload[] = [];
    let source = 'EXTERNAL_EMAIL_SCRAPER';
    let createOutreachDraft = true;

    if (Array.isArray(req.body)) {
      leads = req.body;
    } else if (req.body && typeof req.body === 'object') {
      if (Array.isArray(req.body.leads)) {
        leads = req.body.leads;
      } else if (Array.isArray(req.body.records)) {
        // Scraper result payload compatibility
        leads = req.body.records;
      } else if (req.body.email) {
        // Single lead payload
        leads = [req.body];
      }
      if (req.body.source && typeof req.body.source === 'string') {
        source = req.body.source;
      }
      if (typeof req.body.createOutreachDraft === 'boolean') {
        createOutreachDraft = req.body.createOutreachDraft;
      }
    }

    if (!leads || leads.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_PAYLOAD',
          message: 'No leads provided in payload. Expected { leads: [...] } or an array of lead objects.'
        }
      });
    }

    const result = await LeadIngestionService.ingestLeads(leads, {
      workspaceId,
      userId,
      source,
      createOutreachDraft
    });

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${result.totalReceived} leads: ${result.ingestedCount} contacts created, ${result.outreachDraftsCount} outreach drafts ready for review.`,
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
 * Returns ingestion summary metrics for the active workspace
 */
leadIngestRouter.get('/integrations/lead-ingest/status', (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = (req.headers['x-workspace-id'] as string) || req.user?.workspaceId || 'ws-main';

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
