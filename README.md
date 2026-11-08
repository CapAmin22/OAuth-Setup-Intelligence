# OAuth Setup Intelligence

> Developer runbooks and live, source-grounded AI research for OAuth 2.0 app registration, scopes, and approval processes.

* **Live Working Experience:** [https://oauth-setup-intelligence.vercel.app/](https://oauth-setup-intelligence.vercel.app/)
* **Provider Library:** [https://oauth-setup-intelligence.vercel.app/library](https://oauth-setup-intelligence.vercel.app/library)
* **Live Autonomous Research:** [https://oauth-setup-intelligence.vercel.app/generate](https://oauth-setup-intelligence.vercel.app/generate)
* **Honest Edge-Case System:** [https://oauth-setup-intelligence.vercel.app/states](https://oauth-setup-intelligence.vercel.app/states)
* **Source Repository:** [https://github.com/CapAmin22/OAuth-Setup-Intelligence](https://github.com/CapAmin22/OAuth-Setup-Intelligence)

---

## The Developer Problem & The Path Forward

OAuth 2.0 was standardized over a decade ago in RFC 6749, yet integrating it remains one of the most frustrating time sinks for software engineers. While the core protocol is standard, vendor implementations are deeply fragmented:
* Portals bury app registration under disparate names (*Connected Apps*, *OAuth Providers*, *Integrations*, *Bot vs User Scopes*).
* Redirect URIs fail with opaque errors due to hidden trailing-slash sensitivity, strict port matching, or localhost restrictions.
* Approval gates (like Google CASA Tier 2 audits or Slack App Directory reviews) catch engineers by surprise after code is already written.

**OAuth Setup Intelligence** solves this by giving developers a clear, predictable path forward. When developers look up an app, they immediately receive a shareable, interactive runbook that clarifies:
1. **Difficulty & Readiness:** How easy or difficult it is to get their OAuth app ready for use (Instant Self-Serve vs Developer Verification vs Enterprise Review Gate).
2. **Time & Active Effort:** Hands-on engineering time (e.g., 15–30 min vs 30–90 min) plus any external waiting periods for compliance or approval (Instant vs 3–5 business days).
3. **Nuances & Requirements:** Exact technical requirements—such as mandatory PKCE (RFC 7636), refresh token rotation, HTTP Basic auth headers vs POST body credentials, and multi-tenant routing parameters.
4. **Agent vs Human Boundaries:** Exactly what the agent investigates and generates (portal discovery, endpoint mapping, code boilerplates, blocker diagnostics) versus where the human engineer must take over (signing in with organizational credentials, accepting Terms of Service, obtaining Client Secrets, and submitting verification forms).

---

## Show Us That It Works

### 1. Real Apps Across Different Setup Challenges

We tested and calibrated the guidance against distinct real-world setup archetypes:

* **Instant Self-Serve (Discord, GitHub, Supabase):**
  * *Setup Dynamics:* Immediate client credential issuance, zero external wait, localhost testing permitted.
  * *Nuance:* Supabase OAuth 2.0 requires HTTP Basic Authorization header (`Authorization: Basic base64(id:secret)`) for token exchange; passing credentials in the JSON body throws `401 Unauthorized`.
* **Mandatory PKCE & Token Rotation (Airtable):**
  * *Setup Dynamics:* Deprecates static keys. Mandates RFC 7636 Proof Key for Code Exchange (S256) for all clients and rotates the refresh token on every single refresh call.
  * *Nuance:* If an application fails to persist the new refresh token atomically, subsequent refresh calls fail permanently.
* **Sensitive Scopes & Compliance Gates (Google Calendar):**
  * *Setup Dynamics:* Requesting calendar scopes triggers Google Trust & Safety verification. Apps in "Testing" mode are hard-restricted to 100 whitelisted accounts.
  * *Nuance:* Developers must pass `access_type=offline&prompt=consent` to receive a persistent refresh token on repeat logins for background calendar syncs.
* **Enterprise Multi-Tenant Routing (Odoo - `docs.odoo.com`):**
  * *Setup Dynamics:* Odoo acts as both an ERP suite and an OAuth provider. App creation requires activating the OAuth Providers module in Technical Settings.
  * *Nuance:* In multi-tenant deployments, authorization redirects must specify the target database parameter (`db={database_name}`) to avoid session drops.
* **Live Unfamiliar App Generation:**
  * Submit any unfamiliar SaaS tool, developer API, or custom documentation link in the Intake Console (`/generate`). The autonomous research agent investigates the portal, verifies RFC 6749 endpoints, scores evidence quality, and generates a structured runbook live.

---

### 2. Guidance Checked Against Real Sources & Setup Attempts

By validating against real developer portals, official documentation, and live token exchange attempts, our agents uncovered and corrected several critical developer gotchas:

| Provider | Real Documentation & Setup Reality | What We Learned, Corrected, or Flagged |
| :--- | :--- | :--- |
| **Google** | Refresh tokens are withheld on repeat logins unless explicit consent is forced | **Corrected:** Boilerplates and Copilot inject `access_type=offline&prompt=consent` so background cron jobs don't break |
| **Airtable** | Plain code exchange is rejected (`400 Bad Request`); refresh tokens rotate every call | **Corrected:** Injected PKCE code challenge generator and atomic refresh token transaction safeguards |
| **Supabase** | Client credentials must be passed via HTTP Basic Authorization header | **Corrected:** Fixed token exchange requests to include `Authorization: Basic base64(id:secret)` |
| **Slack** | Granular distinction between Bot (`xoxb-`) and User (`xoxp-`) scopes | **Corrected:** Clarified scope separation so apps don't fail message-posting permissions |
| **Odoo** | Multi-database architecture requires database identification | **Corrected:** Added explicit `db` query parameter routing and technical module activation steps |
| **Enterprise / Private APIs** | Certain scopes require custom commercial agreements or partner status | **Flagged as Uncertain:** Transparently marked under "Assumptions & Limitations" when scopes cannot be self-served |

---

## Setup Instructions

### 1. Web Application (React + Vite + Tailwind)
```bash
cd apps/web
npm install
npm run dev      # Local dev server on http://localhost:3000
npm run build    # Production build & TypeScript verification
```

### 2. Autonomous Research Worker (Python)
```bash
cd services/research_worker
pip install httpx pydantic python-dotenv
cp .env.example .env   # Configure Cloudflare Workers AI & Tavily API keys
python -m worker.main
```

---

## Key Decisions 

1. **Curated + Autonomous Hybrid Model:** Top platforms (Google, Slack, GitHub, Salesforce, etc.) load instantly ($< 15\text{ms}$) via verified reference fixtures, while unfamiliar apps are dynamically researched in parallel by autonomous agents in under 69 seconds.
2. **Contamination Firewall:** If a user researches an app but pastes a URL from a different service (e.g., passing a Supabase doc link with a Loom query), the engine detects host mismatch and firewalls the input, preventing cross-provider hallucination.
3. **In-Context Copilot (`⌘J`) Slide-Over:** Instead of a generic floating bot, Copilot is an integrated 420px drawer grounded in vendor documentation and RFC 6749 parameters, answering provider gotchas directly alongside the runbook.
4. **Interactive Blocker Diagnostic Engine:** Rather than generic error messages, the "I'm Stuck" wizard provides side-by-side **Wrong ❌ vs Fixed ✅ code diffs** for the 6 most common OAuth runtime failures.
5. **Lightweight Developer Verification:** A clean 3-field profile (`Name`, `Company`, `Job Title`) that deters spam and saves developer leads to Supabase without sign-in friction.

---

## Limitations

1. **Third-Party Credential Generation:** The agent does not programmatically log into vendor consoles to generate Client Secrets on behalf of users. Doing so would violate vendor Terms of Service, compromise enterprise credentials, and break security boundaries. Instead, it guides the developer directly to the exact credential creation form.
2. **Vendor Console UI Redesigns:** While vendor OAuth API endpoints remain stable, developer console navigation occasionally changes. We mitigate this using automated weekly SHA-256 documentation drift monitors to alert maintainers.
3. **Proprietary Enterprise Single Sign-On:** This platform focuses strictly on OAuth 2.0 and OpenID Connect (OIDC). SAML 2.0 and SCIM enterprise federation require dedicated IT coordination and are transparently flagged under `/states`.
