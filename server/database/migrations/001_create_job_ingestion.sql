create extension if not exists pgcrypto;

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  legal_name text,
  domain text,
  website text,
  industry text,
  employee_count integer,
  employee_range text,
  country text,
  state text,
  city text,
  description text,
  logo_url text,
  linkedin_url text,
  founded_year integer,
  status text not null default 'active',
  first_seen_at timestamptz not null default now(),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, domain)
);

create table if not exists job_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  provider text not null check (provider in ('greenhouse', 'lever', 'ashby')),
  source_type text not null default 'job_board',
  source_url text not null,
  company_identifier text,
  external_company_id text,
  status text not null default 'active' check (status in ('active', 'paused', 'error')),
  last_synced_at timestamptz,
  sync_status text not null default 'never_synced' check (sync_status in ('never_synced', 'running', 'succeeded', 'failed')),
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, source_url)
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  source_id uuid not null references job_sources(id) on delete cascade,
  external_id text not null,
  title text not null,
  description text,
  department text,
  function text,
  seniority text,
  location text,
  country text,
  remote boolean,
  employment_type text,
  job_url text not null,
  posted_at timestamptz,
  provider_updated_at timestamptz,
  status text not null default 'open' check (status in ('open', 'closed')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  closed_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, external_id)
);

create index if not exists idx_companies_workspace_id on companies(workspace_id);
create index if not exists idx_companies_domain on companies(domain);
create index if not exists idx_job_sources_workspace_id on job_sources(workspace_id);
create index if not exists idx_job_sources_provider on job_sources(provider);
create index if not exists idx_job_sources_status on job_sources(status);
create index if not exists idx_jobs_company_id on jobs(company_id);
create index if not exists idx_jobs_source_id on jobs(source_id);
create index if not exists idx_jobs_posted_at on jobs(posted_at);
create index if not exists idx_jobs_status on jobs(status);
create index if not exists idx_jobs_last_seen_at on jobs(last_seen_at);

