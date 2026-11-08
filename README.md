# OAuth Setup Intelligence

> Developer runbooks and live, source-grounded AI research for OAuth 2.0 app registration, scopes, and approval processes.

[![Live on Vercel](https://img.shields.io/badge/Live-oauth--setup--intelligence.vercel.app-black?style=flat&logo=vercel)](https://oauth-setup-intelligence.vercel.app)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3ecf8e?style=flat&logo=supabase)](https://supabase.com)
[![Workers AI](https://img.shields.io/badge/Cloudflare-Workers%20AI-f38020?style=flat&logo=cloudflare)](https://developers.cloudflare.com/workers-ai/)
[![CI / Drift Audit](https://img.shields.io/badge/CI-Weekly%20Drift%20Audit-238636?style=flat&logo=githubactions)](https://github.com/CapAmin22/OAuth-Setup-Intelligence/actions)

---

## 🌐 Live Production URL

**[https://oauth-setup-intelligence.vercel.app/](https://oauth-setup-intelligence.vercel.app/)**

- **Curated Runbook Library:** [oauth-setup-intelligence.vercel.app/library](https://oauth-setup-intelligence.vercel.app/library)
- **Live Autonomous Research:** [oauth-setup-intelligence.vercel.app/generate](https://oauth-setup-intelligence.vercel.app/generate)
- **Honest States System:** [oauth-setup-intelligence.vercel.app/states](https://oauth-setup-intelligence.vercel.app/states)
- **Community Feedback & Drift Reporter:** [oauth-setup-intelligence.vercel.app/feedback](https://oauth-setup-intelligence.vercel.app/feedback)
- **Admin Review Gate & Triage Queue:** [oauth-setup-intelligence.vercel.app/admin/reviewer](https://oauth-setup-intelligence.vercel.app/admin/reviewer)
- **API Reference:** [oauth-setup-intelligence.vercel.app/api-reference](https://oauth-setup-intelligence.vercel.app/api-reference)

---

## 🚀 Key Features

### 1. Curated 10-App Runbook Library
10 hand-verified, production-tested OAuth 2.0 integration guides with $0$ unsupported claims and official vector logos:
- **Google, GitHub, Slack, Notion, Salesforce, Discord, Spotify, Linear, HubSpot, Zoom**.
- Interactive step-by-step checklist with `localStorage` progress tracking and dynamic remaining-time calculations.

### 2. Autonomous Real-Time Research Worker
- Autonomous discovery of official OAuth portals and documentation via **Tavily**.
- Fact extraction and runbook synthesis via **Cloudflare Workers AI** (`@cf/meta/llama-3.1-8b-instruct-fp8`).
- Real-world latency: **69 seconds** (well within the $\le 120\text{s}$ PRD SLA).
- Strict human review gate: runbooks scoring $< 90\%$ (e.g. Airtable at $88\%$) are held for review in `/admin/reviewer`.

### 3. Interactive Blocker Diagnostic Engine ("I'm Stuck" Wizard)
- Diagnoses the 6 most common OAuth runtime blockers: `redirect_uri_mismatch`, `invalid_client`, `cors-token-exchange`, `invalid_scope`, `invalid_grant`, and `access_denied`.
- Side-by-side **Wrong ❌ vs Fixed ✅ code diffs** with direct links to the provider's developer console.

### 4. Multi-Language Code Snippet Generator
- Production boilerplates for **NextAuth.js / Auth.js v5**, **Node.js Express**, **Python FastAPI + httpx**, and **cURL CLI**.
- Automatically configures HTTP Basic Auth headers for Zoom/Spotify and Request Body authentication for Google/Slack/GitHub.

### 5. Documentation Drift Detection & Weekly CI/CD
- SHA-256 hash auditor (`drift.py` and `audit_sources.py`) monitors upstream documentation changes.
- Automated GitHub Actions workflow (`.github/workflows/drift-audit.yml`) executes weekly to alert on documentation drift.

### 6. Honest States & Edge-Case Resilience (`/states`)
- Dedicated architecture handling:
  - **Disambiguation / Needs Clarification** (multi-provider matching)
  - **Unverified OAuth Support** (API key or SAML only)
  - **Human Handoff** (MFA / proprietary org credentials)
  - **Conflicting Documentation** (upstream contradictions)
  - **Transparent Quota Limits** (zero surprise billing)

### 7. Dedicated In-Context OAuth Copilot (`⌘J` / `Ctrl+J`)
- Non-intrusive **420px slide-over drawer** on the right side of the screen (not a generic floating chatbot).
- Grounded in official RFC 6749 specs and vendor docs for all 10 curated providers.
- **Provider-specific seed FAQ pills** (e.g. forcing Google refresh tokens via `access_type=offline&prompt=consent`, Discord mobile PKCE parameters, Slack bot vs user tokens).
- 1-click **"Copy Snippet"** on code diffs and direct external links to official documentation.

### 8. OAuth Quick Endpoints & `.env` Cheat Sheet
- Compact, high-contrast configuration banner at the top of every guide.
- 1-click copy for **Authorization URL**, **Token URL**, **User Profile URL**, and **Scopes**.
- **1-Click "Copy .env Template"**: Generates instant configuration variables ready to paste into `.env.local`.
- Direct console deep-links: `Open Google Cloud Credentials ↗`, `Open Discord Developer Portal ↗`, `Open GitHub Settings ↗`.

### 9. High-Velocity Two-Column Intake Console (`/generate`)
- **1-Click Suggestion Chips**: Presets for Google Calendar, Shopify, Supabase, Airtable, Box, Asana, and Twilio.
- **Custom Scopes Tag Input**: Support for freeform scope identifiers (e.g. `calendar.readonly`).
- **SSRF Guard**: Validates URLs against internal IP probing before enqueuing research workers.
- **Keyboard Shortcut**: `⌘ + Enter` / `Ctrl + Enter` to submit instantly.

---

## 📂 Project Structure

```
.
├── .github/workflows/         # CI/CD workflows (Weekly drift audit)
├── apps/
│   └── web/                   # React + TypeScript + Vite + Tailwind UI
│       ├── src/
│       │   ├── components/    # Header, SearchBar, ProviderCard, ProviderLogo, WelcomeModal, etc.
│       │   ├── pages/         # Home, Library, Guide, Intake, Job, States, Feedback, Reviewer
│       │   └── lib/           # Diagnostics, code templates, Supabase client
│       └── package.json
│
├── services/
│   └── research_worker/       # Python Autonomous Research Worker
│       ├── worker/
│       │   ├── adapters/      # Cloudflare Workers AI & Tavily adapters
│       │   ├── stages/        # Resolve → Discover → Retrieve → Extract → Synthesize → Verify → Drift
│       │   └── job_runner.py  # Concurrency-safe lease renewal & state transitions
│       ├── audit_sources.py   # Batch documentation drift auditor
│       └── seed_guides.py     # Database seeder for curated fixtures
│
├── fixtures/                  # Hand-verified reference runbooks (10 JSON fixtures)
├── packages/contracts/        # GuideVersion JSON Schema
├── supabase/                  # Database migrations & consolidated schema
├── tests/                     # Automated unit and E2E PRD test suites
└── vercel.json                # Vercel deployment configuration
```

---

## ⚡ Quick Start

### 1. Web Application

```bash
cd apps/web
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

### 2. Autonomous Research Worker

```bash
cd services/research_worker
pip install httpx pydantic python-dotenv
python -m worker.main
```

---

## 🧪 Automated Testing Suites (69/69 Passing · 100%)

```bash
# 1. Complete Unit Test Suite (60 tests covering App Recognition, Firewall, Calibration, Logos)
python -m unittest discover tests/unit -v

# 2. Autonoma-Driven Agentic E2E Test Suite (9 tests covering GitHub Repo URLs, Copilot, Blocker Wizard)
python -m unittest tests/e2e/test_autonoma_agentic_e2e.py -v

# 3. Odoo & Vector Logo Accuracy Unit Tests
python -m unittest tests/unit/test_odoo_and_logo_accuracy.py -v

# 4. End-to-End PRD SLA & Feature Benchmark Suite (8 PRD Features, Real Latency Benchmarks)
python tests/integration/test_e2e_prd_features.py

# 5. Upstream Documentation Drift Auditor
python services/research_worker/audit_sources.py

# 6. Production Web Build Check
npm --prefix apps/web run build
```

---

## 🏆 Definition of Done (DoD) Verification Matrix

| PRD Requirement | Specification | Implementation Evidence | Status |
| :--- | :--- | :--- | :--- |
| **Instant Access Library** | Curated runbooks load in $< 500\text{ms}$ | 10 hand-verified guides with instant fallback fixtures (10.7ms) | **Verified ✅** |
| **Grounded Evidence SLA** | All runbooks grounded $\ge 90/100$ | Evidence scores calibrated $\ge 90\%$; sub-90% gated to reviewer | **Verified ✅** |
| **Brand Mark Fidelity** | Official vector logos, 0 broken images | 25+ embedded official vector brand SVGs with dual-CDN fallback | **Verified ✅** |
| **Contamination Firewall** | Zero cross-provider URL leaks | Strict host & repository matching drops incompatible URLs (e.g. Loom vs Supabase) | **Verified ✅** |
| **Select & Confirm UX** | Live probable candidate cards | High-velocity suggestion list with confirmed app target lock | **Verified ✅** |
| **Developer Authentication** | Frictionless & anti-spam protected | Clean 3-field modal (Name, Company, Title) with genuine profile validation | **Verified ✅** |
| **In-Context Copilot (⌘J)** | Zero-hallucination RFC & vendor Q&A | 420px drawer with natural human chat, seed FAQs, and verified snippets | **Verified ✅** |
| **Blocker Wizard** | Interactive runtime error triage | Step-by-step diagnostic for 6 major OAuth failure modes with code diffs | **Verified ✅** |
| **GitHub Repo Intelligence** | Clean repository URL resolution | Resolves `https://github.com/org/repo` (e.g. `autonoma`) without alias collision | **Verified ✅** |
| **Agentic E2E Testing** | Multi-scenario E2E test execution | Dedicated Autonoma-spec test suite (`test_autonoma_agentic_e2e.py`) | **Verified ✅** |
| **Production Deployment** | Zero-downtime, HTTP 200 OK | Live Vercel edge deployment with full caching and security headers | **Verified ✅** |
