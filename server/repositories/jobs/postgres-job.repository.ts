import type { Pool, PoolClient } from 'pg';
import type { JobProviderName, JobSource, JobSourceStatus, JobSyncStatus, NormalizedJob } from '../../providers/jobs/job-provider';
import type { JobRepository, JobSourcePatch, UpsertJobsResult } from './job-repository';

interface JobSourceRow {
  id: string;
  provider: JobProviderName;
  source_url: string;
  company_identifier: string | null;
  status: JobSourceStatus;
  last_synced_at: Date | string | null;
  sync_status: JobSyncStatus;
  last_sync_error: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

const toIsoString = (value: Date | string | null): string | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return value;
};

const toDateOrNull = (value?: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const mapJobSource = (row: JobSourceRow): JobSource => ({
  id: row.id,
  provider: row.provider,
  sourceUrl: row.source_url,
  companyIdentifier: row.company_identifier ?? undefined,
  status: row.status,
  lastSyncedAt: toIsoString(row.last_synced_at),
  lastSyncStatus: row.sync_status,
  lastSyncError: row.last_sync_error ?? undefined,
  createdAt: toIsoString(row.created_at) ?? new Date().toISOString(),
  updatedAt: toIsoString(row.updated_at) ?? new Date().toISOString(),
});

export class PostgresJobRepository implements JobRepository {
  constructor(private readonly pool: Pool) {}

  async listSources(): Promise<JobSource[]> {
    const result = await this.pool.query<JobSourceRow>('select * from job_sources order by created_at desc');
    return result.rows.map(mapJobSource);
  }

  async getSource(sourceId: string): Promise<JobSource | undefined> {
    const result = await this.pool.query<JobSourceRow>('select * from job_sources where id = $1 limit 1', [sourceId]);
    return result.rows[0] ? mapJobSource(result.rows[0]) : undefined;
  }

  async createSource(source: JobSource): Promise<JobSource> {
    const result = await this.pool.query<JobSourceRow>(
      `insert into job_sources (
        id, provider, source_url, company_identifier, status, sync_status, last_sync_error, created_at, updated_at
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      returning *`,
      [
        source.id,
        source.provider,
        source.sourceUrl,
        source.companyIdentifier ?? null,
        source.status,
        source.lastSyncStatus,
        source.lastSyncError ?? null,
        source.createdAt,
        source.updatedAt,
      ],
    );
    return mapJobSource(result.rows[0]);
  }

  async updateSource(sourceId: string, patch: JobSourcePatch): Promise<JobSource | undefined> {
    const fields: string[] = [];
    const values: unknown[] = [];

    const add = (field: string, value: unknown) => {
      values.push(value);
      fields.push(`${field} = $${values.length}`);
    };

    if ('status' in patch) add('status', patch.status);
    if ('lastSyncedAt' in patch) add('last_synced_at', patch.lastSyncedAt ?? null);
    if ('lastSyncStatus' in patch) add('sync_status', patch.lastSyncStatus);
    if ('lastSyncError' in patch) add('last_sync_error', patch.lastSyncError ?? null);
    add('updated_at', patch.updatedAt);

    values.push(sourceId);
    const result = await this.pool.query<JobSourceRow>(
      `update job_sources set ${fields.join(', ')} where id = $${values.length} returning *`,
      values,
    );
    return result.rows[0] ? mapJobSource(result.rows[0]) : undefined;
  }

  async upsertOpenJobs(source: JobSource, jobs: NormalizedJob[], seenAt: string): Promise<UpsertJobsResult> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      const counts = await this.upsertJobsWithClient(client, source, jobs, seenAt);
      await client.query('commit');
      return counts;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  private async upsertJobsWithClient(client: PoolClient, source: JobSource, jobs: NormalizedJob[], seenAt: string): Promise<UpsertJobsResult> {
    let created = 0;
    let updated = 0;

    for (const job of jobs) {
      const existing = await client.query<{ id: string }>(
        'select id from jobs where source_id = $1 and external_id = $2 limit 1',
        [source.id, job.externalId],
      );

      if (existing.rowCount === 0) created += 1;
      else updated += 1;

      await client.query(
        `insert into jobs (
          source_id, external_id, title, description, department, location, country, remote,
          employment_type, job_url, posted_at, raw_payload, first_seen_at, last_seen_at, status, closed_at, updated_at
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12::jsonb, $13, $13, 'open', null, $13
        )
        on conflict (source_id, external_id) do update set
          title = excluded.title,
          description = excluded.description,
          department = excluded.department,
          location = excluded.location,
          country = excluded.country,
          remote = excluded.remote,
          employment_type = excluded.employment_type,
          job_url = excluded.job_url,
          posted_at = excluded.posted_at,
          raw_payload = excluded.raw_payload,
          last_seen_at = excluded.last_seen_at,
          status = 'open',
          closed_at = null,
          updated_at = excluded.updated_at`,
        [
          source.id,
          job.externalId,
          job.title,
          job.description ?? null,
          job.department ?? null,
          job.location ?? null,
          job.country ?? null,
          job.isRemote ?? null,
          job.employmentType ?? null,
          job.jobUrl,
          toDateOrNull(job.postedAt),
          JSON.stringify(job.rawPayload ?? {}),
          seenAt,
        ],
      );
    }

    return { created, updated };
  }
}

