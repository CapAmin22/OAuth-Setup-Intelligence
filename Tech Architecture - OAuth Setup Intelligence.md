# OAuth Setup Intelligence

## *Technical Architecture & Prototype Implementation Plan*

Version 1.0 • 7 November 2026 • Implementation-ready design

Purpose: Build a working, source-grounded guide library and live research experience for developers registering OAuth applications. This document is a design specification, not evidence that the prototype or provider setup attempts have already been completed.

Budget position: \$0 service spend is feasible for a bounded demonstration within free allowances, using existing developer hardware for the research worker. Unlimited usage, guaranteed uptime, and production SLAs are not promised. Production-minded design is not the same as production-certified operation.

# **1\. Executive decision**

Build a research-and-guidance product, not an OAuth broker. Ship five manually validated provider guides, a live unfamiliar-provider research flow, immutable shareable guide versions, and an evidence panel. Use a deterministic workflow with bounded model calls rather than a collection of autonomous agents.

The PRD requests 5–10 curated guides, fresh generation within two minutes, citations and retrieval timestamps, low-confidence review, and blocker assistance. Treat these as targets to measure, not guarantees already achieved. \[R1\]

* Primary value: tell a developer what to do next, what could block launch, and which requirements are supported by evidence.  
* Non-goals: handling user OAuth tokens, acting as an authorization server, guaranteeing provider approval, and executing arbitrary authenticated browser actions.  
* Deliverables: working public experience, source repository, setup README, five reviewed guides, evaluation report, and a live generation demonstration.

# **2\. OAuth model and product scope**

Use three separate concepts in the UI: provider application registration (the developer-owned app identity); integration implementation (the callback, scopes, and token handling in the developer’s product); and end-user connection (an individual authorization). Do not imply that writing a guide implements any of these runtime integration components. Validate provider-specific distinctions against official documentation before publishing.

Managed OAuth availability is contextual: the platform, toolkit, scopes, and distribution policy can change the answer. Represent it as a platform-specific observation with a source and checked date, not a universal provider boolean. The assignment points to Composio’s directory as a research starting point; inspect it during implementation rather than treating directory presence as proof that every intended use case is supported.

## **Context intake**

* Provider name or website; clarify ambiguous matches before generating.  
* Requested capabilities, intended scopes, and read/write requirements.  
* Internal organization use versus external customer distribution.  
* Developer account/plan, organization admin access, environment, and current setup stage.  
* Optional existing error text after client-side and server-side secret redaction.

# **3\. Focused demonstration scope**

| Candidate | Scenario to investigate | Proof required before publication |
| :---- | :---- | :---- |
| **Google** | Testing versus production; requested scope impact | Current official consent/verification docs and recorded console attempt |
| **Slack** | Installation versus distribution/marketplace path | Official documentation identifying which review applies |
| **GitHub** | OAuth App versus GitHub App selection | Official app-type comparison and appropriate setup path |
| **Salesforce** | Current app model, org controls, administrator prerequisites | Current official documentation; avoid assuming legacy app creation remains available |
| **Notion or Linear** | External integration permissions and standard setup | Official OAuth documentation plus available account-level testing |
| **Unfamiliar provider** | Resolve identity and research live | Real-time source trail, unknowns, and safe failure if OAuth support is unverified |

These are deliberately varied research candidates, not verified findings about their current policies. No provider portal setup attempt was performed for this document. In the actual demo, record what succeeded, what was corrected, what required login, and what remained untested.

# **4\. Recommended stack**

| Component | MVP choice | Reason / boundary |
| :---- | :---- | :---- |
| **Web UI** | React \+ TypeScript \+ Vite; Tailwind and accessible component primitives | Static-first public app; avoid server-rendering complexity for the demo |
| **Hosting** | Cloudflare Pages static deployment, subject to current plan eligibility | Use provider subdomain; no purchased domain required; verify hosting limits before deployment |
| **Database / API** | Supabase Postgres, Auth and RLS | One primary datastore; generated API for public reviewed content and protected jobs |
| **Worker** | Python \+ httpx \+ Pydantic \+ psycopg; runs on existing developer machine | Long-running research without relying on an HTTP request lifetime |
| **Research** | Tavily Search and Extract; bounded direct HTTP retrieval where safe | Official-document discovery and extraction; every operation metered |
| **Model** | Cloudflare Workers AI through a server-side adapter | Free allocation exists; select an eligible text model and benchmark structured output \[R3\] |
| **Retrieval** | Postgres full-text search initially | Five to 100 guides do not justify mandatory embeddings |
| **Optional semantic RAG** | pgvector \+ versioned embedding adapter | Add only after evaluation shows lexical retrieval misses useful evidence |
| **Queue** | Postgres jobs with leases and atomic claims | No Redis or extra queue vendor required for MVP |
| **Validation** | Pydantic in worker; Zod in UI | Structured guide schema and explicit validation failures |
| **Tests / CI** | pytest, Vitest, Playwright, GitHub Actions | Unit, integration, security and UI regression coverage |
| **Observability** | Structured logs, job\_events table, admin dashboard | No secrets, raw user errors, or private browser content in logs |

This intentionally simplifies the earlier multi-vendor proposal. Redis, Kubernetes, a separate vector database, an agent framework, and multiple analytics vendors are not required. If the team prefers Next.js, keep it, but the research worker must still have an explicitly chosen execution environment.

# **5\. Zero-dollar deployment and limits**

Supabase documents a 500 MB free database and two active free projects; free projects may pause after a week of low activity. Cloudflare Workers AI documents 10,000 free neurons per day, with additional usage requiring a paid Workers plan. Tavily documents 1,000 free credits monthly. These are quota-bound allowances, not guarantees of a particular number of research jobs. \[R2\]\[R3\]\[R4\]

| Resource | Budget control | Exhaustion behavior |
| :---- | :---- | :---- |
| **Search/extraction** | Reserve a per-job credit ceiling using current endpoint pricing | Stop additional searches; return partial research, never silently fabricate |
| **LLM** | Bound input size, output tokens, calls and retries; meter model-specific usage | Queue or fail with quota\_exhausted; keep cached guides readable |
| **Database** | Limit stored text; retain selected supporting passages and hashes | Alert before capacity; export and prune transient records |
| **Worker** | One concurrent job initially; lease renewal and timeout | Queued state and honest worker-offline indicator |
| **Public endpoint** | Require sign-in for generation; per-user and global daily caps | 429 response and readable retry/reset information |
| **Spend** | Do not enable paid automatic fallback; deployment checklist checks billing settings | Remain unavailable rather than incur unapproved charges |

Hard trade-off: the hosted library can remain accessible while the local worker is offline, but new research cannot. Show this clearly. For an always-on unattended service, separately verify a hosted worker’s current free runtime and billing terms or fund hosting. Do not claim a fully managed, always-on production service at a guaranteed \$0.

Free-model access, extraction success, and provider pages can change. Test a clean deployment before the demonstration, restore paused projects, and use recorded fixtures only in a visibly labeled replay mode—not as fake live research.

# **6\. System architecture**

Browser → static web app → Supabase Auth / RLS-protected API  
                          → published guide versions  
                          → submit\_generation(input) database function  
Local worker → claim job → discover → fetch → extract → synthesize  
                         → validate → review decision → persist  
Browser ← poll job status/events ← durable Postgres records  
Cloudflare Workers AI \+ Tavily are called by worker only

Enqueue through a narrowly scoped database function that derives the caller identity, validates input, enforces quotas atomically, and returns a job ID. Do not expose a service-role key to the browser. Anonymous visitors can read published versions; authenticated users can read their own private research drafts.

## **Durable job execution**

* Claim one pending job transactionally with FOR UPDATE SKIP LOCKED; set lease\_owner, lease\_until and attempt number.  
* Persist a checkpoint after each stage; renew the lease during external calls and use bounded timeouts.  
* Deduplicate on normalized provider identity \+ intent hash \+ schema/pipeline version; reuse recent successful jobs only when context matches.  
* Reclaim expired leases; retry transient failures with exponential backoff and jitter; never retry unlimitedly.  
* Use idempotent writes and unique constraints because a crashed worker can repeat a stage.  
* Global concurrency is one initially; split discovery, retrieval and synthesis into independent workers only when queue metrics justify it.

# **7\. Research workflow**

| Stage | Implementation | Exit condition |
| :---- | :---- | :---- |
| **Resolve** | Normalize domain, match aliases, identify candidate official domains | Unique identity or clarification request |
| **Discover** | Search OAuth setup, app registration, scopes, distribution and review separately | Bounded candidate URLs with source origin |
| **Retrieve** | Fetch selected docs, record redirects, timestamp and content hash | Parsed evidence or explicit inaccessible-source finding |
| **Extract** | Typed facts with evidence spans; scopes and distribution context preserved | No provider-specific fact without evidence or unknown status |
| **Synthesize** | Generate a runbook strictly from extracted evidence | Schema-valid steps, prerequisites, blockers and citations |
| **Verify** | Check reference IDs, quotations, support, conflicts and critical unknowns | Quality report and publication gate |
| **Persist** | Save immutable guide version and evidence relationships | Private draft or reviewed publication |

Proposed initial resource budget per new-provider job: at most four discovery queries, six extracted pages, two synthesis/verification model calls, and one schema-repair attempt. These are engineering caps, not measured latency or cost claims. Permit partial results when the deadline expires.

Cached reads should serve immediately without a live search on the critical path. Schedule freshness checks separately and show last-checked dates. Target a useful first research result within two minutes; record p50/p95 latency and whether the result is complete, partial, or waiting on review. \[R1\]

## **Research failure modes**

* Name collision: request disambiguation rather than choosing silently.  
* No official OAuth evidence: report OAuth support unverified; do not force a guide.  
* Login-only docs or console: list the exact human handoff and missing evidence.  
* Conflicting pages: preserve both claims, dates and contexts; block publication on unresolved critical conflicts.  
* JavaScript-only pages: use extraction service first; optional local Playwright only for public documentation.  
* Prompt injection in source content: treat pages as untrusted data, never tool instructions or permission to perform actions.

# **8\. Evidence and publication policy**

Each material provider claim must have a source ID, a supporting passage or faithful factual paraphrase, retrieval timestamp, and context. A citation’s existence alone does not establish that it supports a claim. Preserve a small necessary passage and content hash; avoid copying entire proprietary documentation pages.

| Label | Meaning |
| :---- | :---- |
| **Documented** | Supported by current official documentation; not necessarily tested |
| **Attempted** | A setup step was actually attempted, with actor, time and outcome recorded |
| **Observed working** | A defined test succeeded; specify exact scope and environment |
| **Estimated** | Engineering effort estimate, with assumptions and author |
| **Unknown** | Missing, inaccessible or conflicting evidence |

Never convert the absence of review documentation into “no review required.” Keep active setup effort separate from external waiting time. Unknown wait is null/unknown, not zero. Official published turnaround information is descriptive unless explicitly contractual; do not label it a guaranteed SLA.

## **Confidence scoring**

Display an evidence-quality score, not a probability that the guide is correct. Proposed weights: critical-claim grounding 35, official-source coverage 25, completeness 20, freshness 10 and consistency 10\. Publish the rubric and field-level missing evidence. Calibrate with the evaluation set before presenting numeric confidence as useful.

Publication gate: human review for all initial curated guides and any low-evidence live guide. Critical unsupported setup/review claims, unresolved contradictions, or failed validation override the score and block public publication. Private drafts may be shown to the requesting user with clear warnings; public sharing remains disabled until approved. This preserves the PRD’s low-confidence review requirement. \[R1\]

# **9\. Retrieval and guide schema**

Start with lexical lookup over provider names, aliases, official URLs and evidence passages. Retrieval can find earlier research and useful guide structure, but must not transfer one provider’s requirements to another. Add embeddings only when a measured retrieval benchmark improves; record model ID and vector dimension in migrations instead of hard-coding a dimension unrelated to the chosen model.

GuideVersion {  
  id, providerId, version, schemaVersion, status, intent,  
  checkedAt, evidenceQuality, limitations\[\],  
  effort: { lowMinutes, highMinutes, assumptions\[\], basis },  
  externalWait: { status, publishedRange?, sourceIds\[\] },  
  prerequisites\[\], steps\[\], blockers\[\], claims\[\], sources\[\], attempts\[\]  
}  
Step { id, title, owner, instructions, completionCheck, claimIds\[\] }  
Claim { id, text, context, evidenceStatus, sourceIds\[\], critical }  
Source { id, url, publisher, retrievedAt, contentHash, evidencePassages\[\] }  
Attempt { stepId, actor, attemptedAt, outcome, environment, notes }

# **10\. Database and access model**

| Table | Key fields / constraints |
| :---- | :---- |
| **providers** | id; slug unique; canonical\_domain; aliases; official\_domains |
| **guide\_versions** | id; provider\_id; version; intent\_hash; schema\_version; status; content JSONB; unique(provider\_id, version) |
| **sources** | id; final\_url; retrieved\_at; content\_hash; publisher; selected\_passages |
| **claims** | id; guide\_version\_id; text; context; status; critical |
| **claim\_sources** | claim\_id \+ source\_id; support\_type; evidence\_location |
| **generation\_jobs** | id; owner\_id; idempotency\_key; state; lease\_owner; lease\_until; attempt; checkpoint; error\_code |
| **job\_events** | job\_id; sequence; stage; timestamp; safe\_details |
| **setup\_attempts** | guide\_version\_id; step\_id; actor; outcome; environment; attempted\_at |
| **feedback** | guide\_version\_id; step\_id; reporter\_id; redacted\_message; classification |
| **progress** | user\_id \+ guide\_version\_id; completed\_step\_ids; blocker\_code |
| **reviews** | guide\_version\_id; reviewer\_id; decision; notes; reviewed\_at |

RLS rules: anonymous users see only published guide versions and their safe supporting evidence; users see only their own jobs, drafts, progress and feedback; reviewers have explicit role-based access. Raw retrieval material and operational events are not public. Treat draft/published version selection as an authorization rule, not just a UI filter.

Keep public reviewed guides immutable. Publish a new version for corrections; display a latest-version pointer and stale warning on old permalinks. Export database backups before the demo and test restoration; do not assume a free plan supplies production-grade backup retention.

# **11\. API contract**

| Operation | Contract |
| :---- | :---- |
| **Search providers** | GET /providers?q=... → safe registry results |
| **Read guide** | GET /guides/{slug}/versions/{version} → published immutable version |
| **Start generation** | POST /generation → 202 with job\_id; authenticated; idempotency key |
| **Track generation** | GET /jobs/{id} → authorized state, stage, missing evidence and result reference |
| **Blocker help** | POST /blockers → cited diagnostics using guide context and redacted input |
| **Feedback** | POST /guides/{id}/feedback → authenticated accuracy report |
| **Export** | GET /guides/{id}/export.md → published content with citations and timestamps |
| **Review** | POST /admin/guides/{id}/review → role-gated publication decision |

These are logical API contracts. In the MVP, implement read queries through Supabase’s generated API and protected write operations through database functions; add a thin HTTP facade only if stable public endpoint paths are required. Enforce body limits, pagination, authentication, ownership and rate limits at the server boundary.

POST /generation  
{ "query": "Example SaaS", "website": "https\://example.com",  
  "intent": { "capabilities": \["read issues"\], "distribution": "external" } }

202 { "job\_id": "...", "state": "queued", "status\_url": "/jobs/..." }

Terminal states: completed\_draft \| awaiting\_review \| published \|  
needs\_clarification \| unsupported\_or\_unverified \| failed \| quota\_exhausted

# **12\. User experience**

* Home: provider search, five reviewed examples, live-generation input and worker status.  
* Intake: confirm provider identity, use case, distribution and existing progress.  
* Generation: show real stages, discovered source domains, elapsed time and partial-result state; no fake percentages.  
* Guide header: next action, evidence label, active effort, external wait, checked date and intended integration context.  
* Runbook: prerequisites, least-privilege scope rationale, app creation, redirects, test procedure, production path and blockers.  
* Evidence panel: source-backed claims, setup attempts, missing information, reviewer and version history.  
* Share/export: public immutable reviewed URL and Markdown download; private drafts require authorization.  
* Accessibility: keyboard operation, explicit text labels, adequate contrast, semantic headings and non-color-only status.

For progress, persist completed step IDs per user and guide version; flag when a new guide version invalidates a prior step. Blocker help should suggest a diagnostic sequence and completion check, not claim to inspect a console it cannot access.

# **13\. Security and agent boundaries**

* SSRF: permit HTTP(S) only; reject local/private/link-local/reserved destinations; revalidate redirects and DNS resolution; bound redirects, bytes, content types and timeouts. Prefer domain-validated extraction and restricted network egress.  
* Prompt injection: fetched text is data; no source may override system instructions, authorize tools or change destination domains.  
* Rendering: sanitize Markdown/HTML, block scripts and unsafe links, escape code, and use a restrictive content security policy.  
* Secrets: never request OAuth secrets/tokens/codes. Redact before storage/logging, warn users before submission, and do not claim redaction is infallible.  
* Authorization: service-role and AI/search keys stay in the worker environment; test RLS for cross-user access.  
* Automation: public-doc navigation and drafting only by default. Account creation, consent, terms, app changes, submissions and emails require explicit approval and a reviewed action preview.  
* Evidence honesty: never label an official-doc read as a completed setup attempt; never simulate a successful token exchange.  
* Privacy: minimize user data, specify retention and deletion, and document third-party processing; a design document does not establish legal compliance.

# **14\. Testing and evaluation**

| Area | Required checks |
| :---- | :---- |
| **Unit** | Provider normalization, context matching, schema validation, URL policy, redaction, evidence-ID integrity |
| **Integration** | Lease expiry/reclaim, duplicate submission, checkpoint resume, transient API failures and quota exhaustion |
| **Security** | Cross-user draft access, unauthenticated job creation, malicious redirects, injection in fetched text and unsafe Markdown |
| **End-to-end** | Search → reviewed guide → export; new provider → progress → draft → review → share |
| **Evidence quality** | Manually label critical claims as supported, contradicted, unsupported or unknown against exact sources |
| **Agent action fidelity** | Audit every attempted/tested badge against a real timestamped attempt record |
| **Performance** | Measure cached latency, research p50/p95, completion rate, token/search consumption and timeout causes |

Initial evaluation target: five guides with at least ten material claims each, plus three unfamiliar providers and negative cases for ambiguity/no OAuth evidence. Report supported-claim rate and critical errors separately. Do not advertise “90% accuracy” without specifying denominator, sampling and reviewer process. The PRD’s accuracy and latency numbers are targets, not measured outcomes. \[R1\]

Suggested acceptance gate: zero unsupported critical claims in published guides; all time estimates labeled; every attempted claim has a real log; all low-evidence output remains private pending review; no secrets in test logs; permission and quota tests pass. If two-minute generation is missed, show partial research honestly and document the measured result.

# **15\. Implementation plan**

| Stage | Deliverable | Exit test |
| :---- | :---- | :---- |
| **Days 1–2** | Repository, static UI, database migrations, RLS and five provider stubs | Published read and cross-user access tests pass |
| **Days 3–4** | Worker, durable jobs, retrieval, evidence extraction and typed output | New provider yields persisted evidence and recoverable job |
| **Days 5–6** | Guide synthesis, validation, review gates and exports | Unsupported critical claim blocks publication |
| **Days 7–8** | Five reviewed guides and recorded setup attempts where feasible | Reviewer checklist and correction log complete |
| **Days 9–10** | Blocker flow, security tests, quota handling, README and demo recording | Fresh unfamiliar-provider run and clean-install rehearsal pass |

This is an engineering estimate for one experienced builder, not a commitment. Provider review queues, account availability and unfamiliar portals may extend validation. Prioritize truthful evidence over expanding guide count.

# **16\. Repository and local setup**

apps/web/                 \# React UI  
services/research\_worker/  \# workflow, adapters, extraction, validation  
packages/contracts/       \# JSON Schema and generated types  
supabase/migrations/      \# tables, functions, RLS, indexes  
fixtures/                 \# labeled, non-secret evaluation cases  
docs/                     \# architecture, evidence policy, demo script  
tests/                    \# unit, security, integration, E2E

Proposed setup contract for the future repository (commands below become executable after implementation; no repository is supplied with this document):

1\. Install supported Node.js, Python, Git and Supabase tooling.  
2\. Copy .env.example to .env.local; configure public UI values only.  
3\. Apply database migrations and seed reviewed guides.  
4\. Install web dependencies; start the web development server.  
5\. Create Python environment; install worker dependencies.  
6\. Configure worker secrets; run the worker entrypoint.  
7\. Run unit/RLS/E2E tests; exercise one fresh research job.  
8\. Deploy the static UI and complete the budget/security checklist.

| Environment | Variables |
| :---- | :---- |
| **Public UI** | VITE\_SUPABASE\_URL; VITE\_SUPABASE\_ANON\_KEY (safe only with correct RLS) |
| **Worker only** | DATABASE\_URL; SUPABASE\_SERVICE\_ROLE\_KEY if necessary; TAVILY\_API\_KEY; CLOUDFLARE\_ACCOUNT\_ID; CLOUDFLARE\_API\_TOKEN |
| **Policy / limits** | MODEL\_ID; MAX\_CONCURRENT\_JOBS; MAX\_PAGES\_PER\_JOB; MAX\_MODEL\_CALLS; DAILY\_JOB\_CAP; LEASE\_SECONDS |

Prefer a least-privileged database worker role over a broad service key where practical. Never commit .env files. The README must document tested dependency versions, migration commands, seed provenance, deployment steps, account prerequisites and known limitations.

# **17\. Scaling and maintenance**

* To 100 guides: keep the same Postgres model; index provider lookups and published versions, paginate and cache reads.  
* When research volume grows: increase worker replicas with lease coordination, then separate retrieval and synthesis only if needed.  
* Refresh by risk: use a proposed seven-day check for approval-sensitive claims and a longer interval for stable setup facts; tune based on observed changes.  
* Detect changes using source hashes and conditional requests where supported; a changed page triggers review, not automatic acceptance of new policy.  
* Track queue delay, success rate, source failures, unsupported-claim rate, correction frequency, user-reported blockers and quota headroom.  
* Before production: fund reliable worker hosting, backups, alerting, incident response, model/search capacity, legal review and required service guarantees.

# **18\. Demo and submission checklist**

* Submit public experience URL and source repository URL, with no fabricated links.  
* Show a reviewed easy case, a conditional-approval case and an app-model-choice case.  
* Ask the reviewer for an unfamiliar provider; display real retrieval and evidence collection.  
* Demonstrate one inaccessible-source or unknown-policy case without hallucinating a solution.  
* Show one actual correction from the validation log and one unverified assumption.  
* Exercise blocker help and immutable share/export.  
* Disclose local-worker dependency, current free quotas, measured latency and what was not tested.  
* Include README, architecture decision records, evaluation report, test instructions and source provenance.

# **19\. Sources and verification boundaries**

External facts cited here were checked against the following official search results on 7 November 2026\. Search-result evidence is not a substitute for reading the complete current terms during deployment. No live provider-console, model quality, latency or end-to-end setup test was performed for this document.

\[R1\] User attachment: Agent-Driven-OAuth-App-Guide-Generator-PRD.docx. Product requirements, review policy, milestones and target metrics.

\[R2\] Supabase, “How much does a database-only Supabase project cost?” https\://supabase.com/kb/faqs/platform/database-only-cost — free database allowance, active project count and low-activity pause.

\[R3\] Cloudflare, Workers AI pricing. https\://developers.cloudflare.com/workers-ai/platform/pricing/ — 10,000-neuron daily free allocation and paid-plan requirement above it.

\[R4\] Tavily official API specification, pricing section. https\://docs.tavily.com/documentation/api-reference/openapi.json — 1,000 free credits per month and paid credit options.

\[R5\] Cloudflare Workers pricing and limits. https\://developers.cloudflare.com/workers/platform/pricing/ and https\://developers.cloudflare.com/workers/platform/limits/ — free CPU/runtime constraints; reason not to assume arbitrary background jobs fit a free request handler.

\[R6\] Assignment-provided research starting point, not revalidated provider-by-provider here: https\://docs.composio.dev/toolkits/managed-auth .

All architectures, schemas, budgets, scoring weights and schedules in this document are proposed engineering decisions. They require implementation and benchmarking. Provider-specific statements in the demonstration matrix are research questions, not established current policy.

---

