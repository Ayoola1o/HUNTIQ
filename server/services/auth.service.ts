import crypto from 'node:crypto';
import { config } from '../config/env';
import { createUserRepository } from '../repositories/users';
import { createApiKeyRepository } from '../repositories/api-keys';
import { createActivityLogRepository } from '../repositories/activity-logs';

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
    avatarUrl?: string;
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
 * PBKDF2 Password Hashing helper (constant-time verification)
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

export class AuthService {
  private userRepository = createUserRepository();
  private apiKeyRepository = createApiKeyRepository();
  private activityLogRepository = createActivityLogRepository();

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

    // Check if user already exists
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = hashPassword(params.password);

    const { user, workspace } = await this.userRepository.createWithWorkspace({
      email: normalizedEmail,
      passwordHash,
      fullName: params.fullName,
      companyName: params.companyName,
      defaultCurrency: currency,
      role: 'owner'
    });

    await this.activityLogRepository.log({
      userId: user.id,
      workspaceId: workspace.id,
      action: 'Account Created',
      entityType: 'auth',
      details: `Registered account ${user.email} with workspace ${workspace.name}.`
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
        defaultCurrency: user.defaultCurrency,
        avatarUrl: user.avatarUrl
      },
      token
    };
  }

  /**
   * Authenticate an existing user
   */
  public async login(params: { email: string; password: string }): Promise<AuthResponse> {
    const normalizedEmail = params.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new Error('Invalid email or password credentials.');
    }

    const valid = verifyPassword(params.password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password credentials.');
    }

    await this.activityLogRepository.log({
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
        defaultCurrency: user.defaultCurrency,
        avatarUrl: user.avatarUrl
      },
      token
    };
  }

  /**
   * Get user profile by userId
   */
  public async getProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;
    const { passwordHash: _hash, ...safe } = user;
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
  }): Promise<any> {
    let updated;
    if (updates.avatarUrl) {
      updated = await this.userRepository.updateAvatar(userId, updates.avatarUrl);
    } else {
      updated = await this.userRepository.updateProfile(userId, updates);
    }
    if (!updated) throw new Error('User not found.');
    const { passwordHash: _hash, ...safe } = updated;
    return safe;
  }

  /**
   * Onboarding Data Management
   */
  public async getOnboarding(workspaceId: string, userId: string) {
    return this.userRepository.getOnboarding(userId, workspaceId);
  }

  public async saveOnboarding(userId: string, workspaceId: string, data: any) {
    return this.userRepository.saveOnboarding(userId, workspaceId, data);
  }

  /**
   * API Keys Management
   */
  public async listApiKeys(userId: string) {
    return this.apiKeyRepository.listByUser(userId);
  }

  public async createApiKey(userId: string, workspaceId: string, name: string) {
    const randomHex = crypto.randomBytes(16).toString('hex');
    const secretKey = `hnt_live_${randomHex}`;
    const keyPrefix = secretKey.substring(0, 13);
    const keyHash = crypto.createHash('sha256').update(secretKey).digest('hex');

    const record = await this.apiKeyRepository.create({
      userId,
      workspaceId,
      name,
      keyPrefix,
      keyHash
    });

    await this.activityLogRepository.log({
      userId,
      workspaceId,
      action: 'API Key Created',
      entityType: 'api_key',
      entityId: record.id,
      details: `Generated live API key '${name}' with prefix '${keyPrefix}'.`
    });

    return {
      ...record,
      apiKey: secretKey
    };
  }

  public async deleteApiKey(userId: string, keyId: string) {
    return this.apiKeyRepository.delete(keyId, userId);
  }

  /**
   * Activity / Audit Logs
   */
  public async getActivityLogs(userId: string, limit = 50) {
    return this.activityLogRepository.listByUser(userId, limit);
  }
}

export const authService = new AuthService();
