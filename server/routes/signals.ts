import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { signalEngine } from '../../src/engine/signalEngine';

export const signalsRouter = Router();

signalsRouter.get('/signals', (req: Request, res: Response) => {
  const type = req.query.type as string | undefined;
  const company = req.query.company as string | undefined;

  let list = signalEngine.getAllSignals();

  if (type && type !== 'all') {
    list = list.filter(s => s.type.toLowerCase() === type.toLowerCase());
  }

  if (company) {
    list = list.filter(s => s.companyName.toLowerCase().includes(company.toLowerCase()));
  }

  const response: ApiResponse = {
    success: true,
    data: list,
    meta: {
      total: list.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});
