import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { verifyJwt } from '../services/auth.service';
import { config } from '../config/env';
import { createUserRepository } from '../repositories/users';
import { createApiKeyRepository } from '../repositories/api-keys';

export const DEFAULT_USER_ID = 'user-default-001';
export const DEFAULT_WORKSPACE_ID = 'ws-default-001';

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

const userRepository = createUserRepository();
const apiKeyRepository = createApiKeyRepository();

export const authenticateApiKeyOrJwt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const rawApiKey = req.headers['x-huntiq-api-key'];

  // 1. Check Bearer Token (JWT or Programmatic API Key)
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

    // Fallback: Check if Bearer token is a programmatic API key
    const keyHash = crypto.createHash('sha256').update(token).digest('hex');
    const matchedKey = await apiKeyRepository.findByHash(keyHash);
    if (matchedKey) {
      const user = await userRepository.findById(matchedKey.userId);
      if (user && user.status === 'active') {
        req.user = {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          workspaceId: user.workspaceId,
          defaultCurrency: user.defaultCurrency
        };
        return next();
      }
    }
  }

  // 2. Check Programmatic API Key Header
  if (rawApiKey && typeof rawApiKey === 'string') {
    const keyHash = crypto.createHash('sha256').update(rawApiKey.trim()).digest('hex');
    const matchedKey = await apiKeyRepository.findByHash(keyHash);
    if (matchedKey) {
      const user = await userRepository.findById(matchedKey.userId);
      if (user && user.status === 'active') {
        req.user = {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          workspaceId: user.workspaceId,
          defaultCurrency: user.defaultCurrency
        };
        return next();
      }
    }
  }

  // 3. Allow public unauthenticated routes
  const publicPaths = [
    '/api/health',
    '/',
    '/api/v1/auth/login',
    '/api/v1/auth/signup',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/v1/integrations/email-scraper/webhook',
    '/api/v1/auth/google/callback',
    '/api/auth/google/callback',
    '/v1/auth/google/callback',
    '/auth/google/callback'
  ];

  if (publicPaths.includes(req.path)) {
    return next();
  }

  // 4. Strict Authentication Enforcement: Reject missing/invalid auth with 401
  if (process.env.ALLOW_DEV_AUTH_BYPASS !== 'true') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please provide a valid Bearer token or X-HUNTIQ-API-KEY header.'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  // 5. Explicit Development bypass (Only when ALLOW_DEV_AUTH_BYPASS === 'true')
  res.setHeader('X-Huntiq-Dev-Bypass', 'active');
  const defaultUser = await userRepository.findById(DEFAULT_USER_ID);
  req.user = {
    id: DEFAULT_USER_ID,
    email: defaultUser?.email || 'demo@huntiq.io',
    fullName: defaultUser?.fullName || 'Ayoola Ade',
    role: defaultUser?.role || 'owner',
    workspaceId: defaultUser?.workspaceId || DEFAULT_WORKSPACE_ID,
    defaultCurrency: defaultUser?.defaultCurrency || 'USD'
  };
  return next();
};
