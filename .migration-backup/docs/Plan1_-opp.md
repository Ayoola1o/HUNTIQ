Yes. Before we generate the **next page image**, we should define exactly **what the page contains, what every element does, and how it will be implemented**. This is also consistent with your documentation: the image defines how it looks, while the specification defines what it does. 

Since we have just designed **Opportunities**, here is the complete functional specification for that page.

# HUNTIQ — Opportunities Page

## 1. Purpose of the page

The Opportunities page is where the user answers:

> **Which prospects are the best opportunities right now, why are they opportunities, how valuable are they, and what should I do next?**

It sits between HUNTIQ's **intelligence engine** and CRM.

The intelligence engine discovers companies, detects signals and calculates opportunity scores; the Opportunities page turns those intelligence results into prioritized sales opportunities. Your architecture explicitly separates `opportunities`, `opportunity_scores`, `score_factors`, `pipeline_stages`, and `deals`. 

---

# 2. Page structure

The page should contain these major areas:

### A. Global application shell

* HUNTIQ sidebar
* Global search
* Ask AI Copilot
* Notifications
* User/workspace menu

### B. Page header

* **Opportunities**
* Short description
* Date range
* Filters
* New Opportunity button

### C. KPI summary

* Total Opportunities
* Hot Opportunities
* High Priority
* Pipeline Value
* Expected Revenue
* Average Deal Size

### D. Opportunity controls

* All
* Hot
* High
* Medium
* Low
* Won
* Lost
* List/Grid toggle
* Export

### E. Opportunity list/table

Each opportunity should show:

* Company
* Opportunity score
* Priority
* Why it is an opportunity
* Estimated value
* Pipeline stage
* Last activity
* Actions

### F. Opportunity intelligence drawer

When a row is selected:

* Company
* Score
* Score explanation
* Why it's an opportunity
* Signals
* Best next step
* Company details
* Actions

### G. Analytics

* Opportunities by Stage
* Opportunity Score Distribution
* Recent Opportunity Activity

This is deliberately different from the main Dashboard. The Dashboard answers **"What is happening and what should I do next?"**, while this page is specifically for working through the opportunity universe. 

---

# 3. KPI cards

## Total Opportunities

Example:

**284**

Supporting metric:

> ↑ 24.7% vs last 30 days

### Function

Shows the total number of active opportunity records matching the current workspace/date/filter context.

### Interaction

Clicking it should return the opportunity list to:

**All Opportunities**

---

## Hot Opportunities

Example:

**68**

Definition:

> Opportunities whose score is above the configured hot threshold.

Your documentation defines the dashboard's hot opportunities in this way. 

### Function

Immediately filters the table to the highest-priority opportunities.

---

## High Priority

Shows opportunities that are strong but below the Hot threshold.

### Function

Filter:

```text
priority = HIGH
```

---

## Pipeline Value

Example:

**$428,600**

This represents the total estimated value of the opportunities currently represented.

### Backend

Conceptually:

```text
SUM(opportunity.value)
```

subject to workspace, stage and filter conditions.

---

## Expected Revenue

This should eventually be calculated using opportunity value × probability.

For example:

```text
expected_revenue =
opportunity_value × stage_probability
```

This is more useful than simply duplicating Pipeline Value.

---

## Average Deal Size

```text
total opportunity value
----------------------
number of opportunities
```

The displayed number should respect the active filters.

---

# 4. Opportunity filters

The tabs are important because they let the salesperson move rapidly from the entire opportunity universe to the opportunities requiring action.

### Tabs

```text
All Opportunities
Hot
High
Medium
Low
Won
Lost
```

### Additional filters

The **Filters** button should open a filter panel containing:

* Industry
* Location
* Company size
* Opportunity score
* Priority
* Pipeline stage
* Opportunity value
* Signal type
* Signal recency
* Assigned salesperson
* Created date
* Last activity
* Source

Some of these fields come directly from the underlying intelligence and CRM architecture rather than being merely visual filters.

---

# 5. Opportunity table

This is the heart of the page.

### Column 1 — Company

Example:

**Acme Technologies**

Underneath:

```text
Technology
250–500 employees
Lagos, Nigeria
```

### Function

Clicking the company should open its **Company Intelligence** page/drawer.

---

## Column 2 — Opportunity Score

Example:

### `94`

The score should be visually prominent.

The important thing is that the number is **not arbitrary AI decoration**.

HUNTIQ has a dedicated scoring system and `score_factors` data structure. 

Click:

> **View score breakdown**

should show:

```text
ICP Fit                 24/25
Buying Intent           23/25
Trigger Events          20/20
Decision Maker Access   13/15
Company Size             9/10
Engagement               5/5
-----------------------------
Total                   94/100
```

---

# 6. "Why It's an Opportunity"

This is one of the **most important HUNTIQ features**.

Instead of simply:

> Acme Technologies — Score 94

the system explains:

> **Hiring 38 employees + opened a second office + appointed a new COO.**

Then tags:

```text
Hiring
Expansion
Leadership
```

This implements the documented **"Why Now?"** concept. HUNTIQ should explain why the company deserves attention now rather than merely saying that it is a good prospect. 

---

# 7. Estimated opportunity value

Example:

**$35,000**

This should be based on:

* user's average deal value
* service/product configuration
* opportunity type
* potentially historical conversion data later

Initially, it can use the user's configured average deal value from onboarding.

Later:

```text
estimated_value =
ICP/service model
+
historical deals
+
company size
+
opportunity type
+
AI prediction
```

---

# 8. Pipeline Stage

Example:

**Discovery**

Possible stages:

```text
Discovery
Qualification
Proposal
Negotiation
Nurturing
Closed Won
Closed Lost
```

The exact pipeline can later be customizable per workspace.

### Function

Clicking the stage should allow an authorized user to move the opportunity.

Example:

```text
Discovery
↓
Qualification
↓
Proposal
↓
Negotiation
↓
Closed Won
```

---

# 9. Last Activity

Example:

> 🟢 2h ago

This should show the most recent meaningful interaction/activity.

Examples:

* Signal detected
* Email sent
* Email opened
* Contact researched
* Meeting completed
* Note added
* Stage changed
* Score changed

The system already distinguishes CRM activities from intelligence signals, which is important here. 

---

# 10. Opportunity detail drawer

When the user clicks **Acme Technologies**, don't immediately navigate away.

Open a right-side intelligence drawer.

This is what makes the page fast to operate.

---

## Header

```text
Acme Technologies
Technology • Lagos, Nigeria
```

Actions:

* Close
* More
* View Company

---

# 11. Opportunity Score section

Large:

### 94

Then:

**Hot Opportunity 🔥**

And:

> View score breakdown →

Clicking opens the scoring explanation.

---

# 12. Why it's an Opportunity

Example:

> Acme is in a high-growth phase, hiring aggressively, opened a new office and appointed a new COO.

This should be generated from actual signals/research, not fabricated text.

The product's intended intelligence loop is:

**Discover → Research → Detect Signals → Score → Prioritize → Find Decision Maker → Generate Approach → Outreach → Engagement → Pipeline → Conversion → Learn.** 

---

# 13. Top Signals

Example:

### Hiring Surge

38 new job postings

### New Office

Lagos, Nigeria

### Leadership Change

New COO appointed

Each signal should be clickable.

Clicking **Hiring Surge** could open:

> Signal Intelligence

with:

* What happened
* When it happened
* Source
* Confidence
* Importance
* Evidence
* Related company data

The database architecture specifically gives signals fields such as `signal_type`, `company_id`, `source`, `detected_at`, `confidence`, `importance`, and `description`. 

---

# 14. Best Next Step

This is another critical HUNTIQ feature.

Instead of leaving the salesperson to decide what to do:

> **Best Next Step**

Example:

> Contact the Head of People to discuss workforce scaling and talent strategy.

Then:

### `Start Outreach`

and:

### `View Company`

Eventually there can also be:

* Find decision maker
* Research company
* Create task
* Schedule meeting
* Add note
* Add to campaign

---

# 15. Start Outreach

When clicked, HUNTIQ should not automatically send an email.

It should open the Outreach workflow with:

```text
Target contact
Why now
Recommended angle
AI-generated message
Personalization
Edit
Approve
Send
```

This follows the project's principle that AI actions should be authorized and auditable rather than unrestricted. 

---

# 16. Company Details

The drawer should give enough context without becoming the full Company Intelligence page.

Example:

```text
Employees       250–500
Revenue         $25M–$50M
Industry        Technology
Website         acmetech.com
LinkedIn        View Profile
```

The full research experience belongs on the Company Intelligence/Research pages, not here.

---

# 17. Opportunities by Stage

Bottom-left chart.

Example:

```text
Discovery       68
Qualification   54
Proposal        42
Negotiation     38
Nurturing       52
Closed Won      14
Closed Lost     16
```

### Function

Clicking a stage filters the opportunity table.

For example:

> Click **Proposal**

→ show only Proposal opportunities.

---

# 18. Opportunity Score Distribution

Shows:

```text
0–49       Low
50–69      Medium
70–89      High
90–100     Hot
```

This gives the salesperson an immediate understanding of the quality of their opportunity pool.

Clicking a range should filter the table.

---

# 19. Recent Opportunity Activity

Examples:

> New signal detected for Acme Technologies

> FinServe Ltd moved to Qualification

> Delta Systems score increased to 87

> Vertex Solutions added to opportunities

> Nimbus Analytics research completed

This gives the page a real-time operational feel.

---

# 20. New Opportunity

The **+ New Opportunity** button is important because not every opportunity will necessarily originate from AI discovery.

It should open:

### Create Opportunity

Fields:

* Company
* Contact
* Opportunity name
* Value
* Stage
* Probability
* Expected close date
* Source
* Owner
* Notes

But we should distinguish:

### AI-generated opportunity

from

### Manually created opportunity

That distinction will become useful for analytics later.

---

# 21. AI functionality

The Opportunities page should be connected to the AI Copilot.

For example, the user could ask:

> **"Show me opportunities above 85 that have new buying signals."**

Or:

> **"Which opportunities should I contact today?"**

Or:

> **"Why did Acme's score increase?"**

The AI can use the opportunity, company and signal tools rather than independently inventing information.

The documented Copilot architecture specifically includes opportunity lookup and signal lookup as core capabilities. 

---

# 22. Backend implementation

The core entities should be roughly:

```text
opportunities
----------------
id
organization_id
company_id
contact_id
owner_id
name
value
currency
stage_id
probability
score
priority
status
source
expected_close_date
created_at
updated_at
```

Then:

```text
opportunity_scores
------------------
id
opportunity_id
total_score
icp_fit
buying_intent
trigger_events
decision_maker_access
company_size
engagement
calculated_at
```

And:

```text
score_factors
-------------
id
opportunity_id
factor_type
score
weight
reason
evidence
created_at
```

And:

```text
opportunity_signals
-------------------
opportunity_id
signal_id
relevance
```

This lets the UI answer **why** the score exists rather than storing only `score = 94`.

---

# 23. API layer

The frontend should not directly manipulate the database.

We should expose services such as:

```text
GET /api/opportunities
GET /api/opportunities/:id
POST /api/opportunities
PATCH /api/opportunities/:id
DELETE /api/opportunities/:id

GET /api/opportunities/:id/score
GET /api/opportunities/:id/signals
GET /api/opportunities/:id/activity

POST /api/opportunities/:id/recalculate-score
POST /api/opportunities/:id/start-outreach

GET /api/opportunities/analytics
```

Filters should be passed through query parameters.

For example:

```text
/api/opportunities?
priority=hot
stage=discovery
min_score=80
signal=hiring
```

---

# 24. AI scoring architecture

The **Scoring Agent** calculates opportunity probability, while the Signal Agent detects meaningful events and the Decision-Maker Agent identifies relevant people. 

So:

```text
Company
   ↓
Signals
   ↓
Research
   ↓
ICP Match
   ↓
Scoring Agent
   ↓
Opportunity Score
   ↓
Opportunity
   ↓
Salesperson
```

Later, when actual outcomes accumulate:

```text
Score
 ↓
Contact
 ↓
Engagement
 ↓
Deal
 ↓
Won/Lost
 ↓
Learning
 ↓
Improved scoring
```

That is how HUNTIQ eventually becomes more intelligent rather than simply adding more AI text.

---

# 25. Permissions

The frontend should not simply hide buttons.

Backend authorization should determine whether someone can:

* View opportunities
* Create opportunities
* Edit opportunities
* Change stages
* Assign opportunities
* Delete opportunities
* Start outreach
* Export data
* View team-wide opportunities

Your dashboard documentation explicitly requires backend-enforced workspace roles rather than frontend-only restrictions. 

---

# 26. Loading / empty / error states

We need these from the beginning.

### Loading

Use skeletons rather than:

> Loading...

The existing specification explicitly requires skeleton loading while preserving card dimensions. 

### No opportunities

Instead of empty charts:

> **No opportunities yet**

> Start by finding prospects with HUNTIQ's AI.

**Find Prospects**

### Error

> **Opportunity data temporarily unavailable**

**Retry**

Other page components should continue functioning.

---

# 27. Performance implementation

Don't calculate everything when the page opens.

Use:

* Cached KPI summaries
* Paginated opportunities
* Server-side filtering
* Lazy-loaded analytics
* Cached score results
* Background score recalculation
* Background signal processing
* Indexed company/opportunity queries

The existing architecture specifically warns against fetching every prospect, running AI research on dashboard/page load, and synchronously recalculating expensive scores. 

---

# 28. What belongs here — and what does NOT

### Opportunities page DOES:

✅ Rank opportunities
✅ Explain opportunity scores
✅ Show why-now signals
✅ Show opportunity value
✅ Show pipeline stage
✅ Recommend next action
✅ Let salespeople update opportunities
✅ Connect to outreach
✅ Connect to company intelligence
✅ Connect to AI Copilot
✅ Show opportunity analytics

### Opportunities page DOES NOT:

❌ Become the full CRM Pipeline
❌ Become the full Company Research page
❌ Become the full Contacts database
❌ Become the Campaign Builder
❌ Become the Email Inbox
❌ Become the full Signals monitoring page

That separation is important because each HUNTIQ page needs a clear job.

---

## Final architecture

The page we're building should therefore work like this:

```text
                 HUNTIQ INTELLIGENCE
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
       Companies      Signals      Research
          │             │             │
          └─────────────┼─────────────┘
                        ↓
                OPPORTUNITY ENGINE
                        │
              ┌─────────┴─────────┐
              ↓                   ↓
        ICP Matching        Score Engine
              │                   │
              └─────────┬─────────┘
                        ↓
                 OPPORTUNITIES PAGE
                        │
       ┌────────────────┼────────────────┐
       ↓                ↓                ↓
   Prioritize       Understand       Take Action
       │                │                │
       ↓                ↓                ↓
     Score          Why Now         Outreach
     Value          Signals         Contact
     Stage          Evidence        Task
                                      Pipeline
```

**This is the specification we should use alongside the generated Opportunities image.** The image is the visual reference; this defines the actual product behavior.

And importantly, **we should use this same process for every remaining HUNTIQ page: first define the content + functionality + implementation, then generate the image.**
