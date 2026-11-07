-- ============================================================
-- Migration 0003 — Database Stored Functions
-- Concurrency-safe job queue protocol
-- ============================================================

-- ── 1. ENQUEUE GENERATION JOB (called from UI via Supabase RPC)
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

  -- Rolling 24-hour daily quota check
  SELECT COUNT(*) INTO v_daily_count
  FROM generation_jobs
  WHERE owner_id = v_user_id
    AND created_at > NOW() - INTERVAL '24 hours';

  IF v_daily_count >= v_daily_cap THEN
    RAISE EXCEPTION 'quota_exhausted:daily_cap_reached';
  END IF;

  -- Return existing job if idempotency key matches
  SELECT * INTO v_job FROM generation_jobs WHERE idempotency_key = v_idem_key;
  IF FOUND THEN
    RETURN json_build_object(
      'job_id', v_job.id,
      'state', v_job.state,
      'status_url', '/jobs/' || v_job.id,
      'idempotent', true
    );
  END IF;

  -- Enqueue new job
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

  -- Record initial event
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

-- ── 2. CLAIM NEXT JOB (called by Python worker) ────────────
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
  -- Atomically pick oldest queued job or job with expired lease
  SELECT gj.id INTO v_job_id
  FROM generation_jobs gj
  WHERE (gj.state = 'queued' OR (
           gj.state NOT IN ('completed_draft','awaiting_review','published',
                            'needs_clarification','unsupported_or_unverified',
                            'failed','quota_exhausted')
           AND gj.lease_until IS NOT NULL
           AND gj.lease_until < NOW()
         ))
    AND gj.attempt < 3  -- max 3 retry attempts
  ORDER BY gj.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_job_id IS NULL THEN
    RETURN;
  END IF;

  -- Claim the lease
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

-- ── 3. UPDATE JOB STATE (called by Python worker) ──────────
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

-- ── 4. RENEW JOB LEASE (called during long external calls) ─
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

-- ── 5. RECORD JOB EVENT (helper for worker audit log) ──────
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

