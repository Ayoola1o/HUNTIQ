# HUNTIQ — COMMAND SECTION PRODUCTION FUNCTIONAL FIX

## Objective

Harden the entire **COMMAND** section of HUNTIQ so that every displayed metric, record, button, mutation, action, and AI response uses the correct production data flow.

The current frontend mixes:

1. Real backend/API data
2. Local intelligence engines
3. Hard-coded/demo data
4. Optimistic UI state that can survive failed API requests

This must be corrected.

The target architecture is:

**UI → API client → backend route → service/engine → repository → PostgreSQL → API response → UI state**

Do NOT redesign the UI.

Do NOT remove existing product functionality.

Do NOT create fake data to make screens look populated.

Do NOT silently fall back to demo data in production.

---

# 1. GLOBAL COMMAND DATA RULE

Audit the entire COMMAND section:

- Dashboard
- Copilot
- Opportunities
- Signals
- Global COMMAND navigation/context

Every piece of business data displayed on these pages must have a traceable source.

For every metric, card, table, count, score, signal, opportunity and pipeline value determine:

```text
Where does this value originate?
↓
Which API is responsible?
↓
Which backend route handles it?
↓
Which service/engine calculates it?
↓
Which repository/database query supplies it?
```

If the value cannot be traced to persisted or explicitly calculated application data, remove the fake/demo fallback.

---

# 2. REMOVE PRODUCTION DEMO DATA FROM HUNTIQ CONTEXT

Inspect:

`artifacts/huntiq/src/context/HuntiqContext.tsx`

Remove hard-coded production-looking pipeline records such as:

- Acme Technologies
- FinServe Ltd
- Paystack

from the initial `pipelineDeals` state.

The initial state should be:

```ts
const [pipelineDeals, setPipelineDeals] = useState<PipelineDealItem[]>([]);
```

Real records must come from:

```text
/api/pipeline/deals
```

after authentication.

Do the same audit for:

- companies
- signals
- opportunities
- dashboard data
- Copilot data

Do not leave realistic fake CRM records in production state.

---

# 3. FIX LIVE DATA HYDRATION

`refreshData()` currently mixes live API data with local engines and silently retains local/demo state when API calls fail.

Refactor this.

Production behavior must distinguish:

### Successful API response

Use the backend response.

### Successful API response with zero records

Display an actual empty state.

Do NOT replace zero records with demo data.

### API failure

Keep the last known valid state if appropriate, but expose the failure through the application's existing error/loading mechanism.

Do not silently present demo information as if it were live.

For example:

```text
API returns []

→ companies = []

NOT

→ companies = local demo companies
```

Likewise:

```text
API returns []

→ signals = []

NOT

→ signals = sample signals
```

---

# 4. FIX PIPELINE CREATE

Trace:

```text
addDealToPipeline()
→ createPipelineDeal()
→ POST /api/pipeline/deals
→ backend route
→ service
→ repository
→ PostgreSQL
```

The current implementation optimistically adds the deal locally and retains it if the API fails.

Change this behavior.

Preferred flow:

```text
User clicks Create
        ↓
API request
        ↓
Backend creates DB record
        ↓
Backend returns canonical persisted record
        ↓
Frontend inserts returned record
```

The backend-generated:

- ID
- timestamps
- workspace ID
- owner
- calculated/default fields

must be treated as authoritative.

Do NOT generate the final persistent ID in the frontend with:

```ts
deal-${Date.now()}
```

if the backend already owns record identity.

If optimistic UI is retained, rollback the optimistic record on API failure and show the existing error/toast mechanism.

Never leave a false successful record visible after a failed persistence request.

---

# 5. FIX PIPELINE STAGE UPDATE

Trace:

```text
updateDealStage()
→ updatePipelineDeal()
→ PATCH /api/pipeline/deals/:id
→ backend
→ repository
→ PostgreSQL
```

Current behavior changes React state before knowing whether the backend succeeded.

Make backend persistence authoritative.

Preferred flow:

```text
User changes stage
        ↓
PATCH backend
        ↓
DB update succeeds
        ↓
Return canonical deal
        ↓
Update UI
```

If the API fails:

```text
UI must revert to previous stage
+
show error
```

Do NOT leave the UI showing a stage that the database rejected.

Also verify:

- deal belongs to authenticated workspace
- deal ID is valid
- unauthorized cross-workspace updates are rejected
- stage value is validated
- updated record is returned

---

# 6. FIX COMPANY SAVE / UNSAVE

Inspect:

```ts
toggleSaveCompany()
```

It currently changes local React state only.

Find whether a backend persistence endpoint already exists.

If one exists, use it.

If one does not exist, implement the smallest appropriate backend API/repository path required for the existing `isSaved` functionality.

Required flow:

```text
Save company
→ API
→ backend
→ PostgreSQL
→ response
→ UI
```

and:

```text
Unsave company
→ API
→ backend
→ PostgreSQL
→ response
→ UI
```

The saved state must survive:

- page refresh
- logout/login
- reopening the application

and must be workspace/user scoped correctly.

Do not use localStorage as the authoritative CRM source.

---

# 7. FIX COPILOT EXECUTION

This is one of the most important fixes.

Current Context behavior directly invokes:

```ts
copilotEngine.executePrompt(prompt)
```

while a real API client already exists:

```ts
executeCopilotPrompt()
```

Make the production flow:

```text
Copilot UI
    ↓
executeCopilotPrompt()
    ↓
POST /api/copilot/execute
    ↓
backend Copilot route
    ↓
Copilot service/engine
    ↓
real HUNTIQ data/services
    ↓
response
    ↓
UI
```

Do NOT allow the production Copilot page to silently execute a local fake engine when the API fails.

If offline/demo mode is genuinely required by the application, it must be explicitly detected and visibly identified as demo/offline mode.

It must never masquerade as live CRM intelligence.

---

# 8. COPILOT RESULT INTEGRITY

Audit all Copilot responses for fabricated values.

Remove or replace simulated values such as:

```text
totalFound: 50
highIntent: 14
hotOpportunities: 6
```

unless those values are actually calculated from current HUNTIQ data.

For every Copilot command:

```text
Find prospects
Find companies
Analyze market
Show opportunities
Research company
Create opportunity
Create pipeline deal
Generate outreach
Analyze signals
```

verify that the result comes from the actual underlying service/data.

If an action mutates data, it must persist through the backend.

---

# 9. DASHBOARD FIXES

Audit all Dashboard components.

### Attention Feed

Remove hard-coded fallback records such as:

- Acme Technologies
- FinServe Ltd
- Jane Smith
- Michael Okoro

If there are no real signals:

```text
No recent activity
```

or use the application's existing empty-state design.

Never manufacture CRM activity.

### Notification count

Remove hard-coded values such as:

```text
12 new updates
```

Calculate it from actual notification/signal/activity data.

If the application does not yet have a notification backend, display the appropriate empty/zero state instead of inventing a count.

---

# 10. PIPELINE HEALTH PERIOD FILTER

Audit the Dashboard Pipeline Health selector:

- This week
- This month
- This quarter
- All time

The selector must actually change the data.

Currently the period state can change without recalculating the underlying statistics.

Implement the correct filtering/aggregation.

Use persisted dates such as:

- createdAt
- stageEnteredAt
- expectedCloseDate
- closedAt

depending on what the metric represents.

Document the chosen date semantics in the code.

Do not simply change the label while keeping the same numbers.

---

# 11. OPPORTUNITIES DATA INTEGRITY

`opportunities` is currently derived from:

```text
companies
+
signals
+
scoringEngine
```

Keep this architecture if appropriate, but audit every field.

Do not fabricate:

```text
lastActivity: "2 hours ago"
timeAgo: "2h ago"
confidence: 94
targetName: "Decision Maker"
companySize: 85
engagement: 70
```

unless those values are actually supported by source data or a documented scoring calculation.

Every score should have a deterministic source.

For example:

```text
ICP fit
Buying intent
Trigger events
Decision-maker access
Company size
Engagement
```

must either come from real persisted data or a clearly defined scoring engine.

Do not hard-code scores merely to make cards look complete.

---

# 12. OPPORTUNITY STAGE / CREATION

Inspect `OpportunitiesPage`.

For:

- create opportunity
- change stage
- update opportunity
- delete/archive if available
- open opportunity
- convert to pipeline
- outreach action
- research action

trace each action to its backend implementation.

Do not allow an action to modify only React state.

If the existing backend already supports the operation, use it.

If the backend does not support an operation, do not fake success.

Display an appropriate unavailable/error state until the backend implementation exists.

---

# 13. SIGNALS PAGE

Audit:

- search
- type filter
- impact filter
- location filter
- date range
- signal cards
- company navigation
- research action
- opportunity action
- notification action

Ensure filters operate on actual signal data.

If date filtering is displayed, it must actually filter by signal timestamps.

Do not leave decorative date controls that do nothing.

If the current API supports server-side filtering, use it.

If the dataset is intentionally small and already loaded, client-side filtering is acceptable, but the behavior must be correct.

---

# 14. GEO RADAR / CAPTURED BUSINESSES

Audit:

```ts
captureGeoBusinesses()
```

This currently creates:

- companies
- pipeline deals
- signals

directly in React state.

Determine which of these already have backend ingestion endpoints.

Use the backend persistence path.

The correct architecture should be:

```text
Geo Radar
 ↓
ingestion API
 ↓
company resolution
 ↓
company repository
 ↓
signal persistence
 ↓
opportunity/scoring engine
 ↓
pipeline creation only when explicitly requested
```

Do NOT automatically create CRM pipeline deals simply because a business was discovered unless that behavior is an explicitly documented product action.

Discovery ≠ qualified opportunity ≠ pipeline deal.

Preserve the intended product scope, but eliminate accidental state-only persistence.

---

# 15. RESEARCH DOSSIER

Audit:

```ts
activeDossier
researchEngine.generateDossier()
```

Determine whether this is supposed to be:

- cached local computation
- backend research
- persisted research
- external research

If it represents live CRM intelligence, route it through the proper backend service.

Do not allow a production company research screen to silently generate invented company information locally.

---

# 16. ERROR HANDLING

Standardize COMMAND mutations.

Every mutation must have:

### Loading

Disable duplicate submission while request is active.

### Success

Update UI from backend response.

### Failure

Show an error.

### Recovery

Restore previous state if optimistic update was used.

Never do:

```ts
catch {
  // ignore
}
```

for business-critical mutations.

Especially remove silent failure handling around:

- pipeline creation
- pipeline stage changes
- opportunity creation
- company save
- Copilot actions
- signal actions
- CRM mutations

Logging may remain for diagnostics, but the user must receive an appropriate UI state.

---

# 17. WORKSPACE ISOLATION

Audit every COMMAND backend query and mutation.

Every company, signal, opportunity, pipeline deal, Copilot action and saved record must respect the authenticated workspace.

Verify:

```text
authenticated user
        ↓
workspace
        ↓
repository query
```

Do not trust:

```text
workspaceId
userId
ownerId
```

from arbitrary frontend payloads when the backend can derive them from authentication.

Cross-workspace access must fail.

Test:

```text
Workspace A cannot read Workspace B data.
Workspace A cannot update Workspace B data.
Workspace A cannot delete Workspace B data.
Workspace A cannot create records inside Workspace B.
```

---

# 18. REMOVE SILENT LOCAL FALLBACKS FROM PRODUCTION

Search the COMMAND frontend for patterns such as:

```ts
catch (_err) {
  return localEngine(...)
}
```

```ts
catch {
  // fallback
}
```

```ts
setTimeout(...)
```

hard-coded CRM records

hard-coded counts

hard-coded scores

fake timestamps

fake company names

fake contacts

fake opportunity values

fake AI responses

Determine whether each one is:

### Valid

A genuine deterministic client-side calculation.

### Development-only

Must be explicitly gated to development/test.

### Invalid

Remove it.

Do not break legitimate offline utilities unnecessarily.

---

# 19. DO NOT BREAK EXISTING BACKEND WORK

Before modifying backend code:

1. inspect existing routes
2. inspect services
3. inspect repositories
4. inspect migrations
5. inspect workspace authorization
6. inspect existing tests

Reuse existing infrastructure wherever possible.

Do not create duplicate routes for functionality that already exists.

Do not create duplicate repositories.

Do not rewrite the authentication system.

Do not modify Gmail/OAuth functionality unless required by a COMMAND dependency.

---

# 20. TESTING REQUIREMENTS

Add or update tests for every corrected production flow.

At minimum test:

### Dashboard

- authenticated dashboard loads
- real metrics appear
- empty workspace shows empty state
- no demo data appears
- period filter changes results

### Pipeline

- fetch deals
- create deal
- failed create does not leave fake UI record
- update stage
- failed stage update rolls back
- workspace isolation

### Company Save

- save persists
- unsave persists
- refresh retains state
- workspace isolation

### Copilot

- request reaches backend
- real data is used
- API failure does not fabricate a successful answer
- mutation commands persist correctly
- workspace isolation

### Opportunities

- scoring uses actual data
- create/update persists
- failed mutation does not remain visually successful

### Signals

- filtering works
- date filtering works
- empty state works
- records are workspace scoped

---

# 21. BUILD / TYPECHECK / TEST

After implementation run the project's actual commands.

Inspect `package.json` first.

Then run the appropriate:

```text
lint
typecheck
test
build
```

Do not claim success unless the commands actually execute successfully.

If tests cannot run because of missing environment variables or external services, report the exact blocker.

Do not fabricate test results.

---

# 22. PRODUCTION ACCEPTANCE CRITERIA

COMMAND is considered fixed only when all of these are true:

- No hard-coded CRM demo records are shown as live data.
- Dashboard metrics come from real application data.
- Empty workspace produces real empty states.
- Dashboard period filters actually affect results.
- Pipeline creation persists.
- Pipeline stage changes persist.
- Failed mutations do not leave false UI state.
- Company save/unsave persists.
- Copilot uses the backend execution path.
- Copilot does not fabricate counts/results.
- Opportunities use real source data.
- Opportunity mutations persist.
- Signals use real data.
- Signal date filtering works.
- Geo-captured records use proper persistence boundaries.
- Research does not masquerade fabricated data as live intelligence.
- Workspace isolation is enforced.
- Loading/error/success states work.
- No critical mutation silently swallows errors.
- TypeScript passes.
- Build passes.
- Relevant tests pass.

---

# IMPORTANT IMPLEMENTATION RULE

Do NOT solve this by simply deleting functionality.

The objective is:

**make the existing COMMAND functionality real and persistent.**

Keep the current UI, navigation, component structure and product intent wherever possible.

Only change UI when required to accurately communicate:

- loading
- empty
- error
- success
- unavailable
- live backend state

Do not redesign the pages.

Do not add unrelated features.

Do not modify HUNT, SELL or INTELLIGENCE functionality unless a shared context/API change absolutely requires it.

At the end, provide a concise implementation report containing:

1. Files changed
2. Backend routes/services changed
3. Database/repository changes
4. Demo/fallback data removed
5. COMMAND actions now persisted
6. Tests executed and exact results
7. Build/typecheck results
8. Any remaining blockers

Do not report COMMAND as production-ready unless the acceptance criteria above are actually verified.