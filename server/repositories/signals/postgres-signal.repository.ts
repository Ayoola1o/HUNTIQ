import type { Pool } from 'pg';
import type { SignalRecord, SignalRepository } from './signal-repository';

export class PostgresSignalRepository implements SignalRepository {
  constructor(private readonly pool: Pool) {}

  async create(signal: Omit<SignalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<SignalRecord> {
    const result = await this.pool.query(
      `
      INSERT INTO signals (
        workspace_id, company_id, type, title, summary, strength, confidence, detected_at, observed_from, observed_to, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING 
        id,
        workspace_id as "workspaceId",
        company_id as "companyId",
        type,
        title,
        summary,
        strength,
        confidence,
        detected_at as "detectedAt",
        observed_from as "observedFrom",
        observed_to as "observedTo",
        metadata,
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        signal.workspaceId,
        signal.companyId,
        signal.type,
        signal.title,
        signal.summary || null,
        signal.strength,
        signal.confidence,
        signal.detectedAt,
        signal.observedFrom || null,
        signal.observedTo || null,
        JSON.stringify(signal.metadata || {})
      ]
    );

    return result.rows[0];
  }

  async findByCompanyId(companyId: string): Promise<SignalRecord[]> {
    const result = await this.pool.query(
      `
      SELECT 
        id,
        workspace_id as "workspaceId",
        company_id as "companyId",
        type,
        title,
        summary,
        strength,
        confidence,
        detected_at as "detectedAt",
        observed_from as "observedFrom",
        observed_to as "observedTo",
        metadata,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM signals
      WHERE company_id = $1
      ORDER BY detected_at DESC
      `,
      [companyId]
    );

    return result.rows;
  }

  async findByType(type: string): Promise<SignalRecord[]> {
    const result = await this.pool.query(
      `
      SELECT 
        id,
        workspace_id as "workspaceId",
        company_id as "companyId",
        type,
        title,
        summary,
        strength,
        confidence,
        detected_at as "detectedAt",
        observed_from as "observedFrom",
        observed_to as "observedTo",
        metadata,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM signals
      WHERE type = $1
      ORDER BY detected_at DESC
      `,
      [type]
    );

    return result.rows;
  }

  async list(limit = 50, offset = 0): Promise<SignalRecord[]> {
    const result = await this.pool.query(
      `
      SELECT 
        id,
        workspace_id as "workspaceId",
        company_id as "companyId",
        type,
        title,
        summary,
        strength,
        confidence,
        detected_at as "detectedAt",
        observed_from as "observedFrom",
        observed_to as "observedTo",
        metadata,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM signals
      ORDER BY detected_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    return result.rows;
  }

  async deleteByCompanyId(companyId: string): Promise<number> {
    const result = await this.pool.query(
      'DELETE FROM signals WHERE company_id = $1',
      [companyId]
    );
    return result.rowCount || 0;
  }
}
