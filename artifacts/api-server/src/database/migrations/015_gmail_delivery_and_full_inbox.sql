ALTER TABLE outreach_threads
  ADD COLUMN IF NOT EXISTS provider_rfc_message_id TEXT,
  ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_outreach_threads_provider_rfc_message
  ON outreach_threads(workspace_id, provider_rfc_message_id)
  WHERE provider_rfc_message_id IS NOT NULL;

ALTER TABLE inbound_email_events
  ADD COLUMN IF NOT EXISTS sender_name TEXT,
  ADD COLUMN IF NOT EXISTS body_text TEXT,
  ADD COLUMN IF NOT EXISTS message_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processing_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_inbound_events_unmatched
  ON inbound_email_events(workspace_id, received_at DESC)
  WHERE correlation_status = 'unresolved' AND reviewed_at IS NULL;

CREATE TABLE IF NOT EXISTS outbound_email_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  outreach_thread_id UUID NOT NULL REFERENCES outreach_threads(id) ON DELETE CASCADE,
  request_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'gmail',
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'sending' CHECK (state IN ('sending', 'sent', 'failed', 'unknown')),
  provider_message_id TEXT,
  provider_thread_id TEXT,
  provider_rfc_message_id TEXT,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, request_id)
);

CREATE INDEX IF NOT EXISTS idx_outbound_email_attempts_workspace_state
  ON outbound_email_attempts(workspace_id, state, created_at DESC);
