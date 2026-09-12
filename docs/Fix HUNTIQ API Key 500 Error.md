Fix the HUNTIQ production API-key generation failure.

Repository:
https://github.com/Ayoola1o/HUNTIQ

Current production error:

FUNCTION_INVOCATION_FAILED
Server returned status 500 when generating an API key.

Browser console also shows failure on the `/api-keys` request.

Important findings from the current repository:

1. `server/routes/auth.ts` contains:
   - GET `/api/v1/auth/api-keys`
   - POST `/api/v1/auth/api-keys`
   - DELETE `/api/v1/auth/api-keys/:id`

2. POST `/api/v1/auth/api-keys` calls:
   `authService.createApiKey(userId, workspaceId, name)`

3. `server/services/auth.service.ts` generates:
   `hnt_live_<random hex>`
   hashes it with SHA-256, then calls:
   `apiKeyRepository.create(...)`

4. `server/repositories/api-keys/postgres-api-key.repository.ts` queries:
   `api_keys`

5. The current migration directory contains migrations 001–006, but there is no migration that clearly creates the `api_keys` table.

6. The application is deployed to Vercel, so the production database schema must be explicitly migrated.

TASK:

A. Inspect the entire API-key implementation:
- frontend API-key settings component
- frontend API client
- auth routes
- auth service
- API-key repository interface
- PostgreSQL API-key repository
- in-memory repository
- authentication middleware
- database connection
- migration runner
- existing migration history

B. Add a NEW migration after migration 006, for example:
`007_create_api_keys.sql`

Do NOT modify already-applied migrations.

The migration must create a production-safe `api_keys` table compatible with the existing repository code.

Expected fields must support:

- id
- user_id
- workspace_id
- name
- key_prefix
- key_hash
- created_at
- last_used_at

Use the existing HUNTIQ UUID/PostgreSQL conventions.

Add appropriate:
- primary key
- foreign keys to users/workspaces
- unique constraint/index on key_hash
- indexes for user_id
- indexes for workspace_id
- index for key_prefix if useful

Use `ON DELETE CASCADE` or the existing HUNTIQ relationship conventions where appropriate.

C. Verify migration execution.

Inspect `server/database/migrate.ts` and determine exactly how production migrations are executed.

Make sure migration 007 is automatically executed during deployment/startup, according to the existing HUNTIQ architecture.

Do NOT assume Vercel will automatically run SQL migrations unless the repository already does this.

If the current deployment does not run migrations automatically, add a safe deployment mechanism or clearly document the exact production migration command.

D. Fix API-key creation robustness.

The production database must be the source of truth.

Do NOT silently fall back to in-memory API keys in production.

In production:
- database unavailable → return a controlled 503
- missing table → return a controlled configuration/database error
- duplicate key hash → retry generation safely
- never pretend an in-memory key is persistent

In development, the existing in-memory fallback may remain if it is intentionally useful.

E. Fix API-key listing.

GET `/api/v1/auth/api-keys` must:
- authenticate the current user
- query only that user's keys
- never return `key_hash`
- never return the full secret key
- return prefix, name, createdAt, lastUsed
- return a controlled 503/database error when PostgreSQL is unavailable

F. Fix API-key creation response.

The full secret key should be returned ONLY immediately after successful creation.

Example:

{
  "success": true,
  "data": {
    "id": "...",
    "name": "Email Scraper Integration",
    "keyPrefix": "hnt_live_...",
    "secretKey": "hnt_live_...",
    "createdAt": "..."
  }
}

Never store the plaintext secret key.

G. Verify authentication middleware.

The existing API-key authentication must hash the incoming Bearer token and find it by `key_hash`.

Verify that:
`Authorization: Bearer hnt_live_...`

correctly resolves:
- userId
- workspaceId

and updates `last_used_at`.

H. Add tests.

At minimum test:

1. authenticated user can generate API key
2. generated key has expected prefix
3. plaintext secret returned once
4. key hash stored in database
5. GET lists key without plaintext secret
6. DELETE revokes/deletes key
7. Bearer API-key authentication works
8. wrong API key returns 401
9. another user's key cannot be accessed/deleted
10. missing database table produces controlled error rather than Vercel FUNCTION_INVOCATION_FAILED
11. production does not silently use in-memory API keys
12. migration 007 creates all required columns/indexes

I. IMPORTANT — preserve the existing Email Scraper integration.

Do not break:
- `emailDiscovery`
- `EmailScraperProvider`
- `/api/v1/integrations/email-scraper/*`
- `/api/v1/email-discovery/*`
- lead ingestion
- contact evidence
- workspace isolation

The API key system is required specifically because we need to authenticate the separate Email Scraper deployment.

After fixing the API-key system, verify this exact architecture:

HUNTIQ
  ↓ Authorization: Bearer <EMAIL_SCRAPER_API_KEY>
Email Scraper

Email Scraper
  ↓ Authorization: Bearer <HUNTIQ_API_KEY>
HUNTIQ webhook

J. Run the full test/build process before finishing.

Required checks:

- npm test / existing test command
- npm run build
- TypeScript check
- migration validation
- API-key route tests
- Email Scraper integration tests

Finally provide:

1. root cause
2. files changed
3. migration created
4. exact production migration/deployment procedure
5. API-key generation test result
6. API-key authentication test result
7. Email Scraper integration test result
8. commit hash

Do not stop after adding the migration. Verify the production deployment path and database schema.