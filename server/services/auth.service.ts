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

/**
 * Hash password with PBKDF2 + random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const verify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verify));
  } catch {
    return false;
  }
}

// In-Memory fallback store if PostgreSQL is offline
const inMemoryUsers: Map<string, any> = new Map();
const inMemoryWorkspaces: Map<string, any> = new Map();

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
        const workspaceId = wsResult.rows[0].id;

        // Create User
        const userResult = await client.query(
          `INSERT INTO users (workspace_id, email, password_hash, full_name, company_name, default_currency, role)
           VALUES ($1, $2, $3, $4, $5, $6, 'owner')
           RETURNING id, email, full_name, company_name, workspace_id, role, default_currency`,
          [workspaceId, normalizedEmail, passwordHash, params.fullName, params.companyName || null, currency]
        );
        const user = userResult.rows[0];

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
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      // In-Memory Dev Fallback
      if (inMemoryUsers.has(normalizedEmail)) {
        throw new Error('An account with this email address already exists.');
      }
      const workspaceId = crypto.randomUUID();
      const userId = crypto.randomUUID();

      inMemoryWorkspaces.set(workspaceId, { id: workspaceId, name: workspaceName, slug: workspaceSlug });
      const record = {
        id: userId,
        workspace_id: workspaceId,
        email: normalizedEmail,
        password_hash: passwordHash,
        full_name: params.fullName,
        company_name: params.companyName,
        role: 'owner',
        default_currency: currency
      };
      inMemoryUsers.set(normalizedEmail, record);

      const token = signJwt({
        userId,
        workspaceId,
        email: normalizedEmail,
        fullName: params.fullName,
        role: 'owner',
        defaultCurrency: currency
      });

      return {
        user: {
          id: userId,
          email: normalizedEmail,
          fullName: params.fullName,
          companyName: params.companyName,
          workspaceId,
          role: 'owner',
          defaultCurrency: currency
        },
        token
      };
    }
  }

  /**
   * Authenticate an existing user
   */
  public async login(params: { email: string; password: string }): Promise<AuthResponse> {
    const normalizedEmail = params.email.trim().toLowerCase();

    if (postgresPool) {
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
    } else {
      const user = inMemoryUsers.get(normalizedEmail);
      if (!user) {
        throw new Error('Invalid email or password credentials.');
      }
      const valid = verifyPassword(params.password, user.password_hash);
      if (!valid) {
        throw new Error('Invalid email or password credentials.');
      }

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
    }
  }

  /**
   * Get user profile by userId
   */
  public async getProfile(userId: string): Promise<any> {
    if (postgresPool) {
      const res = await postgresPool.query(
        `SELECT id, email, full_name, company_name, workspace_id, role, default_currency, created_at
         FROM users WHERE id = $1`,
        [userId]
      );
      return res.rows[0] || null;
    } else {
      for (const u of inMemoryUsers.values()) {
        if (u.id === userId) {
          const { password_hash, ...safe } = u;
          return safe;
        }
      }
      return null;
    }
  }
}

export const authService = new AuthService();
