-- HUNTIQ PostgreSQL Data Schema (Multi-Tenant SaaS)
-- Step 2 Database Migration & Canonical Entities

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. WORKSPACES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'growth',
    owner_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. COMPANIES (Canonical Intelligence Record)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    domain VARCHAR(255) NOT NULL,
    website VARCHAR(512),
    industry VARCHAR(100),
    employee_count VARCHAR(50),
    employee_range VARCHAR(50),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    description TEXT,
    logo_url VARCHAR(512),
    linkedin_url VARCHAR(512),
    twitter_url VARCHAR(512),
    founded_year VARCHAR(10),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, PROSPECT, CHURNED, ARCHIVED
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_workspace_domain UNIQUE (workspace_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_workspace ON companies(workspace_id);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);

-- ==============================================================================
-- 3. JOB SOURCES (External Applicant Tracking Systems & Providers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS job_sources (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- GREENHOUSE, LEVER, ASHBY, WORKDAY, CAREER_PAGE
    source_type VARCHAR(50) DEFAULT 'ATS_API',
    source_url VARCHAR(512) NOT NULL,
    company_identifier VARCHAR(100),
    external_company_id VARCHAR(100),
    last_synced_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(50) DEFAULT 'IDLE', -- IDLE, SYNCING, SUCCESS, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_company_provider UNIQUE (company_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_job_sources_company ON job_sources(company_id);
CREATE INDEX IF NOT EXISTS idx_job_sources_provider ON job_sources(provider);

-- ==============================================================================
-- 4. JOBS (Discovered Job Postings for Velocity Calculations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    source_id VARCHAR(64) REFERENCES job_sources(id) ON DELETE SET NULL,
    external_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(100),
    function_area VARCHAR(100),
    seniority VARCHAR(50), -- ENTRY, MID, SENIOR, LEAD, DIRECTOR, VP, CXO
    location VARCHAR(255),
    country VARCHAR(100),
    remote BOOLEAN DEFAULT FALSE,
    employment_type VARCHAR(50) DEFAULT 'FULL_TIME',
    job_url VARCHAR(512),
    posted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, CLOSED, EXPIRED
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_source_external_job UNIQUE (source_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);

-- ==============================================================================
-- 5. CONTACTS (Verified Decision Makers)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    seniority VARCHAR(50),
    email VARCHAR(255),
    email_status VARCHAR(50) DEFAULT 'UNKNOWN', -- UNKNOWN, VALID, INVALID, RISKY
    email_confidence INTEGER DEFAULT 0,
    phone VARCHAR(50),
    linkedin_url VARCHAR(512),
    source VARCHAR(100), -- HUNTER_IO, APOLLO, LINKEDIN_CRAWL, MANUAL
    source_url VARCHAR(512),
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_company_email UNIQUE (company_id, email)
);

CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- ==============================================================================
-- 6. SIGNALS (Intelligence & Intent Surge Detections)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS signals (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- HIRING_ACCELERATION, DEPARTMENT_EXPANSION, LEADERSHIP_HIRING, FUNDING, EXPANSION, TECH_CHANGE
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    strength VARCHAR(50) DEFAULT 'HIGH', -- HIGH, MEDIUM, LOW
    confidence INTEGER DEFAULT 85,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observed_from TIMESTAMP WITH TIME ZONE,
    observed_to TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, DISMISSED, ACTED_UPON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_signals_company ON signals(company_id);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(type);
CREATE INDEX IF NOT EXISTS idx_signals_detected_at ON signals(detected_at);

-- ==============================================================================
-- 7. EVIDENCE (Proof Points & Rationale for Signals)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    signal_id VARCHAR(64) NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
    company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    source_type VARCHAR(100) NOT NULL, -- ATS_FEED, NEWS_API, REGULATORY_FILING, DOMAIN_DNS
    provider VARCHAR(100),
    source_url VARCHAR(512),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    observed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confidence INTEGER DEFAULT 90,
    raw_reference JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evidence_signal ON evidence(signal_id);
CREATE INDEX IF NOT EXISTS idx_evidence_company ON evidence(company_id);

-- ==============================================================================
-- 8. LEADS (Qualified High-Intent Opportunities)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id VARCHAR(64) REFERENCES contacts(id) ON DELETE SET NULL,
    signal_id VARCHAR(64) REFERENCES signals(id) ON DELETE SET NULL,
    score INTEGER NOT NULL,
    tier VARCHAR(50) DEFAULT 'Tier 1',
    status VARCHAR(50) DEFAULT 'NEW', -- NEW, CONTACTED, IN_PIPELINE, DISQUALIFIED
    source VARCHAR(100) DEFAULT 'AUTONOMOUS_RADAR',
    reason TEXT,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_workspace ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- ==============================================================================
-- 9. ACTIVITIES (Audit Trail & CRM Operations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE SET NULL,
    contact_id VARCHAR(64) REFERENCES contacts(id) ON DELETE SET NULL,
    lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL, -- LEAD_CREATED, LEAD_VIEWED, CONTACT_ADDED, EMAIL_SENT, NOTE_ADDED, SIGNAL_VIEWED, COMPANY_TRACKED
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activities_workspace ON activities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activities_company ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
