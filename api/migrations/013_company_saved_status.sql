-- Migration 013: Add is_saved column to companies with workspace index
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_saved BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_companies_workspace_saved ON companies(workspace_id, is_saved);
