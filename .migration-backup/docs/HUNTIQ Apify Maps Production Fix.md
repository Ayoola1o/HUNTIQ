## HUNTIQ — Fix Apify Maps Discovery & Connect It Correctly to the Prospect Intelligence Pipeline

You are working on the HUNTIQ repository.

The current code already contains an `ApifyMapsProvider`, `/prospects/discover-maps`, geo prospecting, digital auditing, pipeline capture, PostgreSQL repositories, authentication, and workspace isolation.

**Do not rewrite the architecture. Do not redesign the UI. Do not replace working components unnecessarily.**

Your task is to make the current Maps/Apify implementation production-safe and prepare it for the real HUNTIQ intelligence engine.

---

# PHASE 1 — AUDIT THE CURRENT IMPLEMENTATION

Before changing anything, inspect:

- `server/providers/maps/`
- `server/providers/maps/apifyMapsProvider.ts`
- `server/providers/maps/index.ts`
- `server/routes/prospects.ts`
- `server/engine/geo/`
- `server/engine/audit/`
- `src/engine/prospectorEngine`
- prospect/company repositories
- pipeline repositories
- authentication middleware
- workspace isolation logic
- environment configuration
- existing tests

Trace the complete flow:

```text
Frontend
  ↓
/prospects/discover-maps
  ↓
createMapsProvider()
  ↓
ApifyMapsProvider
  ↓
Apify Actor
  ↓
Normalization
  ↓
Digital Audit
  ↓
Opportunity Score
  ↓
Capture
  ↓
Pipeline
```

Document any current duplication, fallback behavior, fake data, missing persistence, missing workspace scoping, or broken connections before implementing changes.

---

# PHASE 2 — REMOVE DANGEROUS MOCK FALLBACKS

The current provider falls back to `MockApifyMapsProvider` when:

- `APIFY_API_TOKEN` is missing
- Apify returns an error
- the network request fails

This is NOT acceptable in production.

Never return fake businesses while reporting a successful Maps discovery request.

Implement explicit environment-controlled mock behavior:

```text
HUNTIQ_ENV=development
HUNTIQ_MAPS_MOCK=true
```

may allow mock data during development/testing.

Production:

```text
HUNTIQ_ENV=production
HUNTIQ_MAPS_MOCK=false
```

must NEVER return mock businesses.

If production has no Apify token:

```json
{
  "success": false,
  "error": {
    "code": "MAP_PROVIDER_NOT_CONFIGURED",
    "message": "Maps discovery provider is not configured."
  }
}
```

If Apify fails:

```json
{
  "success": false,
  "error": {
    "code": "MAP_PROVIDER_UNAVAILABLE",
    "message": "Maps discovery provider is temporarily unavailable."
  }
}
```

Do not expose:

- APIFY token
- internal API URLs
- stack traces
- credentials
- provider secrets

to the frontend.

Log the detailed internal error server-side.

---

# PHASE 3 — NEVER FABRICATE BUSINESS DATA

The provider currently has fallback values such as:

```text
Lagos, Nigeria
Lagos
Lagos State
6.4541
3.4246
```

These must NOT be used when the source does not provide the data.

Change the normalized model to allow unknown values:

```ts
address: string | null
city: string | null
state: string | null
country: string | null

location: {
  latitude: number | null
  longitude: number | null
}
```

Only populate these fields from verified source data.

The same rule applies to:

```text
website
phone
email
domain
contact name
contact role
```

Never generate:

```text
company.com
contact@company.com
Business Owner
Managing Director
```

unless that information actually exists in the source or a verified enrichment provider.

Unknown means:

```text
null
```

not an invented value.

---

# PHASE 4 — NORMALIZE APIFY DATA ROBUSTLY

Create a strict normalization layer.

The provider should convert the raw Apify response into a stable HUNTIQ schema.

Example:

```ts
interface DiscoveredPlaceBusiness {
  id: string;
  source: 'APIFY_GOOGLE_MAPS';

  placeId: string;

  name: string;

  category: string | null;
  categories: string[];

  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;

  latitude: number | null;
  longitude: number | null;

  phone: string | null;
  website: string | null;

  googleMapsUrl: string | null;

  rating: number | null;
  reviewCount: number | null;

  openingHours: Record<string, string> | null;

  reviews: Array<{
    author: string;
    text: string;
    rating: number;
    publishedAt: string | null;
  }>;

  businessStatus: string | null;

  dataQuality: {
    website: 'found' | 'missing';
    phone: 'found' | 'missing';
    email: 'not_available';
    location: 'complete' | 'partial' | 'missing';
  };

  sourceMetadata: {
    provider: 'APIFY_GOOGLE_MAPS';
    scrapedAt: string;
    placeId: string;
  };
}
```

Do not let provider-specific Apify field names leak throughout the rest of the application.

---

# PHASE 5 — FIX SEARCH FILTERS

Make sure these request parameters actually affect the provider:

```text
query
location
radiusKm
maxResults
category
minRating
minReviews
hasWebsite
hasPhone
```

Do not expose filters that are silently ignored.

If an Apify Actor does not support a particular filter directly:

1. retrieve the appropriate dataset
2. normalize the results
3. apply the filter inside HUNTIQ

For example:

```ts
if (options.minRating) {
  businesses = businesses.filter(
    b => b.rating !== null && b.rating >= options.minRating!
  );
}
```

Likewise:

```text
minReviews
hasWebsite
hasPhone
category
```

Apply these filters after normalization when necessary.

---

# PHASE 6 — FIX RADIUS BEHAVIOR

`radiusKm` must have real meaning.

Do not simply accept:

```text
radiusKm: 10
```

while performing an unrestricted search.

Use the best supported geographic mechanism available from the selected Apify Actor.

If necessary:

```text
search center
+
radius
```

should be converted into the Actor's supported location/radius format.

If the Actor cannot reliably enforce radius:

1. obtain coordinates
2. calculate distance inside HUNTIQ
3. remove businesses outside the requested radius.

Use the Haversine formula for geographic distance.

Never silently claim that a result is within the requested radius when it has not been verified.

---

# PHASE 7 — ADD RESULT DEDUPLICATION

The same business may appear in multiple searches.

Use a deterministic identity hierarchy:

```text
placeId
    ↓
normalized Google Maps URL
    ↓
normalized website domain
    ↓
normalized name + address
```

Prefer:

```text
source = APIFY_GOOGLE_MAPS
sourceExternalId = placeId
```

Create a reusable deduplication utility.

Do not create duplicate companies every time a user runs:

```text
"restaurants in Lagos"
```

or:

```text
"restaurants near Lekki"
```

---

# PHASE 8 — DO NOT IMMEDIATELY TURN EVERY MAP RESULT INTO A DEAL

This is important.

Discovery ≠ qualified lead.

Use this pipeline:

```text
MAP DISCOVERY
     ↓
DISCOVERED COMPANY
     ↓
COMPANY RESOLUTION
     ↓
ENRICHMENT
     ↓
INTELLIGENCE
     ↓
SIGNALS
     ↓
OPPORTUNITY SCORE
     ↓
QUALIFIED LEAD
     ↓
PIPELINE
```

A raw Google Maps business should initially be:

```text
DISCOVERED
```

not automatically:

```text
DEAL
```

Only promote it to a lead/pipeline record when HUNTIQ has enough evidence.

---

# PHASE 9 — CONNECT MAP DISCOVERY TO COMPANY RESOLUTION

After normalization, send each discovered business through the existing company-resolution system.

Use evidence such as:

```text
placeId
business name
website
domain
phone
address
location
Google Maps URL
```

Resolve the business against the canonical HUNTIQ company record.

If a company cannot be confidently resolved:

```text
resolutionStatus = UNRESOLVED
```

Do not guess.

---

# PHASE 10 — CONNECT TO DIGITAL INTELLIGENCE

For businesses with a verified website:

```text
Maps
 ↓
Website
 ↓
Digital Audit
 ↓
Technology
 ↓
SEO
 ↓
Performance
 ↓
Digital Gaps
```

For businesses without websites:

```text
website = null
```

Do not fabricate one.

The lack of a website can itself become an intelligence signal:

```text
DIGITAL_PRESENCE_GAP
```

but it must be represented as an evidence-backed observation.

---

# PHASE 11 — CONNECT TO SIGNAL ENGINE

Maps discovery should become one input into HUNTIQ's intelligence engine.

Example:

```text
Google Maps
   ↓
Company discovered
   ↓
Website audit
   ↓
Hiring data
   ↓
Company/news signals
   ↓
Technology signals
   ↓
Growth signals
   ↓
Digital gap
   ↓
Opportunity score
```

Do not create a high opportunity score simply because a company was discovered on Google Maps.

Every meaningful score should have explainable factors.

Example:

```json
{
  "score": 84,
  "factors": [
    {
      "type": "digital_gap",
      "value": 25,
      "evidence": "No company website discovered"
    },
    {
      "type": "hiring_growth",
      "value": 18,
      "evidence": "Hiring activity increased 40% over previous period"
    },
    {
      "type": "company_presence",
      "value": 12,
      "evidence": "Verified local business presence"
    }
  ]
}
```

No unexplained magic scores.

---

# PHASE 12 — WORKSPACE ISOLATION

Every discovered business, company, audit, signal, lead and pipeline record created through a user's search MUST belong to:

```text
workspace_id
user_id
```

Never accept arbitrary workspace IDs from the frontend.

Always derive them from authenticated context:

```ts
req.user.workspaceId
req.user.id
```

Verify that:

```text
User A
```

cannot retrieve:

```text
User B's discovered companies
User B's audits
User B's leads
User B's pipeline records
```

Audit all relevant repository queries for workspace constraints.

---

# PHASE 13 — ADD DISCOVERY JOB TRACKING

Do not make large Apify searches behave like an uncontrolled synchronous request forever.

Create a discovery-job model capable of tracking:

```text
id
workspaceId
userId
provider
query
location
radius
filters
status
startedAt
completedAt
resultCount
error
providerRunId
```

Statuses:

```text
QUEUED
RUNNING
COMPLETED
FAILED
CANCELLED
```

For small searches, synchronous execution may remain supported.

For larger searches, use asynchronous execution.

Do not block the Express request for unnecessarily long-running scraping jobs.

---

# PHASE 14 — APIFY RUN METADATA

Capture provider metadata where available:

```text
actorId
runId
datasetId
startedAt
completedAt
resultCount
```

This allows HUNTIQ to audit where a business record originated.

Never store the API token itself.

---

# PHASE 15 — RATE LIMITING AND COST CONTROL

Prevent users from accidentally launching hundreds of expensive Apify jobs.

Implement server-side limits such as:

```text
maxResults per request
max concurrent Maps jobs per workspace
minimum cooldown for identical searches
```

Deduplicate identical searches when appropriate.

Track:

```text
workspace
provider
run
result count
```

so usage can eventually feed into billing/usage limits.

Do not hard-code arbitrary limits in multiple files. Put them in configuration.

---

# PHASE 16 — API RESPONSE CONTRACT

Make `/prospects/discover-maps` return a consistent response.

Success:

```json
{
  "success": true,
  "data": {
    "results": [],
    "total": 0,
    "query": "...",
    "location": "...",
    "provider": "APIFY_GOOGLE_MAPS",
    "jobId": "...",
    "warnings": []
  },
  "meta": {
    "timestamp": "..."
  }
}
```

Failure:

```json
{
  "success": false,
  "error": {
    "code": "MAP_PROVIDER_UNAVAILABLE",
    "message": "Maps discovery provider is temporarily unavailable."
  },
  "meta": {
    "timestamp": "..."
  }
}
```

Keep the contract stable for the frontend.

---

# PHASE 17 — ENVIRONMENT CONFIGURATION

Add/update:

```text
APIFY_API_TOKEN=
APIFY_MAPS_ACTOR_ID=scrapeai~google-maps-places-scraper

HUNTIQ_MAPS_MOCK=false

MAPS_MAX_RESULTS=50
MAPS_MAX_RADIUS_KM=50
MAPS_MAX_CONCURRENT_JOBS=...
```

Add safe placeholders to `.env.example`.

Never put actual credentials into Git.

Production must fail safely when required credentials are missing.

---

# PHASE 18 — TESTS

Add tests for:

### Provider

- valid Apify response
- empty response
- malformed response
- missing token
- API failure
- network failure
- mock mode
- production mode

### Data purity

Verify that missing:

```text
website
phone
address
coordinates
```

remain `null`.

Verify that no:

```text
company.com
contact@
Lagos coordinates
Business Owner
Managing Director
```

are fabricated.

### Filters

Test:

```text
minRating
minReviews
hasWebsite
hasPhone
category
radiusKm
maxResults
```

### Deduplication

Same:

```text
placeId
```

must not create duplicate businesses.

### Workspace isolation

User A cannot access User B's discovery records.

### Pipeline

Verify:

```text
Maps result
 ↓
Company resolution
 ↓
Audit
 ↓
Signal
 ↓
Score
 ↓
Lead
```

does not bypass workspace ownership.

---

# PHASE 19 — FRONTEND

Do not redesign the prospecting UI.

Only update it where required by the new API contract.

The UI should clearly distinguish:

```text
LIVE DATA
```

from:

```text
MOCK / DEMO DATA
```

If production provider is unavailable, display an actual error state.

Never show mock prospects as if they were real prospects.

For each discovered company, display source:

```text
Source: Google Maps
```

and data-quality indicators where useful:

```text
Website ✓
Phone ✓
Email Not found
Location ✓
```

---

# PHASE 20 — FINAL ARCHITECTURE

The finished implementation should follow:

```text
                    HUNTIQ
                       │
                Prospect Search
                       │
                       ▼
             Maps Discovery Service
                       │
                       ▼
                Apify Provider
                       │
                       ▼
              Raw Apify Results
                       │
                       ▼
              Normalization Layer
                       │
                       ▼
                Deduplication
                       │
                       ▼
              Company Resolver
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Website       Jobs        Other Signals
       Audit        APIs         Providers
          │            │            │
          └────────────┼────────────┘
                       ▼
                Signal Engine
                       ▼
             Evidence Collection
                       ▼
              Opportunity Score
                       ▼
                Lead Generator
                       ▼
              Contact Enrichment
                       ▼
                   Outreach
                       ▼
                    CRM
```

The key architectural rule is:

> **Apify is a data acquisition provider, not the HUNTIQ intelligence engine.**

---

# IMPORTANT IMPLEMENTATION RULES

1. Do not fabricate prospect data.
2. Do not silently return mock data in production.
3. Do not expose Apify credentials.
4. Do not bypass authentication.
5. Do not bypass workspace isolation.
6. Do not automatically convert every discovered company into a qualified deal.
7. Do not replace PostgreSQL with the JSON/PersistentStore for production.
8. Keep mock providers available only for explicit development/test environments.
9. Do not scrape LinkedIn or bypass anti-bot protections.
10. Do not redesign unrelated pages.
11. Preserve existing API contracts wherever possible.
12. Reuse existing repository/service architecture instead of creating parallel data-access systems.

---

# ACCEPTANCE CRITERIA

The implementation is complete only when:

- Real Apify Maps data works with `APIFY_API_TOKEN`.
- Production never silently returns mock businesses.
- Missing data remains `null`.
- No fake domains/emails/phones/locations are generated.
- Radius filtering actually works.
- All advertised filters work.
- Duplicate businesses are prevented.
- Results are workspace-isolated.
- Maps discoveries can enter the HUNTIQ intelligence pipeline.
- Opportunity scores are evidence-based.
- Raw discovery is distinguishable from qualified leads.
- Provider errors are handled cleanly.
- Large jobs can be tracked.
- Apify run metadata is retained safely.
- Tests cover provider failure, normalization, filtering, deduplication and tenant isolation.
- Existing HUNTIQ functionality continues to work.

After implementation, run the relevant test suite and type-check/build.

Then report:

```text
FILES CHANGED
DATABASE CHANGES
API CHANGES
APIFY INTEGRATION STATUS
TEST RESULTS
REMAINING ISSUES
```

Do not claim success unless the tests/build actually pass.