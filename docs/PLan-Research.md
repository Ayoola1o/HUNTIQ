Yes. The **Research page** should be one of the most important pages in HUNTIQ because this is where the product moves from simply **finding companies** to **understanding why a company is worth pursuing**.

Your documentation defines the Research Agent as the agent that **investigates the company**, and the research output is intended to become a structured company brief containing company information, recent developments, leadership, hiring, technology, competitors, problems, opportunities, buying signals and a recommended approach. 

# HUNTIQ — Research Page

## 1. Main purpose

The Research page answers:

> **"Tell me everything important about this company, why it is a potential opportunity, what changed recently, who I should contact, and how I should approach them."**

The product workflow in the documentation is:

**Find → Investigate → Score → Understand → Contact → Track → Convert.** 

So Research sits immediately after discovery:

```text
Find Prospects
      ↓
Companies
      ↓
Research
      ↓
Signals
      ↓
Opportunity Score
      ↓
Decision Maker
      ↓
Outreach
      ↓
CRM
```

---

# 2. What the Research page is NOT

This distinction is important.

The Research page should **not** simply display:

> Company name
> Website
> Address
> Phone
> Email

That's a normal CRM company profile.

Your documentation specifically proposes a much richer **Company Intelligence** experience. 

Research should instead answer:

* What does this company do?
* How does it make money?
* What is happening inside the company?
* Is it growing?
* What technologies does it use?
* Who are its competitors?
* What problems might it have?
* What can we sell to it?
* Why should we contact it now?
* Who should we contact?
* What should we say?

---

# 3. Page header

At the top:

# Research

Subtitle:

> **Investigate companies, uncover buying signals, and understand your next best opportunity.**

On the right:

### + New Research

and:

### Ask AI Copilot

---

# 4. Research search bar

At the top of the content area:

### Research a company

Placeholder:

> Search company name, website or domain...

Example:

> Acme Technologies

Then:

### Research Company →

The user can also arrive here from:

* Companies
* Find Prospects
* Signals
* Contacts
* Saved Searches
* AI Copilot

---

# 5. Research dashboard

I recommend the Research page initially having a dashboard/listing view before opening an individual research report.

The layout:

```text
┌──────────────────────────────────────────────────────────────┐
│ Research                                                     │
│ Investigate companies and uncover actionable intelligence   │
│                                                              │
│ [Search company...]                       [+ New Research]   │
├──────────────────────────────────────────────────────────────┤
│ Research Metrics                                             │
│                                                              │
│ Reports Generated | Researching | Updated | High Opportunity│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [All] [Completed] [Researching] [Needs Review]              │
│                                                              │
│ Recent Research                                             │
│                                                              │
│ Company       Score    Signals   Status       Updated       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 6. Research KPI cards

The dashboard can have four cards.

### Research Reports

Example:

**86**

> Total company research reports

---

### In Progress

Example:

**4**

> Research jobs currently running

---

### Updated This Week

Example:

**31**

> Reports refreshed this week

---

### High Opportunity

Example:

**24**

> Researched companies with high opportunity scores

These numbers should be calculated dynamically; they are illustrative UI values, not figures specified by the documentation.

---

# 7. Recent Research table

The main table can contain:

| Company           | Industry   | Score | Buying Intent | Research Status | Last Updated | Action |
| ----------------- | ---------- | ----: | ------------- | --------------- | ------------ | ------ |
| Acme Technologies | Technology |    94 | Very High     | Complete        | 10m ago      | View   |
| FinServe Ltd      | Financial  |    88 | High          | Complete        | 32m ago      | View   |
| Delta Systems     | Software   |    81 | High          | Researching     | Now          | View   |
| Zenith Bank       | Banking    |    76 | Medium        | Complete        | 2h ago       | View   |

---

# 8. Research status

There should be clear statuses.

### Researching

AI is currently gathering and analyzing information.

### Complete

Research report successfully generated.

### Needs Review

Some information is incomplete, conflicting or requires verification.

### Failed

Research could not be completed.

The user should be able to retry.

---

# 9. The individual Research / Company Intelligence page

This is the real heart of the feature.

When the user clicks:

### View Research

open:

# Acme Technologies

**Technology · Lagos, Nigeria**

---

### Opportunity Score

# 94/100

**Very High Opportunity**

### Buying Intent

🔥 **Very High**

### Relationship

**New Prospect**

The documentation explicitly uses this structure for Company Intelligence. 

---

# 10. Top action bar

At the top of the research report:

```text
[← Back to Research]

Acme Technologies

[Refresh Research]
[View Company]
[Find Contacts]
[Generate Outreach]
[Save]
[⋮]
```

The most important action should be:

### Generate Outreach

But it should only be enabled once there is enough research information.

---

# 11. Executive Summary

Immediately underneath:

## Executive Summary

A concise AI-generated explanation:

> Acme Technologies is a rapidly growing technology company expanding its operations across Nigeria. Recent hiring and geographic expansion indicate a scaling phase that may create demand for HR strategy, recruitment support and leadership development.

This is the first thing a salesperson should read.

---

# 12. Company Overview

## Company Overview

The report explains:

* What the company does
* What industry it operates in
* Who it serves
* Geographic footprint
* Approximate company size
* Business positioning

The documentation explicitly defines Company Overview as an AI-generated company summary. 

---

# 13. Business Model

## Business Model

Answer:

> **How does this company make money?**

Include:

* Products/services
* Customer segments
* Revenue model
* Primary markets
* Business model type
* Key revenue drivers

The documentation specifically calls for:

> "What they sell and how they make money." 

---

# 14. Current Situation

## Current Situation

This is one of the most important research sections.

It should answer:

> **What is happening inside this company right now?**

Possible findings:

* New leadership
* Expansion
* Hiring
* Funding
* New products
* Restructuring
* New market entry
* Technology migration
* Regulatory changes

The documentation defines this section as identifying **what is happening inside the company**. 

---

# 15. Growth Intelligence

## Growth

Show:

### Employee Growth

```text
+18.4%
```

### Hiring

```text
38 new job postings
```

### Geographic Expansion

```text
Ghana + Kenya
```

### Funding

```text
Series B
```

### Revenue Trend

Where reliable data exists.

The documentation specifically identifies revenue trend, employee growth, geographic expansion, funding and hiring as growth factors. 

---

# 16. Technology

## Technology Intelligence

Display detected technologies such as:

```text
AWS
Microsoft 365
Salesforce
HubSpot
React
Google Cloud
```

Each technology should have:

* Confidence
* Source
* Last detected
* Relevance

The original design specifies **potential technology stack**, so the interface should avoid presenting uncertain technology information as fact. 

---

# 17. Competitors

## Competitor Landscape

Show:

### Main competitors

* Competitor A
* Competitor B
* Competitor C

For each:

* Market position
* Product overlap
* Competitive relationship

This helps the salesperson understand the company's market.

The research specification explicitly includes competitors and who the company competes against. 

---

# 18. Problems / Pain Points

## Potential Problems

This section is extremely important for HUNTIQ.

Example:

### Rapid hiring

> Company is adding employees rapidly, which may create onboarding and management challenges.

### Organizational scaling

> Expansion may require stronger HR structures and processes.

### Leadership development

> New executives may indicate a need for management development.

The documentation defines Problems as **potential problems your service can solve**. 

Notice the wording:

> **Potential**

Not:

> "The company definitely has this problem."

That distinction is important for trustworthy AI.

---

# 19. Opportunities

## Potential Opportunities

Now connect the research to the user's business.

For Peak Consulting, for example:

### HR Strategy

**High relevance**

### Leadership Development

**High relevance**

### Employee Training

**High relevance**

### Organizational Design

**Medium relevance**

The documentation explicitly describes Opportunities as potential products/services that can be sold to the company. 

---

# 20. Why Now?

This should be the **hero section of the research report**.

# Why Contact Them Now?

Example:

### 🔥 3 buying signals detected

**1. Hiring spike**

> 27 positions opened in the last 30 days.

**2. Leadership change**

> New Chief Operating Officer appointed.

**3. Expansion**

> Expansion announced into Ghana and Kenya.

Then:

### AI conclusion

> The company appears to be entering a scaling phase. HR infrastructure, recruitment and management training may therefore be particularly relevant.

This "Why Now?" feature is explicitly identified in your documentation as a major differentiator. 

---

# 21. Signal timeline

Below Why Now:

## Signal Timeline

```text
May 16
🔥 Hiring surge
38 new positions

May 12
📈 Expansion
New Ghana office

May 8
👤 Leadership
New COO appointed

Apr 28
💰 Funding
Series B announced
```

This visually explains the company's recent movement.

---

# 22. Decision Maker Intelligence

The research page should also contain:

# Key People

| Person        | Role        | Influence | Relevance |
| ------------- | ----------- | --------- | --------- |
| Jane Smith    | HR Director | High      | 96%       |
| Michael Okoro | COO         | High      | 91%       |
| David Jonah   | CTO         | Medium    | 72%       |

The documentation explicitly calls for Key People and influence information. 

---

# 23. Best person to contact

Make this visually prominent.

## Best Person to Contact

### Jane Smith

**HR Director**

### Confidence: 94%

> Her responsibilities directly overlap with the organizational-growth signals detected at the company.

This exact concept is specified in the research documentation. 

Buttons:

**View Contact**

**Generate Outreach**

---

# 24. Recommended Approach

At the end of the intelligence analysis:

# Recommended Approach

Example:

> **Lead with workforce scaling and management training rather than a generic HR-services pitch.**

Then show:

### Recommended opening angle

**Workforce scaling**

### Relevant service

**HR Strategy + Employee Training**

### Target person

**HR Director**

### Timing

**Now — following hiring and expansion activity**

This follows the product's central goal of telling the user **who needs the service, why they need it, who to contact and what to say.** 

---

# 25. Generate Outreach

From the research page:

### Generate Outreach

The system uses:

```text
User's service
      +
Company situation
      +
Buying signals
      +
Decision maker
      +
Recommended approach
```

to create:

* Email
* LinkedIn message
* WhatsApp message
* Call script
* Follow-up #1
* Follow-up #2

The documentation explicitly describes these outputs. 

---

# 26. Sources / Evidence

This is **mandatory** for the quality of the Research page.

Every research section should show:

### Sources

For example:

```text
Company website
LinkedIn
Company announcement
Job postings
News article
Technology source
```

Each AI-generated claim should ideally have an associated source.

The architecture explicitly separates:

```text
research_reports
research_sources
```

from the company itself. 

---

# 27. Confidence indicators

Research information should have confidence.

Example:

### Employee Growth

**High confidence**

### Technology Stack

**Medium confidence**

### Potential Problem

**AI inference**

This prevents the system from presenting assumptions as verified facts.

---

# 28. Research refresh

At the top:

### Last researched

> 14 minutes ago

Button:

### Refresh Research

When clicked:

```text
Existing research
       ↓
Check latest information
       ↓
Detect changes
       ↓
Update report
       ↓
Update signals
       ↓
Recalculate score
```

This keeps research from becoming a static report.

---

# 29. Research history

The user should be able to see:

```text
Research History

May 16 — Updated
May 12 — Updated
May 5 — Initial research
```

Clicking an older version can eventually show:

> What changed?

For example:

**Previous score: 78**

**Current score: 94**

### Major changes

* New COO
* 38 new job postings
* Expansion announced

This supports the product's idea of continuously updating opportunity intelligence.

---

# 30. Database implementation

Your documentation already defines:

```text
research_reports
research_sources
```

along with:

```text
companies
company_profiles
company_sources
company_signals
company_technologies
company_news
contacts
contact_roles
opportunity_scores
score_factors
```

The separation between company, contact, signal, research and CRM activity is specifically called out as important. 

A practical implementation could be:

```text
research_reports
-------------------------
id
organization_id
company_id
requested_by
status
summary
business_model
current_situation
growth_analysis
technology_analysis
competitor_analysis
problem_analysis
opportunity_analysis
why_now
recommended_approach
best_contact_id
confidence
created_at
updated_at
```

And:

```text
research_sources
-------------------------
id
research_report_id
source_type
source_url
title
published_at
retrieved_at
claim_reference
confidence
```

These specific fields are **implementation proposals**; the documentation establishes the entities and required research content, rather than this exact schema.

---

# 31. Research Agent implementation

The Research Agent should be a specialized agent, not the same generic AI used for conversation.

The architecture explicitly identifies:

### Research Agent

> **Investigates the company.** 

The flow:

```text
User clicks Research
        ↓
Research Agent
        ↓
Get company profile
        ↓
Gather available public information
        ↓
Gather company news
        ↓
Gather hiring information
        ↓
Gather technology information
        ↓
Gather leadership information
        ↓
Gather signals
        ↓
Analyze information
        ↓
Generate structured report
        ↓
Attach sources
        ↓
Calculate/update score
        ↓
Identify decision makers
        ↓
Generate recommendation
```

The documentation explicitly says the Research Agent should gather available public information and produce a Company Brief. 

---

# 32. API implementation

I would structure the Research API around:

```text
GET  /api/research
GET  /api/research/:id
POST /api/research/company/:companyId
POST /api/research/:id/refresh

GET  /api/research/:id/sources
GET  /api/research/:id/signals
GET  /api/research/:id/contacts
GET  /api/research/:id/history

POST /api/research/:id/generate-outreach
```

For example:

```text
POST /api/research/company/abc123
```

returns:

```json
{
  "research_id": "res_123",
  "status": "researching"
}
```

The frontend then listens for completion.

---

# 33. Asynchronous research

Do **not** make the browser wait for the entire research process.

Instead:

```text
POST research
       ↓
status = researching
       ↓
background job
       ↓
Research Agent
       ↓
report generated
       ↓
status = complete
       ↓
frontend updates
```

This is especially important because research may involve multiple external sources.

---

# 34. AI orchestration

The Research Agent should be able to call controlled tools such as:

```text
get_company()
get_company_news()
get_company_signals()
get_company_technology()
search_contacts()
get_contact()
calculate_opportunity_score()
```

Then produce the structured research report.

The overall architecture intentionally uses specialized agents rather than one giant agent. 

---

# 35. Security

Research can involve external information and AI-generated conclusions, so every operation should be scoped to the user's organization.

The AI architecture also requires actions to pass through:

```text
User
 ↓
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

# 36. Research page empty state

If no research exists:

# No research yet

> Research a company to uncover its business model, growth, buying signals, potential problems and opportunities.

### Research a Company →

Secondary:

> Or start by finding prospects.

---

# 37. Research loading state

When research starts:

# Researching Acme Technologies...

Show stages:

```text
✓ Company profile
✓ Recent developments
✓ Leadership
● Buying signals
○ Technology
○ Competitors
○ Opportunities
○ Recommended approach
```

This gives the user confidence that the AI is actually doing work.

---

# 38. Research failure state

If research fails:

### Research could not be completed

> Some information sources were unavailable. We saved the information that could be verified.

Buttons:

**Retry Research**

**View Partial Report**

This is better than simply showing an error.

---

# 39. Most important design principle

The Research page should make the salesperson feel:

> **"I don't have to spend two hours researching this company myself."**

The output should move from:

### Raw data

to:

### Intelligence

to:

### Sales action

```text
Company data
     ↓
Research
     ↓
Signals
     ↓
Interpretation
     ↓
Opportunity
     ↓
Decision maker
     ↓
Recommended approach
     ↓
Outreach
```

That is exactly where HUNTIQ's product concept becomes stronger than a conventional CRM. The documentation describes the Intelligence Engine as the part that makes the product special, feeding intelligence into the CRM afterward. 

---

# 40. Recommended Research page priority

### P0 — MVP

Build first:

* Company search
* Start research
* Research status
* Company overview
* Business model
* Current situation
* Growth
* Technology
* Problems
* Opportunities
* Why Now
* Sources
* Research report storage
* Refresh research

This aligns closely with the Phase 1 Intelligence MVP, which explicitly includes **Company Intelligence and AI company research**. 

### P1

Add:

* Competitor intelligence
* Decision-maker intelligence
* Best person to contact
* Opportunity scoring
* Recommended approach
* Research history
* Signal timeline

### P2

Add:

* Automatic research refresh
* Multi-agent research
* Competitive monitoring
* Change detection
* Proactive research recommendations

The documentation places **multi-agent research** in a later phase, so I would not make that a prerequisite for the first working Research page. 

---

## Final Research page concept

The page should ultimately feel like this:

```text
ACME TECHNOLOGIES
Technology • Lagos

Opportunity Score
94 / 100     🔥 Very High

────────────────────────────────────

EXECUTIVE SUMMARY

Acme is rapidly expanding...

────────────────────────────────────

WHY NOW? 🔥

38 new hires
New COO
Expansion into Ghana & Kenya

────────────────────────────────────

COMPANY
Overview • Business Model • Growth

────────────────────────────────────

INTELLIGENCE
Technology • Competitors • Current Situation

────────────────────────────────────

PROBLEMS
Potential pain points

────────────────────────────────────

OPPORTUNITIES
Services we can sell

────────────────────────────────────

DECISION MAKERS
Jane Smith — HR Director
★ Best person to contact

────────────────────────────────────

RECOMMENDED APPROACH

Lead with workforce scaling...

[Generate Outreach]

────────────────────────────────────

SOURCES & EVIDENCE
```

That should be the **core visual and functional specification** for the Research page. It connects directly to the product's central loop of **Discover → Research → Detect Signals → Score → Prioritize → Find Decision Maker → Generate Approach → Outreach**. 
