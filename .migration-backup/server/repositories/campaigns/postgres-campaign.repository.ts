import type { Pool } from 'pg';
import type { CampaignItem } from '../../../src/types/campaign';
import type { CampaignRepository, CampaignFilterOptions } from './campaign-repository';
import { InMemoryCampaignRepository } from './in-memory-campaign.repository';

export class PostgresCampaignRepository implements CampaignRepository {
  private fallback = new InMemoryCampaignRepository();

  constructor(private readonly pool: Pool) {}

  public async list(workspaceId: string, filter?: CampaignFilterOptions): Promise<CampaignItem[]> {
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
        conditions.push(`(LOWER(name) LIKE $${params.length})`);
      }

      const query = `
        SELECT * FROM campaigns
        WHERE ${conditions.join(' AND ')}
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, params);
      if (result.rows.length === 0) {
        return this.fallback.list(workspaceId, filter);
      }

      return result.rows.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        channel: r.channel || 'multichannel',
        status: r.status || 'draft',
        targetAudienceName: r.target_audience_name || 'Target Audience',
        audienceCount: r.target_count || 0,
        sentCount: r.sent_count || 0,
        openRate: r.sent_count > 0 ? (r.opened_count / r.sent_count) * 100 : 0,
        replyRate: r.sent_count > 0 ? (r.replied_count / r.sent_count) * 100 : 0,
        opportunitiesCreated: r.converted_count || 0,
        expectedValue: Number(r.expected_value || 0),
        createdAt: new Date(r.created_at).toISOString(),
        lastActivity: 'Active',
        sequence: r.sequence_steps || [],
        prospects: r.target_prospects || []
      }));
    } catch {
      return this.fallback.list(workspaceId, filter);
    }
  }

  public async getById(id: string, workspaceId: string): Promise<CampaignItem | undefined> {
    try {
      const query = `
        SELECT * FROM campaigns
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
        name: r.name,
        description: r.description || '',
        channel: r.channel || 'multichannel',
        status: r.status || 'draft',
        targetAudienceName: r.target_audience_name || 'Target Audience',
        audienceCount: r.target_count || 0,
        sentCount: r.sent_count || 0,
        openRate: r.sent_count > 0 ? (r.opened_count / r.sent_count) * 100 : 0,
        replyRate: r.sent_count > 0 ? (r.replied_count / r.sent_count) * 100 : 0,
        opportunitiesCreated: r.converted_count || 0,
        expectedValue: Number(r.expected_value || 0),
        createdAt: new Date(r.created_at).toISOString(),
        lastActivity: 'Active',
        sequence: r.sequence_steps || [],
        prospects: r.target_prospects || []
      };
    } catch {
      return this.fallback.getById(id, workspaceId);
    }
  }

  public async create(campaign: Partial<CampaignItem>, workspaceId: string, userId?: string): Promise<CampaignItem> {
    try {
      const query = `
        INSERT INTO campaigns (
          workspace_id, user_id, name, channel, status, target_count, sent_count,
          opened_count, replied_count, converted_count, sequence_steps, target_prospects
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      const result = await this.pool.query(query, [
        workspaceId,
        userId || null,
        campaign.name || 'Untitled Campaign',
        campaign.channel || 'multichannel',
        campaign.status || 'draft',
        campaign.audienceCount || 0,
        campaign.sentCount || 0,
        0,
        0,
        campaign.opportunitiesCreated || 0,
        JSON.stringify(campaign.sequence || []),
        JSON.stringify(campaign.prospects || [])
      ]);
      const r = result.rows[0];
      return {
        id: r.id,
        name: r.name,
        description: campaign.description || '',
        channel: r.channel,
        status: r.status,
        targetAudienceName: campaign.targetAudienceName || 'Target Audience',
        audienceCount: r.target_count,
        sentCount: r.sent_count,
        openRate: 0,
        replyRate: 0,
        opportunitiesCreated: r.converted_count,
        expectedValue: campaign.expectedValue || 0,
        createdAt: new Date(r.created_at).toISOString(),
        lastActivity: 'Just created',
        sequence: r.sequence_steps || [],
        prospects: r.target_prospects || []
      };
    } catch {
      return this.fallback.create(campaign, workspaceId, userId);
    }
  }

  public async update(id: string, partial: Partial<CampaignItem>, workspaceId: string): Promise<CampaignItem | undefined> {
    try {
      const existing = await this.getById(id, workspaceId);
      if (!existing) return undefined;

      const query = `
        UPDATE campaigns
        SET name = COALESCE($1, name),
            channel = COALESCE($2, channel),
            status = COALESCE($3, status),
            updated_at = now()
        WHERE id = $4 AND workspace_id = $5
        RETURNING *
      `;
      const result = await this.pool.query(query, [
        partial.name || null,
        partial.channel || null,
        partial.status || null,
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
      const query = `DELETE FROM campaigns WHERE id = $1 AND workspace_id = $2`;
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
