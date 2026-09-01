import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { createCompanyRepository, InMemoryCompanyRepository } from '../repositories/companies';
import { CompanyResolver } from '../engine';

export const companiesRouter = Router();
const companyRepository = createCompanyRepository();

companiesRouter.get('/companies', async (req: Request, res: Response) => {
  const query = typeof req.query.q === 'string' ? req.query.q : undefined;
  const industry = typeof req.query.industry === 'string' ? req.query.industry : undefined;
  
  let list: any[] = [];
  try {
    list = await companyRepository.list({ query, industry });
  } catch {
    list = await new InMemoryCompanyRepository().list({ query, industry });
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

companiesRouter.post('/companies', async (req: Request, res: Response) => {
  const {
    name,
    domain,
    website,
    industry,
    employeeRange,
    country,
    state,
    city,
    description,
    logoUrl,
    linkedinUrl,
    foundedYear,
  } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_COMPANY', message: 'name is required.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  const company = await companyRepository.create({
    name: name.trim(),
    domain: typeof domain === 'string' ? domain.trim() : undefined,
    website: typeof website === 'string' ? website.trim() : undefined,
    industry: typeof industry === 'string' ? industry.trim() : undefined,
    employeeRange: typeof employeeRange === 'string' ? employeeRange.trim() : undefined,
    country: typeof country === 'string' ? country.trim() : undefined,
    state: typeof state === 'string' ? state.trim() : undefined,
    city: typeof city === 'string' ? city.trim() : undefined,
    description: typeof description === 'string' ? description.trim() : undefined,
    logoUrl: typeof logoUrl === 'string' ? logoUrl.trim() : undefined,
    linkedinUrl: typeof linkedinUrl === 'string' ? linkedinUrl.trim() : undefined,
    foundedYear: Number.isFinite(Number(foundedYear)) ? Number(foundedYear) : undefined,
  });

  return res.status(201).json({
    success: true,
    data: company,
    meta: { timestamp: new Date().toISOString() }
  });
});

companiesRouter.get('/companies/:id', async (req: Request, res: Response) => {
  const companyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const company = await companyRepository.getById(companyId);

  if (!company) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'COMPANY_NOT_FOUND',
        message: `Company with ID '${companyId}' was not found.`
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

/**
 * POST /api/companies/resolve
 * Canonical entity resolution with domain normalization & fuzzy matching
 */
companiesRouter.post('/companies/resolve', async (req: Request, res: Response) => {
  const { name, domain, website, sourceUrl, boardToken, industry, city, country } = req.body || {};

  try {
    const result = await CompanyResolver.resolve({
      name,
      domain,
      website,
      sourceUrl,
      boardToken,
      industry,
      city,
      country
    });

    res.status(200).json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'RESOLUTION_ERROR', message: err.message },
      meta: { timestamp: new Date().toISOString() }
    });
  }
});

/**
 * POST /api/companies/merge
 * Consolidates duplicate company into target canonical company
 */
companiesRouter.post('/companies/merge', async (req: Request, res: Response) => {
  const { sourceCompanyId, targetCompanyId } = req.body || {};

  if (!sourceCompanyId || !targetCompanyId) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_PARAMS', message: 'sourceCompanyId and targetCompanyId are required.' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  try {
    const merged = await CompanyResolver.mergeCompanies(sourceCompanyId, targetCompanyId);

    res.status(200).json({
      success: true,
      data: merged,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'MERGE_ERROR', message: err.message },
      meta: { timestamp: new Date().toISOString() }
    });
  }
});
