import type { Pool } from 'pg';
import type { ActivityLogRepository, ActivityLogItem } from './activity-log-repository';
import { InMemoryActivityLogRepository } from './in-memory-activity-log.repository';

import { config } from '../../config/env';

export class PostgresActivityLogRepository implements ActivityLogRepository {
  private fallback = new InMemoryActivityLogRepository();

  constructor(private readonly pool: Pool, private readonly forceProduction?: boolean) {}

  private isProduction(): boolean {
    if (this.forceProduction !== undefined) {
      return this.forceProduction;
    }
    return config.nodeEnv === 'production' || process.env.VERCEL === '1';
  }

  public async listByUser(userId: string, limit = 20): Promise<ActivityLogItem[]> {
    try {
      const query = `
        SELECT * FROM user_activity_logs 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `;
      const result = await this.pool.query(query, [userId, limit]);
      if (result.rows.length === 0) {
        return this.isProduction() ? [] : this.fallback.listByUser(userId, limit);
      }
      return result.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        workspaceId: r.workspace_id,
        action: r.action,
        entityType: r.entity_type || undefined,
        entityId: r.entity_id || undefined,
        details: r.details || undefined,
        metadata: r.metadata || {},
        createdAt: new Date(r.created_at).toISOString()
      }));
    } catch (err: any) {
      if (this.isProduction()) {
        const error = new Error(`Database error listing activity logs: ${err.message}`);
        (error as any).statusCode = 503;
        (error as any).code = 'DATABASE_UNAVAILABLE';
        throw error;
      }
      return this.fallback.listByUser(userId, limit);
    }
  }

  public async log(params: {
    userId: string;
    workspaceId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: string;
    metadata?: any;
  }): Promise<ActivityLogItem> {
    try {
      const query = `
        INSERT INTO user_activity_logs (user_id, workspace_id, action, entity_type, entity_id, details, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const result = await this.pool.query(query, [
        params.userId,
        params.workspaceId,
        params.action,
        params.entityType || null,
        params.entityId || null,
        params.details || null,
        JSON.stringify(params.metadata || {})
      ]);
      const r = result.rows[0];
      return {
        id: r.id,
        userId: r.user_id,
        workspaceId: r.workspace_id,
        action: r.action,
        entityType: r.entity_type || undefined,
        entityId: r.entity_id || undefined,
        details: r.details || undefined,
        metadata: r.metadata || {},
        createdAt: new Date(r.created_at).toISOString()
      };
    } catch (err: any) {
      if (this.isProduction()) {
        const error = new Error(`Database error logging activity: ${err.message}`);
        (error as any).statusCode = 503;
        (error as any).code = 'DATABASE_UNAVAILABLE';
        throw error;
      }
      return this.fallback.log(params);
    }
  }
}
