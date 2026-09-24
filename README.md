# HUNTIQ — AI-Powered B2B Sales Intelligence & Autonomous Outreach Platform

<div align="center">

**Turn market signals, hiring expansion, and digital gaps into high-converting sales pipelines.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📖 About HUNTIQ

**HUNTIQ** is an enterprise-grade B2B sales intelligence, account prospecting, and autonomous outreach platform. It bridges the gap between raw web signals (job board hiring surges, geographic business registrations, executive leadership shifts, technology stack gaps) and closed-won revenue.

Modern sales teams spend up to 70% of their time manually researching prospects, verifying emails, writing cold outreach, and tracking replies across disparate tools. HUNTIQ unifies this entire workflow into a single, cohesive, AI-driven operating system:

1. **Detects Intent:** Continuously monitors job boards (Greenhouse, Ashby, Lever) and Google Maps / Places directories for high-growth commercial signals.
2. **Resolves & Enriches:** Resolves businesses into canonical company profiles, discovers decision-makers, and predicts verified email addresses.
3. **Scores Opportunities:** Evaluates accounts using an evidence-based Opportunity Scoring Engine (0–100) combining ICP fit, digital maturity, and hiring velocity.
4. **Drafts Personalized Pitches:** Performs deep digital audits and generates tailored value propositions, cold email scripts, and WhatsApp/phone call openers.
5. **Executes Multi-Step Campaigns:** Dispatches personalized email sequences through a production-hardened Gmail OAuth engine with real-time reply tracking, automatic stop-on-reply protection, and self-healing watch renewals.
6. **Accelerates the Pipeline:** Manages deals through visual Kanban stages with real-time deal forecasting, KPI analytics, and activity tracking.

---

## 💡 The Usefulness & Real-World Value of HUNTIQ

### 1. Eliminates Cold Outreach Friction
Instead of sending generic cold emails that land in spam or get ignored, HUNTIQ equips your sales team with **context-rich sales triggers**. When an account is actively hiring 5 engineers, expanding to a new country, or suffering from slow website load times and missing SSL, HUNTIQ flags the exact opportunity and pre-writes a high-converting pitch angle addressing that specific pain point.

### 2. Autonomous Stop-on-Reply Protection
Sending an automated follow-up email to a prospect who has already replied is a critical sales blunder that burns sender reputation. HUNTIQ connects to Google Cloud Pub/Sub via real-time webhooks, cryptographically verifies incoming Gmail push notifications, immediately detects prospect replies, and halts active campaign sequences in real time under PostgreSQL transactional locks.

### 3. All-In-One Revenue Stack
Replaces 5+ separate subscription tools:
- **Apollo / ZoomInfo:** Prospect search, contact enrichment, and email discovery.
- **Apify / Outscraper:** Local business radar and Google Maps extraction.
- **Lemlist / Instantly:** Multi-step cold outreach campaigns and sequence automation.
- **HubSpot / Pipedrive:** CRM deal tracking, Kanban pipeline, and revenue forecasting.
- **ChatGPT / Copy.ai:** AI sales angle generation, company dossiers, and email personalization.

### 4. Enterprise-Grade Multi-Tenant Isolation
Engineered with strict workspace partitioning (`workspace_id`), ensuring that enterprise agencies, consulting firms, and multi-brand organizations can manage multiple client workspaces with complete database, token, contact, and campaign isolation.

---

## ✨ Key Features

### 🎯 1. Opportunity Scoring Engine (0–100)
- **ICP Fit Scoring:** Dynamic scoring based on target industries, employee count tiers, revenue, and geography.
- **Growth & Intent Velocity:** Analyzes open job counts, leadership hiring (CXO, VP, Director), and market expansion.
- **Digital Gap Analysis:** Audits website responsiveness, SEO readiness, social footprint, and security headers to identify upsell and consulting opportunities.
- **Estimated Deal Value:** Calculates expected contract value dynamically based on verified headcount and tech complexity.

### 🌐 2. Geo Radar & Places Prospecting
- Ingests regional businesses via Google Places and geospatial coordinates.
- Filters by category, minimum rating, review volume, website presence, and contact phone numbers.
- One-click capture into the CRM pipeline with auto-generated audit briefs and opening hooks.

### 🏢 3. Entity Resolution & Contact Enrichment
- **Canonical Company Resolver:** Strips legal noise (`Ltd`, `Inc`, `Plc`, `Holdings`) and normalizes domains and ATS links (`careers.company.com` -> `company.com`).
- **Domain Alias Matching:** Recognizes historical domain changes and brand acquisitions.
- **Email Pattern Discovery:** Detects domain naming conventions (`{first}.{last}@domain.com`, `{f}{last}@domain.com`) and validates deliverability.
- **Strict Deduplication:** Eliminates duplicate accounts and contacts within the workspace.

### 📬 4. Production-Hardened Gmail & Outreach Engine
- **OAuth 2.0 Security:** Cryptographically binds authorization flows to authenticated workspaces using single-use, 10-minute TTL state tokens in PostgreSQL.
- **AES-256-GCM Token Encryption:** Encrypts Google access and refresh tokens at rest with unique IVs and authentication tags.
- **Automatic Token Refresh:** Proactively refreshes expiring access tokens without user intervention.
- **Real-Time Pub/Sub Webhooks:** Verifies Google Cloud OIDC RSA-256 signatures against Google JWK public certificates.
- **Gmail Watch Renewal Daemon:** Background scheduler renews Gmail push subscriptions every 6 hours, ensuring uninterrupted reply detection.
- **Durable Step Claiming:** Utilizes PostgreSQL `SELECT ... FOR UPDATE` row-level locks and `campaign_step_executions` state tracking to guarantee zero double-dispatching even under high concurrency.
- **Graceful Disconnect:** Revokes credentials with Google, removes active watches, and safely wrings stored tokens while preserving historical CRM communication records.

### 📊 5. Visual Pipeline & Deal Management
- **Interactive Kanban Board:** Drag-and-drop deals across stages: *Discovery*, *Proposal*, *Negotiation*, *Won*, and *Lost*.
- **Executive KPIs:** Real-time visibility into Total Pipeline Value, Expected Revenue, Win Rate %, Average Deal Size, and Sales Cycle Duration.
- **Rich Activity Timeline:** Complete historical audit trail of emails sent, meetings scheduled, calls logged, and proposals viewed.

### 🤖 6. AI Copilot & Research Dossiers
- Interactive AI sales assistant that writes customized outreach scripts, formulates discovery call questions, and evaluates company positioning.
- Generates exhaustive account intelligence dossiers compiling recent company milestones, tech stack summaries, key decision-makers, and strategic angles.

### 🔔 7. Saved Searches & Real-Time Alerts
- Save granular ICP search filters and monitoring criteria.
- Autonomous background scans evaluate new prospects against saved criteria and deliver in-app and email alert digests.

---

## 🏗️ Technical Architecture

HUNTIQ is built as a high-performance TypeScript monorepo orchestrated with **pnpm workspaces**:

```
HUNTIQ/
├── artifacts/
│   ├── api-server/         # Express 5 backend API & background execution daemon
│   │   ├── src/
│   │   │   ├── config/     # Strict environment & production validation
│   │   │   ├── database/   # PostgreSQL pool & advisory-locked migrations
│   │   │   │   └── migrations/ # 001 to 012 SQL migration scripts
│   │   │   ├── engine/     # Scoring, company resolver, normalizer, and audits
│   │   │   ├── middleware/ # JWT auth, API key verification, error handling
│   │   │   ├── providers/  # ATS job providers (Ashby, Greenhouse, Lever), Maps
│   │   │   ├── repositories/# PostgreSQL tenant-isolated repositories
│   │   │   ├── routes/     # Express route controllers & webhooks
│   │   │   ├── services/   # Gmail, campaigns, OAuth, encryption, schedulers
│   │   │   └── tests/      # 46 comprehensive integration test suites
│   ├── huntiq/             # React 18 + Vite frontend single-page application
│   │   ├── src/
│   │   │   ├── api/        # Typed API clients
│   │   │   ├── components/ # Tailored UI components, dashboards, Kanban, modals
│   │   │   ├── context/    # Global state management
│   │   │   └── types/      # Shared client domain models
│   └── mockup-sandbox/     # Standalone preview & prototype environment
├── scripts/                # Build and maintenance scripts
└── package.json            # Monorepo root configuration
```

### Backend Technology Stack
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5
- **Language:** TypeScript 5.9
- **Database:** PostgreSQL (with `pg` connection pooling)
- **Security & Crypto:** AES-256-GCM encryption, Node.js `crypto` (RSA-256 signature verification)
- **Bundler:** ESBuild (`build.mjs`)

### Frontend Technology Stack
- **Framework:** React 18
- **Build Tool:** Vite 7.3
- **Styling:** Vanilla CSS & Tailwind CSS tokens
- **Component Primitives:** Radix UI accessible UI primitives
- **Icons:** Lucide React

---

## 🔒 Security & Reliability Engineering

HUNTIQ is engineered with zero-compromise production safeguards:

1. **No Silent In-Memory Fallback:** In production mode (`NODE_ENV=production`), every repository factory strictly enforces a live PostgreSQL connection. If the database is unreachable, the system fails safely with HTTP 503 `DATABASE_UNAVAILABLE` rather than quietly serving stale or synthetic in-memory mock data.
2. **Session Advisory Migration Lock:** Database migrations acquire a PostgreSQL session advisory lock (`SELECT pg_advisory_lock(...)`) to prevent multi-instance container replicas from racing schema updates on startup.
3. **Secret Redaction:** The `sanitizeDiagnosticError()` pipeline automatically scrubs Bearer tokens, Google OAuth access tokens (`ya29...`), Google API keys (`AIza...`), database connection strings, passwords, and Authorization headers before logging or returning error responses.
4. **Dev Bypass Stripping:** Development authentication bypasses (`ALLOW_DEV_AUTH_BYPASS`) are explicitly deleted from memory in production environments, forcing strict Bearer JWT or `X-HUNTIQ-API-KEY` verification on all protected routes.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** `v20.x` or higher
- **Package Manager:** `pnpm` (`v9.x` or higher)
- **Database:** PostgreSQL `v14+` (local instance or cloud providers like Neon, Supabase, AWS RDS)

### 1. Clone the Repository
```bash
git clone https://github.com/Ayoola1o/HUNTIQ.git
cd HUNTIQ
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Server
PORT=3001
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/huntiq

# Authentication Secrets
JWT_SECRET=your_super_secret_jwt_key_here
API_KEY=your_optional_service_api_key

# Google OAuth & Gmail Integration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/v1/auth/google/callback
GOOGLE_TOKEN_ENCRYPTION_KEY=your_32_byte_hex_or_passphrase_for_aes_256_gcm

# Background Jobs & Webhooks
CRON_SECRET=your_cron_job_secret_here

# Maps & Geospatial Services (Optional for Maps Radar)
APIFY_API_TOKEN=your_apify_api_token
VITE_GEOAPIFY_API_KEY=your_geoapify_key
```

### 4. Run Database Migrations
Migrations run automatically on server boot, or you can run them manually:
```bash
pnpm --filter @workspace/api-server exec tsx src/database/migrate.ts
```

### 5. Start Development Servers
Start both the API backend and the React frontend concurrently:
```bash
pnpm run dev:all
```
- **Frontend Application:** `http://localhost:5173`
- **Backend API:** `http://localhost:3001`
- **API Health Endpoint:** `http://localhost:3001/api/health`

---

## 🧪 Testing & Verification

HUNTIQ includes a comprehensive suite of 46 automated integration tests covering Gmail authentication, Pub/Sub webhook verification, campaign execution recovery, watch renewal, and disconnect/re-authentication:

```bash
# Run full automated test suite
pnpm test

# Run workspace-wide typecheck (all packages)
pnpm run typecheck

# Build all packages for production
pnpm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
