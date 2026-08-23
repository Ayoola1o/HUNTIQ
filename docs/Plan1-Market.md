Yes. Before moving to another image, we should lock the **Market Intelligence** page specification. The generated image is the visual reference; this defines the actual product behavior and implementation.

# HUNTIQ — Market Intelligence Specification

## 1. Purpose

Market Intelligence answers:

> **"What is happening in the market I am targeting, and where are the best opportunities emerging?"**

This page should aggregate signals across the user's target universe and turn them into:

* Market trends
* Industry opportunities
* Geographic opportunities
* Buying-signal patterns
* Emerging sectors
* Companies worth investigating
* AI-generated market insights
* Recommended actions

It is **not** simply an analytics dashboard.

The important distinction:

**Dashboard** → *What should I do today?*

**Market Intelligence** → *What is happening in my market and what does it mean?*

---

# 2. Page structure

```text
┌─────────────────────────────────────────────────────────────┐
│ Market Intelligence       Search   AI Copilot   Alerts      │
│ Real-time insights across your target market                │
├─────────────────────────────────────────────────────────────┤
│ Date │ Geography │ Industry │ Company Size │ Filters        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ TOTAL SIGNALS │ COMPANIES │ HOT INDUSTRIES │ HIRING        │
│ FUNDING       │ EXPANSION  │                               │
│                                                             │
├────────────────────────────────┬────────────────────────────┤
│                                │                            │
│ SIGNALS OVER TIME              │ SIGNALS BY TYPE            │
│                                │                            │
│                                │                            │
├────────────────────────────────┼────────────────────────────┤
│                                │                            │
│ TOP INDUSTRIES                 │ MARKET INSIGHTS            │
│                                │                            │
├────────────────────────────────┼────────────────────────────┤
│ TOP COMPANIES                  │ GEOGRAPHIC HOTSPOTS         │
│                                │                            │
├────────────────────────────────┴────────────────────────────┤
│ EMERGING TRENDS                                               │
├─────────────────────────────────────────────────────────────┤
│ LATEST SIGNALS              │ RECOMMENDED ACTIONS            │
└─────────────────────────────────────────────────────────────┘
```

---

# 3. Header

### Title

**Market Intelligence**

Subtitle:

> Real-time insights, buying signals and market trends across your target universe.

Actions:

**Search**

Search:

* Industries
* Companies
* Signals
* Trends

**Ask AI Copilot**

**Notifications**

**Date range**

**Geography**

**Filters**

---

# 4. Global filters

These filters control the intelligence being displayed.

### Date

* Today
* 7 days
* 30 days
* 90 days
* This quarter
* Custom

### Geography

Examples:

* All countries
* Nigeria
* Ghana
* Kenya
* South Africa
* United States
* United Kingdom

The list should eventually come from the user's configured markets.

### Industry

* Technology
* Financial Services
* Healthcare
* Manufacturing
* Retail
* etc.

### Company size

* 1–10
* 11–50
* 51–200
* 201–500
* 501–1,000
* 1,000+

### Signal type

* Hiring
* Funding
* Expansion
* Leadership
* Technology
* News
* Intent
* Regulatory

---

# 5. KPI cards

## Total Signals

Example:

**6,842**

Meaning:

Number of relevant market signals detected during the selected period.

---

## Companies Affected

Example:

**2,185**

Unique companies associated with those signals.

---

## Hot Industries

Example:

**8**

Industries currently showing significant signal activity.

---

## Hiring Signals

Example:

**2,413**

Detected hiring-related signals.

---

## Funding Signals

Example:

**1,067**

Funding/investment events detected.

---

## Expansion Signals

Example:

**1,178**

Expansion-related events.

---

# 6. KPI comparison

Every time-sensitive KPI should show a comparison.

Example:

**6,842**

↑ **23.6%**

vs previous 30 days

The backend should calculate this from equivalent previous periods.

For a 30-day filter:

```text
Current period:
May 16 – Jun 15

Previous period:
Apr 16 – May 15
```

Do not compare against an arbitrary period.

---

# 7. Signals Over Time

This is the primary trend visualization.

It should show signal volume over the selected period.

Possible series:

* Hiring
* Funding
* Expansion
* Technology
* News
* Leadership

Users should be able to toggle series.

Hovering a point should reveal:

```text
June 12

Total signals: 412

Hiring: 174
Funding: 72
Expansion: 93
Technology: 41
News: 22
Leadership: 10
```

---

# 8. Signal anomaly detection

The system should identify unusual increases.

Example:

> **Hiring signals increased 48% this week.**

Or:

> **Funding activity is 2.4× higher than the 90-day average.**

These anomalies should feed the AI Market Insights section.

---

# 9. Signals by Type

Use a distribution chart.

Example:

```text
Hiring          35%
Expansion       17%
Funding         16%
Technology      14%
Leadership       9%
News             6%
Other            3%
```

Clicking a category should navigate to:

**Signals → filtered to that type.**

---

# 10. Top Industries by Signal Volume

Example:

| Industry           | Signals | Trend |
| ------------------ | ------: | ----: |
| Financial Services |   1,842 |  +32% |
| Healthcare         |   1,256 |  +24% |
| Technology         |   1,102 |  +28% |
| Retail             |     876 |  +19% |
| Manufacturing      |     645 |  +15% |

But **volume alone shouldn't determine opportunity**.

A sector with 5,000 signals isn't necessarily better than one with 500.

Therefore also calculate:

### Opportunity density

```text
Relevant high-intent companies
÷
Total companies monitored
```

This can identify smaller but more commercially attractive markets.

---

# 11. Industry Intelligence

Clicking an industry should open a detailed intelligence view.

Example:

### Financial Services

**Opportunity Index: 89**

Signals:

+32%

Companies affected:

421

Hiring:

+38%

Expansion:

+21%

Funding:

+14%

Then:

### Why this matters

> Financial services companies in your target market are showing increased hiring and expansion activity, suggesting a strong period for workforce and operational services.

---

# 12. Top Companies Showing Buying Signals

This widget shows companies generating significant activity.

Example:

### Flutterwave

FinTech

**Hiring**

Signal intensity: ●●●●●

---

### Paystack

FinTech

**Expansion**

Signal intensity: ●●●●○

---

### Dangote Group

Manufacturing

**Leadership Change**

Signal intensity: ●●●○○

---

The user should be able to click a company and open:

**Company Intelligence**

---

# 13. Company ranking

The ranking shouldn't simply be:

> Company with most signals = #1.

Instead:

```text
Market Opportunity Score
=
Signal Volume
+
Signal Strength
+
Signal Recency
+
ICP Fit
+
Intent
```

This means a company with two extremely important signals can outrank a company with twenty weak news events.

---

# 14. Market Insights

This is the **AI layer** of the page.

Example:

## Hiring activity surging in FinTech

> FinTech companies are hiring 34% more than the previous period, particularly in engineering, operations and compliance roles.

### Why it matters

> Increased hiring combined with geographic expansion suggests organizations may require workforce planning, onboarding and employee development services.

`Explore FinTech`

---

# 15. AI insight structure

Every AI-generated insight should have:

### Observation

What happened?

### Evidence

What data supports it?

### Interpretation

What might it mean?

### Commercial implication

Why should the user care?

### Recommended action

What should they do?

Example:

```text
OBSERVATION
Hiring increased 34%.

EVIDENCE
412 new roles across 87 companies.

INTERPRETATION
Market expansion appears to be driving workforce growth.

COMMERCIAL IMPLICATION
Potential demand for HR/training services.

ACTION
Review the 27 highest-fit companies.
```

This is much stronger than generic AI commentary.

---

# 16. Evidence and provenance

This is critical for Market Intelligence.

The system should never say:

> "The market is growing rapidly."

without being able to explain why.

Every insight should have:

**Sources**

**Signal IDs**

**Detection dates**

**Confidence**

Example:

> Confidence: **91%**

> Based on 184 hiring signals across 47 companies.

---

# 17. Geographic Hotspots

The map identifies where signal activity is concentrated.

For example:

### Nigeria

Lagos

High

Abuja

Medium

Port Harcourt

Medium

Ibadan

Low

The map should support:

* Country
* State/region
* City

depending on data availability.

---

# 18. Geographic opportunity score

Again, volume isn't enough.

Example:

```text
Lagos

Signal Volume: 1,240
ICP Fit: 91%
High Intent: 284
Opportunity Index: 94
```

This lets the user discover:

> **Where should I focus my sales effort?**

---

# 19. Emerging Trends

This section identifies trends before they become obvious.

Examples:

### AI & Automation

↑ **42%**

> Increased investment in AI and automation solutions.

### Cybersecurity

↑ **36%**

> Increased cybersecurity investment across enterprises.

### Remote Workforce

↑ **21%**

### Sustainability

↑ **18%**

---

# 20. Trend detection

The backend should detect trends using a combination of:

* Signal frequency
* Growth rate
* Unique companies
* Search activity
* News activity
* Hiring activity
* Funding activity
* Technology adoption

A trend shouldn't be declared based on a single article.

---

# 21. Latest Market Signals

This is a chronological feed.

Example:

> **Company X is hiring 45 employees**

FinTech · Lagos

**2h ago**

---

> **Company Y expands into 3 new states**

Telecom · Nigeria

**5h ago**

---

> **Company Z raises $55M Series B**

FinTech · Africa

**1d ago**

Clicking any signal opens its detailed signal view.

---

# 22. Signal detail

A signal should contain:

### What happened?

Clear description.

### When?

Timestamp.

### Company

Linked company.

### Industry

Linked industry.

### Location

Geography.

### Signal type

Hiring / Funding / Expansion etc.

### Strength

Low → Very High.

### Evidence

Source information.

### AI interpretation

What the signal could indicate.

### Relevant services

Which of the user's services could potentially benefit.

### Related contacts

Decision-makers associated with the company.

---

# 23. Recommended Actions

This is where Market Intelligence connects back to sales.

Example:

### Explore 184 companies with high hiring signals

`View companies`

---

### Review 67 expansion signals

`View opportunities`

---

### Research 24 companies showing multiple signals

`Start research`

---

### Create a prospect list

`Create list`

---

# 24. AI Market Brief

We should eventually add a dedicated button:

### Generate Market Brief

The AI produces:

**Market summary**

**Top opportunities**

**Industry movements**

**Geographic changes**

**Emerging trends**

**Risks**

**Recommended sales actions**

The report can be saved to:

**Reports → Market Intelligence**

---

# 25. Watchlists

Users should be able to monitor:

### Industries

> FinTech

### Geography

> Lagos

### Companies

> Acme

### Trends

> AI

Then HUNTIQ generates alerts when important changes occur.

---

# 26. Market alerts

Examples:

> 🔥 **Signal spike**

Hiring activity in FinTech increased 42%.

---

> 📈 **New market opportunity**

Healthcare companies in Abuja show increased expansion activity.

---

> ⚠️ **Market slowdown**

Funding activity in your target sector dropped 18%.

---

# 27. Database architecture

I'd structure the intelligence layer around these entities:

```text
market_signals
signal_sources
signal_types

industries
industry_metrics
industry_trends

geographies
geographic_metrics

market_trends
trend_evidence

market_insights
market_insight_sources

market_watchlists
market_alerts

company_signals
```

---

# 28. Signal model

A signal might look like:

```text
market_signals
-------------------------
id
company_id
signal_type
title
description
strength
confidence
occurred_at
detected_at
source_id
geography_id
industry_id
metadata
created_at
```

---

# 29. Market insight model

```text
market_insights
-------------------------
id
workspace_id
title
summary
observation
interpretation
commercial_implication
recommendation
confidence
period_start
period_end
created_at
```

And:

```text
market_insight_sources
-------------------------
insight_id
signal_id
source_id
```

This allows every AI insight to be traced back to evidence.

---

# 30. API architecture

Recommended endpoints:

```text
GET /api/market/summary

GET /api/market/signals

GET /api/market/signals/trends

GET /api/market/signals/types

GET /api/market/industries

GET /api/market/industries/:id

GET /api/market/companies

GET /api/market/geographies

GET /api/market/trends

GET /api/market/insights

GET /api/market/alerts

POST /api/market/brief

POST /api/market/watchlists
```

All should accept the relevant workspace, date, geography and filtering parameters.

---

# 31. Data processing architecture

This page shouldn't generate intelligence every time someone opens it.

Use background processing:

```text
External Data Sources
        ↓
Data Ingestion
        ↓
Normalization
        ↓
Entity Resolution
        ↓
Signal Detection
        ↓
Signal Classification
        ↓
Signal Scoring
        ↓
Trend Detection
        ↓
Market Aggregation
        ↓
AI Interpretation
        ↓
Market Intelligence API
        ↓
Frontend
```

This is important for both performance and cost.

---

# 32. AI architecture

Use AI for:

### Classification

"What type of signal is this?"

### Extraction

"What happened?"

### Entity resolution assistance

"Which company does this refer to?"

### Interpretation

"What might this signal indicate?"

### Trend summarization

"What pattern exists?"

### Commercial reasoning

"Why might this matter to this user's business?"

Don't use an LLM for simple aggregation.

For example:

> Count hiring signals.

That should be SQL/database logic—not an AI request.

---

# 33. Real-time updates

When a new significant signal enters the system:

```text
New signal
   ↓
Company score updated
   ↓
Industry metrics updated
   ↓
Geographic metrics updated
   ↓
Trend engine evaluates
   ↓
Market insight potentially updated
   ↓
Alert generated if threshold crossed
```

The user can then see:

> **New market movement detected**

without manually refreshing.

---

# 34. Personalization

This page must be **workspace-specific**.

If the user's ICP is:

> HR consulting for 50–500 employee companies

then Market Intelligence should prioritize:

* Hiring
* Workforce expansion
* Leadership changes
* HR leadership
* New offices
* Organizational restructuring

If another user sells:

> Cybersecurity services

the intelligence priorities should change.

So don't make the page a generic global news dashboard.

---

# 35. What NOT to do

Avoid:

❌ Generic news feed

❌ Random stock-market charts

❌ Vanity metrics

❌ AI summaries without evidence

❌ Showing every signal equally

❌ Huge unreadable maps

❌ Making the user manually interpret thousands of events

The entire purpose is:

> **Raw market events → meaningful intelligence → sales opportunity.**

---

# 36. Implementation priority

### P0

* Header
* Filters
* KPI cards
* Signal trend chart
* Signal type distribution
* Top industries
* Top companies
* Latest signals

### P1

* AI market insights
* Geographic hotspots
* Emerging trends
* Opportunity index
* Recommended actions

### P2

* Watchlists
* Alerts
* Market briefs
* Advanced industry intelligence
* AI-generated reports

### P3

* Real-time market monitoring
* Predictive trend detection
* Cross-market comparisons
* Automated opportunity discovery

---

# 37. How this connects to the rest of HUNTIQ

The Market Intelligence page should feed the entire product:

```text
                 MARKET INTELLIGENCE
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
       INDUSTRIES     GEOGRAPHIES    TRENDS
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                     COMPANIES
                         ↓
                      SIGNALS
                         ↓
                  OPPORTUNITY SCORE
                         ↓
                     CONTACTS
                         ↓
                    OUTREACH
                         ↓
                     PIPELINE
                         ↓
                       WON
```

That makes Market Intelligence a **core data engine for HUNTIQ**, rather than another isolated analytics screen.

The generated image should therefore be treated as the **visual source of truth**, while this specification is the **functional source of truth**. I can create the next page's image using this same process.
