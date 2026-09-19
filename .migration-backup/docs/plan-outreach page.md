Absolutely. For **SELL → Outreach**, the page should be the **execution workspace for actual prospect communication**.

The distinction from the previous pages should be very clear:

* **Campaigns** = *Who are we targeting and what sequence are we running?*
* **Outreach** = *What communication is happening right now with each prospect?*
* **Pipeline** = *What commercial opportunities have resulted?*

The documentation places **Outreach** under SELL, alongside Pipeline, Campaigns, Tasks and Meetings.  It also identifies email integration, sequences, automated follow-ups and campaign analytics as part of the later sales-execution layer. 

# HUNTIQ — SELL → Outreach

## 1. Main purpose

The Outreach page should answer:

> **"Who am I communicating with, what have we said, what happened, and what should I do next?"**

It is essentially the **communication command center** for salespeople.

The page should bring together:

* Emails
* Follow-ups
* Replies
* Scheduled outreach
* Prospect conversations
* Campaign activity
* Contact history
* Tasks
* Next actions

---

# 2. Relationship with Campaigns and Pipeline

The three pages should work together:

```text
CAMPAIGNS
Who should we contact?
        ↓
OUTREACH
What are we saying to them?
        ↓
RESPONSE
Did they respond?
        ↓
OPPORTUNITY
Is there a business opportunity?
        ↓
PIPELINE
Where is the deal?
```

So Outreach should **not** become another Campaigns page.

Campaigns manages the **sequence**.

Outreach manages the **individual communication**.

---

# 3. Main Outreach dashboard

I recommend the main layout:

```text
┌───────────────────────────────────────────────────────────────┐
│ OUTREACH                                                       │
│ Manage conversations, follow-ups and prospect communication    │
│                                                               │
│ [Search conversations...]   [Filter]   [+ New Outreach]       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Due Today     Scheduled     Replies     Needs Attention       │
│    24            38            12             9               │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ [Inbox] [Scheduled] [Replies] [Follow-ups] [All Activity]    │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ Conversations              │ Conversation                     │
│                            │                                  │
│ Jane Smith                 │ Jane Smith                       │
│ Acme Technologies          │ Acme Technologies                │
│ Replied · 12m              │                                  │
│                            │ Email conversation               │
│ David Okoro                │                                  │
│ Delta Systems              │                                  │
│ Follow-up due              │                                  │
│                            │                                  │
└───────────────────────────────────────────────────────────────┘
```

The key design decision is that this should feel like a **sales inbox**, rather than a generic message-management page.

---

# 4. Header

## Outreach

Subtitle:

> **Manage prospect conversations, follow-ups and sales communication.**

Right side:

### + New Outreach

And:

### Ask AI Copilot

---

# 5. Search

Search placeholder:

> **Search people, companies, messages...**

Search should find:

* Contact
* Company
* Message content
* Campaign
* Opportunity
* Email subject
* Conversation

Example:

> Jane Smith

returns:

```text
Jane Smith
Acme Technologies

3 conversations
1 active opportunity
2 recent replies
```

---

# 6. KPI cards

At the top of Outreach, show the user's immediate workload.

## Due Today

Example:

**24**

Definition:

> Outreach actions that should be completed today.

---

## Scheduled

Example:

**38**

Definition:

> Outreach activities scheduled for future execution.

---

## Replies

Example:

**12**

Definition:

> New prospect responses requiring attention.

---

## Needs Attention

Example:

**9**

Definition:

> Conversations where the system identifies an outstanding sales action.

The numbers above are sample UI data.

---

# 7. Additional metrics

A secondary metrics row can show:

### Sent

**184**

### Delivered

**176**

### Reply Rate

**8.4%**

### Meetings

**7**

### Opportunities

**4**

These should become live once communication integrations are implemented.

The documentation specifically identifies email integration, automated follow-ups and campaign analytics as later sales-execution capabilities. 

---

# 8. Main tabs

The primary navigation inside Outreach should be:

```text
[Inbox] [Scheduled] [Replies] [Follow-ups] [All Activity]
```

---

# 9. Inbox

This is the default view.

The Inbox should show conversations that need attention.

Example:

```text
Inbox

Jane Smith
Acme Technologies
"Yes, let's discuss this..."
12m

David Okoro
Delta Systems
"Can you send more information?"
32m

Mary Ade
FinServe
No response
Follow-up due today
```

Unread items should be visually distinct.

---

# 10. Conversation list

Each conversation row should show:

### Contact

Jane Smith

### Company

Acme Technologies

### Role

Head of People

### Last message

> "Yes, let's discuss this next week."

### Time

12m

### Status

**Interested**

### Related campaign

HR Directors — Nigeria

### Related opportunity

HR Transformation

---

# 11. Conversation status

Use statuses such as:

* Unread
* Awaiting Reply
* Replied
* Interested
* Meeting Booked
* Follow-up Due
* Closed
* Unsubscribed

These statuses make the inbox actionable.

---

# 12. Conversation workspace

When the user selects a contact, the right side becomes the conversation workspace.

Example:

# Jane Smith

**Head of People · Acme Technologies**

**Opportunity Score: 94**

**Campaign: HR Directors — Nigeria**

---

### Conversation

```text
You · May 16

Hi Jane,

I noticed Acme Technologies has been expanding
its team...

────────────────────────

Jane · May 16

Yes, we're currently reviewing our HR
processes. I'd be interested in discussing this.

────────────────────────

You · May 17

Absolutely. Would Tuesday at 2 PM work?
```

---

# 13. Contact information panel

On the right or expandable drawer:

### Contact

Jane Smith

### Title

Head of People

### Company

Acme Technologies

### Email

[jane@example.com](mailto:jane@example.com)

### Opportunity Score

94/100

### Current Stage

Meeting

### Campaign

HR Directors — Nigeria

### Opportunity

HR Transformation

---

# 14. Intelligence panel

This is where HUNTIQ's Outreach page should be much better than a normal email inbox.

Show:

# Sales Intelligence

### Why this prospect?

* Hiring surge
* Expansion
* New HR leadership

### Opportunity Score

**94**

### Recommended angle

> Workforce scaling and HR process optimization.

### Recent signal

> Company announced expansion into two new markets.

The intelligence should be drawn from the research/signal data already established elsewhere in HUNTIQ, rather than invented inside Outreach.

---

# 15. Recommended next action

At the top of the conversation:

### AI Recommendation

> **Follow up today.**

Reason:

> Jane responded positively and indicated interest in discussing HR processes.

Buttons:

**Reply**

**Schedule Meeting**

**Create Opportunity**

This connects Outreach to the rest of SELL.

---

# 16. Compose message

At the bottom:

```text
┌───────────────────────────────────────────────┐
│ To: Jane Smith                                │
│                                               │
│ Hi Jane,                                      │
│                                               │
│ [Message editor.............................] │
│                                               │
│ [Attach] [AI Assist]        [Send]           │
└───────────────────────────────────────────────┘
```

---

# 17. AI Assist

Click:

### AI Assist

Options:

* Improve writing
* Make shorter
* Make more professional
* Make more conversational
* Personalize
* Generate follow-up
* Summarize conversation
* Suggest response

---

# 18. AI personalization

The AI should be able to use verified HUNTIQ information.

For example:

User writes:

> I wanted to follow up about HR.

AI might produce:

> Hi Jane, I wanted to follow up on our conversation about Acme's HR processes. Given the recent expansion of your team, I thought it might be useful to explore how you are currently handling workforce planning...

The important implementation rule is:

**AI should use available research/signal data rather than fabricate personal details.**

---

# 19. Reply suggestions

When a prospect replies:

> "Can you send me more information?"

HUNTIQ can display:

### Suggested replies

**Professional**

> Absolutely. I'll send over a brief overview...

**Consultative**

> Absolutely. Before I send it, would it be useful to focus on...

**Meeting-oriented**

> Happy to. Would you also be open to a 20-minute conversation...

User selects one and edits it before sending.

---

# 20. Scheduled tab

The Scheduled view shows future outreach.

Example:

```text
Scheduled

Tomorrow
────────────────────────
Jane Smith
Follow-up #2
10:00 AM

David Okoro
Campaign email #3
11:30 AM

Thursday
────────────────────────
Mary Ade
Follow-up
9:30 AM
```

Actions:

* Edit
* Reschedule
* Cancel
* Open conversation

---

# 21. Follow-ups tab

This should be highly actionable.

# Follow-ups

```text
Due Today
────────────────────────

Jane Smith
Acme Technologies
Follow-up after proposal
Due 10:00 AM

David Okoro
Delta Systems
No response after email
Due 2:00 PM
```

Each has:

### Complete

### Snooze

### Reply

### Schedule

---

# 22. Follow-up intelligence

Instead of simply showing:

> Follow-up due.

HUNTIQ can show:

> **Follow up today**

> The prospect opened your previous email twice but hasn't replied.

This requires email-event integration and should therefore be implemented when that integration exists.

---

# 23. Replies tab

Show only incoming responses.

Example:

```text
Replies

Jane Smith
Acme Technologies
Positive
"Yes, let's discuss this..."

David Okoro
Delta Systems
Neutral
"Can you send more information?"

Mary Ade
FinServe
Negative
"Not at the moment."
```

---

# 24. Reply classification

Eventually classify:

### Positive

Prospect shows interest.

### Neutral

Prospect requests information.

### Negative

Prospect declines.

### Question

Prospect asks something requiring a response.

### Out of Office

Automated response.

### Referral

Prospect directs you to another contact.

This classification can be AI-assisted.

---

# 25. All Activity

Show a chronological communication feed:

```text
Today

10:42
Jane Smith replied

10:20
Email sent to David Okoro

9:50
Follow-up completed with Mary Ade

Yesterday

4:15
Proposal sent to Acme Technologies
```

---

# 26. New Outreach

Click:

### + New Outreach

The system should ask:

### Who are you contacting?

Search:

> Company / Contact

Then:

### Contact

Jane Smith

### Company

Acme Technologies

### Channel

Email

### Message

Compose.

### Schedule

Now / Later

Then:

### Send

or

### Schedule

---

# 27. Starting outreach from a Campaign

There should also be a path:

```text
Campaign
   ↓
Prospect
   ↓
Open Outreach
```

The campaign should pre-fill:

* Contact
* Campaign
* Message sequence
* Current step
* Personalization

The user should not have to recreate campaign context.

---

# 28. Starting outreach from a Contact

From:

**HUNT → Contacts**

click:

### Start Outreach

It opens the Outreach composer with:

```text
Contact
Jane Smith

Company
Acme Technologies

Role
Head of People

Opportunity Score
94

Recommended Angle
HR transformation
```

---

# 29. Starting outreach from Pipeline

From a Pipeline opportunity:

### Contact

opens the same conversation workspace.

This means all three areas share one communication history:

```text
Contact
  ↕
Outreach
  ↕
Opportunity
  ↕
Pipeline
```

---

# 30. Channel selector

Initially:

### Email

Later:

* LinkedIn
* WhatsApp
* Phone
* Other

The documentation specifically discusses email integration and later sales-execution functionality, but does **not** define a final multi-channel architecture. So these additional channels should be treated as future implementation rather than assumed MVP requirements. 

---

# 31. Email composer

The composer should support:

### Subject

> Quick question about Acme's HR expansion

### Body

Rich-text editor.

### Variables

```text
{{first_name}}
{{company_name}}
{{job_title}}
```

### Attachments

Optional.

### AI Assist

Optional.

### Send / Schedule

---

# 32. Email thread

The thread should preserve the complete conversation.

```text
May 10
You → Jane

May 12
Jane → You

May 13
You → Jane

May 16
Jane → You
```

Each message should display:

* Sender
* Recipient
* Timestamp
* Delivery state
* Open state, where supported
* Reply state

---

# 33. Email status

For sent messages:

### Sending

### Sent

### Delivered

### Bounced

### Failed

For supported providers, additional events can include:

### Opened

### Replied

These events should be stored as activity events.

---

# 34. Outreach activity database

A practical implementation:

```text
outreach_activities
-------------------------
id
organization_id
campaign_id
contact_id
company_id
opportunity_id
channel
activity_type
direction
subject
body
status
scheduled_at
sent_at
created_at
```

Examples of `activity_type`:

```text
email_sent
email_received
email_opened
email_replied
followup_created
followup_completed
meeting_booked
message_failed
```

This is an implementation proposal; the supplied documentation establishes the need for outreach/email activity but does not specify this exact schema.

---

# 35. Conversation model

You will also need a conversation/thread entity:

```text
conversations
-------------------------
id
organization_id
contact_id
company_id
campaign_id
opportunity_id
channel
status
last_activity_at
created_at
updated_at
```

Then:

```text
conversation_messages
-------------------------
id
conversation_id
sender
recipient
body
message_type
provider_message_id
sent_at
received_at
status
```

---

# 36. API implementation

Recommended initial API:

```text
GET    /api/outreach
GET    /api/outreach/conversations
GET    /api/outreach/conversations/:id

POST   /api/outreach/messages
POST   /api/outreach/messages/:id/send
POST   /api/outreach/messages/:id/schedule

PATCH  /api/outreach/messages/:id
DELETE /api/outreach/messages/:id

GET    /api/outreach/replies
GET    /api/outreach/followups
GET    /api/outreach/scheduled

POST   /api/outreach/followups
PATCH  /api/outreach/followups/:id
POST   /api/outreach/followups/:id/complete
POST   /api/outreach/followups/:id/snooze

GET    /api/outreach/metrics
```

---

# 37. Background execution

Scheduled outreach should **not** rely on the browser.

Architecture:

```text
User schedules message
        ↓
Database
        ↓
Outreach job queue
        ↓
Scheduler
        ↓
Check send time
        ↓
Check campaign status
        ↓
Check contact status
        ↓
Check unsubscribe/stop conditions
        ↓
Send through provider
        ↓
Record event
        ↓
Update conversation
```

This becomes essential when automated follow-ups are introduced.

---

# 38. Campaign stop conditions

If a prospect replies:

```text
Campaign
   ↓
Prospect replies
   ↓
Stop automated sequence
   ↓
Move to Replies
   ↓
Notify salesperson
```

If the prospect books a meeting:

```text
Meeting booked
   ↓
Stop sequence
   ↓
Update contact
   ↓
Update opportunity
```

If the prospect unsubscribes:

```text
Unsubscribe
   ↓
Stop outreach
   ↓
Mark contact accordingly
```

These are important safeguards for automated outreach.

---

# 39. Create Opportunity from Outreach

A very important action:

### Create Opportunity

When the conversation becomes commercially meaningful:

```text
Jane Smith replies
        ↓
"Let's discuss our HR transformation."
        ↓
Create Opportunity
        ↓
Opportunity:
HR Transformation
        ↓
Value:
$18,000
        ↓
Pipeline
```

The system should pre-fill:

* Contact
* Company
* Campaign
* Source
* Conversation
* Opportunity score

---

# 40. Book Meeting from Outreach

Button:

### Schedule Meeting

The system should open the Meetings workflow.

Pre-fill:

* Contact
* Company
* Conversation
* Opportunity
* Meeting title

Example:

> Acme HR Transformation Discussion

This connects:

**Outreach → Meetings → Pipeline**

---

# 41. Tasks from Outreach

User can create:

### Create Task

Example:

> Send proposal to Jane.

Due:

> Tomorrow.

The task should link back to:

```text
Contact
+
Conversation
+
Opportunity
```

The documentation explicitly places Notes/Tasks within the CRM foundation. 

---

# 42. Outreach intelligence

A small panel can show:

## Prospect Context

```text
Opportunity Score     94
ICP Fit               High
Recent Signal         Hiring surge
Company Growth        High
Decision Maker        Yes
Current Stage         Meeting
```

This prevents salespeople from having to jump back and forth between HUNT, Research and Outreach.

---

# 43. AI conversation summary

At the top of a long thread:

### AI Summary

> Jane is interested in HR transformation services. She mentioned that the company is currently expanding and wants to review its HR processes. A meeting has not yet been scheduled.

Then:

### Recommended Next Step

> Offer two meeting times.

This is a useful AI feature because it reduces the need to read long threads.

---

# 44. AI conversation questions

The Copilot should support:

> Summarize this conversation.

> What is the prospect interested in?

> What objections have they raised?

> What should I say next?

> When should I follow up?

> Is this ready to become an opportunity?

> What signals should I mention in my response?

These should operate through controlled data access.

The documentation specifically defines Copilot as a controlled action/query layer and includes pipeline and CRM queries in its MVP scope. 

---

# 45. Important AI rule

AI should **suggest**, not silently send.

For example:

```text
AI:
"I drafted a response."

[Edit]
[Send]
[Discard]
```

Not:

```text
AI:
"Response sent."
```

without explicit authorization.

This follows the documented requirement that consequential actions require confirmation. 

---

# 46. Outreach filters

Filters:

### Status

* Unread
* Awaiting Reply
* Replied
* Follow-up Due
* Scheduled
* Closed

### Campaign

Select campaign.

### Owner

* Me
* Team
* Everyone

### Channel

Email etc.

### Date

* Today
* Yesterday
* This week
* Custom

### Priority

* High
* Medium
* Low

---

# 47. "Needs Attention"

This should be one of the strongest features.

Examples:

### 🔴 High priority

> Jane replied 12 minutes ago.

### 🟠 Follow-up

> David has not replied for 5 days.

### 🟡 Opportunity

> Mary expressed interest and may be ready for Pipeline.

The goal is:

> **Don't make the salesperson search for work.**

HUNTIQ should surface it.

---

# 48. Outreach priority score

You can later calculate:

```text
Priority =
Response urgency
+
Opportunity score
+
Recent engagement
+
Deal value
+
Signal strength
```

For example:

> Jane — **98 Priority**

because:

* High opportunity score
* Positive response
* High-value opportunity
* Recent engagement

This should initially be rule-based and later become predictive.

---

# 49. Analytics page

A secondary analytics view can show:

### Outreach Performance

```text
Messages Sent
1,284

Reply Rate
8.7%

Positive Reply Rate
4.9%

Meetings
38

Opportunities
21

Won
7

Revenue
$84,000
```

And:

### By Campaign

```text
HR Directors        7.8% reply
SaaS Companies      5.4%
Enterprise CEOs     9.1%
```

This connects Outreach performance back to Campaigns.

---

# 50. Revenue attribution

Eventually:

```text
Campaign
   ↓
Outreach
   ↓
Reply
   ↓
Opportunity
   ↓
Won
   ↓
$18,000
```

Then the campaign can show:

> **Revenue generated: $18,000**

This is much more valuable than simply saying:

> "Campaign got 500 opens."

---

# 51. Empty state

If there are no conversations:

# Your outreach inbox is clear

> Start a conversation with a qualified prospect or launch a campaign.

Buttons:

### Find Prospects

### Create Campaign

### New Outreach

---

# 52. Loading state

Use skeletons for:

* Conversation list
* Message thread
* Prospect details
* KPI cards

Do not show a blank white page while the data loads.

---

# 53. Error state

# Couldn't load Outreach

> We couldn't retrieve your conversations.

Buttons:

**Retry**

**Ask Copilot**

---

# 54. Permissions

### Salesperson

Can:

* View assigned conversations
* Send messages
* Create follow-ups
* Schedule outreach
* View own activities

### Manager

Can:

* View team activity
* Monitor conversations
* Review campaign activity

### Admin

Can:

* Configure integrations
* Manage organization-wide settings
* Manage communication permissions

Backend authorization must enforce these rules.

---

# 55. Integration architecture

For actual email:

```text
HUNTIQ
   ↓
Outreach Service
   ↓
Email Provider
   ↓
Recipient
   ↓
Webhook
   ↓
HUNTIQ
   ↓
Conversation updated
```

Webhooks should capture events such as:

```text
delivered
bounced
opened
clicked
replied
```

where the provider supports them.

The documentation identifies email integration as a later sales-execution capability, so you can initially build the Outreach interface and activity model before connecting the live provider. 

---

# 56. Recommended implementation phases

## P0 — Outreach foundation

Build the interface and data model for:

* Conversations
* Contact/company relationship
* Activity timeline
* Manual messages
* Notes
* Follow-ups
* Scheduled activities
* Search
* Filters
* Basic metrics
* Link to campaigns
* Link to pipeline
* Link to meetings

---

## P1 — Actual communication

Implement:

* Email integration
* Send/receive
* Email threads
* Delivery status
* Replies
* Follow-up automation
* Campaign sequences
* Scheduling
* Stop conditions
* Outreach analytics

This corresponds to the documentation's sales-execution phase. 

---

## P2 — Intelligence-powered Outreach

Add:

* AI conversation summaries
* AI reply suggestions
* AI personalization
* Next-action recommendations
* Response classification
* Conversation sentiment
* Deal-readiness detection
* Predictive engagement scoring
* Revenue attribution

---

# 57. Final relationship between your SELL pages

At this point your SELL section should have a very clear architecture:

```text
                    SELL
                     │
       ┌─────────────┼─────────────┐
       │             │             │
   CAMPAIGNS      OUTREACH       PIPELINE
       │             │             │
       │             │             │
   Targeting     Conversations   Opportunities
   Sequences     Replies         Deals
   Audience      Follow-ups      Stages
   Campaigns     Messages        Forecast
       │             │             │
       └─────────────┼─────────────┘
                     │
              MEETINGS / TASKS
```

And the complete HUNTIQ journey becomes:

```text
HUNT
 │
 ├── Find Prospects
 ├── Companies
 ├── Contacts
 ├── Saved
 └── Research
       │
       ↓
COMMAND
 │
 ├── Signals
 └── Opportunities
       │
       ↓
SELL
 │
 ├── Campaigns ───────────┐
 │                        ↓
 ├── Outreach ───────→ Response
 │                        ↓
 ├── Meetings ───────→ Opportunity
 │                        ↓
 ├── Tasks             Pipeline
 │                        ↓
 └── Pipeline ───────→ Won/Lost
```

**The key implementation principle for Outreach:** it should become the **single communication history for a contact**, regardless of whether that communication originated from a Campaign, a Pipeline opportunity, a Contact profile, or a manually initiated outreach. That prevents HUNTIQ from creating fragmented communication records across different pages.
