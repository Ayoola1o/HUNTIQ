Yes. Before generating any more screens, we should lock down the **functional specification** for each page. That way the image is the visual reference, while the specification tells your AI coding agent **what everything actually does**.

For the **Dashboard**, I would define it like this.

# HUNTIQ — Dashboard Specification

## 1. Purpose

The Dashboard is the user's **sales intelligence command center**.

It should answer five questions immediately:

1. **How is my client-hunting operation performing?**
2. **What new opportunities were discovered?**
3. **Which prospects deserve my attention right now?**
4. **What changed in my market?**
5. **What should I do next?**

It should **not** become a generic analytics page filled with charts.

The primary focus is:

> **Actionable opportunities + intelligence + sales performance.**

---

# 2. Page layout

The dashboard has five major areas:

```text
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │ Header / Search / AI Copilot / Notifications      │
├─────────┴───────────────────────────────────────────────────┤
│                                                             │
│ KPI SUMMARY                                                 │
│ Prospects | Hot Opps | Signals | Deals | Pipeline | Revenue│
│                                                             │
├──────────────────────────────────────┬──────────────────────┤
│                                      │                      │
│ WHAT NEEDS YOUR ATTENTION             │ PIPELINE HEALTH      │
│                                      │                      │
│ Priority opportunities               │ Deal distribution    │
│ New signals                          │ Win rate             │
│ Contact changes                      │ Sales velocity       │
│ Meetings                             │                      │
│                                      ├──────────────────────┤
│                                      │ TOP OPPORTUNITIES    │
│                                      │                      │
├──────────────────────────────────────┴──────────────────────┤
│                                                             │
│ SIGNALS OVER TIME       SIGNAL TYPES       RECENT ACTIVITY │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 3. Global navigation

The sidebar should remain consistent throughout the application.

### COMMAND

* Dashboard
* AI Copilot
* Opportunities
* Signals

### HUNT

* Find Prospects
* Companies
* Contacts
* Saved Searches
* Research

### SELL

* Pipeline
* Campaigns
* Outreach
* Tasks
* Meetings

### INTELLIGENCE

* Market Intelligence
* Reports
* Alerts

### MANAGE

* Team
* Integrations
* Settings

---

# 4. Header

### Greeting

Dynamic:

> Good morning, Ayoola 👋

The greeting should change based on time.

Examples:

> Good afternoon, Ayoola

> Good evening, Ayoola

Under it:

> Here's what changed across your market.

---

## Global search

Search should support:

* Companies
* Contacts
* Opportunities
* Signals
* Research reports

Example:

```text
Search companies, people, signals...
```

Keyboard shortcut:

`⌘ K`

or

`Ctrl K`

---

## AI Copilot

Primary CTA:

### `Ask AI Copilot`

Clicking it opens the AI assistant.

Example:

> "Which prospects should I contact today?"

---

## Notifications

Notifications can include:

* New buying signal
* Prospect score changed
* Contact changed jobs
* Research completed
* Email received
* Meeting approaching
* Task overdue

---

## User menu

Contains:

* Profile
* Workspace
* Team
* Settings
* Billing
* Logout

---

# 5. KPI cards

These are **summary indicators**, not the main purpose of the page.

### Total Prospects

Example:

**12,842**

Supporting information:

> ↑ 18.4% vs previous period

Click:

→ Prospect database

---

### Hot Opportunities

Example:

**284**

Definition:

Prospects whose opportunity score is above the configured hot threshold.

Click:

→ Opportunities filtered to Hot

---

### Buying Signals

Example:

**1,429**

Number of relevant signals detected during the selected period.

Click:

→ Signals

---

### Active Deals

Example:

**86**

Deals currently in the sales pipeline.

Click:

→ Pipeline

---

### Pipeline Value

Example:

**$428,600**

Sum of active opportunity/deal values.

Click:

→ Pipeline

---

### Expected Revenue

This should be calculated from probability-weighted deals.

Example:

```text
Deal Value × Probability
```

If:

$20,000 × 70%

=

$14,000 expected revenue.

---

### Average Deal Size

```text
Total deal value / number of active deals
```

---

# 6. Global date filter

Dashboard data needs a global time filter.

Options:

* Today
* Last 7 days
* Last 30 days
* Last 90 days
* This quarter
* Last quarter
* Custom

The selected period should update relevant KPIs and charts.

However, **static totals such as total companies in the database should not incorrectly change with the time filter**.

That's something your implementation agent must understand.

---

# 7. "What Needs Your Attention"

This is the **most important dashboard component**.

The system should automatically generate actionable items.

Possible item types:

### NEW_SIGNAL

> Hiring surge detected at Acme Technologies.

### SCORE_INCREASE

> Delta Systems increased from 72 → 91.

### CONTACT_CHANGE

> Sarah Johnson moved from Company A to Company B.

### NEW_OPPORTUNITY

> New high-fit company discovered.

### MEETING

> Discovery call today at 2:00 PM.

### FOLLOW_UP

> FinServe hasn't responded after 5 days.

### RESEARCH_COMPLETE

> Research report generated.

---

# 8. Attention item structure

Each item should contain:

**Type**

🔥 High Priority

**Entity**

Acme Technologies

**Score**

94

**Explanation**

> Hiring 38 employees + opened second office + appointed new COO.

**Relevant signals**

`Hiring` `Expansion` `Leadership`

**Recommended contact**

Jane Smith

Head of People

**Primary action**

`Research`

Secondary:

`Contact`

More:

`⋮`

---

# 9. Attention ranking algorithm

Don't just show the newest items.

Rank them.

For example:

```text
Attention Score =
Opportunity Score
× Signal Importance
× Recency
× User Relevance
```

A major event yesterday should rank above an insignificant event 10 minutes ago.

---

# 10. Pipeline Health

This widget provides a quick view of the CRM.

Example stages:

```text
Contacted       18
Meeting         16
Proposal        18
Negotiation     22
Won             12
```

The donut chart is useful here.

But clicking a stage should navigate to:

**Pipeline → filtered stage**

---

## Pipeline metrics

Show:

### Win Rate

```text
Won / Closed Opportunities
```

### Average Sales Cycle

Number of days from qualified → won/lost.

### Pipeline Velocity

Potential revenue generated over time.

---

# 11. Top Opportunities

This is different from "What Needs Your Attention."

### What Needs Your Attention

> **What should I act on now?**

### Top Opportunities

> **Who are my strongest prospects?**

Example:

```text
1  Acme Technologies       94
2  FinServe Ltd            88
3  Delta Systems            81
4  Vertex Solutions         78
5  Nimbus Analytics         76
```

Each item should show:

* Company
* Opportunity score
* Location
* Industry
* Potential value
* Latest signal

Click:

→ Company Intelligence.

---

# 12. Signals Over Time

This is the historical intelligence graph.

Example:

```text
Signals
1500 ┤
     │                         ╭──
1000 ┤                   ╭─────╯
     │             ╭─────╯
 500 ┤       ╭─────╯
     │  ╭────╯
   0 ┼────────────────────────────
       Apr 16       May 1      May 16
```

Data comes from:

`company_signals`

Grouped by date.

Filters:

* All signals
* Hiring
* Funding
* Expansion
* Leadership
* News
* Technology
* Intent

---

# 13. Signals by Type

A donut chart showing distribution.

Example:

**Hiring — 32%**

**Expansion — 22%**

**Leadership — 16%**

**Funding — 12%**

**News — 10%**

**Technology — 8%**

Clicking:

> Hiring

should take the user to:

**Signals → Hiring**

with the appropriate filter applied.

---

# 14. Recent Activity

This is the user's activity stream.

Examples:

> New signal detected for Acme Technologies

> Research report generated for FinServe Ltd

> Email opened by Michael Okoro

> Task completed: Call John Adewale

> New opportunity added

> Deal moved to Proposal

> Jane Smith replied to your email

---

# 15. Important distinction: Signal vs Activity

Your developer should **not mix these databases**.

### Signal

Something that happened in the outside world.

Example:

> Acme posted 30 new jobs.

### Activity

Something the user/team did.

Example:

> Ayoola emailed Acme.

This distinction becomes extremely important later for analytics.

---

# 16. AI recommendations

The dashboard should have a small AI layer.

For example:

### AI Recommendation

> **You have 7 high-intent prospects that haven't been contacted.**

`Review 7 prospects →`

Another:

> **Your strongest signal this week is hiring activity in Financial Services.**

`Explore market →`

Another:

> **3 opportunities have increased by more than 15 points today.**

`View opportunities →`

---

# 17. Dashboard data architecture

The frontend should **not calculate everything from raw data**.

I'd create dashboard API endpoints.

For example:

```text
GET /api/dashboard/summary

GET /api/dashboard/attention

GET /api/dashboard/pipeline-health

GET /api/dashboard/top-opportunities

GET /api/dashboard/signals-over-time

GET /api/dashboard/signals-by-type

GET /api/dashboard/recent-activity

GET /api/dashboard/recommendations
```

Each endpoint can accept:

```text
workspace_id
date_range
team_id
```

---

# 18. Suggested response structure

For example:

```json
{
  "summary": {
    "totalProspects": 12842,
    "hotOpportunities": 284,
    "buyingSignals": 1429,
    "activeDeals": 86,
    "pipelineValue": 428600,
    "expectedRevenue": 176400,
    "averageDealSize": 25812
  }
}
```

---

# 19. Real-time behavior

Some dashboard components should update without refreshing.

For example:

### New signal

A new signal is detected:

> 🔥 New signal detected

Dashboard updates:

* Buying Signals +1
* Attention feed updated
* Company score recalculated
* Top Opportunities reordered if necessary
* Recent Activity updated

Potential technologies later:

* WebSockets
* Server-Sent Events
* Supabase Realtime
* polling as fallback

---

# 20. Loading states

Every major widget needs:

### Skeleton loading

Not:

> Loading...

The UI should preserve the card dimensions while data loads.

---

# 21. Empty states

A new user won't have:

* Prospects
* Signals
* Deals
* Pipeline
* Activities

So don't show empty charts.

Instead:

### No prospects yet

> Your hunting workspace is ready.

**Find your first prospects using AI.**

`Start Hunting`

---

### No signals yet

> Signals will appear here as HUNTIQ monitors your target market.

---

### No deals yet

> Your pipeline will appear here once you qualify a prospect.

---

# 22. Error states

If an intelligence service fails:

> **Market data temporarily unavailable**

Don't crash the dashboard.

Provide:

`Retry`

And keep other widgets operational.

---

# 23. Permissions

Dashboard should respect workspace roles.

### Owner/Admin

Full dashboard.

### Sales Manager

Team-wide metrics.

### Sales Rep

Primarily their own prospects, activities and pipeline.

### Analyst

Read-only intelligence/analytics.

The backend must enforce this—not merely hide frontend elements.

---

# 24. Responsive behavior

### Desktop

Full dashboard shown.

### Tablet

Two-column layout becomes stacked where necessary.

### Mobile

Prioritize:

1. Attention
2. Hot Opportunities
3. Pipeline
4. Signals
5. KPIs

Charts can become horizontally scrollable or simplified.

The dashboard should **not attempt to squeeze the desktop layout onto a phone**.

---

# 25. Performance requirements

This page will eventually contain a lot of data.

Therefore:

* Cache dashboard summaries.
* Paginate attention/activity feeds.
* Lazy-load secondary charts.
* Don't fetch every prospect.
* Don't run AI research when loading dashboard.
* Don't calculate opportunity scores synchronously on every page load.
* Use background jobs for expensive intelligence processing.

Target:

### Initial dashboard render

**< 2 seconds** under normal conditions.

---

# 26. What the dashboard should NOT do

This is important for avoiding overbuilding.

Don't put:

❌ Full company research

❌ Massive contact tables

❌ Complex CRM editing

❌ Campaign builder

❌ Full email inbox

❌ AI research interface

❌ Huge analytics reports

on the dashboard.

Those belong to their respective pages.

The dashboard should answer:

> **"What is happening and what should I do next?"**

---

# 27. Implementation priority

Your AI coding agent should implement in this order:

### P0 — Core

* Layout
* Sidebar
* Header
* KPI cards
* Attention feed
* Top opportunities
* Pipeline health

### P1 — Intelligence

* Signals chart
* Signal distribution
* AI recommendations
* Activity feed

### P2 — UX

* Filters
* Search
* Navigation
* Loading states
* Empty states
* Error states
* Responsive behavior

### P3 — Real-time

* Signal updates
* Score changes
* Notifications
* Activity updates

---

# 28. Most important implementation rule

The **image is not the specification for the business logic**.

The image tells the agent:

> **How it should look.**

This document tells it:

> **What it should do.**

And the existing codebase tells it:

> **What functionality already exists and must be preserved.**

So when we eventually give the coding agent the prompt, we'll combine all three.

### Reference hierarchy

```text
                 HUNTIQ PRODUCT SPEC
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      UI IMAGE       FUNCTIONAL      EXISTING
      REFERENCE      SPECIFICATION     CODE
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                 IMPLEMENTATION
                         │
                         ▼
                    VISUAL QA
```

This will prevent the AI agent from seeing the screenshot and simply building a pretty static dashboard.

**Next page should be `AI Copilot`**, because it is one of HUNTIQ's core differentiators and should be designed before we build the prospect-hunting workflow.
