import type { Request, Response, NextFunction } from 'express';
import { verifyJwt, type UserSessionPayload } from '../services/auth.service';
import { persistentStore, DEFAULT_USER_ID, DEFAULT_WORKSPACE_ID } from '../db/persistentStore';

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

  // 1. Check Bearer Token
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

  // 2. Check Programmatic API Key
  if (apiKey && typeof apiKey === 'string') {
    const keyMatch = persistentStore.findApiKey(apiKey);
    if (keyMatch) {
      req.user = {
        id: keyMatch.user.id,
        email: keyMatch.user.email,
        fullName: keyMatch.user.fullName,
        role: keyMatch.user.role,
        workspaceId: keyMatch.user.workspaceId,
        defaultCurrency: keyMatch.user.defaultCurrency
      };
      return next();
    }
  }

  // 3. Allow public routes without credentials
  if (
    req.path === '/api/health' || 
    req.path === '/' || 
    req.path === '/api/v1/auth/login' ||
    req.path === '/api/v1/auth/signup' ||
    req.path === '/api/auth/login' ||
    req.path === '/api/auth/signup'
  ) {
    return next();
  }

  // Development fallback for unauthenticated calls (points to default demo account)
  const defaultUser = persistentStore.getUserById(DEFAULT_USER_ID);
  req.user = {
    id: DEFAULT_USER_ID,
    email: defaultUser?.email || 'demo@huntiq.io',
    fullName: defaultUser?.fullName || 'Ayoola Ade',
    role: 'owner',
    workspaceId: DEFAULT_WORKSPACE_ID,
    defaultCurrency: defaultUser?.defaultCurrency || 'USD'
  };
  return next();
};

