import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { savedSearchService } from '../services/savedSearchService';

export const savedSearchesRouter = Router();

// 1. List saved searches with optional filters & KPI summary
savedSearchesRouter.get('/saved-searches', (req: Request, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const searchType = typeof req.query.searchType === 'string' ? req.query.searchType : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);
  const monitoring = req.query.monitoring === 'true' ? true : (req.query.monitoring === 'false' ? false : undefined);

  const { searches, kpiSummary } = savedSearchService.list({
    status,
    searchType,
    monitoring,
    query
  });

  const response: ApiResponse = {
    success: true,
    data: {
      searches,
      kpiSummary
    },
    meta: {
      total: searches.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 2. Get specific saved search by ID
savedSearchesRouter.get('/saved-searches/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const search = savedSearchService.getById(id);

  if (!search) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'SAVED_SEARCH_NOT_FOUND',
        message: `Saved search with ID '${id}' was not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const response: ApiResponse = {
    success: true,
    data: search,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 3. Create a new saved search
savedSearchesRouter.post('/saved-searches', (req: Request, res: Response) => {
  const {
    name,
    description,
    searchType,
    naturalQuery,
    filters,
    signalsToWatch,
    icpName,
    monitoringEnabled,
    alertFrequency,
    alertSettings
  } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Search name is required.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  const created = savedSearchService.create({
    name: name.trim(),
    description,
    searchType: searchType || 'ai_search',
    naturalQuery,
    filters: filters || {
      industries: ['Technology & SaaS'],
      locations: ['Lagos, Nigeria'],
      companySizes: ['50 – 500']
    },
    signalsToWatch: signalsToWatch || ['Hiring Surge', 'Regional Expansion'],
    icpName: icpName || 'Primary Growth ICP',
    monitoringEnabled: monitoringEnabled !== false,
    alertFrequency: alertFrequency || 'immediately',
    alertSettings
  });

  const response: ApiResponse = {
    success: true,
    data: created,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(201).json(response);
});

// 4. Update saved search parameters
savedSearchesRouter.patch('/saved-searches/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updated = savedSearchService.update(id, req.body || {});

  if (!updated) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'SAVED_SEARCH_NOT_FOUND',
        message: `Saved search with ID '${id}' was not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const response: ApiResponse = {
    success: true,
    data: updated,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 5. On-demand search execution
savedSearchesRouter.post('/saved-searches/:id/run', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = savedSearchService.run(id);

  if (!result) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'SAVED_SEARCH_NOT_FOUND',
        message: `Saved search with ID '${id}' was not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const response: ApiResponse = {
    success: true,
    data: result,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 6. Pause monitoring
savedSearchesRouter.post('/saved-searches/:id/pause', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = savedSearchService.pause(id);

  if (!result) {
    return res.status(404).json({
      success: false,
      error: { code: 'SAVED_SEARCH_NOT_FOUND', message: `Saved search '${id}' not found.` }
    });
  }

  res.status(200).json({
    success: true,
    data: result,
    meta: { timestamp: new Date().toISOString() }
  });
});

// 7. Resume monitoring
savedSearchesRouter.post('/saved-searches/:id/resume', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = savedSearchService.resume(id);

  if (!result) {
    return res.status(404).json({
      success: false,
      error: { code: 'SAVED_SEARCH_NOT_FOUND', message: `Saved search '${id}' not found.` }
    });
  }

  res.status(200).json({
    success: true,
    data: result,
    meta: { timestamp: new Date().toISOString() }
  });
});

// 8. Delete saved search
savedSearchesRouter.delete('/saved-searches/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = savedSearchService.delete(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: { code: 'SAVED_SEARCH_NOT_FOUND', message: `Saved search '${id}' not found.` }
    });
  }

  res.status(200).json({
    success: true,
    data: { id, deleted: true },
    meta: { timestamp: new Date().toISOString() }
  });
});

// 9. Get search results / matched companies
savedSearchesRouter.get('/saved-searches/:id/results', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const search = savedSearchService.getById(id);

  if (!search) {
    return res.status(404).json({
      success: false,
      error: { code: 'SAVED_SEARCH_NOT_FOUND', message: `Saved search '${id}' not found.` }
    });
  }

  res.status(200).json({
    success: true,
    data: search.matchedCompanies,
    meta: { total: search.matchedCompanies.length, timestamp: new Date().toISOString() }
  });
});

// 10. Get activity history
savedSearchesRouter.get('/saved-searches/:id/activity', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const search = savedSearchService.getById(id);

  if (!search) {
    return res.status(404).json({
      success: false,
      error: { code: 'SAVED_SEARCH_NOT_FOUND', message: `Saved search '${id}' not found.` }
    });
  }

  res.status(200).json({
    success: true,
    data: search.activityHistory,
    meta: { total: search.activityHistory.length, timestamp: new Date().toISOString() }
  });
});

// 11. Update alert preferences
savedSearchesRouter.patch('/saved-searches/:id/alert-settings', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { alertSettings, alertFrequency } = req.body || {};

  const updated = savedSearchService.updateAlertSettings(id, alertSettings, alertFrequency);

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'SAVED_SEARCH_NOT_FOUND', message: `Saved search '${id}' not found.` }
    });
  }

  res.status(200).json({
    success: true,
    data: updated,
    meta: { timestamp: new Date().toISOString() }
  });
});
