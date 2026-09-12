You are working on the HUNTIQ repository.

Repository:
https://github.com/Ayoola1o/HUNTIQ

Your task is to perform a production-hardening pass on the CURRENT codebase.

IMPORTANT:
- Do NOT rebuild the application.
- Do NOT redesign the architecture.
- Do NOT remove existing features.
- Do NOT invent new product features.
- Preserve the current UI and business logic unless a change is required for security, persistence, reliability, or correctness.
- Make the smallest safe changes necessary.
- Do not break the existing Email Scraper integration.
- PostgreSQL must be the production source of truth.
- In-memory storage may remain available for tests/local development where appropriate, but NEVER silently become the production fallback.

CURRENT PROBLEMS TO FIX

1. REMOVE PRODUCTION IN-MEMORY DATABASE FALLBACKS

Audit all repository factories, especially:

- server/repositories/api-keys/
- server/repositories/users/
- contacts
- companies
- activities
- discovery jobs
- outreach
- any other persistent domain repositories

Current behavior allows factories to use an in-memory repository when PostgreSQL is unavailable.

This is dangerous in production because the application can appear to work while data disappears after a restart/serverless invocation.

Required behavior:

- Development/test can explicitly use in-memory repositories where intended.
- Production must require DATABASE_URL/PostgreSQL.
- If production starts without the required database configuration, fail fast with a clear configuration error.
- Never silently substitute an in-memory repository in production.
- Do not change test behavior unnecessarily.

Audit ALL repository factories, not only API keys and users.

2. REMOVE THE HARD-CODED PRODUCTION JWT SECRET FALLBACK

Inspect:

server/config/env.ts

Current behavior has a hard-coded JWT secret fallback.

Required behavior:

Production:
- JWT_SECRET is mandatory.
- Missing JWT_SECRET must cause configuration/startup failure.
- Never use a hard-coded secret in production.

Development/test:
- Existing development/test behavior may remain if required by the test suite.

Also:
- Never log the actual JWT secret.
- Never expose it through an API response.
- Add/update tests for production configuration validation.

3. FIX DATABASE MIGRATION READINESS

Inspect the migration system, especially:

server/database/migrate.ts

There is currently an in-process migration promise/guard, but startup must not allow database-dependent requests to race ahead of migrations.

Required behavior:

- Ensure migrations are completed before database-dependent application functionality is considered ready.
- Do not allow the first request to reach a database route while migration 007 or another pending migration is still executing.
- Prevent concurrent migration races where multiple application instances start simultaneously.
- If the deployment architecture makes startup migrations unsafe, implement an appropriate deployment/readiness approach rather than pretending migrations completed.
- Preserve the existing migration files and ordering.
- Do not run migrations repeatedly unnecessarily.

Pay particular attention to serverless/Vercel behavior.

4. MOVE LEAD INGESTION TO PRODUCTION PERSISTENCE

Inspect:

server/services/leadIngestionService.ts

The current implementation directly uses memoryStore for important contact/company/activity operations.

This must be corrected.

Required architecture:

Email Scraper
    ↓
HUNTIQ ingest endpoint
    ↓
LeadIngestionService
    ↓
PostgreSQL repositories
    ↓
Companies / Contacts / Evidence / Activities

The service should NOT directly manipulate memoryStore for production persistence.

Create or reuse repository abstractions as appropriate.

Preserve the existing ingestion/business rules.

Do not rewrite the whole ingestion engine.

5. REMOVE SYNTHETIC "comp-unresolved"

The ingestion flow currently uses:

companyId: 'comp-unresolved'

Do not create fake company IDs for unresolved companies.

Required behavior:

- companyId should be null when a company cannot be resolved.
- Store the available factual discovery information separately:
  - discovered domain
  - source URL
  - discovered company name candidate
  - source type
  - evidence
  - resolution status

Use the existing data model where possible.

If a resolution-status field already exists, use it.
If it does not, add the smallest appropriate schema/model change.

Never fabricate a company entity simply to satisfy a foreign key.

6. AUDIT OUTREACH PERSISTENCE

Inspect:

server/routes/emailIntegration.ts

There is currently mixed persistence.

Examples:
- contact lookup through memoryStore
- outreach thread repository
- activity logging through memoryStore/db.logActivity()

Make the persistence path consistent.

Production source of truth must be PostgreSQL.

Preserve:
- workspace authorization
- recipient ownership checks
- existing outreach behavior
- existing API contract

Also fix the JavaScript operator-precedence issue around:

toName || matchingContact.firstName ? ...

Make the intended fallback logic explicit with parentheses/clear variables.

7. AUDIT EMAIL SCRAPER INTEGRATION

Do not break the existing Email Scraper provider.

Verify the flow remains:

HUNTIQ company/domain
    ↓
EmailScraperProvider
    ↓
Email Scraper API
    ↓
crawl/scrape
    ↓
webhook/ingestion
    ↓
HUNTIQ persistence

The provider should:
- keep credentials server-side
- use the configured API key
- handle authentication errors correctly
- handle timeout/unavailable responses
- handle malformed responses
- maintain workspace isolation

If both Authorization and X-HUNTIQ-API-KEY are being sent, determine which one is the canonical contract.

Prefer ONE canonical authentication mechanism unless backward compatibility explicitly requires both.

Do not break existing integrations without a migration path.

8. WORKSPACE ISOLATION AUDIT

Perform a focused audit of every Email Scraper → HUNTIQ ingestion and CRM persistence path.

Ensure:

- workspace A cannot access workspace B data
- a discovery job belongs to the correct workspace
- contacts created by ingestion belong to the correct workspace
- companies belong to the correct workspace
- activities belong to the correct workspace
- outreach cannot target contacts from another workspace
- API keys cannot be used across workspaces
- external scraper job IDs cannot be used to retrieve another workspace's data

Do not rely only on frontend filtering.

Authorization must be enforced server-side.

9. API KEY SECURITY AUDIT

Review the recently added API-key system.

Verify:

- plaintext API keys are shown only once where appropriate
- only hashes are persisted
- API-key listings never expose secrets
- revoked keys cannot authenticate
- last_used_at behavior is correct
- workspace/user ownership is enforced
- production cannot silently fall back to an in-memory API-key repository
- missing database configuration produces a controlled error

Do not weaken the existing API-key implementation.

10. TESTING

Before finishing, add or update tests for:

A. Production without DATABASE_URL
→ application/repository configuration must fail safely.

B. Production without JWT_SECRET
→ configuration must fail safely.

C. Production must never silently use InMemory repositories.

D. Migration readiness.

E. Email Scraper ingestion persists through PostgreSQL repositories.

F. Unresolved company has companyId = null.

G. Workspace isolation.

H. Outreach persistence.

I. API-key authentication and revocation.

J. Email Scraper integration authentication/error handling.

Run:

npm test

and the complete build/typecheck command used by the repository.

Do not report success unless the actual commands pass.

11. DO NOT CHANGE PRODUCT SCOPE

The existing HUNTIQ product already contains:

- Dashboard
- Copilot
- Opportunities
- Signals
- Find Prospects
- Companies
- Contacts
- Market Intelligence
- Research
- Saved Searches
- Pipeline
- Campaigns
- Outreach
- Tasks
- Meetings
- Reports
- Integrations
- Settings
- Profile
- onboarding

Do not remove or replace these.

Do not add speculative features.

This task is backend reliability/security/persistence hardening.

12. FINAL REVIEW

After implementation:

- inspect git diff
- inspect all changed files
- run tests
- run build/typecheck
- verify no secrets are logged
- verify no production in-memory persistence fallback remains
- verify Email Scraper integration still works
- verify API contracts were not unnecessarily changed

Then provide a concise report containing:

1. Files changed
2. Problems fixed
3. Database/persistence changes
4. Security changes
5. Email Scraper integration changes
6. Tests executed and exact results
7. Build/typecheck result
8. Any remaining risks

Commit the changes with a clear message such as:

fix: harden production persistence and integration