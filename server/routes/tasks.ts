import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse } from '../types/api';
import { taskService } from '../services/taskService';

export const tasksRouter = Router();

// 1. List tasks with optional filters & KPI summary
tasksRouter.get('/tasks', (req: Request, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const priority = typeof req.query.priority === 'string' ? req.query.priority : undefined;
  const dueCategory = typeof req.query.dueCategory === 'string' ? req.query.dueCategory : undefined;
  const query = typeof req.query.q === 'string' ? req.query.q : (typeof req.query.query === 'string' ? req.query.query : undefined);

  const { tasks, kpiSummary } = taskService.list({
    status,
    priority,
    dueCategory,
    query
  });

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
tasksRouter.get('/tasks/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const task = taskService.getById(id);

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

// 3. Create task
tasksRouter.post('/tasks', (req: Request, res: Response) => {
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

  const created = taskService.create(payload);

  const response: ApiResponse = {
    success: true,
    data: created,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(201).json(response);
});

// 4. Update task
tasksRouter.patch('/tasks/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const updates = req.body;

  const updated = taskService.update(id, updates);

  if (!updated) {
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
    data: updated,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 5. Toggle completion
tasksRouter.post('/tasks/:id/toggle', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const toggled = taskService.toggleComplete(id);

  if (!toggled) {
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
    data: toggled,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

// 6. Delete task
tasksRouter.delete('/tasks/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const deleted = taskService.delete(id);

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
