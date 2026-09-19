Yes. Now that the **Find Prospects** image has been generated, we should lock down its **content, function, and implementation** before moving to the next HUNT page.

The documentation describes Prospect Discovery as one of HUNTIQ's most important screens. It is where the user defines the kind of client they want and HUNTIQ investigates the market using company data, ICP criteria, and buying signals. 

The generated image should therefore be treated as the **visual source of truth**, while the specification below defines what the controls actually do. Your project documentation establishes this workflow for every page. 

# HUNTIQ — Find Prospects

## 1. Main purpose

The page answers:

> **"Who are the companies I should be targeting?"**

It is the beginning of HUNTIQ's hunting workflow.

The user can either:

1. **Describe what they want in natural language**, or
2. **Build the search manually using advanced filters.**

The documentation specifically describes Prospect Discovery with criteria such as location, industry, company size, revenue and buying signals. 

---

# 2. Page layout

The generated page has this structure:

```text
HUNTIQ Sidebar
       │
       ├── Command
       ├── Hunt
       ├── Sell
       ├── Intelligence
       └── Manage

                 FIND PROSPECTS
                       │
          ┌────────────┴────────────┐
          │                         │
     Main Search Area        Search Summary
          │                         │
    AI Prospect Search              │
    Quick Start Templates           │
    Advanced Filters                │
          │                         │
          └────────────┬────────────┘
                       │
                Search Results
                       │
              Search Results Page
```

The **Find Prospects page is not itself the final results page**.

Its job is to construct and execute the search.

After the user clicks **Find Prospects**, HUNTIQ should take them to the next HUNT page:

### **Search Results / Prospect Discovery**

---

# 3. Page header

The image contains:

### Find Prospects ✨

Subtitle:

> **Use AI or advanced filters to discover companies that match your ideal customer profile.**

### Header controls

* Global search
* Ask AI Copilot
* Date/search context
* Save Search

The global search should continue to work across companies, people, signals and related HUNTIQ information.

---

# 4. AI Prospect Search

This is the primary feature.

The user sees:

### **Describe the type of client you're looking for**

Supporting text:

> Tell HUNTIQ what you're looking for in natural language. Our AI will find and rank the best matches.

Example:

> **Find fast-growing technology companies in Lagos with 50–500 employees that are hiring and recently raised funding.**

This directly reflects the documented Prospect Hunter concept. 

---

# 5. Natural-language search

The user can type things such as:

> Find technology companies in Lagos with 50–500 employees that are hiring.

or:

> Find financial services companies in Nigeria expanding into new markets.

or:

> Find companies that may need HR consulting.

The last example is particularly important because HUNTIQ **must not interpret it as a simple keyword search**.

The system should combine:

* User's ICP
* Services
* Company data
* Signals
* Opportunity scoring

to determine the best prospects. 

---

# 6. "Improve with AI"

The generated page includes:

### Improve with AI

This should allow HUNTIQ to take an incomplete search and improve it.

For example, the user enters:

> Technology companies in Lagos.

HUNTIQ could interpret that into:

```text
Industry:
Technology

Location:
Lagos

Suggested company size:
50–500

Suggested signals:
Hiring
Expansion
Funding

Suggested ICP:
Based on workspace configuration
```

The user should be able to accept or modify the suggestions.

This is an **AI assistance feature**, not an automatic search.

---

# 7. Find Prospects button

The main CTA:

### **Find Prospects**

When clicked:

```text
User search
     ↓
Parse request
     ↓
Apply ICP
     ↓
Apply filters
     ↓
Query company database
     ↓
Query signals
     ↓
Match companies
     ↓
Calculate opportunity scores
     ↓
Rank prospects
     ↓
Search Results
```

The documented Copilot/search workflow follows essentially this sequence: understand request → translate into search parameters → search company database → query signals → filter → score → rank → present. 

---

# 8. Quick Start Templates

The generated page has five templates.

### High Growth Companies

> Fast-growing companies with strong expansion signals.

### Actively Hiring

> Companies with large hiring activity across multiple departments.

### Recently Funded

> Companies that have raised funding in the last 6 months.

### Leadership Changes

> Companies with new executives or leadership changes.

### Technology Adopters

> Companies adopting new technologies and digital solutions.

These templates are shortcuts for common prospect-hunting scenarios.

---

# 9. Template functionality

Clicking:

### Actively Hiring

should automatically populate the search configuration:

```text
Signal:
Hiring

Signal strength:
Relevant/High

Other criteria:
User's ICP
```

The user can then modify the search before executing it.

This is important: **templates should configure the search, not bypass the user's control.**

---

# 10. Advanced Search tab

The page has:

### AI Prospect Search

and

### Advanced Search

The Advanced Search tab provides structured controls for users who don't want to use natural language.

This is the manual equivalent of the AI search.

---

# 11. Advanced Filters

The generated page contains:

### Industry

Examples:

* Technology
* Financial Services
* Manufacturing
* Healthcare
* Telecommunications

---

### Location

Examples:

* Lagos
* Abuja
* Port Harcourt
* Nigeria
* Ghana
* Kenya

The exact available locations should ultimately depend on HUNTIQ's data coverage.

---

### Company Size

Example:

**50–500 employees**

Possible ranges:

```text
1–10
11–50
51–200
201–500
501–1,000
1,001–5,000
5,000+
```

---

### Revenue

Example:

**$10M–$50M**

Possible ranges should be configurable.

---

### Business Type

Example:

**B2B**

Potential values:

* B2B
* B2C
* B2B2C
* Nonprofit
* Government
* Other

The onboarding documentation already identifies business type and B2B/B2C as part of the ICP configuration. 

---

### Technologies

This allows searches such as:

> Companies using Salesforce

or:

> Companies adopting cloud technologies.

Technology changes are also one of the user's configurable hunting signals. 

---

### Years in Business

Allows users to target:

* Startups
* Established businesses
* Mature companies

---

### ICP Fit

Possible:

```text
All
Excellent
Strong
Moderate
Weak
```

This is important because HUNTIQ should ultimately prioritize companies based on how well they fit the user's configured customer profile.

---

# 12. Signals & Buying Intent

This is one of the most important sections.

The generated page contains:

* Hiring Activity
* Funding Raised
* Expansion
* Leadership Change
* Technology Change
* New Office
* News Mentions
* Compliance Events
* Poor Reviews
* Add Custom Signal

The documentation explicitly lists hiring, funding, expansion, new executives, technology changes, compliance requirements and recent news as useful prospect-discovery signals. 

---

# 13. Signal selection

The user can select multiple signals.

Example:

```text
☑ Hiring Activity
☑ Expansion
☑ Leadership Change
☐ Funding
☐ Technology Change
```

HUNTIQ should interpret this as:

> Find companies matching my ICP **AND** showing these buying signals.

---

# 14. Custom Signal

The generated page includes:

### Add Custom Signal

This allows the workspace to eventually define organization-specific buying indicators.

For example:

> Companies opening their first Nigerian office.

or:

> Companies advertising HR transformation roles.

or:

> Companies mentioning employee engagement problems.

The custom signal should eventually be represented in the signal engine rather than hard-coded into the frontend.

---

# 15. Clear / Reset Filters

The page has:

### Clear all

and:

### Reset Filters

These must have slightly different behavior.

**Clear all**

Removes all currently selected advanced criteria.

**Reset Filters**

Returns the form to its initial/default state.

For example, the user's configured ICP defaults can be restored.

---

# 16. Search Summary

The right-hand card is important because it gives the user a **live interpretation of what they are asking HUNTIQ to find**.

Example:

### Search Summary

> Based on your criteria, HUNTIQ will search for companies with the following profile.

Then:

**Industries**

Technology, Software

**Location**

Lagos, Nigeria

**Company Size**

50–500 employees

**Revenue**

$10M–$50M

**Business Type**

B2B

**Top Signals**

Hiring + Expansion + Leadership + Technology

This prevents the search from becoming a black box.

---

# 17. Search Summary should update live

If the user changes:

```text
Location:
Lagos
```

to:

```text
Lagos + Abuja
```

the summary immediately becomes:

> **Location: Lagos, Abuja**

If the user removes Hiring:

> **Top Signals: Expansion + Leadership + Technology**

No search needs to be executed just to update the summary.

---

# 18. "What You'll Get"

The right panel also contains an estimated outcome.

Example:

### Estimated Companies

**1,240–2,180**

This is an estimate, not a guaranteed result.

---

### High Opportunity Matches

**120–250**

This estimates how many of the matching companies may have strong opportunity potential.

---

### Average Opportunity Score

**68/100**

This gives an estimated quality of the search.

---

### Research Sources

**15+ sources**

This communicates that HUNTIQ will combine multiple data sources.

---

### Data Freshness

**Real-time**

Where real-time coverage is actually available.

If not, the UI should show the actual freshness state rather than claiming real-time data.

---

# 19. Important implementation rule for estimates

These values should **not be hard-coded in production**.

For example:

```text
estimated_companies
high_opportunity_matches
average_opportunity_score
```

should come from a search-preview service.

Conceptually:

```text
Search Criteria
      ↓
Preview Query
      ↓
Count Estimate
      ↓
Signal Match Estimate
      ↓
Score Distribution Estimate
      ↓
Search Summary
```

For the initial MVP, approximate values can be used if the underlying data provider does not support accurate counts, but the UI should label them appropriately.

---

# 20. AI-Powered Search card

The image contains:

### AI-Powered Search

> Our AI analyzes millions of data points, company signals, news, and market intelligence to find your best prospects.

The functional role is to explain **why the AI search is different from a normal company database search**.

The core distinction is that HUNTIQ combines:

**ICP + Company Data + Signals + Opportunity Scoring.** 

---

# 21. What happens after clicking Find Prospects?

The user should move to:

# Search Results

The next page.

The result should contain something like:

> **1,842 companies found**

Then HUNTIQ ranks them.

Example:

| Rank | Company           | Score | Buying Intent | Why Now             |
| ---- | ----------------- | ----: | ------------- | ------------------- |
| 1    | Acme Technologies |    94 | Very High     | Hiring + expansion  |
| 2    | FinServe Ltd      |    91 | High          | Funding + expansion |
| 3    | Delta Systems     |    87 | High          | Technology change   |

This is where the search becomes an actionable prospect list.

---

# 22. Search result ranking

The search itself should not simply sort alphabetically.

The ranking engine should consider:

```text
ICP Fit
+
Buying Intent
+
Relevant Signals
+
Company Characteristics
+
Opportunity Score
```

The documentation explicitly says the search should ultimately **filter, calculate opportunity scores and rank results**. 

---

# 23. Save Search

The generated page has:

### Save Search

When clicked, save:

```text
Search Name
Criteria
AI Prompt
Filters
Signals
ICP configuration
Created By
Created At
```

Example:

> **Lagos HR Growth Companies**

Then the user can later access it under:

### HUNT → Saved Searches

The data model already includes **Saved Searches** as a core HUNTIQ entity. 

---

# 24. Saved search automation

Later, a saved search can become:

### Active Monitoring

For example:

> Every morning, find new Lagos companies matching my HR consulting ICP that show hiring or expansion signals.

Then HUNTIQ can alert the user when new companies enter the search.

This connects Find Prospects to the later **Saved Searches & Alerts** functionality.

---

# 25. Backend data model

The minimum entities involved are:

```text
organizations
users
companies
prospects
signals
saved_searches
opportunities
```

The project documentation identifies these as core HUNTIQ entities. 

A practical search record can contain:

```text
prospect_searches
-------------------------
id
organization_id
created_by
name
natural_language_query
filters
signals
icp_snapshot
status
estimated_count
created_at
completed_at
```

And:

```text
prospects
-------------------------
id
organization_id
company_id
search_id
score
priority
status
source
created_at
updated_at
```

These are implementation-level extensions to the documented entities rather than claims that every field already exists in the documentation.

---

# 26. Search API

A clean implementation could expose:

```text
POST /api/prospect-searches
GET  /api/prospect-searches/:id
POST /api/prospect-searches/:id/run
GET  /api/prospect-searches/:id/preview

POST /api/prospect-searches/ai-parse
POST /api/prospect-searches/improve

POST /api/saved-searches
GET  /api/saved-searches
```

The frontend should communicate with these services rather than querying the database directly.

---

# 27. AI search implementation

The natural-language input:

> Find growing technology companies in Lagos hiring 50+ people.

should first be transformed into structured parameters:

```text
{
  industry: ["Technology"],
  location: ["Lagos"],
  company_size: {
    min_employees: 50
  },
  signals: ["Hiring"],
  growth: true
}
```

Then those parameters go through the normal search engine.

This is important because **AI interprets the request; the application's search engine performs the actual search**.

The Copilot architecture explicitly uses controlled tools such as `search_companies()` rather than giving the AI unrestricted database access. 

---

# 28. AI search shouldn't hallucinate results

If the user asks:

> Find 100 companies.

HUNTIQ should not fabricate 100 companies.

If only 43 verified matches exist:

> **43 verified prospects found**

The system should show the actual data available.

This is especially important because your documentation identifies **data acquisition, data quality and useful signal detection** as the difficult part of the product. 

---

# 29. Loading state

When the user executes a search, the interface should show a structured progress state.

For example:

```text
Analyzing your search...
✓ Understanding ICP
✓ Matching company profiles
● Checking buying signals
○ Calculating opportunity scores
○ Ranking prospects
```

This makes the AI process understandable without pretending that every step is instantaneous.

---

# 30. Search execution architecture

```text
USER
 │
 ▼
Natural Language / Filters
 │
 ▼
AI Search Parser
 │
 ▼
Structured Search Criteria
 │
 ├───────────────► User ICP
 │
 ▼
Company Search Engine
 │
 ▼
Company Matches
 │
 ▼
Signal Engine
 │
 ▼
Signal Matches
 │
 ▼
Opportunity Scoring
 │
 ▼
Ranking
 │
 ▼
SEARCH RESULTS
```

That is the central implementation architecture for this page.

---

# 31. Security and authorization

Searches must be workspace-scoped.

Every request should verify:

```text
User
 ↓
Authentication
 ↓
Organization
 ↓
Permission
 ↓
Search
```

The AI should not be allowed to access another organization's companies or contacts.

And if the search eventually creates prospects or opportunities, those are application actions and must go through authorization and audit controls. The documentation establishes the general model of user → authentication → workspace authorization → AI tool authorization → execution → audit log. 

---

# 32. Performance

The page should **not search millions of records in the browser**.

Use:

* Server-side filtering
* Indexed database searches
* Search pagination
* Cached ICP configuration
* Cached search previews
* Background enrichment
* Background signal analysis
* Asynchronous scoring for large searches

The initial search should return quickly with the best available results, while deeper enrichment can happen asynchronously.

---

# 33. What Find Prospects does NOT do

This separation is important.

### Find Prospects

**Defines who to hunt.**

### Search Results

**Shows who HUNTIQ found.**

### Company Intelligence

**Explains the company.**

### Contacts

**Finds the people.**

### Signals

**Explains what changed.**

### Opportunities

**Determines which prospects are commercially important.**

### Outreach

**Helps communicate with them.**

This keeps the HUNT section coherent rather than making Find Prospects a giant combination of every feature.

---

# 34. Final user journey

The complete workflow is:

```text
              FIND PROSPECTS
                    │
        ┌───────────┴───────────┐
        │                       │
    AI Search             Advanced Search
        │                       │
        └───────────┬───────────┘
                    ↓
              Search Preview
                    ↓
             User Reviews
                    ↓
             Find Prospects
                    ↓
             Search Engine
                    ↓
              Company Data
                    +
                Signals
                    +
                  ICP
                    ↓
            Opportunity Scoring
                    ↓
              Ranked Results
                    ↓
            SEARCH RESULTS
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
       Company   Contact   Opportunity
      Intelligence Discovery   Score
```

This is exactly where HUNTIQ begins delivering on its central proposition: **not merely finding companies, but finding companies that are likely to matter to the particular business using the platform.** The onboarding information is intended to control prospect discovery, ICP matching, scoring, signals and AI recommendations. 

## Current HUNT progress

| HUNT page          | Status                                         |
| ------------------ | ---------------------------------------------- |
| **Find Prospects** | 🟢 **Image generated + specification defined** |
| **Companies**      | Next                                           |
| **Contacts**       | Upcoming                                       |
| **Saved Searches** | Upcoming                                       |
| **Research**       | Upcoming                                       |

So **we should not generate another Find Prospects image**. We now have its visual reference and functional specification. **The next image should be the Companies page**, unless you want to revise the Find Prospects reference first.
