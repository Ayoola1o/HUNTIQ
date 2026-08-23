# HUNTIQ — Reports Page Specification

The Reports page should turn all the intelligence and CRM activity in HUNTIQ into **decision-ready reports**.

The key distinction:

* **Dashboard** → What needs my attention now?
* **Market Intelligence** → What is happening in the market?
* **Reports** → What happened, why did it happen, and what should I learn or act on?

It should support both **AI-generated reports** and **repeatable scheduled reports**.

---

# 1. Page purpose

The user should be able to answer:

* How did our sales operation perform?
* How many prospects did we discover?
* Which industries generated the most opportunities?
* Which signals produced actual conversations?
* Which campaigns worked?
* Which salespeople performed best?
* Which prospects converted?
* What happened in the market this week/month?
* What opportunities are being missed?
* What should we do next?

---

# 2. Main page layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Reports                         Search   Ask AI   Notifications│
│ Turn your sales and market data into actionable intelligence │
├──────────────────────────────────────────────────────────────┤
│ [Generate Report] [Schedule Report] [Export]                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ REPORT OVERVIEW                                              │
│                                                              │
│ Reports Generated │ Scheduled │ Shared │ This Month          │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ FEATURED REPORT                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Weekly Sales Intelligence Report                         │ │
│ │ Aug 17 – Aug 23                                          │ │
│ │                                                          │ │
│ │ Prospects     Signals      Opportunities     Pipeline    │ │
│ │ 1,284         842          73                $428K       │ │
│ │                                                          │ │
│ │ AI Executive Summary                                     │ │
│ │ ...                                                      │ │
│ │                                                          │ │
│ │ [Open Report] [Share] [Export PDF]                       │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ REPORT TYPES                                                 │
│                                                              │
│ Sales │ Market │ Pipeline │ Prospect │ Campaign │ AI Brief   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ RECENT REPORTS                                                │
│                                                              │
│ Name | Type | Period | Created | Owner | Status | Actions    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ SCHEDULED REPORTS                                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 3. Header

### Title

**Reports**

Subtitle:

> Turn your sales, prospecting and market intelligence into actionable insights.

Primary actions:

### `+ Generate Report`

### `Schedule Report`

### `Ask AI`

### `Export`

---

# 4. Report overview cards

These are lightweight statistics.

### Reports Generated

Example:

**48**

---

### Scheduled Reports

**6**

---

### Shared Reports

**17**

---

### Reports This Month

**12**

---

# 5. Report categories

The user should be able to quickly start from a template.

## Sales Performance

Shows:

* Prospects discovered
* Contacts reached
* Replies
* Meetings
* Opportunities
* Won deals
* Revenue
* Conversion rates
* Sales velocity

---

## Market Intelligence

Shows:

* Market movements
* Signal volume
* Industry trends
* Geographic trends
* Emerging opportunities
* Major companies
* Buying-signal changes

---

## Pipeline Report

Shows:

* Pipeline value
* Stage distribution
* New opportunities
* Won/lost
* Stalled deals
* Probability-weighted revenue
* Pipeline velocity

---

## Prospecting Report

Shows:

* Companies discovered
* Contacts discovered
* ICP matches
* High-intent companies
* Hot opportunities
* New buying signals
* Conversion by source

---

## Campaign Report

Shows:

* Contacts targeted
* Emails sent
* Delivered
* Opened
* Replied
* Meetings generated
* Opportunities generated
* Conversion rate

---

## Contact Intelligence Report

Shows:

* New decision-makers
* Job changes
* High-influence contacts
* Uncontacted decision-makers
* Engagement
* Contact coverage

---

## AI Executive Brief

This should be one of the most important templates.

The user can simply select:

> **Generate Executive Brief**

HUNTIQ produces:

### Executive Summary

### Key Wins

### Major Risks

### Market Changes

### Top Opportunities

### Pipeline Health

### Sales Activity

### Recommended Actions

---

# 6. Generate Report workflow

Click:

**Generate Report**

Open a wizard.

### Step 1 — Report type

```text
Sales Performance
Market Intelligence
Pipeline
Prospecting
Campaign
Contact Intelligence
Custom AI Report
```

---

### Step 2 — Time period

* Today
* Last 7 days
* Last 30 days
* Last 90 days
* This month
* This quarter
* Custom

---

### Step 3 — Scope

Choose:

### Entire workspace

or:

### Team

or:

### User

or:

### Pipeline

or:

### Industry

or:

### Geography

or:

### Campaign

---

### Step 4 — Metrics

Allow the user to choose what matters.

For example:

```text
☑ Prospects
☑ Buying Signals
☑ Opportunities
☑ Pipeline
☑ Revenue
☐ Contacts
☐ Campaigns
☐ Meetings
```

---

### Step 5 — AI analysis

Options:

**None**

Only raw metrics.

**Summary**

AI summarizes results.

**Deep Analysis**

AI explains:

* trends
* anomalies
* risks
* opportunities
* recommendations

---

### Step 6 — Generate

### `Generate Report`

The report runs asynchronously.

Show:

> Preparing your report...

with progress stages:

```text
Collecting data
       ↓
Calculating metrics
       ↓
Analyzing trends
       ↓
Generating insights
       ↓
Preparing report
```

---

# 7. Report viewer

Clicking a report opens a dedicated report view.

Example:

# Weekly Sales Intelligence Report

**August 17–23, 2026**

Generated:

August 23, 2026

Owner:

Ayoola

---

## Executive Summary

> Your prospecting activity increased 24% this week. Financial Services generated the highest number of qualified opportunities, while hiring signals remained the strongest buying indicator.

---

# 8. Report KPI section

Example:

| Metric        | Current | Previous | Change |
| ------------- | ------: | -------: | -----: |
| Prospects     |   1,284 |    1,031 | +24.5% |
| Signals       |     842 |      713 | +18.1% |
| Opportunities |      73 |       61 | +19.7% |
| Pipeline      |   $428K |    $381K | +12.3% |
| Meetings      |      28 |       21 | +33.3% |

The calculations should come from the backend—not AI.

---

# 9. Trend analysis

Example:

### Opportunity creation

A chart showing opportunities created across the selected period.

Then:

### AI interpretation

> Opportunity creation accelerated during the second half of the reporting period, largely driven by hiring and expansion signals.

The chart is factual.

The AI interpretation is clearly separated.

---

# 10. Top opportunities

The report should identify the strongest opportunities during the period.

Example:

### Top 5 Opportunities

**1. Acme Technologies**

Score: 94

Potential value: $35K

Primary signal: Hiring

---

**2. FinServe**

Score: 91

Potential value: $28K

Primary signal: Expansion

---

Each links directly to Company Intelligence.

---

# 11. Market section

For reports containing market intelligence:

### Market Overview

**Top industries**

1. Financial Services
2. Technology
3. Healthcare

### Strongest signal

**Hiring**

### Fastest-growing trend

**AI & Automation**

### Geographic hotspot

**Lagos**

Then:

### AI interpretation

> Financial Services is currently producing the highest concentration of ICP-aligned opportunities.

---

# 12. Pipeline section

Show:

```text
Qualified       $120K
Meeting         $85K
Proposal        $140K
Negotiation     $83K
──────────────────────
Total           $428K
```

And:

### Pipeline risks

Example:

> 8 opportunities have had no activity for more than 14 days.

> 3 high-value opportunities have no identified decision-maker.

Those should become clickable actions.

---

# 13. Sales funnel

Example:

```text
1,284 Prospects
       ↓
  384 Contacted
       ↓
   126 Engaged
       ↓
    73 Qualified
       ↓
    28 Meetings
       ↓
    14 Proposals
       ↓
     6 Won
```

Show conversion rates between stages.

---

# 14. Signal → Opportunity attribution

This is a **very important HUNTIQ metric**.

Don't just report:

> 842 signals.

Show:

> Which signals actually generated business?

Example:

| Signal     | Opportunities | Pipeline |
| ---------- | ------------: | -------: |
| Hiring     |            31 |    $184K |
| Expansion  |            18 |    $102K |
| Leadership |             9 |     $61K |
| Funding    |             8 |     $48K |
| Technology |             7 |     $33K |

This lets users discover:

> **Which signals are actually valuable to my business?**

That data should eventually improve HUNTIQ's opportunity scoring.

---

# 15. Source performance

Show where prospects came from.

Examples:

* AI Prospect Hunter
* Manual
* Import
* CRM
* Saved Search
* Referral

Metrics:

* Prospects
* Qualified
* Meetings
* Won
* Revenue

This allows:

> **Source → Conversion → Revenue**

analysis.

---

# 16. Campaign performance

For campaign reports:

```text
Contacts targeted       500
Delivered               492
Opened                  284
Replies                  63
Meetings                 21
Opportunities            12
Won                       4
```

Then:

### Revenue generated

**$72,000**

This is more useful than open rate alone.

---

# 17. AI recommendations

Every substantial report should finish with:

# Recommended Actions

Example:

### 1. Prioritize FinTech

> Financial Services generated 42% of qualified opportunities.

`Explore opportunities`

---

### 2. Follow up with 8 stalled deals

> These opportunities have had no activity for 14+ days.

`Review pipeline`

---

### 3. Research 12 companies with multiple signals

> These companies generated both hiring and expansion signals.

`Research companies`

---

# 18. Report confidence

AI-generated reports should expose confidence where appropriate.

Example:

**Market trend confidence: 91%**

**Opportunity attribution confidence: 86%**

This is particularly useful where the report involves inferred intelligence.

---

# 19. Sources and evidence

Reports should support a source section.

Example:

### Intelligence Sources

* 842 detected signals
* 214 company events
* 73 opportunity records
* 1,284 prospect records
* 34 external sources

Each AI insight should be traceable to underlying data.

---

# 20. Export

Reports should support:

### PDF

For executives/clients.

### CSV

For raw tabular data.

### Excel

For analysis.

### Share Link

For team members.

Potential later:

### PowerPoint

For executive presentations.

---

# 21. Share report

Click:

**Share**

Modal:

```text
Share Report

○ Specific people
○ Team
○ Anyone with link

Permission:
○ View
○ Comment

[Copy Link]
```

For sensitive reports, don't use public links by default.

---

# 22. Scheduled reports

This should be a major feature.

Example:

### Weekly Executive Intelligence

Every Monday

8:00 AM

Recipients:

* CEO
* Sales Manager

Format:

PDF + Email

---

Another:

### Daily Prospecting Brief

Every morning

8:30 AM

Recipient:

Ayoola

Contains:

* New hot opportunities
* New signals
* Contact changes
* Follow-ups

---

# 23. Schedule configuration

```text
Report:
Weekly Sales Intelligence

Frequency:
Weekly

Day:
Monday

Time:
08:00

Timezone:
Workspace timezone

Recipients:
Ayoola
Sales Team

Format:
PDF

AI Analysis:
Deep

[Schedule Report]
```

---

# 24. Report library

The main page should maintain a searchable report library.

Columns:

| Report                    | Type     | Period    | Created   | Owner  | Status |
| ------------------------- | -------- | --------- | --------- | ------ | ------ |
| Weekly Sales Intelligence | Sales    | Aug 17–23 | Today     | Ayoola | Ready  |
| Market Brief              | Market   | Aug 1–23  | Yesterday | Ayoola | Ready  |
| Pipeline Review           | Pipeline | Aug 1–23  | Aug 22    | Sarah  | Ready  |

Filters:

* Report type
* Owner
* Date
* Status
* Scheduled
* Shared

---

# 25. Report statuses

```text
GENERATING
READY
FAILED
SCHEDULED
ARCHIVED
```

If generation fails:

> We couldn't generate this report.

`Retry`

Don't create an incomplete report and label it as ready.

---

# 26. Custom AI Reports

This could become one of HUNTIQ's strongest features.

User writes:

> **"Analyze all Nigerian companies with more than 200 employees that showed hiring or expansion signals in the last 30 days. Identify the 20 strongest opportunities for HR consulting and explain why."**

The system interprets the request and creates a report.

Flow:

```text
Natural Language Request
          ↓
Intent Extraction
          ↓
Filters
          ↓
Data Retrieval
          ↓
Opportunity Analysis
          ↓
AI Reasoning
          ↓
Evidence Validation
          ↓
Report Generation
```

---

# 27. Report templates

Users should be able to save custom configurations.

Example:

### "Monday Sales Meeting"

Contains:

* Pipeline
* New opportunities
* Stalled deals
* Meetings
* Revenue
* AI recommendations

Then every Monday:

`Generate`

---

# 28. Database architecture

Core:

```text
reports
---------------------
id
workspace_id
type
name
description
period_start
period_end
scope
status
created_by
created_at
updated_at
```

---

## Report sections

```text
report_sections
---------------------
id
report_id
type
title
position
configuration
data
ai_content
```

---

## Report sources

```text
report_sources
---------------------
id
report_id
source_type
source_id
metadata
```

---

## Schedules

```text
report_schedules
---------------------
id
report_id
frequency
day_of_week
time
timezone
recipients
format
enabled
next_run_at
```

---

# 29. API architecture

```text
GET    /api/reports

GET    /api/reports/:id

POST   /api/reports

PATCH  /api/reports/:id

DELETE /api/reports/:id

POST   /api/reports/:id/generate

POST   /api/reports/:id/share

POST   /api/reports/:id/export

POST   /api/reports/schedules

GET    /api/reports/schedules

PATCH  /api/reports/schedules/:id

DELETE /api/reports/schedules/:id
```

For custom reports:

```text
POST /api/reports/ai/generate
```

with a natural-language request.

---

# 30. Background processing

Report generation should **not happen synchronously inside the browser request**.

Use:

```text
User
 ↓
Create Report Job
 ↓
Queue
 ↓
Data aggregation
 ↓
Analytics calculations
 ↓
AI analysis
 ↓
Report assembly
 ↓
PDF/Excel generation
 ↓
Storage
 ↓
READY
```

This allows large reports without timing out the frontend/API.

---

# 31. AI architecture

The AI should **not calculate primary business metrics**.

For example:

> Pipeline = $428,600

should come from database aggregation.

AI can then say:

> Pipeline increased 12.3% compared with the previous period.

The AI should be responsible for:

* Summarization
* Interpretation
* Anomaly explanation
* Recommendations
* Narrative generation
* Custom report reasoning

---

# 32. Report permissions

Reports can contain sensitive information.

Roles:

### Owner/Admin

All reports.

### Manager

Team reports.

### Sales Rep

Their reports + shared reports.

### Analyst

Analytics/intelligence reports.

The backend must enforce report access.

---

# 33. Report freshness

Every report should display:

> Data through: **Aug 23, 2026 — 20:00**

This prevents confusion when users read an older report.

Also:

> Generated: Aug 23, 2026 — 20:04

These are different timestamps and should both exist.

---

# 34. What NOT to do

Avoid turning Reports into:

❌ A duplicate Dashboard

❌ A collection of random charts

❌ AI-generated essays

❌ Reports without source data

❌ Static PDFs only

❌ Metrics without comparison

❌ Charts that cannot be interacted with

The report should tell a coherent story:

```text
WHAT HAPPENED
      ↓
WHY IT HAPPENED
      ↓
WHAT IT MEANS
      ↓
WHAT WE SHOULD DO
```

---

# 35. Implementation priority

### P0 — MVP

* Report library
* Report templates
* Sales report
* Pipeline report
* Prospecting report
* Basic report viewer
* Date filters
* Export PDF
* CSV export

### P1 — Intelligence

* Market intelligence reports
* AI executive summaries
* Signal → opportunity attribution
* Recommendations
* Evidence/source sections

### P2 — Automation

* Scheduled reports
* Email delivery
* Team sharing
* Saved templates
* Automated weekly intelligence

### P3 — Advanced

* Custom natural-language reports
* Predictive reports
* Cross-market comparisons
* Automated executive briefings
* PowerPoint generation
* AI report builder

---

# 36. How Reports connect to the rest of HUNTIQ

```text
             HUNTIQ DATA
                 │
       ┌─────────┼──────────┐
       ↓         ↓          ↓
   CRM DATA   MARKET DATA  AI DATA
       │         │          │
       └─────────┼──────────┘
                 ↓
             REPORT ENGINE
                 │
       ┌─────────┼───────────┐
       ↓         ↓           ↓
    METRICS   INSIGHTS   RECOMMENDATIONS
       │         │           │
       └─────────┼───────────┘
                 ↓
              REPORT
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
      PDF      SHARE      EMAIL
```

The most important product principle is:

> **Reports should convert HUNTIQ's raw data and intelligence into decisions, not simply display numbers.**

For the eventual UI image, the visual hierarchy should therefore emphasize **report templates → featured intelligence report → recent reports → scheduled reports**, rather than making it another chart-heavy dashboard.

I can create the **Reports page UI reference image** next using this specification.
