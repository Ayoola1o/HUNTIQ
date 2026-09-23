-- Migration 011: Composite Inbound Idempotency, Correlation Tracking, and Campaign-Outreach Linking
-- Resolves provider message ID scope and links outreach threads directly to campaigns and prospects.

DO $$
BEGIN
  -- 1. Drop old single-column unique constraint on provider_message_id if exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'inbound_email_events_provider_message_id_key'
  ) THEN
    ALTER TABLE inbound_email_events DROP CONSTRAINT inbound_email_events_provider_message_id_key;
  END IF;

  -- 2. Add composite uniqueness constraint on (workspace_id, provider, provider_message_id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'uq_inbound_email_events_workspace_provider_msg'
  ) THEN
    ALTER TABLE inbound_email_events 
    ADD CONSTRAINT uq_inbound_email_events_workspace_provider_msg 
    UNIQUE (workspace_id, provider, provider_message_id);
  END IF;

  -- 3. Add correlation_status and matched_thread_id to inbound_email_events
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inbound_email_events' AND column_name = 'correlation_status'
  ) THEN
    ALTER TABLE inbound_email_events ADD COLUMN correlation_status TEXT NOT NULL DEFAULT 'matched';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inbound_email_events' AND column_name = 'matched_thread_id'
  ) THEN
    ALTER TABLE inbound_email_events ADD COLUMN matched_thread_id UUID REFERENCES outreach_threads(id) ON DELETE SET NULL;
  END IF;

  -- 4. Add campaign_id and prospect_id to outreach_threads for direct campaign correlation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'outreach_threads' AND column_name = 'campaign_id'
  ) THEN
    ALTER TABLE outreach_threads ADD COLUMN campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'outreach_threads' AND column_name = 'prospect_id'
  ) THEN
    ALTER TABLE outreach_threads ADD COLUMN prospect_id TEXT;
  END IF;
END $$;

-- 5. Indexes for fast thread correlation and inbox events lookup
CREATE INDEX IF NOT EXISTS idx_inbound_events_lookup ON inbound_email_events(workspace_id, provider, provider_message_id);
CREATE INDEX IF NOT EXISTS idx_inbound_events_thread ON inbound_email_events(workspace_id, provider_thread_id);
CREATE INDEX IF NOT EXISTS idx_outreach_threads_campaign ON outreach_threads(workspace_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_threads_provider_thread ON outreach_threads(workspace_id, provider_thread_id);
