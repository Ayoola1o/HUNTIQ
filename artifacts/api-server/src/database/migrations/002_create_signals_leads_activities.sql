-- Canonical Migration 002: Contacts, Signals, Evidence, Leads, and Activities

-- 1. Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT NOT NULL,
  title TEXT,
  department TEXT,
  seniority TEXT,
  email TEXT,
  email_status TEXT DEFAULT 'unverified' CHECK (email_status IN ('verified', 'unverified', 'catch_all', 'invalid')),
  phone TEXT,
  linkedin_url TEXT,
  is_decision_maker BOOLEAN NOT NULL DEFAULT false,
  confidence NUMERIC(3, 2) DEFAULT 0.85,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);

CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_is_decision_maker ON contacts(is_decision_maker);

-- 2. Signals Table
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  strength TEXT NOT NULL DEFAULT 'medium' CHECK (strength IN ('low', 'medium', 'high', 'critical')),
  confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.90,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  observed_from TIMESTAMPTZ,
  observed_to TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signals_company_id ON signals(company_id);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(type);
CREATE INDEX IF NOT EXISTS idx_signals_detected_at ON signals(detected_at);

-- 3. Evidence Table (Linked to Signals & Companies)
CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'job_board',
  provider TEXT NOT NULL,
  source_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.95,
  raw_reference JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_signal_id ON evidence(signal_id);
CREATE INDEX IF NOT EXISTS idx_evidence_company_id ON evidence(company_id);

-- 4. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 75,
  tier TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (tier IN ('HOT', 'HIGH', 'MEDIUM', 'LOW')),
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST', 'DISQUALIFIED')),
  reason TEXT NOT NULL,
  summary TEXT,
  deal_value NUMERIC(12, 2) NOT NULL DEFAULT 5000.00,
  conversion_probability INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, contact_id, signal_id)
);

CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_tier ON leads(tier);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- 5. Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_company_id ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
