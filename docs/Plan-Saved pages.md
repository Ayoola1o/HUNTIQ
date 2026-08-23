Absolutely. For the **Saved page**, I would define it as **Saved Searches** within the HUNT section, with monitoring/alerts built into each saved search. The documentation places **Saved Searches** under HUNT, while **Alerts** also exists as a separate Intelligence navigation item.  

One important distinction: the documentation treats **Saved Searches and Alerts as data entities**, and the Monitoring Agent is intended to continuously watch saved prospects.  

# HUNTIQ — Saved Searches Page

## 1. Main purpose

The Saved page answers:

> **"What searches have I saved, and what has changed since I created them?"**

This should **not** be another static list of saved companies.

The page should allow the user to:

* Save prospect searches
* Re-run searches
* Edit search criteria
* Monitor new matching companies
* Monitor new buying signals
* See when a saved search last changed
* Turn monitoring on/off
* Receive alerts
* Organize searches
* Delete/archive searches

The long-term architecture explicitly includes `saved_searches` and `alerts`, while the Monitoring Agent continuously watches saved prospects.  

---

# 2. Page name

In the sidebar:

### **Saved Searches**

I recommend keeping the navigation label **Saved Searches**, rather than simply "Saved", because it tells the user exactly what is being saved.

Page header:

# Saved Searches

Subtitle:

> **Keep your best prospect searches and let HUNTIQ monitor what changes.**

---

# 3. Overall layout

The page should follow the same HUNTIQ visual language as the Dashboard, Find Prospects and Companies pages.

```text
┌──────────────────────────────────────────────────────────────┐
│ Sidebar                                                       │
│                                                              │
│                    SAVED SEARCHES                            │
│                    Search / Copilot / Notifications           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  KPI CARDS                                                   │
│  Saved Searches | Active Monitoring | New Matches | Alerts  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [All] [Active] [Paused] [Recently Updated]                 │
│                                                              │
│  Search...                 Filter      Sort       + New Search│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  SAVED SEARCH LIST                                           │
│                                                              │
│  Search Name     Criteria     Matches    Signals   Status    │
│                                                              │
│  Lagos HR...                                                │
│  Technology...                                               │
│  Recently Funded...                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 4. KPI cards

The page should have a small summary row.

### Saved Searches

Example:

**18**

> Total saved searches

---

### Active Monitoring

Example:

**12**

> Searches currently being monitored

---

### New Matches

Example:

**47**

> New companies matching saved searches

---

### New Signals

Example:

**23**

> Relevant signals detected

---

### Unread Alerts

Example:

**8**

> Alerts requiring attention

These numbers are **UI examples**, not figures specified by the documentation.

They should be dynamically calculated from the user's workspace.

---

# 5. Search/filter bar

Below the KPI cards:

### Search saved searches

Placeholder:

> Search saved searches...

The user could type:

> Lagos

and see:

* Lagos Technology Companies
* Lagos HR Prospects
* Lagos High-Growth Companies

---

# 6. Filter controls

Filters:

### Status

* All
* Active
* Paused
* Archived

### Monitoring

* Monitoring On
* Monitoring Off

### Search Type

* AI Search
* Advanced Search
* Signal Search

### Last Updated

* Today
* Last 7 days
* Last 30 days
* Older

---

# 7. Main tabs

I recommend four tabs:

### All Searches

Every saved search.

### Active

Only searches currently being monitored.

### Needs Attention

Searches with new matches or important signals.

### Paused

Searches that are saved but not currently monitored.

This keeps the page operational rather than becoming a simple archive.

---

# 8. Saved Search card

Each search should be displayed as a rich card rather than an extremely dense table.

Example:

## Lagos Technology Growth Companies

**AI Search**

> Technology companies in Lagos with 50–500 employees showing strong growth and hiring signals.

### Filters

`Technology` `Lagos` `50–500 employees`

### Signals

🔥 Hiring
📈 Expansion
👤 Leadership

### Current Matches

**184 companies**

### New Matches

**+12 this week**

### Opportunity

**68 high-fit companies**

### Last updated

**12 minutes ago**

### Monitoring

🟢 **Active**

Actions:

**View Results**
**Edit**
**Pause** `⋮`

---

# 9. Why this card matters

The user should be able to understand the search without opening it.

The card answers:

> **What am I searching for?**

> **How many matches exist?**

> **What changed?**

> **Is HUNTIQ still watching it?**

That is the difference between a useful Saved Searches page and a conventional "saved items" page.

---

# 10. New Search button

Primary CTA:

### **+ New Search**

Clicking it should take the user to:

### Find Prospects

The user creates the search there and then chooses:

> **Save Search**

So we don't duplicate the entire Find Prospects UI inside Saved Searches.

Flow:

```text
Saved Searches
      ↓
+ New Search
      ↓
Find Prospects
      ↓
Configure search
      ↓
Find Prospects
      ↓
Review results
      ↓
Save Search
      ↓
Saved Searches
```

---

# 11. Saving a search

After the user runs a search on Find Prospects, provide:

### Save this search

Modal:

**Search name**

> Lagos Technology Growth Companies

**Description**

> Technology companies in Lagos showing hiring and expansion activity.

Then:

### Monitor this search?

`ON`

### Alert me when:

☑ New companies match
☑ High-opportunity company appears
☑ Hiring signal detected
☑ Expansion signal detected
☑ Leadership change detected
☐ Funding detected

Then:

### Save Search

---

# 12. Monitoring

This is where Saved Searches becomes much more powerful.

When monitoring is enabled:

```text
Saved Search
      ↓
Monitoring Agent
      ↓
New company?
      ↓
New signal?
      ↓
Score changed?
      ↓
Alert user
```

The documentation specifically describes a **Monitoring Agent** that continuously watches saved prospects. 

---

# 13. New company alert

Suppose the saved search is:

> Lagos Technology Companies

A new company enters the database.

HUNTIQ generates:

### New Match

> **CloudNova Technologies** matches your saved search.

**Opportunity Score: 87**

Signals:

* Hiring
* Expansion

Actions:

**View Company**

**View Search**

---

# 14. Signal alert

Suppose an existing company receives a new signal.

The saved search could generate:

### New Signal

> **Acme Technologies** just triggered a hiring signal.

> 38 new job postings detected.

**Opportunity score: 94**

### Why it matters

> Company growth activity increased significantly.

Button:

**Investigate**

This connects Saved Searches to the Signals engine.

---

# 15. Score-change alert

Another important alert:

### Opportunity score changed

> Acme Technologies increased from **74 → 92**.

Reason:

* Hiring surge
* Expansion
* New executive

Button:

**View Intelligence**

This is consistent with the broader architecture where new signals can cause opportunity scores to change and prospects to be re-ranked. 

---

# 16. Search detail page

Clicking:

### View Results

should open the saved search's results.

At the top:

# Lagos Technology Growth Companies

> **184 companies**

Then:

```text
[Search Criteria]
[Results]
[New Matches]
[Signals]
[History]
```

---

# 17. Search criteria panel

The user can see the original search configuration.

### Company criteria

Industry:

**Technology**

Location:

**Lagos, Nigeria**

Employees:

**50–500**

Revenue:

**$10M–$50M**

---

### Signals

🔥 Hiring

📈 Expansion

👤 Leadership

---

### ICP

**Peak Consulting ICP**

This is important because saved searches should retain the **ICP context used when they were created**.

---

# 18. Edit Search

Click:

### Edit Search

The user returns to the Find Prospects configuration with the existing criteria already populated.

For example:

```text
Industry: Technology
Location: Lagos
Employees: 50–500
Signals: Hiring + Expansion
```

They can change:

> 50–500

to:

> 100–1,000

Then:

### Update Search

---

# 19. Pause Monitoring

The user should be able to click:

### Pause Monitoring

The search remains saved.

But:

```text
Search
   ✓ Saved
   ✕ Monitoring
```

No new alerts are generated.

This is different from deleting the search.

---

# 20. Resume Monitoring

Paused search:

### Resume Monitoring

changes:

```text
Monitoring: OFF
```

to:

```text
Monitoring: ON
```

The Monitoring Agent begins watching it again.

---

# 21. Search history

Each saved search should have a history.

Example:

### Search Activity

**Today — 10:42 AM**

> 12 new companies matched.

**Today — 8:10 AM**

> 3 new hiring signals detected.

**Yesterday**

> Acme Technologies score increased from 78 → 91.

**May 15**

> Search criteria updated.

This gives the user confidence that the system is actively working.

---

# 22. New Matches section

The search detail page should show:

### New Matches

Example:

| Company   | Score | Signal     | Detected |
| --------- | ----: | ---------- | -------- |
| CloudNova |    91 | Hiring     | 12m ago  |
| BrightPay |    88 | Expansion  | 1h ago   |
| Medix     |    84 | Leadership | 3h ago   |

Clicking a company opens Company Intelligence.

---

# 23. Alert settings

Each saved search should have its own alert configuration.

### Alert me when:

**New match**

`ON`

**High opportunity**

`ON`

**Hiring**

`ON`

**Expansion**

`ON`

**Funding**

`OFF`

**Leadership**

`ON`

**Technology**

`OFF`

---

# 24. Alert frequency

Allow:

### Immediately

For important signals.

### Daily digest

Combine changes into one notification.

### Weekly digest

For less urgent searches.

This should be configurable.

The documentation places automated monitoring and alerts in the later intelligence expansion, so these can be implemented progressively rather than blocking the initial Saved Searches UI. 

---

# 25. Notifications

Saved Search alerts should feed the global notification system.

For example:

🔔 **New saved-search match**

> Acme Technologies matched "Lagos HR Prospects".

🔔 **Signal detected**

> FinServe triggered an expansion signal.

🔔 **Score changed**

> Delta Systems increased from 72 → 91.

The dashboard's notification model already anticipates buying signals, score changes, contact changes and completed research. 

---

# 26. Saved Search data model

The documentation explicitly includes:

```text
saved_searches
alerts
```

in the database architecture. 

I recommend implementing the saved search entity roughly as:

```text
saved_searches
-------------------------
id
organization_id
created_by
name
description
search_type
natural_language_query
filters
signals
icp_snapshot
monitoring_enabled
alert_frequency
last_run_at
last_match_count
new_match_count
status
created_at
updated_at
```

And:

```text
alerts
-------------------------
id
organization_id
saved_search_id
company_id
signal_id
alert_type
title
description
priority
is_read
created_at
```

These fields are an implementation proposal; the documentation establishes the entities and their role, not this exact schema.

---

# 27. Search execution

When a saved search runs:

```text
Saved Search
      ↓
Load criteria
      ↓
Load ICP snapshot
      ↓
Company Search
      ↓
Signal Engine
      ↓
Opportunity Scoring
      ↓
Compare with previous results
      ↓
Identify new/changed records
      ↓
Generate alerts
      ↓
Update saved search
```

The Prospecting, Signal, Scoring and Monitoring agents naturally map onto this architecture. 

---

# 28. Detecting new matches

You need a mechanism to distinguish:

### Existing match

from:

### New match

For example:

```text
saved_search_results
-------------------------
saved_search_id
company_id
first_matched_at
last_matched_at
last_score
last_signal_hash
```

Then HUNTIQ can determine:

```text
Company not previously matched
        ↓
NEW MATCH
```

or:

```text
Company already matched
+
Signal changed
        ↓
UPDATED MATCH
```

---

# 29. Search deduplication

If a company matches three saved searches:

```text
Lagos Technology
High Growth Companies
Hiring Companies
```

HUNTIQ should **not create three separate company records**.

There should be one company:

```text
Acme Technologies
```

with three search memberships.

Conceptually:

```text
Company
   ↑
   │
Search Match
   │
   ├── Search A
   ├── Search B
   └── Search C
```

---

# 30. API implementation

A practical API:

```text
GET    /api/saved-searches
POST   /api/saved-searches
GET    /api/saved-searches/:id
PATCH  /api/saved-searches/:id
DELETE /api/saved-searches/:id

POST   /api/saved-searches/:id/run
POST   /api/saved-searches/:id/pause
POST   /api/saved-searches/:id/resume

GET    /api/saved-searches/:id/results
GET    /api/saved-searches/:id/activity
GET    /api/saved-searches/:id/alerts

PATCH  /api/saved-searches/:id/alert-settings
```

---

# 31. Background jobs

The monitoring system should **not depend on the user opening the page**.

Use scheduled/background jobs:

```text
Scheduler
   ↓
Load active saved searches
   ↓
Run search
   ↓
Compare results
   ↓
Detect changes
   ↓
Create alerts
   ↓
Send notifications
```

For example:

```text
every 15 minutes
```

for high-priority monitoring.

Or:

```text
daily
```

for less important searches.

The exact frequency should eventually depend on data-source freshness and subscription tier.

---

# 32. Permissions

Saved Searches must be workspace-aware.

Possible roles:

### Owner/Admin

Can view, edit, delete all saved searches.

### Sales Manager

Can view team searches and create shared searches.

### Sales Rep

Can create personal searches and access permitted shared searches.

### Analyst

Can view/search but may have limited modification permissions.

The backend must enforce permissions; the frontend should not merely hide buttons.

---

# 33. Empty state

For a new user:

# No saved searches yet

> Save a prospect search and let HUNTIQ keep watching it for you.

Primary button:

### **Find Prospects**

Secondary explanation:

> Your saved searches can monitor new companies, buying signals and opportunity changes.

This creates a direct connection to the Find Prospects page.

---

# 34. Loading state

Use skeleton cards/table rows.

For example:

```text
████████████████
████████
████████████████████
```

Do not use a full-page:

> Loading...

The dashboard documentation specifically establishes skeleton loading as the preferred pattern. 

---

# 35. Error state

If monitoring fails:

### Monitoring temporarily unavailable

> HUNTIQ couldn't update this saved search.

Buttons:

**Retry**

**View Last Results**

The old results should remain visible rather than disappearing.

---

# 36. What the Saved Searches page should NOT do

It should not become:

❌ A second Find Prospects page
❌ A full Signals page
❌ A full Companies page
❌ A notification inbox
❌ A research center
❌ A CRM pipeline

Instead:

> **Saved Searches = persistent prospecting workflows + monitoring.**

That is its identity.

---

# 37. Relationship with the other HUNT pages

The complete HUNT workflow becomes:

```text
FIND PROSPECTS
      │
      │ create search
      ▼
SEARCH RESULTS
      │
      │ save
      ▼
SAVED SEARCHES
      │
      │ monitor
      ▼
NEW MATCH / SIGNAL
      │
      ▼
COMPANIES
      │
      ▼
CONTACTS
      │
      ▼
RESEARCH
      │
      ▼
OPPORTUNITY
```

This fits the larger product loop:

**Discover → Research → Detect Signals → Score → Prioritize → Find Decision Maker → Outreach → Pipeline → Conversion.** 

---

# 38. Recommended Saved page priority

### P0 — Core

Build first:

* Saved Search list
* Create/save search
* Search criteria
* View results
* Edit search
* Delete/archive
* Search status
* Basic filtering
* Workspace permissions

### P1 — Monitoring

Then:

* Monitoring toggle
* New matches
* Search history
* Signal changes
* Score changes

### P2 — Alerts

Then:

* Alert rules
* Notification preferences
* Email notifications
* Daily/weekly digest
* Read/unread alerts

### P3 — Advanced intelligence

Later:

* AI-generated search recommendations
* Automatic search optimization
* Predictive alerting
* "You should create this search" recommendations
* Cross-search opportunity detection

The documentation's own roadmap puts **signal monitoring and alerts in Phase 2**, while the Phase 1 Intelligence MVP focuses on prospect discovery, company intelligence, contact discovery, scoring, signals and saving prospects. 

---

## The key design principle

The Saved Searches page should feel like:

> **"I told HUNTIQ what kind of companies I want. Now HUNTIQ keeps watching the market for me."**

That is much more valuable than simply storing a filter.

And it gives HUNTIQ an important **always-on intelligence layer**: the user creates the hunting criteria once, while the Monitoring Agent continuously watches for new prospects and meaningful changes. 

### Current HUNT progress

| Page               | Status                                            |
| ------------------ | ------------------------------------------------- |
| Find Prospects     | ✅ Defined                                         |
| Companies          | ✅ Defined                                         |
| Contacts           | ⏳ Image generation pending                        |
| **Saved Searches** | ✅ **Content + function + implementation defined** |
| Research           | Next major page                                   |

**For the eventual Saved Searches image, the visual should therefore emphasize saved-search cards, monitoring status, new matches, alerts, search criteria, and a prominent "+ New Search" action—not just a generic table of saved records.**
