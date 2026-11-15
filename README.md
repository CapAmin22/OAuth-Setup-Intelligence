# OAuth Setup Intelligence

> An interactive developer intelligence tool that eliminates integration bottlenecks by providing verified OAuth 2.0 runbooks, upfront effort and approval estimates, and live autonomous research for unfamiliar APIs.

* **Live Working Experience:** [https://oauth-setup-intelligence.vercel.app/](https://oauth-setup-intelligence.vercel.app/)
* **Provider Library:** [https://oauth-setup-intelligence.vercel.app/library](https://oauth-setup-intelligence.vercel.app/library)
* **Live Autonomous Research:** [https://oauth-setup-intelligence.vercel.app/generate](https://oauth-setup-intelligence.vercel.app/generate)
* **Edge States & Resilience:** [https://oauth-setup-intelligence.vercel.app/states](https://oauth-setup-intelligence.vercel.app/states)
* **Source Repository:** [https://github.com/CapAmin22/OAuth-Setup-Intelligence](https://github.com/CapAmin22/OAuth-Setup-Intelligence)

---

## 1. Problem Understanding: The Developer's Dilemma

When developers build user-facing integrations (whether direct or via managed auth services like Composio), configuring the **Provider OAuth App** in the vendor’s developer console is consistently the most frustrating bottleneck.

OAuth 2.0 (RFC 6749) standardizes the wire protocol, but vendor developer consoles are wildly fragmented:
1. **Hidden Technical Nuances:** A trailing slash on a redirect URI, passing client credentials in the JSON body instead of an `Authorization: Basic` header (Supabase), or using spaces instead of commas for scope delimiters (Slack) results in opaque `400` or `401` errors that halt progress.
2. **Unpredictable Effort & Approval Surprises:** Developers often write their integration code first, only to realize too late that requesting a calendar or email scope requires a 3-week Google CASA security audit or Slack App Directory review.
3. **Ambiguity Around Agent Automation:** Developers want autonomous agents to handle tedious setup, but lack clarity on what an agent can safely automate versus where human intervention (2FA, billing, legal agreements) is required.

**Product Thesis:** When developers look up a provider, they should immediately get an actionable, shareable runbook that clarifies:
* **Difficulty & Readiness:** How easy or difficult it is to get their OAuth app ready for use.
* **Time & Effort:** Active engineering time (e.g., 15–30 min) versus external vendor approval waiting periods (Instant vs. 2–4 weeks).
* **Requirements & Gotchas:** Exact token exchange rules, mandatory PKCE, scope delimiters, and redirect URI constraints.
* **Agent vs. Human Boundaries:** What the autonomous agent investigates and provisions versus where the human developer must take over.

---

## 2. Show Us That It Works: Real Apps Across Diverse Challenges

We calibrated and tested the guidance against distinct real-world setup archetypes, complemented by a live autonomous research pipeline for unlisted APIs:

### A. Diverse Setup Archetypes Tested

| Setup Challenge Archetype | Real Apps | Setup Dynamics & Developer Reality | Critical Nuances Uncovered & Corrected |
| :--- | :--- | :--- | :--- |
| **1. Instant Self-Serve** | **GitHub, Discord, Supabase** | Zero external wait, immediate client credential issuance, localhost callbacks permitted. | **Supabase Nuance:** Token exchange *strictly requires* an HTTP Basic header (`Authorization: Basic base64(id:secret)`). Passing credentials in the JSON body throws `401 Unauthorized`. |
| **2. Mandatory PKCE & Token Rotation** | **Airtable** | Static keys are deprecated; all clients must implement RFC 7636 Proof Key for Code Exchange (S256). | **Refresh Rotation Nuance:** Airtable issues a new refresh token on *every* refresh request. If the client fails to persist the new token atomically, subsequent calls break permanently. |
| **3. Sensitive Scopes & Approval Gates** | **Google Calendar** | Development mode is capped at 100 test accounts; production launch requires Google Trust & Safety review. | **Offline Consent Nuance:** Repeat logins withhold refresh tokens unless `access_type=offline&prompt=consent` is explicitly forced in the authorization URL. |
| **4. Granular Scope Separation** | **Slack** | Separate token spaces for Workspace Bots (`xoxb-`) and User tokens (`xoxp-`). | **Delimiter Nuance:** Slack strictly enforces comma-separated scopes (`users.profile:read,chat:write`). Space delimiters trigger an immediate `invalid_scope` failure. |
| **5. Multi-Tenant ERP Routing** | **Odoo (`docs.odoo.com`)** | Odoo functions as both an application and an OAuth provider via the Technical Settings module. | **Multi-DB Routing:** Redirects in multi-tenant instances must append `db={database_name}` to maintain tenant isolation. |
| **6. Live Unfamiliar App Generation** | **Loom, Zoho, Asana, etc.** | Submitting an unfamiliar provider name or docs URL triggers our 4-stage autonomous research worker live. | **Grounding:** Dynamically discovers endpoints, extracts PKCE requirements, and validates findings against SHA-256 documentation hashes in ~60s. |

### B. What We Learned, Corrected, and What Remains Uncertain

* **What We Learned & Corrected:**
  * **Slack:** Corrected scope formatting templates to enforce comma separation.
  * **Google:** Injected `access_type=offline&prompt=consent` by default into `.env` and code generators to prevent broken background cron jobs.
  * **Supabase:** Corrected code snippets in TypeScript, Python, and cURL to use Basic Auth headers instead of request bodies.
  * **Airtable:** Embedded an automated S256 code verifier/challenge helper into the runbook.
* **What Remains Uncertain (Transparently Flagged):**
  * **Partner-Gated Scopes:** Certain enterprise APIs (e.g., Salesforce Restricted Connected Apps, Zoom Marketplace Enterprise) require private commercial contracts before scopes become visible in developer consoles. We flag these as **Uncertain / Enterprise Review Required** with confidence scores $< 90$.

---

## 3. Key Product Decisions

1. **Curated + Autonomous Hybrid Architecture:** Top developer platforms load instantly from cached, validated reference fixtures. Unlisted or niche APIs are crawled live by an autonomous research worker in $< 60$ seconds.
2. **Separating Active Engineering Effort from Approval Wait Time:** Most vendor docs advertise "5-minute setup." We tell developers the truth: *20 minutes of active coding, but a 2-week wait for vendor verification before production launch.*
3. **In-Context Copilot (`⌘J`) Instead of Generic Chat:** Instead of sending developers to a disconnected chatbot, Copilot opens as a slide-over drawer alongside the runbook, pre-grounded in the active provider's RFC 6749 parameters and official docs.
4. **Interactive Blocker Wizard (Wrong ❌ vs. Fixed ✅ Diffs):** Rather than outputting generic error descriptions, the wizard provides side-by-side code diffs for the 6 most common OAuth runtime failures (trailing slash mismatches, missing grant types, invalid delimiters).
5. **Zero-Hallucination Contamination Firewall:** If a user researches an app (e.g., Loom) but inputs an unrelated doc URL (e.g., Supabase docs), the system firewalls the input to prevent cross-provider contamination.
6. **Authentic-Only Feedback Loop:** The feedback and admin console (`/admin/reviewer`) strictly displays 100% genuine user submissions—completely purged of synthetic seed data—to ensure product iteration is driven by real developer friction.

---

## 4. Limitations & Boundary Conditions

1. **Third-Party Credential Generation:** The autonomous worker does *not* log into vendor consoles to click buttons or generate Client Secrets on behalf of the user. Doing so would violate vendor Terms of Service, trigger 2FA blocks, and compromise enterprise security boundaries. Instead, the agent guides the developer directly to the exact credential creation form.
2. **Vendor Console UI Drift:** While OAuth 2.0 API endpoints remain stable for years, SaaS vendor console navigation paths frequently shift. We mitigate this through automated weekly SHA-256 documentation drift monitors and a community report queue.
3. **Enterprise Protocol Scope:** This tool focuses exclusively on OAuth 2.0 and OpenID Connect (OIDC). Proprietary enterprise federation protocols (SAML 2.0, WS-Federation, SCIM) are intentionally excluded and flagged under `/states`.
4. **Zero Credentials Policy:** No real client IDs, client secrets, or live user tokens are stored or transmitted. All code generators use sanitized `.env.local` templates.

---

## 5. Quick Start & Setup Instructions

### Prerequisites
* Node.js v18+ and npm
* Python 3.10+ (for running the research worker locally)

### 1. Web Application (React + Vite + Tailwind CSS)
```bash
# Navigate to web application
cd apps/web

# Install dependencies
npm install

# Start local development server
npm run dev
# -> Running at http://localhost:3000

# Run production build & TypeScript validation
npm run build
```

### 2. Autonomous Research Worker (Python Backend)
```bash
# Navigate to research worker service
cd services/research_worker

# Install dependencies
pip install -r requirements.txt

# Start the worker locally
python -m worker.main
```

### 3. Automated Test Suite
```bash
# Run all unit and integration tests from repo root
python -m unittest discover tests/unit -v
# -> 68/68 passing tests
```

---

## 6. Live Experience Links

* **Production Web App:** [https://oauth-setup-intelligence.vercel.app/](https://oauth-setup-intelligence.vercel.app/)
* **Provider Catalog & Library:** [https://oauth-setup-intelligence.vercel.app/library](https://oauth-setup-intelligence.vercel.app/library)
* **Live Autonomous Research:** [https://oauth-setup-intelligence.vercel.app/generate](https://oauth-setup-intelligence.vercel.app/generate)
* **Admin Reviewer Console:** [https://oauth-setup-intelligence.vercel.app/admin/reviewer?tab=developers](https://oauth-setup-intelligence.vercel.app/admin/reviewer?tab=developers) *(Admin access restricted to user Amin)*
* **Edge States Gallery:** [https://oauth-setup-intelligence.vercel.app/states](https://oauth-setup-intelligence.vercel.app/states)
