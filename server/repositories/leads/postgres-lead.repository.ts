import type { Pool } from 'pg';
import type { LeadRecord, LeadRepository } from './lead-repository';
import { InMemoryLeadRepository } from './in-memory-lead.repository';

export class PostgresLeadRepository implements LeadRepository {
  private fallback = new InMemoryLeadRepository();

  constructor(private readonly pool: Pool) {}

  async create(lead: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeadRecord> {
    try {
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
    } catch {
      return this.fallback.create(lead);
    }
  }

  async upsert(lead: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeadRecord> {
    try {
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
    } catch {
      return this.fallback.upsert(lead);
    }
  }

  async findByCompanyId(companyId: string, workspaceId?: string): Promise<LeadRecord[]> {
    try {
      const query = workspaceId
        ? `
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
          WHERE company_id = $1 AND workspace_id = $2
          ORDER BY score DESC
        `
        : `
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
        `;
      const params = workspaceId ? [companyId, workspaceId] : [companyId];
      const result = await this.pool.query(query, params);
      if (result.rows.length === 0) {
        return this.fallback.findByCompanyId(companyId, workspaceId);
      }
      return result.rows;
    } catch {
      return this.fallback.findByCompanyId(companyId, workspaceId);
    }
  }

  async findById(id: string, workspaceId?: string): Promise<LeadRecord | null> {
    try {
      const query = workspaceId
        ? `
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
          WHERE id = $1 AND workspace_id = $2
          LIMIT 1
        `
        : `
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
        `;
      const params = workspaceId ? [id, workspaceId] : [id];
      const result = await this.pool.query(query, params);
      if (!result.rows[0]) {
        return this.fallback.findById(id, workspaceId);
      }
      return result.rows[0];
    } catch {
      return this.fallback.findById(id, workspaceId);
    }
  }

  async list(workspaceId?: string, limit = 50, offset = 0): Promise<LeadRecord[]> {
    try {
      const query = workspaceId
        ? `
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
          WHERE workspace_id = $1
          ORDER BY score DESC, created_at DESC
          LIMIT $2 OFFSET $3
        `
        : `
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
        `;
      const params = workspaceId ? [workspaceId, limit, offset] : [limit, offset];
      const result = await this.pool.query(query, params);
      if (result.rows.length === 0) {
        return this.fallback.list(workspaceId, limit, offset);
      }
      return result.rows;
    } catch {
      return this.fallback.list(workspaceId, limit, offset);
    }
  }

  async updateStatus(id: string, status: LeadRecord['status'], workspaceId?: string): Promise<LeadRecord | null> {
    try {
      const query = workspaceId
        ? `
          UPDATE leads
          SET status = $1, updated_at = now()
          WHERE id = $2 AND workspace_id = $3
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
        `
        : `
          UPDATE leads
          SET status = $1, updated_at = now()
          WHERE id = $2
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
        `;
      const params = workspaceId ? [status, id, workspaceId] : [status, id];
      const result = await this.pool.query(query, params);
      if (!result.rows[0]) {
        return this.fallback.updateStatus(id, status, workspaceId);
      }
      return result.rows[0];
    } catch {
      return this.fallback.updateStatus(id, status, workspaceId);
    }
  }
}
