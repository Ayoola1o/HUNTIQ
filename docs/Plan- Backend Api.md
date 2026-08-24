Yes. We can start with **1 — Backend/API Boundary**, but I won't modify the repository in this chat because you declined the Work-mode handoff.

For HUNTIQ, the boundary I recommend is:

```text
┌──────────────────────── HUNTIQ ────────────────────────┐
│                                                        │
│  React/Vite Frontend                                   │
│       │                                                │
│       ▼                                                │
│  src/api/                                              │
│  ├── client.ts                                        │
│  ├── companies.ts                                     │
│  ├── prospects.ts                                     │
│  ├── signals.ts                                       │
│  └── research.ts                                      │
│       │                                                │
└───────┼────────────────────────────────────────────────┘
        │ HTTPS / JSON
        ▼
┌────────────────────────────────────────────────────────┐
│                 HUNTIQ API SERVER                      │
│                                                        │
│ /api/health                                            │
│ /api/companies                                         │
│ /api/prospects                                         │
│ /api/jobs                                               │
│ /api/signals                                            │
│ /api/research                                           │
│ /api/contacts                                           │
└──────────────────────┬─────────────────────────────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
          PostgreSQL       Background Jobs
                              │
                              ▼
                       External Providers
```

### What we should implement now

**Backend foundation only:**

```text
server/
├── index.ts
├── app.ts
├── routes/
│   └── health.ts
├── middleware/
│   ├── error.ts
│   └── cors.ts
├── config/
│   └── env.ts
└── types/
    └── api.ts

src/
└── api/
    ├── client.ts
    └── health.ts
```

And the first endpoint:

```text
GET /api/health
```

returning something like:

```json
{
  "status": "ok",
  "service": "huntiq-api",
  "version": "1.0.0",
  "timestamp": "..."
}
```

### Important architectural rule

The existing engines should eventually become:

```text
prospectorEngine
      ↓
API/service layer
      ↓
database
```

rather than:

```text
prospectorEngine
      ↓
external API directly
```

That keeps your API keys server-side and makes the future Greenhouse/Lever/Ashby/Hunter integrations replaceable.

### After this

The sequence should be:

**1. API boundary ← now**

**2. PostgreSQL + schema**

**3. Job provider abstraction**

**4. First live job source**

**5. Job normalization**

**6. Company resolution**

**7. Hiring signal generation**

**8. Existing scoring engine → live data**

**9. Contact enrichment**

**10. Automatic lead creation**

I recommend we **do not touch the existing UI during step 1**. The frontend should continue working exactly as it does while we establish the backend underneath it.