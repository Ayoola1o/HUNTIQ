import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { researchEngine } from '../../src/engine/researchEngine';

export const researchRouter = Router();

researchRouter.post('/research/generate', (req: Request, res: Response) => {
  const { companyName } = req.body || {};

  if (!companyName) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_COMPANY_NAME',
        message: 'companyName is required to generate a research brief.'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const dossier = researchEngine.generateDossier(companyName);

  const response: ApiResponse = {
    success: true,
    data: dossier,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});
