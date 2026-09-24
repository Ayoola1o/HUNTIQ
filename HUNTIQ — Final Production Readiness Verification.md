Perform the FINAL production-readiness verification of the current HUNTIQ repository.

Do not make speculative changes.

Do not add features.

Do not redesign UI.

Do not mark anything as passing unless it is actually verified.

### Verify these areas

#### 1. Authentication
- JWT_SECRET production enforcement
- OAuth state security
- Google token encryption
- development auth bypass disabled in production

#### 2. Gmail
- OAuth connect
- callback
- token refresh
- disconnect
- reconnect
- Gmail watch
- Pub/Sub JWT cryptographic verification
- webhook processing
- history synchronization
- reply detection
- duplicate message protection
- workspace isolation

#### 3. Campaigns
- prospect claiming
- transactional locking
- `sending` state
- duplicate execution protection
- provider dispatch
- dispatch idempotency
- failure recovery
- stale `sending` recovery
- stop-on-reply
- campaign update consistency

#### 4. Persistence
Search the repository for production paths using:

- in-memory stores
- Maps/Sets as persistence
- mock repositories
- fallback repositories
- synthetic IDs
- development secrets
- hard-coded credentials

Production must fail safely rather than silently switching to memory storage.

#### 5. Database
Verify:

- migration order
- migration execution
- required indexes
- unique constraints
- foreign keys
- transaction boundaries
- startup sequencing

#### 6. Workspace isolation
Attempt to verify cross-workspace access for:

- users
- API keys
- companies
- contacts
- prospects
- campaigns
- Gmail
- reports
- saved searches

#### 7. Scheduler
Verify the actual production invocation of:

- Gmail watch renewal
- campaign execution/recovery jobs
- any other required background jobs

A function existing in source code is not proof that production invokes it.

#### 8. Error handling
Verify production responses do not expose:

- stack traces
- secrets
- access tokens
- refresh tokens
- OAuth authorization headers
- database credentials
- raw provider errors

#### 9. Tests

Run the exact repository commands defined in package.json/configuration.

At minimum, where available:

- tests
- integration tests
- typecheck
- lint
- production build
- migration checks

Do not claim success if a command was not actually executed.

### CI

Inspect GitHub Actions/workflows.

If there are no workflow runs for the current commit, clearly state:

`CI VERIFICATION: NOT PROVEN`

Do not treat local inspection as CI proof.

### Final classification

Return exactly one of:

`PRODUCTION READY`

or

`NOT PRODUCTION READY`

If `NOT PRODUCTION READY`, list only the remaining blockers, ordered by severity.

For every blocker provide:

- exact file/path
- concrete problem
- why it matters
- required correction
- verification required

Do not hide uncertainty.

Do not inflate minor warnings into blockers.

The final report must distinguish:

- VERIFIED
- NOT VERIFIED
- BLOCKED

Do not claim the application is production-ready merely because the code looks correct.