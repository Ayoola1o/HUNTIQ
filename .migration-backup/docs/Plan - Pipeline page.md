Yes. For the **SELL → Pipeline** page, we should now shift the product from the intelligence side into the **execution and revenue-management side**.

Your documentation explicitly places **Pipeline** under **SELL**, alongside Campaigns, Outreach, Tasks and Meetings.  It also defines the CRM pipeline as the place where the intelligence engine feeds what happens **after an opportunity has been identified**. 

# HUNTIQ — SELL → Pipeline

## 1. Main purpose

The Pipeline page answers:

> **"What opportunities are we actively selling, where is each deal in the sales process, what is the potential revenue, and what needs to happen next?"**

This is different from **COMMAND → Opportunities**.

### Opportunities

Focuses on:

> **Which prospects are worth pursuing?**

### Pipeline

Focuses on:

> **What is already being pursued, and how close is it to becoming revenue?**

The overall flow is:

```text
HUNT
  ↓
Find Prospect
  ↓
Research
  ↓
Score
  ↓
Decision Maker
  ↓
Outreach
  ↓
SELL
  ↓
PIPELINE
  ↓
Won / Lost
```

The documentation's core product loop explicitly ends with **Pipeline → Conversion → Learn from Outcome**. 

---

# 2. Pipeline page structure

The page should be visually organized like this:

```text
┌──────────────────────────────────────────────────────────────┐
│ PIPELINE                                                     │
│ Manage active opportunities and forecast revenue             │
│                                                              │
│ [Search pipeline...] [Filters] [View] [+ New Opportunity]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Pipeline KPIs                                                │
│ Active Deals | Pipeline Value | Expected Revenue | Win Rate │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [All] [My Deals] [At Risk] [Closing Soon]                   │
│                                                              │
│ KANBAN PIPELINE                                              │
│                                                              │
│ Contacted │ Meeting │ Proposal │ Negotiation │ Won │ Lost   │
│           │         │          │             │     │        │
│ Deal      │ Deal    │ Deal     │ Deal        │ Deal│ Deal   │
│ Cards     │ Cards   │ Cards    │ Cards       │     │        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The documentation specifically gives the example pipeline stages:

* Contacted
* Meeting
* Proposal
* Negotiation
* Won

and states that the pipeline should provide a quick CRM view. 

---

# 3. Header

## Pipeline

Subtitle:

> **Manage your active opportunities, deals and revenue forecast.**

On the right:

### + New Opportunity

Secondary:

### Ask AI Copilot

The AI Copilot should eventually answer questions such as:

> "Which deals are most likely to close this month?"

> "Which opportunities have been stuck in proposal for more than 14 days?"

> "What deals are at risk?"

The documentation explicitly lists **pipeline queries** as a P0 Copilot capability. 

---

# 4. Global pipeline search

Search placeholder:

> **Search companies, contacts, opportunities...**

Examples:

> Acme Technologies

> Jane Smith

> HR consulting

> Proposal

Search should return matching:

* Companies
* Contacts
* Opportunities
* Deals

---

# 5. Pipeline KPI cards

These are the top summary indicators.

## Active Deals

Example:

**86**

Definition:

> Number of opportunities currently active in the pipeline.

This directly corresponds to the dashboard definition of active deals as deals currently in the sales pipeline. 

---

## Pipeline Value

Example:

# $428,600

Definition:

> Total value of active opportunities/deals.

The dashboard documentation defines Pipeline Value as the sum of active opportunity/deal values. 

---

## Expected Revenue

Example:

# $176,400

This should be **probability-weighted** rather than simply adding all deals.

Formula:

```text
Expected Revenue =
Deal Value × Probability
```

For example:

```text
$20,000 × 70%
=
$14,000
```

The documentation explicitly defines this calculation. 

---

## Win Rate

Example:

**24.8%**

Formula:

```text
Won Opportunities
-------------------------
Closed Opportunities
```

The documentation gives this exact definition. 

---

## Average Deal Size

Example:

**$4,984**

Formula:

```text
Total Deal Value
----------------
Active Deals
```

This calculation is also specified in the dashboard documentation. 

---

## Average Sales Cycle

Example:

**31 days**

Definition:

> Number of days from qualified opportunity to won/lost.

The documentation defines Average Sales Cycle this way. 

---

# 6. Pipeline value should be dynamic

These values should respond to filters.

For example:

```text
All Deals
$428,600
```

Then the user selects:

> My Deals

and it becomes:

```text
$184,200
```

Select:

> Closing This Month

and it becomes:

```text
$72,400
```

---

# 7. Pipeline views

I recommend three main views.

### Kanban

Default.

### List

For users who want dense data.

### Forecast

Revenue-oriented view.

So:

```text
[Kanban] [List] [Forecast]
```

---

# 8. Kanban pipeline

The Kanban is the primary visual.

Columns:

### Contacted

### Meeting

### Proposal

### Negotiation

### Won

And optionally:

### Lost

The original documentation specifically illustrates:

```text
Contacted
Meeting
Proposal
Negotiation
Won
```

as the CRM pipeline stages. 

---

# 9. Contacted column

Example:

### Contacted

**18 deals**

Pipeline value:

**$82,000**

Cards:

```text
Acme Technologies
HR Consulting

$12,000
Score 94

Last activity:
Email sent 2h ago

Next:
Follow up tomorrow
```

---

# 10. Meeting column

Example:

### Meeting

**16 deals**

Value:

**$74,500**

Card:

```text
FinServe Ltd

Employee Training

$8,500

Meeting:
Tomorrow · 2:00 PM

Contact:
Jane Smith
HR Director
```

---

# 11. Proposal column

Example:

### Proposal

**18 deals**

Value:

**$96,000**

Card:

```text
Delta Systems

HR Transformation

$18,000

Proposal sent:
May 14

Viewed:
2 times

Next:
Follow up
```

---

# 12. Negotiation column

Example:

### Negotiation

**22 deals**

Value:

**$128,400**

Card:

```text
Vertex Solutions

Leadership Development

$24,000

Probability:
75%

Last activity:
Today

Next:
Negotiation call
```

This should be the most commercially important stage.

---

# 13. Won column

Example:

### Won

**12 deals**

Value:

**$47,700**

Card:

```text
Nimbus Analytics

HR Consulting

$9,500

Won:
May 16

Owner:
John
```

Won deals should remain visible for historical context but not be counted as active pipeline.

---

# 14. Lost column

Lost should either be:

* A visible sixth column, or
* A separate filter/tab.

I recommend the second approach to keep the primary Kanban cleaner.

Filter:

### Lost

Then show:

* Lost reason
* Deal value
* Competitor
* Date lost
* Sales cycle

---

# 15. Deal card structure

Every opportunity card should answer:

> **What is this deal, how much is it worth, how likely is it to close, and what happens next?**

Card:

```text
Acme Technologies
HR Consulting

$18,000
72% probability

Opportunity Score: 94

Jane Smith
Head of People

Last activity:
Proposal viewed · 2h ago

Next action:
Follow up tomorrow
```

---

# 16. Opportunity score vs deal probability

These must **not** be confused.

### Opportunity Score

Answers:

> How attractive/likely is this prospect as an opportunity?

### Deal Probability

Answers:

> Given that this is already in the pipeline, how likely is it to close?

Example:

```text
Opportunity Score     94/100
Deal Probability      72%
```

A prospect can have a very high opportunity score but still have a low close probability because the sales process has barely started.

---

# 17. Drag-and-drop

Users should be able to move a deal:

```text
Contacted
    ↓
Meeting
    ↓
Proposal
    ↓
Negotiation
    ↓
Won
```

When dragged:

> **Move Acme Technologies to Proposal?**

The system should record:

* Previous stage
* New stage
* User
* Timestamp
* Reason, if required

This becomes part of the opportunity history.

---

# 18. Important implementation rule

Do **not** update a deal's stage merely because the user drags a card visually and then loses connection.

The server should be the source of truth.

Flow:

```text
Drag card
   ↓
Optimistic UI
   ↓
PATCH /api/opportunities/:id
   ↓
Server validates
   ↓
Database updated
   ↓
Activity recorded
   ↓
UI confirmed
```

If it fails:

```text
Revert card
+
Show error
```

---

# 19. + New Opportunity

Clicking:

### + New Opportunity

opens:

# Create Opportunity

Fields:

### Company

Search/select company.

### Contact

Select decision maker/contact.

### Opportunity Name

Example:

> HR Transformation Project

### Value

> $18,000

### Currency

> USD

### Stage

> Contacted

### Probability

> 20%

### Expected Close Date

> June 30

### Owner

> John

### Source

Examples:

* Prospecting
* Referral
* Campaign
* Inbound
* Existing relationship
* Other

### Notes

Free text.

---

# 20. Creating an opportunity from Intelligence

This is where HUNTIQ becomes different from a normal CRM.

On Company Intelligence:

### Create Opportunity

HUNTIQ can pre-fill:

```text
Company
↓
Recommended Contact
↓
Potential Service
↓
Opportunity Score
↓
Signals
↓
Recommended Approach
```

So the salesperson doesn't start from a blank CRM form.

---

# 21. Opportunity detail drawer

Clicking a deal should open a right-side drawer.

Example:

# Acme Technologies

### HR Transformation Project

**$18,000**

**Proposal**

**72% probability**

**Expected revenue: $12,960**

---

# 22. Opportunity summary

The drawer should show:

### Company

Acme Technologies

### Contact

Jane Smith

### Service

HR Consulting

### Owner

John

### Created

May 2

### Expected close

June 30

---

# 23. Opportunity score

Show:

### Opportunity Score

**94 / 100**

Then:

> High ICP fit + hiring surge + expansion + new HR leadership.

The scoring system is part of the intelligence engine and should feed the CRM rather than being disconnected from it. 

---

# 24. Deal probability

Separate card:

### Close Probability

**72%**

Allow authorized users to update it manually.

Later, the predictive scoring system can recommend probability automatically.

The documentation places **predictive scoring** and **revenue forecasting** in a later phase, so the MVP should not depend on advanced predictive forecasting. 

---

# 25. Expected revenue

Display:

```text
Deal Value
$18,000

Probability
72%

Expected Revenue
$12,960
```

This should update automatically when either value or probability changes.

---

# 26. Next Action

Every active opportunity should have:

### Next Action

Example:

> Follow up with Jane Smith

Due:

> Tomorrow · 10:00 AM

This connects Pipeline with:

### SELL → Tasks

The documentation includes **Notes/Tasks** as part of the Phase 1 CRM MVP. 

---

# 27. Activity timeline

The opportunity drawer should contain:

## Activity

```text
May 16
Proposal viewed by Jane Smith

May 15
Proposal sent

May 14
Meeting completed

May 10
Email sent

May 8
Opportunity created
```

The documentation's Recent Activity examples include email activity, tasks, opportunities and deals moving to Proposal. 

---

# 28. Notes

### Notes

Users can add:

> Jane is interested but needs approval from COO.

Notes should be timestamped and attributed to the author.

---

# 29. Tasks

Inside the opportunity:

### Tasks

```text
☐ Follow up with Jane
☐ Send revised proposal
☐ Schedule negotiation call
```

Completing a task should create an activity.

---

# 30. Emails

Where email integration exists:

```text
Emails
──────────────
Sent
Opened
Replied
```

However, email integration is explicitly listed as **Phase 2**, so the first Pipeline implementation can use activity placeholders/manual activities and add live email integration later. 

---

# 31. Meetings

The opportunity should show associated meetings.

Example:

### Upcoming Meeting

**Negotiation Call**

June 4 · 2:00 PM

**Jane Smith**

Buttons:

**Open Meeting**

**Mark Complete**

The actual Meetings page belongs under SELL, so the Pipeline should link to it rather than duplicate the full meeting-management system.

---

# 32. At-risk opportunities

This should be one of the most useful Pipeline features.

Filter:

### At Risk

Examples:

```text
Acme Technologies
Proposal
$18,000

⚠ No activity for 12 days
```

or:

```text
FinServe Ltd
Negotiation
$32,000

⚠ Expected close date passed
```

or:

```text
Delta Systems
Meeting
$14,000

⚠ Contact hasn't responded
```

---

# 33. Closing Soon

Filter:

### Closing Soon

Show deals where:

```text
Expected Close Date
≤ configured period
```

Example:

> Closing within 7 days

This makes Pipeline actionable rather than merely visual.

---

# 34. Stale deals

Another filter:

### Stale

Definition:

> No meaningful activity for a configurable number of days.

Example:

> No activity for 14 days.

This is important because the system should help users identify where sales opportunities are being neglected.

---

# 35. Forecast view

The third major Pipeline view should be:

# Forecast

Show:

```text
Pipeline
$428,600

Expected
$176,400

Committed
$102,000

Best Case
$238,000
```

However, **Committed/Best Case forecasting is an extension**, not something explicitly defined in the supplied documentation. I would therefore make these P1/P2 rather than mandatory MVP components.

The documentation does explicitly identify pipeline value, expected revenue, win rate, sales cycle and pipeline velocity. 

---

# 36. Pipeline velocity

Show:

### Pipeline Velocity

> **$42,600 / month**

This measures potential revenue moving through the pipeline over time.

The documentation specifically calls Pipeline Velocity:

> Potential revenue generated over time. 

Implementation should define the exact calculation before coding, because the source documentation does not specify a single formula.

---

# 37. Pipeline analytics

Below the Kanban, provide:

### Deals by Stage

```text
Contacted     18
Meeting       16
Proposal      18
Negotiation   22
Won           12
```

### Value by Stage

```text
Contacted       $82K
Meeting         $74K
Proposal        $96K
Negotiation    $128K
Won             $48K
```

### Win Rate

```text
24.8%
```

### Average Sales Cycle

```text
31 days
```

These metrics are directly supported by the documentation. 

---

# 38. Pipeline filters

The filter drawer should contain:

### Owner

* Me
* Team member
* Everyone

### Stage

* Contacted
* Meeting
* Proposal
* Negotiation
* Won
* Lost

### Opportunity Score

* 90–100
* 70–89
* 50–69
* Below 50

### Deal Value

Custom range.

### Probability

Custom range.

### Close Date

* Today
* This week
* This month
* This quarter
* Overdue

### Status

* Active
* Won
* Lost
* At risk
* Stale

---

# 39. Search and sorting

Sort by:

* Highest deal value
* Highest probability
* Highest expected revenue
* Highest opportunity score
* Closing soonest
* Recently updated
* Oldest activity
* Recently created

Default Kanban order:

> Most recently active deals at the top.

---

# 40. Pipeline stages database

Your documentation explicitly includes:

```text
opportunities
pipeline_stages
deals
```

as separate entities. 

A practical implementation:

```text
pipeline_stages
-------------------------
id
organization_id
name
position
probability
is_closed
is_won
is_lost
created_at
updated_at
```

Example:

```text
1  Contacted
2  Meeting
3  Proposal
4  Negotiation
5  Won
6  Lost
```

---

# 41. Opportunities table

```text
opportunities
-------------------------
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
expected_close_date
opportunity_score
source
status
created_at
updated_at
```

Again, this is an implementation proposal based on the documented entities and functionality; the source does not specify this exact field list.

---

# 42. Deal vs Opportunity

Because your documentation contains both:

```text
Opportunities
Deals
```

we need a clear distinction.

I recommend:

### Opportunity

The commercial opportunity being pursued.

Example:

> Acme needs HR consulting.

### Deal

The concrete commercial transaction associated with the opportunity.

Example:

> Acme HR Transformation — $18,000.

This allows an opportunity to eventually contain one or more deal records if the product later supports more complex sales processes.

The documentation itself does not explicitly define this distinction, so this is a **recommended implementation interpretation**, not a source-defined rule.

---

# 43. Pipeline API

Recommended initial endpoints:

```text
GET    /api/pipeline
GET    /api/pipeline/metrics
GET    /api/pipeline/stages

GET    /api/opportunities
POST   /api/opportunities
GET    /api/opportunities/:id
PATCH  /api/opportunities/:id

PATCH  /api/opportunities/:id/stage
PATCH  /api/opportunities/:id/probability

GET    /api/opportunities/:id/activities
POST   /api/opportunities/:id/notes
POST   /api/opportunities/:id/tasks

POST   /api/opportunities/:id/won
POST   /api/opportunities/:id/lost
```

---

# 44. Moving a deal through the pipeline

Example:

```text
POST /api/opportunities/123/stage
```

Request:

```text
stage = proposal
```

Backend:

```text
Validate organization
        ↓
Validate permission
        ↓
Validate stage
        ↓
Update opportunity
        ↓
Create activity
        ↓
Update probability if configured
        ↓
Recalculate expected revenue
        ↓
Return updated opportunity
```

---

# 45. Won flow

When the user clicks:

### Mark Won

Do not immediately make it disappear.

Open confirmation:

# Mark opportunity as Won?

> Acme Technologies — HR Transformation

Value:

**$18,000**

Close date:

**June 4**

Optional:

### Actual value

**$18,000**

### Outcome note

> Client signed annual HR consulting agreement.

Then:

### Confirm Won

The deal moves into Won.

---

# 46. Lost flow

Click:

### Mark Lost

Require:

### Lost reason

Options:

* Competitor
* Budget
* Timing
* No response
* Not a fit
* Internal decision
* Other

Optional:

### Notes

This is important because the documentation says the system should eventually **learn from outcomes** and improve scoring. 

---

# 47. Learning from pipeline outcomes

Eventually:

```text
Opportunity
 ↓
Won/Lost
 ↓
Outcome data
 ↓
Scoring system
 ↓
Learn which signals correlate with wins
 ↓
Improve opportunity scoring
```

For example:

> Companies with hiring + leadership + expansion signals converted 2.4× better.

That becomes valuable intelligence for future prospecting.

Predictive scoring is a later-phase capability, however, so the MVP should first **capture clean outcome data** rather than pretending to have sophisticated predictive learning from day one. 

---

# 48. AI Copilot inside Pipeline

The page should have contextual AI.

Button:

### Ask about Pipeline

Examples:

> Which deals should I focus on today?

> Show me deals at risk.

> Which opportunities have been stuck in Proposal?

> What is my expected revenue this month?

> Which deals are most likely to close?

> Why has pipeline value decreased?

The Copilot can use controlled tools such as:

```text
get_opportunities()
get_pipeline()
get_deal()
get_activities()
get_tasks()
```

The documentation explicitly requires Pipeline queries as part of the Copilot MVP. 

---

# 49. AI recommendations

A deal card can eventually show:

### AI Recommendation

> Follow up with Jane today. The proposal was viewed twice but there has been no response for three days.

Or:

> This opportunity may be at risk because the expected close date is in 4 days and there has been no activity for 9 days.

This should be **advisory**, not automatic.

The documentation explicitly warns against AI automatically executing sensitive actions without confirmation. 

---

# 50. Pipeline notifications

Pipeline can generate notifications for:

* Deal moved stage
* Proposal viewed
* Contact replied
* Meeting approaching
* Task overdue
* Deal becoming stale
* Expected close date approaching
* Opportunity won
* Opportunity lost

The dashboard documentation already defines meeting, follow-up, email and task notifications. 

---

# 51. Empty state

If there are no deals:

# Your pipeline is empty

> Start by turning a qualified prospect into an opportunity.

Primary:

### Find Prospects

Secondary:

### Create Opportunity

This keeps the intelligence-to-CRM relationship intact.

---

# 52. Loading state

Use skeleton Kanban columns:

```text
Contacted
────────────
██████████
████████
██████████

Meeting
────────────
████████
██████████
```

Do not freeze the whole application.

---

# 53. Error state

If the pipeline fails to load:

# Couldn't load your pipeline

> Your opportunities couldn't be retrieved right now.

Buttons:

**Retry**

**Ask AI Copilot**

---

# 54. Permissions

Pipeline data must be organization-scoped.

A salesperson might see:

> My Opportunities

while a manager can see:

> Team Pipeline

and an admin can see:

> Entire Organization

The backend—not just the UI—must enforce this.

The product architecture requires workspace authorization and controlled AI actions. 

---

# 55. Audit trail

Every important CRM mutation should be logged:

```text
Opportunity created
Stage changed
Probability changed
Value changed
Owner changed
Won
Lost
```

Example:

> John moved Acme Technologies from Proposal → Negotiation.

This becomes especially important when AI is allowed to suggest or eventually execute CRM actions.

---

# 56. Responsive behavior

### Desktop

Full Kanban:

```text
Contacted | Meeting | Proposal | Negotiation | Won
```

### Tablet

Horizontal scrolling.

### Mobile

One stage at a time:

```text
← Contacted  18 →

Acme Technologies
$18,000
72%

[View]
```

The full Kanban should not be squeezed into tiny columns.

---

# 57. MVP implementation priority

## P0 — Pipeline MVP

Build:

* Pipeline Kanban
* Contacted
* Meeting
* Proposal
* Negotiation
* Won
* Lost
* Create opportunity
* Edit opportunity
* Deal value
* Probability
* Expected revenue
* Owner
* Company/contact
* Drag/drop stage changes
* Opportunity detail
* Activity timeline
* Notes
* Tasks
* Basic filters
* Pipeline metrics

This is justified because **CRM Pipeline** is explicitly part of Phase 1 of the Intelligence MVP, together with Notes/Tasks. 

---

## P1 — Sales execution

Add:

* Email integration
* Meeting integration
* Automated follow-ups
* Deal alerts
* Proposal tracking
* At-risk detection
* AI pipeline recommendations

Email integration, campaigns, automated follow-ups and related capabilities are identified as Phase 2. 

---

## P2 — Revenue intelligence

Add:

* Predictive close probability
* Revenue forecasting
* Pipeline forecasting
* Deal health scoring
* AI-generated sales strategy
* Team performance analysis
* Forecast accuracy
* Outcome-based scoring improvements

Predictive scoring and revenue forecasting are explicitly listed in Phase 3. 

---

# 58. The most important relationship

The Pipeline page should **consume intelligence generated elsewhere**.

For example:

```text
COMPANY
Acme Technologies
        ↓
RESEARCH
Growing rapidly
        ↓
SIGNALS
Hiring + Expansion + Leadership
        ↓
OPPORTUNITY SCORE
94/100
        ↓
CONTACT
Jane Smith — Head of People
        ↓
OUTREACH
Personalized HR consulting message
        ↓
OPPORTUNITY
HR Transformation
        ↓
PIPELINE
Proposal
        ↓
$18,000
72% probability
        ↓
WON
```

This is the fundamental architecture of HUNTIQ: the **Intelligence Engine feeds the CRM**, rather than the CRM existing as a disconnected database. 

## Final design principle

The Pipeline page should therefore feel less like:

> **"Here are some CRM cards."**

and more like:

> **"Here is the money currently in motion, what is most likely to close, what is stuck, what needs my attention, and what I should do next."**

That makes **SELL → Pipeline** the natural execution layer after everything we've designed under **COMMAND + HUNT**.
