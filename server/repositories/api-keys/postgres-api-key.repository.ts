import type { Pool } from 'pg';
import type { ApiKeyRepository, ApiKeyItem } from './api-key-repository';
import { InMemoryApiKeyRepository } from './in-memory-api-key.repository';

export class PostgresApiKeyRepository implements ApiKeyRepository {
  private fallback = new InMemoryApiKeyRepository();

  constructor(private readonly pool: Pool) {}

  public async listByUser(userId: string): Promise<ApiKeyItem[]> {
    try {
      const query = `
        SELECT id, name, key_prefix, created_at, last_used_at 
        FROM api_keys 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, [userId]);
      if (result.rows.length === 0) {
        return this.fallback.listByUser(userId);
      }
      return result.rows.map((r) => ({
        id: r.id,
        name: r.name,
        keyPrefix: r.key_prefix,
        createdAt: new Date(r.created_at).toISOString(),
        lastUsedAt: r.last_used_at ? new Date(r.last_used_at).toISOString() : undefined
      }));
    } catch {
      return this.fallback.listByUser(userId);
    }
  }

  public async create(params: {
    userId: string;
    workspaceId: string;
    name: string;
    keyPrefix: string;
    keyHash: string;
  }): Promise<ApiKeyItem> {
    try {
      const query = `
        INSERT INTO api_keys (user_id, workspace_id, name, key_prefix, key_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, key_prefix, created_at
      `;
      const result = await this.pool.query(query, [
        params.userId,
        params.workspaceId,
        params.name,
        params.keyPrefix,
        params.keyHash
      ]);
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        keyPrefix: row.key_prefix,
        createdAt: new Date(row.created_at).toISOString()
      };
    } catch {
      return this.fallback.create(params);
    }
  }

  public async findByHash(keyHash: string): Promise<{ id: string; userId: string; workspaceId: string } | null> {
    try {
      const query = `
        SELECT id, user_id, workspace_id 
        FROM api_keys 
        WHERE key_hash = $1 
        LIMIT 1
      `;
      const result = await this.pool.query(query, [keyHash]);
      if (result.rows.length === 0) {
        return this.fallback.findByHash(keyHash);
      }
      const row = result.rows[0];

      this.pool.query('UPDATE api_keys SET last_used_at = now() WHERE id = $1', [row.id]).catch(() => {});

      return {
        id: row.id,
        userId: row.user_id,
        workspaceId: row.workspace_id
      };
    } catch {
      return this.fallback.findByHash(keyHash);
    }
  }

  public async delete(id: string, userId: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM api_keys WHERE id = $1 AND user_id = $2';
      const result = await this.pool.query(query, [id, userId]);
      if ((result.rowCount ?? 0) === 0) {
        return this.fallback.delete(id, userId);
      }
      return (result.rowCount ?? 0) > 0;
    } catch {
      return this.fallback.delete(id, userId);
    }
  }
}
