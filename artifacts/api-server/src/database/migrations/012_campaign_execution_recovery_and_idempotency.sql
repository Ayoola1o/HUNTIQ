-- Migration 012: Campaign Execution Recovery and Step Idempotency
-- Provides durable crash-safe tracking for campaign sequence executions with PostgreSQL unique constraints.

CREATE TABLE IF NOT EXISTS campaign_step_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  prospect_id TEXT NOT NULL,
  sequence_step INTEGER NOT NULL,
  idempotency_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sending', -- 'sending', 'delivered', 'failed', 'unresolved_recovery', 'aborted_reply'
  provider TEXT,
  provider_message_id TEXT,
  provider_thread_id TEXT,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint ensuring exactly one durable record per sequence step for a prospect in a campaign
CREATE UNIQUE INDEX IF NOT EXISTS uq_campaign_step_execution_step 
  ON campaign_step_executions(workspace_id, campaign_id, prospect_id, sequence_step);

-- Unique constraint on idempotency_key
CREATE UNIQUE INDEX IF NOT EXISTS uq_campaign_step_execution_idempotency 
  ON campaign_step_executions(idempotency_key);

-- Index for fast stale sending record scans
CREATE INDEX IF NOT EXISTS idx_campaign_step_executions_stale 
  ON campaign_step_executions(workspace_id, status, claimed_at);

CREATE INDEX IF NOT EXISTS idx_campaign_step_executions_campaign 
  ON campaign_step_executions(campaign_id, prospect_id);
