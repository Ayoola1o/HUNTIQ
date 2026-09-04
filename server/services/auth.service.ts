import crypto from 'node:crypto';
import { postgresPool } from '../database/postgres';
import { config } from '../config/env';

export interface UserSessionPayload {
  userId: string;
  workspaceId: string;
  email: string;
  fullName: string;
  role: string;
  defaultCurrency: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    companyName?: string;
    workspaceId: string;
    role: string;
    defaultCurrency: string;
  };
  token: string;
}

/**
 * Standard RFC 7519 JWT generator with HMAC-SHA256
 */
export function signJwt(payload: UserSessionPayload, expiresInSeconds = 7 * 24 * 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', config.jwtSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * JWT Verification with timing-safe comparison
 */
export function verifyJwt(token: string): UserSessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', config.jwtSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload as UserSessionPayload;
  } catch {
    return null;
  }
}

import { hashPassword, verifyPassword, persistentStore } from '../db/persistentStore';
export { hashPassword, verifyPassword, persistentStore };


export class AuthService {
  /**
   * Register a new user with dedicated workspace
   */
  public async signup(params: {
    email: string;
    password: string;
    fullName: string;
    companyName?: string;
    defaultCurrency?: string;
  }): Promise<AuthResponse> {
    const normalizedEmail = params.email.trim().toLowerCase();
    const currency = params.defaultCurrency || 'USD';
    const workspaceName = params.companyName?.trim() || `${params.fullName}'s Workspace`;
    const workspaceSlug = `${workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

    const passwordHash = hashPassword(params.password);

    if (postgresPool) {
      try {
        const client = await postgresPool.connect();
        try {
          await client.query('BEGIN');

          // Check if user exists
          const existing = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
          if (existing.rows.length > 0) {
            throw new Error('An account with this email address already exists.');
          }

          // Create Workspace
          const wsResult = await client.query(
            'INSERT INTO workspaces (name, slug) VALUES ($1, $2) RETURNING id, name',
            [workspaceName, workspaceSlug]
          );
          const workspace = wsResult.rows[0];

          // Create User
          const userResult = await client.query(
            `INSERT INTO users (workspace_id, email, password_hash, full_name, company_name, role, default_currency)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, email, full_name, company_name, workspace_id, role, default_currency`,
            [workspace.id, normalizedEmail, passwordHash, params.fullName, params.companyName, 'owner', currency]
          );
          const user = userResult.rows[0];

          // Associate workspace owner
          await client.query('UPDATE workspaces SET owner_id = $1 WHERE id = $2', [user.id, workspace.id]);

          await client.query('COMMIT');

          const token = signJwt({
            userId: user.id,
            workspaceId: user.workspace_id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            defaultCurrency: user.default_currency
          });

          return {
            user: {
              id: user.id,
              email: user.email,
              fullName: user.full_name,
              companyName: user.company_name,
              workspaceId: user.workspace_id,
              role: user.role,
              defaultCurrency: user.default_currency
            },
            token
          };
        } catch (err: any) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      } catch (err: any) {
        if (err.message === 'An account with this email address already exists.') {
          throw err;
        }
        // Connection failure -> fall through to persistentStore
      }
    }

    // Persistent Store Fallback (persists to server/data/huntiq_store.json)
    const existing = persistentStore.getUserByEmail(normalizedEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const { user, workspace } = persistentStore.createUser({
      email: normalizedEmail,
      passwordHash,
      fullName: params.fullName,
      companyName: params.companyName,
      defaultCurrency: currency
    });

    const token = signJwt({
      userId: user.id,
      workspaceId: workspace.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      defaultCurrency: user.defaultCurrency
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        workspaceId: workspace.id,
        role: user.role,
        defaultCurrency: user.defaultCurrency
      },
      token
    };
  }

  /**
   * Authenticate an existing user
   */
  public async login(params: { email: string; password: string }): Promise<AuthResponse> {
    const normalizedEmail = params.email.trim().toLowerCase();

    if (postgresPool) {
      try {
        const res = await postgresPool.query(
          `SELECT id, email, password_hash, full_name, company_name, workspace_id, role, default_currency
           FROM users WHERE email = $1`,
          [normalizedEmail]
        );
        if (res.rows.length === 0) {
          throw new Error('Invalid email or password credentials.');
        }

        const user = res.rows[0];
        const valid = verifyPassword(params.password, user.password_hash);
        if (!valid) {
          throw new Error('Invalid email or password credentials.');
        }

        // Update last login
        await postgresPool.query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);

        const token = signJwt({
          userId: user.id,
          workspaceId: user.workspace_id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          defaultCurrency: user.default_currency
        });

        return {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            companyName: user.company_name,
            workspaceId: user.workspace_id,
            role: user.role,
            defaultCurrency: user.default_currency
          },
          token
        };
      } catch (err: any) {
        if (err.message === 'Invalid email or password credentials.') {
          throw err;
        }
        // Connection failure -> fall through to persistentStore
      }
    }

    const user = persistentStore.getUserByEmail(normalizedEmail);
    if (!user) {
      throw new Error('Invalid email or password credentials.');
    }
    const valid = verifyPassword(params.password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password credentials.');
    }

    persistentStore.logActivity({
      userId: user.id,
      workspaceId: user.workspaceId,
      action: 'User Signed In',
      entityType: 'auth',
      details: `Session authenticated for ${user.email}.`
    });

    const token = signJwt({
      userId: user.id,
      workspaceId: user.workspaceId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      defaultCurrency: user.defaultCurrency
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        workspaceId: user.workspaceId,
        role: user.role,
        defaultCurrency: user.defaultCurrency
      },
      token
    };
  }

  /**
   * Get user profile by userId
   */
  public async getProfile(userId: string): Promise<any> {
    if (postgresPool) {
      try {
        const res = await postgresPool.query(
          `SELECT id, email, full_name, company_name, workspace_id, role, default_currency, created_at
           FROM users WHERE id = $1`,
          [userId]
        );
        return res.rows[0] || null;
      } catch {
        // Fall through to persistentStore
      }
    }
    const u = persistentStore.getUserById(userId);
    if (!u) return null;
    const { passwordHash: _hash, ...safe } = u;
    return safe;
  }

  /**
   * Update user profile settings
   */
  public async updateProfile(userId: string, updates: { 
    fullName?: string; 
    companyName?: string; 
    defaultCurrency?: string;
    avatarUrl?: string;
    phone?: string;
    jobTitle?: string;
    department?: string;
    bio?: string;
    location?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
  }): Promise<any> {
    const updated = persistentStore.updateUserProfile(userId, updates);
    if (!updated) throw new Error('User not found.');
    const { passwordHash: _hash, ...safe } = updated;
    return safe;
  }

  /**
   * Onboarding Data Management
   */
  public getOnboarding(workspaceId: string) {
    return persistentStore.getWorkspaceOnboarding(workspaceId);
  }

  public saveOnboarding(userId: string, workspaceId: string, data: any) {
    return persistentStore.saveWorkspaceOnboarding(userId, workspaceId, data);
  }

  /**
   * API Keys Management
   */
  public listApiKeys(userId: string) {
    return persistentStore.getApiKeysByUser(userId);
  }

  public createApiKey(userId: string, name: string) {
    return persistentStore.createApiKey(userId, name);
  }

  public deleteApiKey(userId: string, keyId: string) {
    return persistentStore.deleteApiKey(userId, keyId);
  }

  /**
   * Activity / Audit Logs
   */
  public getActivityLogs(userId: string, limit = 50) {
    return persistentStore.getActivityLogsByUser(userId, limit);
  }
}

export const authService = new AuthService();

