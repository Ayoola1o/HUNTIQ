import type { Pool } from 'pg';
import type { LeadRecord, LeadRepository } from './lead-repository';

export class PostgresLeadRepository implements LeadRepository {
  constructor(private readonly pool: Pool) {}

  async create(lead: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeadRecord> {
    const result = await this.pool.query(
      `
      INSERT INTO leads (
        workspace_id, company_id, contact_id, signal_id, title, score, tier, status, reason, summary, deal_value, conversion_probability
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING 
        id,
        workspace_id as "workspaceId",
        company_id as "companyId",
        contact_id as "contactId",
        signal_id as "signalId",
        title,
        score,
        tier,
        status,
        reason,
        summary,
        deal_value as "dealValue",
        conversion_probability as "conversionProbability",
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        lead.workspaceId,
        lead.companyId,
        lead.contactId || null,
        lead.signalId || null,
        lead.title,
        lead.score,
        lead.tier,
        lead.status,
        lead.reason,
        lead.summary || null,
        lead.dealValue,
        lead.conversionProbability
      ]
    );

    return result.rows[0];
  }

  async upsert(lead: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeadRecord> {
    const result = await this.pool.query(
      `
      INSERT INTO leads (
        workspace_id, company_id, contact_id, signal_id, title, score, tier, status, reason, summary, deal_value, conversion_probability
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (company_id, contact_id, signal_id) DO UPDATE SET
        title = EXCLUDED.title,
        score = EXCLUDED.score,
        tier = EXCLUDED.tier,
        reason = EXCLUDED.reason,
        summary = EXCLUDED.summary,
        deal_value = EXCLUDED.deal_value,
        conversion_probability = EXCLUDED.conversion_probability,
        updated_at = now()
      RETURNING 
        id,
        workspace_id as "workspaceId",
        company_id as "companyId",
        contact_id as "contactId",
        signal_id as "signalId",
        title,
        score,
        tier,
        status,
        reason,
        summary,
        deal_value as "dealValue",
        conversion_probability as "conversionProbability",
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        lead.workspaceId,
        lead.companyId,
        lead.contactId || null,
        lead.signalId || null,
        lead.title,
        lead.score,
        lead.tier,
        lead.status,
        lead.reason,
        lead.summary || null,
        lead.dealValue,
        lead.conversionProbability
      ]
    );

    return result.rows[0];
  }

  async findByCompanyId(companyId: string): Promise<LeadRecord[]> {
    const result = await this.pool.query(
      `
      SELECT 
        id,
        workspace_id as "workspaceId",
        company_id as "companyId",
        contact_id as "contactId",
        signal_id as "signalId",
        title,
        score,
        tier,
        status,
        reason,
        summary,
        deal_value as "dealValue",
        conversion_probability as "conversionProbability",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM leads
      WHERE company_id = $1
      ORDER BY score DESC
      `,
      [companyId]
    );

    return result.rows;
  }

  async findById(id: string): Promise<LeadRecord | null> {
    const result = await this.pool.query(
      `
      SELECT 
        id,
        workspace_id as "workspaceId",
        company_id as "companyId",
        contact_id as "contactId",
        signal_id as "signalId",
        title,
        score,
        tier,
        status,
        reason,
        summary,
        deal_value as "dealValue",
        conversion_probability as "conversionProbability",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM leads
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    return result.rows[0] || null;
  }

  async list(limit = 50, offset = 0): Promise<LeadRecord[]> {
    const result = await this.pool.query(
      `
      SELECT 
        id,
        workspace_id as "workspaceId",
        company_id as "companyId",
        contact_id as "contactId",
        signal_id as "signalId",
        title,
        score,
        tier,
        status,
        reason,
        summary,
        deal_value as "dealValue",
        conversion_probability as "conversionProbability",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM leads
      ORDER BY score DESC, created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    return result.rows;
  }

  async updateStatus(id: string, status: LeadRecord['status']): Promise<LeadRecord | null> {
    const result = await this.pool.query(
      `
      UPDATE leads
      SET status = $2, updated_at = now()
      WHERE id = $1
      RETURNING 
        id,
        workspace_id as "workspaceId",
        company_id as "companyId",
        contact_id as "contactId",
        signal_id as "signalId",
        title,
        score,
        tier,
        status,
        reason,
        summary,
        deal_value as "dealValue",
        conversion_probability as "conversionProbability",
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [id, status]
    );

    return result.rows[0] || null;
  }
}
