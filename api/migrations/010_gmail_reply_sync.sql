-- Migration 010: Gmail Watch, Inbound Reply Tracking, and Stop-on-Reply
-- Adds fields for Gmail watch lifecycle, history ID synchronization,
-- provider thread correlation, and an idempotent inbound email events log.

-- 1. Upgrade workspace_integrations with watch lifecycle and reply sync tracking
ALTER TABLE workspace_integrations
  ADD COLUMN IF NOT EXISTS watch_history_id TEXT,
  ADD COLUMN IF NOT EXISTS watch_expiration TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS watch_resource_id TEXT,
  ADD COLUMN IF NOT EXISTS sync_status TEXT NOT NULL DEFAULT 'idle',
  ADD COLUMN IF NOT EXISTS last_sync_error TEXT,
  ADD COLUMN IF NOT EXISTS stop_sequence_on_reply BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_workspace_integrations_watch_exp 
  ON workspace_integrations(watch_expiration) 
  WHERE is_active = true;

-- 2. Upgrade outreach_threads for provider thread and message correlation
ALTER TABLE outreach_threads
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'gmail',
  ADD COLUMN IF NOT EXISTS provider_thread_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_message_id TEXT,
  ADD COLUMN IF NOT EXISTS stop_sequence_on_reply BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_outreach_threads_provider_thread 
  ON outreach_threads(workspace_id, provider_thread_id) 
  WHERE provider_thread_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outreach_threads_email 
  ON outreach_threads(workspace_id, email) 
  WHERE email IS NOT NULL;

-- 3. Inbound email events table for idempotent reply processing
CREATE TABLE IF NOT EXISTS inbound_email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'gmail',
  provider_message_id TEXT NOT NULL UNIQUE,
  provider_thread_id TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT,
  snippet TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inbound_events_workspace 
  ON inbound_email_events(workspace_id);

CREATE INDEX IF NOT EXISTS idx_inbound_events_thread 
  ON inbound_email_events(workspace_id, provider_thread_id);

CREATE INDEX IF NOT EXISTS idx_inbound_events_sender 
  ON inbound_email_events(workspace_id, sender_email);
