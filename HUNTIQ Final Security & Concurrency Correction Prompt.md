You are working on the existing HUNTIQ repository.

Repository:
https://github.com/Ayoola1o/HUNTIQ

Current HEAD:
74dcc90ff448cdb1f3087bc09746e51fe525aa64

Commit:
fix: finalize gmail reply tracking and campaign stop-on-reply

The current implementation has made major progress. DO NOT rebuild the application, redesign the UI, or introduce unrelated product features.

Your task is to perform one final focused production correction covering only the remaining security, concurrency, error-handling, and verification issues.

## 1. FIX PUB/SUB OIDC JWT SIGNATURE VERIFICATION — CRITICAL

Inspect:

artifacts/api-server/src/services/pubsubAuthService.ts

The current implementation decodes the JWT payload and validates:

- issuer
- expiration
- audience
- service account email

but it does NOT cryptographically verify the JWT signature.

This is NOT sufficient for production authentication.

Implement real Google OIDC JWT verification.

Requirements:

- Verify the JWT signature using Google's published signing keys or a trusted Google authentication/JWT verification library.
- Validate issuer:
  https://accounts.google.com
  or the officially supported equivalent.
- Validate expiration.
- Validate audience.
- Validate service-account identity when configured.
- Reject malformed, unsigned, incorrectly signed, expired, wrong-audience, or wrong-issuer tokens.
- Do NOT trust decoded JWT claims before signature verification.
- Do NOT implement your own insecure cryptographic scheme.
- Do NOT weaken authentication to make tests easier.

The existing shared verification token can remain as an explicitly configured production mechanism if intentionally supported, but the OIDC path must be genuinely cryptographically verified.

Update tests so they test actual signature verification.

Do NOT use fake:

header.payload.signature

tokens as proof of successful OIDC authentication unless the signature is genuinely verified.

Add tests for:

- valid signed token
- invalid signature
- modified payload
- expired token
- wrong audience
- wrong issuer
- wrong service account
- malformed token

## 2. FIX THE CAMPAIGN SEQUENCE RACE CONDITION — CRITICAL

Inspect:

artifacts/api-server/src/services/campaignExecutionService.ts

The current code uses:

SELECT ... FOR UPDATE

but the SELECT is not inside an explicit PostgreSQL transaction covering the eligibility check and state transition.

Therefore the row lock can be released before the email is dispatched, allowing a Gmail reply to race with a scheduled follow-up.

Do NOT merely add another eligibility check.

Implement a real concurrency-safe sequence execution strategy.

The production behavior must guarantee:

Case A:

Reply is committed before sequence execution acquires its lock.

Result:
- prospect is seen as replied
- no follow-up is sent

Case B:

Sequence execution acquires the lock first.

Result:
- the sequence operation owns the execution state
- the email dispatch and corresponding state transition are handled consistently
- an inbound reply cannot cause a second conflicting sequence state transition

Use an explicit PostgreSQL transaction where appropriate.

Prefer an atomic state-machine/claim approach if that fits the existing architecture better.

Do not introduce duplicate sends.

Do not create a second campaign engine.

Preserve the existing campaign model.

## 3. MAKE STOP-ON-REPLY FAILURE VISIBLE

Inspect:

GmailReplySyncService.haltProspectSequence()

Currently the campaign halt service can catch a database failure and return:

haltedCount: 0

while Gmail synchronization continues.

This can produce a dangerous state:

reply recorded
+
campaign still active

Fix this.

If stop-on-reply is enabled and the campaign halt operation fails:

- do not silently report success
- return a meaningful failure result
- preserve the inbound event safely
- record an explicit sync failure/status
- ensure the system can retry the campaign-state update
- do not send a misleading "successfully halted" log

Do not lose the inbound Gmail event simply because campaign mutation failed.

The system should distinguish:

REPLY_RECORDED_BUT_SEQUENCE_UPDATE_FAILED

from:

REPLY_RECORDED_AND_SEQUENCE_HALTED

## 4. VERIFY CAMPAIGN HALTING IS WORKSPACE-SAFE

Audit:

haltProspectSequence()

It must always enforce:

workspace_id

and, where available:

campaign_id
prospect_id

Never update a campaign from another workspace.

When campaignId is supplied, query:

campaign_id + workspace_id

When prospectId is supplied, verify that the prospect belongs to the same campaign/workspace relationship before mutation.

Do not rely solely on email address when a stronger identifier exists.

## 5. FIX THE DATABASE TRANSACTION BOUNDARY

Audit all of:

- executeNextStepForProspect()
- haltProspectSequence()
- Gmail reply processing
- campaign scheduler execution

Make sure the actual production state machine cannot produce:

status = replied
while nextStepAt remains active

or:

status = replied
followed by a subsequent follow-up send

or:

reply received
but campaign state mutation silently fails.

Use PostgreSQL transactions/conditional updates appropriately.

Do not hold database transactions open unnecessarily longer than required, but correctness takes priority for this sequence state transition.

## 6. VERIFY GMAIL WATCH RENEWAL IS ACTUALLY SCHEDULED

The repository now contains:

checkAndRenewAllWatches()

Do not add a new scheduler architecture.

Instead, inspect the existing application scheduling/deployment mechanism and determine whether this method is actually invoked in production.

If it already is:

- verify it
- add tests if needed

If it is not:

- connect it to the existing supported scheduled-job mechanism
- do not invent an unrelated infrastructure system
- ensure it can run in the actual deployment environment

The production behavior should renew watches before expiration.

Also ensure:

- inactive integrations are skipped
- reauth_required integrations are skipped
- renewal failure is recorded
- successful renewal updates watch_history_id
- successful renewal updates watch_expiration
- failed Google authorization results in reauth_required

## 7. AUDIT DISCONNECT BEHAVIOR

Verify Google disconnect performs all required state changes:

- integration becomes inactive/disconnected
- Gmail watch state is cleared
- future webhook notifications are ignored
- access/refresh credentials are removed/revoked according to the existing architecture
- campaign sending does not continue through a disconnected Gmail integration

Do not change the existing UI.

## 8. TEST THE REAL SERVICES, NOT ONLY SIMULATED OBJECTS

The existing gmail_reply_tracking.test.ts has improved substantially, but several tests only simulate state.

Keep the useful unit tests.

Add focused integration-level tests around the actual service methods where practical.

At minimum prove:

### Test A — Real stop-on-reply state mutation

A campaign contains an active prospect.

Then invoke the actual halt service.

Verify database state:

status = replied
nextStepAt = null

and verify a subsequent real execution attempt is rejected.

### Test B — Real Gmail reply path

Mock Gmail HTTP responses but use the actual:

GmailReplySyncService.syncMailbox()

Verify:

Gmail reply
→ outreach thread replied
→ inbound event persisted
→ campaign prospect halted

### Test C — Ambiguous reply

Two active outreach threads exist for the same email.

No matching Gmail thread/message ID exists.

Verify:

correlation_status = unresolved

and NO campaign is halted.

### Test D — Cross-workspace isolation

Same email exists in two workspaces.

Reply belongs to workspace A.

Verify workspace B remains untouched.

### Test E — Duplicate Gmail message

Process the same provider message twice.

Verify only one inbound event exists.

### Test F — Failed sequence halt

Force campaign update failure.

Verify the system does NOT report successful stop-on-reply.

### Test G — Concurrency

Exercise sequence execution and reply processing concurrently.

Verify the final state cannot result in a follow-up being sent after the reply has already been committed.

## 9. FIX THE OIDC TESTS

The current tests create fabricated JWT strings whose payload is merely Base64 encoded.

Replace these with real signed test JWTs or the project's trusted verification-library test mechanism.

A test must fail if the signature is modified.

This is important.

Do not write a test that only verifies decoded claims.

## 10. CHECK FOR SECRET / INTERNAL ERROR LEAKAGE

Search the Gmail/OAuth/PubSub/campaign paths for:

err.message

raw Google API errors

database errors

tokens

authorization headers

refresh tokens

client secrets

passwords

stack traces

Make sure production HTTP responses never expose them.

Internal logging may contain appropriate diagnostic information, but never log:

- access tokens
- refresh tokens
- client secrets
- Authorization headers
- full credentials

## 11. PRODUCTION PERSISTENCE AUDIT

Search the entire API server for:

memoryStore
InMemory
new Map(
mock
demo
fake
fallback
default workspace
default user

Pay particular attention to production request paths.

Do not allow production business data to silently fall back to process memory.

Development/test fallbacks may remain only when explicitly gated.

## 12. RUN THE REAL VALIDATION COMMANDS

From the repository root run:

pnpm test

pnpm typecheck

pnpm build

If lint exists, run the configured lint command as well.

Do not claim success unless the command actually ran and passed.

If a command cannot run because an external dependency/credential/service is unavailable, report:

BLOCKED

and explain exactly why.

Do not fake test output.

## 13. CHECK MIGRATION 011

Review:

artifacts/api-server/src/database/migrations/011_inbound_composite_idempotency_and_campaign_link.sql

Verify:

- migration is valid PostgreSQL
- safe to run after existing migrations
- composite uniqueness is correct
- campaign_id foreign key is correct
- indexes are appropriate
- no existing production migration is modified retroactively

Do not edit already-applied migrations.

If a correction is needed, create the next migration.

## 14. CHECK THE NEW CAMPAIGN/OUTREACH LINKING

Verify:

outreach_threads.campaign_id
outreach_threads.prospect_id

are actually populated by the existing outreach creation/sending path.

Do not merely add columns and then leave them NULL.

The Gmail reply system needs those identifiers to reliably connect replies to campaign prospects.

If existing production thread creation does not populate them, fix that path.

## 15. DO NOT CHANGE PRODUCT SCOPE

Do NOT:

- redesign the frontend
- add unrelated CRM features
- change navigation
- replace the Gmail architecture
- replace the campaign system
- introduce a second email provider
- introduce a new CRM data model
- rewrite the application

Only fix:

- Pub/Sub authentication
- Gmail reply tracking
- stop-on-reply
- campaign concurrency
- watch renewal
- persistence correctness
- workspace isolation
- error handling
- tests
- production verification

## 16. FINAL CODE AUDIT

Before committing, inspect the final diff carefully.

Confirm there are no:

- debugging statements
- fake test implementations
- fake JWT verification
- insecure authentication bypasses
- plaintext secrets
- silent production fallbacks
- fabricated success responses
- unrelated UI changes
- duplicate campaign execution systems

## 17. FINAL ACCEPTANCE CRITERIA

The implementation is acceptable only if all of these are true:

[ ] Pub/Sub OIDC signature is genuinely verified

[ ] Invalid JWT signatures are rejected

[ ] Stop-on-reply updates the actual campaign prospect state

[ ] Replied prospects cannot receive later sequence steps

[ ] Campaign execution and reply processing are concurrency-safe

[ ] Failed campaign halting cannot silently report success

[ ] Gmail replies are persisted idempotently

[ ] Ambiguous replies remain unresolved instead of being guessed

[ ] Cross-workspace isolation is enforced

[ ] Gmail watches renew before expiration

[ ] Reauth-required integrations do not continue syncing/sending

[ ] Disconnect behavior is safe

[ ] Provider message uniqueness is correct

[ ] Real service-path tests exist

[ ] OIDC tests verify real signatures

[ ] pnpm test passes

[ ] pnpm typecheck passes

[ ] pnpm build passes

[ ] No production memory fallback remains in business-data paths

[ ] No sensitive information leaks through production HTTP errors/logging

If any critical item fails, DO NOT claim production readiness.

Final status must be exactly one of:

PRODUCTION READY

or

NOT PRODUCTION READY

If NOT PRODUCTION READY, list only the remaining blockers and why they remain.

## 18. COMMIT

Only after the implementation and validation above are complete, create one focused commit:

fix: harden gmail auth and campaign concurrency