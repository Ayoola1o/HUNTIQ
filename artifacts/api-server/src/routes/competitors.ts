import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { competitorService } from '../services/competitorService';
import type { RunCompetitorAnalysisPayload } from '../../src/types/competitorAnalysis';

export const competitorsRouter = Router();

// 1. Run competitor discovery and benchmark analysis
competitorsRouter.post('/competitors/analyze', (req: Request, res: Response) => {
  const payload = (req.body || {}) as RunCompetitorAnalysisPayload;

  if (!payload.prospectName) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'MISSING_PROSPECT_NAME',
        message: 'Target prospectName is required to run competitor benchmark.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  const result = competitorService.analyze(payload);

  const response: ApiResponse = {
    success: true,
    data: result,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 2. Retrieve competitor analysis by prospect ID or analysis ID
competitorsRouter.get('/competitors/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const analysis = competitorService.getById(id);

  if (!analysis) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'COMPETITOR_ANALYSIS_NOT_FOUND',
        message: `Competitor analysis for '${id}' was not found.`
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
