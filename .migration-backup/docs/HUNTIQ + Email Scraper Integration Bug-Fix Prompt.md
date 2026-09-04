You are working on the HUNTIQ repository:

https://github.com/Ayoola1o/HUNTIQ

HUNTIQ is being connected to this separate Email Scraper service:

https://github.com/Ayoola1o/email-scraper

Your task is to FIX and COMPLETE the HUNTIQ-side integration with the Email Scraper.

IMPORTANT:
Do NOT rewrite the application or replace working functionality.
Do NOT merge the two repositories.
Do NOT remove existing CRM, Hunt, Find Prospects, Contacts, Opportunities, Outreach, Pipeline, SEO, or AI functionality.

The intended architecture is:

HUNTIQ
→ discovers a business/prospect
→ sends the business website/domain to Email Scraper
→ Email Scraper crawls and extracts contacts/emails
→ Email Scraper sends structured lead data back to HUNTIQ
→ HUNTIQ matches/creates company and contact
→ HUNTIQ can score/enrich the lead
→ HUNTIQ can create an outreach draft
→ lead becomes available in Contacts/Opportunities/Pipeline.

==================================================
1. FIRST: INSPECT THE EXISTING HUNTIQ CODEBASE
==================================================

Before making changes, inspect the repository structure and identify the existing implementations for:

- server/app.ts
- server/middleware/auth.ts
- server/routes/leadIngest.ts
- server/routes/scraper.ts
- server/services/leadIngestionService.ts
- server/services/companyService.ts
- server/services/contactService.ts
- server/services/enrichmentService.ts
- server/services/opportunityScoringService.ts
- server/services/outreachService.ts
- server/services/researchService.ts
- server/services/seoAuditService.ts
- Find Prospects/Hunt frontend components
- existing API client utilities
- existing database schema/models
- existing integration/API-key infrastructure
- existing environment configuration
- existing tests

Also inspect the Email Scraper repository to understand its CURRENT API contract.

Do not assume the repositories still match old documentation.
Use the actual current source code as the source of truth.

==================================================
2. PRESERVE THE EXISTING LEAD INGESTION SYSTEM
==================================================

HUNTIQ already has a lead ingestion concept.

Use the existing:

POST /api/v1/integrations/lead-ingest

and the existing LeadIngestionService where possible.

Do NOT create a second competing lead-ingestion system.

The Email Scraper should ultimately provide data compatible with HUNTIQ's existing external lead payload.

Expected conceptual fields include:

- email
- name
- firstName
- lastName
- jobTitle
- phone
- companyName
- domain
- website
- sourceUrl
- mxStatus
- socials
- notes

Adapt the exact fields to the CURRENT Email Scraper payload rather than blindly assuming these fields exist.

==================================================
3. FIX AUTHENTICATION BETWEEN THE SERVICES
==================================================

Implement secure machine-to-machine authentication between:

HUNTIQ
and
Email Scraper.

Prefer a dedicated HUNTIQ API key for the Email Scraper integration.

The Email Scraper must NOT use a normal browser/user JWT as its permanent service credential.

Use:

X-HUNTIQ-API-KEY: <secret>

or the authentication mechanism already supported by HUNTIQ if the current implementation has a better established convention.

Verify that:

API KEY
→ resolves to an authenticated HUNTIQ integration identity/user
→ resolves to the correct workspace
→ cannot access another workspace.

Do NOT trust a workspace ID supplied by the Email Scraper as an authorization mechanism.

The API key must determine the authorized workspace.

Never expose the API key to frontend/browser code.

==================================================
4. ADD/REPAIR THE HUNTIQ → EMAIL SCRAPER CLIENT
==================================================

Create or repair a dedicated HUNTIQ service such as:

server/services/emailDiscoveryService.ts

This service should be responsible for communicating with Email Scraper.

It should NOT contain CRM logic.

Its responsibilities are:

1. Validate website URL.
2. Normalize URL/domain.
3. Send crawl/discovery request to Email Scraper.
4. Authenticate securely.
5. Handle timeout.
6. Handle connection failures.
7. Handle HTTP errors.
8. Handle malformed responses.
9. Handle retryable failures.
10. Return a normalized result to HUNTIQ.
11. Never expose secrets in logs.

Use environment variables such as:

EMAIL_SCRAPER_URL=
EMAIL_SCRAPER_API_KEY=
EMAIL_SCRAPER_TIMEOUT_MS=
EMAIL_SCRAPER_MAX_RETRIES=

If the Email Scraper repository already defines a different environment-variable convention, inspect it and maintain consistency.

==================================================
5. DO NOT BLOCK THE HUNT UI DURING LONG CRAWLS
==================================================

Email crawling can take time.

Do NOT make the Find Prospects page wait indefinitely for a crawl to finish.

If the Email Scraper supports asynchronous jobs, use its job-based workflow.

Preferred flow:

HUNTIQ
→ POST scrape request
→ Email Scraper returns jobId
→ HUNTIQ records integration job
→ frontend receives job status
→ Email Scraper completes crawl
→ contacts/results are retrieved
→ HUNTIQ ingests contacts.

If the Email Scraper supports streaming/SSE for crawl progress, use it appropriately for the frontend progress experience.

Do not create a custom long-running request if the existing Email Scraper job architecture already handles this.

==================================================
6. ADD HUNTIQ API ROUTES FOR EMAIL DISCOVERY
==================================================

Create a clean HUNTIQ API layer.

For example:

POST /api/v1/integrations/email-scraper/discover

Request:

{
  "website": "https://example.com",
  "companyName": "Example Company",
  "domain": "example.com"
}

The exact request schema should match the existing HUNTIQ architecture.

The endpoint must:

- require authenticated HUNTIQ user/API access
- validate the URL
- resolve the user's workspace
- call Email Scraper
- return a safe normalized response
- never return API secrets

If asynchronous jobs are used, also implement appropriate status handling, for example:

GET /api/v1/integrations/email-scraper/jobs/:jobId

Use the repository's existing routing conventions if different.

==================================================
7. CONNECT THIS TO FIND PROSPECTS
==================================================

Find the existing HUNTIQ:

Hunt
→ Find Prospects

workflow.

Do NOT redesign the entire page.

Add the Email Scraper functionality to the existing prospect workflow.

For a discovered business that has a website, provide an action such as:

"Find Contacts"

or

"Discover Contacts"

When the user activates it:

Business
→ Website
→ Email Scraper
→ Contact discovery
→ HUNTIQ ingestion.

The frontend should show states such as:

Idle
Discovering
Crawling
Processing
Contacts Found
Completed
Failed

Show useful progress/error messages.

Do not expose internal stack traces or API credentials to the user.

==================================================
8. PRESERVE BUSINESS INFORMATION DURING INGESTION
==================================================

This is very important.

If Find Prospects discovers:

{
  "companyName": "ABC Restaurant",
  "domain": "abcrestaurant.com",
  "website": "https://abcrestaurant.com",
  "address": "...",
  "city": "...",
  "country": "...",
  "source": "GEO_RADAR"
}

and Email Scraper discovers:

{
  "email": "manager@abcrestaurant.com",
  "name": "John Smith",
  "jobTitle": "General Manager"
}

the final HUNTIQ contact must retain the relationship between:

ABC Restaurant
+
abcrestaurant.com
+
John Smith
+
manager@abcrestaurant.com

Do not replace a known company name with:

ABCRESTAURANT

unless there is no better company information available.

Preserve source metadata where the current database supports it.

==================================================
9. NORMALIZE EMAIL SCRAPER RESULTS
==================================================

Create a normalization layer between Email Scraper and LeadIngestionService.

For example:

Email Scraper response
→ normalizeEmailScraperLead()
→ ExternalLeadPayload
→ LeadIngestionService

Normalize:

- email casing
- whitespace
- URL format
- domain
- names
- company name
- job title
- phone
- source URL
- social links
- validation status

Reject obviously invalid email addresses.

Do not silently discard useful records without recording why they were rejected.

==================================================
10. DUPLICATE PROTECTION
==================================================

Use the existing HUNTIQ duplicate detection.

The same contact should NOT be created multiple times when:

- the same website is crawled twice
- the same Email Scraper job is retried
- the same email is returned by multiple pages
- the user clicks "Find Contacts" more than once.

Use normalized email as the strongest contact identity where appropriate.

Also prevent duplicate companies based on the existing HUNTIQ company/domain logic.

Retries must be idempotent.

==================================================
11. HANDLE PARTIAL RESULTS
==================================================

Do not fail the entire operation because one email/contact is invalid.

Example:

100 contacts discovered
→ 92 valid
→ 5 duplicates
→ 2 invalid
→ 1 failed to associate

The result should report meaningful counts.

Example:

{
  "discovered": 100,
  "imported": 92,
  "duplicates": 5,
  "rejected": 2,
  "failed": 1
}

Adapt this to the existing API response conventions.

==================================================
12. OUTREACH MUST REMAIN OPTIONAL
==================================================

Do not automatically send emails.

If the existing LeadIngestionService supports:

createOutreachDraft

preserve that behavior, but make sure:

- importing a contact does not send an email
- outreach drafts are clearly drafts
- the user can review before sending
- existing outreach rules remain intact.

==================================================
13. DIGITAL GAP / GEO RADAR CONTEXT
==================================================

HUNTIQ is being developed around Live Geo Radar.

A discovered business can contain:

- business name
- category
- address
- coordinates
- website
- phone
- source
- digital gap indicators
- SEO information
- competitor information.

Do not lose these fields when initiating Email Scraper discovery.

The scraper's responsibility is primarily contact/email acquisition.

HUNTIQ remains responsible for:

- digital-gap analysis
- SEO analysis
- company intelligence
- competitor analysis
- opportunity scoring
- CRM
- outreach
- pipeline.

==================================================
14. ERROR HANDLING
==================================================

Implement proper error handling for:

- Email Scraper unavailable
- DNS failure
- timeout
- 400 response
- 401/403 authentication failure
- 404
- 429 rate limit
- 500/502/503
- malformed JSON
- missing job ID
- invalid URL
- no website
- crawl failed
- zero contacts found.

Use appropriate HTTP status codes.

Do not turn every downstream failure into HTTP 500.

For example:

401/403 → integration authentication/configuration problem
429 → rate limit
400 → invalid discovery request
502/503 → downstream scraper unavailable
500 → genuine HUNTIQ server failure.

==================================================
15. LOGGING
==================================================

Add structured logging around the integration.

Log:

- request ID
- HUNTIQ user/workspace ID where safe
- integration job ID
- Email Scraper job ID
- website/domain
- duration
- status
- number of contacts
- error category.

NEVER log:

- API keys
- passwords
- authorization headers
- full sensitive contact information unnecessarily.

==================================================
16. IDEMPOTENCY
==================================================

This integration must be safe to retry.

Create or reuse an idempotency strategy based on:

- integration job ID
- source job ID
- email
- workspace
- source.

A retry of the same Email Scraper result should not create duplicate CRM contacts or duplicate outreach drafts.

==================================================
17. TESTS
==================================================

Add/repair tests for:

1. valid Email Scraper request
2. invalid website
3. missing website
4. successful scraper response
5. scraper timeout
6. scraper unavailable
7. 401 response
8. 403 response
9. 429 response
10. malformed scraper response
11. empty contact response
12. duplicate contact
13. duplicate company
14. retry behavior
15. idempotent ingestion
16. workspace isolation
17. API-key authentication
18. successful end-to-end ingestion
19. Find Prospects → Email Scraper flow
20. no outreach email automatically sent.

Use the existing testing framework and conventions in the repository.

==================================================
18. DATABASE
==================================================

Before creating new database tables/models, inspect the existing schema.

Reuse existing:

- companies
- contacts
- opportunities
- activities
- integrations
- jobs
- outreach
- source/evidence fields

where possible.

Only create a new table if the existing schema genuinely cannot represent:

Email Scraper integration jobs/status/history.

If a migration is required, create it properly and update the schema/types.

==================================================
19. ENVIRONMENT CONFIGURATION
==================================================

Update the HUNTIQ environment configuration/documentation with the required variables.

For example:

EMAIL_SCRAPER_URL=
EMAIL_SCRAPER_API_KEY=
EMAIL_SCRAPER_TIMEOUT_MS=30000
EMAIL_SCRAPER_MAX_RETRIES=3

Do NOT hardcode:

- localhost URLs
- production URLs
- API keys
- secrets.

Support development and production environments.

==================================================
20. IMPORTANT: DO NOT DUPLICATE SCRAPING LOGIC
==================================================

HUNTIQ should NOT implement another email crawler.

Do not add:

- Puppeteer crawling
- Playwright crawling
- HTML email extraction
- regex-based website crawling

to HUNTIQ if Email Scraper already handles those responsibilities.

HUNTIQ should be the orchestrator.

==================================================
21. CLEAN UP LEGACY SCRAPER CODE CAREFULLY
==================================================

Inspect:

server/routes/scraper.ts

Determine whether it duplicates functionality now provided by Email Scraper.

Do NOT delete it immediately.

Determine:

- what is still used
- what frontend depends on it
- whether it can become a compatibility layer
- whether it can be redirected to Email Scraper
- whether it should be deprecated.

Only remove legacy functionality after verifying that no existing HUNTIQ feature depends on it.

==================================================
22. API CONTRACT DOCUMENTATION
==================================================

Document the final integration contract.

Include:

HUNTIQ endpoint
authentication
request format
response format
error format
job lifecycle
idempotency behavior
environment variables.

Also document:

Email Scraper
→ HUNTIQ
data mapping.

==================================================
23. RUN THE PROJECT AFTER CHANGES
==================================================

After implementation:

1. install dependencies if required
2. run type checking
3. run linting
4. run unit tests
5. run integration tests
6. build backend
7. build frontend
8. verify database migrations
9. verify existing tests still pass.

Do not stop after writing code.

Actually diagnose and fix compile/runtime/test errors.

==================================================
24. FINAL END-TO-END TEST
==================================================

Perform a realistic integration test:

Example:

Business:

ABC Restaurant

Website:

https://example.com

Flow:

Find Prospects
→ select ABC Restaurant
→ Discover Contacts
→ HUNTIQ calls Email Scraper
→ Email Scraper crawls website
→ contacts returned
→ HUNTIQ normalizes them
→ duplicate check
→ company matching
→ contacts created
→ optional outreach drafts created
→ contacts appear in HUNTIQ Contacts.

Verify that the user's workspace is correct.

Verify that repeating the operation does NOT create duplicate contacts.

==================================================
25. CODING PRINCIPLES
==================================================

Follow the existing HUNTIQ architecture and coding style.

Prefer small, focused changes.

Do not rewrite unrelated components.

Do not change public APIs unnecessarily.

Do not break existing frontend functionality.

Do not introduce unnecessary dependencies.

Use TypeScript types instead of any where practical.

Validate external data at the API boundary.

Treat Email Scraper as an untrusted external service.

Keep secrets server-side.

Keep workspace isolation enforced server-side.

Make the integration observable and retry-safe.

==================================================
26. DELIVERABLE
==================================================

When finished, provide a concise implementation report containing:

A. Files created
B. Files modified
C. Files deprecated
D. Database changes
E. New environment variables
F. New API endpoints
G. Email Scraper API contract used
H. Authentication mechanism
I. Data mapping
J. Error handling
K. Idempotency strategy
L. Tests added
M. Test results
N. Any remaining problems
O. Exact steps required to connect the deployed HUNTIQ instance to the deployed Email Scraper instance.

MOST IMPORTANT:

Do not assume the integration is complete simply because the code compiles.

Trace the complete flow:

Find Prospects
→ Business
→ Website
→ Email Scraper
→ Crawl Job
→ Extracted Contacts
→ HUNTIQ API
→ Lead Ingestion
→ Company
→ Contact
→ Optional Outreach Draft
→ Contacts/Opportunities/Pipeline.

Fix every bug you encounter in this flow while preserving existing HUNTIQ functionality.