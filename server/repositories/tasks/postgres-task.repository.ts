import type { Pool } from 'pg';
import type { TaskItem } from '../../../src/types/tasks';
import type { TaskRepository, TaskFilterOptions } from './task-repository';
import { InMemoryTaskRepository } from './in-memory-task.repository';

export class PostgresTaskRepository implements TaskRepository {
  private fallback = new InMemoryTaskRepository();

  constructor(private readonly pool: Pool) {}

  public async list(workspaceId: string, filter?: TaskFilterOptions): Promise<TaskItem[]> {
    try {
      const params: any[] = [workspaceId];
      const conditions = ['workspace_id = $1'];

      if (filter?.status && filter.status !== 'all') {
        params.push(filter.status);
        conditions.push(`status = $${params.length}`);
      }
      if (filter?.priority && filter.priority !== 'all') {
        params.push(filter.priority);
        conditions.push(`LOWER(priority) = LOWER($${params.length})`);
      }
      if (filter?.dueCategory && filter.dueCategory !== 'all') {
        params.push(filter.dueCategory);
        conditions.push(`due_category = $${params.length}`);
      }
      if (filter?.query?.trim()) {
        params.push(`%${filter.query.trim().toLowerCase()}%`);
        conditions.push(`(LOWER(title) LIKE $${params.length} OR LOWER(COALESCE(description, '')) LIKE $${params.length})`);
      }

      const query = `
        SELECT * FROM tasks
        WHERE ${conditions.join(' AND ')}
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, params);
      if (result.rows.length === 0) {
        return this.fallback.list(workspaceId, filter);
      }

      return result.rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        priority: r.priority,
        status: r.status,
        dueDate: r.due_date ? new Date(r.due_date).toLocaleDateString() : 'Upcoming',
        dueCategory: r.due_category || 'upcoming',
        relatedType: r.related_entity_type || 'deal',
        relatedName: r.related_title || 'General Account',
        relatedId: r.related_entity_id,
        ownerName: r.assignee_name || 'Ayoola Ade',
        ownerAvatarBg: r.metadata?.ownerAvatarBg || '#eff6ff',
        ownerAvatarColor: r.metadata?.ownerAvatarColor || '#1d4ed8',
        completedAt: r.metadata?.completedAt
      }));
    } catch {
      return this.fallback.list(workspaceId, filter);
    }
  }

  public async getById(id: string, workspaceId: string): Promise<TaskItem | undefined> {
    try {
      const query = `
        SELECT * FROM tasks
        WHERE id = $1 AND workspace_id = $2
        LIMIT 1
      `;
      const result = await this.pool.query(query, [id, workspaceId]);
      if (!result.rows[0]) {
        return this.fallback.getById(id, workspaceId);
      }
      const r = result.rows[0];
      return {
        id: r.id,
        title: r.title,
        description: r.description || '',
        priority: r.priority,
        status: r.status,
        dueDate: r.due_date ? new Date(r.due_date).toLocaleDateString() : 'Upcoming',
        dueCategory: r.due_category || 'upcoming',
        relatedType: r.related_entity_type || 'deal',
        relatedName: r.related_title || 'General Account',
        relatedId: r.related_entity_id,
        ownerName: r.assignee_name || 'Ayoola Ade',
        ownerAvatarBg: r.metadata?.ownerAvatarBg || '#eff6ff',
        ownerAvatarColor: r.metadata?.ownerAvatarColor || '#1d4ed8',
        completedAt: r.metadata?.completedAt
      };
    } catch {
      return this.fallback.getById(id, workspaceId);
    }
  }

  public async create(task: Partial<TaskItem>, workspaceId: string, userId?: string): Promise<TaskItem> {
    try {
      const query = `
        INSERT INTO tasks (
          workspace_id, user_id, title, description, priority, status,
          due_category, related_entity_type, related_entity_id, related_title,
          assignee_name, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      const metadata = {
        ownerAvatarBg: task.ownerAvatarBg || '#eff6ff',
        ownerAvatarColor: task.ownerAvatarColor || '#1d4ed8'
      };

      const result = await this.pool.query(query, [
        workspaceId,
        userId || null,
        task.title || 'Untitled Task',
        task.description || '',
        task.priority || 'Medium',
        task.status || 'todo',
        task.dueCategory || 'upcoming',
        task.relatedType || 'deal',
        task.relatedId || null,
        task.relatedName || 'General Account',
        task.ownerName || 'Ayoola Ade',
        JSON.stringify(metadata)
      ]);

      const r = result.rows[0];
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        priority: r.priority,
        status: r.status,
        dueDate: task.dueDate || 'Upcoming',
        dueCategory: r.due_category,
        relatedType: r.related_entity_type,
        relatedName: r.related_title,
        relatedId: r.related_entity_id,
        ownerName: r.assignee_name,
        ownerAvatarBg: metadata.ownerAvatarBg,
        ownerAvatarColor: metadata.ownerAvatarColor
      };
    } catch {
      return this.fallback.create(task, workspaceId, userId);
    }
  }

  public async update(id: string, partial: Partial<TaskItem>, workspaceId: string): Promise<TaskItem | undefined> {
    try {
      const existing = await this.getById(id, workspaceId);
      if (!existing) return undefined;

      const query = `
        UPDATE tasks
        SET status = COALESCE($1, status),
            priority = COALESCE($2, priority),
            updated_at = now()
        WHERE id = $3 AND workspace_id = $4
        RETURNING *
      `;
      const result = await this.pool.query(query, [
        partial.status || null,
        partial.priority || null,
        id,
        workspaceId
      ]);
      if (!result.rows[0]) {
        return this.fallback.update(id, partial, workspaceId);
      }
      return {
        ...existing,
        ...partial
      };
    } catch {
      return this.fallback.update(id, partial, workspaceId);
    }
  }

  public async delete(id: string, workspaceId: string): Promise<boolean> {
    try {
      const query = `DELETE FROM tasks WHERE id = $1 AND workspace_id = $2`;
      const result = await this.pool.query(query, [id, workspaceId]);
      if ((result.rowCount ?? 0) === 0) {
        return this.fallback.delete(id, workspaceId);
      }
      return true;
    } catch {
      return this.fallback.delete(id, workspaceId);
    }
  }
}
