## Page 03 — AI Copilot

This is one of the **core differentiators of HUNTIQ**. It should not look or behave like a generic ChatGPT wrapper. The Copilot needs access to the user's actual HUNTIQ data and be capable of **taking actions**, not just answering questions.

---

# 1. Purpose

The AI Copilot is the user's **natural-language control center** for HUNTIQ.

It should let a user ask:

> "Find me 50 companies in Lagos that are expanding."

and actually create a prospect search.

Or:

> "Which prospects should I contact today?"

and return ranked prospects from their database.

Or:

> "Research Acme Technologies."

and launch company research.

Or:

> "Move Acme to qualified."

and actually update the CRM.

The fundamental difference:

### Chatbot

> Answers questions.

### HUNTIQ Copilot

> **Understands → investigates → recommends → executes.**

---

# 2. Primary layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Sidebar │ AI Copilot                         Search / User   │
├─────────┴────────────────────────────────────────────────────┤
│                                                              │
│              AI COPILOT                                      │
│        Your sales intelligence assistant                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ User: Find companies I should contact today.          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ AI: I found 17 high-priority opportunities...         │  │
│  │                                                        │  │
│  │ 1. Acme Technologies       94  🔥                      │  │
│  │ 2. FinServe Ltd             91  🔥                      │  │
│  │ 3. Delta Systems            87  ⚡                      │  │
│  │                                                        │  │
│  │ [View opportunities] [Start outreach]                 │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Suggested actions                                           │
│  [Find prospects] [Analyze market] [Review pipeline]         │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Ask anything about your prospects...               🎙 ↑ │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

# 3. Welcome state

For a new conversation:

### **What can I help you hunt today?**

> I can find prospects, investigate companies, identify decision-makers, analyze buying signals, manage your pipeline and help you plan your next move.

Suggested prompts:

### Find prospects

> Find 25 technology companies in Lagos that are hiring.

### Analyze market

> What industries are showing the strongest buying signals?

### Prioritize

> Which prospects should I contact today?

### Research

> Research Acme Technologies.

### Pipeline

> Which deals are at risk?

### Outreach

> Draft an email for my five hottest prospects.

---

# 4. Conversation types

The Copilot needs to recognize different intents.

### SEARCH

> Find companies in New York hiring engineers.

### RESEARCH

> Research Microsoft.

### ANALYZE

> Why are my opportunities dropping?

### PRIORITIZE

> What should I focus on today?

### CRM ACTION

> Move Acme to Proposal.

### OUTREACH

> Write an email to the HR director.

### REPORT

> Give me my weekly sales report.

### MARKET INTELLIGENCE

> What changed in my target market this week?

### NAVIGATION

> Take me to my hot opportunities.

---

# 5. AI response structure

Don't make every response a wall of text.

Responses should use **structured UI components**.

Example:

### User

> Which companies should I contact today?

### Copilot

**I found 7 high-priority opportunities.**

---

### 1. Acme Technologies

**94/100 — HOT**

**Why now**

Hiring 38 employees and opened a new office.

**Best contact**

Jane Smith — Head of People

**Recommended action**

Contact today.

`View company` `Draft outreach`

---

### 2. FinServe Ltd

**91/100 — HOT**

**Why now**

Expansion into two new markets.

`View company` `Research`

---

At the bottom:

**Want me to prepare outreach for these 7 companies?**

`Yes, prepare outreach`

---

# 6. Copilot must show evidence

This is critical.

When the AI says:

> "Acme is growing rapidly."

the user should be able to inspect:

### Evidence

* 38 new job postings
* New office announced
* Employee count increased
* New COO appointed

And ideally:

**Sources**

The system should distinguish:

* verified data
* inferred information
* AI interpretation

Never present an AI inference as a confirmed fact.

---

# 7. Context awareness

The Copilot should understand HUNTIQ context.

For example:

User:

> "Tell me about Acme."

If the user has previously been discussing Acme, the AI should know which Acme they mean.

If ambiguous:

> I found 3 companies named Acme. Which one do you mean?

Then show the three companies.

---

# 8. Conversation context

Each conversation can retain:

* Current company
* Current prospect
* Current campaign
* Current pipeline
* Current search
* Current filters
* Previous questions

Example:

User:

> Find financial companies in Lagos.

AI:

> Found 84.

User:

> Show me the top 10.

AI:

> Here are the highest-scoring 10.

User:

> Research number 3.

AI:

> Researching Delta Bank...

User:

> Who should I contact?

AI understands that "who" means **Delta Bank's decision-makers**.

---

# 9. Action confirmation

Some actions should happen immediately.

For example:

> Show me my hot prospects.

No confirmation.

But potentially consequential actions should ask.

### User

> Send this email to all 50 prospects.

AI:

> This will send an email to **50 contacts**.

> Campaign: HR Consulting Outreach

> Subject: Supporting your growth plans

`Review & Send`

`Cancel`

The AI should never silently perform consequential external actions.

---

# 10. Action cards

When the AI wants to perform an action:

### Proposed action

**Create prospect search**

Industry:

Technology

Location:

Lagos

Employees:

50–500

Signals:

Hiring + Expansion

Results:

50 prospects

`Run Search`

---

After execution:

### Search completed

**50 prospects found**

**14 high-intent**

**6 hot opportunities**

`View Results`

---

# 11. Tool architecture

The Copilot should have access to controlled tools.

Conceptually:

```text
AI COPILOT
    │
    ├── search_companies()
    ├── search_contacts()
    ├── get_company()
    ├── research_company()
    ├── get_signals()
    ├── score_opportunity()
    ├── get_pipeline()
    ├── get_deals()
    ├── get_activities()
    ├── create_task()
    ├── create_note()
    ├── update_prospect()
    ├── update_deal()
    ├── create_campaign()
    ├── generate_outreach()
    ├── create_report()
    └── navigate()
```

The LLM should **not have unrestricted database access**.

It calls controlled application tools.

---

# 12. Example tool flow

User:

> Find companies in Lagos hiring more than 20 people.

Copilot:

```text
1. Understand request
       ↓
2. Translate into search parameters
       ↓
3. Search company database
       ↓
4. Query hiring signals
       ↓
5. Filter relevant companies
       ↓
6. Calculate opportunity scores
       ↓
7. Rank results
       ↓
8. Present results
```

---

# 13. Copilot + Prospect Hunter

This is where the two features connect.

User:

> Find me 30 companies that need HR consulting.

Copilot shouldn't simply search for companies containing "HR."

It should use:

### User's ICP

from onboarding.

*

### User's services

from workspace configuration.

*

### Company data

from the intelligence database.

*

### Signals

from the signal engine.

*

### Opportunity scoring

from the scoring engine.

Then return the best prospects.

---

# 14. Copilot + Company Intelligence

User:

> Research Acme.

The Copilot should launch the research process.

Potential workflow:

```text
Company
   ↓
Basic profile
   ↓
Business model
   ↓
Leadership
   ↓
Hiring
   ↓
News
   ↓
Technology
   ↓
Growth
   ↓
Signals
   ↓
Pain points
   ↓
Opportunities
   ↓
Decision makers
   ↓
Recommended approach
```

The resulting research report should be saved to:

**Research Center**

---

# 15. Copilot + CRM

The Copilot can interact with the CRM.

Examples:

> Show my deals above $20K.

> What deals haven't had activity for 14 days?

> Move Acme to negotiation.

> Add a task to call Jane tomorrow.

> Show opportunities without a decision-maker.

> Which deals are at risk?

---

# 16. Copilot + outreach

Example:

> Prepare outreach for my five hottest prospects.

The system should:

1. Retrieve top prospects.
2. Retrieve company intelligence.
3. Retrieve decision-makers.
4. Retrieve relevant signals.
5. Determine recommended positioning.
6. Generate personalized messages.

Then present:

```text
Prospect
↓
Why them
↓
Why now
↓
Who to contact
↓
Recommended angle
↓
Draft
```

This is much better than:

> "Write a sales email."

---

# 17. AI recommendations

The Copilot should sometimes proactively suggest actions.

Example:

> **I noticed something.**

> Three of your highest-value prospects have received new buying signals in the last 24 hours.

`Review 3 prospects`

Another:

> **Pipeline risk detected.**

> 8 opportunities have had no activity for more than 14 days.

`Review pipeline`

This can eventually feed the Dashboard.

---

# 18. Conversation sidebar

Users should be able to create multiple conversations.

Example:

### Today

**Prospect research — FinServe**

**Today's opportunities**

**Lagos HR prospects**

### Yesterday

**Weekly market analysis**

**Cybersecurity prospects**

Each conversation should be associated with the workspace/user.

---

# 19. Search inside conversations

Useful for long-running workspaces.

User can search:

> Acme

and see previous conversations involving Acme.

---

# 20. File/document intelligence

Eventually the Copilot should be able to analyze user-provided materials:

* Company profile
* Service brochure
* Pricing document
* Proposal
* Sales playbook
* ICP document
* Case studies

Then the AI can understand:

> **What the user sells**

and use that information when evaluating prospects.

This should be Phase 2 rather than blocking the MVP.

---

# 21. Personalization memory

The Copilot should remember workspace-level configuration:

```text
Target industries
Target locations
Target company size
Target buyer roles
Services
Average deal size
Preferred signals
Scoring preferences
Sales methodology
```

This means the user doesn't repeatedly say:

> "I'm looking for Nigerian companies with 50–500 employees."

---

# 22. AI model architecture

Don't hard-code the Copilot to one model.

Create an abstraction:

```text
AI Provider
    ↓
Model Router
    ├── Fast model
    ├── Reasoning model
    └── Research model
```

Use the appropriate model based on task.

### Simple task

> "Show my hot prospects."

Use a fast model or potentially no LLM.

### Complex research

> "Analyze why these companies might need my service."

Use a stronger reasoning model.

---

# 23. Streaming

Responses should stream.

Instead of:

> Please wait...

Show:

> Analyzing your prospects...

Then:

> I found 17 candidates...

Then render the cards as they're ready where practical.

---

# 24. Error handling

If research fails:

> I couldn't complete the research because the external data source is temporarily unavailable.

`Retry`

Don't fabricate a result.

If there isn't enough information:

> I don't have enough evidence to confidently identify a buying signal.

That's preferable to hallucinating.

---

# 25. Security

This page is especially sensitive because AI has access to CRM actions.

Every action should go through:

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

Record:

* Who requested action
* What AI suggested
* What action was executed
* When
* Result

---

# 26. Database additions

Add:

```text
ai_conversations
ai_messages
ai_tool_calls
ai_actions
ai_feedback
ai_usage
ai_saved_prompts
```

Potential structure:

```text id="w48l4s"
ai_messages
----------------
id
conversation_id
role
content
model
created_at
token_usage
metadata
```

And:

```text id="0xnv3b"
ai_tool_calls
----------------
id
message_id
tool_name
arguments
result
status
created_at
```

---

# 27. Analytics

Track Copilot usage:

* Questions asked
* Searches initiated
* Research requests
* CRM actions
* Outreach generated
* Successful tool executions
* User feedback
* Time saved
* AI usage/cost

This becomes useful for product optimization and eventually billing.

---

# 28. What NOT to do

Avoid making this:

❌ Giant blank ChatGPT screen

❌ Generic chatbot with no CRM integration

❌ AI that invents company information

❌ AI that automatically sends emails without confirmation

❌ AI that can directly manipulate the database without permission controls

❌ Long text-only responses

❌ AI-generated charts for everything

The Copilot should be **visual, actionable and grounded in HUNTIQ's data**.

---

# 29. Implementation priority

### P0 — MVP

* Chat interface
* Conversation management
* Workspace context
* Prospect search
* Company lookup
* Opportunity lookup
* Signal lookup
* Pipeline queries
* Basic navigation
* Structured AI responses

### P1

* Company research
* Contact intelligence
* Opportunity scoring
* Outreach generation
* CRM actions
* Task creation

### P2

* Proactive recommendations
* Long-term conversation memory
* Reports
* File intelligence
* Voice input
* Advanced multi-step agents

---

# 30. Success criteria

When this page is finished, a user should be able to sit down and type:

> **"I sell HR consulting to growing companies. Find me 20 companies in Lagos with strong hiring signals, research the top 5, identify the best person to contact, rank them by opportunity, and prepare personalized outreach for the top 3."**

And HUNTIQ should be capable of orchestrating that workflow without the user manually navigating six different pages.

That is the standard we should design toward.

**Next, I can generate the AI Copilot UI reference image based on this specification.**
