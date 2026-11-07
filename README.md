# OAuth Setup Intelligence

> Developer runbooks and live, source-grounded AI research for OAuth 2.0 app registration, scopes, and approval processes.

[![Vercel Deployment Ready](https://img.shields.io/badge/Vercel-Deployment%20Ready-black?style=flat&logo=vercel)](https://vercel.com)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3ecf8e?style=flat&logo=supabase)](https://supabase.com)
[![Workers AI](https://img.shields.io/badge/Cloudflare-Workers%20AI-f38020?style=flat&logo=cloudflare)](https://developers.cloudflare.com/workers-ai/)

---

## 🚀 Overview

Setting up and getting approval for third-party OAuth apps is filled with fragmentation, unverified forum answers, and approval surprises. **OAuth Setup Intelligence** solves this through:

1. **Curated & Grounded Runbooks:** Pre-verified integration guides for Google, Slack, GitHub, Salesforce, and Notion with effort estimates, scopes, and redirect rules.
2. **Autonomous Research Worker:** A Python worker that discovers official documentation via Tavily, extracts typed OAuth facts via Cloudflare Workers AI (`Llama 3.1 8B`), and synthesizes cited runbooks with evidence scoring.
3. **Evidence Panel & Citations:** Every critical assertion links directly to official provider documentation with content hashes.

---

## 📂 Project Structure

```
.
├── apps/
│   └── web/                   # React + TypeScript + Vite + Tailwind UI
│       ├── src/
│       │   ├── components/    # Header, SearchBar, ProviderCard, RunbookStep, EvidencePanel
│       │   ├── pages/         # Home, Library, Guide Detail, Intake, Job State, Reviewer
│       │   └── lib/           # Supabase client + API adapters (with offline fallback)
│       └── package.json
│
├── services/
│   └── research_worker/       # Python Autonomous Research Worker
│       ├── worker/
│       │   ├── adapters/      # Cloudflare Workers AI & Tavily adapters
│       │   ├── stages/        # Resolve → Discover → Retrieve → Extract → Synthesize → Verify
│       │   ├── job_runner.py  # Concurrency-safe lease renewal & state transitions
│       │   └── main.py        # Polling worker daemon
│       └── seed_guides.py     # Database seeder for curated fixtures
│
├── fixtures/                  # Hand-verified reference runbooks (JSON)
├── packages/contracts/        # GuideVersion JSON Schema
├── supabase/                  # Database migrations & consolidated schema
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

Open [http://localhost:3000](http://localhost:3000) in your browser.

To produce a production build:
```bash
npm run build
```

### 2. Autonomous Research Worker

```bash
cd services/research_worker
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install httpx pydantic python-dotenv
python -m worker.main
```

---

## 🌐 Deploying to Vercel

This repository is pre-configured for one-click deployment to **Vercel**:

1. Push this repo to your GitHub account (already linked to `CapAmin22/OAuth-Setup-Intelligence`).
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **"Add New Project"**.
3. Import `OAuth-Setup-Intelligence`.
4. Configure the project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (or `apps/web`)
   - **Build Command:** `cd apps/web && npm install && npm run build` (handled automatically by `vercel.json`)
   - **Output Directory:** `apps/web/dist`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`: `https://brofyxeeqdxpuzggaiep.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_z2rHiIeGJWwd75IjfVwdVg_aLDszx_T`
6. Click **Deploy**! 🚀

---

## 🧪 Testing

Run the automated pipeline test suite:

```bash
python -m unittest tests/unit/test_worker_pipeline.py
```
