-- Migration 006: Email Discovery Jobs, Discovery Results, Contact Evidence, and Integration Events

-- 1. Email Discovery Jobs Table
CREATE TABLE IF NOT EXISTS email_discovery_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'email-scraper',
  external_job_id TEXT,
  target_domain TEXT,
  target_website TEXT,
  status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'PARTIAL', 'CANCELLED', 'FAILED')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  emails_found INTEGER NOT NULL DEFAULT 0,
  error JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_discovery_jobs_workspace_id ON email_discovery_jobs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_discovery_jobs_company_id ON email_discovery_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_email_discovery_jobs_status ON email_discovery_jobs(status);
CREATE INDEX IF NOT EXISTS idx_email_discovery_jobs_external_id ON email_discovery_jobs(external_job_id);

-- 2. Email Discovery Results Table (Raw Webhook Ingestion & Idempotency)
CREATE TABLE IF NOT EXISTS email_discovery_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES email_discovery_jobs(id) ON DELETE SET NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  request_id TEXT NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolution_status TEXT NOT NULL DEFAULT 'RESOLVED' CHECK (resolution_status IN ('RESOLVED', 'UNRESOLVED')),
  accepted_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  duplicate_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, request_id)
);

CREATE INDEX IF NOT EXISTS idx_email_discovery_results_workspace_id ON email_discovery_results(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_discovery_results_job_id ON email_discovery_results(job_id);
CREATE INDEX IF NOT EXISTS idx_email_discovery_results_request_id ON email_discovery_results(request_id);

-- 3. Contact Evidence Table (Strict Provenance & Inferred/Verified Distinction)
CREATE TABLE IF NOT EXISTS contact_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  discovery_job_id UUID REFERENCES email_discovery_jobs(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  email_type TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (email_type IN ('PERSONAL', 'ROLE_BASED', 'UNKNOWN')),
  email_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (email_status IN ('FOUND', 'VALIDATED', 'UNVERIFIED', 'INVALID', 'BOUNCED')),
  confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.50,
  source_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'WEBSITE',
  name TEXT,
  job_title TEXT,
  identity_source TEXT NOT NULL DEFAULT 'INFERRED' CHECK (identity_source IN ('WEBSITE', 'EMAIL_LOCAL_PART', 'SURROUNDING_TEXT', 'DOM_PATTERN', 'INFERRED')),
  identity_inference JSONB,
  phone TEXT,
  socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  context_snippet TEXT,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_evidence_workspace_id ON contact_evidence(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contact_evidence_contact_id ON contact_evidence(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_evidence_company_id ON contact_evidence(company_id);
CREATE INDEX IF NOT EXISTS idx_contact_evidence_email ON contact_evidence(email);

-- 4. Integration Events Table (Structured Observability)
CREATE TABLE IF NOT EXISTS integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  job_id UUID REFERENCES email_discovery_jobs(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'email-scraper',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_events_workspace_id ON integration_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_job_id ON integration_events(job_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_event_type ON integration_events(event_type);
CREATE INDEX IF NOT EXISTS idx_integration_events_created_at ON integration_events(created_at);
