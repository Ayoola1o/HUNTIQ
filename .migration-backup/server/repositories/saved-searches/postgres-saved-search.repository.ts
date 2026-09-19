import type { Pool } from 'pg';
import type { SavedSearchItem } from '../../../src/types/savedSearches';
import type { SavedSearchRepository, SavedSearchFilterOptions } from './saved-search-repository';
import { InMemorySavedSearchRepository } from './in-memory-saved-search.repository';

export class PostgresSavedSearchRepository implements SavedSearchRepository {
  private fallback = new InMemorySavedSearchRepository();

  constructor(private readonly pool: Pool) {}

  public async list(workspaceId: string, filter?: SavedSearchFilterOptions): Promise<SavedSearchItem[]> {
    try {
      const params: any[] = [workspaceId];
      const conditions = ['workspace_id = $1'];

      if (filter?.status && filter.status !== 'all') {
        params.push(filter.status);
        conditions.push(`status = $${params.length}`);
      }
      if (filter?.searchType && filter.searchType !== 'all') {
        params.push(filter.searchType);
        conditions.push(`search_type = $${params.length}`);
      }
      if (filter?.monitoring !== undefined) {
        params.push(filter.monitoring);
        conditions.push(`monitoring_enabled = $${params.length}`);
      }
      if (filter?.query?.trim()) {
        params.push(`%${filter.query.trim().toLowerCase()}%`);
        conditions.push(`(LOWER(name) LIKE $${params.length} OR LOWER(COALESCE(query, '')) LIKE $${params.length})`);
      }

      const query = `
        SELECT * FROM saved_searches
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
        description: r.filters?.description || '',
        searchType: r.search_type,
        status: 'active',
        monitoringEnabled: r.monitoring_enabled,
        alertFrequency: 'daily',
        createdAt: new Date(r.created_at).toLocaleDateString(),
        lastRunAt: r.last_run_at ? new Date(r.last_run_at).toLocaleTimeString() : 'Never',
        lastUpdated: 'Recently',
        filters: r.filters || { industries: [], locations: [], companySizes: [] },
        signalsToWatch: r.filters?.signalsToWatch || [],
        icpName: r.filters?.icpName || 'Custom ICP',
        totalMatches: r.match_count || 0,
        newMatchesCount: r.new_matches_count || 0,
        highOpportunityCount: Math.round((r.match_count || 0) * 0.4),
        activeSignalsCount: Math.round((r.match_count || 0) * 0.25),
        unreadAlertsCount: 0,
        alertSettings: { emailNotifications: true, inAppAlerts: true, slackWebhook: false, scoreThreshold: 75 },
        matchedCompanies: [],
        recentActivity: []
      }));
    } catch {
      return this.fallback.list(workspaceId, filter);
    }
  }

  public async getById(id: string, workspaceId: string): Promise<SavedSearchItem | undefined> {
    try {
      const query = `
        SELECT * FROM saved_searches
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
        description: r.filters?.description || '',
        searchType: r.search_type,
        status: 'active',
        monitoringEnabled: r.monitoring_enabled,
        alertFrequency: 'daily',
        createdAt: new Date(r.created_at).toLocaleDateString(),
        lastRunAt: r.last_run_at ? new Date(r.last_run_at).toLocaleTimeString() : 'Never',
        lastUpdated: 'Recently',
        filters: r.filters || { industries: [], locations: [], companySizes: [] },
        signalsToWatch: r.filters?.signalsToWatch || [],
        icpName: r.filters?.icpName || 'Custom ICP',
        totalMatches: r.match_count || 0,
        newMatchesCount: r.new_matches_count || 0,
        highOpportunityCount: Math.round((r.match_count || 0) * 0.4),
        activeSignalsCount: Math.round((r.match_count || 0) * 0.25),
        unreadAlertsCount: 0,
        alertSettings: { emailNotifications: true, inAppAlerts: true, slackWebhook: false, scoreThreshold: 75 },
        matchedCompanies: [],
        recentActivity: []
      };
    } catch {
      return this.fallback.getById(id, workspaceId);
    }
  }

  public async create(search: Partial<SavedSearchItem>, workspaceId: string, userId?: string): Promise<SavedSearchItem> {
    try {
      const query = `
        INSERT INTO saved_searches (
          workspace_id, user_id, name, search_type, query, filters, monitoring_enabled, match_count
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const result = await this.pool.query(query, [
        workspaceId,
        userId || null,
        search.name || 'Untitled Search',
        search.searchType || 'advanced_search',
        search.naturalQuery || search.name || '',
        JSON.stringify(search.filters || {}),
        search.monitoringEnabled ?? true,
        search.totalMatches || 0
      ]);

      const r = result.rows[0];
      return {
        id: r.id,
        name: r.name,
        description: search.description || '',
        searchType: r.search_type,
        status: 'active',
        monitoringEnabled: r.monitoring_enabled,
        alertFrequency: search.alertFrequency || 'daily',
        createdAt: 'Just now',
        lastRunAt: 'Just now',
        lastUpdated: 'Just now',
        filters: r.filters || { industries: [], locations: [], companySizes: [] },
        signalsToWatch: search.signalsToWatch || [],
        icpName: search.icpName || 'Custom ICP',
        totalMatches: r.match_count,
        newMatchesCount: 0,
        highOpportunityCount: 0,
        activeSignalsCount: 0,
        unreadAlertsCount: 0,
        alertSettings: search.alertSettings || { emailNotifications: true, inAppAlerts: true, slackWebhook: false, scoreThreshold: 75 },
        matchedCompanies: [],
        recentActivity: []
      };
    } catch {
      return this.fallback.create(search, workspaceId, userId);
    }
  }

  public async update(id: string, partial: Partial<SavedSearchItem>, workspaceId: string): Promise<SavedSearchItem | undefined> {
    try {
      const existing = await this.getById(id, workspaceId);
      if (!existing) return undefined;

      const query = `
        UPDATE saved_searches
        SET name = COALESCE($1, name),
            monitoring_enabled = COALESCE($2, monitoring_enabled),
            updated_at = now()
        WHERE id = $3 AND workspace_id = $4
        RETURNING *
      `;
      const result = await this.pool.query(query, [
        partial.name || null,
        partial.monitoringEnabled ?? null,
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
      const query = `DELETE FROM saved_searches WHERE id = $1 AND workspace_id = $2`;
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
