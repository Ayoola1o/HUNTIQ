import { pool } from '../database/connection';

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
  connectedAt: string;
}

export interface GoogleAuthStatus {
  isConfigured: boolean;
  isConnected: boolean;
  accountEmail?: string;
  accountName?: string;
  accountPicture?: string;
  connectedAt?: string;
  scopes?: string[];
  clientId?: string;
}

export class GoogleAuthService {
  // In-memory fallback cache for development and offline resilience
  private static memoryStore = new Map<string, GoogleIntegrationData>();

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
   * Generates Google OAuth 2.0 consent URL for Gmail sending and profile reading.
   */
  public static getAuthUrl(workspaceId: string, returnUrl?: string): string {
    if (!this.clientId) {
      throw new Error(
        'Google OAuth is not configured. Missing GOOGLE_CLIENT_ID in environment variables.'
      );
    }

    const state = Buffer.from(
      JSON.stringify({
        workspaceId,
        returnUrl: returnUrl || 'http://localhost:5173/?view=outreach',
        timestamp: Date.now()
      })
    ).toString('base64url');

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
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
      state
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for access and refresh tokens.
   */
  public static async exchangeCode(
    code: string,
    stateString?: string
  ): Promise<GoogleIntegrationData> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Google OAuth credentials not configured.');
    }

    let workspaceId = 'ws-default-001';
    if (stateString) {
      try {
        const decoded = JSON.parse(
          Buffer.from(stateString, 'base64url').toString('utf8')
        );
        if (decoded.workspaceId) workspaceId = decoded.workspaceId;
      } catch (err) {
        console.warn('[GOOGLE_AUTH] Failed to decode state, using default workspace:', err);
      }
    }

    // 1. Exchange authorization code for tokens
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

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(
        tokenData.error_description || tokenData.error || 'Failed to exchange Google OAuth code'
      );
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 3599;
    const tokenExpiry = Date.now() + expiresIn * 1000;
    const scopes = typeof tokenData.scope === 'string' ? tokenData.scope.split(' ') : [];

    // 2. Fetch User Profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const profile = await profileRes.json();
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
      connectedAt: new Date().toISOString()
    };

    // 3. Save to In-Memory Cache
    this.memoryStore.set(workspaceId, integrationData);

    // 4. Persist to PostgreSQL if connected
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO workspace_integrations (
            workspace_id, provider, account_email, account_name,
            access_token, refresh_token, token_expiry, scopes, is_active, metadata, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
          ON CONFLICT (workspace_id, provider) DO UPDATE SET
            account_email = EXCLUDED.account_email,
            account_name = EXCLUDED.account_name,
            access_token = EXCLUDED.access_token,
            refresh_token = COALESCE(EXCLUDED.refresh_token, workspace_integrations.refresh_token),
            token_expiry = EXCLUDED.token_expiry,
            scopes = EXCLUDED.scopes,
            is_active = true,
            metadata = EXCLUDED.metadata,
            updated_at = now()`,
          [
            workspaceId,
            'gmail',
            accountEmail,
            accountName,
            accessToken,
            refreshToken,
            tokenExpiry,
            JSON.stringify(scopes),
            true,
            JSON.stringify({ picture: accountPicture })
          ]
        );
      } catch (err: any) {
        console.warn('[GOOGLE_AUTH] DB persist warning (using in-memory fallback):', err.message);
      }
    }

    return integrationData;
  }

  /**
   * Retrieves active integration data for a workspace.
   */
  public static async getIntegration(
    workspaceId: string
  ): Promise<GoogleIntegrationData | null> {
    // Check in-memory store first
    if (this.memoryStore.has(workspaceId)) {
      const cached = this.memoryStore.get(workspaceId)!;
      if (cached.isActive) return cached;
    }

    // Check Postgres database if available
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM workspace_integrations WHERE workspace_id = $1 AND provider = $2 AND is_active = true`,
          [workspaceId, 'gmail']
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const data: GoogleIntegrationData = {
            workspaceId: row.workspace_id,
            provider: 'gmail',
            accountEmail: row.account_email,
            accountName: row.account_name,
            accountPicture: row.metadata?.picture,
            accessToken: row.access_token,
            refreshToken: row.refresh_token,
            tokenExpiry: Number(row.token_expiry),
            scopes: Array.isArray(row.scopes) ? row.scopes : [],
            isActive: Boolean(row.is_active),
            connectedAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
          };
          this.memoryStore.set(workspaceId, data);
          return data;
        }
      } catch (err) {
        // Fall through to null if DB read fails
      }
    }

    return null;
  }

  /**
   * Returns a valid access token for the workspace, refreshing it automatically if expired.
   */
  public static async getValidAccessToken(workspaceId: string): Promise<string | null> {
    const integration = await this.getIntegration(workspaceId);
    if (!integration) return null;

    // Check if token is still valid (with 5-minute safety buffer)
    const isStillValid = integration.tokenExpiry && integration.tokenExpiry > Date.now() + 300000;
    if (isStillValid) {
      return integration.accessToken;
    }

    // Refresh token if available
    if (!integration.refreshToken) {
      console.warn(`[GOOGLE_AUTH] Token expired for workspace ${workspaceId} and no refresh token is stored.`);
      return integration.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      return integration.accessToken;
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

      const refreshData = await refreshRes.json();
      if (!refreshRes.ok) {
        throw new Error(refreshData.error_description || 'Failed to refresh Google token');
      }

      integration.accessToken = refreshData.access_token;
      integration.tokenExpiry = Date.now() + (refreshData.expires_in || 3599) * 1000;
      this.memoryStore.set(workspaceId, integration);

      if (pool) {
        try {
          await pool.query(
            `UPDATE workspace_integrations SET access_token = $1, token_expiry = $2, updated_at = now() WHERE workspace_id = $3 AND provider = $4`,
            [integration.accessToken, integration.tokenExpiry, workspaceId, 'gmail']
          );
        } catch {}
      }

      return integration.accessToken;
    } catch (err: any) {
      console.error(`[GOOGLE_AUTH] Token refresh failed: ${err.message}`);
      return integration.accessToken;
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
      isConnected: Boolean(integration && integration.isActive),
      accountEmail: integration?.accountEmail,
      accountName: integration?.accountName,
      accountPicture: integration?.accountPicture,
      connectedAt: integration?.connectedAt,
      scopes: integration?.scopes,
      clientId: this.getPublicClientId()
    };
  }

  /**
   * Disconnects and marks integration inactive.
   */
  public static async disconnect(workspaceId: string): Promise<void> {
    if (this.memoryStore.has(workspaceId)) {
      this.memoryStore.delete(workspaceId);
    }

    if (pool) {
      try {
        await pool.query(
          `UPDATE workspace_integrations SET is_active = false, updated_at = now() WHERE workspace_id = $1 AND provider = $2`,
          [workspaceId, 'gmail']
        );
      } catch {}
    }
  }
}
