import type { Pool } from 'pg';
import type { UserRepository, UserEntity, CreateUserWithWorkspaceParams } from './user-repository';
import { InMemoryUserRepository } from './in-memory-user.repository';

export class PostgresUserRepository implements UserRepository {
  private fallback = new InMemoryUserRepository();

  constructor(private readonly pool: Pool) {}

  private mapRowToUser(row: any): UserEntity {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      email: row.email,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      companyName: row.company_name || undefined,
      avatarUrl: row.avatar_url || undefined,
      role: row.role || 'owner',
      defaultCurrency: row.default_currency || 'USD',
      status: row.status || 'active',
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
    };
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
      const result = await this.pool.query(query, [email.toLowerCase().trim()]);
      if (result.rows.length === 0) {
        return this.fallback.findByEmail(email);
      }
      return this.mapRowToUser(result.rows[0]);
    } catch {
      return this.fallback.findByEmail(email);
    }
  }

  public async findById(id: string): Promise<UserEntity | null> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1 LIMIT 1';
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return this.fallback.findById(id);
      }
      return this.mapRowToUser(result.rows[0]);
    } catch {
      return this.fallback.findById(id);
    }
  }

  public async createWithWorkspace(params: CreateUserWithWorkspaceParams): Promise<{
    user: UserEntity;
    workspace: { id: string; name: string; slug: string };
  }> {
    try {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        const workspaceName = params.companyName?.trim() || `${params.fullName}'s Workspace`;
        const workspaceSlug = `${workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

        const wsResult = await client.query(
          'INSERT INTO workspaces (name, slug) VALUES ($1, $2) RETURNING id, name, slug',
          [workspaceName, workspaceSlug]
        );
        const workspace = wsResult.rows[0];

        const userQuery = `
          INSERT INTO users (
            workspace_id, email, password_hash, full_name, company_name, 
            role, default_currency, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        const userResult = await client.query(userQuery, [
          workspace.id,
          params.email.toLowerCase().trim(),
          params.passwordHash,
          params.fullName,
          params.companyName || null,
          params.role || 'owner',
          params.defaultCurrency || 'USD',
          'active'
        ]);

        await client.query('COMMIT');
        return {
          user: this.mapRowToUser(userResult.rows[0]),
          workspace: {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug
          }
        };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch {
      return this.fallback.createWithWorkspace(params);
    }
  }

  public async updateProfile(userId: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    try {
      const existing = await this.findById(userId);
      if (!existing) return null;

      const merged = { ...existing, ...updates };
      const query = `
        UPDATE users SET
          full_name = $1, company_name = $2, default_currency = $3, updated_at = now()
        WHERE id = $4
        RETURNING *
      `;
      const result = await this.pool.query(query, [
        merged.fullName,
        merged.companyName || null,
        merged.defaultCurrency,
        userId
      ]);
      if (result.rows.length === 0) return null;
      return this.mapRowToUser(result.rows[0]);
    } catch {
      return this.fallback.updateProfile(userId, updates);
    }
  }

  public async updateAvatar(userId: string, avatarUrl: string): Promise<UserEntity | null> {
    try {
      const query = `
        UPDATE users SET
          avatar_url = $1, updated_at = now()
        WHERE id = $2
        RETURNING *
      `;
      const result = await this.pool.query(query, [avatarUrl, userId]);
      if (result.rows.length === 0) return null;
      return this.mapRowToUser(result.rows[0]);
    } catch {
      return this.fallback.updateAvatar(userId, avatarUrl);
    }
  }

  public async saveOnboarding(userId: string, workspaceId: string, data: any): Promise<boolean> {
    try {
      const query = `
        INSERT INTO user_activity_logs (
          user_id, workspace_id, action, entity_type, details, metadata
        ) VALUES ($1, $2, 'ONBOARDING_COMPLETED', 'WORKSPACE_ONBOARDING', 'User completed onboarding survey', $3)
      `;
      await this.pool.query(query, [userId, workspaceId, JSON.stringify(data)]);
      return true;
    } catch {
      return this.fallback.saveOnboarding(userId, workspaceId, data);
    }
  }

  public async getOnboarding(userId: string, workspaceId: string): Promise<any> {
    try {
      const query = `
        SELECT metadata FROM user_activity_logs 
        WHERE user_id = $1 AND workspace_id = $2 AND action = 'ONBOARDING_COMPLETED'
        ORDER BY created_at DESC LIMIT 1
      `;
      const result = await this.pool.query(query, [userId, workspaceId]);
      if (result.rows.length === 0) {
        return this.fallback.getOnboarding(userId, workspaceId);
      }
      return result.rows[0].metadata;
    } catch {
      return this.fallback.getOnboarding(userId, workspaceId);
    }
  }
}
