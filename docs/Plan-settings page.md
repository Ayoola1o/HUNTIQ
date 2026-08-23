# HUNTIQ — Settings Page Specification

The **Settings page** is the control center for the entire HUNTIQ workspace. It should not be a single long form. It should be organized into clear settings modules so users can configure their account, workspace, CRM behavior, AI, prospecting, integrations, security, billing, and notifications without confusion.

The main principle:

> **Settings control how HUNTIQ behaves; the operational pages show what HUNTIQ is doing.**

---

# 1. Settings Page Structure

Use a **two-level layout**:

```text
┌──────────────────────────────────────────────────────────────────┐
│ Settings                                           Save Changes  │
│ Manage your account, workspace and HUNTIQ configuration          │
├────────────────┬─────────────────────────────────────────────────┤
│                │                                                 │
│ GENERAL        │  Workspace Settings                             │
│ Workspace      │  Configure how your HUNTIQ workspace operates  │
│ Profile        │                                                 │
│ Team           │  ┌─────────────────────────────────────────────┐ │
│ Roles          │  │ Workspace Name                             │ │
│                │  │ HUNTIQ                                    │ │
│ CRM            │  │                                             │ │
│ Pipeline       │  │ Workspace URL                              │ │
│ Custom Fields  │  │ huntiq.app/acme                            │ │
│ Tags           │  │                                             │ │
│                │  │ Default Currency                           │ │
│ AI             │  │ USD                                         │ │
│ AI Settings    │  │                                             │ │
│ AI Preferences │  └─────────────────────────────────────────────┘ │
│                │                                                 │
│ PROSPECTING    │                                                 │
│ ICP            │                                                 │
│ Scoring        │                                                 │
│ Signals        │                                                 │
│                │                                                 │
│ COMMUNICATION  │                                                 │
│ Notifications  │                                                 │
│ Email          │                                                 │
│                │                                                 │
│ SECURITY       │                                                 │
│ Security       │                                                 │
│ API Keys       │                                                 │
│ Audit Log      │                                                 │
│                │                                                 │
│ BILLING        │                                                 │
│ Plan & Billing │                                                 │
│ Usage          │                                                 │
│                │                                                 │
└────────────────┴─────────────────────────────────────────────────┘
```

The left navigation remains persistent while the right side changes based on the selected setting.

---

# 2. Settings Categories

Recommended navigation:

### General

* Workspace
* Profile
* Team
* Roles & Permissions

### CRM

* Pipeline
* Custom Fields
* Tags
* Activities

### Prospecting

* ICP
* Opportunity Scoring
* Buying Signals
* Search Defaults

### AI

* AI Configuration
* AI Preferences
* AI Usage

### Communication

* Notifications
* Email Preferences

### Integrations

* Connected Apps

### Security

* Security
* Sessions
* API Keys
* Audit Log

### Billing

* Plan & Billing
* Usage

### Advanced

* Data Management
* Danger Zone

---

# 3. Workspace Settings

This defines the workspace itself.

Fields:

### Workspace Name

> HUNTIQ

### Workspace URL

> hunt...

### Workspace Logo

Upload/change logo.

### Default Language

Example:

> English

### Default Currency

Examples:

* USD
* NGN
* GBP
* EUR

### Timezone

Example:

> Africa/Lagos

This should affect:

* Scheduled reports
* Tasks
* Notifications
* Activity timestamps
* Automation

### Date Format

Examples:

`MM/DD/YYYY`

`DD/MM/YYYY`

---

# 4. Workspace Defaults

Configure default behavior.

Examples:

### Default contact owner

### Default opportunity stage

### Default lead status

### Default report period

### Default prospect location

### Default search radius

These settings should reduce repetitive configuration throughout the application.

---

# 5. Profile Settings

The user's personal settings.

### Personal information

* First name
* Last name
* Profile photo
* Job title
* Phone
* Email

### Preferences

* Timezone
* Language
* Date format
* Default landing page

Example:

> Open HUNTIQ on Dashboard

or:

> Open HUNTIQ on Prospect Hunter

---

# 6. Team Settings

Workspace administrators should be able to manage users.

Display:

| User   | Role      | Status  | Last Active | Actions |
| ------ | --------- | ------- | ----------- | ------- |
| Ayoola | Owner     | Active  | Today       | Manage  |
| Sarah  | Manager   | Active  | 2h ago      | Manage  |
| David  | Sales Rep | Invited | —           | Resend  |

Actions:

**Invite Member**

**Change Role**

**Deactivate**

**Remove**

---

# 7. Invite Team Member

Modal:

### Invite people

Email:

`name@company.com`

Role:

* Admin
* Manager
* Sales Rep
* Analyst
* Viewer

Optional:

### Teams

Assign the user to:

* Sales
* Research
* Management

Then:

**Send Invitation**

---

# 8. Roles & Permissions

Don't hard-code permissions entirely into frontend components.

Use permission-based authorization.

Example:

```text
Workspace
 ├── workspace.view
 ├── workspace.manage
 ├── team.view
 ├── team.manage
 │
CRM
 ├── contacts.view
 ├── contacts.create
 ├── contacts.edit
 ├── contacts.delete
 │
Companies
 ├── companies.view
 ├── companies.manage
 │
Opportunities
 ├── opportunities.view
 ├── opportunities.manage
 │
AI
 ├── ai.use
 ├── ai.actions
 │
Reports
 ├── reports.view
 ├── reports.create
 └── reports.export
```

Backend authorization must enforce these permissions.

---

# 9. CRM Settings

## Pipeline

Configure stages.

Example:

```text
New
 ↓
Qualified
 ↓
Contacted
 ↓
Engaged
 ↓
Meeting
 ↓
Proposal
 ↓
Negotiation
 ↓
Won / Lost
```

Users can:

* Add stage
* Rename stage
* Reorder stage
* Set probability
* Archive stage

---

# 10. Opportunity probabilities

Example:

| Stage       | Probability |
| ----------- | ----------: |
| New         |         10% |
| Qualified   |         20% |
| Meeting     |         40% |
| Proposal    |         60% |
| Negotiation |         80% |
| Won         |        100% |
| Lost        |          0% |

These probabilities feed:

**Forecasting**

**Reports**

**Pipeline analytics**

---

# 11. Custom Fields

Users often need company-specific CRM data.

Allow:

### Contact custom fields

Examples:

* Industry specialization
* Decision authority
* Preferred communication

### Company custom fields

Examples:

* Annual revenue
* Region
* Account tier

### Opportunity custom fields

Examples:

* Contract type
* Estimated implementation date

Field types:

* Text
* Number
* Currency
* Date
* Dropdown
* Multi-select
* Checkbox
* URL

---

# 12. Tags

Manage global tags.

Examples:

`HOT`

`ENTERPRISE`

`DECISION MAKER`

`HIRING`

`EXPANSION`

`FINTECH`

Users can:

* Create
* Rename
* Merge
* Archive

---

# 13. Activity Settings

Configure CRM activity types:

* Email
* Call
* Meeting
* Note
* Task
* LinkedIn interaction
* Research
* Other

Allow administrators to create custom activity types later.

---

# 14. Prospecting Settings

This is one of the most important settings areas.

# ICP Configuration

The user defines their ideal customer profile.

### Industries

```text
Technology
Financial Services
Healthcare
```

### Geography

```text
Nigeria
Ghana
Kenya
```

### Company size

```text
50–500 employees
```

### Revenue

Optional.

### Preferred buyer roles

```text
CEO
HR Director
COO
Head of People
```

### Excluded industries

Example:

> Government

This configuration should feed:

* Prospect Hunter
* Market Intelligence
* Opportunity scoring
* AI Copilot
* Recommendations

---

# 15. Opportunity Scoring Settings

Users should be able to configure how HUNTIQ scores prospects.

Example:

```text
ICP Fit                 30%
Buying Intent           25%
Signal Strength         20%
Company Growth          15%
Contact Quality         10%
```

Total:

**100%**

Show a live preview:

> Example company score: **87/100**

---

# 16. Signal Preferences

Configure which signals matter.

### Hiring

Weight:

**High**

### Expansion

Weight:

**High**

### Funding

Weight:

**Medium**

### Leadership change

Weight:

**Medium**

### Technology adoption

Weight:

**Low**

### News

Weight:

**Low**

This directly influences opportunity scoring.

---

# 17. Search Defaults

Configure default Prospect Hunter behavior.

Examples:

### Default geography

Nigeria

### Default company size

50–500

### Default industries

Technology + Financial Services

### Minimum opportunity score

70

### Show only verified contacts

Yes/No

---

# 18. AI Settings

This should be a dedicated section rather than a simple "AI on/off."

### AI Model Preference

Possible options:

**Fast**

For lightweight queries.

**Balanced**

Default.

**Advanced**

For deeper research.

The backend can map these preferences to available models.

---

# 19. AI behavior

Configure:

### Response style

* Concise
* Balanced
* Detailed

### Research depth

* Quick
* Standard
* Deep

### AI recommendations

On/Off

### Proactive insights

On/Off

### AI actions

Control whether the Copilot can perform certain actions.

For example:

```text
View data              ✓
Create tasks           ✓
Update CRM             ✓
Create campaigns       ✓
Send emails            ○
Delete records         ✕
```

---

# 20. AI approval policy

This is important.

Define which actions require confirmation.

### No confirmation

* Search
* Analyze
* Read CRM data
* Generate report

### Confirmation required

* Update records
* Create campaign
* Send email
* Bulk changes

### Never AI-controlled

* Delete workspace
* Change billing
* Remove users
* Access security credentials

This creates a proper AI permission boundary.

---

# 21. AI data privacy

Give the user control over whether certain workspace data can be used for AI processing.

Examples:

### Allow AI to analyze CRM data

ON

### Allow AI to analyze email activity

ON

### Allow AI to use uploaded documents

ON

### Save AI conversation history

ON

The actual controls should correspond to what the backend truly supports.

Don't display settings that don't have an implementation behind them.

---

# 22. AI Usage

Show:

### AI requests

**4,284**

### Tokens / compute

Depending on provider/model.

### Estimated usage

**$38.42**

### Remaining allowance

**72%**

This is particularly useful for SaaS billing.

---

# 23. Notifications

Users should control notification channels.

### In-app

* New opportunity
* New signal
* Pipeline risk
* Task reminder
* AI recommendation

### Email

* Daily prospecting brief
* Weekly report
* Opportunity alerts
* Team activity

### Push

Later.

---

# 24. Notification rules

Example:

### High-value opportunity

Notify when:

> Opportunity score ≥ 90

Channel:

☑ In-app

☑ Email

---

### New buying signal

Notify when:

> Signal strength = Very High

---

### Pipeline risk

Notify when:

> No activity > 14 days

---

# 25. Email Settings

Configure:

### Sending address

### Email signature

### Reply-to address

### Tracking preferences

Where legally/technically supported:

* Opens
* Clicks
* Replies

### Sending limits

These should respect the actual email provider/integration limitations.

---

# 26. Integration Settings

The detailed integration management can live on the dedicated **Integrations page**.

Settings should provide a shortcut:

> Manage connected applications

This prevents duplicate functionality.

---

# 27. Security Settings

### Password

Change password.

### Two-factor authentication

Enable/disable where supported.

### Active sessions

Show:

```text
Chrome — Windows
New York
Current session

Safari — iPhone
2 days ago
```

Actions:

**Sign out**

**Sign out all other sessions**

---

# 28. Login/security alerts

Allow:

> Notify me when a new device signs into my account.

Also:

> Notify me when security settings change.

---

# 29. API Keys

For developer/business users:

```text
API Keys

Production
••••••••••••••••

Created:
Aug 12

Last used:
Today
```

Actions:

* Create
* Revoke
* Rotate

Important:

> Display the full secret only once at creation.

Store hashed/secure representations where appropriate rather than plaintext secrets.

---

# 30. Audit Log

This should be a proper security/activity record.

Example:

```text
Aug 23 15:42
Ayoola
Updated opportunity scoring

Aug 23 14:21
Sarah
Connected HubSpot

Aug 22 19:10
Ayoola
Invited David

Aug 22 11:03
System
Completed contact synchronization
```

Filters:

* User
* Action
* Resource
* Date
* IP/device where appropriate

---

# 31. Data Management

Administrators should be able to manage workspace data.

### Export data

Export:

* Contacts
* Companies
* Opportunities
* Activities
* Reports

### Import

CSV imports should be handled through the relevant workflows.

### Data retention

Where applicable.

---

# 32. Delete/archive controls

Never put destructive actions casually beside normal settings.

Use:

# Danger Zone

### Archive workspace

### Delete workspace

### Delete all CRM data

Require explicit confirmation.

For workspace deletion, require a strong confirmation such as typing the workspace name.

---

# 33. Billing & Plan

For SaaS, this should be included in Settings but preferably separated visually.

Show:

### Current plan

**Pro**

### Billing cycle

Monthly

### Next billing date

Example:

September 23, 2026

### Usage

```text
Contacts       8,420 / 10,000
AI requests    4,284 / 10,000
Team members   8 / 10
Research       1,284 / 2,000
```

---

# 34. Upgrade prompts

When a limit is approached:

> You've used 82% of your monthly AI allowance.

`View Usage`

`Upgrade Plan`

Don't interrupt the user constantly; use contextual notices.

---

# 35. Settings search

This is highly recommended.

At the top:

> **Search settings...**

Examples:

User searches:

> "email"

Results:

* Email signature
* Email notifications
* Email integration
* Email tracking

This becomes increasingly valuable as HUNTIQ grows.

---

# 36. Save behavior

Don't make every settings page require a giant global "Save Everything."

Use section-level saving:

```text
Opportunity Scoring

[settings...]

             [Cancel] [Save Changes]
```

For simple toggles, save immediately where appropriate.

Show:

> ✓ Saved

after successful changes.

---

# 37. Unsaved changes

If the user changes a form and attempts to leave:

> You have unsaved changes.

`Stay`

`Discard`

This prevents accidental configuration loss.

---

# 38. API/backend architecture

Settings should be separated by domain.

```text
/api/settings/workspace
/api/settings/profile
/api/settings/team
/api/settings/roles

/api/settings/crm
/api/settings/pipeline
/api/settings/custom-fields

/api/settings/prospecting
/api/settings/icp
/api/settings/scoring
/api/settings/signals

/api/settings/ai
/api/settings/notifications

/api/settings/security
/api/settings/api-keys

/api/settings/billing
```

Don't build one massive:

```text
PATCH /api/settings
```

that accepts arbitrary fields.

Domain separation makes authorization and validation safer.

---

# 39. Database architecture

A clean approach is to separate configuration by domain.

### workspace_settings

```text
workspace_id
timezone
currency
language
date_format
default_settings
updated_at
```

### user_settings

```text
user_id
timezone
language
notification_preferences
ai_preferences
ui_preferences
updated_at
```

### scoring_settings

```text
workspace_id
icp_weight
intent_weight
signal_weight
growth_weight
contact_weight
updated_at
```

### notification_settings

```text
workspace_id
user_id
event_type
channel
enabled
threshold
```

---

# 40. Configuration versioning

For important settings such as scoring:

```text
Version 1
ICP = 30%
Intent = 25%

Version 2
ICP = 40%
Intent = 20%
```

This is useful for understanding why opportunity scores changed.

Especially important when generating reports.

---

# 41. Settings audit trail

Every meaningful configuration change should create an audit event.

Example:

```text
SCORING_UPDATED

User:
Ayoola

Before:
ICP 30%
Intent 25%

After:
ICP 40%
Intent 20%

Timestamp:
2026-08-23 15:41
```

This is especially important for enterprise customers.

---

# 42. Frontend architecture

I'd structure the settings routes like:

```text
/settings
/settings/workspace
/settings/profile
/settings/team
/settings/roles

/settings/crm
/settings/crm/pipeline
/settings/crm/custom-fields
/settings/crm/tags

/settings/prospecting
/settings/prospecting/icp
/settings/prospecting/scoring
/settings/prospecting/signals

/settings/ai
/settings/ai/preferences
/settings/ai/usage

/settings/notifications

/settings/security
/settings/security/sessions
/settings/security/api-keys
/settings/security/audit-log

/settings/billing
```

This is much easier to maintain than one huge React component.

---

# 43. Frontend implementation pattern

Use reusable components:

```text
SettingsLayout
SettingsSidebar
SettingsSection
SettingsCard
SettingsField
SettingsToggle
SettingsSelect
SettingsInput
SettingsSaveBar
DangerZone
PermissionMatrix
```

Then individual pages compose those components.

---

# 44. Validation

Every setting needs backend validation.

Example:

```text
Currency
→ Must be supported currency

Timezone
→ Must be valid IANA timezone

Scoring weights
→ Must total 100%

Email
→ Must be valid email

Workspace name
→ Required
```

Don't rely only on frontend validation.

---

# 45. Permission enforcement

For example:

```text
Sales Rep
    ↓
Can edit personal settings
    ↓
Cannot modify workspace scoring

Manager
    ↓
Can modify team settings

Admin
    ↓
Can modify workspace configuration

Owner
    ↓
Can modify billing/security/destructive settings
```

The frontend can hide unauthorized controls, but the **backend must enforce authorization**.

---

# 46. What NOT to do

Avoid:

❌ One massive settings page

❌ 100+ toggles on one screen

❌ Settings that don't actually change backend behavior

❌ Frontend-only permissions

❌ Exposing API secrets

❌ Putting Delete Workspace beside Save

❌ Making users configure things they don't need

❌ Duplicating the Integrations page

❌ Duplicating Profile functionality elsewhere

---

# 47. Implementation priority

### P0 — MVP

* Workspace
* Profile
* Team
* Roles
* Pipeline
* ICP
* Opportunity scoring
* Notifications
* Basic security

### P1

* Custom fields
* Tags
* AI configuration
* AI permissions
* Search settings
* Audit log

### P2

* API keys
* Advanced security
* Usage
* Billing
* Data management

### P3

* Advanced automation settings
* Configuration versioning
* Enterprise permissions
* Advanced governance

---

# 48. How Settings connects to the rest of HUNTIQ

This is the most important architectural relationship:

```text
                         SETTINGS
                            │
       ┌────────────────────┼─────────────────────┐
       ↓                    ↓                     ↓
      ICP                 SCORING                AI
       │                    │                     │
       ↓                    ↓                     ↓
PROSPECT HUNTER       OPPORTUNITY SCORE      AI COPILOT
       │                    │                     │
       └────────────────────┼─────────────────────┘
                            ↓
                   MARKET INTELLIGENCE
                            │
                            ↓
                         CONTACTS
                            │
                            ↓
                       PIPELINE / CRM
                            │
                            ↓
                         REPORTS
```

So when the user changes:

> **ICP → Target company size: 50–500**

that shouldn't merely change a setting screen.

It should influence **Prospect Hunter, Market Intelligence, Opportunity Scoring, AI Copilot recommendations, and Reports**.

Likewise, if they change:

> **Hiring signal weight: High → Very High**

the scoring engine should use the new configuration for subsequent opportunity calculations.

---

# 49. The Settings page's core principle

The page should ultimately answer:

> **"How do I want HUNTIQ to work for my business?"**

The other pages then answer:

* **Dashboard:** What should I do?
* **Prospects:** Who should I target?
* **Companies:** Which organizations matter?
* **Contacts:** Who should I talk to?
* **Market Intelligence:** What is happening?
* **Pipeline:** What opportunities am I managing?
* **Reports:** What happened?
* **AI Copilot:** What should I ask/do?
* **Integrations:** What external systems should HUNTIQ connect to?
* **Settings:** **How should all of this behave?**

That separation will keep the SaaS architecture clean as HUNTIQ grows.

I can also create the **Settings page UI reference image** based on this specification.
