import type { Pool } from 'pg';
import type {
  OAuthStateRepository,
  OAuthStateRecord,
  CreateOAuthStateParams
} from './oauth-state-repository';
import { InMemoryOAuthStateRepository } from './in-memory-oauth-state.repository';
import { config } from '../../config/env';

export class PostgresOAuthStateRepository implements OAuthStateRepository {
  private fallback = new InMemoryOAuthStateRepository();

  constructor(private readonly pool: Pool, private readonly forceProduction?: boolean) {}

  private isProduction(): boolean {
    if (this.forceProduction !== undefined) {
      return this.forceProduction;
    }
    return config.nodeEnv === 'production' || process.env.VERCEL === '1';
  }

  private mapRow(row: any): OAuthStateRecord {
    return {
      id: row.id,
      stateToken: row.state_token,
      userId: row.user_id,
      workspaceId: row.workspace_id,
      provider: row.provider,
      returnPath: row.return_path,
      expiresAt: new Date(row.expires_at),
      usedAt: row.used_at ? new Date(row.used_at) : null,
      createdAt: new Date(row.created_at)
    };
  }

  public async create(params: CreateOAuthStateParams): Promise<OAuthStateRecord> {
    const ttlSeconds = params.ttlSeconds || 600;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    try {
      const query = `
        INSERT INTO oauth_states (
          state_token, user_id, workspace_id, provider, return_path, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, state_token, user_id, workspace_id, provider, return_path, expires_at, used_at, created_at
      `;
      const result = await this.pool.query(query, [
        params.stateToken,
        params.userId,
        params.workspaceId,
        params.provider,
        params.returnPath || '/',
        expiresAt
      ]);
      return this.mapRow(result.rows[0]);
    } catch (err: any) {
      if (this.isProduction()) {
        const error = new Error(`Database error creating OAuth state: ${err.message}`);
        (error as any).statusCode = 503;
        (error as any).code = 'DATABASE_UNAVAILABLE';
        throw error;
      }
      return this.fallback.create(params);
    }
  }

  public async consume(stateToken: string, provider: string): Promise<OAuthStateRecord | null> {
    try {
      const query = `
        UPDATE oauth_states
        SET used_at = now()
        WHERE state_token = $1
          AND provider = $2
          AND used_at IS NULL
          AND expires_at > now()
        RETURNING id, state_token, user_id, workspace_id, provider, return_path, expires_at, used_at, created_at
      `;
      const result = await this.pool.query(query, [stateToken, provider]);
      if (result.rows.length === 0) {
        return this.isProduction() ? null : this.fallback.consume(stateToken, provider);
      }
      return this.mapRow(result.rows[0]);
    } catch (err: any) {
      if (this.isProduction()) {
        const error = new Error(`Database error consuming OAuth state: ${err.message}`);
        (error as any).statusCode = 503;
        (error as any).code = 'DATABASE_UNAVAILABLE';
        throw error;
      }
      return this.fallback.consume(stateToken, provider);
    }
  }

  public async cleanExpired(): Promise<number> {
    try {
      const query = `DELETE FROM oauth_states WHERE expires_at < now() OR used_at IS NOT NULL`;
      const result = await this.pool.query(query);
      return result.rowCount || 0;
    } catch (err: any) {
      if (this.isProduction()) {
        const error = new Error(`Database error cleaning OAuth states: ${err.message}`);
        (error as any).statusCode = 503;
        (error as any).code = 'DATABASE_UNAVAILABLE';
        throw error;
      }
      return this.fallback.cleanExpired();
    }
  }
}
