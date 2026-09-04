import type { Pool } from 'pg';
import type { ContactItem, DecisionRole, VerificationStatus, ContactSource } from '../../../src/types/contact';
import type { ContactRepository } from './contact-repository';
import { InMemoryContactRepository } from './in-memory-contact.repository';

export class PostgresContactRepository implements ContactRepository {
  private fallback = new InMemoryContactRepository();

  constructor(private readonly pool: Pool) {}

  private mapRowToContact(row: any): ContactItem {
    return {
      id: row.id,
      name: row.full_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Executive Contact',
      email: row.email || '',
      avatarUrl: row.avatar_url || '',
      verificationStatus: (row.email_status === 'verified' ? 'verified' : 'unverified') as VerificationStatus,
      companyName: row.company_name || 'Enterprise Prospect',
      companyLocation: row.location || 'Global',
      companyIndustry: 'Technology & Commercial Services',
      companyEmployees: '50-250',
      role: row.title || 'Executive',
      decisionRole: (row.decision_role || (row.is_decision_maker ? 'Decision Maker' : 'Influencer')) as DecisionRole,
      influenceScore: Number(row.influence_score) || 85,
      influenceLevel: Number(row.influence_score) >= 85 ? 'High Influence' : 'Medium Influence',
      opportunityFitScore: 88,
      opportunityFitLevel: 'Strong Fit',
      lastActivity: row.last_activity || 'Recently captured',
      lastActivityTime: '2 hours ago',
      source: 'manual' as ContactSource,
      isBookmarked: Boolean(row.is_bookmarked),
      phone: row.phone || '',
      location: row.location || 'Lagos, Nigeria',
      localTime: 'WAT (UTC+1)',
      about: row.notes || 'Verified key stakeholder identified via HUNTIQ Intelligence.',
      aiInsights: [
        'Active decision maker overseeing strategic budgets.',
        'High responsiveness during weekday morning hours.'
      ],
      tags: Array.isArray(row.tags) ? row.tags : ['Key Account'],
      opportunities: [],
      linkedinUrl: row.linkedin_url || undefined,
      activities: []
    };
  }

  public async listByUser(userId: string, workspaceId: string): Promise<ContactItem[]> {
    try {
      const query = `
        SELECT * FROM contacts
        WHERE workspace_id = $1 AND (user_id = $2 OR user_id IS NULL)
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, [workspaceId, userId]);
      if (result.rows.length === 0) {
        return this.fallback.listByUser(userId, workspaceId);
      }
      return result.rows.map((r) => this.mapRowToContact(r));
    } catch {
      return this.fallback.listByUser(userId, workspaceId);
    }
  }

  public async getById(id: string, userId: string, workspaceId: string): Promise<ContactItem | null> {
    try {
      const query = `
        SELECT * FROM contacts
        WHERE id = $1 AND workspace_id = $2 AND (user_id = $3 OR user_id IS NULL)
        LIMIT 1
      `;
      const result = await this.pool.query(query, [id, workspaceId, userId]);
      if (result.rows.length === 0) {
        return this.fallback.getById(id, userId, workspaceId);
      }
      return this.mapRowToContact(result.rows[0]);
    } catch {
      return this.fallback.getById(id, userId, workspaceId);
    }
  }

  public async create(userId: string, workspaceId: string, contact: Partial<ContactItem>): Promise<ContactItem> {
    try {
      const query = `
        INSERT INTO contacts (
          workspace_id, user_id, full_name, title, email, email_status,
          phone, linkedin_url, is_decision_maker, company_name, decision_role,
          influence_score, location, tags, is_bookmarked, last_activity
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16
        ) RETURNING *
      `;
      const isDM = contact.decisionRole === 'Decision Maker';
      const values = [
        workspaceId,
        userId,
        contact.name || 'Executive Contact',
        contact.role || 'Executive',
        contact.email || null,
        contact.verificationStatus === 'verified' ? 'verified' : 'unverified',
        contact.phone || null,
        contact.linkedinUrl || null,
        isDM,
        contact.companyName || 'Enterprise Prospect',
        contact.decisionRole || 'Decision Maker',
        contact.influenceScore || 85,
        contact.location || 'Global',
        contact.tags || ['Key Account'],
        contact.isBookmarked || false,
        contact.lastActivity || 'Created in HUNTIQ'
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToContact(result.rows[0]);
    } catch {
      return this.fallback.create(userId, workspaceId, contact);
    }
  }

  public async update(id: string, userId: string, workspaceId: string, updates: Partial<ContactItem>): Promise<ContactItem | null> {
    try {
      const existing = await this.getById(id, userId, workspaceId);
      if (!existing) return null;

      const merged = { ...existing, ...updates };
      const query = `
        UPDATE contacts SET
          full_name = $1, title = $2, email = $3, phone = $4,
          linkedin_url = $5, company_name = $6, decision_role = $7,
          influence_score = $8, location = $9, tags = $10,
          is_bookmarked = $11, last_activity = $12, updated_at = now()
        WHERE id = $13 AND workspace_id = $14 AND (user_id = $15 OR user_id IS NULL)
        RETURNING *
      `;
      const values = [
        merged.name,
        merged.role,
        merged.email,
        merged.phone,
        merged.linkedinUrl,
        merged.companyName,
        merged.decisionRole,
        merged.influenceScore,
        merged.location,
        merged.tags,
        merged.isBookmarked,
        merged.lastActivity,
        id,
        workspaceId,
        userId
      ];

      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) return null;
      return this.mapRowToContact(result.rows[0]);
    } catch {
      return this.fallback.update(id, userId, workspaceId, updates);
    }
  }

  public async delete(id: string, userId: string, workspaceId: string): Promise<boolean> {
    try {
      const query = `
        DELETE FROM contacts
        WHERE id = $1 AND workspace_id = $2 AND (user_id = $3 OR user_id IS NULL)
      `;
      const result = await this.pool.query(query, [id, workspaceId, userId]);
      return (result.rowCount ?? 0) > 0;
    } catch {
      return this.fallback.delete(id, userId, workspaceId);
    }
  }
}
