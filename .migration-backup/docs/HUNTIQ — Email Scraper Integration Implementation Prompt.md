You are working on the GitHub repository:

https://github.com/Ayoola1o/HUNTIQ

The email-scraper application is a separate service:

https://github.com/Ayoola1o/email-scraper

I want HUNTIQ to integrate with email-scraper as its dedicated **contact/email discovery service**.

IMPORTANT:
Do not redesign the HUNTIQ UI.
Do not rebuild unrelated modules.
Do not weaken authentication.
Do not introduce another persistence system.
Do not use memoryStore as the production source of truth.

HUNTIQ remains the owner of:

- Companies
- Contacts
- Leads
- Signals
- Evidence
- Opportunity scoring
- CRM
- Outreach
- Workspace isolation
- User permissions

EMAIL-SCRAPER remains responsible for:

- Website crawling
- Email discovery
- Contact evidence extraction
- Email provenance
- Discovery confidence

==================================================
1. TARGET FLOW
==================================================

HUNTIQ:

Company discovered
        ↓
Website/domain known
        ↓
Request email discovery
        ↓
Email Scraper
        ↓
Scrape job
        ↓
emails + evidence
        ↓
HUNTIQ ingestion
        ↓
Company resolution
        ↓
Contact creation/update
        ↓
Signal/evidence association
        ↓
Opportunity scoring
        ↓
Lead qualification
        ↓
Optional outreach

Do not allow email-scraper to directly create HUNTIQ opportunities or outreach campaigns.

==================================================
2. CREATE EMAIL SCRAPER PROVIDER
==================================================

Create:

server/providers/emailScraper/

or the equivalent provider boundary used by the current HUNTIQ architecture.

Suggested files:

emailScraperProvider.ts
emailScraperTypes.ts
emailScraperConfig.ts

HUNTIQ should communicate with the scraper through this provider.

Do not put raw fetch calls throughout routes.

Use:

Route
 ↓
Service
 ↓
EmailScraperProvider
 ↓
Email Scraper API

==================================================
3. ENVIRONMENT CONFIGURATION
==================================================

Add configuration such as:

EMAIL_SCRAPER_API_URL=
EMAIL_SCRAPER_API_KEY=
EMAIL_SCRAPER_TIMEOUT_MS=

Do not hardcode:

URLs
API keys
workspace IDs
credentials

Production startup should fail if required integration credentials are missing where the integration is enabled.

==================================================
4. CREATE SCRAPE JOB SERVICE
==================================================

Create a service such as:

emailDiscoveryService.ts

It should support:

createScrapeJob()
getScrapeJobStatus()
cancelScrapeJob()
processScrapeResult()

The service should accept a HUNTIQ company/domain.

Example:

{
  "companyId": "cmp_123",
  "domain": "example.com",
  "website": "https://example.com"
}

The company ID belongs to HUNTIQ.

==================================================
5. DO NOT TRUST CLIENT WORKSPACE IDS
==================================================

This is critical.

Do NOT accept:

X-Workspace-ID

as the source of truth.

Do NOT use:

req.headers['x-workspace-id']

to determine the workspace.

Do NOT use:

req.user?.workspaceId || 'ws-main'

Do NOT use:

'ws-default-001'

Do NOT use:

'user-default-001'

Workspace must come from authenticated server-side context and membership.

Every company/contact/lead operation must be scoped to the authenticated workspace.

==================================================
6. DATABASE SOURCE OF TRUTH
==================================================

Do not store integration state only in:

Map()
memoryStore
static variables

Use PostgreSQL repositories.

Create appropriate persistence for:

email discovery jobs
email discovery results
contact evidence
integration events

Possible fields:

id
workspace_id
company_id
provider
external_job_id
status
requested_at
started_at
completed_at
emails_found
error
created_by
updated_at

Use PostgreSQL as the production source of truth.

==================================================
7. JOB LIFECYCLE
==================================================

Implement:

QUEUED
RUNNING
COMPLETED
PARTIAL
CANCELLED
FAILED

When HUNTIQ creates a scrape request:

QUEUED

When scraper confirms execution:

RUNNING

When results arrive:

COMPLETED

If some pages fail but contacts were discovered:

PARTIAL

Do not leave jobs permanently in QUEUED.

Persist all lifecycle transitions.

==================================================
8. INGESTION ENDPOINT
==================================================

Create a dedicated endpoint:

POST /api/v1/integrations/email-scraper/webhook

or the equivalent route structure used by HUNTIQ.

It must authenticate the email-scraper integration.

Do not trust workspace ID supplied in the payload.

Determine the workspace from the integration credential.

Validate:

integration
version
requestId
source
company
contacts

Reject malformed payloads.

==================================================
9. COMPANY RESOLUTION
==================================================

When scraper sends:

domain
website
company name

do NOT automatically create a company unless the existing resolution rules establish sufficient confidence.

Use the existing CompanyResolver.

Fix the older resolver path that automatically creates companies when no confident match exists.

Do not fabricate:

companyName
website
domain

If unresolved:

store the discovery result as unresolved evidence.

Example:

{
  "resolutionStatus": "UNRESOLVED",
  "domain": "example.com"
}

Do not silently create a fake company.

==================================================
10. CONTACT INGESTION
==================================================

For every email:

Normalize:

lowercase
trim
canonical email

Deduplicate by appropriate workspace/company/email identity.

If existing contact:

UPDATE missing verified information only.

Do not overwrite high-confidence verified information with weaker inferred information.

If new:

create contact only after validation.

==================================================
11. CONTACT PROVENANCE
==================================================

Persist:

email
emailType
emailStatus
confidence
sourceUrl
sourceType
name
jobTitle
phone
socials
discoveredAt

Most importantly:

preserve provenance.

Example:

email:

john@example.com

source:

https://example.com/team

confidence:

0.97

This evidence should remain available in HUNTIQ.

==================================================
12. INFERRED VS VERIFIED DATA
==================================================

Do not treat:

john.smith@example.com

as proof that:

firstName = John
lastName = Smith

If the scraper sends inferred identity, store it as inferred.

Example:

identitySource = EMAIL_LOCAL_PART

If the website explicitly identifies:

John Smith
CEO

then:

identitySource = WEBSITE

and confidence should be higher.

Do not promote inferred data to verified CRM fields without an explicit rule.

==================================================
13. EMAIL QUALITY
==================================================

Distinguish:

FOUND
VALIDATED
UNVERIFIED
INVALID
BOUNCED

Do not claim:

DELIVERABLE

just because the scraper found the email.

MX presence alone should not be treated as guaranteed mailbox deliverability.

==================================================
14. LEAD CREATION
==================================================

Email discovery does NOT automatically equal a qualified lead.

Do not do:

email found
→ lead
→ score 90

Instead:

Email discovered
 ↓
Contact
 ↓
Company
 ↓
ICP fit
 ↓
Buying signals
 ↓
Evidence
 ↓
Opportunity score
 ↓
Lead qualification

This must connect to the existing HUNTIQ intelligence engine.

==================================================
15. FIX OPPORTUNITY SCORING
==================================================

The current discovered-place scoring is too generous and can score ordinary businesses highly simply because they have:

address
reviews
phone
website gaps

Do not use email discovery as an artificial high score.

Opportunity scoring should consider:

ICP fit
actual buying signals
signal recency
evidence quality
contact quality
contact reachability
company attributes
digital gap where relevant

Missing information must NOT automatically increase score.

Do not use synthetic:

18000
30000
45000

deal values unless explicitly configured from a legitimate business model.

Do not use:

employeeCount || 100

as a fake employee count.

Do not assign:

icpFitScore = signalScore

unless the metric actually represents ICP fit.

==================================================
16. DEDUPLICATION
==================================================

Integration must be idempotent.

Use:

requestId
external job ID
source
email
company

to prevent duplicate ingestion.

Repeated webhook delivery must NOT create:

duplicate companies
duplicate contacts
duplicate leads
duplicate evidence
duplicate signals

Implement database constraints where appropriate.

Use PostgreSQL UPSERT patterns.

==================================================
17. SECURITY
==================================================

The integration must:

authenticate the scraper
validate payloads
rate limit webhook requests
limit payload size
reject unknown integration versions
reject invalid signatures/tokens
log suspicious requests

Never log:

API keys
tokens
full authorization headers

Avoid logging sensitive contact information unnecessarily.

==================================================
18. OUTREACH
==================================================

Do NOT automatically send email because an address was discovered.

Do NOT automatically create an outreach draft saying:

"I noticed your recent developments..."

unless HUNTIQ has actual stored evidence supporting that statement.

Any AI-generated outreach must be grounded in:

stored company evidence
stored signal
stored source
stored date

If there is no evidence, the AI must not claim one exists.

==================================================
19. UI INTEGRATION
==================================================

Do not redesign the UI.

Only connect the existing UI to the new service where appropriate.

Company page should eventually be able to show:

Email Discovery
───────────────
Status: Completed
Emails Found: 7
Personal: 4
Role-based: 3
Last Scraped: ...
Source: Website

Contacts should show provenance where useful.

Discovery jobs should show:

Queued
Running
Completed
Partial
Failed

Do not expose raw integration credentials.

==================================================
20. OBSERVABILITY
==================================================

Add structured events:

EMAIL_DISCOVERY_REQUESTED
EMAIL_DISCOVERY_STARTED
EMAIL_DISCOVERY_COMPLETED
EMAIL_DISCOVERY_PARTIAL
EMAIL_DISCOVERY_FAILED

CONTACT_DISCOVERED
CONTACT_UPDATED
CONTACT_DUPLICATE
CONTACT_SKIPPED

COMPANY_RESOLVED
COMPANY_UNRESOLVED

Also record:

workspaceId
companyId
jobId
provider
duration
result counts

Never log credentials.

==================================================
21. VERCEL / SERVERLESS COMPATIBILITY
==================================================

Do not depend on:

setInterval
setTimeout background jobs
static Map()
in-memory job queues

for production job processing.

The API request should create durable state.

Long-running scraper work should be handled by the scraper service itself or a proper external worker/job mechanism.

HUNTIQ should poll or receive a webhook.

Do not assume an Express process remains alive after returning a response.

==================================================
22. FAILURE HANDLING
==================================================

Handle:

scraper unavailable
timeout
401
403
429
500
malformed response
partial results
duplicate webhook
unknown company
unknown domain

Use explicit errors.

Example:

EMAIL_SCRAPER_NOT_CONFIGURED
EMAIL_SCRAPER_UNAVAILABLE
EMAIL_SCRAPER_TIMEOUT
EMAIL_SCRAPER_AUTH_FAILED
EMAIL_SCRAPER_INVALID_RESPONSE
EMAIL_DISCOVERY_FAILED

==================================================
23. TESTS
==================================================

Add integration tests for:

1. Authenticated scrape request
2. Unauthenticated request
3. Wrong workspace
4. Scraper authentication
5. Scraper timeout
6. Scraper unavailable
7. Successful webhook
8. Duplicate webhook
9. Duplicate email
10. New contact
11. Existing contact update
12. Verified data protection
13. Inferred data handling
14. Company resolution
15. unresolved company
16. Evidence persistence
17. Job lifecycle
18. Workspace isolation
19. Opportunity scoring
20. No automatic outreach
21. malformed webhook
22. invalid authentication
23. PostgreSQL persistence

Most importantly, add tests proving:

Workspace A cannot see or modify Workspace B's companies, contacts, leads, jobs, or discovery results.

==================================================
24. PRODUCTION DATA FLOW
==================================================

The final implementation must follow:

HUNTIQ
 ↓
Company
 ↓
EmailDiscoveryService
 ↓
EmailScraperProvider
 ↓
EMAIL-SCRAPER
 ↓
Website Crawl
 ↓
Email Evidence
 ↓
HUNTIQ Webhook
 ↓
Validate
 ↓
Deduplicate
 ↓
Resolve Company
 ↓
Persist Contact
 ↓
Persist Evidence
 ↓
Signals
 ↓
Opportunity Score
 ↓
Lead Qualification
 ↓
Optional Outreach

==================================================
25. DO NOT CREATE A SECOND CRM
==================================================

Email-scraper must remain a specialized service.

Do not add:
- companies database
- CRM pipeline
- opportunity scoring
- campaigns
- outreach management
- HUNTIQ-specific business intelligence

to email-scraper.

HUNTIQ owns those responsibilities.

==================================================
26. QUALITY GATE
==================================================

After implementation run:

npm run build
npm test
npm run lint

Fix every failure.

Inspect all changed files.

Verify no remaining:

ws-main
ws-default-001
user-default-001
usr-1

or equivalent production fallback identities exist in the affected integration paths.

Verify no client-controlled workspace header is trusted.

Verify PostgreSQL is used for production persistence.

Verify duplicate ingestion is prevented.

Verify credentials are never exposed.

==================================================
FINAL ACCEPTANCE CRITERIA
==================================================

HUNTIQ integration is complete only when:

1. HUNTIQ can request email discovery for a company.
2. Email-scraper can execute the request.
3. Email-scraper can return structured contact discovery data.
4. HUNTIQ can receive the result securely.
5. Workspace is determined server-side.
6. Company resolution is evidence-based.
7. Contacts are deduplicated.
8. Provenance is preserved.
9. Verified and inferred data are separated.
10. Discovery does not automatically create qualified opportunities.
11. Discovery does not automatically send outreach.
12. Opportunity scoring uses real evidence.
13. Jobs persist in PostgreSQL.
14. Webhook processing is idempotent.
15. Integration failures are recoverable.
16. Workspace isolation is tested.
17. No production memoryStore dependency remains in this integration.
18. npm build passes.
19. npm test passes.
20. npm lint passes.

Do not redesign the HUNTIQ UI during this implementation.

Do not modify unrelated HUNTIQ functionality unless required to satisfy the integration architecture.