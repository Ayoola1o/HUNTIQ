import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { db } from '../db/memoryStore';
import { enrichmentService } from '../services/enrichmentService';
import { contactService } from '../services/contactService';
import { ContactEnrichmentEngine } from '../engine';
import type { AuthenticatedRequest } from '../middleware/auth';

export const contactsRouter = Router();

/**
 * GET /api/contacts
 * Query contacts with optional filters
 */
contactsRouter.get('/contacts', (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-main';
  const { companyId, seniority, department, search } = req.query as Record<string, string | undefined>;

  let list = db.contacts.filter(c => c.workspaceId === workspaceId);

  if (companyId) {
    list = list.filter(c => c.companyId === companyId);
  }
  if (seniority && seniority !== 'All') {
    list = list.filter(c => c.seniority?.toLowerCase() === seniority.toLowerCase());
  }
  if (department && department !== 'All') {
    list = list.filter(c => c.department?.toLowerCase().includes(department.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c => 
      c.firstName.toLowerCase().includes(q) || 
      c.lastName.toLowerCase().includes(q) || 
      c.jobTitle.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }

  res.status(200).json({
    success: true,
    data: list,
    meta: {
      total: list.length,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * POST /api/contacts/enrich
 * Trigger automated decision-maker and email enrichment for a company
 */
contactsRouter.post('/contacts/enrich', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-main';
  const { companyId } = req.body || {};

  if (!companyId) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_COMPANY_ID', message: 'companyId is required for contact enrichment.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  try {
    const result = await enrichmentService.enrichCompanyContacts(companyId, workspaceId);

    const response: ApiResponse = {
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() }
    };

    res.status(200).json(response);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ENRICHMENT_ERROR', message: err.message || 'Failed to enrich contacts.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }
});

/**
 * POST /api/contacts/verify-email
 * Deliverability verification for a single email address
 */
contactsRouter.post('/contacts/verify-email', (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_EMAIL', message: 'Valid email string is required.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const result = ContactEnrichmentEngine.verifyEmail(email);

  res.status(200).json({
    success: true,
    data: result,
    meta: { timestamp: new Date().toISOString() }
  });
});

/**
 * GET /api/contacts/pattern/:domain
 * Discover organizational email conventions for a target company domain
 */
contactsRouter.get('/contacts/pattern/:domain', (req: AuthenticatedRequest, res: Response) => {
  const { domain } = req.params;

  const result = ContactEnrichmentEngine.discoverDomainPattern(domain);

  res.status(200).json({
    success: true,
    data: result,
    meta: { timestamp: new Date().toISOString() }
  });
});

/**
 * POST /api/contacts
 * Manually add a verified contact
 */
contactsRouter.post('/contacts', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-main';

  try {
    const newContact = await contactService.addContact(workspaceId, req.body);

    res.status(201).json({
      success: true,
      data: newContact,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'CREATE_CONTACT_ERROR', message: err.message },
      meta: { timestamp: new Date().toISOString() }
    });
  }
});
