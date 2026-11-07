-- ============================================================
-- Migration 0004 — Seed Curated Providers
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

