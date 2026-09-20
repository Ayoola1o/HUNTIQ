-- Migration 009: Harden Workspace Integrations and OAuth States
-- Adds status tracking, error fields, and server-side cryptographic OAuth state binding.

-- 1. Upgrade workspace_integrations schema
ALTER TABLE workspace_integrations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Allow access_token to be nullable so revoked tokens can be wiped safely
ALTER TABLE workspace_integrations ALTER COLUMN access_token DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_workspace_integrations_status ON workspace_integrations(status);

-- 2. Create server-side OAuth states table for cryptographically bound, single-use state verification
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  return_path TEXT NOT NULL DEFAULT '/',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_token ON oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expiry ON oauth_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_states_workspace ON oauth_states(workspace_id);
