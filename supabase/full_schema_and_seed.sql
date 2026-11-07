-- ============================================================
-- FULL MIGRATION SUITE & SEED DATA
-- Project: OAuth Setup Intelligence
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/brofyxeeqdxpuzggaiep/sql/new
-- ============================================================

-- ============================================================
-- STEP 1: TABLES
-- ============================================================

-- ── PROVIDERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS providers (
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
CREATE TABLE IF NOT EXISTS guide_versions (
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

CREATE INDEX IF NOT EXISTS guide_versions_provider_idx ON guide_versions(provider_id);
CREATE INDEX IF NOT EXISTS guide_versions_status_idx   ON guide_versions(status);

-- ── SOURCES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sources (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_version_id UUID REFERENCES guide_versions(id) ON DELETE CASCADE,
  final_url        TEXT NOT NULL,
  publisher        TEXT,
  retrieved_at     TIMESTAMPTZ NOT NULL,
  content_hash     TEXT NOT NULL,
  selected_passages TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS sources_guide_idx ON sources(guide_version_id);

-- ── CLAIMS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS claims (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_version_id UUID REFERENCES guide_versions(id) ON DELETE CASCADE,
  claim_ref        TEXT NOT NULL,
  text             TEXT NOT NULL,
  context          TEXT,
  evidence_status  TEXT NOT NULL DEFAULT 'unknown'
                   CHECK (evidence_status IN (
                     'documented','attempted','observed_working','estimated','unknown'
                   )),
  critical         BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS claims_guide_idx ON claims(guide_version_id);

-- ── CLAIM ↔ SOURCE join ────────────────────────────────────
CREATE TABLE IF NOT EXISTS claim_sources (
  claim_id          UUID REFERENCES claims(id) ON DELETE CASCADE,
  source_id         UUID REFERENCES sources(id) ON DELETE CASCADE,
  support_type      TEXT CHECK (support_type IN ('supports','contradicts','partial')),
  evidence_location TEXT,
  PRIMARY KEY (claim_id, source_id)
);

-- ── GENERATION JOBS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS generation_jobs (
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

CREATE INDEX IF NOT EXISTS generation_jobs_owner_idx  ON generation_jobs(owner_id);
CREATE INDEX IF NOT EXISTS generation_jobs_state_idx  ON generation_jobs(state);
CREATE INDEX IF NOT EXISTS generation_jobs_lease_idx  ON generation_jobs(lease_until) WHERE state = 'queued';

-- ── JOB EVENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_events (
  id           BIGSERIAL PRIMARY KEY,
  job_id       UUID REFERENCES generation_jobs(id) ON DELETE CASCADE,
  sequence     INTEGER NOT NULL,
  stage        TEXT NOT NULL,
  event_type   TEXT NOT NULL
               CHECK (event_type IN ('started','checkpoint','completed','failed','info')),
  safe_details JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_events_job_idx ON job_events(job_id, sequence);

-- ── REVIEWS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_version_id UUID REFERENCES guide_versions(id) NOT NULL,
  reviewer_id      UUID REFERENCES auth.users(id) NOT NULL,
  decision         TEXT NOT NULL
                   CHECK (decision IN ('approved','rejected','needs_changes')),
  notes            TEXT,
  reviewed_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── FEEDBACK ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_version_id UUID REFERENCES guide_versions(id),
  step_ref         TEXT,
  reporter_id      UUID REFERENCES auth.users(id),
  redacted_message TEXT,
  classification   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 2: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE providers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_versions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources            ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims             ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_sources      ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback           ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_providers') THEN
    CREATE POLICY "public_read_providers" ON providers FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_published_guides') THEN
    CREATE POLICY "public_read_published_guides" ON guide_versions FOR SELECT USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'owner_read_own_guide_drafts') THEN
    CREATE POLICY "owner_read_own_guide_drafts" ON guide_versions FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = created_by);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_sources_for_published') THEN
    CREATE POLICY "public_read_sources_for_published" ON sources FOR SELECT USING (
      EXISTS (SELECT 1 FROM guide_versions gv WHERE gv.id = sources.guide_version_id AND gv.status = 'published')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_claims_for_published') THEN
    CREATE POLICY "public_read_claims_for_published" ON claims FOR SELECT USING (
      EXISTS (SELECT 1 FROM guide_versions gv WHERE gv.id = claims.guide_version_id AND gv.status = 'published')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_claim_sources') THEN
    CREATE POLICY "public_read_claim_sources" ON claim_sources FOR SELECT USING (
      EXISTS (SELECT 1 FROM claims c JOIN guide_versions gv ON gv.id = c.guide_version_id WHERE c.id = claim_sources.claim_id AND gv.status = 'published')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'owner_select_own_jobs') THEN
    CREATE POLICY "owner_select_own_jobs" ON generation_jobs FOR SELECT USING (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'owner_insert_own_jobs') THEN
    CREATE POLICY "owner_insert_own_jobs" ON generation_jobs FOR INSERT WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'owner_read_own_job_events') THEN
    CREATE POLICY "owner_read_own_job_events" ON job_events FOR SELECT USING (
      EXISTS (SELECT 1 FROM generation_jobs gj WHERE gj.id = job_events.job_id AND gj.owner_id = auth.uid())
    );
  END IF;
END $$;

-- ============================================================
-- STEP 3: FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION enqueue_generation_job(
  p_query        TEXT,
  p_website      TEXT DEFAULT NULL,
  p_intent       JSONB DEFAULT '{}',
  p_idempotency  TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id      UUID := auth.uid();
  v_idem_key     TEXT := COALESCE(p_idempotency, gen_random_uuid()::TEXT);
  v_daily_count  INT;
  v_daily_cap    INT := 5;
  v_job          generation_jobs;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  IF LENGTH(TRIM(p_query)) < 2 THEN
    RAISE EXCEPTION 'invalid_query:too_short';
  END IF;

  IF LENGTH(p_query) > 200 THEN
    RAISE EXCEPTION 'invalid_query:too_long';
  END IF;

  SELECT COUNT(*) INTO v_daily_count
  FROM generation_jobs
  WHERE owner_id = v_user_id
    AND created_at > NOW() - INTERVAL '24 hours';

  IF v_daily_count >= v_daily_cap THEN
    RAISE EXCEPTION 'quota_exhausted:daily_cap_reached';
  END IF;

  SELECT * INTO v_job FROM generation_jobs WHERE idempotency_key = v_idem_key;
  IF FOUND THEN
    RETURN json_build_object(
      'job_id', v_job.id,
      'state', v_job.state,
      'status_url', '/jobs/' || v_job.id,
      'idempotent', true
    );
  END IF;

  INSERT INTO generation_jobs (owner_id, idempotency_key, input, state)
  VALUES (
    v_user_id,
    v_idem_key,
    jsonb_build_object(
      'query', TRIM(p_query),
      'website', TRIM(p_website),
      'intent', p_intent
    ),
    'queued'
  )
  RETURNING * INTO v_job;

  INSERT INTO job_events (job_id, sequence, stage, event_type, safe_details)
  VALUES (v_job.id, 0, 'queued', 'started', jsonb_build_object('query', TRIM(p_query)));

  RETURN json_build_object(
    'job_id', v_job.id,
    'state', v_job.state,
    'status_url', '/jobs/' || v_job.id,
    'idempotent', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION claim_next_job(
  p_worker_id    TEXT,
  p_lease_secs   INT DEFAULT 120
)
RETURNS TABLE (
  id              UUID,
  owner_id        UUID,
  idempotency_key TEXT,
  state           TEXT,
  input           JSONB,
  attempt         INTEGER,
  checkpoint      JSONB
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_job_id UUID;
BEGIN
  SELECT gj.id INTO v_job_id
  FROM generation_jobs gj
  WHERE (gj.state = 'queued' OR (
           gj.state NOT IN ('completed_draft','awaiting_review','published',
                            'needs_clarification','unsupported_or_unverified',
                            'failed','quota_exhausted')
           AND gj.lease_until IS NOT NULL
           AND gj.lease_until < NOW()
         ))
    AND gj.attempt < 3
  ORDER BY gj.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_job_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  UPDATE generation_jobs
  SET
    lease_owner = p_worker_id,
    lease_until = NOW() + (p_lease_secs || ' seconds')::INTERVAL,
    attempt     = generation_jobs.attempt + 1,
    state       = 'resolving',
    updated_at  = NOW()
  WHERE generation_jobs.id = v_job_id
  RETURNING
    generation_jobs.id,
    generation_jobs.owner_id,
    generation_jobs.idempotency_key,
    generation_jobs.state,
    generation_jobs.input,
    generation_jobs.attempt,
    generation_jobs.checkpoint;
END;
$$;

CREATE OR REPLACE FUNCTION update_job_state(
  p_job_id       UUID,
  p_state        TEXT,
  p_checkpoint   JSONB DEFAULT NULL,
  p_error_code   TEXT DEFAULT NULL,
  p_error_detail TEXT DEFAULT NULL,
  p_result_id    UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE generation_jobs
  SET
    state           = p_state,
    checkpoint      = COALESCE(p_checkpoint, checkpoint),
    error_code      = p_error_code,
    error_detail    = p_error_detail,
    result_guide_id = COALESCE(p_result_id, result_guide_id),
    lease_until     = CASE
                        WHEN p_state IN ('completed_draft','awaiting_review','published',
                                         'needs_clarification','unsupported_or_unverified',
                                         'failed','quota_exhausted')
                        THEN NULL
                        ELSE lease_until
                      END,
    updated_at      = NOW()
  WHERE id = p_job_id;
END;
$$;

CREATE OR REPLACE FUNCTION renew_job_lease(
  p_job_id     UUID,
  p_worker_id  TEXT,
  p_lease_secs INT DEFAULT 120
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_updated INT;
BEGIN
  UPDATE generation_jobs
  SET
    lease_until = NOW() + (p_lease_secs || ' seconds')::INTERVAL,
    updated_at  = NOW()
  WHERE id = p_job_id
    AND lease_owner = p_worker_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

CREATE OR REPLACE FUNCTION record_job_event(
  p_job_id       UUID,
  p_sequence     INT,
  p_stage        TEXT,
  p_event_type   TEXT,
  p_safe_details JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO job_events (job_id, sequence, stage, event_type, safe_details)
  VALUES (p_job_id, p_sequence, p_stage, p_event_type, p_safe_details);
END;
$$;

CREATE OR REPLACE FUNCTION save_researched_guide(
  p_slug             TEXT,
  p_display_name     TEXT,
  p_canonical_domain TEXT,
  p_aliases          TEXT[],
  p_official_domains TEXT[],
  p_content          JSONB,
  p_evidence_quality JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_provider_id UUID;
  v_version_id  UUID;
BEGIN
  -- Insert or update provider (protect curated providers from being overwritten)
  INSERT INTO providers (slug, display_name, canonical_domain, aliases, official_domains, is_curated)
  VALUES (p_slug, p_display_name, p_canonical_domain, p_aliases, p_official_domains, FALSE)
  ON CONFLICT (slug) DO UPDATE
    SET display_name     = EXCLUDED.display_name,
        canonical_domain = EXCLUDED.canonical_domain,
        aliases          = EXCLUDED.aliases,
        official_domains = EXCLUDED.official_domains
    WHERE providers.is_curated = FALSE
  RETURNING id INTO v_provider_id;

  IF v_provider_id IS NULL THEN
    SELECT id INTO v_provider_id FROM providers WHERE slug = p_slug;
  END IF;

  -- Insert or update guide version 1 as published
  INSERT INTO guide_versions (
    provider_id, version, schema_version, status, content, evidence_quality, checked_at, published_at
  )
  VALUES (
    v_provider_id, 1, '1.0', 'published', p_content, p_evidence_quality, NOW(), NOW()
  )
  ON CONFLICT (provider_id, version) DO UPDATE
    SET content          = EXCLUDED.content,
        evidence_quality = EXCLUDED.evidence_quality,
        checked_at       = NOW(),
        status           = 'published'
  RETURNING id INTO v_version_id;

  RETURN jsonb_build_object('success', true, 'provider_id', v_provider_id, 'version_id', v_version_id);
END;
$$;

-- ============================================================
-- STEP 4: SEED CURATED PROVIDERS
-- ============================================================

INSERT INTO providers (slug, display_name, canonical_domain, aliases, official_domains, is_curated, logo_url)
VALUES
  (
    'google',
    'Google',
    'accounts.google.com',
    ARRAY['google oauth', 'google identity', 'google cloud', 'gcp oauth'],
    ARRAY['developers.google.com', 'console.cloud.google.com'],
    TRUE,
    'https://www.google.com/favicon.ico'
  ),
  (
    'slack',
    'Slack',
    'slack.com',
    ARRAY['slack oauth', 'slack api', 'slack app'],
    ARRAY['api.slack.com', 'app.slack.com'],
    TRUE,
    'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png'
  ),
  (
    'github',
    'GitHub',
    'github.com',
    ARRAY['github oauth', 'github app', 'gh oauth'],
    ARRAY['docs.github.com', 'github.com/settings/developers'],
    TRUE,
    'https://github.githubassets.com/favicons/favicon.svg'
  ),
  (
    'salesforce',
    'Salesforce',
    'login.salesforce.com',
    ARRAY['salesforce oauth', 'connected app', 'sfdc oauth'],
    ARRAY['developer.salesforce.com', 'help.salesforce.com'],
    TRUE,
    'https://www.salesforce.com/favicon.ico'
  ),
  (
    'notion',
    'Notion',
    'api.notion.com',
    ARRAY['notion integration', 'notion api', 'notion oauth'],
    ARRAY['developers.notion.com'],
    TRUE,
    'https://www.notion.so/images/favicon.ico'
  )
ON CONFLICT (slug) DO UPDATE
SET
  display_name     = EXCLUDED.display_name,
  canonical_domain = EXCLUDED.canonical_domain,
  aliases          = EXCLUDED.aliases,
  official_domains = EXCLUDED.official_domains,
  is_curated       = EXCLUDED.is_curated,
  logo_url         = EXCLUDED.logo_url;

