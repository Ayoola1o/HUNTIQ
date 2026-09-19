Yes. This is the point where HUNTIQ needs to move from **UI/CRM** into a real **data + intelligence engine**.

The core idea I recommend is:

> **HUNTIQ should not simply scrape leads. It should continuously discover companies, detect buying/hiring signals, enrich the company/contact, score the opportunity, explain why it is valuable, and turn it into an actionable lead.**

And for the job component specifically, we should treat **new hiring as a buying signal**, not as the lead itself.

---

# 1. The HUNTIQ Engine

The architecture should look like this:

```text
                    EXTERNAL DATA
                         │
       ┌─────────────────┼──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
  Job Sources       Company Data       Web/News
       │                 │                  │
       ▼                 ▼                  ▼
 ┌──────────────────────────────────────────────┐
 │              INGESTION ENGINE                │
 │                                              │
 │ APIs / Feeds / Crawlers / Webhooks           │
 └──────────────────────┬───────────────────────┘
                        ▼
                 NORMALIZATION
                        │
                        ▼
               ENTITY RESOLUTION
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
         COMPANY                 PERSON
             │                     │
             └──────────┬──────────┘
                        ▼
                 SIGNAL ENGINE
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
    Hiring           Funding          Expansion
    Signals          Signals          Signals
       │                │                │
       └────────────────┼────────────────┘
                        ▼
                 SCORING ENGINE
                        │
                        ▼
                 AI RESEARCH AGENT
                        │
                        ▼
                 LEAD GENERATOR
                        │
                        ▼
                    HUNTIQ CRM
                        │
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
       Contacts      Pipeline       Reports
```

This should be the backbone of the product.

---

# 2. First principle: don't build a giant scraper

I would **not** start by writing a scraper that crawls the whole internet.

That will become expensive, fragile and difficult to maintain.

Instead use a **source adapter architecture**.

For example:

```text
DataSource
   │
   ├── Greenhouse
   ├── Lever
   ├── Ashby
   ├── Hunter
   ├── Apollo
   ├── Company websites
   ├── News sources
   └── Future providers
```

Each source has its own adapter.

---

# 3. Job intelligence is extremely valuable

This is one of the strongest signals we can build.

Imagine HUNTIQ discovers:

> **Acme Ltd**
>
> Posted:
>
> * Head of HR
> * HR Business Partner
> * Talent Acquisition Manager
> * Payroll Specialist
>
> 11 jobs opened in the last 14 days.

HUNTIQ shouldn't simply say:

> "Acme is hiring."

It should reason:

> **Acme has increased hiring activity by 65% over the last 30 days, with multiple HR-related openings. This suggests organizational expansion and potentially increased demand for HR services.**

That becomes a **Buying Signal**.

---

# 4. Job ingestion sources

For the first version, prioritize structured public job-board APIs.

### Greenhouse

Greenhouse provides a public Job Board API where published jobs can be retrieved as JSON without authentication for GET endpoints. ([Greenhouse Developer Resources][1])

### Lever

Lever provides a public postings API for published job postings, including title, location, team, department and other job information. ([GitHub][2])

### Ashby

Ashby provides public job-posting endpoints for organizations using its platform. It also supports incremental synchronization through its API. ([Ashby][3])

This gives us a very good initial foundation.

---

# 5. Then company career pages

For companies that don't expose one of these job systems, we can have a controlled crawler.

Example:

```text
company.com
     │
     ├── /careers
     ├── /jobs
     ├── /work-with-us
     └── /open-positions
```

Crawler:

```text
Fetch page
    ↓
Identify job-board structure
    ↓
Detect structured data / JSON-LD
    ↓
Extract jobs
    ↓
Normalize
    ↓
Store
```

But:

**Respect robots.txt, site terms, rate limits, and applicable privacy/data-protection requirements.**

Don't build the system around bypassing anti-bot systems or scraping sites that prohibit automated access.

---

# 6. Don't scrape LinkedIn directly

I would specifically avoid making LinkedIn scraping the foundation of HUNTIQ.

Instead:

```text
LinkedIn
   │
   X
Direct scraping dependency
```

Use legitimate APIs/data providers where licensed and permitted.

This keeps the architecture replaceable and reduces the risk of the entire engine breaking because one website changes its HTML.

---

# 7. The Job Intelligence Pipeline

Here's what I would actually implement.

```text
SOURCE
  ↓
Job Discovery
  ↓
Raw Job Record
  ↓
Normalize
  ↓
Company Resolution
  ↓
Duplicate Detection
  ↓
Job Classification
  ↓
Signal Extraction
  ↓
Company Signal Score
  ↓
Opportunity Score
  ↓
Lead Generation
```

---

# 8. Raw job model

Store the original data before transforming it.

```text
job_sources
----------------
id
provider
source_url
source_type
last_checked_at
status
```

Then:

```text
jobs
----------------
id
source_id
external_job_id
company_id

title
description
department
location
employment_type
remote
posted_at
updated_at
job_url

raw_payload
first_seen_at
last_seen_at
status
```

The `raw_payload` is valuable for debugging and reprocessing.

---

# 9. Normalize jobs

Different providers call things differently.

Greenhouse:

```text
updated_at
```

Lever:

```text
createdAt
```

Ashby:

```text
publishedAt
```

HUNTIQ should normalize them into:

```text
posted_at
updated_at
```

The CRM should never care which provider produced the job.

---

# 10. Company resolution

This is critical.

Suppose we receive:

```text
"Acme Technologies Inc."
```

from Greenhouse.

And separately:

```text
"Acme Technologies"
```

from a news source.

We need to understand:

> Same company.

Use signals such as:

```text
Domain
Company name
Website
Email domain
Provider external ID
Location
Legal name
```

The result:

```text
Company
Acme Technologies
       │
       ├── Greenhouse
       ├── Website
       ├── News
       └── Hunter
```

---

# 11. Job classification

Use an AI/classification layer to categorize jobs.

Example:

```text
Senior HR Manager
      ↓
Department: HR
Function: Human Resources
Seniority: Manager
Signal: HR Expansion
```

Another:

```text
Senior Software Engineer
      ↓
Department: Engineering
Function: Engineering
Seniority: Senior
Signal: Engineering Expansion
```

Another:

```text
VP Sales
      ↓
Department: Sales
Function: Revenue
Seniority: Executive
Signal: GTM Expansion
```

---

# 12. Job signals

Don't create a signal for every individual job.

Aggregate them.

Example:

```text
Company: Acme

Last 30 days:

Engineering jobs: 14
Sales jobs: 7
HR jobs: 4
Finance jobs: 2
```

Then calculate:

### Hiring velocity

```text
new jobs / time period
```

### Hiring acceleration

Compare:

```text
Last 7 days
vs
Previous 7 days
```

### Department expansion

```text
HR +300%
Sales +150%
Engineering +75%
```

---

# 13. Signal examples

HUNTIQ should produce signals like:

### 🚀 Rapid Hiring

> 18 new positions posted in the last 14 days.

### 👥 HR Expansion

> 4 HR-related positions opened within 21 days.

### 📈 Engineering Expansion

> Engineering hiring increased 120% month-over-month.

### 🌍 Geographic Expansion

> 6 new roles opened in a new location.

### 🧑‍💼 Leadership Hiring

> Company is hiring for a Director/VP-level position.

### 🏢 Department Buildout

> Company appears to be building a new department.

These become **Market Intelligence events**.

---

# 14. The signal engine

I'd make signals a first-class entity.

```text
signals
----------------
id
company_id
signal_type

strength
confidence

title
summary

detected_at
observed_from
observed_to

source_count
evidence

status
```

Example:

```json
{
  "signal_type": "HIRING_ACCELERATION",
  "strength": 87,
  "confidence": 0.93,
  "company_id": "cmp_123",
  "evidence": {
    "new_jobs_30d": 21,
    "previous_30d": 9
  }
}
```

---

# 15. Evidence is essential

Never let the AI simply say:

> "This company is expanding."

Store **why**.

Example:

```text
Signal:
Rapid Hiring

Evidence:
• 21 new jobs posted
• 8 posted in last 7 days
• Engineering + Sales expansion
• 2 leadership positions
• 3 new geographic locations

Sources:
Greenhouse
Company Careers Page
Company Website
```

This makes HUNTIQ's intelligence credible.

---

# 16. Company intelligence score

Now we can calculate:

```text
Company Opportunity Score
```

Example:

```text
ICP Fit              30
Hiring Momentum      25
Buying Signals       20
Company Growth       15
Contact Availability 10
────────────────────────
                     100
```

Then:

> **Acme — 91/100**

---

# 17. But make the scoring configurable

This should connect to the **Settings → Prospecting → Scoring** page we designed.

For example:

```text
ICP Fit             30%
Hiring              25%
Funding             15%
Expansion           15%
Intent              10%
Contact Quality      5%
```

The scoring engine reads these workspace settings.

---

# 18. Contact discovery

Once a company becomes interesting:

```text
Company
   ↓
Find relevant departments
   ↓
Find decision-maker roles
   ↓
Find contacts
   ↓
Enrich
   ↓
Verify
```

For example:

```text
Company
Acme Technologies

Potential targets:

CEO
COO
HR Director
Head of People
CFO
Procurement
```

---

# 19. Hunter is a good first integration

Hunter provides APIs for company discovery, domain search, email finding, email verification and enrichment. Its Domain Search can return professional email addresses associated with a company domain, while Email Finder can identify a likely professional email using a person's name and company domain. ([Hunter][4])

Hunter also exposes company/person enrichment. ([Hunter][5])

So the workflow can be:

```text
Company
   ↓
Resolve domain
   ↓
Hunter Company Enrichment
   ↓
Find relevant people
   ↓
Email Finder / Domain Search
   ↓
Email Verification
   ↓
Create contact
```

---

# 20. I would use a waterfall

Don't depend on one provider.

Eventually:

```text
Provider A
    ↓
No result?
    ↓
Provider B
    ↓
No result?
    ↓
Provider C
    ↓
No result?
    ↓
Company website
```

This is increasingly common in modern GTM data systems; current industry discussion also points toward waterfall enrichment to improve match rates and data completeness. ([Apollo][6])

But build the **provider abstraction first**, before adding five providers.

---

# 21. Lead generation

Here's the important distinction:

### Company

The organization.

### Contact

The person.

### Lead

A qualified prospect created from company + contact + opportunity context.

For example:

```text
Company:
Acme Technologies

Contact:
Jane Smith
HR Director

Signals:
• 12 new hires
• HR department expansion
• New Lagos office

Score:
92

Lead:
Jane Smith @ Acme Technologies
```

---

# 22. Lead object

```text
leads
----------------
id
workspace_id

company_id
contact_id

source
source_signal_id

score
status

reason
summary

created_at
updated_at
```

Lead status:

```text
NEW
REVIEWING
QUALIFIED
CONTACTED
ENGAGED
CONVERTED
DISMISSED
```

---

# 23. Automated lead creation

Don't create thousands of garbage leads.

Set thresholds.

Example:

```text
IF

ICP Score >= 70
AND
Opportunity Score >= 75
AND
Contact confidence >= 80

THEN

Create Lead
```

For high-value signals:

```text
Signal strength >= 90
```

could trigger immediate lead creation.

---

# 24. AI research agent

This is where HUNTIQ becomes more than a CRM.

After the signal engine finds a company:

```text
Company discovered
       ↓
Research Agent
       ↓
Company website
       ↓
Jobs
       ↓
News
       ↓
Public company information
       ↓
Enrichment
       ↓
Evidence aggregation
       ↓
Research summary
```

Output:

> **Why this company matters**

> Acme has increased hiring activity by 130% over the last month, with significant expansion across HR and Sales. The company is also hiring a Head of People, suggesting organizational scaling.

Then:

> **Recommended contact**

> HR Director

Then:

> **Suggested action**

> Reach out about workforce/HR support.

---

# 25. Don't let AI determine raw facts

Important architecture:

```text
DATA
 ↓
RULES / CALCULATIONS
 ↓
AI INTERPRETATION
```

Not:

```text
AI
 ↓
Invent facts
```

For example:

**Hiring count** should come from the database.

AI can interpret:

> "Hiring activity suggests expansion."

---

# 26. Engine components

I'd divide the backend into these services/modules:

```text
ENGINE
│
├── Source Manager
│
├── Job Ingestion
│
├── Company Discovery
│
├── Contact Discovery
│
├── Enrichment
│
├── Entity Resolution
│
├── Signal Engine
│
├── Scoring Engine
│
├── Research Engine
│
├── Lead Generator
│
├── Deduplication
│
└── Compliance / Provenance
```

---

# 27. Source Manager

```text
SourceManager
    │
    ├── GreenhouseAdapter
    ├── LeverAdapter
    ├── AshbyAdapter
    ├── HunterAdapter
    └── FutureAdapter
```

Each adapter implements:

```text
discover()
fetch()
normalize()
validate()
```

---

# 28. Scheduler

We need background jobs.

Example:

```text
Every 15 min
     ↓
High-priority companies

Every hour
     ↓
Tracked companies

Every 6 hours
     ↓
General job discovery

Daily
     ↓
Company enrichment

Weekly
     ↓
Deep research
```

Do **not** run expensive AI research against every company every few minutes.

---

# 29. Queue architecture

For your SaaS:

```text
API
 │
 ├── PostgreSQL
 │
 └── Job Queue
       │
       ├── ingestion-worker
       ├── enrichment-worker
       ├── signal-worker
       ├── scoring-worker
       └── research-worker
```

If you're using Next.js, keep long-running work out of the request/response lifecycle.

A lightweight MVP could use a managed queue/serverless job system rather than deploying a giant worker cluster.

---

# 30. Recommended database

For this application, I'd use:

### PostgreSQL

because HUNTIQ has relationships like:

```text
Company
 ↓
Contacts
 ↓
Activities
 ↓
Signals
 ↓
Jobs
 ↓
Leads
 ↓
Opportunities
```

This is strongly relational.

Add:

### PostgreSQL full-text search

initially.

You don't need Elasticsearch/OpenSearch on day one.

---

# 31. Core database relationships

```text
workspace
   │
   ├── companies
   │      │
   │      ├── jobs
   │      ├── signals
   │      ├── contacts
   │      └── leads
   │
   ├── contacts
   │
   ├── opportunities
   │
   └── activities
```

---

# 32. Source provenance

Every externally derived fact should know:

```text
source
source_url
provider
retrieved_at
confidence
```

Example:

```text
Company employees: 245

Source:
Provider X

Retrieved:
2026-08-24

Confidence:
0.91
```

This will become extremely valuable when users ask:

> "Where did HUNTIQ get this information?"

---

# 33. Data freshness

Don't treat data as permanent.

Every record should have:

```text
first_seen_at
last_seen_at
last_verified_at
```

For jobs:

```text
first_seen_at
last_seen_at
closed_at
```

Then the UI can say:

> Verified 2 hours ago.

Instead of pretending everything is live.

---

# 34. Job lifecycle

A job can move through:

```text
DISCOVERED
    ↓
ACTIVE
    ↓
UPDATED
    ↓
STALE
    ↓
CLOSED
```

If it disappears from a source for several sync cycles, mark it stale before permanently closing it.

---

# 35. Company lifecycle

Likewise:

```text
DISCOVERED
 ↓
ENRICHED
 ↓
QUALIFIED
 ↓
TRACKED
 ↓
SIGNAL DETECTED
 ↓
LEAD CREATED
 ↓
CRM
```

---

# 36. Prospect Hunter workflow

The UI could eventually have:

```text
Find Companies

ICP:
Technology

Location:
Nigeria

Employees:
50–500

Signals:
☑ Hiring acceleration
☑ Expansion
☑ Leadership hiring
☑ Funding

Minimum Score:
75

[Find Opportunities]
```

Then:

```text
Searching...
   ↓
Companies discovered: 2,481
   ↓
ICP matched: 416
   ↓
Signals detected: 83
   ↓
High-value opportunities: 27
```

This is a powerful experience.

---

# 37. Results

Each company card:

```text
┌─────────────────────────────────────────────┐
│ Acme Technologies                     92    │
│ Technology • 240 employees                  │
│                                             │
│ 🔥 Hiring acceleration                      │
│ 👥 HR expansion                             │
│ 🌍 New location                             │
│                                             │
│ 18 jobs / 30 days                           │
│ +126% hiring velocity                       │
│                                             │
│ [Research] [View Company] [Create Lead]     │
└─────────────────────────────────────────────┘
```

This connects directly with the UI pages we've already planned.

---

# 38. Market Intelligence

Market Intelligence should consume the same engine.

Instead of creating a separate data system:

```text
ENGINE
 │
 ├── Dashboard
 ├── Market Intelligence
 ├── Prospect Hunter
 ├── Companies
 ├── Contacts
 ├── Leads
 └── Reports
```

One intelligence layer.

---

# 39. Dashboard

The Dashboard can then show:

### New opportunities

**27**

### New signals

**84**

### Companies hiring

**213**

### High-intent companies

**31**

### Leads generated

**18**

And:

> **Top opportunities today**

---

# 40. The killer feature: "Why now?"

Every lead should have:

## Why now?

Example:

> **Why now?**

> Acme posted 9 new roles in the last 10 days, including an HR Director and two Talent Acquisition positions. Hiring velocity is up 140% compared with the previous 30-day period.

Then:

### Why this company?

> Matches your ICP: technology, 200–500 employees, Nigeria.

### Who to contact?

> HR Director / COO.

### What changed?

> Rapid hiring + HR department expansion.

This is what differentiates HUNTIQ from a normal CRM.

---

# 41. Lead creation should be explainable

When HUNTIQ creates a lead:

```text
LEAD CREATED

Jane Smith
HR Director
Acme Technologies

Score: 92

Reason:
• ICP match
• 9 new jobs
• HR expansion
• Leadership hiring
• Verified company domain
```

Then:

**Add to Pipeline**

**Research**

**Contact**

**Dismiss**

---

# 42. API stack I recommend

For the first implementation:

| Purpose                | Starting source                 |
| ---------------------- | ------------------------------- |
| Job discovery          | Greenhouse                      |
| Job discovery          | Lever                           |
| Job discovery          | Ashby                           |
| Email discovery        | Hunter                          |
| Email verification     | Hunter                          |
| Company enrichment     | Hunter                          |
| AI research            | Your LLM provider               |
| Company/news discovery | Licensed search/web data source |
| CRM                    | HUNTIQ PostgreSQL               |
| Queue                  | Managed job queue               |
| Auth                   | Existing HUNTIQ auth            |
| Storage                | Object storage                  |

Don't integrate 15 providers immediately.

---

# 43. Build the provider abstraction first

This is the first code architecture I would implement.

```text
/providers
   /jobs
      JobProvider.ts
      GreenhouseProvider.ts
      LeverProvider.ts
      AshbyProvider.ts

   /enrichment
      EnrichmentProvider.ts
      HunterProvider.ts

   /research
      ResearchProvider.ts
```

Then:

```text
JobProvider
```

returns HUNTIQ's own normalized object.

The rest of HUNTIQ never needs to know whether a job came from Greenhouse or Lever.

---

# 44. Normalized job interface

Conceptually:

```text
NormalizedJob
{
  externalId
  source
  title
  companyName
  companyDomain
  description
  location
  department
  seniority
  employmentType
  remote
  postedAt
  updatedAt
  url
}
```

Then:

```text
Greenhouse → NormalizedJob
Lever      → NormalizedJob
Ashby      → NormalizedJob
Crawler    → NormalizedJob
```

---

# 45. First implementation phase

I would **not** start with everything.

### Phase 1 — Live Job Intelligence

Build:

```text
Greenhouse
Lever
Ashby
      ↓
Job ingestion
      ↓
Normalization
      ↓
Company matching
      ↓
Job database
      ↓
Hiring signals
```

Goal:

> **HUNTIQ can continuously detect companies that are hiring.**

---

# 46. Phase 2 — Enrichment

Then:

```text
Company
 ↓
Domain
 ↓
Hunter
 ↓
Company data
 ↓
Decision makers
 ↓
Email discovery
 ↓
Email verification
```

Goal:

> **Turn companies into reachable prospects.**

---

# 47. Phase 3 — Scoring

```text
ICP
+
Hiring
+
Signals
+
Company fit
+
Contact quality
        ↓
Opportunity Score
```

Goal:

> **Identify which prospects are worth pursuing.**

---

# 48. Phase 4 — AI Research

```text
High-score company
        ↓
Research Agent
        ↓
Evidence
        ↓
Why now?
        ↓
Recommended contact
        ↓
Recommended action
```

Goal:

> **Turn raw data into sales intelligence.**

---

# 49. Phase 5 — Automatic lead generation

```text
Score >= threshold
        ↓
Create lead
        ↓
Assign owner
        ↓
Create CRM activity
        ↓
Notify user
```

Goal:

> **The system hunts while the user works on the opportunities.**

---

# 50. Phase 6 — Continuous monitoring

This is where HUNTIQ becomes genuinely SaaS-like.

User clicks:

**Track Company**

Then:

```text
Acme Technologies
       │
       ├── Monitor jobs
       ├── Monitor hiring velocity
       ├── Monitor leadership
       ├── Monitor company news
       ├── Monitor expansion
       └── Monitor signals
```

When something meaningful happens:

> 🔥 **New signal detected**

> Acme just posted 6 new positions, including a Director of People role.

---

# 51. What I would build FIRST

Don't start coding the entire engine.

Start with this exact vertical slice:

```text
                    HUNTIQ ENGINE V1

                ┌─────────────────┐
                │ Greenhouse API  │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │  Job Normalizer │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │ Company Resolver│
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │ Hiring Signal   │
                │     Engine      │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │ Opportunity     │
                │    Scoring      │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │ HUNTIQ Company  │
                │      Page       │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │ Create Lead     │
                └─────────────────┘
```

Then add **Lever + Ashby**.

Then add **Hunter enrichment**.

Then AI.

That gives us a working engine quickly instead of spending weeks building infrastructure before seeing useful data.

---

## One important product decision

I would position HUNTIQ as:

> **An AI-powered prospect intelligence platform that detects when companies are becoming commercially interesting and tells you who to contact and why.**

Not:

> "A CRM with scraped leads."

That distinction should drive the entire architecture.

The **job data is only one signal source**. Eventually the engine should combine:

**Hiring + funding + expansion + leadership changes + technology changes + news + company growth + ICP fit + contact availability**

to produce:

> **Who should I pursue today, and why?**

I can also create an image explaining this **HUNTIQ Intelligence Engine architecture and data flow** for your AI development agents.

[1]: https://developer.greenhouse.io/job-board.html?utm_source=chatgpt.com "Job Board API | Greenhouse"
[2]: https://github.com/lever/postings-api?utm_source=chatgpt.com "GitHub - lever/postings-api: API documentation and examples for the lever postings REST API · GitHub"
[3]: https://developers.ashbyhq.com/docs/public-job-posting-api?utm_source=chatgpt.com "Ashby Job Postings API"
[4]: https://hunter.io/api-documentation/?utm_source=chatgpt.com "Hunter's API Reference V2"
[5]: https://hunter.io/api/lead-enrichment?utm_source=chatgpt.com "Lead Enrichment API • Hunter"
[6]: https://www.apollo.io/insights/which-platform-offers-the-best-data-enrichment-api?utm_source=chatgpt.com "Which Platform Has the Best Data Enrichment API? 2026 | Apollo"
