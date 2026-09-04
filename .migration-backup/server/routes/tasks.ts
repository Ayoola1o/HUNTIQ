import { Router } from 'express';
import type { Response } from 'express';
import type { ApiResponse } from '../types/api';
import { createTaskRepository } from '../repositories/tasks';
import type { AuthenticatedRequest } from '../middleware/auth';

export const tasksRouter = Router();
const taskRepository = createTaskRepository();

// 1. List tasks with optional filters & KPI summary
tasksRouter.get('/tasks', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const priority = typeof req.query.priority === 'string' ? req.query.priority : undefined;
  const dueCategory = typeof req.query.dueCategory === 'string' ? req.query.dueCategory : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);

  const tasks = await taskRepository.list(workspaceId, {
    status,
    priority,
    dueCategory,
    query
  });

  const dueToday = tasks.filter(t => t.dueCategory === 'today' && t.status !== 'completed').length;
  const overdue = tasks.filter(t => t.dueCategory === 'overdue' && t.status !== 'completed').length;
  const upcoming = tasks.filter(t => t.dueCategory === 'upcoming' && t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const kpiSummary = {
    dueToday,
    overdue,
    upcoming,
    completedCount
  };

  const response: ApiResponse = {
    success: true,
    data: {
      tasks,
      kpiSummary
    },
    meta: {
      total: tasks.length,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 2. Get task by ID
tasksRouter.get('/tasks/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const task = await taskRepository.getById(id, workspaceId);

  if (!task) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'TASK_NOT_FOUND',
        message: `Task with ID '${id}' was not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const response: ApiResponse = {
    success: true,
    data: task,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 3. Create a new task
tasksRouter.post('/tasks', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const userId = req.user?.id;
  const payload = req.body;

  if (!payload || !payload.title) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_TASK_PAYLOAD',
        message: 'Task title is required.'
      }
    };
    return res.status(400).json(errorResponse);
  }

  const created = await taskRepository.create(payload, workspaceId, userId);

  const response: ApiResponse = {
    success: true,
    data: created,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(201).json(response);
});

// 4. Update task details or status
tasksRouter.patch('/tasks/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updates = req.body;

  const updated = await taskRepository.update(id, updates, workspaceId);

  if (!updated) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'TASK_NOT_FOUND',
        message: `Task with ID '${id}' not found for update.`
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

// 5. Toggle task completion
tasksRouter.post('/tasks/:id/toggle', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existing = await taskRepository.getById(id, workspaceId);

  if (!existing) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'TASK_NOT_FOUND',
        message: `Task with ID '${id}' not found.`
      }
    };
    return res.status(404).json(errorResponse);
  }

  const newStatus = existing.status === 'completed' ? 'todo' : 'completed';
  const updated = await taskRepository.update(id, {
    status: newStatus,
    dueCategory: newStatus === 'completed' ? 'completed' : 'today',
    completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
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

// 6. Delete a task
tasksRouter.delete('/tasks/:id', async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.user?.workspaceId || 'ws-default-001';
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = await taskRepository.delete(id, workspaceId);

  if (!deleted) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'TASK_NOT_FOUND',
        message: `Task with ID '${id}' not found for deletion.`
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
