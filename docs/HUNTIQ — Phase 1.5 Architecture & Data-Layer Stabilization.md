# HUNTIQ — Phase 1.5 Architecture & Data-Layer Stabilization

You are working on the existing **HUNTIQ** repository.

Repository:
`https://github.com/Ayoola1o/HUNTIQ`

Your task is to **stabilize and connect the existing backend/data architecture before adding more live-data providers**.

## PRIMARY OBJECTIVE

Turn the current HUNTIQ intelligence engine from a partially simulated/in-memory architecture into a clean, persistent, production-ready foundation.

The target flow is:

```text
React/Vite Frontend
        ↓
Express API
        ↓
Service Layer
        ↓
PostgreSQL
        ↓
Intelligence Engine
        ↓
Providers
        ↓
Signals / Evidence / Scoring
        ↓
Lead Generation
        ↓
CRM
```

Do NOT redesign the frontend.

Do NOT add new external providers yet.

Do NOT implement scraping yet.

Do NOT add AI research yet.

Focus only on fixing the existing backend/data architecture.

---

# 1. INSPECT THE EXISTING REPOSITORY FIRST

Before making changes, inspect:

```text
server/
src/
package.json
.env.example
server/db/
server/database/
server/providers/
server/engine/
server/routes/
```

Understand the existing implementations for:

- API server
- PostgreSQL
- memoryStore
- migrations
- job providers
- ingestion engine
- signal engine
- scoring engine
- company resolver
- contact enrichment
- lead generator
- existing frontend API calls

Do not blindly replace working code.

Reuse existing abstractions where they are good.

---

# 2. MAKE POSTGRESQL THE SOURCE OF TRUTH

Currently parts of the system use:

```text
server/db/memoryStore.ts
```

while PostgreSQL infrastructure already exists.

Change the production architecture so that persistent application data uses PostgreSQL.

The memory store may remain only as:

- local development/test fixture storage, if genuinely useful
- mock/test implementation

It must NOT be the production source of truth.

The following should ultimately persist in PostgreSQL:

```text
companies
job_sources
jobs
contacts
signals
evidence
leads
activities
```

Create repository/service abstractions where appropriate.

Example:

```text
server/repositories/
    companyRepository.ts
    jobRepository.ts
    jobSourceRepository.ts
    contactRepository.ts
    signalRepository.ts
    evidenceRepository.ts
    leadRepository.ts
    activityRepository.ts
```

Do not allow controllers or engines to contain raw PostgreSQL queries everywhere.

---

# 3. CREATE ONE CANONICAL DATABASE SCHEMA

Inspect:

```text
server/db/schema.sql
server/database/migrations/
```

There are currently competing schema definitions.

Establish:

```text
server/database/migrations/
```

as the canonical source of truth.

Make all migrations consistent.

Remove, deprecate, or clearly mark any duplicate schema definition that could cause confusion.

Do not simply delete useful schema definitions without checking whether they are referenced.

The final schema must support:

```text
workspaces
companies
job_sources
jobs
contacts
signals
evidence
leads
activities
```

---

# 4. DATABASE SCHEMA REQUIREMENTS

## companies

Must support at least:

```text
id
workspace_id
name
legal_name
domain
website
industry
employee_count
employee_range
country
state
city
description
logo_url
linkedin_url
founded_year
status
first_seen_at
last_verified_at
created_at
updated_at
```

Do not invent company information.

---

## job_sources

Support:

```text
id
workspace_id
company_id
provider
source_type
source_url
company_identifier
external_company_id
last_synced_at
sync_status
created_at
updated_at
```

Providers should be represented as data/configuration, not scattered hard-coded logic.

---

## jobs

Support:

```text
id
workspace_id
company_id
source_id
external_id

title
description
department
function_area
seniority

location
country
remote
employment_type

job_url

posted_at
updated_at

status

first_seen_at
last_seen_at
closed_at

raw_payload

created_at
updated_at
```

---

# 5. JOB DEDUPLICATION IS REQUIRED

This is critical.

A provider sync must NOT create duplicate jobs.

Use a database uniqueness constraint such as:

```text
UNIQUE(source_id, external_id)
```

where appropriate.

The ingestion process must use:

```text
UPSERT
```

rather than blindly inserting every job.

Correct behavior:

```text
First sync:
100 jobs → 100 records

Second sync:
100 same jobs → still 100 records

+ 5 new jobs:
→ 105 records
```

Existing jobs should update:

```text
last_seen_at
updated_at
status
```

rather than creating another row.

---

# 6. FIX THE INGESTION ENGINE

Inspect:

```text
server/engine/index.ts
```

The current engine writes jobs/signals/leads into the memory store.

Refactor it so the production path uses repositories/PostgreSQL.

Desired flow:

```text
syncCompanyJobs()
        ↓
resolve company
        ↓
identify provider
        ↓
fetch jobs
        ↓
normalize jobs
        ↓
upsert jobs
        ↓
detect signals
        ↓
persist signals
        ↓
persist evidence
        ↓
calculate opportunity
        ↓
evaluate lead
        ↓
persist lead
        ↓
log activity
```

All database operations must be persistent.

Use transactions where appropriate.

For example, a signal and its evidence should not end up partially persisted.

---

# 7. UNIFY THE PROVIDER ARCHITECTURE

The repository currently has both:

```text
server/providers/jobs/
```

and:

```text
server/engine/adapters/
```

Do not maintain two competing provider systems.

Establish:

```text
server/providers/
```

as the canonical external-provider boundary.

The desired structure:

```text
server/providers/
    jobs/
        types.ts
        greenhouseProvider.ts
        leverProvider.ts
        ashbyProvider.ts
```

The engine should depend on a common interface such as:

```text
JobProvider
```

Conceptually:

```ts
interface JobProvider {
  getName(): string;

  fetchJobs(identifier: string): Promise<RawJob[]>;

  normalizeJob(job: RawJob): NormalizedJob;
}
```

Use the existing implementation where possible.

Do not unnecessarily rewrite working provider code.

---

# 8. REMOVE FAKE COMPANY RESOLUTION

Inspect the company resolver and job sync logic.

Do NOT do things like:

```text
unknown company
    ↓
guess domain from company name
```

Do not fabricate:

- domains
- websites
- contacts
- emails
- executives
- company facts

If the company cannot confidently be resolved:

```text
RESOLUTION_PENDING
```

or an equivalent explicit status should be used.

A company should only receive a domain when there is evidence for it.

---

# 9. COMPANY RESOLUTION

Create a deterministic resolution process using available evidence such as:

```text
domain
website
external company ID
provider company ID
normalized company name
email domain
source URL
```

Resolution priority should favor:

```text
exact domain
↓
verified external company ID
↓
strong normalized name match
↓
other corroborating evidence
```

Do not merge two companies simply because their names are vaguely similar.

The resolver should return confidence.

Example:

```text
{
  companyId: "...",
  confidence: 0.96,
  method: "DOMAIN_MATCH"
}
```

If confidence is too low:

```text
unresolved
```

---

# 10. FIX HIRING VELOCITY

The current implementation appears to treat the number of jobs as hiring velocity.

That is insufficient.

Implement proper time-window calculations.

At minimum calculate:

```text
7-day new jobs
14-day new jobs
30-day new jobs
```

and:

```text
current 7-day period
vs previous 7-day period
```

and:

```text
current 30-day period
vs previous 30-day period
```

Example:

```text
Current 7 days: 14
Previous 7 days: 6

Acceleration:
+133%
```

Also calculate department-level activity where data permits:

```text
Engineering
Sales
HR
Finance
Marketing
Operations
```

Do not treat raw active-job count as hiring acceleration.

---

# 11. SIGNAL ENGINE

Keep the existing signal architecture where useful.

Existing signal categories include concepts such as:

```text
hiring
funding
expansion
leadership
technology
news
compliance
```

Preserve this architecture.

For hiring, support signals such as:

```text
HIRING_ACCELERATION
DEPARTMENT_EXPANSION
LEADERSHIP_HIRING
GEOGRAPHIC_EXPANSION
HIRING_SURGE
```

A signal should contain:

```text
company_id
type
title
summary
strength
confidence
detected_at
observed_from
observed_to
```

Do not generate duplicate signals every time the same sync runs.

Use an appropriate deduplication strategy.

---

# 12. EVIDENCE MUST BE PERSISTED

Every important signal should have evidence.

Example:

```text
Signal:
Hiring acceleration

Evidence:
32 new jobs detected

Source:
Greenhouse

Source URL:
...

Observed:
2026-08-31

Confidence:
0.96
```

Persist:

```text
signal_id
company_id
source_type
provider
source_url
title
description
observed_at
retrieved_at
confidence
raw_reference
```

The AI layer will eventually consume this evidence.

Do not make AI the source of raw facts.

---

# 13. SEPARATE SIGNAL DETECTION FROM LEAD QUALIFICATION

Do NOT automatically create a lead just because a hiring signal exists.

Use:

```text
Company
   ↓
Signals
   ↓
ICP Qualification
   ↓
Opportunity Score
   ↓
Contact Availability
   ↓
Evidence Confidence
   ↓
Lead
```

A signal is intelligence.

A lead is a qualified sales opportunity.

Keep those concepts separate.

---

# 14. UPGRADE LEAD GENERATION SAFELY

Inspect:

```text
server/engine/leadGenerator.ts
```

Do not allow duplicate leads for the same company/contact/opportunity unless intentionally configured.

Use a sensible uniqueness/deduplication strategy.

A lead should have:

```text
company_id
contact_id
signal_id or source context
score
tier
status
reason
summary
```

The `reason` should be based on actual persisted evidence.

Not fabricated AI content.

---

# 15. DATABASE TRANSACTIONS

Where a single ingestion operation performs:

```text
job upserts
+
signal creation
+
evidence creation
+
lead creation
+
activity logging
```

use transactions where appropriate.

A failed operation should not leave HUNTIQ in an inconsistent state.

For example:

```text
Job inserted
Signal inserted
Evidence failed
Lead inserted
```

should not be considered a successful complete ingestion.

---

# 16. API LAYER

The existing API routes should remain compatible.

Inspect:

```text
server/app.ts
server/routes/
```

Do not break existing frontend endpoints.

Existing routes such as:

```text
/api/health
/api/companies
/api/prospects
/api/signals
/api/research
/api/pipeline
/api/copilot
/api/jobs
/api/contacts
/api/leads
```

should continue functioning.

Change their data source underneath them where necessary.

The frontend should continue consuming API responses without requiring a major redesign.

---

# 17. HEALTH ENDPOINT

Improve:

```text
GET /api/health
```

to optionally expose dependency status:

```json
{
  "status": "ok",
  "service": "huntiq-api",
  "version": "1.0.0",
  "dependencies": {
    "database": "healthy"
  }
}
```

Do not expose:

- credentials
- API keys
- connection strings
- sensitive environment variables

If the database is unavailable, the health status should reflect that appropriately.

---

# 18. ENVIRONMENT SECURITY

Inspect the environment configuration.

Do NOT use production fallback secrets such as:

```text
JWT_SECRET || "default-secret"
```

For production:

```text
JWT_SECRET
```

must be explicitly configured.

Do the same for external provider credentials.

Create/update:

```text
.env.example
```

with placeholders only:

```text
DATABASE_URL=
JWT_SECRET=
PORT=
NODE_ENV=
```

and future provider variables where already supported.

Never commit real secrets.

---

# 19. KEEP MEMORY STORE ONLY FOR TESTING IF NEEDED

If existing frontend/demo tests depend on:

```text
memoryStore
```

do not abruptly delete it.

Instead make the architecture explicit:

```text
Production:
Postgres repositories

Tests:
Memory repositories / mocks
```

Use interfaces where useful:

```text
CompanyRepository
JobRepository
SignalRepository
LeadRepository
```

Then implementations can be:

```text
PostgresCompanyRepository
MemoryCompanyRepository
```

This is preferable to coupling the entire engine to one storage implementation.

---

# 20. TYPE SAFETY

HUNTIQ uses TypeScript.

Avoid:

```ts
as any
```

where it can reasonably be removed.

Especially inspect provider selection and normalization code.

Create shared normalized types:

```text
RawJob
NormalizedJob
CompanyResolution
HiringMetrics
Signal
Evidence
OpportunityScore
```

Avoid having slightly different versions of the same entity across:

```text
frontend
engine
provider
database
```

Create a clear boundary.

---

# 21. FRONTEND COMPATIBILITY

Do not redesign these pages:

```text
Dashboard
Prospects
Companies
Contacts
Market Intelligence
Research
Signals
Pipeline
Reports
Settings
Profile
```

They already exist.

The objective is to make their existing data flows ready to consume persistent backend data.

If an API response needs a compatibility transformation, put it in the service/API layer rather than scattering transformations throughout React components.

---

# 22. ERROR HANDLING

Provider/database failures must be explicit.

For example:

```text
Provider unavailable
Database unavailable
Company unresolved
Invalid job payload
Duplicate job
Rate limited
```

Do not silently swallow failures.

Use structured errors/logging.

Do not expose internal stack traces to normal production API responses.

---

# 23. OBSERVABILITY

Add useful structured logging around ingestion:

```text
JOB_SYNC_STARTED
JOB_SYNC_COMPLETED
JOB_SYNC_FAILED
JOB_CREATED
JOB_UPDATED
JOB_DUPLICATE
COMPANY_RESOLVED
COMPANY_UNRESOLVED
SIGNAL_CREATED
SIGNAL_DUPLICATE
LEAD_CREATED
LEAD_SKIPPED
```

Include:

```text
workspaceId
companyId
provider
counts
duration
```

Do not log:

- API keys
- passwords
- authentication tokens
- private contact information unnecessarily

---

# 24. TESTING

Add or update tests for at least:

### Job deduplication

```text
same provider + external ID
→ one database record
```

### Job update

```text
existing external job
→ update record
```

### Hiring velocity

```text
14 current jobs
6 previous jobs
→ correct acceleration
```

### Company resolution

```text
exact domain
→ high-confidence match
```

### Unresolved company

```text
insufficient evidence
→ no fabricated domain
```

### Signal deduplication

```text
same event
→ don't create infinite duplicate signals
```

### Lead generation

```text
qualified company + contact
→ lead
```

### Lead duplication

```text
same opportunity
→ don't repeatedly create identical leads
```

---

# 25. DO NOT IMPLEMENT YET

Do NOT implement:

```text
❌ LinkedIn scraping
❌ aggressive web scraping
❌ anti-bot bypasses
❌ Hunter integration
❌ new external enrichment providers
❌ AI research automation
❌ email campaigns
❌ automated outreach
❌ funding providers
❌ news providers
❌ large-scale crawling
```

Those belong to later phases.

This phase is about making the foundation reliable.

---

# 26. FINAL TARGET

After implementation, the system should work like this:

```text
                    HUNTIQ

React Frontend
      ↓
Express API
      ↓
Services
      ↓
Repositories
      ↓
PostgreSQL
      ↑
      │
Intelligence Engine
      │
      ├── Provider Registry
      │      ├── Greenhouse
      │      ├── Lever
      │      └── Ashby
      │
      ├── Job Normalizer
      │
      ├── Company Resolver
      │
      ├── Hiring Signal Engine
      │
      ├── Evidence Store
      │
      ├── Opportunity Scoring
      │
      └── Lead Generator
```

The critical data flow must become:

```text
Live Job Source
      ↓
Provider
      ↓
Normalized Job
      ↓
Company Resolution
      ↓
PostgreSQL UPSERT
      ↓
Hiring Metrics
      ↓
Signal
      ↓
Evidence
      ↓
Opportunity Score
      ↓
Qualified Contact
      ↓
Lead
      ↓
CRM
```

---

# ACCEPTANCE CRITERIA

Do not consider this phase complete until all of the following are true:

- [ ] PostgreSQL is the production source of truth.
- [ ] MemoryStore is not used for production persistence.
- [ ] There is one canonical migration/schema strategy.
- [ ] Existing API routes still work.
- [ ] Existing frontend pages still work.
- [ ] Job providers use one canonical provider interface.
- [ ] Jobs are deduplicated using provider/external IDs.
- [ ] Job sync uses UPSERT behavior.
- [ ] Company resolution does not fabricate domains.
- [ ] Hiring velocity compares time periods rather than simply counting jobs.
- [ ] Signals are persisted.
- [ ] Evidence is persisted.
- [ ] Duplicate signals are controlled.
- [ ] Lead creation is separated from signal detection.
- [ ] Duplicate leads are controlled.
- [ ] Transactions are used where appropriate.
- [ ] Production secrets have no insecure defaults.
- [ ] Health endpoint checks the database.
- [ ] TypeScript builds successfully.
- [ ] Tests for the critical data flows pass.
- [ ] No existing UI is unnecessarily redesigned.

---

# IMPORTANT DEVELOPMENT RULE

Do this incrementally.

Before changing a subsystem:

1. Inspect the existing implementation.
2. Identify what is reusable.
3. Make the smallest safe change.
4. Run TypeScript/build/tests.
5. Fix regressions.
6. Move to the next subsystem.

Do NOT rewrite the entire backend.

Do NOT create duplicate implementations of existing engines.

The goal is:

> **Stabilize and connect what HUNTIQ already has, then prepare it for real live data.**

When finished, provide a concise implementation report containing:

```text
1. Files created
2. Files modified
3. Files deprecated/removed
4. Database changes
5. API changes
6. Architecture changes
7. Tests executed
8. Build/typecheck result
9. Remaining issues
10. Exact next recommended implementation step
```