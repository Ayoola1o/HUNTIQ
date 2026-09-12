-- Migration 004: CRM Entities, Deals, User Activity Logs, API Keys, and Workspace Isolation

-- 1. Pipeline Deals Table
CREATE TABLE IF NOT EXISTS pipeline_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  deal_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  stage TEXT NOT NULL DEFAULT 'Discovery',
  probability INTEGER NOT NULL DEFAULT 50,
  priority TEXT NOT NULL DEFAULT 'Medium',
  contact_name TEXT,
  contact_role TEXT,
  contact_email TEXT,
  expected_close_date DATE,
  last_activity TEXT,
  last_activity_type TEXT,
  next_action TEXT,
  next_action_due_date TEXT,
  notes TEXT,
  website TEXT,
  revenue TEXT,
  linkedin_url TEXT,
  source TEXT,
  opportunity_type TEXT,
  digital_gap_score INTEGER,
  digital_audit JSONB,
  score_factors JSONB,
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_deals_workspace_id ON pipeline_deals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_deals_user_id ON pipeline_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_deals_stage ON pipeline_deals(stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_deals_company ON pipeline_deals(company_name);

-- 2. API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_workspace_id ON api_keys(workspace_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- 3. User Activity Logs Table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_workspace_id ON user_activity_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- 4. Research Reports Table
CREATE TABLE IF NOT EXISTS research_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  domain TEXT,
  dossier_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_research_reports_workspace_id ON research_reports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_research_reports_user_id ON research_reports(user_id);

-- 5. Extend Contacts Table for CRM Fields & Workspace Scoping
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE contacts ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE contacts ADD COLUMN company_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'decision_role'
  ) THEN
    ALTER TABLE contacts ADD COLUMN decision_role TEXT DEFAULT 'Decision Maker';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'influence_score'
  ) THEN
    ALTER TABLE contacts ADD COLUMN influence_score INTEGER DEFAULT 80;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'location'
  ) THEN
    ALTER TABLE contacts ADD COLUMN location TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'tags'
  ) THEN
    ALTER TABLE contacts ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'is_bookmarked'
  ) THEN
    ALTER TABLE contacts ADD COLUMN is_bookmarked BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'last_activity'
  ) THEN
    ALTER TABLE contacts ADD COLUMN last_activity TEXT DEFAULT 'Created recently';
  END IF;

  -- Ensure company_id in contacts can be nullable if contact created before company
  ALTER TABLE contacts ALTER COLUMN company_id DROP NOT NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_workspace_id ON contacts(workspace_id);
