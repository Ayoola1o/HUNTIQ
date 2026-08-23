# HUNTIQ — Integrations Page Specification

The **Integrations page** is the connectivity and automation layer of HUNTIQ. It connects the CRM to the external tools where the user's contacts, communication, calendars, data, and workflows already live.

The page should not be treated as a simple "connect apps" gallery. It needs to show:

> **What is connected → what data is flowing → what HUNTIQ can do with it → whether the connection is healthy.**

---

# 1. Purpose

The Integrations page should allow users to:

* Connect external services
* Authenticate accounts securely
* Import contacts
* Sync companies and contacts
* Sync emails and activities
* Sync calendars
* Push leads into other CRMs
* Trigger automations
* Configure data synchronization
* Monitor integration health
* Disconnect/reconnect services
* Review integration activity and errors

---

# 2. Main page layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Integrations                         Search   AI Copilot     │
│ Connect HUNTIQ to the tools your team already uses           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ CONNECTION OVERVIEW                                          │
│                                                              │
│ Connected     Syncing      Errors      Available             │
│     8            3           1          24                   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [All] [CRM] [Communication] [Calendar] [Data] [Automation]  │
│                                                              │
│ Search integrations...                                      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ CONNECTED                                                    │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ Gmail                         Connected ●                 │  │
│ │ Email & communication                                      │  │
│ │ Last sync: 2 minutes ago                                 │  │
│ │ [Manage] [Sync now]                                       │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ Google Calendar                Connected ●                │  │
│ │ Calendar & scheduling                                     │  │
│ │ Last sync: 5 minutes ago                                 │  │
│ │ [Manage] [Sync now]                                       │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ AVAILABLE INTEGRATIONS                                       │
│                                                              │
│ [Connect] [Connect] [Connect] [Connect]                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 3. Header

### Title

**Integrations**

### Subtitle

> Connect HUNTIQ with your CRM, communication, calendar, data and automation tools.

Primary actions:

**Browse Integrations**

**Add Integration**

**Ask AI**

---

# 4. Connection overview

The top cards should immediately communicate system health.

### Connected

Example:

**8**

Total active integrations.

---

### Syncing

Example:

**3**

Integrations currently processing data.

---

### Attention Required

Example:

**1**

Connections requiring user action.

---

### Available

Example:

**24**

Integrations available to the workspace.

---

# 5. Integration categories

Use tabs:

### All

Everything available.

### CRM

Examples:

* Salesforce
* HubSpot
* Pipedrive

### Communication

Examples:

* Gmail
* Outlook
* Slack

### Calendar

Examples:

* Google Calendar
* Microsoft Outlook Calendar

### Data

Examples:

* CSV
* Google Sheets
* Database/API connections

### Automation

Examples:

* Zapier
* Make
* Webhooks

### Enrichment / Intelligence

Potential integrations with external data providers.

The exact providers should be determined by the integrations actually supported by the backend.

---

# 6. Integration cards

Each card should communicate more than "Connect."

Example:

## Gmail

**Communication**

> Sync email conversations, contacts and engagement activity with HUNTIQ.

Status:

🟢 **Connected**

Account:

`user@company.com`

Last sync:

**2 minutes ago**

Actions:

`Manage`

`Sync now`

---

For an unconnected integration:

## Google Calendar

**Calendar**

> Sync meetings and availability with your HUNTIQ activities.

`Connect`

---

# 7. Integration status

Use clear states.

```text
AVAILABLE
CONNECTED
SYNCING
SYNCED
ERROR
REAUTH_REQUIRED
DISCONNECTED
PAUSED
```

Don't rely purely on colors. Always include text/status indicators.

---

# 8. Connect workflow

Clicking **Connect** should open a setup flow.

### Step 1

**Connect Gmail**

> HUNTIQ will use this connection to synchronize email activity and relevant contact information.

Then:

### Permissions

```text
☑ Read email metadata
☑ Sync contacts
☑ Detect communication activity
☐ Send email
```

The user should understand what HUNTIQ is requesting before authorization.

---

# 9. Permission principle

Permissions should follow **least privilege**.

For example, if HUNTIQ only needs to read email metadata for activity tracking, don't request full mailbox modification access.

If sending email is a separate feature, it should require the additional permission.

---

# 10. OAuth implementation

For OAuth-based services:

```text
User
 ↓
HUNTIQ Connect
 ↓
OAuth authorization
 ↓
Provider
 ↓
Authorization callback
 ↓
Validate state
 ↓
Store encrypted credentials/token
 ↓
Create integration
 ↓
Start initial sync
```

Important:

### Never store raw OAuth secrets/tokens in frontend state.

Tokens should be securely stored server-side.

---

# 11. Integration detail page

Clicking **Manage** should open a dedicated integration detail screen or drawer.

Example:

# Gmail

**Connected**

`user@company.com`

---

### Connection

Status:

🟢 Healthy

Connected:

August 10, 2026

Last sync:

August 23, 2026 — 15:42

---

### Sync configuration

```text
Email activity          ON
Contacts                ON
Calendar                OFF
Email sending           OFF
```

Each should have its own setting where supported.

---

# 12. Data mapping

This is extremely important.

Different systems use different fields.

Example:

```text
External System             HUNTIQ

First Name       ───────→    First Name
Last Name        ───────→    Last Name
Company          ───────→    Company
Job Title        ───────→    Job Title
Email            ───────→    Email
Phone            ───────→    Phone
```

Users should be able to configure field mapping for supported integrations.

---

# 13. Sync direction

Support:

### Import

External system → HUNTIQ

### Export

HUNTIQ → External system

### Two-way

External system ↔ HUNTIQ

The UI should clearly show the selected direction.

---

# 14. Sync frequency

Possible options:

### Real-time

Where provider/webhooks support it.

### Every 5 minutes

### Every 15 minutes

### Hourly

### Daily

### Manual

Don't promise real-time sync for services that don't technically support it.

---

# 15. Initial synchronization

When a user first connects an integration:

```text
Connecting
     ↓
Authenticating
     ↓
Preparing sync
     ↓
Importing records
     ↓
Resolving duplicates
     ↓
Mapping fields
     ↓
Sync complete
```

Example:

> **Initial sync complete**

> 4,281 contacts processed
> 3,902 imported
> 291 matched
> 88 duplicates
> 0 errors

---

# 16. Duplicate resolution

HUNTIQ needs a proper identity-resolution layer.

Potential matching keys:

```text
Email
Company domain
External ID
Phone
Name + Company
```

Example:

> We found 42 contacts that may already exist in HUNTIQ.

Options:

`Review`

`Automatically merge`

`Keep separate`

The merge logic must be deterministic and auditable.

---

# 17. Sync activity

Each integration should have an activity log.

Example:

```text
SYNC ACTIVITY

15:42
✓ 42 contacts synchronized

15:40
✓ 12 activities imported

15:38
✓ 4 companies updated

15:35
⚠ 2 records could not be mapped
```

Clicking an error should reveal the reason.

---

# 18. Error handling

Example:

### Authentication expired

> Your Gmail connection requires reauthorization.

`Reconnect`

---

### Sync error

> HUNTIQ couldn't synchronize 12 records.

`View errors`

`Retry sync`

Never silently fail.

---

# 19. Integration health

Each connected service should expose:

### Connection health

Healthy / Warning / Error

### Last successful sync

### Last failed sync

### Records synchronized

### Error count

### API usage

Where the provider exposes useful limits.

---

# 20. Webhooks

For services that support them, use webhooks instead of polling wherever practical.

Example:

```text
External Service
       │
       │ webhook
       ↓
HUNTIQ Webhook Endpoint
       ↓
Validate signature
       ↓
Queue Event
       ↓
Process Event
       ↓
Update CRM
       ↓
Trigger automation
```

Webhook processing should be idempotent.

If the same event arrives twice, HUNTIQ shouldn't create duplicate records.

---

# 21. Integration event architecture

Use an internal event system.

Example:

```text
Gmail
 ↓
EMAIL_RECEIVED
 ↓
Event Processor
 ↓
Contact Activity
 ↓
Opportunity Update
 ↓
AI Signal Evaluation
 ↓
Notification
```

Another:

```text
Calendar
 ↓
MEETING_COMPLETED
 ↓
Activity Created
 ↓
Contact Updated
 ↓
Opportunity Timeline Updated
```

This gives the entire application a consistent integration architecture.

---

# 22. Integrations + Contacts

Example:

A Gmail sync detects:

> Jane Smith ↔ [user@company.com](mailto:user@company.com)

HUNTIQ can:

1. Match Jane to an existing contact.
2. Add email activity.
3. Update last-contacted date.
4. Update engagement.
5. Potentially update opportunity activity.

The integration shouldn't create an isolated copy of the contact.

---

# 23. Integrations + Companies

If a connected CRM contains:

> Acme Technologies

HUNTIQ should resolve it to the existing company record where possible.

Use:

* External ID
* Domain
* Company name
* Website
* Other identity signals

---

# 24. Integrations + Opportunities

Example:

An external CRM opportunity:

**Acme HR Transformation — $50,000**

can map to HUNTIQ's opportunity.

The integration should specify which system is authoritative for each field where two-way sync is enabled.

---

# 25. Integrations + Market Intelligence

This is especially interesting.

External data can feed HUNTIQ's intelligence engine.

Example:

```text
External Data
     ↓
Integration
     ↓
Company/Contact resolution
     ↓
Signal detection
     ↓
Market Intelligence
     ↓
Opportunity scoring
```

This makes integrations part of the intelligence pipeline.

---

# 26. Integrations + AI Copilot

The Copilot should know what integrations are available.

User:

> "What meetings do I have tomorrow with prospects?"

Copilot:

```text
AI
 ↓
Calendar Integration
 ↓
Retrieve meetings
 ↓
Match attendees to contacts
 ↓
Match contacts to companies
 ↓
Return enriched result
```

Another:

> "Which prospects did I email this week?"

AI uses the communication integration.

---

# 27. Integration-specific AI actions

Examples:

> "Sync my contacts."

> "Show me meetings with prospects this week."

> "Which opportunities haven't had an email in 14 days?"

> "Push these 20 qualified leads to HubSpot."

> "Create follow-up tasks from yesterday's meetings."

The Copilot should invoke controlled integration tools rather than directly manipulating credentials.

---

# 28. API / developer integrations

Eventually HUNTIQ should support:

### API Keys

For external systems.

### Webhooks

For inbound events.

### Outbound webhooks

For HUNTIQ events.

Example:

```text
POST /api/webhooks
```

Events:

```text
contact.created
contact.updated
company.created
signal.detected
opportunity.created
opportunity.updated
deal.won
deal.lost
task.created
```

---

# 29. Developer/API section

Later, add:

**Developer**

> Build custom integrations with HUNTIQ.

Features:

* API keys
* OAuth apps
* Webhooks
* API documentation
* Usage
* Logs

This could eventually become a separate **Developer Settings** page rather than cluttering the main Integrations screen.

---

# 30. Database architecture

Use a generic integration model rather than creating completely different database structures for every provider.

### integrations

```text
integrations
-------------------------
id
workspace_id
provider
category
status
display_name
external_account_id
created_at
updated_at
last_sync_at
last_error_at
metadata
```

---

### Integration credentials

```text
integration_credentials
-------------------------
id
integration_id
access_token_encrypted
refresh_token_encrypted
expires_at
scopes
created_at
updated_at
```

Credentials should be encrypted at rest.

---

### Sync jobs

```text
integration_sync_jobs
-------------------------
id
integration_id
type
status
started_at
completed_at
records_processed
records_created
records_updated
records_failed
error
```

---

### External records

Useful for synchronization and identity resolution:

```text
external_records
-------------------------
id
integration_id
external_id
entity_type
huntiq_entity_id
last_seen_at
metadata
```

This prevents duplicate creation and allows reliable updates.

---

# 31. API architecture

```text
GET    /api/integrations
GET    /api/integrations/:id

POST   /api/integrations/:provider/connect
GET    /api/integrations/:provider/callback

PATCH  /api/integrations/:id
DELETE /api/integrations/:id

POST   /api/integrations/:id/sync
POST   /api/integrations/:id/reconnect

GET    /api/integrations/:id/activity
GET    /api/integrations/:id/errors

PATCH  /api/integrations/:id/mapping
PATCH  /api/integrations/:id/sync-settings
```

---

# 32. Background workers

Synchronization should never block the main application request.

Use:

```text
Integration
     ↓
Sync Job
     ↓
Queue
     ↓
Worker
     ↓
Provider API
     ↓
Normalize
     ↓
Resolve entities
     ↓
Upsert records
     ↓
Emit internal events
     ↓
Update sync status
```

This architecture will scale much better.

---

# 33. Rate limits

Every integration adapter should understand the provider's:

* Rate limits
* Pagination
* Retry policy
* Authentication expiration
* API errors

Use exponential backoff for retryable failures.

Example:

```text
Attempt 1
 ↓
30 sec
 ↓
Attempt 2
 ↓
2 min
 ↓
Attempt 3
```

Don't endlessly retry an authentication failure.

---

# 34. Integration adapter architecture

I'd strongly recommend an adapter interface:

```text
IntegrationProvider
    ├── authenticate()
    ├── refreshToken()
    ├── testConnection()
    ├── fetchContacts()
    ├── fetchCompanies()
    ├── fetchActivities()
    ├── pushContact()
    ├── pushCompany()
    ├── pushOpportunity()
    ├── subscribeWebhooks()
    └── disconnect()
```

Then each provider implements the interface.

For example:

```text
GmailAdapter
HubSpotAdapter
SalesforceAdapter
GoogleCalendarAdapter
OutlookAdapter
```

This prevents provider-specific code from spreading throughout the application.

---

# 35. Security

This page needs stronger security than ordinary CRUD pages.

Implement:

### Encryption

OAuth tokens encrypted at rest.

### OAuth state validation

Prevent CSRF during OAuth flows.

### Scope control

Only request required permissions.

### Workspace isolation

Integration credentials must belong to the correct workspace.

### Audit logs

Record:

* Connected
* Disconnected
* Reconnected
* Sync started
* Sync completed
* Sync failed
* Settings changed

---

# 36. Disconnect workflow

Don't instantly disconnect after a single click.

Show:

> **Disconnect Gmail?**

> HUNTIQ will stop synchronization. Existing HUNTIQ data will remain unless you choose to remove it.

Options:

**Disconnect only**

or

**Disconnect + remove synchronized data**

The second should require explicit confirmation.

---

# 37. Integration data ownership

This needs to be clearly defined.

For every synchronized field, determine:

### Source of truth

Example:

```text
External CRM → Company name
HUNTIQ → Opportunity score
HUNTIQ → Market signals
Email provider → Email activity
Calendar → Meeting time
```

This prevents endless two-way sync conflicts.

---

# 38. Conflict handling

Example:

HUNTIQ:

> Company name = Acme Technologies

HubSpot:

> Company name = Acme Technology Ltd.

The system should not blindly overwrite one with the other.

Possible:

> **Sync conflict detected**

Show:

```text
HUNTIQ
Acme Technologies

HubSpot
Acme Technology Ltd.
```

Then:

`Keep HUNTIQ`

`Use HubSpot`

`Review`

---

# 39. Empty state

If no integrations exist:

### Connect your tools

> Bring your CRM, email, calendar and other workflows into HUNTIQ.

Show the most useful integrations first.

Primary:

**Browse Integrations**

Secondary:

**Import CSV**

---

# 40. What NOT to do

Avoid:

❌ A marketplace full of logos with no functionality

❌ Exposing OAuth tokens

❌ Syncing everything by default

❌ Requesting excessive permissions

❌ Silent sync failures

❌ Creating duplicate contacts

❌ Hard-coding every provider directly into CRM logic

❌ Assuming two-way sync is always safe

❌ Letting AI access raw credentials

---

# 41. Implementation priority

### P0 — MVP

* Integration marketplace
* Connection cards
* OAuth
* Connected/Disconnected states
* Integration settings
* Sync status
* Manual sync
* Error handling
* Activity logs

### P1 — CRM connectivity

* Contact sync
* Company sync
* Activity sync
* Duplicate resolution
* Field mapping
* Two-way sync where appropriate

### P2 — Communication

* Gmail/Outlook
* Calendar
* Email activity
* Meeting activity

### P3 — Automation

* Webhooks
* Zapier/Make-style workflows
* Event triggers
* Outbound webhooks
* AI-driven integration actions

### P4 — Developer platform

* API keys
* Public API
* OAuth apps
* Developer portal
* Custom integrations

---

# 42. How Integrations fit into HUNTIQ

This is the important architectural relationship:

```text
                  EXTERNAL WORLD
                        │
       ┌────────────────┼─────────────────┐
       ↓                ↓                 ↓
     CRM              EMAIL            CALENDAR
       │                │                 │
       └────────────────┼─────────────────┘
                        ↓
                  INTEGRATION LAYER
                        │
                 ┌──────┴──────┐
                 ↓             ↓
            DATA SYNC       EVENTS
                 │             │
                 └──────┬──────┘
                        ↓
                 HUNTIQ DATA LAYER
                        │
       ┌────────────────┼─────────────────┐
       ↓                ↓                 ↓
    CONTACTS         COMPANIES        ACTIVITIES
       │                │                 │
       └────────────────┼─────────────────┘
                        ↓
                INTELLIGENCE ENGINE
                        │
             ┌──────────┼──────────┐
             ↓          ↓          ↓
          SIGNALS     MARKET     SCORING
                        │
                        ↓
                    AI COPILOT
                        │
                        ↓
               ACTIONS / REPORTS
```

So the **Integrations page is effectively the bridge between HUNTIQ and the user's existing business ecosystem**.

The visual design should make that obvious: **connected tools, sync health, data flow, and actionable configuration** should be more prominent than a generic list of app logos.

I can also create the **Integrations page UI reference image** from this specification.
