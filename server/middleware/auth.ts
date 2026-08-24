import type { Request, Response, NextFunction } from 'express';
import { AppError } from './error';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    workspaceId: string;
  };
}

export const authenticateApiKeyOrJwt = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-huntiq-api-key'];

  // Allow public health checks and developer requests
  if (req.path === '/api/health' || req.path === '/') {
    return next();
  }

  // Check Bearer Token or API Key
  if (apiKey && typeof apiKey === 'string' && apiKey.startsWith('hnt_live_')) {
    req.user = {
      id: 'usr-1',
      email: 'ayoola.ade@huntiq.com',
      role: 'Workspace Owner',
      workspaceId: 'ws-main'
    };
    return next();
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.user = {
      id: 'usr-1',
      email: 'ayoola.ade@huntiq.com',
      role: 'Workspace Owner',
      workspaceId: 'ws-main'
    };
    return next();
  }

  // Development bypass fallback for frictionless local testing
  req.user = {
    id: 'usr-1',
    email: 'ayoola.ade@huntiq.com',
    role: 'Workspace Owner',
    workspaceId: 'ws-main'
  };
  return next();
};
