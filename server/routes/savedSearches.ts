import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { createSavedSearchRepository } from '../repositories/saved-searches';
import type { AuthenticatedRequest } from '../middleware/auth';

export const savedSearchesRouter = Router();
const savedSearchRepository = createSavedSearchRepository();

// 1. List saved searches with optional filters & KPI summary
savedSearchesRouter.get('/saved-searches', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const searchType = typeof req.query.searchType === 'string' ? req.query.searchType : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);
  const monitoring = req.query.monitoring === 'true' ? true : (req.query.monitoring === 'false' ? false : undefined);

  const searches = await savedSearchRepository.list(workspaceId, {
    status,
    searchType,
    monitoring,
    query
  });

  const activeMonitoring = searches.filter(s => s.monitoringEnabled).length;
  const totalMatchesTracked = searches.reduce((acc, s) => acc + (s.totalMatches || 0), 0);
  const newMatchesThisWeek = searches.reduce((acc, s) => acc + (s.newMatchesCount || 0), 0);
  const highIntentAlerts = searches.reduce((acc, s) => acc + (s.highOpportunityCount || 0), 0);

  const kpiSummary = {
    activeMonitoring,
    totalMatchesTracked,
    newMatchesThisWeek,
    highIntentAlerts
  };

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
savedSearchesRouter.get('/saved-searches/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const search = await savedSearchRepository.getById(id, workspaceId);

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
savedSearchesRouter.post('/saved-searches', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const userId = req.user?.id;
  const payload = req.body;

  if (!payload || !payload.name) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_SAVED_SEARCH_PAYLOAD',
        message: 'Search name is required to save search criteria.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  const created = await savedSearchRepository.create(payload, workspaceId, userId);

  const response: ApiResponse = {
    success: true,
    data: created,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(201).json(response);
});

// 4. Update an existing saved search
savedSearchesRouter.patch('/saved-searches/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updates = req.body;

  const updated = await savedSearchRepository.update(id, updates, workspaceId);

  if (!updated) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'SAVED_SEARCH_NOT_FOUND',
        message: `Saved search with ID '${id}' not found for update.`
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

// 5. Toggle autonomous monitoring
savedSearchesRouter.post('/saved-searches/:id/toggle-monitoring', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existing = await savedSearchRepository.getById(id, workspaceId);

  if (!existing) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'SAVED_SEARCH_NOT_FOUND',
        message: `Saved search with ID '${id}' not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const updated = await savedSearchRepository.update(id, {
    monitoringEnabled: !existing.monitoringEnabled
  }, workspaceId);

  const response: ApiResponse = {
    success: true,
    data: updated,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 6. Delete saved search
savedSearchesRouter.delete('/saved-searches/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = await savedSearchRepository.delete(id, workspaceId);

  if (!deleted) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'SAVED_SEARCH_NOT_FOUND',
        message: `Saved search with ID '${id}' not found for deletion.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const response: ApiResponse = {
    success: true,
    data: { id, deleted: true },
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});
