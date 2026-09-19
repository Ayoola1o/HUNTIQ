# HUNTIQ — Phase 2: Verify and Complete the Live Data Pipeline

You are working on the existing **HUNTIQ** repository:

`https://github.com/Ayoola1o/HUNTIQ`

The latest version already contains:

- Express API
- PostgreSQL migrations
- PostgreSQL connection infrastructure
- repositories
- job providers
- ingestion engine
- normalization
- company resolution
- signal engine
- evidence
- scoring
- lead generation
- frontend CRM/intelligence pages

Your job is **NOT to rebuild HUNTIQ**.

Your job is to inspect the current implementation and make the existing architecture work correctly from end to end.

---

# PRIMARY OBJECTIVE

Make this pipeline genuinely functional:

```text
LIVE JOB PROVIDER
       ↓
PROVIDER ADAPTER
       ↓
JOB NORMALIZER
       ↓
COMPANY RESOLUTION
       ↓
POSTGRESQL
       ↓
HIRING SIGNAL ENGINE
       ↓
SIGNAL REPOSITORY
       ↓
EVIDENCE
       ↓
OPPORTUNITY SCORING
       ↓
LEAD QUALIFICATION
       ↓
LEAD REPOSITORY
       ↓
EXPRESS API
       ↓
HUNTIQ FRONTEND
```

The final result should allow HUNTIQ to ingest a real company's jobs, persist them, detect meaningful hiring activity, generate evidence, score the opportunity and expose the resulting intelligence through the existing API/UI.

---

# IMPORTANT RULE

Before changing anything:

1. Inspect the current repository.
2. Identify what has already been implemented.
3. Reuse existing repositories, providers, engines and types.
4. Do not create duplicate architectures.
5. Do not redesign existing UI.
6. Do not replace working code unnecessarily.
7. Make changes incrementally.
8. Run typecheck/build/tests after major changes.

Do not assume the previous version is still accurate.

The GitHub repository has changed.

---

# PHASE 1 — AUDIT THE CURRENT DATA FLOW

Trace the actual execution path for:

```text
/api/jobs
```

and determine:

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Ingestion Engine
 ↓
Provider
 ↓
Normalizer
 ↓
Repository
 ↓
PostgreSQL
```

Document where each step currently goes.

Specifically identify whether any production path still uses:

```text
memoryStore
```

If it does, replace that production dependency with the PostgreSQL repository implementation.

Memory storage may remain only for tests/mocks.

---

# PHASE 2 — POSTGRESQL VERIFICATION

Confirm that PostgreSQL is actually being used by:

```text
companies
jobs
job_sources
signals
evidence
leads
activities
```

Verify:

```text
DATABASE_URL
connection pool
migrations
repositories
transactions
```

Do not create another database abstraction if one already exists.

---

# PHASE 3 — CANONICAL DATABASE SCHEMA

Inspect:

```text
server/database/migrations/
server/db/schema.sql
```

Ensure there is one canonical database definition.

The migration system should be authoritative.

Verify that the database supports:

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

Check for schema/type mismatches between:

```text
TypeScript types
PostgreSQL columns
repository mappings
API responses
```

Fix mismatches rather than adding compatibility hacks everywhere.

---

# PHASE 4 — JOB UPSERT / DEDUPLICATION

This is mandatory.

A job must be uniquely identified using its provider/source identity.

Prefer:

```text
source_id + external_id
```

with a database unique constraint.

Expected behavior:

```text
SYNC #1
100 jobs
→ 100 database rows

SYNC #2
same 100 jobs
→ still 100 rows

SYNC #3
95 existing + 5 new
→ 105 rows
```

Do not create duplicates on every sync.

Use PostgreSQL UPSERT semantics:

```sql
INSERT ...
ON CONFLICT (...)
DO UPDATE ...
```

Update appropriate fields such as:

```text
title
description
location
status
posted_at
updated_at
last_seen_at
raw_payload
```

Do not change the primary job ID during updates.

---

# PHASE 5 — JOB SOURCE MANAGEMENT

Ensure each provider/source has a persistent representation.

The system should know:

```text
provider
company
external identifier
source URL
sync status
last synced
```

Example:

```text
Greenhouse
Company: Acme
Board Token: acme
Last Sync: ...
Status: healthy
```

Do not store provider credentials in database rows.

---

# PHASE 6 — PROVIDER ARCHITECTURE

Inspect:

```text
server/providers/
server/engine/adapters/
```

There must be ONE canonical provider abstraction.

Do not maintain competing implementations such as:

```text
GreenhouseProvider
GreenhouseAdapter
GreenhouseService
GreenhouseClient
```

unless each has a clearly different responsibility.

Prefer:

```text
server/providers/jobs/
    types.ts
    registry.ts
    greenhouseProvider.ts
    leverProvider.ts
    ashbyProvider.ts
```

with a common interface.

Conceptually:

```ts
interface JobProvider {
  getName(): string;

  fetchJobs(identifier: string): Promise<RawJob[]>;

  normalizeJob(job: RawJob): NormalizedJob;
}
```

Reuse the existing interface if one already exists.

Do not rewrite provider code unnecessarily.

---

# PHASE 7 — NORMALIZATION

Every provider must produce the same normalized job structure.

Example:

```text
NormalizedJob
────────────────────
externalId
title
description
department
functionArea
seniority
location
country
remote
employmentType
jobUrl
postedAt
updatedAt
rawPayload
```

The rest of HUNTIQ should not care whether the source is:

```text
Greenhouse
Lever
Ashby
```

The provider layer handles provider-specific differences.

---

# PHASE 8 — COMPANY RESOLUTION

Company resolution must be deterministic and evidence-based.

Use available evidence such as:

```text
provider company ID
domain
website
source URL
normalized company name
email domain
```

Resolution priority:

```text
Exact provider/company ID
        ↓
Exact verified domain
        ↓
Strong normalized name match
        ↓
Other corroborating evidence
```

Return:

```text
companyId
confidence
method
```

Example:

```json
{
  "companyId": "123",
  "confidence": 0.96,
  "method": "DOMAIN_MATCH"
}
```

If confidence is insufficient:

```text
RESOLUTION_PENDING
```

Do NOT:

- invent domains
- invent websites
- invent company IDs
- automatically merge vaguely similar companies

---

# PHASE 9 — HIRING INTELLIGENCE

Do not define hiring velocity as simply:

```text
number of active jobs
```

Calculate actual temporal metrics.

At minimum:

```text
new jobs in last 7 days
new jobs in previous 7 days

new jobs in last 14 days

new jobs in last 30 days
new jobs in previous 30 days
```

Calculate:

```text
7-day growth
30-day growth
hiring acceleration
```

Example:

```text
Current 7 days: 14
Previous 7 days: 6

Growth:
+133%
```

Also calculate department-level activity when enough data exists:

```text
Engineering
Sales
Marketing
Finance
HR
Operations
Product
Customer Success
```

And seniority:

```text
Entry
Mid
Senior
Lead
Director
VP
C-Level
```

---

# PHASE 10 — SIGNAL GENERATION

Use the existing signal engine.

Do not create a second signal system.

At minimum support:

```text
HIRING_ACCELERATION
HIRING_SURGE
DEPARTMENT_EXPANSION
LEADERSHIP_HIRING
GEOGRAPHIC_EXPANSION
```

Future signal categories may include:

```text
FUNDING
EXPANSION
LEADERSHIP_CHANGE
TECHNOLOGY_CHANGE
PRODUCT_LAUNCH
```

but do not implement unrelated external data sources in this phase.

Each signal must contain:

```text
companyId
type
title
summary
strength
confidence
detectedAt
observedFrom
observedTo
```

---

# PHASE 11 — SIGNAL DEDUPLICATION

Repeated job synchronization must NOT generate identical signals endlessly.

Example:

```text
Sync 1
Hiring acceleration
→ signal A

Sync 2
same underlying event
→ update/ignore signal A

Sync 3
same underlying event
→ update/ignore signal A
```

Define a deterministic signal identity or fingerprint.

Possible components:

```text
companyId
signalType
timeWindow
signalFingerprint
```

Do not simply use a random UUID every time the detector runs.

---

# PHASE 12 — EVIDENCE

Every meaningful signal must have evidence.

Example:

```text
Signal:
Hiring Acceleration

Evidence:
14 new jobs detected in the last 7 days

Previous period:
6 jobs

Growth:
+133%

Source:
Greenhouse

Source URL:
...

Observed:
2026-08-31

Confidence:
0.96
```

Persist evidence.

The evidence layer must be the source of truth for the explanation.

Do not allow AI-generated text to substitute for factual evidence.

---

# PHASE 13 — OPPORTUNITY SCORING

Inspect the existing scoring engine.

Do not replace it unless necessary.

The score should eventually consider:

```text
ICP fit
Hiring momentum
Signal strength
Signal recency
Company growth
Department expansion
Senior hiring
Contact availability
Evidence confidence
```

For this phase, make sure the existing scoring engine can consume the new live signal data.

Example:

```text
ICP Fit             88
Hiring Momentum     92
Signal Strength     90
Evidence Confidence 96
Contact Reachability 80

Opportunity Score: 90
```

Use the existing scoring architecture wherever possible.

---

# PHASE 14 — LEAD GENERATION

A signal is NOT automatically a lead.

Correct flow:

```text
Company
 ↓
Signals
 ↓
ICP qualification
 ↓
Opportunity score
 ↓
Contact availability
 ↓
Evidence confidence
 ↓
Lead
```

Only generate a lead when the configured qualification criteria are satisfied.

The lead should reference:

```text
company
contact
signal
score
tier
reason
summary
```

The reason must be traceable to evidence.

---

# PHASE 15 — LEAD DEDUPLICATION

Do not generate the same lead repeatedly on every sync.

Implement appropriate uniqueness/deduplication.

For example:

```text
workspace
+
company
+
contact
+
opportunity context
```

should identify an existing opportunity where appropriate.

If the company receives a new materially different signal later, update the opportunity rather than blindly creating another identical lead.

---

# PHASE 16 — API VERIFICATION

Existing routes must continue working:

```text
/api/health
/api/jobs
/api/companies
/api/prospects
/api/signals
/api/research
/api/pipeline
/api/copilot
/api/contacts
/api/leads
```

Do not break existing frontend behavior.

The API should expose real PostgreSQL-backed data.

Test:

```text
GET /api/jobs
GET /api/companies
GET /api/signals
GET /api/leads
```

after a real ingestion.

---

# PHASE 17 — FRONTEND INTEGRATION

Do not redesign the UI.

Connect the existing pages to the improved backend where necessary.

The following should eventually show the live pipeline:

```text
Dashboard
Companies
Prospects
Signals
Market Intelligence
Research
Contacts
Pipeline
```

For example:

```text
Dashboard
   ↓
Recent live signals
Recent qualified opportunities

Companies
   ↓
Real company/job metrics

Signals
   ↓
Real detected signals + evidence

Prospects
   ↓
Real scored companies/leads
```

Do not replace the current visual design unless there is an actual functional bug.

---

# PHASE 18 — HEALTH / OBSERVABILITY

The health endpoint should report database health.

Example:

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

Add structured logging around:

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
SIGNAL_UPDATED
SIGNAL_DUPLICATE

LEAD_CREATED
LEAD_UPDATED
LEAD_SKIPPED
```

Never log:

```text
JWT secrets
API keys
passwords
authentication tokens
```

---

# PHASE 19 — SECURITY

Inspect:

```text
server/config/env.ts
```

Production must NOT use a fallback JWT secret.

Desired behavior:

```text
development
→ development fallback may be allowed

production
→ JWT_SECRET required
→ startup fails if missing
```

Ensure external API credentials remain server-side.

Never expose private provider credentials through `VITE_*` variables.

---

# PHASE 20 — TEST THE COMPLETE PIPELINE

Create/update integration tests for:

## Test 1 — Provider

```text
provider
→ returns jobs
```

## Test 2 — Normalization

```text
raw provider job
→ normalized job
```

## Test 3 — Company resolution

```text
known company
→ correct company
```

## Test 4 — Job persistence

```text
normalized job
→ PostgreSQL
```

## Test 5 — Deduplication

```text
same external job twice
→ one row
```

## Test 6 — Job update

```text
existing job
→ updated record
```

## Test 7 — Hiring metrics

```text
14 current jobs
6 previous jobs
→ correct growth
```

## Test 8 — Signal

```text
hiring acceleration
→ signal
```

## Test 9 — Evidence

```text
signal
→ evidence
```

## Test 10 — Scoring

```text
signal + company
→ opportunity score
```

## Test 11 — Lead

```text
qualified opportunity
→ lead
```

## Test 12 — Lead deduplication

```text
same opportunity
→ no duplicate lead
```

---

# PHASE 21 — BUILD / TYPECHECK

Before considering the task complete, run the project's existing commands.

At minimum:

```bash
npm run build
npm run lint
```

Run tests if a test command exists.

Also run the database migration command against a test/development database if available:

```bash
npm run db:migrate
```

Do not claim success if a command was not actually executed.

---

# DO NOT DO THESE THINGS

Do NOT:

```text
❌ redesign the UI
❌ rewrite the entire engine
❌ add random new dependencies
❌ create a second database layer
❌ create a second provider architecture
❌ fabricate company information
❌ fabricate contacts
❌ fabricate domains
❌ generate fake signals
❌ bypass provider rate limits
❌ implement anti-bot evasion
❌ scrape LinkedIn
❌ add 10 new providers
❌ implement automated outreach
❌ implement AI research automation
```

This phase is about making the existing live-data architecture reliable.

---

# SUCCESS CRITERIA

The task is complete only when this works:

```text
                 REAL JOB SOURCE
                       │
                       ▼
                 Job Provider
                       │
                       ▼
                  Normalizer
                       │
                       ▼
               Company Resolver
                       │
                       ▼
                 PostgreSQL
                       │
                       ▼
               Hiring Detector
                       │
                       ▼
                  Signal Repo
                       │
                       ▼
                 Evidence Repo
                       │
                       ▼
                Scoring Engine
                       │
                       ▼
                 Lead Generator
                       │
                       ▼
                  Lead Repo
                       │
                       ▼
                  Express API
                       │
                       ▼
                HUNTIQ Frontend
```

And repeated synchronization must be safe:

```text
SYNC 1
→ insert/update

SYNC 2
→ update existing records

SYNC 3
→ only genuinely new information creates new records
```

No duplicate job explosion.

No duplicate signal explosion.

No duplicate lead explosion.

No fabricated company information.

No production dependency on memory storage.

---

# FINAL REPORT

When finished, report:

```text
1. What you found during the audit
2. Files created
3. Files modified
4. Files removed/deprecated
5. Database changes
6. Repository changes
7. Provider changes
8. Engine changes
9. API changes
10. Frontend integration changes
11. Tests run
12. Build result
13. Lint result
14. Migration result
15. Remaining technical debt
16. Recommended next phase
```

Most importantly, explicitly state whether this exact path has been verified:

```text
REAL PROVIDER
→ POSTGRESQL
→ SIGNAL
→ EVIDENCE
→ SCORE
→ LEAD
→ API
```

If any portion is still mocked, simulated, in-memory, or unverified, clearly identify it.

Do not mark the task as complete simply because the code compiles.