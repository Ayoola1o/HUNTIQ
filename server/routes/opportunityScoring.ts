import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { opportunityScoringService } from '../services/opportunityScoringService';
import type { CalculateOpportunityPayload } from '../../src/types/opportunityScoring';

export const opportunityScoringRouter = Router();

// 1. Calculate SEO Opportunity Score and multi-factor breakdown
opportunityScoringRouter.post('/opportunity-scoring/calculate', (req: Request, res: Response) => {
  const payload = (req.body || {}) as CalculateOpportunityPayload;

  if (!payload.prospectName) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'MISSING_PROSPECT_NAME',
        message: 'Target prospectName is required to calculate opportunity score.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  const result = opportunityScoringService.calculate(payload);

  const response: ApiResponse = {
    success: true,
    data: result,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 2. Retrieve opportunity score analysis by prospect ID or ID
opportunityScoringRouter.get('/opportunity-scoring/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const analysis = opportunityScoringService.getById(id);

  if (!analysis) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'OPPORTUNITY_SCORE_NOT_FOUND',
        message: `Opportunity scoring record for '${id}' was not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const response: ApiResponse = {
    success: true,
    data: analysis,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});
