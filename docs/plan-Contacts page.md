Yes. Since the image we just generated is the **Contacts page**, let's lock down its functional specification before generating another screen. This prevents the implementation agent from treating it as just a pretty table.

# HUNTIQ — Contacts Page Specification

## 1. Purpose

The Contacts page manages the **people behind the companies HUNTIQ discovers**.

It should answer:

* Who are the relevant people?
* What company do they work for?
* What is their role?
* Are they a decision-maker?
* How influential are they?
* How strong is their opportunity fit?
* What happened during the last interaction?
* What should I do next?
* Which opportunities are associated with them?

The key distinction:

> **Companies = accounts.**
> **Contacts = people inside those accounts.**

A contact can belong to one company, change companies, influence multiple opportunities, and have a complete interaction history.

---

# 2. Page structure

```text id="contact-layout"
┌──────────────────────────────────────────────────────────────┐
│ Sidebar │ Contacts                 Search │ Copilot │ User   │
├─────────┴────────────────────────────────────────────────────┤
│                                                              │
│ Contacts                                                     │
│ Discover, manage and engage the right people at target      │
│ accounts.                                                    │
│                                                              │
│ KPI CARDS                                                    │
│ Total | New | Changed Roles | High Influence | Contacted    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ All Contacts | My Contacts | Bookmarked | Recent Activity   │
│                                                              │
│ Search | Company | Role | Location | More Filters            │
│                                                              │
├──────────────────────────────────────────────┬───────────────┤
│                                              │               │
│ CONTACT TABLE                                │ CONTACT DRAWER│
│                                              │               │
│ Name | Company | Role | Influence | Fit      │ Profile       │
│      |         |      | Activity | Source    │ Intelligence  │
│                                              │ Opportunities │
│                                              │ Activity      │
│                                              │ Notes         │
│                                              │               │
└──────────────────────────────────────────────┴───────────────┘
```

---

# 3. Header

### Title

**Contacts**

Subtitle:

> Discover, manage and engage the right people at target accounts.

Actions:

### Search

Search:

* Name
* Email
* Company
* Role
* Phone

### Ask AI Copilot

Examples:

> "Show me HR decision-makers at companies with high buying intent."

> "Find contacts I haven't followed up with."

---

# 4. KPI cards

The KPI cards provide a quick overview of the contact database.

## Total Contacts

Example:

**8,642**

Definition:

Total contacts accessible within the user's workspace.

---

## New Contacts

Example:

**432**

Contacts added during the selected period.

---

## Changed Roles

Example:

**128**

Contacts where HUNTIQ detected a role/company change.

This is particularly valuable because a job change can create a **new sales opportunity**.

Example:

> Sarah Johnson moved from Company A → Company B.

---

## High Influence

Example:

**1,247**

Contacts classified as high-influence based on role, seniority and/or configured scoring.

---

## Contacted

Example:

**1,843**

Contacts with at least one outbound interaction.

---

## Replied

Example:

**623**

Contacts who have responded to an outreach interaction.

---

# 5. Contact tabs

### All Contacts

Entire accessible database.

### My Contacts

Contacts assigned to the current user.

### Bookmarked

Contacts manually saved by the user.

### Recent Activity

Contacts with the most recent interaction or detected event.

These should be URL/query-state driven so users can share or reload a filtered view without losing context.

---

# 6. Search and filtering

The filtering system is extremely important.

### Search

Search across:

```text
Name
Email
Company
Job title
```

### Company

Examples:

* Acme Technologies
* FinServe
* Delta Systems

### Role

Examples:

* CEO
* CFO
* CTO
* HR Director
* Head of People
* COO

### Location

Examples:

* Lagos
* Abuja
* New York
* London

---

# 7. Advanced filters

The `More Filters` menu should support:

### Contact status

* New
* Contacted
* Engaged
* Replied
* Qualified
* Unresponsive

### Influence

* Very High
* High
* Medium
* Low

### Opportunity fit

* Excellent
* Very Good
* Good
* Fair
* Poor

### Decision-maker status

* Decision Maker
* Influencer
* Champion
* Unknown

### Activity

* Contacted recently
* No activity
* Replied
* Email opened
* Website visit
* Meeting scheduled

### Source

* HUNTIQ discovery
* Import
* Manual
* CRM integration
* Enrichment provider

### Tags

Examples:

`HR`

`Decision Maker`

`High Influence`

`Hiring`

`Enterprise`

---

# 8. Saved Views

Users should be able to save filter combinations.

Example:

### "Hot HR Decision Makers"

Filters:

```text
Role = HR
Influence = Very High
Opportunity Fit = Excellent
Location = Lagos
```

Save it.

Then it appears under:

**Saved Views**

This becomes extremely useful for recurring prospecting.

---

# 9. Contact table

The table should contain:

### Checkbox

For bulk actions.

### Contact

Display:

* Avatar
* Name
* Email
* Verification indicator

### Company

Display:

* Company name
* Location

### Role

Display:

* Job title
* Decision Maker / Influencer badge

### Influence

Example:

**94**

Very High

### Opportunity Fit

Example:

**94**

Excellent

### Last Activity

Example:

> Email opened
> 2h ago

### Source

Examples:

* LinkedIn
* Email
* HUNTIQ
* Import

### Bookmark

Star icon.

### More

Three-dot action menu.

---

# 10. Contact scoring

There should be **two different scores**.

This is important.

## Influence Score

How important is this person within their organization?

Example:

```text
Role seniority
Decision authority
Department relevance
Company size
Organizational position
```

---

## Opportunity Fit

How suitable is this specific contact for the user's current offering?

Example:

A CEO might have:

**Influence: 97**

but:

**Opportunity Fit: 72**

while the Head of People might have:

**Influence: 91**

and:

**Opportunity Fit: 96**

The AI can therefore recommend:

> **Contact the Head of People first.**

This is much more useful than simply ranking people by seniority.

---

# 11. Contact detail drawer

Clicking a contact should open a right-side drawer rather than immediately taking the user away from the contact list.

The drawer contains:

### Header

Avatar

**Jane Smith**

**94 — Very High Influence**

**Head of People**

Acme Technologies

Lagos, Nigeria

---

# 12. Quick actions

Buttons:

### Email

Opens email composer.

### LinkedIn

Opens the available profile/reference.

### Call

Starts or records a call workflow if calling integration exists.

### More

Additional actions.

Potential actions:

* Add task
* Add note
* Bookmark
* Assign
* Add tag
* Add to campaign
* View company
* View opportunity
* Mark as decision-maker
* Archive

---

# 13. Contact drawer tabs

## Overview

Core profile information.

## Activity

Complete chronological interaction history.

## Details

Contact metadata.

## Notes

Internal notes.

## Files

Associated documents.

Potential later tabs:

**Research**

**AI Insights**

---

# 14. Overview section

Display:

### About

AI-generated summary based on verified/enriched information.

Example:

> Head of People leading HR strategy, talent management and organizational development.

---

### Contact information

* Email
* Phone
* Location
* Timezone
* Website/social profiles where available

---

### Company

**Acme Technologies**

Technology

250–500 employees

`View Company`

---

# 15. AI Insights

This is one of the most valuable parts of the drawer.

Example:

### AI Insights

> Strong decision-maker for HR and People initiatives.

> High engagement with HR-related content.

> Recently expanded team by 34%.

> Opened a new office in Lagos.

But these need provenance.

The AI should distinguish:

**Observed**

> Company opened a new office.

from:

**Inference**

> This may indicate increased workforce planning needs.

---

# 16. Contact-to-company relationship

A contact should always be connected to a company record.

Database relationship:

```text id="contact-company"
Company
   │
   ├── Contact
   ├── Contact
   ├── Contact
   └── Contact
```

But contact history must support job changes.

Example:

```text id="career-history"
Sarah Johnson

Company A
HR Director
2022–2025

        ↓

Company B
Head of People
2025–Present
```

This allows HUNTIQ to detect:

> **Career Move**

which can become a sales signal.

---

# 17. Opportunities

The contact drawer should show opportunities associated with this person.

Example:

### Opportunities

**HR Consulting & Training**

$25,000

Score: **94**

High

---

**Leadership Development**

$15,000

Score: **82**

High

---

Then:

`View all opportunities`

---

# 18. Contact activity

Every interaction should be recorded.

Examples:

```text
Email sent
Email opened
Email replied
Call made
Call completed
Meeting scheduled
Meeting completed
LinkedIn interaction
Note added
Task completed
Campaign added
```

Timeline:

```text
Today
  Email opened
  10:42 AM

Yesterday
  Email sent
  3:18 PM

May 14
  Added to HR Consulting campaign

May 12
  Research completed
```

---

# 19. Bulk actions

Users should be able to select multiple contacts.

Example:

```text
☑ Jane
☑ Michael
☑ David
```

Then:

### Bulk Action Bar

* Add to campaign
* Assign
* Add tag
* Create task
* Export
* Bookmark
* Archive

Potential later:

* Generate outreach
* Research contacts

---

# 20. Add Contact

`+ Add Contact`

Modal:

### Contact information

* First name
* Last name
* Email
* Phone
* Job title
* Company
* Location

### Relationship

* Decision Maker
* Influencer
* Champion
* Other

### Tags

### Owner

### Notes

---

# 21. Import

`Import`

Support:

### CSV

Upload CSV and map columns:

```text
First Name → first_name
Last Name → last_name
Email → email
Company → company
Title → job_title
Phone → phone
```

Before importing:

### Duplicate detection

Example:

> 432 contacts detected
> 417 new
> 12 duplicates
> 3 invalid emails

Then:

`Import 417 Contacts`

---

# 22. Contact enrichment

A contact may initially only have:

```text
Name
Company
Role
```

HUNTIQ can enrich it with:

* Email
* Phone
* Location
* Social/profile references
* Career history
* Company relationship
* Decision-maker classification
* Influence score

Enrichment should be asynchronous.

Don't freeze the page while enrichment runs.

---

# 23. Contact verification

Email/contact information needs a confidence indicator.

Example:

🟢 **Verified**

🟡 **Likely**

⚪ **Unverified**

Don't represent an inferred email as verified.

---

# 24. AI actions

The Contacts page should integrate with the Copilot.

Example:

Select five contacts:

> **Ask AI**

Then:

> "Which of these people is most likely to be the decision-maker?"

AI analyzes the selected contacts and returns:

### Recommended

**Jane Smith — 94%**

Reason:

> Her role aligns directly with the identified opportunity.

---

# 25. Useful Copilot commands

From Contacts:

> "Show me all HR decision-makers."

> "Find contacts at my hot opportunities."

> "Who hasn't been contacted in 14 days?"

> "Show people who changed jobs recently."

> "Which contacts replied this week?"

> "Find high-influence contacts with no email."

> "Create outreach for these contacts."

---

# 26. Database model

Core table:

```text id="contacts-schema"
contacts
------------------------
id
workspace_id
first_name
last_name
email
phone
job_title
company_id
location
timezone
linkedin_url
status
influence_score
opportunity_fit_score
decision_role
owner_id
source
created_at
updated_at
```

---

## Career history

```text id="career-schema"
contact_employment_history
---------------------------
id
contact_id
company_id
job_title
start_date
end_date
is_current
source
```

---

## Contact tags

```text id="tags-schema"
contact_tags
----------------
contact_id
tag_id
```

---

## Contact activities

```text id="activity-schema"
contact_activities
------------------
id
contact_id
type
direction
subject
content
status
occurred_at
created_by
metadata
```

---

# 27. API structure

I'd separate the API responsibilities.

```text id="contacts-api"
GET    /api/contacts
GET    /api/contacts/:id
POST   /api/contacts
PATCH  /api/contacts/:id
DELETE /api/contacts/:id

POST   /api/contacts/import
POST   /api/contacts/enrich

GET    /api/contacts/:id/activity
POST   /api/contacts/:id/activity

GET    /api/contacts/:id/opportunities
GET    /api/contacts/:id/company

POST   /api/contacts/bulk
POST   /api/contacts/:id/bookmark
```

---

# 28. Performance

Do **not** load 8,642 contacts into the browser.

Use:

* Server-side pagination
* Server-side filtering
* Server-side sorting
* Debounced search
* Virtualized rows if necessary
* Cached filter options

Example:

```text
GET /api/contacts?
page=1
&pageSize=20
&role=HR
&influence=high
```

---

# 29. Empty state

For a new workspace:

### No contacts yet

> Your contact intelligence database is empty.

> Find prospects and HUNTIQ will automatically identify relevant decision-makers.

Primary:

**Find Prospects**

Secondary:

**Import Contacts**

---

# 30. Error state

Example:

### Couldn't load contacts

> We couldn't retrieve your contacts right now.

`Retry`

The table should remain structurally intact.

---

# 31. Permissions

### Admin

Full access.

### Manager

Team contacts.

### Sales Rep

Assigned contacts + permitted shared contacts.

### Analyst

Read-only.

Backend permissions must enforce this.

---

# 32. Important UX rule

Don't make the Contacts page compete with the **Companies** page.

### Companies page answers:

> **Which organizations should I sell to?**

### Contacts page answers:

> **Who inside those organizations should I talk to?**

### Company Intelligence answers:

> **Why should I sell to this organization?**

### Contact Intelligence answers:

> **Why should I talk to this person?**

That separation will keep HUNTIQ's information architecture clean.

---

# 33. Contact lifecycle

The contact should move through a relationship lifecycle:

```text
DISCOVERED
    ↓
ENRICHED
    ↓
QUALIFIED
    ↓
CONTACTED
    ↓
ENGAGED
    ↓
MEETING
    ↓
OPPORTUNITY
    ↓
CUSTOMER
```

Not every contact needs to become an opportunity.

A company can have:

**10 contacts**

but only:

**1–3 meaningful buying committee members.**

That relationship should be represented explicitly.

---

# 34. Implementation priorities

### P0 — Core

* Contacts table
* Search
* Pagination
* Filters
* Company/role/location filtering
* Contact drawer
* Contact profile
* Add contact
* Edit contact

### P1 — Intelligence

* Influence score
* Opportunity-fit score
* Decision-maker classification
* AI insights
* Career history
* Company relationship

### P2 — CRM

* Activities
* Notes
* Tasks
* Opportunities
* Campaigns
* Bulk actions

### P3 — Automation

* Enrichment
* Job-change detection
* Contact monitoring
* AI recommendations
* Signal generation

---

# 35. The key product principle

The Contacts page should **not be a database of names and emails**.

It should answer:

> **"Who is the right human to talk to, why them, what influence do they have, what do they care about, what happened previously, and what should I do next?"**

That is what turns a normal CRM contact table into **HUNTIQ Contact Intelligence**.

The next visual should therefore reflect this specification—not just reproduce the first screenshot with different colors.
