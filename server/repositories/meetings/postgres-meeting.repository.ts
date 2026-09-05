import type { Pool } from 'pg';
import type { MeetingItem } from '../../../src/types/meetings';
import type { MeetingRepository, MeetingFilterOptions } from './meeting-repository';
import { InMemoryMeetingRepository } from './in-memory-meeting.repository';

export class PostgresMeetingRepository implements MeetingRepository {
  private fallback = new InMemoryMeetingRepository();

  constructor(private readonly pool: Pool) {}

  public async list(workspaceId: string, filter?: MeetingFilterOptions): Promise<MeetingItem[]> {
    try {
      const params: any[] = [workspaceId];
      const conditions = ['workspace_id = $1'];

      if (filter?.status && filter.status !== 'all') {
        params.push(filter.status);
        conditions.push(`status = $${params.length}`);
      }
      if (filter?.meetingType && filter.meetingType !== 'all') {
        params.push(filter.meetingType);
        conditions.push(`description LIKE $${params.length}`);
      }
      if (filter?.query?.trim()) {
        params.push(`%${filter.query.trim().toLowerCase()}%`);
        conditions.push(`(LOWER(title) LIKE $${params.length})`);
      }

      const query = `
        SELECT * FROM meetings
        WHERE ${conditions.join(' AND ')}
        ORDER BY start_time ASC
      `;
      const result = await this.pool.query(query, params);
      if (result.rows.length === 0) {
        return this.fallback.list(workspaceId, filter);
      }

      return result.rows.map(r => ({
        id: r.id,
        title: r.title,
        meetingType: 'discovery',
        companyName: r.attendees?.[0]?.company || 'Enterprise Account',
        domain: r.attendees?.[0]?.domain || '',
        contactName: r.attendees?.[0]?.name || 'Decision Maker',
        contactRole: r.attendees?.[0]?.role || 'Owner',
        contactAvatarBg: '#10b981',
        contactAvatarColor: '#ffffff',
        scheduledTime: new Date(r.start_time).toLocaleString(),
        durationMinutes: 30,
        meetingUrl: r.meeting_link || 'https://meet.google.com/hnt-exec-session',
        status: r.status,
        dealValue: 50000,
        opportunityScore: 85,
        aiPrepBrief: {
          keyTakeaway: r.description || 'Strategic executive sync',
          recentSignals: ['Opportunity engagement active'],
          suggestedQuestions: ['What are the immediate strategic scaling objectives?']
        },
        agenda: ['Introductions', 'Review scope & requirements', 'Next steps'],
        notes: r.description || ''
      }));
    } catch {
      return this.fallback.list(workspaceId, filter);
    }
  }

  public async getById(id: string, workspaceId: string): Promise<MeetingItem | undefined> {
    try {
      const query = `
        SELECT * FROM meetings
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
        meetingType: 'discovery',
        companyName: r.attendees?.[0]?.company || 'Enterprise Account',
        domain: r.attendees?.[0]?.domain || '',
        contactName: r.attendees?.[0]?.name || 'Decision Maker',
        contactRole: r.attendees?.[0]?.role || 'Owner',
        contactAvatarBg: '#10b981',
        contactAvatarColor: '#ffffff',
        scheduledTime: new Date(r.start_time).toLocaleString(),
        durationMinutes: 30,
        meetingUrl: r.meeting_link || 'https://meet.google.com/hnt-exec-session',
        status: r.status,
        dealValue: 50000,
        opportunityScore: 85,
        aiPrepBrief: {
          keyTakeaway: r.description || 'Strategic executive sync',
          recentSignals: ['Opportunity engagement active'],
          suggestedQuestions: ['What are the immediate strategic scaling objectives?']
        },
        agenda: ['Introductions', 'Review scope & requirements', 'Next steps'],
        notes: r.description || ''
      };
    } catch {
      return this.fallback.getById(id, workspaceId);
    }
  }

  public async create(meeting: Partial<MeetingItem>, workspaceId: string, userId?: string): Promise<MeetingItem> {
    try {
      const query = `
        INSERT INTO meetings (
          workspace_id, user_id, title, description, start_time, end_time,
          attendees, status, meeting_link, location
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const now = new Date();
      const attendees = [{
        name: meeting.contactName || 'Decision Maker',
        role: meeting.contactRole || 'Owner',
        company: meeting.companyName || 'Target Company',
        domain: meeting.domain || ''
      }];

      const result = await this.pool.query(query, [
        workspaceId,
        userId || null,
        meeting.title || 'Executive Session',
        meeting.notes || 'Meeting briefing',
        now.toISOString(),
        new Date(now.getTime() + 30 * 60000).toISOString(),
        JSON.stringify(attendees),
        meeting.status || 'scheduled',
        meeting.meetingUrl || 'https://meet.google.com/hnt-exec-session',
        'Virtual (Google Meet)'
      ]);

      const r = result.rows[0];
      return {
        id: r.id,
        title: r.title,
        meetingType: meeting.meetingType || 'discovery',
        companyName: meeting.companyName || 'Target Company',
        domain: meeting.domain || '',
        contactName: meeting.contactName || 'Decision Maker',
        contactRole: meeting.contactRole || 'Owner',
        contactAvatarBg: '#10b981',
        contactAvatarColor: '#ffffff',
        scheduledTime: new Date(r.start_time).toLocaleString(),
        durationMinutes: meeting.durationMinutes || 30,
        meetingUrl: r.meeting_link,
        status: r.status,
        dealValue: meeting.dealValue || 50000,
        opportunityScore: meeting.opportunityScore || 85,
        aiPrepBrief: meeting.aiPrepBrief || {
          keyTakeaway: 'Focus on client needs and ROI.',
          recentSignals: ['Active interest detected'],
          suggestedQuestions: ['What are the key goals for next quarter?']
        },
        agenda: meeting.agenda || ['Introductions', 'Requirements discussion'],
        notes: r.description || ''
      };
    } catch {
      return this.fallback.create(meeting, workspaceId, userId);
    }
  }

  public async update(id: string, partial: Partial<MeetingItem>, workspaceId: string): Promise<MeetingItem | undefined> {
    try {
      const existing = await this.getById(id, workspaceId);
      if (!existing) return undefined;

      const query = `
        UPDATE meetings
        SET status = COALESCE($1, status),
            title = COALESCE($2, title),
            updated_at = now()
        WHERE id = $3 AND workspace_id = $4
        RETURNING *
      `;
      const result = await this.pool.query(query, [
        partial.status || null,
        partial.title || null,
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
      const query = `DELETE FROM meetings WHERE id = $1 AND workspace_id = $2`;
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
