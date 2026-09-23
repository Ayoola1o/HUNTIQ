# HUNTIQ — FINAL PRODUCTION CORRECTION

## Gmail Reply Tracking, Stop-on-Reply, Webhook Security & Verification

You are working on the existing HUNTIQ repository.

Repository:
`https://github.com/Ayoola1o/HUNTIQ`

Current branch/HEAD has already received the major Gmail OAuth, token encryption, Gmail Watch, Pub/Sub, history synchronization, persistence, and production-hardening work.

This is the FINAL targeted correction pass.

**Do NOT rebuild the application.**
**Do NOT redesign the UI.**
**Do NOT introduce unrelated features.**
**Do NOT change existing product scope.**
**Do NOT replace working architecture unnecessarily.**

Your job is to inspect the current implementation first and fix ONLY the remaining production-critical gaps below.

---

# 1. FIRST: AUDIT THE CURRENT IMPLEMENTATION

Before modifying anything, inspect:

* Gmail OAuth flow
* `GmailReplySyncService`
* Gmail webhook
* Gmail Watch creation
* Gmail Watch expiration handling
* campaign sequence scheduler
* campaign prospect state/status
* outreach thread repository
* inbound email persistence
* campaign execution logic
* workspace isolation
* migrations
* tests
* package scripts
* build/typecheck configuration

Trace the actual runtime flow:

```text
Gmail
→ Gmail Watch
→ Google Pub/Sub
→ HUNTIQ webhook
→ Gmail History API
→ inbound message
→ reply detection
→ outreach thread
→ contact
→ campaign prospect
→ sequence state
→ next scheduled step
```

Do not assume that because a service/log/test exists, the behavior is actually connected.

---

# 2. CRITICAL: MAKE STOP-ON-REPLY ACTUALLY STOP THE SEQUENCE

This is the highest-priority correction.

Currently the system can detect and persist a reply, but the production reply-processing path must be verified to actually prevent future campaign steps from being sent.

Trace the real campaign execution path.

When an inbound Gmail reply is detected:

```text
Inbound reply
      ↓
Identify workspace
      ↓
Identify contact
      ↓
Identify outreach thread
      ↓
Identify campaign prospect
      ↓
Check workspace Gmail setting
      ↓
If stopSequenceOnReply === true
      ↓
HALT THE ACTUAL CAMPAIGN SEQUENCE
```

Do not merely:

```text
log "SEQUENCE_HALTED"
```

Do not merely:

```text
mark outreach thread as replied
```

The actual campaign prospect/sequence state consumed by the campaign scheduler must be changed.

Use the existing campaign state model. Do not invent a second competing state machine.

The final state must be whatever the existing campaign execution engine expects for a halted/replied prospect.

For example, if the existing system uses:

```text
ACTIVE
PAUSED
HALTED
COMPLETED
```

use that existing model.

Do NOT invent:

```text
REPLY_STOPPED
REPLY_DETECTED
```

unless the current architecture already requires those states.

### Required behavior

Given:

```text
Campaign Prospect:
status = ACTIVE
nextStepAt = future
```

Then the prospect replies.

If:

```text
stopSequenceOnReply = true
```

the production database state must prevent the future step from executing.

The scheduler must therefore see the prospect as ineligible.

Also ensure there is no race where:

```text
scheduler selects prospect
        ↓
reply arrives
        ↓
reply handler marks prospect halted
        ↓
scheduler still sends email
```

Use the existing transactional/locking patterns where appropriate.

### Acceptance test

Create a test that proves:

```text
active campaign prospect
+
future follow-up
+
inbound Gmail reply
+
stopSequenceOnReply = true
=
prospect becomes halted/replied
AND
future campaign execution does NOT send the follow-up
```

This must test the real production service path, not manually execute SQL inside the test to simulate the desired result.

---

# 3. SECURE THE GMAIL PUB/SUB WEBHOOK

Current webhook authentication is optional.

That is not sufficient for production.

Inspect:

```text
POST /api/v1/integrations/gmail/webhook
```

The endpoint must remain publicly reachable because Google needs to call it, but production requests must be authenticated.

Prefer Google's authenticated Pub/Sub push mechanism using a service identity/OIDC token and verify:

* token signature
* issuer
* audience
* expected service identity
* expected webhook audience
* expiration

If the existing deployment architecture uses a verification token instead, production must require it rather than silently accepting unauthenticated requests.

### Required production behavior

If webhook authentication is not configured correctly:

```text
production startup/configuration
→ fail clearly
```

or:

```text
incoming webhook
→ reject
```

Do NOT silently accept unauthenticated webhook traffic.

Development/test environments may have a controlled bypass if the existing architecture requires it, but it must be explicit.

Never use:

```text
if token exists → validate
else → accept
```

for production.

### Also validate the Pub/Sub envelope

Validate:

* message exists
* data exists
* valid base64
* valid JSON
* expected `emailAddress`
* valid `historyId`
* expected message structure

Reject malformed requests safely.

Never expose internal errors.

---

# 4. DO NOT LEAK INTERNAL ERRORS

Audit all Gmail webhook/OAuth/reply-sync error handling.

Never return:

```text
err.message
err.stack
database error
Google API error
OAuth provider error
token-related error
SQL error
```

to the client.

Use stable public error codes/messages.

Examples:

```text
OAUTH_EXCHANGE_FAILED
GMAIL_SYNC_FAILED
GMAIL_WEBHOOK_UNAUTHORIZED
GMAIL_WEBHOOK_INVALID_PAYLOAD
GMAIL_NOT_CONNECTED
DATABASE_UNAVAILABLE
```

Detailed information may be logged server-side, but logs must never contain:

* access tokens
* refresh tokens
* OAuth authorization codes
* client secrets
* API keys
* Authorization headers
* full sensitive email contents

Use structured logging where the existing project supports it.

---

# 5. IMPLEMENT/VERIFY GMAIL WATCH RENEWAL

Gmail Watch subscriptions expire.

The application must not assume that creating a watch once is sufficient.

Inspect the existing fields:

```text
watch_expiration
watch_history_id
watch_resource_id
```

Implement or complete the existing architecture so that an active Gmail integration is renewed before expiration.

Preferred lifecycle:

```text
Gmail connected
      ↓
create watch
      ↓
persist expiration/historyId/resource
      ↓
expiration approaching
      ↓
renew watch
      ↓
persist new expiration/historyId/resource
```

Use the existing infrastructure if the application already has:

* scheduled jobs
* automation
* cron
* background workers
* serverless scheduled functions

Do not invent an unnecessary new infrastructure layer.

If the deployment platform provides scheduled execution, use the existing project architecture.

### Important

Watch renewal must be:

* workspace scoped
* idempotent
* safe to retry
* safe after deployment/restart
* safe if the integration has been disconnected
* safe if the Google token requires reauthentication

If refresh fails:

```text
mark integration as requiring reauthentication
```

Do not repeatedly hammer Google with an invalid refresh token.

---

# 6. STRENGTHEN REPLY-TO-THREAD CORRELATION

Audit how inbound Gmail replies are mapped to HUNTIQ outreach threads.

Preferred correlation order:

```text
1. Gmail provider thread ID
2. Gmail provider message ID / known outbound message
3. In-Reply-To / References headers
4. Contact + active campaign relationship
5. Email address fallback only when unambiguous
```

Do NOT simply do:

```text
email address
→ most recently updated outreach thread
```

if multiple campaigns/outreach threads can exist for the same contact.

Example:

```text
john@example.com

Campaign A → Gmail thread A
Campaign B → Gmail thread B
```

A reply to thread B must not halt campaign A.

Workspace isolation must remain enforced at every lookup.

If correlation is ambiguous:

```text
do not guess
```

Persist the inbound message/evidence safely and mark it unresolved for correlation rather than attaching it to the wrong campaign.

---

# 7. FIX PROVIDER MESSAGE ID IDEMPOTENCY

Review the current uniqueness constraint for inbound/provider messages.

If the current schema assumes:

```text
provider_message_id UNIQUE
```

verify that this is appropriate for the actual provider semantics.

If the application architecture requires workspace/provider scoping, use the correct composite uniqueness constraint, such as:

```text
(workspace_id, provider, provider_message_id)
```

or the exact equivalent required by the existing schema.

Do not blindly change the schema.

First verify:

* how provider IDs are generated
* whether multiple Gmail accounts can exist
* workspace isolation
* existing data
* existing foreign keys

If a migration is required:

**Create a NEW migration.**

Do not edit an already-applied migration.

Add the appropriate index/constraint safely.

---

# 8. WORKSPACE ISOLATION — FINAL AUDIT

Perform a complete audit of Gmail/outreach reply processing.

Every operation must derive workspace identity from trusted server-side context.

Verify:

### OAuth

```text
OAuth state
→ user
→ workspace
```

### Gmail integration

```text
workspace
→ integration
```

### Pub/Sub

```text
Gmail account
→ integration
→ workspace
```

### Reply

```text
workspace
→ message
→ contact
→ outreach thread
→ campaign prospect
```

Never trust:

```text
workspaceId from browser
workspaceId from Pub/Sub payload
workspaceId from arbitrary webhook body
```

for authorization.

Add regression tests for cross-workspace isolation.

Example:

```text
Workspace A
Contact X
Gmail Thread X

Workspace B
Contact X
Gmail Thread Y
```

A reply belonging to Workspace A must never modify Workspace B.

---

# 9. DISCONNECT BEHAVIOR

Verify Gmail disconnect does ALL required work:

```text
Google authorization revoked
        ↓
watch/subscription stopped where applicable
        ↓
local access token removed
        ↓
local refresh token removed
        ↓
integration inactive/revoked
        ↓
future webhook ignored
```

After disconnect:

```text
Gmail webhook
→ no active integration
→ safely acknowledge
→ no campaign changes
```

Do not delete historical CRM activity unless the existing product explicitly requires deletion.

Preserve historical business records.

---

# 10. REFRESH TOKEN FAILURE

Verify that Google token refresh failure behaves like:

```text
refresh failure
      ↓
mark Gmail integration as REAUTH_REQUIRED
      ↓
do not continue sending
      ↓
do not keep retrying indefinitely
      ↓
surface truthful status to UI
```

Do not return an expired access token as if it were valid.

Do not send campaign emails when Gmail authorization is invalid.

---

# 11. TEST EMAIL ENDPOINT

Review:

```text
POST /api/v1/auth/google/test
```

Ensure:

* authenticated workspace required
* Gmail integration required
* rate limiting
* provider errors sanitized
* no token leakage
* no cross-workspace access
* no sending when integration is revoked/reauth required

The rate limiter must be treated as defense-in-depth.

If the project already has shared infrastructure suitable for distributed rate limiting, use it.

Otherwise keep the local limiter but document that it is not the sole abuse-control mechanism.

Do not add unnecessary infrastructure just for this.

---

# 12. TESTS MUST TEST REAL BEHAVIOR

Do not write tests that only simulate the final database state.

Tests must prove actual behavior.

At minimum add/verify:

### OAuth

* state is cryptographically random
* state expires
* state is single use
* state is workspace-bound
* state is user-bound
* state provider-bound

### Gmail tokens

* encrypted at rest
* never returned to frontend
* refresh failure requires reauth

### Gmail Watch

* watch created
* watch persisted
* watch renewal
* expired watch renewal
* disconnected integration not renewed

### Pub/Sub

* valid authenticated request accepted
* invalid authentication rejected
* malformed envelope rejected
* invalid email rejected
* invalid history ID rejected
* workspace resolved server-side

### Gmail History

* new inbound message detected
* outbound message ignored
* duplicate message ignored
* history synchronization idempotent

### Reply matching

* provider thread match
* provider message match
* In-Reply-To/References match
* contact fallback
* ambiguous match does not guess
* cross-workspace match rejected

### Stop-on-reply

This is mandatory:

```text
campaign prospect ACTIVE
+
follow-up scheduled
+
reply received
+
stopSequenceOnReply = true
=
campaign prospect HALTED/REPLIED
+
future sequence step is NOT sent
```

Also test:

```text
stopSequenceOnReply = false
```

and confirm the existing product behavior remains unchanged.

### Disconnect

* revoke
* clear credentials
* deactivate integration
* ignore future webhook
* do not continue sending

---

# 13. ADD AN ACTUAL TEST COMMAND

Inspect the current monorepo/package structure.

If tests already use Vitest/Jest/Node test runner/etc., expose the appropriate existing test command through the package scripts.

Do not add a second test framework.

For example, if the project already uses Vitest, expose:

```text
test
test:run
```

using the existing configuration.

Do not fake a passing test script.

---

# 14. RUN THE REAL VERIFICATION

After implementation, actually execute:

```bash
pnpm typecheck
pnpm test
pnpm build
```

and:

```bash
pnpm lint
```

if lint is configured.

If the monorepo requires filters, use the correct existing commands.

Do not report:

```text
PASS
```

unless the command actually ran successfully.

For every command report:

```text
PASS
FAIL
BLOCKED
```

with the actual reason.

If an external Google credential/environment is required for a true integration test, clearly separate:

```text
unit test
integration test
external-service verification
```

Do not claim external Gmail/Pub/Sub functionality was verified if credentials/infrastructure were unavailable.

---

# 15. PRODUCTION DATABASE AUDIT

Before finishing, search the backend for:

```text
memoryStore
InMemory
new Map(
demo
seed
mock
fixture
fallback
default workspace
default user
```

Do not automatically remove legitimate test infrastructure.

Classify each occurrence:

```text
TEST ONLY
DEVELOPMENT ONLY
PRODUCTION
```

Production must not silently fall back to fake/in-memory persistence.

Production PostgreSQL failure must result in a clear failure/503/startup failure according to the existing architecture.

---

# 16. FRONTEND MUST REMAIN TRUTHFUL

Do not redesign the Gmail UI.

Only correct state handling if necessary.

The UI must not say:

```text
Reply tracking active
```

unless the backend integration is actually active.

It should distinguish:

```text
Connected
Watch active
Watch renewal required
Reauthentication required
Disconnected
Syncing
Sync failed
```

Use the existing UI components and design system.

Do not add unrelated screens.

---

# 17. NO PRODUCT SCOPE EXPANSION

Do NOT add:

* new CRM modules
* new dashboards
* new AI agents
* new campaign features
* new lead-generation systems
* unrelated integrations
* redesigns
* new navigation
* new subscription/billing functionality

This task is strictly:

```text
Gmail
+
reply tracking
+
stop-on-reply
+
webhook security
+
watch lifecycle
+
production persistence
+
testing
```

---

# 18. FINAL DIFF REVIEW

Before committing:

```bash
git diff
git status
```

Review every changed file.

Remove:

* debugging code
* temporary logging
* hard-coded secrets
* test credentials
* unused imports
* dead code
* accidental UI changes
* unrelated refactors

Make sure migrations are additive and safe.

---

# 19. FINAL ACCEPTANCE CHECKLIST

Do not commit until you can answer these accurately:

### Gmail

* [ ] OAuth state secure
* [ ] OAuth state single-use
* [ ] Google tokens encrypted
* [ ] Refresh failure requires reauth
* [ ] Disconnect revokes/clears credentials
* [ ] Gmail Watch created
* [ ] Gmail Watch persisted
* [ ] Gmail Watch renewed
* [ ] Expired watches recover safely

### Pub/Sub

* [ ] Webhook is authenticated in production
* [ ] Invalid webhook rejected
* [ ] Payload validated
* [ ] No internal error leakage
* [ ] Workspace resolved server-side

### Reply tracking

* [ ] Gmail History API works
* [ ] inbound messages detected
* [ ] outbound messages ignored
* [ ] duplicate messages ignored
* [ ] reply persisted
* [ ] provider thread/message IDs persisted
* [ ] workspace isolation enforced

### Campaigns

* [ ] reply correctly identifies campaign prospect
* [ ] stop-on-reply actually changes production sequence state
* [ ] scheduler respects halted/replied state
* [ ] no follow-up is sent after a qualifying reply
* [ ] stop-on-reply=false preserves existing behavior

### Security

* [ ] no token leakage
* [ ] no OAuth code leakage
* [ ] no secrets in logs
* [ ] no production in-memory persistence fallback
* [ ] no cross-workspace access
* [ ] provider message idempotency enforced

### Verification

* [ ] typecheck PASS
* [ ] tests PASS
* [ ] build PASS
* [ ] lint PASS, if configured
* [ ] external-service limitations explicitly documented

---

# 20. FINAL RESPONSE FORMAT

After completing the work, report exactly:

## Changed

List the files/components changed.

## Stop-on-Reply

Explain the exact production path from Gmail reply → campaign prospect → halted sequence.

## Gmail

Explain Watch, Pub/Sub, History API, renewal, refresh, and disconnect behavior.

## Security

Explain webhook authentication, workspace isolation, token protection, and error handling.

## Persistence

Explain database constraints and removal of production in-memory fallback.

## Tests

Report actual commands and:

```text
typecheck: PASS/FAIL/BLOCKED
tests: PASS/FAIL/BLOCKED
build: PASS/FAIL/BLOCKED
lint: PASS/FAIL/BLOCKED
```

## Remaining Blockers

List only genuine unresolved blockers.

## Final Status

Use exactly one:

```text
PRODUCTION READY
```

or:

```text
NOT PRODUCTION READY
```

Do not call it production ready if any critical requirement above is unverified or failing.

---

# COMMIT

Only after the implementation and verification are complete:

```text
fix: finalize gmail reply tracking and campaign stop-on-reply
```

Do not create additional unrelated commits.
