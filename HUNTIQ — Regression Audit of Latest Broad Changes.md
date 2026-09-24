Perform a production regression audit of the CURRENT HUNTIQ repository.

The latest hardening work was intended primarily to address:

- Gmail authentication
- Pub/Sub authentication
- Gmail reply tracking
- campaign stop-on-reply
- campaign concurrency

However, the latest commit also changed unrelated areas such as:

- job providers
- company resolver
- scoring engine
- pipeline
- saved searches
- prospects
- leads
- research
- reports
- settings
- types
- scraper
- frontend/mockup-related files

Do not rewrite these systems.

### Objective

Determine whether any unrelated changes introduced:

- broken imports
- type errors
- runtime errors
- API contract changes
- incorrect database queries
- workspace isolation regressions
- changed response shapes
- broken authentication assumptions
- accidental feature behavior changes

### Process

First inspect the diff between:

previous stable commit:
`74dcc90ff448cdb1f3087bc09746e51fe525aa64`

and current commit:

`c3953cef73b72ebb19fa58c70b3faf64f38a2a9`

Categorize every changed file:

A. directly related to Gmail/campaign hardening
B. required dependency/type/schema change
C. unrelated functional change
D. generated/mockup/build artifact

For category C, inspect why it changed and whether it is actually required.

Do not revert automatically.

### Check

Run the project's actual:

- test suite
- typecheck
- lint, if configured
- production build
- migration validation
- API/server startup validation where available

Inspect package scripts first. Do not invent commands.

### Database

Audit all migrations added or modified by the latest work.

Verify:

- migrations are ordered correctly
- they are idempotent where required
- constraints match repository queries
- indexes support concurrency queries
- no destructive migration is hidden in a hardening commit
- production startup does not race database migrations

### Workspace isolation

Focus especially on:

- company resolution
- contacts
- prospects
- scoring
- campaigns
- Gmail
- reports
- saved searches

Ensure every workspace-scoped query actually applies workspace ownership.

### Output

Produce a concise audit report:

1. confirmed safe changes
2. regression risks
3. actual failures
4. unnecessary changes
5. required fixes
6. exact commands and results

Do not modify the code unless a concrete regression is found.

Do not redesign the UI.

Do not add new product features.