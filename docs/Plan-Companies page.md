Yes. Since the **Companies page image is now the current page**, let's document that page before we move to the next HUNT tab.

One important point: the project documentation explicitly establishes **company search, company profile, AI company research, opportunity scoring, buying signals, and saving prospects** as part of the Intelligence MVP.  The exact KPI numbers and some visual labels in the generated image are **UI examples**, not values specified by the documentation.

# HUNTIQ — Companies Page

## 1. Purpose of the Companies page

The Companies page is the central **company database and company-discovery workspace** inside HUNT.

Its main question is:

> **"Show me the companies in my market, help me understand which ones matter, and let me investigate them."**

It sits between **Find Prospects** and deeper **Company Intelligence / Research**.

The overall relationship is:

```text
Find Prospects
      ↓
Companies
      ↓
Company Intelligence
      ↓
Research
      ↓
Contacts
      ↓
Opportunity
```

The documentation deliberately separates **company**, **contact**, **signal**, **research**, and **CRM activity** as different entities. 

---

# 2. Page structure

The generated Companies page has five major areas:

```text
┌─────────────────────────────────────────────────────────┐
│ Header / Search / Copilot / Filters / Export            │
├─────────────────────────────────────────────────────────┤
│ Company KPI cards                                       │
├─────────────────────────────────────────────────────────┤
│ Company tabs + search/filter controls                   │
├───────────────────────────────────────┬─────────────────┤
│                                       │                 │
│ Company table                         │ Company Preview │
│                                       │                 │
├───────────────────────────────────────┴─────────────────┤
│ Industry Analytics │ Score Distribution │ Recent Added  │
└─────────────────────────────────────────────────────────┘
```

This makes the page both a **database view** and an **intelligence view**.

---

# 3. Page header

### Title

# Companies

Subtitle:

> **Discover and analyze companies in your target market.**

This is intentionally broader than Find Prospects.

Find Prospects asks:

> Who should I find?

Companies asks:

> What companies do I currently have available to investigate?

---

# 4. Global search

At the top:

> **Search companies, people, signals...**

The search should support company-name and company-information lookup.

Examples:

> Acme Technologies

> fintech companies Lagos

> companies hiring

> companies with expansion signals

The AI Copilot should also be able to call the controlled `search_companies()` and `get_company()` tools. The architecture specifically prevents the LLM from having unrestricted database access. 

---

# 5. Ask AI Copilot

The button:

### Ask AI Copilot

should allow users to perform company-related queries without manually filtering.

Examples:

> Find my highest-scoring companies.

> Which companies have new hiring signals?

> Research Acme Technologies.

> Show companies in Lagos with more than 500 employees.

The documented Copilot flow is:

```text
Understand request
       ↓
Translate into parameters
       ↓
Search company database
       ↓
Query signals
       ↓
Filter
       ↓
Calculate opportunity scores
       ↓
Rank
       ↓
Present
```



---

# 6. KPI cards

The generated image contains six summary cards.

These should be treated as **dynamic workspace metrics**.

## Total Companies

Example:

**2,842**

### Function

Number of companies currently accessible in the workspace/search context.

---

## New Companies

Example:

**186**

### Function

Companies newly added to the workspace/data set during the selected period.

---

## High Opportunity

Example:

**412**

### Function

Companies whose current opportunity score meets the configured high-opportunity threshold.

---

## Avg. Opportunity Score

Example:

**68/100**

### Function

Average opportunity score across the displayed/company universe.

---

## Companies with Signals

Example:

**1,124**

### Function

Number of companies associated with one or more relevant detected signals.

The signal architecture associates signals directly with a `company_id`, with fields including source, detection time, confidence and importance. 

---

## Total Employees

Example:

**586K**

### Function

Aggregate employee count across the displayed company universe.

---

# 7. Important implementation rule for KPI cards

These numbers must **never be hard-coded**.

They should respond to:

* Workspace
* User permissions
* Search context
* Filters
* Date range
* Company status

For example, if the user selects:

> Lagos

the cards should recalculate for Lagos companies.

---

# 8. Company tabs

The generated image contains:

### All Companies

Default view.

### High Opportunity

Shows companies with strong opportunity scores.

### Recently Added

Shows newly discovered/enriched companies.

### Saved Companies

Shows companies the user has saved.

### My Lists

Shows companies belonging to user-created lists.

These tabs are effectively **saved filter states/views**.

---

# 9. Main company table

The main table is the heart of the page.

The generated design includes:

| Field             | Purpose                 |
| ----------------- | ----------------------- |
| Checkbox          | Bulk actions            |
| Company           | Company identity        |
| Industry          | Industry classification |
| Employees         | Company size            |
| Revenue           | Revenue estimate        |
| Location          | Headquarters/market     |
| Opportunity Score | Commercial relevance    |
| Signals           | Active signals          |
| Last Activity     | Recent HUNTIQ activity  |
| Actions           | Company operations      |

---

# 10. Company row

Example:

### Acme Technologies

```text
Technology
250–500 employees
$25M–$50M
Lagos, Nigeria
```

Then:

### Opportunity Score

**94**

**Very High**

And signal indicators:

* Hiring
* Expansion
* Leadership
* +3

This makes the table more than a normal company directory.

It answers:

> **"Is this company worth my attention?"**

---

# 11. Opportunity Score

The score is one of the most important fields.

Example:

> **94/100 — Very High**

The underlying scoring system should consider the relationship between:

```text
Company
+
ICP Fit
+
Buying Signals
+
Business Context
+
Opportunity Factors
```

The documented architecture has a dedicated **Scoring Agent** whose responsibility is to calculate opportunity probability. 

---

# 12. Score should be explainable

Clicking:

> **94**

should not merely show another number.

It should open:

### Opportunity Score Breakdown

Example:

```text
ICP Fit                 95
Buying Intent           92
Growth                  89
Relevant Signals        96
Company Characteristics 90
──────────────────────────
Overall                 94
```

And:

### Why this score?

> Strong ICP fit combined with recent hiring, expansion and leadership-change signals.

This is consistent with the product's requirement to explain **why now**, rather than simply saying a company is a good prospect. 

---

# 13. Signal indicators

The signal icons in the table should be clickable.

For example:

🔥 Hiring

📈 Expansion

👤 Leadership

💻 Technology

Clicking a signal should either:

1. Open the Signal drawer, or
2. Filter the Companies table.

For example:

> Click Hiring

becomes:

```text
Companies
WHERE signal_type = "Hiring"
```

---

# 14. Company preview drawer

The right-hand panel is one of the most important parts of the generated design.

When the user clicks a company, HUNTIQ opens:

### Company Preview

Example:

# Acme Technologies

Technology · Lagos, Nigeria

Website:

> acmetech.com

Then:

### Opportunity Score

**94/100**

**Very High Opportunity**

---

# 15. About the Company

The drawer includes:

> Acme Technologies provides innovative software solutions and digital transformation services to businesses across Africa.

This is a concise company description.

But it must be grounded in company data.

The project's documentation specifically warns against creating a system that merely produces nice AI descriptions. The goal is actionable intelligence backed by evidence. 

---

# 16. Company attributes

The preview contains:

### Industry

Technology / Software

### Employees

250–500

### Revenue

$25M–$50M

### Founded

2016

### Headquarters

Lagos, Nigeria

### Social

LinkedIn / other supported profiles

These should come from the company's structured profile data.

---

# 17. Top Signals

The preview panel contains:

### Top Signals

Example:

**Hiring Surge**

> 38 new job postings

**Expansion**

> Opened new office in Lagos

**Leadership Change**

> New COO appointed

**Technology Change**

> Migrating to AWS

Then:

> **+2 more signals**

This connects the Companies page directly to the Signals system.

---

# 18. View Full Profile

The button:

### View Full Profile

takes the user to the dedicated **Company Intelligence page**.

That page is deeper than this preview.

The documented Company Intelligence design includes:

* Company overview
* Business model
* Current situation
* Growth
* Technology
* Competitors
* Problems
* Opportunities
* Buying signals
* Decision makers
* Recommended approach
* Evidence/sources. 

---

# 19. Add to List

The generated image has:

### Add to List

This allows users to organize companies.

Examples:

```text
My Lists
├── Lagos Prospects
├── High Priority
├── HR Consulting Targets
├── Follow Up
└── Research Later
```

The company should not be duplicated when placed in multiple lists.

Instead:

```text
company
   ↓
list_membership
   ↓
list
```

---

# 20. Save Company

The star icon next to the company name can represent:

### Save Company

This is different from:

### Add to List

**Save Company**

means:

> Keep this company in my saved workspace.

**Add to List**

means:

> Put this company into a particular organizational list.

The MVP specifically includes **Save prospect** functionality. 

---

# 21. Bulk selection

Each company row has a checkbox.

Selecting several companies should expose a bulk-action toolbar.

Example:

```text
5 selected

[Add to List]
[Save]
[Research]
[Create Opportunity]
[Export]
```

For the first version, I would prioritize:

* Add to List
* Save
* Export
* Research

Opportunity creation can come after the scoring workflow is stable.

---

# 22. Filters

The Filters button should open a comprehensive company filter drawer.

### Company

* Industry
* Location
* Employees
* Revenue
* Founded year
* Business type

### Intelligence

* Opportunity score
* ICP fit
* Buying intent

### Signals

* Hiring
* Funding
* Expansion
* Leadership
* Technology
* News
* Compliance
* Custom signals

These signal categories are already part of the HUNTIQ hunting configuration. 

---

# 23. Filter combinations

Filters should support AND/OR logic where appropriate.

Example:

```text
Industry = Technology
AND
Location = Lagos
AND
Employees = 50–500
AND
Hiring Signal = Yes
```

Result:

> Companies satisfying all four criteria.

The backend, not the browser, should execute these queries.

---

# 24. Sort options

The generated page includes:

### Sort by Opportunity Score

Other useful options:

* Highest opportunity score
* Lowest opportunity score
* Recently added
* Recently updated
* Most signals
* Largest company
* Highest revenue
* Most recent activity

Default:

### Opportunity Score — High to Low

This reinforces HUNTIQ's intelligence-first positioning.

---

# 25. Search within Companies

The page should have a dedicated company search/filter capability.

Examples:

> Acme

> Technology Lagos

> Financial Services

> companies with hiring signals

For advanced natural-language searches, however, the user should be encouraged toward **Find Prospects** or **Copilot**.

---

# 26. Export

The generated page includes:

### Export

Possible formats:

* CSV
* Excel
* PDF — later
* CRM-compatible export

The export must respect:

* User permissions
* Current filters
* Selected records
* Organization boundaries

---

# 27. Companies by Industry

The lower-left chart shows:

### Companies by Industry

Example:

```text
Technology
Financial Services
IT Services
Healthcare
Manufacturing
Professional Services
Other
```

### Function

Shows the composition of the current company database.

Clicking an industry should filter the main company table.

---

# 28. Opportunity Score Distribution

The second chart shows:

```text
0–49       Low
50–69      Medium
70–89      High
90–100     Very High
```

### Function

Provides a visual picture of the quality of the company's current market.

For example:

> How many companies are genuinely high-value prospects?

Clicking a range should filter the table.

---

# 29. Recently Added Companies

The lower-right panel contains newly added companies.

Example:

* CloudNova Solutions
* BrightPay Financials
* Medix Healthcare
* GreenBuild Construction
* Edutech Innovations

This is useful for quickly seeing what has entered the intelligence database.

---

# 30. Company data architecture

The documentation proposes separating company data into:

```text
companies
company_profiles
company_sources
company_signals
company_technologies
company_news
```

alongside contacts, prospects, opportunity scores and research reports. 

That is the correct direction for implementation.

A practical structure could be:

```text
companies
----------------
id
organization_id
name
domain
industry
location
employee_count
revenue
founded_year
description
linkedin_url
created_at
updated_at
```

Then:

```text
company_profiles
company_sources
company_signals
company_technologies
company_news
```

hold the deeper intelligence.

These additional fields are implementation-level details; the documentation establishes the entity separation, not every field.

---

# 31. Company enrichment

The **Enrichment Agent** should be responsible for building company/contact profiles. 

The process:

```text
Company discovered
       ↓
Company matching
       ↓
Basic company record
       ↓
Enrichment
 ├── Profile
 ├── Technologies
 ├── News
 ├── Signals
 └── Sources
       ↓
Opportunity scoring
       ↓
Company available in Companies
```

---

# 32. Company research

The **Research Agent** is separate from basic enrichment.

When the user clicks:

### Research Company

the system should investigate:

```text
Company
 ↓
Basic profile
 ↓
Business model
 ↓
Leadership
 ↓
Hiring
 ↓
News
 ↓
Technology
 ↓
Growth
 ↓
Signals
 ↓
Pain points
 ↓
Opportunities
 ↓
Decision makers
 ↓
Recommended approach
```

That exact research workflow is defined in your documentation. 

---

# 33. Evidence and sources

This is critical.

Every important intelligence statement should have a source.

For example:

> **38 new job postings**

Source:

> Job data source

> **New COO appointed**

Source:

> Company announcement

> **Migrating to AWS**

Source:

> Technology intelligence source

The database already specifies company sources and signal sources as separate components. 

---

# 34. Companies page vs Find Prospects

We need to keep this distinction very clear.

### Find Prospects

> **Search for companies matching a desired profile.**

### Companies

> **Browse, filter, organize and investigate companies already available to HUNTIQ.**

### Company Intelligence

> **Deeply understand one company.**

This prevents duplication between the three pages.

---

# 35. Companies → Contacts

From a company row or company preview:

### Find Contacts

should take the user to Contacts filtered for that company.

Example:

```text
Acme Technologies
       ↓
Find Contacts
       ↓
Jane Smith — Head of People
Michael Okoro — COO
David Jonah — CTO
```

The product's intended model is not simply finding contacts; it should eventually construct a **buying committee** and identify the recommended person to approach. 

---

# 36. Companies → Opportunities

If a company has:

```text
Strong ICP fit
+
High opportunity score
+
Multiple relevant signals
```

the user should be able to:

### Create Opportunity

or:

### View Opportunity

This maintains the core product loop:

```text
DISCOVER
 ↓
RESEARCH
 ↓
SIGNALS
 ↓
SCORE
 ↓
PRIORITIZE
 ↓
DECISION MAKER
 ↓
OUTREACH
 ↓
PIPELINE
 ↓
CONVERSION
```



---

# 37. Companies → Copilot

The Companies page should work closely with Copilot.

Example:

> **Show me companies in Lagos with an opportunity score above 80.**

Copilot:

```text
search_companies()
        ↓
filter
        ↓
score
        ↓
rank
        ↓
display results
```

Or:

> **Research Acme Technologies.**

Copilot calls:

```text
get_company()
      ↓
research_company()
      ↓
get_signals()
      ↓
score_opportunity()
```

The architecture explicitly defines these as controlled Copilot tools. 

---

# 38. API implementation

A clean initial API could be:

```text
GET  /api/companies
GET  /api/companies/:id
GET  /api/companies/:id/signals
GET  /api/companies/:id/contacts
GET  /api/companies/:id/research

POST /api/companies/:id/research
POST /api/companies/:id/save
POST /api/companies/:id/lists

GET  /api/companies/metrics
GET  /api/companies/industries
GET  /api/companies/score-distribution
```

And:

```text
POST /api/companies/bulk/save
POST /api/companies/bulk/add-to-list
POST /api/companies/export
```

---

# 39. Pagination

The image shows:

> Showing 1 to 8 of 2,842 companies

This should be server-side pagination.

Do **not** load all companies into the browser.

Example:

```text
GET /api/companies?page=1&limit=25
```

with filters and sorting passed to the backend.

---

# 40. Real-time score updates

The company score should not necessarily remain static.

Suppose:

### Yesterday

Acme:

**74**

Then HUNTIQ detects:

* New CEO
* 20 job openings
* Expansion announcement

The score can become:

### **91**

The documentation specifically describes continuous re-ranking when new signals appear. 

That means the Companies table can eventually show:

> ↑ +17 today

next to the score.

That would be a powerful differentiator.

---

# 41. Empty state

If there are no companies:

# No companies yet

> Start by finding prospects that match your ideal customer profile.

### Find Prospects →

This creates a natural connection back to the previous HUNT page.

---

# 42. Loading state

Use skeletons for:

* KPI cards
* Company table
* Preview drawer
* Charts

Do not display a giant generic loading screen.

---

# 43. Error state

Example:

### Unable to load companies

> We couldn't retrieve your company intelligence right now.

**Retry**

The rest of the application should remain functional.

---

# 44. Security

Every company query must be scoped to:

```text
User
 ↓
Organization
 ↓
Permissions
 ↓
Company data
```

Copilot must not be given unrestricted database access. 

Any AI-triggered company action should also follow:

```text
Authentication
 ↓
Workspace authorization
 ↓
AI tool authorization
 ↓
Tool execution
 ↓
Audit log
```



---

# 45. Most important implementation principle

The Companies page must **not become another static company directory**.

Its value comes from combining:

```text
COMPANY DATA
     +
ICP FIT
     +
SIGNALS
     +
RESEARCH
     +
OPPORTUNITY SCORE
     +
AI
```

The documentation's strategic goal is not simply:

> "Here is a database of companies."

It is:

> **"Here are companies you can realistically sell to, why they need you, who to approach, the evidence, and what you should say."** 

That's what should make the Companies page feel fundamentally different from a normal CRM company list.

---

## HUNT section progress

| HUNT page          | Status                  |
| ------------------ | ----------------------- |
| **Find Prospects** | ✅ Image + specification |
| **Companies**      | ✅ Image + specification |
| **Contacts**       | ⏭️ Next                 |
| **Saved Searches** | Later                   |
| **Research**       | Later                   |

So the **next page to design is Contacts**. That page should build on the company intelligence we've just defined and introduce **people, roles, influence, buying committees, recommended contacts, and contact intelligence** rather than simply becoming a conventional address book.
