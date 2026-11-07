-- ============================================================
-- Migration 0002 — Row-Level Security Policies
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

-- ── PROVIDERS: anyone can read ─────────────────────────────
CREATE POLICY "public_read_providers"
  ON providers FOR SELECT USING (true);

-- ── GUIDE VERSIONS: published = public; draft = owner only ─
CREATE POLICY "public_read_published_guides"
  ON guide_versions FOR SELECT
  USING (status = 'published');

CREATE POLICY "owner_read_own_guide_drafts"
  ON guide_versions FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "reviewer_read_awaiting_guides"
  ON guide_versions FOR SELECT
  USING (
    status = 'awaiting_review'
    AND auth.jwt() ->> 'user_role' = 'reviewer'
  );

CREATE POLICY "reviewer_update_guide_status"
  ON guide_versions FOR UPDATE
  USING (auth.jwt() ->> 'user_role' = 'reviewer');

-- ── SOURCES: visible for published guides ──────────────────
CREATE POLICY "public_read_sources_for_published"
  ON sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM guide_versions gv
      WHERE gv.id = sources.guide_version_id
        AND gv.status = 'published'
    )
  );

CREATE POLICY "owner_read_sources_for_own_draft"
  ON sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM guide_versions gv
      WHERE gv.id = sources.guide_version_id
        AND gv.created_by = auth.uid()
    )
  );

-- ── CLAIMS: same visibility as sources ─────────────────────
CREATE POLICY "public_read_claims_for_published"
  ON claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM guide_versions gv
      WHERE gv.id = claims.guide_version_id
        AND gv.status = 'published'
    )
  );

CREATE POLICY "owner_read_claims_for_own_draft"
  ON claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM guide_versions gv
      WHERE gv.id = claims.guide_version_id
        AND gv.created_by = auth.uid()
    )
  );

-- ── CLAIM_SOURCES: inherit from claims ─────────────────────
CREATE POLICY "public_read_claim_sources"
  ON claim_sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM claims c
        JOIN guide_versions gv ON gv.id = c.guide_version_id
      WHERE c.id = claim_sources.claim_id
        AND gv.status = 'published'
    )
  );

-- ── GENERATION JOBS ─────────────────────────────────────────
CREATE POLICY "owner_select_own_jobs"
  ON generation_jobs FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "owner_insert_own_jobs"
  ON generation_jobs FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Workers use service role key — no RLS policy needed for worker writes.
-- Reviewer can see awaiting_review jobs
CREATE POLICY "reviewer_read_awaiting_jobs"
  ON generation_jobs FOR SELECT
  USING (
    state IN ('awaiting_review','completed_draft')
    AND auth.jwt() ->> 'user_role' = 'reviewer'
  );

-- ── JOB EVENTS: users see events for their own jobs ─────────
CREATE POLICY "owner_read_own_job_events"
  ON job_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM generation_jobs gj
      WHERE gj.id = job_events.job_id
        AND gj.owner_id = auth.uid()
    )
  );

-- ── REVIEWS: reviewer role only ─────────────────────────────
CREATE POLICY "reviewer_manage_reviews"
  ON reviews FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'reviewer');

-- ── FEEDBACK: authenticated users can submit ────────────────
CREATE POLICY "auth_insert_feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = reporter_id);

CREATE POLICY "reviewer_read_feedback"
  ON feedback FOR SELECT
  USING (auth.jwt() ->> 'user_role' = 'reviewer');

