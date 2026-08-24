# HUNTIQ — Profile Page Specification

The **Profile page** is specifically for the **individual user's identity, personal preferences, account security, sessions, and personal activity**.

It should **not** contain workspace-wide settings such as ICP, pipeline configuration, scoring rules, billing, or team permissions. Those belong in **Settings → Workspace / Team / Security / Billing**.

The profile page should answer:

> **“Who am I in HUNTIQ, how does HUNTIQ behave for me, and is my account secure?”**

---

# 1. Main Profile Page

Recommended structure:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Profile                                  Discard   Save Changes    │
│ Manage your personal information, preferences and account security │
├───────────────────────┬───────────────────────────────┬─────────────┤
│                       │                               │             │
│ Profile               │ Personal Information          │ Profile     │
│ Preferences           │                               │ Preview     │
│ Notifications         │ [Avatar]                      │             │
│ Security              │ First Name    Last Name       │             │
│ Sessions              │ Email         Phone           │             │
│ Connected Accounts    │ Job Title     Department      │             │
│                       │ Bio                           │             │
│                       │                               │             │
│                       ├───────────────────────────────┤             │
│                       │ Preferences                   │             │
│                       │ Language                      │             │
│                       │ Timezone                      │             │
│                       │ Date Format                   │             │
│                       │ Default Landing Page          │             │
│                       │ Currency                      │             │
│                       │                               │             │
│                       ├───────────────────────────────┤             │
│                       │ Security                      │             │
│                       │ Password       [Change]       │             │
│                       │ 2FA            [Enabled]      │             │
│                       │                               │             │
│                       ├───────────────────────────────┤             │
│                       │ Recent Activity               │             │
│                       │ Login / Security events       │             │
│                       │                               │             │
└───────────────────────┴───────────────────────────────┴─────────────┘
```

The generated visual follows this structure: a dark HUNTIQ sidebar, clean white content panels, purple accent states, a profile preview card, account summary, connected accounts, and recent activity.

---

# 2. Profile Header

At the top:

### Profile

Subtitle:

> Manage your personal information, preferences and account security.

Right side:

**Discard**

**Save Changes**

The save button should only become active when there are unsaved changes.

---

# 3. Personal Information

This is the primary section.

### Profile photo

Show:

* Current avatar
* Upload/change button
* Camera icon
* Remove photo

Supported formats should be validated on the backend.

Example:

```text
       ┌─────────┐
       │         │
       │ AVATAR  │
       │         │
       └─────────┘

      [Change Photo]
```

---

## Personal fields

### First Name

```text
Ayoola
```

### Last Name

```text
Adebisi
```

### Email

```text
ayoola@example.com
```

Email should generally be treated as a verified account identifier.

If changed:

> A verification email has been sent to your new address.

---

### Phone

```text
+234 ...
```

Optional depending on product requirements.

---

### Job Title

Example:

> Growth & Strategy Lead

---

### Department

Example:

> Growth

---

### Bio

Short description of the user.

Example:

> Growth strategist focused on finding and converting high-value opportunities.

Keep this relatively short.

---

# 4. Profile Preview

The right side should contain a visual preview.

```text
┌──────────────────────────────┐
│                              │
│        PROFILE COVER         │
│                              │
│          ┌──────┐            │
│          │PHOTO │            │
│          └──────┘            │
│                              │
│        Ayoola Adebisi        │
│      Growth & Strategy Lead  │
│            HUNTIQ            │
│                              │
│       ● Active               │
│                              │
│       LinkedIn  Website      │
└──────────────────────────────┘
```

This is useful because the user can immediately see how their identity appears to other team members.

---

# 5. Account Summary

A small right-side card:

### Role

**Workspace Owner**

### Member Since

**May 2026**

### Last Active

**Today, 10:42 AM**

### Account Status

🟢 **Active**

This information should be read-only.

The user's role should be managed through:

**Settings → Team / Roles**

not here.

---

# 6. Preferences

Preferences are **personal**, not workspace-wide.

Recommended settings:

### Language

```text
English
```

### Timezone

```text
(GMT+01:00) Lagos
```

### Date Format

```text
DD MMM YYYY
```

### Time Format

```text
24 Hour
```

### Default Landing Page

Options:

* Dashboard
* Find Prospects
* Companies
* Pipeline
* Market Intelligence

### Default Currency

If the user frequently works with monetary values.

```text
USD — US Dollar
```

Important distinction:

**User currency preference** ≠ **workspace accounting currency**.

Workspace currency belongs in Workspace Settings.

---

# 7. Default Landing Page

This is a useful personalization feature.

Example:

```text
Default landing page

[ Dashboard ▼ ]
```

If the user selects:

> Find Prospects

then after login:

```text
Login
 ↓
Authentication
 ↓
Load user preferences
 ↓
Read default_landing_page
 ↓
/prospects
```

This should not be hardcoded.

---

# 8. Security

The profile page can provide a compact security overview.

### Password

```text
Password
••••••••••••••••

[Change Password]
```

Do not display or retrieve the actual password.

---

## Two-Factor Authentication

Example:

```text
Two-Factor Authentication

● Enabled

Your account is protected with an authenticator app.

[Manage 2FA]
```

If disabled:

```text
○ Not enabled

Protect your account with two-factor authentication.

[Enable 2FA]
```

The actual 2FA management can open:

**Settings → Security**

---

# 9. Change Password

Clicking:

**Change Password**

opens a modal/page.

```text
Change Password

Current Password
[••••••••••••]

New Password
[••••••••••••]

Confirm New Password
[••••••••••••]

Password strength
████████░░ Strong

[Cancel] [Update Password]
```

Backend requirements:

* Verify current password
* Validate new password
* Hash using a modern password hashing algorithm
* Invalidate/revoke sessions according to security policy
* Record audit event

Never store plaintext passwords.

---

# 10. Recent Activity

This is one of the most useful sections.

Example:

```text
Recent Activity

Activity                    Device             Time
────────────────────────────────────────────────────
✓ Logged in successfully    Chrome / Windows   Today 10:42
✓ Password changed         Chrome / Windows   Aug 20
✓ 2FA enabled              Chrome / Windows   Aug 18
✓ Profile updated          Chrome / Windows   Aug 16
```

Potential events:

* Login
* Logout
* Password changed
* Email changed
* 2FA enabled
* 2FA disabled
* Profile updated
* API key created
* API key revoked
* Integration connected

---

# 11. View All Activity

Provide:

**View all activity →**

This should take the user to:

**Settings → Security → Audit Log**

rather than building another duplicate activity system.

---

# 12. Connected Accounts

Show external accounts associated with the user's identity.

Example:

```text
Connected Accounts

Google
ayoola@gmail.com
● Connected

Microsoft
ayoola@company.com
● Connected

Slack
ayoola
● Connected

[Manage Connections →]
```

This is different from the full **Integrations** page.

### Profile

Shows:

> Which personal identity accounts are connected.

### Integrations

Shows:

> Which external business systems HUNTIQ is connected to and what data is synchronized.

---

# 13. Social/Profile Links

Optional:

* LinkedIn
* X
* Website

Example:

```text
LinkedIn
https://linkedin.com/in/...

Website
https://...
```

These can appear in the profile preview.

Don't make these mandatory.

---

# 14. Profile Completion

A small useful feature:

```text
Profile completeness

████████░░ 80%

Add your job title
Add your profile photo
```

Don't make this overly gamified.

The purpose is to encourage useful information that improves team collaboration.

---

# 15. Why profile data matters to HUNTIQ

Profile information shouldn't exist only for display.

For example:

### Job title

Can appear in:

* Team activity
* Reports
* Assigned opportunities

### Department

Can be used for:

* Team segmentation
* Permissions
* Reporting

### Timezone

Can affect:

* Notifications
* Scheduled tasks
* Meetings
* Report delivery

### Default landing page

Controls login routing.

---

# 16. Backend Data Model

A clean user model:

```text
users
────────────────────────
id
workspace_id
first_name
last_name
email
phone
avatar_url
job_title
department
bio
email_verified_at
status
created_at
updated_at
last_active_at
```

---

# 17. User Preferences

Don't overload the `users` table with every UI preference.

Use:

```text
user_preferences
────────────────────────
id
user_id
language
timezone
date_format
time_format
default_landing_page
currency
created_at
updated_at
```

---

# 18. Connected Accounts

```text
connected_accounts
────────────────────────
id
user_id
provider
provider_user_id
email
scopes
status
connected_at
last_used_at
created_at
updated_at
```

Credentials/tokens should be stored separately and securely.

---

# 19. Sessions

Sessions should be stored independently.

```text
user_sessions
────────────────────────
id
user_id
device
browser
ip_address
location
last_active_at
created_at
revoked_at
```

The frontend should never be able to arbitrarily manipulate another user's sessions.

---

# 20. Profile API

Recommended endpoints:

```text
GET    /api/profile

PATCH  /api/profile

POST   /api/profile/avatar

DELETE /api/profile/avatar

GET    /api/profile/preferences

PATCH  /api/profile/preferences

GET    /api/profile/activity

GET    /api/profile/sessions

POST   /api/profile/sessions/:id/revoke
```

Password:

```text
POST /api/auth/change-password
```

2FA:

```text
GET  /api/security/2fa
POST /api/security/2fa/setup
POST /api/security/2fa/verify
POST /api/security/2fa/disable
```

---

# 21. Frontend Architecture

Don't build Profile as one giant component.

Recommended:

```text
ProfilePage
│
├── ProfileHeader
│
├── PersonalInformationCard
│   ├── AvatarUploader
│   └── PersonalInfoForm
│
├── PreferencesCard
│   ├── LanguageSelect
│   ├── TimezoneSelect
│   ├── DateFormatSelect
│   └── LandingPageSelect
│
├── SecurityCard
│   ├── PasswordStatus
│   └── TwoFactorStatus
│
├── RecentActivityCard
│
└── ProfileSidebar
    ├── ProfilePreview
    ├── AccountSummary
    └── ConnectedAccounts
```

This makes the page much easier to maintain.

---

# 22. Save State

Use clear states:

```text
UNCHANGED
   ↓
EDITING
   ↓
SAVING
   ↓
SAVED
```

Example:

**Save Changes**

becomes:

**Saving...**

then:

**✓ Saved**

Don't reload the entire page after every change.

---

# 23. Validation

Frontend:

* Required fields
* Email format
* Phone format
* Bio length
* URL format
* Image file type/size

Backend must repeat validation.

For example:

```text
First name
→ Required
→ Maximum length

Email
→ Valid email
→ Unique according to account rules

Website
→ Valid URL
```

---

# 24. Avatar upload architecture

Don't send large images directly through the normal profile API.

Use:

```text
Browser
 ↓
Request upload URL
 ↓
Upload image
 ↓
Image storage
 ↓
Image processing
 ↓
Return avatar URL
 ↓
Update user profile
```

Generate appropriate thumbnails for the UI.

---

# 25. Security Considerations

Profile information can contain account-sensitive information.

Implement:

### Authorization

Users can only modify their own profile.

### Email verification

Require verification when changing email.

### Audit logging

Record important profile/security changes.

### Rate limiting

Especially for:

* Password changes
* 2FA actions
* Session revocation

### Secure uploads

Validate uploaded images and don't trust client-provided MIME types alone.

---

# 26. What should NOT be on Profile

Keep these out:

❌ ICP configuration

❌ Pipeline stages

❌ Opportunity scoring

❌ Team management

❌ Workspace branding

❌ Workspace integrations

❌ Billing

❌ Workspace API settings

❌ Global notification rules

❌ Company-wide AI settings

Those belong under **Settings**.

---

# 27. Profile vs Settings

This distinction is important for HUNTIQ.

| Profile                        | Settings                |
| ------------------------------ | ----------------------- |
| My name                        | Workspace name          |
| My photo                       | Workspace logo          |
| My email                       | Team members            |
| My job title                   | Roles                   |
| My timezone                    | Pipeline                |
| My preferences                 | ICP                     |
| My password                    | Opportunity scoring     |
| My sessions                    | AI configuration        |
| My connected identity accounts | Integrations            |
| My personal notifications      | Workspace notifications |
| My activity                    | Audit logs              |
| My landing page                | Billing                 |

This prevents the settings architecture from becoming messy.

---

# 28. Integration with HUNTIQ

The profile page should connect naturally to the rest of the application:

```text
                    USER PROFILE
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
     Preferences       Security       Identity
          │              │              │
          ↓              ↓              ↓
      Dashboard       Sessions      Integrations
      Landing Page    2FA           Google/Microsoft
          │
          ↓
     User Experience
          │
          ↓
 ┌────────┼──────────┬───────────┐
 ↓        ↓          ↓           ↓
CRM    Prospects   Reports    AI Copilot
```

The profile is therefore **personal configuration**, while Settings is the **workspace control plane**.

---

# 29. MVP implementation order

### Phase 1

Build:

* Profile photo
* First/last name
* Email
* Phone
* Job title
* Department
* Bio
* Timezone
* Language
* Default landing page
* Save/discard

### Phase 2

Add:

* Password management
* 2FA
* Recent activity
* Sessions

### Phase 3

Add:

* Connected accounts
* Social links
* Profile completion
* Advanced preferences

### Phase 4

Add:

* Advanced security controls
* Device management
* Login notifications
* Enterprise identity/SSO

---

# 30. The final UX principle

The Profile page should feel like:

> **“My HUNTIQ identity.”**

Not:

> “A giant collection of application settings.”

The user should be able to open it and immediately understand:

**Who I am → how HUNTIQ behaves for me → my security → my recent activity → my connected identity accounts.**

That keeps the page focused and prevents overbuilding it.
