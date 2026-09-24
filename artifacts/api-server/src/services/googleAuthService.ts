import crypto from 'node:crypto';
import { postgresPool, pool } from '../database/postgres';
import { config } from '../config/env';
import { CryptoService } from './cryptoService';
import { createOAuthStateRepository, OAuthStateRecord } from '../repositories/oauth-states';
import { sanitizeDiagnosticError } from './campaignExecutionService';

export interface GoogleIntegrationData {
  workspaceId: string;
  provider: 'gmail';
  accountEmail: string;
  accountName?: string;
  accountPicture?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: number;
  scopes: string[];
  isActive: boolean;
  status: 'active' | 'reauth_required' | 'revoked' | 'error';
  lastError?: string;
  lastSyncedAt?: string;
  watchHistoryId?: string;
  watchExpiration?: string;
  syncStatus?: string;
  stopSequenceOnReply?: boolean;
  connectedAt: string;
}

export interface GoogleAuthStatus {
  isConfigured: boolean;
  isConnected: boolean;
  status?: 'active' | 'reauth_required' | 'revoked' | 'error';
  accountEmail?: string;
  accountName?: string;
  accountPicture?: string;
  connectedAt?: string;
  lastSyncedAt?: string;
  lastError?: string;
  watchHistoryId?: string;
  watchExpiration?: string;
  syncStatus?: string;
  stopSequenceOnReply?: boolean;
  scopes?: string[];
  clientId?: string;
}

export class GoogleAuthService {
  // In-memory fallback cache ONLY for local development and offline testing
  private static memoryStore = new Map<string, GoogleIntegrationData>();

  private static isProduction(): boolean {
    return config.nodeEnv === 'production' || process.env.VERCEL === '1';
  }

  private static get clientId(): string | undefined {
    return process.env.GOOGLE_CLIENT_ID?.trim();
  }

  private static get clientSecret(): string | undefined {
    return process.env.GOOGLE_CLIENT_SECRET?.trim();
  }

  public static get redirectUri(): string {
    return (
      process.env.GOOGLE_REDIRECT_URI?.trim() ||
      'http://localhost:3001/api/v1/auth/google/callback'
    );
  }

  public static isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  public static getPublicClientId(): string | undefined {
    return this.clientId;
  }

  /**
   * Validates and sanitizes a return URL against an allowlist of safe paths and trusted origins.
   * Prevents open redirect attacks.
   */
  public static sanitizeReturnUrl(rawUrl?: string): string {
    const defaultPath = '/integrations';
    if (!rawUrl || typeof rawUrl !== 'string') {
      return defaultPath;
    }

    const trimmed = rawUrl.trim();

    // Prevent javascript:, data:, or protocol-relative (//) URLs
    if (/^(javascript:|data:|vbscript:)/i.test(trimmed) || trimmed.startsWith('//')) {
      return defaultPath;
    }

    // Safe relative paths starting with /
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      // Ensure path characters are standard URI characters
      try {
        const parsed = new URL(`https://huntiq.local${trimmed}`);
        return parsed.pathname + parsed.search + parsed.hash;
      } catch {
        return defaultPath;
      }
    }

    // Full absolute URL - must match allowed origins
    try {
      const parsed = new URL(trimmed);
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:5173',
        'https://huntiq.ai',
        'https://app.huntiq.ai',
        ...config.corsOrigins
      ].filter(Boolean);

      if (allowedOrigins.some(origin => parsed.origin.toLowerCase() === origin.toLowerCase())) {
        return parsed.toString();
      }
    } catch {
      // Invalid URL format
    }

    return defaultPath;
  }

  /**
   * Generates Google OAuth 2.0 consent URL for Gmail sending and profile reading.
   * Cryptographically binds the state to the authenticated workspace and user.
   */
  public static async getAuthUrl(
    workspaceId: string,
    userId: string,
    returnUrl?: string
  ): Promise<string> {
    if (!this.clientId) {
      throw new Error(
        'Google OAuth is not configured. Missing GOOGLE_CLIENT_ID in environment variables.'
      );
    }

    if (!workspaceId) {
      throw new Error('workspaceId is required to generate Google OAuth URL.');
    }

    const safeReturnPath = this.sanitizeReturnUrl(returnUrl);
    const stateToken = crypto.randomBytes(32).toString('hex');

    const stateRepo = createOAuthStateRepository();
    await stateRepo.create({
      stateToken,
      userId,
      workspaceId,
      provider: 'gmail',
      returnPath: safeReturnPath,
      ttlSeconds: 600 // 10 minutes expiry
    });

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: stateToken
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Consumes single-use server-side OAuth state.
   */
  public static async consumeState(stateToken: string): Promise<OAuthStateRecord | null> {
    const stateRepo = createOAuthStateRepository();
    return stateRepo.consume(stateToken, 'gmail');
  }

  /**
   * Exchanges authorization code for access and refresh tokens.
   * Tokens are encrypted at rest with AES-256-GCM before database insertion.
   */
  public static async exchangeCode(
    code: string,
    stateToken: string
  ): Promise<{ integration: GoogleIntegrationData; returnPath: string }> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Google OAuth credentials not configured.');
    }

    // 1. Consume and verify server-side state
    const stateRecord = await this.consumeState(stateToken);
    if (!stateRecord) {
      const err = new Error('Invalid, expired, or previously used OAuth state token.');
      (err as any).statusCode = 400;
      (err as any).code = 'INVALID_OAUTH_STATE';
      throw err;
    }

    const workspaceId = stateRecord.workspaceId;
    const returnPath = stateRecord.returnPath || '/integrations';

    // 2. Exchange authorization code for tokens with Google
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData: any = await tokenRes.json();
    if (!tokenRes.ok) {
      const err = new Error(
        tokenData.error_description || tokenData.error || 'Failed to exchange Google OAuth code'
      );
      (err as any).statusCode = 400;
      (err as any).code = 'OAUTH_EXCHANGE_FAILED';
      throw err;
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 3599;
    const tokenExpiry = Date.now() + expiresIn * 1000;
    const scopes = typeof tokenData.scope === 'string' ? tokenData.scope.split(' ') : [];

    // 3. Fetch User Profile from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const profile: any = await profileRes.json();
    const accountEmail = profile.email || 'user@gmail.com';
    const accountName = profile.name || undefined;
    const accountPicture = profile.picture || undefined;

    const integrationData: GoogleIntegrationData = {
      workspaceId,
      provider: 'gmail',
      accountEmail,
      accountName,
      accountPicture,
      accessToken,
      refreshToken,
      tokenExpiry,
      scopes,
      isActive: true,
      status: 'active',
      lastSyncedAt: new Date().toISOString(),
      connectedAt: new Date().toISOString()
    };

    // 4. Encrypt tokens for persistence
    const encryptedAccessToken = CryptoService.encryptToken(accessToken);
    const encryptedRefreshToken = refreshToken ? CryptoService.encryptToken(refreshToken) : null;

    // 5. Persist to PostgreSQL (production source of truth)
    const activePool = postgresPool || pool;
    if (activePool) {
      try {
        await activePool.query(
          `INSERT INTO workspace_integrations (
            workspace_id, provider, account_email, account_name,
            access_token, refresh_token, token_expiry, scopes, is_active, status, sync_status, last_synced_at, last_error, metadata, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 'active', 'idle', now(), null, $9, now())
          ON CONFLICT (workspace_id, provider) DO UPDATE SET
            account_email = EXCLUDED.account_email,
            account_name = EXCLUDED.account_name,
            access_token = EXCLUDED.access_token,
            refresh_token = COALESCE(EXCLUDED.refresh_token, workspace_integrations.refresh_token),
            token_expiry = EXCLUDED.token_expiry,
            scopes = EXCLUDED.scopes,
            is_active = true,
            status = 'active',
            sync_status = 'idle',
            last_synced_at = now(),
            last_error = null,
            metadata = EXCLUDED.metadata,
            updated_at = now()`,
          [
            workspaceId,
            'gmail',
            accountEmail,
            accountName,
            encryptedAccessToken,
            encryptedRefreshToken,
            tokenExpiry,
            JSON.stringify(scopes),
            JSON.stringify({ picture: accountPicture })
          ]
        );
      } catch (err: any) {
        if (this.isProduction()) {
          const dbErr = new Error(`Database error persisting Google integration: ${err.message}`);
          (dbErr as any).statusCode = 503;
          (dbErr as any).code = 'DATABASE_UNAVAILABLE';
          throw dbErr;
        }
        console.warn('[GOOGLE_AUTH] DB persist warning in dev (using memory store):', err.message);
      }
    } else if (this.isProduction()) {
      const dbErr = new Error('Database pool unavailable in production when persisting Google integration.');
      (dbErr as any).statusCode = 503;
      (dbErr as any).code = 'DATABASE_UNAVAILABLE';
      throw dbErr;
    }

    // Cache in dev memory store
    this.memoryStore.set(workspaceId, integrationData);

    return { integration: integrationData, returnPath };
  }

  /**
   * Retrieves active integration data for a workspace.
   * Decrypts tokens from PostgreSQL.
   */
  public static async getIntegration(
    workspaceId: string
  ): Promise<GoogleIntegrationData | null> {
    const activePool = postgresPool || pool;

    if (activePool) {
      try {
        const res = await activePool.query(
          `SELECT * FROM workspace_integrations WHERE workspace_id = $1 AND provider = $2`,
          [workspaceId, 'gmail']
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const decryptedAccessToken = row.access_token ? CryptoService.decryptToken(row.access_token) : '';
          const decryptedRefreshToken = row.refresh_token ? CryptoService.decryptToken(row.refresh_token) : undefined;

          const data: GoogleIntegrationData = {
            workspaceId: row.workspace_id,
            provider: 'gmail',
            accountEmail: row.account_email,
            accountName: row.account_name,
            accountPicture: row.metadata?.picture,
            accessToken: decryptedAccessToken,
            refreshToken: decryptedRefreshToken,
            tokenExpiry: row.token_expiry ? Number(row.token_expiry) : undefined,
            scopes: Array.isArray(row.scopes) ? row.scopes : [],
            isActive: Boolean(row.is_active),
            status: row.status || (row.is_active ? 'active' : 'revoked'),
            lastError: row.last_error || undefined,
            lastSyncedAt: row.last_synced_at ? new Date(row.last_synced_at).toISOString() : undefined,
            watchHistoryId: row.watch_history_id || undefined,
            watchExpiration: row.watch_expiration ? new Date(row.watch_expiration).toISOString() : undefined,
            syncStatus: row.sync_status || 'idle',
            stopSequenceOnReply: row.stop_sequence_on_reply !== undefined ? Boolean(row.stop_sequence_on_reply) : true,
            connectedAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
          };

          this.memoryStore.set(workspaceId, data);
          return data;
        }
        return null;
      } catch (err: any) {
        if (this.isProduction()) {
          const dbErr = new Error(`Database error retrieving Google integration: ${err.message}`);
          (dbErr as any).statusCode = 503;
          (dbErr as any).code = 'DATABASE_UNAVAILABLE';
          throw dbErr;
        }
      }
    } else if (this.isProduction()) {
      const dbErr = new Error('Database pool unavailable in production when retrieving Google integration.');
      (dbErr as any).statusCode = 503;
      (dbErr as any).code = 'DATABASE_UNAVAILABLE';
      throw dbErr;
    }

    // Development fallback
    if (this.memoryStore.has(workspaceId)) {
      return this.memoryStore.get(workspaceId)!;
    }

    return null;
  }

  /**
   * Returns a valid access token for the workspace, refreshing it automatically if expired.
   * If refresh fails or cannot occur, updates status to 'reauth_required' and throws/returns null.
   * NEVER returns an expired token.
   */
  public static async getValidAccessToken(
    workspaceId: string,
    options?: { forceRefresh?: boolean }
  ): Promise<string | null> {
    const integration = await this.getIntegration(workspaceId);
    if (!integration || !integration.isActive) {
      return null;
    }

    // Do not repeatedly hammer Google if integration already failed and requires reauthentication
    if (!options?.forceRefresh && (integration.status === 'reauth_required' || integration.syncStatus === 'reauth_required')) {
      return null;
    }

    // Check if current token is still valid (5-minute safety margin)
    const isStillValid = integration.tokenExpiry && integration.tokenExpiry > Date.now() + 300000;
    if (isStillValid && integration.accessToken) {
      return integration.accessToken;
    }

    // Token is expired or expiring soon; refresh token is mandatory
    if (!integration.refreshToken) {
      await this.markReauthRequired(workspaceId, 'Token expired and no refresh token is stored.');
      return null;
    }

    if (!this.clientId || !this.clientSecret) {
      await this.markReauthRequired(workspaceId, 'Google OAuth client credentials not configured for refresh.');
      return null;
    }

    try {
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: integration.refreshToken,
          grant_type: 'refresh_token'
        })
      });

      const refreshData = await refreshRes.json() as any;
      if (!refreshRes.ok) {
        const rawErrorMsg = refreshData.error_description || refreshData.error || 'Failed to refresh Google token';
        const errorMsg = sanitizeDiagnosticError(rawErrorMsg);
        await this.markReauthRequired(workspaceId, errorMsg);
        return null;
      }

      const newAccessToken = refreshData.access_token;
      const expiresIn = refreshData.expires_in || 3599;
      const newTokenExpiry = Date.now() + expiresIn * 1000;

      integration.accessToken = newAccessToken;
      integration.tokenExpiry = newTokenExpiry;
      integration.status = 'active';
      integration.syncStatus = integration.syncStatus === 'reauth_required' ? 'idle' : integration.syncStatus;
      integration.lastError = undefined;
      integration.lastSyncedAt = new Date().toISOString();

      const encryptedAccessToken = CryptoService.encryptToken(newAccessToken);

      const activePool = postgresPool || pool;
      if (activePool) {
        try {
          await activePool.query(
            `UPDATE workspace_integrations 
             SET access_token = $1, token_expiry = $2, status = 'active', 
                 sync_status = CASE WHEN sync_status = 'reauth_required' THEN 'idle' ELSE sync_status END,
                 last_synced_at = now(), last_error = null, updated_at = now() 
             WHERE workspace_id = $3 AND provider = $4`,
            [encryptedAccessToken, newTokenExpiry, workspaceId, 'gmail']
          );
        } catch (err: any) {
          if (this.isProduction()) {
            throw err;
          }
        }
      }

      this.memoryStore.set(workspaceId, integration);
      return newAccessToken;
    } catch (err: any) {
      const safeError = sanitizeDiagnosticError(err.message || 'Token refresh failed');
      console.error(`[GOOGLE_AUTH] Token refresh failed for workspace ${workspaceId}:`, safeError);
      await this.markReauthRequired(workspaceId, safeError);
      return null;
    }
  }

  /**
   * Helper to set status = 'reauth_required' and record safe error message in DB and memory.
   */
  public static async markReauthRequired(workspaceId: string, errorReason: string): Promise<void> {
    const safeError = sanitizeDiagnosticError(errorReason);
    const cached = this.memoryStore.get(workspaceId);
    if (cached) {
      cached.status = 'reauth_required';
      cached.syncStatus = 'reauth_required';
      cached.lastError = safeError;
    }

    const activePool = postgresPool || pool;
    if (activePool) {
      try {
        await activePool.query(
          `UPDATE workspace_integrations
           SET status = 'reauth_required', sync_status = 'reauth_required', last_error = $1, updated_at = now()
           WHERE workspace_id = $2 AND provider = $3`,
          [safeError, workspaceId, 'gmail']
        );
      } catch {}
    }
  }

  /**
   * Returns public connection status for workspace.
   */
  public static async getStatus(workspaceId: string): Promise<GoogleAuthStatus> {
    const isConfigured = this.isConfigured();
    const integration = await this.getIntegration(workspaceId);

    return {
      isConfigured,
      isConnected: Boolean(integration && integration.isActive && integration.status === 'active'),
      status: integration?.status,
      accountEmail: integration?.accountEmail,
      accountName: integration?.accountName,
      accountPicture: integration?.accountPicture,
      connectedAt: integration?.connectedAt,
      lastSyncedAt: integration?.lastSyncedAt,
      lastError: integration?.lastError,
      watchHistoryId: integration?.watchHistoryId,
      watchExpiration: integration?.watchExpiration,
      syncStatus: integration?.syncStatus || 'idle',
      stopSequenceOnReply: integration?.stopSequenceOnReply ?? true,
      scopes: integration?.scopes,
      clientId: this.getPublicClientId()
    };
  }

  /**
   * Disconnects integration:
   * 1. Stops Gmail Watch subscription.
   * 2. Remotely revokes token at Google OAuth endpoint.
   * 3. Wipes encrypted tokens from database and sets status = 'revoked', sync_status = 'disconnected', is_active = false.
   * 4. Clears dev memory cache.
   */
  public static async disconnect(workspaceId: string): Promise<void> {
    // 1. Stop watch subscription cleanly
    try {
      const { GmailReplySyncService } = await import('./gmailReplySyncService');
      await GmailReplySyncService.stopWatch(workspaceId);
    } catch (err: any) {
      console.warn(`[GOOGLE_AUTH] Stop watch notice during disconnect for workspace ${workspaceId}:`, err.message);
    }

    const integration = await this.getIntegration(workspaceId);

    // 2. Remote Google Token Revocation
    const tokenToRevoke = integration?.refreshToken || integration?.accessToken;
    if (tokenToRevoke) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(tokenToRevoke)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
      } catch (err: any) {
        console.warn(`[GOOGLE_AUTH] Remote revocation warning for workspace ${workspaceId}:`, err.message);
      }
    }

    // 3. Clear memory cache
    if (this.memoryStore.has(workspaceId)) {
      this.memoryStore.delete(workspaceId);
    }

    // 4. Wipe database credentials & invalidate watch state completely
    const activePool = postgresPool || pool;
    if (activePool) {
      try {
        await activePool.query(
          `UPDATE workspace_integrations 
           SET is_active = false, 
               status = 'revoked', 
               sync_status = 'disconnected',
               access_token = NULL, 
               refresh_token = NULL, 
               token_expiry = NULL,
               watch_history_id = NULL,
               watch_expiration = NULL,
               watch_resource_id = NULL,
               last_error = NULL, 
               updated_at = now() 
           WHERE workspace_id = $1 AND provider = $2`,
          [workspaceId, 'gmail']
        );
      } catch (err: any) {
        if (this.isProduction()) {
          const dbErr = new Error(`Database error disconnecting Google integration: ${err.message}`);
          (dbErr as any).statusCode = 503;
          (dbErr as any).code = 'DATABASE_UNAVAILABLE';
          throw dbErr;
        }
      }
    } else if (this.isProduction()) {
      const dbErr = new Error('Database pool unavailable in production when disconnecting Google integration.');
      (dbErr as any).statusCode = 503;
      (dbErr as any).code = 'DATABASE_UNAVAILABLE';
      throw dbErr;
    }
  }
}
