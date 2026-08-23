Absolutely. Before we generate the **next image**, we should document the **Signals page** in the same way we did for Opportunities: **content → function → implementation**.

The important distinction is that **Signals is not the Opportunities page**. Signals detects and explains what has changed in the market; Opportunities uses those signals, together with ICP fit and other factors, to determine which prospects deserve sales attention. Your documentation explicitly separates the signal layer from the opportunity-scoring layer. 

# HUNTIQ — Signals Page Specification

## 1. Purpose

The Signals page is HUNTIQ's **real-time market intelligence center**.

Its core question is:

> **What has changed across my target market that could create a sales opportunity?**

A signal is an observable event involving a company or market that may indicate a business need.

Examples from your HUNTIQ configuration include:

* Hiring
* Funding
* Expansion
* Leadership changes
* Technology changes
* News
* Compliance/regulatory events
* Custom signals

These signal categories are already part of the user's Hunting Preferences during onboarding. 

---

# 2. The Signals page shown in our image

The generated design contains:

```text
Global Header
     ↓
Page Header
     ↓
Signal KPI Cards
     ↓
Signal Type Navigation / Filters
     ↓
Main Signal Table          Signal Intelligence Drawer
     ↓
Analytics
     ↓
Recent Signal Activity
```

The right-hand drawer is particularly important because clicking a signal should not merely show a title. It should explain:

> **What happened?**
>
> **Why does it matter?**
>
> **How strong is the evidence?**
>
> **What should I do?**

---

# 3. Page header

### Title

# Signals

Subtitle:

> **Real-time buying signals and market events across your target market.**

This immediately tells the user that this page is about **events and changes**, not companies generally.

### Header controls

The image contains:

* Date range
* Filters
* Global search
* Ask AI Copilot
* Notifications
* User/workspace menu

The global search should continue supporting companies, contacts, opportunities, signals and research reports, as established in the Dashboard specification. 

---

# 4. Signal KPI cards

The first row provides a quick picture of market activity.

## Card 1 — Total Signals

Example:

**1,429**

> ↑ 31.2% vs last 30 days

### Function

Number of signals detected within the current workspace/filter/date range.

---

## Card 2 — New Signals

Example:

**184**

> ↑ 28.7% vs last 30 days

### Function

Signals detected during the selected recent period.

This helps distinguish the **entire signal database** from what has happened recently.

---

## Card 3 — High Impact Signals

Example:

**97**

> ↑ 26.4%

### Function

Counts signals whose calculated impact is above the configured threshold.

These are the signals salespeople should pay particular attention to.

---

## Card 4 — Companies Affected

Example:

**386**

### Function

Unique companies associated with the current signals.

This is important because:

```text
1 company
+
5 signals
=
5 signals
but
1 affected company
```

---

## Card 5 — Hot Companies

Example:

**68**

### Function

Companies associated with signals that meet HUNTIQ's high-priority criteria.

This should eventually connect directly to the Opportunities page.

---

## Card 6 — Average Signal Impact

Example:

**78/100**

### Function

Average impact score of the currently displayed signals.

This gives the user a quick indication of whether the market activity they're seeing is mostly weak noise or meaningful commercial events.

---

# 5. Signal type navigation

The image has:

* All Signals
* Hiring
* Funding
* Expansion
* Leadership
* Technology
* News
* Compliance
* Other

These should function as **instant filters**.

For example:

### Hiring

Shows only:

```text
signal_type = hiring
```

### Funding

Shows:

```text
signal_type = funding
```

### Expansion

Shows:

```text
signal_type = expansion
```

and so on.

This directly corresponds with the signal types established during onboarding. 

---

# 6. Advanced Filters

The **Filters** button should open a filter drawer.

### Filters

**Signal**

* Signal type
* Impact
* Confidence
* Importance
* Date detected
* Date updated

**Company**

* Industry
* Location
* Company size
* Revenue
* Company score
* Opportunity status

**Source**

* LinkedIn
* Company website
* News
* Jobs
* Regulatory source
* Technology source
* Other

**Signal recency**

```text
Last 24 hours
Last 7 days
Last 30 days
Last 90 days
Custom
```

**Signal strength**

```text
Low
Medium
High
Very High
```

---

# 7. Main signal table

This is the main working area.

The image uses these columns:

| Column         | Purpose                 |
| -------------- | ----------------------- |
| Signal         | What happened           |
| Company        | Who it happened to      |
| Type           | Hiring, funding, etc.   |
| Impact         | Importance              |
| Detected       | When HUNTIQ detected it |
| Why It Matters | AI interpretation       |
| Source         | Evidence/source         |
| Actions        | Open/more               |

---

# 8. Signal row

Example:

### Hiring Surge

> **38 new job postings**

Company:

**Acme Technologies**

Location:

**Lagos, Nigeria**

Type:

**Hiring**

Impact:

**High**

Detected:

**2h ago**

Why it matters:

> Rapid hiring across multiple departments indicates growth and potential need for new solutions.

Source:

LinkedIn Jobs

---

# 9. Signal title

The signal title should be **event-oriented**, not generic.

Good:

> Hiring Surge

> New Office Opened

> Leadership Change

> Funding Raised

> Technology Change

> Regulatory Change

Bad:

> Acme Technologies Information

The signal must describe **what changed**.

---

# 10. Signal impact

The generated design uses a visual impact indicator.

Possible levels:

### Low

0–24

### Medium

25–49

### High

50–74

### Very High

75–100

The exact thresholds can remain configurable.

The underlying signal should have an impact/importance score rather than simply a color.

---

# 11. Detection time

Examples:

> 2h ago

> 5h ago

> 1d ago

> May 16, 2025

The system should store the actual timestamp and render relative time where appropriate.

---

# 12. "Why It Matters"

This is one of the most valuable parts of the page.

The signal shouldn't just say:

> **38 job postings**

It should interpret the commercial relevance:

> Rapid hiring indicates business growth and potential need for solutions in talent management, HR consulting, and operational scaling.

This is where the **Signal Agent** and later AI reasoning become useful.

Your architecture specifically defines a specialized **Signal Agent** whose responsibility is to detect meaningful events. 

But we must keep the interpretation grounded in evidence.

---

# 13. Source

Every important signal should have an evidence source.

Examples:

* LinkedIn Jobs
* Company website
* Company newsroom
* Regulatory publication
* News source
* Technology data source

The signal data model explicitly includes:

```text
signal_type
company_id
source
detected_at
confidence
importance
description
```



This is essential to HUNTIQ's credibility.

---

# 14. Signal Intelligence Drawer

When a user clicks a signal, open the right-hand drawer shown in the image.

For example:

# Hiring Surge

**Acme Technologies**

Lagos, Nigeria

### High Impact Signal 🔥

Then:

## Signal Overview

```text
Type             Hiring
Detected         May 16, 2025 • 2:34 PM
Impact           92/100
Confidence       High (92%)
Source           LinkedIn Jobs
First Detected   May 16, 2025
Last Updated     May 16, 2025
```

---

# 15. What Happened

This section gives the factual event.

Example:

> **Acme Technologies posted 38 new job openings across 7 departments in the last 7 days.**

This should be evidence-derived.

---

# 16. Why It Matters

Then HUNTIQ interprets the event.

Example:

> Rapid hiring indicates business growth and potential need for solutions in talent management, HR consulting, and operational scaling.

This is an **AI interpretation**, not the raw event.

We should visually distinguish factual evidence from AI interpretation where practical.

---

# 17. Affected Departments

The generated design includes:

### Affected Departments

Top 5:

* Engineering — 14
* Product — 8
* Sales — 6
* Marketing — 5
* Operations — 5

This is particularly useful for a hiring signal because it helps determine **what kind of growth is occurring**.

---

# 18. Recommended Action

The signal should eventually answer:

> **What should I do with this information?**

Example:

> Contact the Head of People or COO to discuss how we can support their hiring and growth goals.

Then:

### View Company

and:

### Start Outreach

This turns the signal into action.

That fits the central HUNTIQ philosophy:

**Discover → Research → Detect Signals → Score → Prioritize → Find Decision Maker → Generate Approach → Outreach → Pipeline → Conversion.** 

---

# 19. Signal → Opportunity connection

This is extremely important.

A signal **does not automatically equal an opportunity**.

Instead:

```text
Signal
   ↓
Signal relevance
   ↓
Company ICP fit
   ↓
Other signals
   ↓
Opportunity scoring
   ↓
Opportunity
```

For example:

**Hiring Surge**

alone might be a moderate signal.

But:

```text
Hiring Surge
+
New COO
+
Expansion
+
ICP Fit 95%
```

could produce:

### Opportunity Score: 94

This is where the Signals page feeds the Opportunities page.

---

# 20. Signals by Type

At the bottom-left of the generated design is a donut chart.

Example:

```text
Hiring          482 (34%)
Expansion       246 (17%)
Leadership      218 (15%)
Funding         186 (13%)
Technology      142 (10%)
News             95 (7%)
Compliance       60 (4%)
Other             0
```

### Function

Shows what kinds of market events are dominating the user's target market.

Clicking a segment should filter the signal table.

---

# 21. Signal Impact Distribution

The second chart shows:

```text
Low          86
Medium      242
High        586
Very High   515
```

### Function

Answers:

> **How important are the signals we're detecting?**

Clicking **Very High** should filter the table to very-high-impact signals.

---

# 22. Recent Signal Activity

The bottom-right panel shows the newest signal events.

Example:

> Hiring surge detected for Acme Technologies

> FinServe Ltd raised $12M Series B

> New COO appointed at Delta Systems

> Vertex Solutions opened new office

> Nimbus Analytics implemented AWS

### Function

A condensed live feed.

Clicking an item opens the signal drawer.

---

# 23. Pagination

The signal table should not load thousands of records at once.

Example:

> Showing 1 to 8 of 1,429 signals

Then:

```text
<  1  2  3  ...  179  >
```

Backend pagination should be used.

---

# 24. Bulk actions

The checkboxes in the generated design should support:

* Save signals
* Create alert
* Add company to prospects
* Create opportunity
* Export
* Mark reviewed

But these should be permission-controlled.

---

# 25. AI Copilot integration

The user should be able to ask:

> "What are the most important signals this week?"

or:

> "Show me companies with hiring and expansion signals."

or:

> "Which signals indicate a likely need for HR consulting?"

or:

> "Find the top opportunities generated by signals in Lagos."

The Copilot can then query the signal system rather than having its own disconnected dataset.

The documented Copilot MVP specifically includes signal lookup alongside prospect, company and opportunity lookup. 

---

# 26. Database implementation

The core signal table should be:

```text
signals
-------------------------
id
organization_id
company_id
signal_type
title
description
source
source_url
detected_at
first_detected_at
last_updated_at
confidence
importance
impact_score
status
metadata
created_at
updated_at
```

Your existing documentation establishes the essential fields:

```text
signal_type
company_id
source
detected_at
confidence
importance
description
```



I'm adding the other fields here as **implementation extensions**, not claiming they were already specified in the documentation.

---

# 27. Signal processing architecture

The flow should be:

```text
External Data Sources
        ↓
Data Ingestion
        ↓
Normalization
        ↓
Company Matching
        ↓
Signal Detection
        ↓
Signal Classification
        ↓
Confidence Score
        ↓
Impact Score
        ↓
Signal Database
        ↓
Opportunities / Alerts / Copilot
```

The **Signal Agent** is responsible for detecting meaningful events, while the **Scoring Agent** evaluates opportunity probability. 

---

# 28. Avoid duplicate signals

This will be important in the real implementation.

Suppose three sources report:

> Acme opened 38 jobs.

HUNTIQ should not show:

```text
Signal 1 — Hiring Surge
Signal 2 — Hiring Surge
Signal 3 — Hiring Surge
```

Instead:

### One canonical signal

with:

**3 supporting sources**

and:

**Confidence: 96%**

This keeps the interface useful rather than noisy.

---

# 29. Signal lifecycle

A signal should have a lifecycle:

```text
Detected
   ↓
Verified
   ↓
Active
   ↓
Reviewed
   ↓
Converted to Opportunity
   ↓
Archived
```

Not every signal has to become an opportunity.

---

# 30. Loading state

Use skeleton loading for:

* KPI cards
* Signal table
* Charts
* Drawer

The documentation explicitly requires skeleton loading rather than a generic "Loading..." message. 

---

# 31. Empty state

For a new workspace:

> **No signals yet**

> Signals will appear here as HUNTIQ monitors your target market.

That exact empty-state principle is already specified in your Dashboard documentation. 

---

# 32. Error state

If the market intelligence service fails:

> **Market signals temporarily unavailable**

**Retry**

The rest of HUNTIQ should continue working rather than the entire page crashing. 

---

# 33. Permissions

### Owner/Admin

Full access.

### Sales Manager

Team-wide signal visibility.

### Sales Rep

Signals relevant to their assigned/target accounts.

### Analyst

Read-only intelligence.

The backend must enforce this rather than simply hiding UI controls. 

---

# 34. Performance

The Signals page could eventually contain millions of records, so:

* Server-side pagination
* Indexed `organization_id`
* Indexed `company_id`
* Indexed `signal_type`
* Indexed `detected_at`
* Cached KPI aggregations
* Background signal processing
* Incremental updates
* Lazy-loaded charts
* Virtualized table for very large datasets

We should **not run the AI detection process when the user opens the Signals page**.

Signal detection should happen in background jobs.

---

# 35. Real-time behavior

Eventually, the page should update when a new signal arrives.

Example:

> 🔴 **New high-impact signal**

**Acme Technologies — Hiring Surge**

> 38 new jobs detected.

The user should be able to click:

**View Signal**

or:

**Create Opportunity**

This fits the planned real-time layer of the product, where signal updates, score changes, notifications and activity updates happen independently of page loading. 

---

# 36. Most important relationship

The architecture should ultimately be:

```text
                 MARKET
                   │
                   ↓
             DATA SOURCES
                   │
                   ↓
            SIGNAL DETECTION
                   │
        ┌──────────┴──────────┐
        ↓                     ↓
    SIGNAL PAGE          ALERT SYSTEM
        │
        ↓
  COMPANY + ICP MATCH
        │
        ↓
 OPPORTUNITY SCORING
        │
        ↓
 OPPORTUNITIES PAGE
        │
        ↓
 DECISION MAKER
        │
        ↓
    OUTREACH
        │
        ↓
    PIPELINE
```

That is the core HUNTIQ architecture.

---

## The distinction we should preserve

### Dashboard

**"What is happening and what should I do next?"**

### Signals

**"What changed in the market?"**

### Opportunities

**"Which of those changes represent the best sales opportunities?"**

### Find Prospects

**"Who should I target?"**

### Company Intelligence

**"What do I need to know about this company?"**

### Contacts

**"Who should I contact?"**

### Outreach

**"What should I say?"**

That separation will keep HUNTIQ from turning into one giant generic CRM.

**Now that the Signals page content, functionality and implementation are defined, the generated Signals image we already produced can serve as its visual reference. The next image should therefore be the next page in the HUNTIQ navigation—not another Signals variation.**
s