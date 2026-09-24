You are working on the current HUNTIQ repository.

Inspect the existing Gmail integration before making changes, especially:

- GmailReplySyncService
- Gmail OAuth integration
- workspace integrations
- Gmail watch creation
- Gmail watch renewal
- Pub/Sub webhook
- application startup
- existing scheduled jobs
- deployment configuration
- cron/scheduler infrastructure
- database migrations
- tests

Do not create a second scheduling system if one already exists.

### Objective

The repository already contains logic similar to `checkAndRenewAllWatches()`.

The task is to verify that this logic is actually executed in production.

A function existing in the codebase is NOT sufficient.

### Required implementation

Trace the complete production execution path:

scheduler/cron
→ application endpoint/job
→ GmailReplySyncService.checkAndRenewAllWatches()
→ workspace integrations
→ Gmail users.watch renewal

If there is already a scheduler abstraction, use it.

If deployment already supports a scheduled endpoint/job, connect the renewal operation to that mechanism.

Do not introduce unnecessary infrastructure.

### Renewal rules

Renew watches before expiration using the existing project conventions.

For each eligible Gmail integration:

- verify the integration belongs to the correct workspace
- verify valid encrypted credentials exist
- refresh OAuth credentials when required using the existing OAuth implementation
- create/renew Gmail watch
- persist the new expiration
- persist the correct historyId
- record safe failure information if renewal fails

Never log:

- access tokens
- refresh tokens
- Authorization headers
- client secrets

### Idempotency

Repeated scheduler execution must be safe.

It must not create conflicting state or corrupt the stored Gmail watch information.

### Failure isolation

One workspace's failed renewal must not prevent other workspaces from being renewed.

Return/report per-workspace results internally.

### Testing

Add tests proving:

1. renewal function executes
2. watches within renewal window are renewed
3. watches outside renewal window are not unnecessarily renewed
4. expired watches are recovered where possible
5. OAuth refresh is handled
6. failed workspace does not stop other renewals
7. workspace isolation is preserved
8. scheduler invokes the renewal function
9. repeated scheduler invocation is safe

Most importantly, test the actual scheduler → renewal-service path rather than testing only the renewal function in isolation.

### Production verification

Inspect deployment configuration and package scripts.

Identify exactly what invokes the scheduler in production.

If no production scheduler exists, implement the smallest mechanism compatible with the current deployment architecture.

Do not invent a new platform or unrelated infrastructure.

Run the actual available test/typecheck/build commands.

Report:

- exact production invocation path
- files changed
- tests added
- commands executed
- results
- any deployment configuration required

Do not redesign UI or unrelated application features.