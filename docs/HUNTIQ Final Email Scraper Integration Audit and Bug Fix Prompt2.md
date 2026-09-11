You are now working on the CURRENT HUNTIQ main branch.

Repository:
https://github.com/Ayoola1o/HUNTIQ

The Email Scraper integration has already been implemented in commit:

5742a62
"feat: add email integration routes, discovery services, and frontend components"

DO NOT rebuild the integration from scratch.

Your task is to perform a complete END-TO-END AUDIT of the existing implementation and FIX ONLY the remaining bugs, mismatches, broken contracts, missing connections, and runtime issues.

The separate Email Scraper repository is:

https://github.com/Ayoola1o/email-scraper

==================================================
PRIMARY OBJECTIVE
==================================================

Make this exact flow work reliably:

HUNTIQ Find Prospects
        ↓
Select Business
        ↓
Discover Contacts
        ↓
HUNTIQ creates discovery job
        ↓
HUNTIQ calls Email Scraper
        ↓
Email Scraper creates crawl job
        ↓
Email Scraper crawls website
        ↓
Email Scraper extracts contacts/emails
        ↓
Email Scraper sends results to HUNTIQ webhook
        ↓
HUNTIQ authenticates webhook
        ↓
HUNTIQ validates payload
        ↓
HUNTIQ resolves workspace
        ↓
HUNTIQ resolves company
        ↓
HUNTIQ creates/updates contacts
        ↓
HUNTIQ stores contact evidence
        ↓
HUNTIQ records integration event
        ↓
HUNTIQ updates discovery job status
        ↓
Contacts appear in HUNTIQ
        ↓
Contacts can be used for Opportunities / Outreach / Pipeline.

==================================================
1. DO NOT REWRITE WORKING CODE
==================================================

The following functionality already exists and must be inspected before modifying:

server/providers/emailScraper/
server/services/emailDiscoveryService.ts
server/services/emailDispatchService.ts
server/routes/emailDiscovery.ts
server/routes/emailIntegration.ts
server/routes/leadIngest.ts
server/services/leadIngestionService.ts

Also inspect:

server/repositories/discovery-jobs/
server/database/migrations/006_email_discovery_and_evidence.sql
server/tests/email_scraper_integration.test.ts

Frontend:

src/api/emailDiscovery.ts
src/components/prospects/ContactDiscoveryModal.tsx
src/components/prospects/BusinessNicheDiscovery.tsx

Preserve the existing architecture.

==================================================
2. INSPECT BOTH REPOSITORIES
==================================================

Do not assume that HUNTIQ and Email Scraper have matching API contracts.

Inspect the CURRENT source code of both repositories.

Compare:

HUNTIQ EmailScraperProvider

against the ACTUAL Email Scraper endpoints.

Verify:

- health endpoint
- crawl endpoint
- page endpoint
- job ID response
- job status
- webhook endpoint
- webhook payload
- authentication header
- API key format
- error response format
- job status values.

The actual Email Scraper source code is the source of truth.

Fix HUNTIQ if its expected contract does not match Email Scraper.

==================================================
3. AUTHENTICATION AUDIT
==================================================

HUNTIQ currently sends the Email Scraper API key through its configured authentication mechanism.

Verify whether Email Scraper expects:

Authorization: Bearer <key>

or:

X-HUNTIQ-API-KEY: <key>

or another header.

Do not guess.

Make both sides use exactly one consistent machine-to-machine authentication mechanism.

Then test:

HUNTIQ → Email Scraper

and:

Email Scraper → HUNTIQ webhook.

The scraper must NOT use a normal user JWT.

Workspace isolation must remain enforced.

Never trust a workspace ID supplied by the external scraper.

The authenticated API key must determine the authorized integration identity/workspace.

==================================================
4. ENVIRONMENT VARIABLE AUDIT
==================================================

Inspect both repositories and identify the exact environment variables required.

Verify that:

EMAIL_SCRAPER_API_URL
EMAIL_SCRAPER_API_KEY
EMAIL_SCRAPER_ENABLED
EMAIL_SCRAPER_TIMEOUT_MS

or the actual current names are consistent.

Do not introduce duplicate environment variable names.

Do not hardcode localhost.

Do not hardcode production URLs.

Do not expose secrets in frontend code.

Update .env.example only with variable names/placeholders, never real secrets.

==================================================
5. HUNTIQ → EMAIL SCRAPER TEST
==================================================

Test:

POST /api/v1/email-discovery/jobs

Example:

{
  "companyName": "Acme Corporation",
  "domain": "acme-corp.com",
  "website": "https://acme-corp.com"
}

Verify:

HTTP 201

and:

success === true

and a valid HUNTIQ discovery job is created.

Verify that the external Email Scraper job ID is saved.

Expected lifecycle:

QUEUED
→ RUNNING

If the scraper rejects the request:

QUEUED
→ FAILED

with a useful error.

==================================================
6. EMAIL SCRAPER → HUNTIQ WEBHOOK
==================================================

This is the most important audit.

Verify that Email Scraper knows where to send completed results.

Expected HUNTIQ endpoint:

POST /api/v1/integrations/email-scraper/webhook

Verify the exact payload contract.

Expected conceptual structure:

{
  "integration": "email-scraper",
  "version": "1.0",
  "requestId": "...",
  "source": {
    "type": "website_email_scraper"
  },
  "company": {
    "name": "...",
    "domain": "...",
    "website": "..."
  },
  "contacts": [
    {
      "email": "...",
      "emailType": "...",
      "emailStatus": "...",
      "confidence": 0.95,
      "sourceUrl": "...",
      "sourceType": "...",
      "name": "...",
      "jobTitle": "...",
      "identitySource": "...",
      "phone": "...",
      "socials": {}
    }
  ]
}

BUT use the actual Email Scraper schema if it differs.

Do not force an invented schema.

==================================================
7. WEBHOOK AUTHENTICATION
==================================================

Test the webhook with:

- valid API key
- invalid API key
- missing API key
- expired/invalid credential
- wrong workspace
- malformed payload.

Expected:

valid → accepted

invalid → 401/403

malformed → 400

wrong tenant → rejected

Never allow the webhook caller to select another workspace.

==================================================
8. WEBHOOK IDEMPOTENCY
==================================================

The migration already contains:

email_discovery_results

with:

UNIQUE(workspace_id, request_id)

Verify that this actually prevents duplicate ingestion.

Send the same webhook payload twice.

Expected:

First request:
contacts imported.

Second request:
no duplicate contacts.

The second request should return an idempotent result such as:

already_processed

or the repository's existing equivalent.

Do not create duplicate outreach drafts either.

==================================================
9. CONTACT INGESTION
==================================================

Verify that webhook contacts pass through the existing HUNTIQ lead/contact ingestion architecture.

Do not create a separate contact-creation system unless absolutely necessary.

For every valid email:

- normalize email
- resolve company
- match existing contact
- create contact if necessary
- preserve source
- preserve confidence
- preserve evidence.

If contact already exists:

update/enrich it rather than creating a duplicate.

==================================================
10. COMPANY RESOLUTION
==================================================

If the original Find Prospects business contains:

companyName
domain
website

preserve that information.

Do not replace:

"ABC Restaurant Ltd"

with:

"ABCRESTAURANT"

unless no company name exists.

Prefer:

companyId
→ domain
→ website
→ normalized company name

according to the existing HUNTIQ resolver architecture.

==================================================
11. CONTACT EVIDENCE
==================================================

Verify that every imported contact can retain provenance.

Store, where available:

email
emailType
emailStatus
confidence
sourceUrl
sourceType
name
jobTitle
identitySource
phone
socials
contextSnippet
discoveryJobId
workspaceId
companyId
contactId.

Do not mark inferred identity as verified.

Distinguish:

FOUND
VALIDATED
UNVERIFIED
INVALID
BOUNCED

according to the existing schema.

==================================================
12. DISCOVERY JOB STATUS
==================================================

Verify all state transitions.

Valid states:

QUEUED
RUNNING
COMPLETED
PARTIAL
CANCELLED
FAILED

Expected successful flow:

QUEUED
→ RUNNING
→ COMPLETED

If contacts are partially processed:

RUNNING
→ PARTIAL

If scraper fails:

RUNNING
→ FAILED

If user cancels:

RUNNING
→ CANCELLED

Do not leave jobs permanently stuck in RUNNING.

==================================================
13. FIND PROSPECTS FRONTEND
==================================================

Inspect:

ContactDiscoveryModal.tsx

and:

BusinessNicheDiscovery.tsx

Verify that the frontend actually calls the CURRENT HUNTIQ backend endpoint.

Expected endpoint:

/api/v1/email-discovery/jobs

or the repository's current documented equivalent.

Do not leave old endpoints such as:

/api/scraper/...

wired into the UI if the new integration has replaced them.

The UI should show:

Discover Contacts
→ Starting
→ Crawling
→ Processing
→ Contacts Found
→ Completed

or:

Failed

with a useful human-readable error.

Do not expose stack traces.

==================================================
14. JOB STATUS POLLING
==================================================

Verify that the frontend can retrieve:

GET /api/v1/email-discovery/jobs/:id

and/or the current status endpoint.

Verify workspace isolation.

A user from Workspace A must not be able to retrieve Workspace B's discovery job.

==================================================
15. DATABASE MIGRATION
==================================================

Verify migration:

006_email_discovery_and_evidence.sql

actually runs successfully against the project's current database.

Verify:

- UUID generation
- foreign keys
- indexes
- CHECK constraints
- unique request ID constraint.

Do not create duplicate migrations for functionality already implemented.

==================================================
16. LEGACY SCRAPER ROUTES
==================================================

Inspect:

server/routes/scraper.ts

Determine whether old scraper endpoints are still used.

Do not delete them blindly.

If frontend code still uses them, migrate the frontend safely.

If they are obsolete, keep them as compatibility routes or mark them deprecated.

Do not break existing users.

==================================================
17. EMAIL SCRAPER API COMPATIBILITY
==================================================

Specifically verify this HUNTIQ provider:

server/providers/emailScraper/emailScraperProvider.ts

Check:

- URL construction
- authentication header
- request body
- timeout
- retry behavior
- JSON parsing
- HTTP status handling
- jobId extraction
- streamUrl extraction
- error mapping.

Make sure the provider matches the REAL Email Scraper implementation.

==================================================
18. ERROR MAPPING
==================================================

Ensure:

401/403
→ authentication failure

400
→ invalid request

404
→ endpoint/job not found

408
→ timeout

429
→ rate limited

502/503
→ scraper unavailable

500
→ unexpected integration error.

Do not convert every external failure into HTTP 500.

==================================================
19. SECURITY
==================================================

Audit for:

- SSRF
- secret leakage
- cross-workspace access
- unsafe URL handling
- unrestricted webhook access
- frontend exposure of API keys
- logging of credentials.

The existing SSRF validation must remain active.

Do not allow scraping of:

localhost
127.0.0.1
private IP ranges
internal metadata endpoints
unsafe protocols

unless the existing trusted configuration explicitly permits them.

==================================================
20. TEST THE COMPLETE FLOW
==================================================

Create a real integration test using a mock/stub Email Scraper server if necessary.

Test:

1. User authenticates.
2. User starts discovery.
3. HUNTIQ creates job.
4. HUNTIQ calls Email Scraper.
5. Email Scraper returns external job ID.
6. HUNTIQ stores external job ID.
7. Scraper completes.
8. Scraper posts webhook.
9. HUNTIQ authenticates webhook.
10. HUNTIQ validates payload.
11. HUNTIQ resolves company.
12. HUNTIQ creates contact.
13. HUNTIQ stores evidence.
14. HUNTIQ records integration event.
15. HUNTIQ updates job to COMPLETED.
16. Contact is visible to HUNTIQ.
17. Replaying webhook does not duplicate contact.

==================================================
21. RUN REAL VALIDATION
==================================================

After making fixes, run:

npm test

npm run build

npm run lint

npm run db:migrate

or the actual project equivalents.

Do not claim success unless the commands actually pass.

Fix all TypeScript errors.

Fix all runtime errors.

Fix all failing tests.

==================================================
22. DO NOT MAKE UNNECESSARY ARCHITECTURAL CHANGES
==================================================

The current HUNTIQ architecture already contains:

- EmailScraperProvider
- EmailDiscoveryService
- discovery jobs
- webhook integration
- evidence storage
- integration events
- frontend contact discovery.

Use them.

Do not create:

another scraper service
another contact ingestion engine
another job table
another workspace system
another authentication system.

==================================================
23. FINAL ACCEPTANCE CRITERIA
==================================================

The implementation is complete ONLY when this works:

User opens:

Hunt → Find Prospects

Finds:

ABC Restaurant

Clicks:

Discover Contacts

HUNTIQ sends:

https://abcrestaurant.com

to Email Scraper.

Email Scraper crawls it.

Email Scraper finds:

manager@abcrestaurant.com

and possibly:

john@abcrestaurant.com

Email Scraper sends the results back to HUNTIQ.

HUNTIQ:

- authenticates the scraper
- validates the payload
- resolves the correct workspace
- resolves ABC Restaurant
- creates or updates contacts
- stores contact evidence
- stores integration events
- updates the discovery job
- displays the contacts
- prevents duplicates.

No manual database editing should be required for the normal flow.

==================================================
24. FINAL REPORT
==================================================

After fixing everything, report:

1. Exact bugs found.
2. Exact files changed.
3. Exact fixes made.
4. Email Scraper API contract confirmed.
5. HUNTIQ API contract confirmed.
6. Authentication method confirmed.
7. Environment variables required.
8. Database migration status.
9. Tests passed.
10. Build status.
11. Lint status.
12. Whether end-to-end discovery works.
13. Any remaining manual deployment/configuration steps.

IMPORTANT:

Do not simply tell me that the integration "looks correct."

Actually trace the complete request/response path between both repositories and fix anything preventing the complete flow from working.