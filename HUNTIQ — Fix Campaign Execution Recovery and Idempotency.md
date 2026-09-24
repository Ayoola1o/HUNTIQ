You are working on the HUNTIQ repository.

First inspect the CURRENT implementation of:
- campaign execution service
- prospect sequence execution
- email dispatch service
- campaign/prospect repositories
- Gmail integration
- database schema/migrations
- existing tests

Do not redesign the UI and do not change product scope.

### Objective

Make campaign email execution durable and crash-safe.

The current flow has a potential failure window:

1. Prospect is claimed and status becomes `sending`
2. Database transaction commits
3. External email provider is called
4. Process crashes before the database is updated

This can leave the prospect permanently stuck in `sending`, even though the email may already have been delivered.

### Required implementation

Design the existing campaign execution around an explicit durable state machine.

At minimum, distinguish:

- `eligible`
- `sending`
- `sent` / `delivered`
- `replied`
- `failed`

Use the existing schema conventions where possible. Do NOT introduce duplicate competing status systems.

When a prospect enters `sending`, persist enough information to recover it safely:

- claimed timestamp
- campaign/prospect identifiers
- sequence step
- provider/message identifier if available
- execution/attempt identifier or idempotency key

### Critical requirement

Do NOT hold a PostgreSQL transaction open while calling Gmail or another external provider.

Use:

Transaction A:
- lock prospect
- verify eligibility
- claim prospect
- persist sending state
- persist idempotency/execution identifier
- commit

External operation:
- send email using the existing provider integration

Transaction B:
- lock prospect
- verify the same execution attempt
- persist successful/failed result
- persist provider message ID if available
- commit

### Idempotency

Before sending an email, check whether the same execution attempt has already successfully dispatched.

The same campaign step must never be sent twice because of:

- scheduler retries
- process restart
- duplicate webhook
- concurrent workers
- request retry

Use the database as the source of truth.

Add an appropriate unique constraint/index if necessary.

Do not use an in-memory Map or process-local lock as the primary protection.

### Recovery

Implement recovery for abandoned `sending` records.

Define a reasonable timeout using the existing project configuration conventions.

A stale `sending` record must NOT simply be resent blindly.

Recovery must first determine whether the original provider operation has a durable provider/message/execution record.

If the system cannot determine whether the email was sent, use an explicit recoverable state and surface the ambiguity rather than silently sending a duplicate.

### Failure handling

A provider failure should result in a durable `failed` state containing safe diagnostic information.

Do not expose:

- OAuth tokens
- access tokens
- secrets
- provider credentials
- raw authorization headers

### Stop-on-reply interaction

A prospect that has replied must never be sent another sequence step.

Before the actual provider dispatch, re-check the current prospect state after claiming it.

If a reply arrives while execution is pending, the execution must abort safely.

### Tests

Add real tests for:

1. successful dispatch
2. provider failure
3. duplicate scheduler execution
4. concurrent execution attempts
5. process/retry after `sending`
6. reply arriving before dispatch
7. reply arriving after claim but before finalization
8. same execution ID being retried
9. provider message ID persistence
10. cross-workspace isolation
11. campaign/sequence step isolation
12. stale `sending` recovery

Prefer PostgreSQL-backed integration tests for concurrency/idempotency.

Do not write tests that merely construct in-memory objects and claim the production workflow is verified.

### Acceptance criteria

The implementation must guarantee:

- one campaign step cannot be dispatched twice because of normal retries/concurrency
- `sending` records are recoverable
- crashes do not silently corrupt campaign state
- reply state always takes precedence over future sequence execution
- workspace boundaries remain enforced
- external provider calls are never made inside an open DB transaction

Run the repository's actual test/typecheck/build commands.

Report:
- files changed
- migrations added
- tests added
- exact commands executed
- exact results
- remaining risks

Do not modify unrelated features.