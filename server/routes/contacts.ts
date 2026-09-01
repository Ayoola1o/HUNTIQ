import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { enrichmentService } from '../services/enrichmentService';
import { contactService } from '../services/contactService';
import { ContactEnrichmentEngine } from '../engine';
import type { AuthenticatedRequest } from '../middleware/auth';

export const contactsRouter = Router();

/**
 * GET /api/contacts
 * Query contacts with tab, role, seniority, and search filters, returning live list & KPI data
 */
contactsRouter.get('/contacts', (req: AuthenticatedRequest, res: Response) => {
  const { tab, seniority, department, role, search, q } = req.query as Record<string, string | undefined>;

  const { contacts, kpiSummary } = contactService.listContacts({
    tab,
    seniority,
    department,
    role,
    search: search || q
  });

  const response: ApiResponse = {
    success: true,
    data: {
      contacts,
      kpiSummary
    },
    meta: {
      total: contacts.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

/**
 * GET /api/contacts/:id
 * Retrieve a specific contact
 */
contactsRouter.get('/contacts/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const contact = contactService.getById(id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: { code: 'CONTACT_NOT_FOUND', message: `Contact with ID '${id}' was not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  res.status(200).json({
    success: true,
    data: contact,
    meta: { timestamp: new Date().toISOString() }
  });
});

/**
 * POST /api/contacts
 * Manually add a verified contact
 */
contactsRouter.post('/contacts', (req: AuthenticatedRequest, res: Response) => {
  try {
    const newContact = contactService.createContact(req.body || {});

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

/**
 * POST /api/contacts/import
 * Bulk import contacts from CSV / file
 */
contactsRouter.post('/contacts/import', (req: AuthenticatedRequest, res: Response) => {
  const { contacts } = req.body || {};

  if (!Array.isArray(contacts)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_IMPORT_PAYLOAD', message: 'contacts must be an array.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const imported = contactService.importContacts(contacts);

  res.status(201).json({
    success: true,
    data: {
      importedCount: imported.length,
      contacts: imported
    },
    meta: { timestamp: new Date().toISOString() }
  });
});

/**
 * PATCH /api/contacts/:id
 * Update contact details / bookmark status / role
 */
contactsRouter.patch('/contacts/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updated = contactService.updateContact(id, req.body || {});

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'CONTACT_NOT_FOUND', message: `Contact with ID '${id}' was not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  res.status(200).json({
    success: true,
    data: updated,
    meta: { timestamp: new Date().toISOString() }
  });
});

/**
 * DELETE /api/contacts/:id
 * Delete contact
 */
contactsRouter.delete('/contacts/:id', (req: AuthenticatedRequest, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = contactService.deleteContact(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: { code: 'CONTACT_NOT_FOUND', message: `Contact with ID '${id}' was not found.` },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  res.status(200).json({
    success: true,
    data: { id, deleted: true },
    meta: { timestamp: new Date().toISOString() }
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

    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() }
    });
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
