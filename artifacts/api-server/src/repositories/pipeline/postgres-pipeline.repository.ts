import type { Pool } from 'pg';
import type { PipelineDealItem } from '../../../src/types/pipeline';
import type { PipelineRepository } from './pipeline-repository';
import { InMemoryPipelineRepository } from './in-memory-pipeline.repository';

export class PostgresPipelineRepository implements PipelineRepository {
  private fallback = new InMemoryPipelineRepository();

  constructor(private readonly pool: Pool) {}

  private mapRowToDeal(row: any): PipelineDealItem {
    return {
      id: row.id,
      title: row.title,
      company: row.company_name,
      dealValue: Number(row.deal_value),
      stage: row.stage,
      probability: Number(row.probability),
      priority: row.priority,
      contactName: row.contact_name || 'Decision Maker',
      contactRole: row.contact_role || 'Executive',
      contactEmail: row.contact_email || undefined,
      expectedCloseDate: row.expected_close_date ? new Date(row.expected_close_date).toISOString().split('T')[0] : 'In 30 days',
      lastActivity: row.last_activity || 'Signal identified',
      lastActivityType: row.last_activity_type || 'signal',
      nextAction: row.next_action || 'Initial Executive Outreach',
      nextActionDueDate: row.next_action_due_date || 'Tomorrow, 10 AM',
      notes: row.notes || '',
      website: row.website,
      revenue: row.revenue,
      linkedInUrl: row.linkedin_url,
      source: row.source || 'AI_RADAR',
      opportunityType: row.opportunity_type || 'HIGH_GROWTH',
      digitalGapScore: row.digital_gap_score ? Number(row.digital_gap_score) : undefined,
      digitalAudit: row.digital_audit || undefined,
      scoreFactors: row.score_factors || undefined,
      signals: Array.isArray(row.signals) ? row.signals : [],
      activities: Array.isArray(row.activities) ? row.activities : []
    };
  }

  public async listByUser(userId: string, workspaceId: string): Promise<PipelineDealItem[]> {
    try {
      const query = `
        SELECT * FROM pipeline_deals 
        WHERE workspace_id = $1 AND (user_id = $2 OR user_id IS NULL)
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, [workspaceId, userId]);
      if (result.rows.length === 0) {
        return this.fallback.listByUser(userId, workspaceId);
      }
      return result.rows.map((r) => this.mapRowToDeal(r));
    } catch {
      return this.fallback.listByUser(userId, workspaceId);
    }
  }

  public async getById(id: string, userId: string, workspaceId: string): Promise<PipelineDealItem | null> {
    try {
      const query = `
        SELECT * FROM pipeline_deals 
        WHERE id = $1 AND workspace_id = $2 AND (user_id = $3 OR user_id IS NULL)
        LIMIT 1
      `;
      const result = await this.pool.query(query, [id, workspaceId, userId]);
      if (result.rows.length === 0) {
        return this.fallback.getById(id, userId, workspaceId);
      }
      return this.mapRowToDeal(result.rows[0]);
    } catch {
      return this.fallback.getById(id, userId, workspaceId);
    }
  }

  public async create(userId: string, workspaceId: string, deal: Partial<PipelineDealItem>): Promise<PipelineDealItem> {
    try {
      const query = `
        INSERT INTO pipeline_deals (
          workspace_id, user_id, title, company_name, deal_value, stage, 
          probability, priority, contact_name, contact_role, contact_email, 
          last_activity, last_activity_type, next_action, next_action_due_date, 
          notes, website, revenue, linkedin_url, source, opportunity_type, 
          digital_gap_score, digital_audit, score_factors, signals, activities
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 
          $7, $8, $9, $10, $11, 
          $12, $13, $14, $15, 
          $16, $17, $18, $19, $20, $21, 
          $22, $23, $24, $25, $26
        ) RETURNING *
      `;
      const values = [
        workspaceId,
        userId,
        deal.title || `${deal.company || 'Enterprise'} Growth Opportunity`,
        deal.company || 'Enterprise Prospect',
        deal.dealValue || 25000,
        deal.stage || 'Discovery',
        deal.probability || 50,
        deal.priority || 'Medium',
        deal.contactName || 'Managing Director',
        deal.contactRole || 'Owner',
        deal.contactEmail || null,
        deal.lastActivity || 'Created via Outreach / Radar',
        deal.lastActivityType || 'signal',
        deal.nextAction || 'Follow-up Email',
        deal.nextActionDueDate || 'Friday, 10 AM',
        deal.notes || '',
        deal.website || null,
        deal.revenue || null,
        deal.linkedInUrl || null,
        deal.source || 'AI_RADAR',
        deal.opportunityType || 'HIGH_GROWTH',
        deal.digitalGapScore || null,
        deal.digitalAudit ? JSON.stringify(deal.digitalAudit) : null,
        deal.scoreFactors ? JSON.stringify(deal.scoreFactors) : null,
        JSON.stringify(deal.signals || []),
        JSON.stringify(deal.activities || [])
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToDeal(result.rows[0]);
    } catch {
      return this.fallback.create(userId, workspaceId, deal);
    }
  }

  public async update(id: string, userId: string, workspaceId: string, updates: Partial<PipelineDealItem>): Promise<PipelineDealItem | null> {
    try {
      const existing = await this.getById(id, userId, workspaceId);
      if (!existing) return null;

      const merged = { ...existing, ...updates };
      const query = `
        UPDATE pipeline_deals SET
          title = $1, company_name = $2, deal_value = $3, stage = $4,
          probability = $5, priority = $6, contact_name = $7, contact_role = $8,
          contact_email = $9, last_activity = $10, next_action = $11,
          next_action_due_date = $12, notes = $13, activities = $14, updated_at = now()
        WHERE id = $15 AND workspace_id = $16 AND (user_id = $17 OR user_id IS NULL)
        RETURNING *
      `;
      const values = [
        merged.title,
        merged.company,
        merged.dealValue,
        merged.stage,
        merged.probability,
        merged.priority,
        merged.contactName,
        merged.contactRole,
        merged.contactEmail,
        merged.lastActivity,
        merged.nextAction,
        merged.nextActionDueDate,
        merged.notes,
        JSON.stringify(merged.activities || []),
        id,
        workspaceId,
        userId
      ];

      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) return null;
      return this.mapRowToDeal(result.rows[0]);
    } catch {
      return this.fallback.update(id, userId, workspaceId, updates);
    }
  }

  public async delete(id: string, userId: string, workspaceId: string): Promise<boolean> {
    try {
      const query = `
        DELETE FROM pipeline_deals 
        WHERE id = $1 AND workspace_id = $2 AND (user_id = $3 OR user_id IS NULL)
      `;
      const result = await this.pool.query(query, [id, workspaceId, userId]);
      return (result.rowCount ?? 0) > 0;
    } catch {
      return this.fallback.delete(id, userId, workspaceId);
    }
  }
}
