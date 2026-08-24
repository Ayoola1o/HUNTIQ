import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { prospectorEngine } from '../../src/engine/prospectorEngine';

export const companiesRouter = Router();

companiesRouter.get('/companies', (req: Request, res: Response) => {
  const query = req.query.q as string | undefined;
  const industry = req.query.industry as string | undefined;

  let list = prospectorEngine.getAllCompanies();

  if (query) {
    list = list.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) || 
      c.domain.toLowerCase().includes(query.toLowerCase())
    );
  }

  if (industry && industry !== 'All') {
    list = list.filter(c => c.industry.toLowerCase().includes(industry.toLowerCase()));
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

companiesRouter.get('/companies/:id', (req: Request, res: Response) => {
  const company = prospectorEngine.getCompanyById(req.params.id);

  if (!company) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'COMPANY_NOT_FOUND',
        message: `Company with ID '${req.params.id}' was not found.`
      },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  res.status(200).json({
    success: true,
    data: company,
    meta: { timestamp: new Date().toISOString() }
  });
});
