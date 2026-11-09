import type { Pool } from 'pg';
import type { CampaignItem, CampaignStatus } from '../../types/campaign';
import type { CampaignRepository, CampaignFilterOptions } from './campaign-repository';

export class PostgresCampaignRepository implements CampaignRepository {
  constructor(private readonly pool: Pool) {}

  private mapRow(row: any): CampaignItem {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      channel: row.channel,
      status: row.status,
      targetAudienceName: row.target_audience_name || 'Campaign recipients',
      audienceCount: row.target_count,
      sentCount: row.sent_count,
      openRate: row.sent_count > 0 ? row.opened_count / row.sent_count * 100 : 0,
      replyRate: row.sent_count > 0 ? row.replied_count / row.sent_count * 100 : 0,
      opportunitiesCount: row.converted_count,
      opportunitiesCreated: row.converted_count,
      expectedValue: 0,
      createdAt: new Date(row.created_at).toISOString(),
      lastActivity: new Date(row.updated_at).toISOString(),
      sequence: row.sequence_steps,
      prospects: row.target_prospects
    };
  }

  public async list(workspaceId: string, filter?: CampaignFilterOptions): Promise<CampaignItem[]> {
    const params = [workspaceId];
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
      params.push(`%${filter.query.trim()}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }
    const result = await this.pool.query(
      `SELECT * FROM campaigns WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`, params
    );
    return result.rows.map(row => this.mapRow(row));
  }

  public async getById(id: string, workspaceId: string): Promise<CampaignItem | undefined> {
    const result = await this.pool.query('SELECT * FROM campaigns WHERE id = $1 AND workspace_id = $2', [id, workspaceId]);
    return result.rows[0] && this.mapRow(result.rows[0]);
  }

  public async create(campaign: Partial<CampaignItem>, workspaceId: string, userId?: string): Promise<CampaignItem> {
    const result = await this.pool.query(`
      INSERT INTO campaigns (workspace_id, user_id, name, description, channel, status,
        target_audience_name, target_count, sequence_steps, target_prospects)
      VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, $8, $9) RETURNING *
    `, [
      workspaceId, userId || null, campaign.name, campaign.description || '', campaign.channel || 'email',
      campaign.targetAudienceName || null, campaign.prospects?.length ?? 0,
      JSON.stringify(campaign.sequence || []), JSON.stringify(campaign.prospects || [])
    ]);
    return this.mapRow(result.rows[0]);
  }

  public async update(id: string, partial: Partial<CampaignItem>, workspaceId: string, expectedStatus?: CampaignStatus): Promise<CampaignItem | undefined> {
    const result = await this.pool.query(`
      UPDATE campaigns
      SET name = COALESCE($1, name),
          channel = COALESCE($2, channel),
          status = COALESCE($3, status),
          sequence_steps = COALESCE($4::jsonb, sequence_steps),
          delivery_queued_at = CASE WHEN $3 = 'active' THEN now() ELSE delivery_queued_at END,
          updated_at = now()
      WHERE id = $5 AND workspace_id = $6 AND ($7::text IS NULL OR status = $7)
      RETURNING *
    `, [partial.name ?? null, partial.channel ?? null, partial.status ?? null,
      partial.sequence ? JSON.stringify(partial.sequence) : null, id, workspaceId, expectedStatus ?? null]);
    return result.rows[0] && this.mapRow(result.rows[0]);
  }

  public async delete(id: string, workspaceId: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM campaigns WHERE id = $1 AND workspace_id = $2', [id, workspaceId]);
    return (result.rowCount ?? 0) > 0;
  }
}
