-- ============================================================
-- Migration 0001 — Core Tables
-- OAuth Setup Intelligence
-- Run: supabase db push  OR paste into Supabase SQL editor
-- ============================================================

-- ── PROVIDERS ──────────────────────────────────────────────
CREATE TABLE providers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT UNIQUE NOT NULL,
  display_name     TEXT NOT NULL,
  canonical_domain TEXT,
  aliases          TEXT[] DEFAULT '{}',
  official_domains TEXT[] DEFAULT '{}',
  is_curated       BOOLEAN DEFAULT FALSE,
  logo_url         TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS providers_display_name_idx ON providers (display_name);
CREATE INDEX IF NOT EXISTS providers_aliases_idx ON providers USING GIN (aliases);

-- ── GUIDE VERSIONS ─────────────────────────────────────────
CREATE TABLE guide_versions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id      UUID REFERENCES providers(id) NOT NULL,
  version          INTEGER NOT NULL DEFAULT 1,
  schema_version   TEXT NOT NULL DEFAULT '1.0',
  intent_hash      TEXT,
  status           TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN (
                     'draft','awaiting_review','published',
                     'needs_clarification','unsupported_or_unverified','failed'
                   )),
  content          JSONB NOT NULL,
  evidence_quality JSONB,
  checked_at       TIMESTAMPTZ,
  published_at     TIMESTAMPTZ,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (provider_id, version)
);

CREATE INDEX guide_versions_provider_idx ON guide_versions(provider_id);
CREATE INDEX guide_versions_status_idx   ON guide_versions(status);

-- ── SOURCES ────────────────────────────────────────────────
CREATE TABLE sources (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_version_id UUID REFERENCES guide_versions(id) ON DELETE CASCADE,
  final_url        TEXT NOT NULL,
  publisher        TEXT,
  retrieved_at     TIMESTAMPTZ NOT NULL,
  content_hash     TEXT NOT NULL,
  selected_passages TEXT[] DEFAULT '{}'
);

CREATE INDEX sources_guide_idx ON sources(guide_version_id);

-- ── CLAIMS ─────────────────────────────────────────────────
CREATE TABLE claims (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_version_id UUID REFERENCES guide_versions(id) ON DELETE CASCADE,
  claim_ref        TEXT NOT NULL,            -- e.g. "claim-1" (matches content JSONB)
  text             TEXT NOT NULL,
  context          TEXT,
  evidence_status  TEXT NOT NULL DEFAULT 'unknown'
                   CHECK (evidence_status IN (
                     'documented','attempted','observed_working','estimated','unknown'
                   )),
  critical         BOOLEAN DEFAULT FALSE
);

CREATE INDEX claims_guide_idx ON claims(guide_version_id);

-- ── CLAIM ↔ SOURCE join ────────────────────────────────────
CREATE TABLE claim_sources (
  claim_id          UUID REFERENCES claims(id) ON DELETE CASCADE,
  source_id         UUID REFERENCES sources(id) ON DELETE CASCADE,
  support_type      TEXT CHECK (support_type IN ('supports','contradicts','partial')),
  evidence_location TEXT,
  PRIMARY KEY (claim_id, source_id)
);

-- ── GENERATION JOBS ────────────────────────────────────────
CREATE TABLE generation_jobs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         UUID REFERENCES auth.users(id) NOT NULL,
  idempotency_key  TEXT UNIQUE NOT NULL,
  state            TEXT NOT NULL DEFAULT 'queued'
                   CHECK (state IN (
                     'queued','resolving','discovering','retrieving',
                     'extracting','synthesizing','verifying','persisting',
                     'completed_draft','awaiting_review','published',
                     'needs_clarification','unsupported_or_unverified',
                     'failed','quota_exhausted'
                   )),
  input            JSONB NOT NULL,
  result_guide_id  UUID REFERENCES guide_versions(id),
  lease_owner      TEXT,
  lease_until      TIMESTAMPTZ,
  attempt          INTEGER DEFAULT 0,
  checkpoint       JSONB DEFAULT '{}',
  error_code       TEXT,
  error_detail     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX generation_jobs_owner_idx  ON generation_jobs(owner_id);
CREATE INDEX generation_jobs_state_idx  ON generation_jobs(state);
CREATE INDEX generation_jobs_lease_idx  ON generation_jobs(lease_until) WHERE state = 'queued';

-- ── JOB EVENTS ─────────────────────────────────────────────
CREATE TABLE job_events (
  id           BIGSERIAL PRIMARY KEY,
  job_id       UUID REFERENCES generation_jobs(id) ON DELETE CASCADE,
  sequence     INTEGER NOT NULL,
  stage        TEXT NOT NULL,
  event_type   TEXT NOT NULL
               CHECK (event_type IN ('started','checkpoint','completed','failed','info')),
  safe_details JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX job_events_job_idx ON job_events(job_id, sequence);

-- ── REVIEWS ────────────────────────────────────────────────
CREATE TABLE reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_version_id UUID REFERENCES guide_versions(id) NOT NULL,
  reviewer_id      UUID REFERENCES auth.users(id) NOT NULL,
  decision         TEXT NOT NULL
                   CHECK (decision IN ('approved','rejected','needs_changes')),
  notes            TEXT,
  reviewed_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── FEEDBACK ───────────────────────────────────────────────
CREATE TABLE feedback (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_version_id UUID REFERENCES guide_versions(id),
  step_ref         TEXT,
  reporter_id      UUID REFERENCES auth.users(id),
  redacted_message TEXT,
  classification   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

