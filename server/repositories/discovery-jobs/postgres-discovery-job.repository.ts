import type { Pool } from 'pg';
import type {
  DiscoveryJobRepository,
  EmailDiscoveryJob,
  CreateDiscoveryJobDto,
  DiscoveryJobStatus,
  ContactEvidenceDto,
  DiscoveryResultDto,
  IntegrationEventDto
} from './discovery-job-repository';

import { InMemoryDiscoveryJobRepository } from './in-memory-discovery-job.repository';

export class PostgresDiscoveryJobRepository implements DiscoveryJobRepository {
  private fallback = new InMemoryDiscoveryJobRepository();

  constructor(private pool: Pool) {}

  private mapRowToJob(row: any): EmailDiscoveryJob {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      companyId: row.company_id,
      provider: row.provider,
      externalJobId: row.external_job_id,
      targetDomain: row.target_domain,
      targetWebsite: row.target_website,
      status: row.status as DiscoveryJobStatus,
      requestedAt: row.requested_at ? new Date(row.requested_at).toISOString() : '',
      startedAt: row.started_at ? new Date(row.started_at).toISOString() : null,
      completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
      emailsFound: row.emails_found || 0,
      error: row.error,
      metadata: row.metadata || {},
      createdBy: row.created_by,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : '',
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : ''
    };
  }

  async createJob(data: CreateDiscoveryJobDto): Promise<EmailDiscoveryJob> {
    try {
      const query = `
        INSERT INTO email_discovery_jobs (
          workspace_id, company_id, provider, external_job_id,
          target_domain, target_website, status, created_by, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, 'QUEUED', $7, $8)
        RETURNING *;
      `;
      const values = [
        data.workspaceId,
        data.companyId || null,
        data.provider || 'email-scraper',
        data.externalJobId || null,
        data.targetDomain || null,
        data.targetWebsite || null,
        data.createdBy || null,
        JSON.stringify(data.metadata || {})
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToJob(result.rows[0]);
    } catch {
      return this.fallback.createJob(data);
    }
  }

  async getJobById(id: string, workspaceId: string): Promise<EmailDiscoveryJob | null> {
    try {
      const query = `
        SELECT * FROM email_discovery_jobs
        WHERE id = $1 AND workspace_id = $2;
      `;
      const result = await this.pool.query(query, [id, workspaceId]);
      if (result.rows.length === 0) return this.fallback.getJobById(id, workspaceId);
      return this.mapRowToJob(result.rows[0]);
    } catch {
      return this.fallback.getJobById(id, workspaceId);
    }
  }

  async updateJobStatus(
    id: string,
    workspaceId: string,
    status: DiscoveryJobStatus,
    updates?: Partial<EmailDiscoveryJob>
  ): Promise<EmailDiscoveryJob | null> {
    try {
      let extraClauses = '';
      const values: any[] = [status, id, workspaceId];
      let idx = 4;

      if (status === 'RUNNING') {
        extraClauses += `, started_at = COALESCE(started_at, now())`;
      } else if (['COMPLETED', 'PARTIAL', 'CANCELLED', 'FAILED'].includes(status)) {
        extraClauses += `, completed_at = now()`;
      }

      if (updates?.emailsFound !== undefined) {
        extraClauses += `, emails_found = $${idx++}`;
        values.push(updates.emailsFound);
      }
      if (updates?.externalJobId !== undefined) {
        extraClauses += `, external_job_id = $${idx++}`;
        values.push(updates.externalJobId);
      }
      if (updates?.error !== undefined) {
        extraClauses += `, error = $${idx++}`;
        values.push(JSON.stringify(updates.error));
      }
      if (updates?.metadata) {
        extraClauses += `, metadata = $${idx++}`;
        values.push(JSON.stringify(updates.metadata));
      }

      const query = `
        UPDATE email_discovery_jobs
        SET status = $1, updated_at = now() ${extraClauses}
        WHERE id = $2 AND workspace_id = $3
        RETURNING *;
      `;

      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) return this.fallback.updateJobStatus(id, workspaceId, status, updates);
      return this.mapRowToJob(result.rows[0]);
    } catch {
      return this.fallback.updateJobStatus(id, workspaceId, status, updates);
    }
  }

  async listJobs(workspaceId: string, limit: number = 50): Promise<EmailDiscoveryJob[]> {
    try {
      const query = `
        SELECT * FROM email_discovery_jobs
        WHERE workspace_id = $1
        ORDER BY created_at DESC
        LIMIT $2;
      `;
      const result = await this.pool.query(query, [workspaceId, limit]);
      if (result.rows.length === 0) return this.fallback.listJobs(workspaceId, limit);
      return result.rows.map(r => this.mapRowToJob(r));
    } catch {
      return this.fallback.listJobs(workspaceId, limit);
    }
  }

  async saveDiscoveryResult(result: DiscoveryResultDto): Promise<void> {
    try {
      const query = `
        INSERT INTO email_discovery_results (
          job_id, workspace_id, company_id, request_id,
          raw_payload, resolution_status, accepted_count, rejected_count, duplicate_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (workspace_id, request_id) DO NOTHING;
      `;
      const values = [
        result.jobId || null,
        result.workspaceId,
        result.companyId || null,
        result.requestId,
        JSON.stringify(result.rawPayload || {}),
        result.resolutionStatus,
        result.acceptedCount,
        result.rejectedCount,
        result.duplicateCount
      ];
      await this.pool.query(query, values);
    } catch {
      return this.fallback.saveDiscoveryResult(result);
    }
  }

  async getDiscoveryResultByRequestId(requestId: string, workspaceId: string): Promise<DiscoveryResultDto | null> {
    try {
      const query = `
        SELECT * FROM email_discovery_results
        WHERE request_id = $1 AND workspace_id = $2;
      `;
      const res = await this.pool.query(query, [requestId, workspaceId]);
      if (res.rows.length === 0) return this.fallback.getDiscoveryResultByRequestId(requestId, workspaceId);
      const row = res.rows[0];
      return {
        jobId: row.job_id,
        workspaceId: row.workspace_id,
        companyId: row.company_id,
        requestId: row.request_id,
        rawPayload: row.raw_payload || {},
        resolutionStatus: row.resolution_status,
        acceptedCount: row.accepted_count,
        rejectedCount: row.rejected_count,
        duplicateCount: row.duplicate_count
      };
    } catch {
      return this.fallback.getDiscoveryResultByRequestId(requestId, workspaceId);
    }
  }

  async saveContactEvidence(evidenceList: ContactEvidenceDto[]): Promise<void> {
    if (evidenceList.length === 0) return;

    try {
      for (const item of evidenceList) {
        const query = `
          INSERT INTO contact_evidence (
            workspace_id, contact_id, company_id, discovery_job_id,
            email, email_type, email_status, confidence,
            source_url, source_type, name, job_title,
            identity_source, identity_inference, phone, socials,
            context_snippet, discovered_at
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7, $8,
            $9, $10, $11, $12,
            $13, $14, $15, $16,
            $17, $18
          );
        `;
        const values = [
          item.workspaceId,
          item.contactId,
          item.companyId,
          item.discoveryJobId || null,
          item.email,
          item.emailType || 'UNKNOWN',
          item.emailStatus || 'UNVERIFIED',
          item.confidence,
          item.sourceUrl || null,
          item.sourceType || 'WEBSITE',
          item.name || null,
          item.jobTitle || null,
          item.identitySource || 'INFERRED',
          JSON.stringify(item.identityInference || null),
          item.phone || null,
          JSON.stringify(item.socials || {}),
          item.contextSnippet || null,
          item.discoveredAt ? new Date(item.discoveredAt) : new Date()
        ];
        await this.pool.query(query, values);
      }
    } catch {
      return this.fallback.saveContactEvidence(evidenceList);
    }
  }

  async listEvidenceForContact(contactId: string, workspaceId: string): Promise<ContactEvidenceDto[]> {
    try {
      const query = `
        SELECT * FROM contact_evidence
        WHERE contact_id = $1 AND workspace_id = $2
        ORDER BY discovered_at DESC;
      `;
      const res = await this.pool.query(query, [contactId, workspaceId]);
      if (res.rows.length === 0) return this.fallback.listEvidenceForContact(contactId, workspaceId);
      return res.rows.map(r => ({
        id: r.id,
        workspaceId: r.workspace_id,
        contactId: r.contact_id,
        companyId: r.company_id,
        discoveryJobId: r.discovery_job_id,
        email: r.email,
        emailType: r.email_type,
        emailStatus: r.email_status,
        confidence: Number(r.confidence),
        sourceUrl: r.source_url,
        sourceType: r.source_type,
        name: r.name,
        jobTitle: r.job_title,
        identitySource: r.identity_source,
        identityInference: r.identity_inference,
        phone: r.phone,
        socials: r.socials || {},
        contextSnippet: r.context_snippet,
        discoveredAt: r.discovered_at ? new Date(r.discovered_at).toISOString() : ''
      }));
    } catch {
      return this.fallback.listEvidenceForContact(contactId, workspaceId);
    }
  }

  async listEvidenceForCompany(companyId: string, workspaceId: string): Promise<ContactEvidenceDto[]> {
    try {
      const query = `
        SELECT * FROM contact_evidence
        WHERE company_id = $1 AND workspace_id = $2
        ORDER BY discovered_at DESC;
      `;
      const res = await this.pool.query(query, [companyId, workspaceId]);
      if (res.rows.length === 0) return this.fallback.listEvidenceForCompany(companyId, workspaceId);
      return res.rows.map(r => ({
        id: r.id,
        workspaceId: r.workspace_id,
        contactId: r.contact_id,
        companyId: r.company_id,
        discoveryJobId: r.discovery_job_id,
        email: r.email,
        emailType: r.email_type,
        emailStatus: r.email_status,
        confidence: Number(r.confidence),
        sourceUrl: r.source_url,
        sourceType: r.source_type,
        name: r.name,
        jobTitle: r.job_title,
        identitySource: r.identity_source,
        identityInference: r.identity_inference,
        phone: r.phone,
        socials: r.socials || {},
        contextSnippet: r.context_snippet,
        discoveredAt: r.discovered_at ? new Date(r.discovered_at).toISOString() : ''
      }));
    } catch {
      return this.fallback.listEvidenceForCompany(companyId, workspaceId);
    }
  }

  async recordIntegrationEvent(event: IntegrationEventDto): Promise<void> {
    try {
      const query = `
        INSERT INTO integration_events (
          workspace_id, job_id, event_type, provider, payload
        ) VALUES ($1, $2, $3, $4, $5);
      `;
      const values = [
        event.workspaceId,
        event.jobId || null,
        event.eventType,
        event.provider || 'email-scraper',
        JSON.stringify(event.payload || {})
      ];
      await this.pool.query(query, values);
    } catch {
      return this.fallback.recordIntegrationEvent(event);
    }
  }
}
