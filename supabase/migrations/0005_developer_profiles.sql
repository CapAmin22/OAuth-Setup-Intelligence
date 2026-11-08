-- ============================================================
-- Migration 0005 — Verified Developer Profiles
-- OAuth Setup Intelligence
-- Run in Supabase SQL Editor or via Supabase CLI
-- ============================================================

CREATE TABLE IF NOT EXISTS developer_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  email               TEXT UNIQUE NOT NULL,
  company             TEXT NOT NULL,
  linkedin_url        TEXT NOT NULL,
  role                TEXT DEFAULT 'Software Engineer',
  verification_score  INTEGER DEFAULT 100,
  verified_at         TIMESTAMPTZ DEFAULT NOW(),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index for high-speed email lookups
CREATE INDEX IF NOT EXISTS dev_profiles_email_idx ON developer_profiles(email);
CREATE INDEX IF NOT EXISTS dev_profiles_company_idx ON developer_profiles(company);

-- Enable Row Level Security
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anonymous clients to register verified profiles
CREATE POLICY "public_insert_developer_profiles"
  ON developer_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "public_update_developer_profiles"
  ON developer_profiles FOR UPDATE
  USING (true);

CREATE POLICY "public_read_developer_profiles"
  ON developer_profiles FOR SELECT
  USING (true);

