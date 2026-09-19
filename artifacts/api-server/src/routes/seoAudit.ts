import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { seoAuditService } from '../services/seoAuditService';
import type { RunSeoAuditPayload } from '../../src/types/seoAudit';

export const seoAuditRouter = Router();

// 1. Run SEO Audit for target business or domain
seoAuditRouter.post('/seo-audit/analyze', (req: Request, res: Response) => {
  const payload = (req.body || {}) as RunSeoAuditPayload;

  if (!payload.businessName) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'MISSING_BUSINESS_NAME',
        message: 'Target businessName is required to execute an SEO audit.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  const result = seoAuditService.analyze(payload);

  const response: ApiResponse = {
    success: true,
    data: result,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 2. Retrieve existing SEO Audit by ID or Business ID
seoAuditRouter.get('/seo-audit/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const audit = seoAuditService.getById(id);

  if (!audit) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'SEO_AUDIT_NOT_FOUND',
        message: `SEO Audit for identifier '${id}' was not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const response: ApiResponse = {
    success: true,
    data: audit,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});
