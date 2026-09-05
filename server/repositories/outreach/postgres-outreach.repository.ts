import type { Pool } from 'pg';
import type { OutreachItem, OutreachMessage } from '../../../src/types/outreach';
import type { OutreachRepository, OutreachFilterOptions } from './outreach-repository';
import { InMemoryOutreachRepository } from './in-memory-outreach.repository';

export class PostgresOutreachRepository implements OutreachRepository {
  private fallback = new InMemoryOutreachRepository();

  constructor(private readonly pool: Pool) {}

  public async list(workspaceId: string, filter?: OutreachFilterOptions): Promise<OutreachItem[]> {
    try {
      const params: any[] = [workspaceId];
      const conditions = ['workspace_id = $1'];

      if (filter?.status && filter.status !== 'all') {
        params.push(filter.status);
        conditions.push(`status = $${params.length}`);
      }
      if (filter?.channel && filter.channel !== 'all') {
        params.push(filter.channel);
        conditions.push(`channel = $${params.length}`);
      }
      if (filter?.query?.trim()) {
        params.push(`%${filter.query.trim().toLowerCase()}%`);
        conditions.push(`(LOWER(contact_name) LIKE $${params.length} OR LOWER(company_name) LIKE $${params.length})`);
      }

      const query = `
        SELECT * FROM outreach_threads
        WHERE ${conditions.join(' AND ')}
        ORDER BY updated_at DESC
      `;
      const result = await this.pool.query(query, params);
      if (result.rows.length === 0) {
        return this.fallback.list(workspaceId, filter);
      }

      return result.rows.map(r => ({
        id: r.id,
        contactName: r.contact_name,
        contactRole: r.contact_role || 'Decision Maker',
        companyName: r.company_name,
        domain: r.domain || '',
        email: r.email || null,
        phone: r.phone || null,
        avatarBg: r.metadata?.avatarBg || '#6366f1',
        avatarColor: r.metadata?.avatarColor || '#ffffff',
        subject: r.metadata?.subject || 'Outreach Pitch',
        lastMessageSnippet: r.metadata?.lastMessageSnippet || 'Thread initiated',
        lastMessageTime: 'Recently',
        status: r.status,
        channel: r.channel,
        campaignName: r.metadata?.campaignName,
        opportunityScore: r.opportunity_score,
        unread: Boolean(r.metadata?.unread),
        thread: r.messages || []
      }));
    } catch {
      return this.fallback.list(workspaceId, filter);
    }
  }

  public async getById(id: string, workspaceId: string): Promise<OutreachItem | undefined> {
    try {
      const query = `
        SELECT * FROM outreach_threads
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
        contactName: r.contact_name,
        contactRole: r.contact_role || 'Decision Maker',
        companyName: r.company_name,
        domain: r.domain || '',
        email: r.email || null,
        phone: r.phone || null,
        avatarBg: r.metadata?.avatarBg || '#6366f1',
        avatarColor: r.metadata?.avatarColor || '#ffffff',
        subject: r.metadata?.subject || 'Outreach Pitch',
        lastMessageSnippet: r.metadata?.lastMessageSnippet || 'Thread initiated',
        lastMessageTime: 'Recently',
        status: r.status,
        channel: r.channel,
        campaignName: r.metadata?.campaignName,
        opportunityScore: r.opportunity_score,
        unread: Boolean(r.metadata?.unread),
        thread: r.messages || []
      };
    } catch {
      return this.fallback.getById(id, workspaceId);
    }
  }

  public async create(outreach: Partial<OutreachItem>, workspaceId: string, userId?: string): Promise<OutreachItem> {
    try {
      const query = `
        INSERT INTO outreach_threads (
          workspace_id, user_id, contact_name, contact_role, company_name, domain,
          email, phone, channel, status, opportunity_score, messages, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;
      const metadata = {
        avatarBg: outreach.avatarBg || '#6366f1',
        avatarColor: outreach.avatarColor || '#ffffff',
        subject: outreach.subject || 'Outreach Pitch',
        campaignName: outreach.campaignName,
        lastMessageSnippet: outreach.lastMessageSnippet || 'Pitch initiated',
        unread: false
      };

      const result = await this.pool.query(query, [
        workspaceId,
        userId || null,
        outreach.contactName || 'Decision Maker',
        outreach.contactRole || 'Owner',
        outreach.companyName || 'Target Company',
        outreach.domain || '',
        outreach.email || null,
        outreach.phone || null,
        outreach.channel || 'email',
        outreach.status || 'due_today',
        outreach.opportunityScore || 75,
        JSON.stringify(outreach.thread || []),
        JSON.stringify(metadata)
      ]);

      const r = result.rows[0];
      return {
        id: r.id,
        contactName: r.contact_name,
        contactRole: r.contact_role,
        companyName: r.company_name,
        domain: r.domain,
        email: r.email,
        phone: r.phone,
        avatarBg: metadata.avatarBg,
        avatarColor: metadata.avatarColor,
        subject: metadata.subject,
        lastMessageSnippet: metadata.lastMessageSnippet,
        lastMessageTime: 'Just now',
        status: r.status,
        channel: r.channel,
        campaignName: metadata.campaignName,
        opportunityScore: r.opportunity_score,
        unread: false,
        thread: r.messages || []
      };
    } catch {
      return this.fallback.create(outreach, workspaceId, userId);
    }
  }

  public async update(id: string, partial: Partial<OutreachItem>, workspaceId: string): Promise<OutreachItem | undefined> {
    try {
      const existing = await this.getById(id, workspaceId);
      if (!existing) return undefined;

      const query = `
        UPDATE outreach_threads
        SET status = COALESCE($1, status),
            channel = COALESCE($2, channel),
            updated_at = now()
        WHERE id = $3 AND workspace_id = $4
        RETURNING *
      `;
      const result = await this.pool.query(query, [
        partial.status || null,
        partial.channel || null,
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

  public async addMessage(id: string, message: Omit<OutreachMessage, 'id' | 'timestamp'>, workspaceId: string): Promise<OutreachItem | undefined> {
    try {
      const existing = await this.getById(id, workspaceId);
      if (!existing) return undefined;

      const newMsg: OutreachMessage = {
        ...message,
        id: `msg-${Date.now().toString(36)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedThread = [...existing.thread, newMsg];
      const metadata = {
        subject: existing.subject,
        lastMessageSnippet: newMsg.content.substring(0, 80),
        unread: false
      };

      const query = `
        UPDATE outreach_threads
        SET messages = $1, metadata = metadata || $2::jsonb, updated_at = now()
        WHERE id = $3 AND workspace_id = $4
        RETURNING *
      `;
      const result = await this.pool.query(query, [
        JSON.stringify(updatedThread),
        JSON.stringify(metadata),
        id,
        workspaceId
      ]);
      if (!result.rows[0]) {
        return this.fallback.addMessage(id, message, workspaceId);
      }

      return {
        ...existing,
        thread: updatedThread,
        lastMessageSnippet: newMsg.content.substring(0, 80),
        lastMessageTime: 'Just now'
      };
    } catch {
      return this.fallback.addMessage(id, message, workspaceId);
    }
  }

  public async delete(id: string, workspaceId: string): Promise<boolean> {
    try {
      const query = `DELETE FROM outreach_threads WHERE id = $1 AND workspace_id = $2`;
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
