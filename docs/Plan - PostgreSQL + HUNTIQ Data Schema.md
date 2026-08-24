## Step 2 — PostgreSQL + HUNTIQ Data Schema

Now that the API boundary is defined, the next layer should be **persistent data**.

The goal is to replace the current hard-coded companies, jobs, signals and contacts with a database that the engine can continuously update.

### Target architecture

```text
HUNTIQ Frontend
      ↓
HUNTIQ API
      ↓
Service Layer
      ↓
PostgreSQL
      │
      ├── Workspaces
      ├── Companies
      ├── Contacts
      ├── Jobs
      ├── Signals
      ├── Evidence
      ├── Leads
      └── Activities
```

### 1. Companies

The company is the central intelligence entity.

```text
companies
────────────────────────
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

This becomes the canonical company record.

---

### 2. Jobs

Every job discovered from an external source gets its own record.

```text
jobs
────────────────────────
id
company_id
source_id

external_id

title
description

department
function
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

The important fields are:

```text
first_seen_at
last_seen_at
posted_at
closed_at
```

because later we need to calculate **hiring velocity and hiring acceleration**.

---

### 3. Job Sources

Don't hard-code providers into the jobs table.

```text
job_sources
────────────────────────
id
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

Examples:

```text
GREENHOUSE
LEVER
ASHBY
CAREER_PAGE
```

---

### 4. Contacts

```text
contacts
────────────────────────
id
workspace_id
company_id

first_name
last_name

job_title
department
seniority

email
email_status
email_confidence

phone
linkedin_url

source
source_url

first_seen_at
last_verified_at

created_at
updated_at
```

Critically, don't treat an email as verified simply because an API returned it.

Use:

```text
email_status:
UNKNOWN
VALID
INVALID
RISKY
```

---

### 5. Signals

This is the intelligence layer.

```text
signals
────────────────────────
id
workspace_id
company_id

type

title
summary

strength
confidence

detected_at
observed_from
observed_to

status

created_at
updated_at
```

Examples:

```text
HIRING_ACCELERATION
DEPARTMENT_EXPANSION
LEADERSHIP_HIRING
FUNDING
EXPANSION
TECHNOLOGY_CHANGE
```

---

### 6. Evidence

This is extremely important.

Every important signal needs supporting evidence.

```text
evidence
────────────────────────
id
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
created_at
```

Example:

```text
Signal:
Hiring acceleration

Evidence:
────────────────────────────
32 new jobs detected

Source:
Greenhouse

Observed:
2026-08-24

Confidence:
96%
```

This allows HUNTIQ to explain **why** it believes something.

---

### 7. Leads

Once intelligence passes the qualification threshold:

```text
leads
────────────────────────
id
workspace_id

company_id
contact_id
signal_id

score
tier

status

source
reason
summary

created_at
updated_at
```

Example:

```text
Acme Technologies
Jane Smith — HR Director

Score: 92

Reason:
Rapid hiring + HR expansion +
strong ICP match
```

---

### 8. Activities

Eventually everything users do should be trackable.

```text
activities
────────────────────────
id
workspace_id
user_id

company_id
contact_id
lead_id

type
title
description

metadata

created_at
```

Examples:

```text
LEAD_CREATED
LEAD_VIEWED
CONTACT_ADDED
EMAIL_SENT
NOTE_ADDED
SIGNAL_VIEWED
COMPANY_TRACKED
```

---

# Relationships

The core relationship should be:

```text
                    COMPANY
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
      JOBS          CONTACTS       SIGNALS
        │                             │
        │                             ▼
        │                          EVIDENCE
        │
        └──────────────┐
                       ▼
                     LEAD
                       │
                       ▼
                   PIPELINE
```

This is the foundation of the intelligence system.

---

# Database rules

There are several constraints I would establish immediately.

### Company uniqueness

Within a workspace, normalize domains and prevent duplicate companies:

```text
workspace_id + domain
```

### Job uniqueness

Prevent the same external job from being inserted repeatedly:

```text
source_id + external_id
```

### Contact uniqueness

Don't blindly create duplicate contacts:

```text
company_id + normalized_email
```

when email exists.

---

# Indexes

The engine will query these constantly, so index:

```text
companies.domain
companies.workspace_id

jobs.company_id
jobs.posted_at
jobs.status
jobs.source_id

signals.company_id
signals.type
signals.detected_at
signals.strength

contacts.company_id
contacts.email

leads.workspace_id
leads.score
leads.status
```

The job timestamp indexes are particularly important because our hiring-signal calculations will repeatedly query recent jobs.

---

# Multi-tenancy

Because HUNTIQ is SaaS, **workspace isolation must be built into the schema now**, not added later.

Most major entities should contain:

```text
workspace_id
```

So:

```text
Workspace A
 ├── Companies
 ├── Contacts
 ├── Leads
 └── Signals

Workspace B
 ├── Companies
 ├── Contacts
 ├── Leads
 └── Signals
```

One customer's data must never leak into another customer's queries.

---

# One architectural improvement

I would actually make **Company Intelligence global + workspace-specific qualification** eventually.

For example:

```text
GLOBAL DATA
Acme Technologies
 ├── jobs
 ├── public signals
 ├── company facts
 └── evidence

WORKSPACE A
 └── ICP score: 91

WORKSPACE B
 └── ICP score: 64
```

This becomes valuable later because the same company intelligence can serve multiple HUNTIQ customers while their ICP/scoring remains private.

For the MVP, however, we can keep the implementation simpler and use workspace-scoped records until the product has enough scale to justify global intelligence.

---

# What Step 2 should deliver

When this phase is implemented, we should have:

```text
✓ PostgreSQL connected
✓ Environment configuration
✓ Database migrations
✓ Companies table
✓ Jobs table
✓ Job sources table
✓ Contacts table
✓ Signals table
✓ Evidence table
✓ Leads table
✓ Activities table
✓ Foreign keys
✓ Indexes
✓ Workspace isolation
```

**No live provider yet.**

That's intentional.

Once the database exists, we move to:

# Step 3 — Job Provider Abstraction

We'll build:

```text
JobProvider
     │
     ├── GreenhouseProvider
     ├── LeverProvider
     └── AshbyProvider
```

with a single normalized interface so HUNTIQ can ingest jobs from different sources without changing the rest of the application.

I can also :chatgpt-content-reference{index="0"}.