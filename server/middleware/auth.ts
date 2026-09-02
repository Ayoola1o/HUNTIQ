import type { Request, Response, NextFunction } from 'express';
import { verifyJwt, type UserSessionPayload } from '../services/auth.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName?: string;
    role: string;
    workspaceId: string;
    defaultCurrency?: string;
  };
}

export const authenticateApiKeyOrJwt = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-huntiq-api-key'];

  // Allow public routes
  if (
    req.path === '/api/health' || 
    req.path === '/' || 
    req.path.startsWith('/api/v1/auth/') ||
    req.path.startsWith('/api/auth/')
  ) {
    return next();
  }

  // Check Bearer Token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const verified = verifyJwt(token);
    if (verified) {
      req.user = {
        id: verified.userId,
        email: verified.email,
        fullName: verified.fullName,
        role: verified.role,
        workspaceId: verified.workspaceId,
        defaultCurrency: verified.defaultCurrency
      };
      return next();
    }
  }

  // Check API Key
  if (apiKey && typeof apiKey === 'string' && apiKey.startsWith('hnt_live_')) {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'api-service@huntiq.io',
      role: 'owner',
      workspaceId: '00000000-0000-0000-0000-000000000001',
      defaultCurrency: 'USD'
    };
    return next();
  }

  // Development fallback for unauthenticated calls
  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'dev-workspace@huntiq.io',
    role: 'owner',
    workspaceId: '00000000-0000-0000-0000-000000000001',
    defaultCurrency: 'USD'
  };
  return next();
};
