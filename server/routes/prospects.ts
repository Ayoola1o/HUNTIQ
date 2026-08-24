import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { prospectorEngine } from '../../src/engine/prospectorEngine';
import { geoScraperEngine } from '../../src/engine/geoScraperEngine';

export const prospectsRouter = Router();

prospectsRouter.post('/prospects/search', (req: Request, res: Response) => {
  const { query, industries, locations, minScore, limit } = req.body || {};

  const results = prospectorEngine.searchProspects({
    query,
    industries,
    locations,
    minScore: minScore ? Number(minScore) : undefined,
    limit: limit ? Number(limit) : undefined
  });

  const response: ApiResponse = {
    success: true,
    data: results,
    meta: {
      total: results.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

prospectsRouter.post('/prospects/scrape-geo', (req: Request, res: Response) => {
  const { zoneId, district, radiusKm, categoryFilter } = req.body || {};

  const scraped = geoScraperEngine.scrapeZone(
    zoneId || 'lagos',
    district,
    radiusKm || 10,
    categoryFilter
  );

  const response: ApiResponse = {
    success: true,
    data: scraped,
    meta: {
      total: scraped.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});
