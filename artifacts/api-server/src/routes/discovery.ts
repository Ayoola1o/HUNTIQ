import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { discoveryService } from '../services/discoveryService';
import type { DiscoveryQuery } from '../../src/types/discovery';

export const discoveryRouter = Router();

// 1. Search for businesses across Local Business, E-Commerce, or Competitor Gap modes
discoveryRouter.post('/discovery/search', (req: Request, res: Response) => {
  const queryPayload = (req.body || {}) as DiscoveryQuery;

  const result = discoveryService.search(queryPayload);

  const response: ApiResponse = {
    success: true,
    data: result,
    meta: {
      total: result.businesses.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 2. Get preset niche and industry discovery templates
discoveryRouter.get('/discovery/templates', (_req: Request, res: Response) => {
  const templates = discoveryService.getTemplates();

  const response: ApiResponse = {
    success: true,
    data: templates,
    meta: {
      total: templates.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 3. Get single discovered business details by ID
discoveryRouter.get('/discovery/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const business = discoveryService.getById(id);

  if (!business) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'DISCOVERED_BUSINESS_NOT_FOUND',
        message: `Discovered business with ID '${id}' was not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const response: ApiResponse = {
    success: true,
    data: business,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});
