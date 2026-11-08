import { GuideVersion } from '../types';

export interface CopilotQA {
  id: string;
  question: string;
  category: 'problems' | 'tokens' | 'redirects' | 'scopes' | 'security' | 'general' | 'steps' | 'errors' | 'endpoints';
  answer: string;
  codeSnippet?: string;
  sourceUrl: string;
  sourceTitle: string;
  followUps?: string[];
}

export type CopilotIntent =
  | 'problems_and_pitfalls'
  | 'token_refresh_and_expiry'
  | 'redirect_and_localhost'
  | 'scopes_and_permissions'
  | 'registration_and_portal'
  | 'code_snippet_and_endpoints'
  | 'error_troubleshooting'
  | 'general_faq';

// Specific real-world developer gotchas and pitfalls per provider
export const PROVIDER_TOP_PROBLEMS: Record<
  string,
  {
    title: string;
    points: { heading: string; detail: string; fix?: string }[];
    proTip: string;
    followUps: string[];
    sourceUrl: string;
    sourceTitle: string;
  }
> = {
  supabase: {
    title: 'Top 3 Integration Pitfalls for Supabase OAuth 2.0',
    points: [
      {
        heading: 'Management API vs. GoTrue End-User Auth Confusion',
        detail:
          'The most frequent mistake is using Supabase OAuth 2.0 for standard customer logins. Supabase OAuth 2.0 is built exclusively for the Management API (authorizing developer tools to manage organizations, projects, edge functions, and databases). For authenticating users into your web or mobile app, use Supabase Auth (GoTrue client SDKs) with JWTs instead.',
        fix: 'If building a SaaS tool or developer CLI that provisions Supabase resources, use OAuth 2.0. If authenticating app users, use @supabase/supabase-js createClient() with signInWithOAuth().',
      },
      {
        heading: 'Strict Exact HTTPS Redirect URI Matching',
        detail:
          'Supabase validates callback URLs using exact byte-for-byte comparison. A missing trailing slash, protocol discrepancy (http vs https), or unregistered staging port immediately causes an invalid redirect URI error.',
        fix: 'Register all environment callbacks (e.g. http://localhost:3000/api/auth/callback/supabase and https://app.example.com/api/auth/callback/supabase) in your Supabase Account > OAuth Apps dashboard.',
      },
      {
        heading: 'HTTP Basic Auth Required for Token Exchange',
        detail:
          'When exchanging the authorization code at https://api.supabase.com/v1/oauth/token, client credentials must be passed via the HTTP Basic Authorization header (Authorization: Basic base64(client_id:client_secret)) with application/x-www-form-urlencoded content. Placing credentials only in JSON body will fail with 401 Unauthorized.',
        fix: 'Include "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64") in your POST headers.',
      },
    ],
    proTip:
      'Always test token exchange with a clean incognito session to ensure refresh token issuance is functioning properly before deploying to production.',
    followUps: [
      'Show Supabase token exchange code',
      'Where do I create an OAuth App in Supabase?',
      'When should I use Supabase OAuth vs Supabase Auth (GoTrue)?',
    ],
    sourceUrl: 'https://supabase.com/docs/guides/platform/oauth-apps',
    sourceTitle: 'Supabase Platform OAuth Documentation',
  },

  airtable: {
    title: 'Top 3 Integration Gotchas for Airtable OAuth 2.0',
    points: [
      {
        heading: 'Mandatory PKCE (RFC 7636) for All Clients',
        detail:
          'Unlike older OAuth implementations, Airtable strictly mandates Proof Key for Code Exchange (PKCE) for ALL clients. You must generate a cryptographically random code_verifier (43–128 chars), compute its SHA-256 code_challenge, and pass code_challenge_method=S256 in the authorization URL. Omitting PKCE causes an immediate 400 Bad Request.',
        fix: 'Generate code_verifier using crypto.randomBytes(32), hash with SHA-256 base64url, and pass both during the flow.',
      },
      {
        heading: 'Mandatory Refresh Token Rotation on Every Call',
        detail:
          'Airtable rotates refresh tokens on every single refresh request. When exchanging a refresh token at /oauth2/v1/token, Airtable invalidates the old refresh token and returns a new one. If your database does not atomically store the newly issued refresh token, subsequent refresh attempts will fail and force the user to re-authenticate.',
        fix: 'Persist data.refresh_token immediately upon successful response in a database transaction with row locking.',
      },
      {
        heading: 'Strict API Rate Limit (5 requests/second per base)',
        detail:
          'Airtable enforces a hard limit of 5 requests per second per base across all API keys and OAuth tokens. Exceeding this returns a 429 status code with a mandatory 30-second backoff penalty.',
        fix: 'Implement an in-memory or Redis token bucket queue (e.g. Bottleneck) with 5 req/s max throughput.',
      },
    ],
    proTip:
      'Airtable access tokens expire in exactly 60 minutes. Set up automated background refresh before token expiry.',
    followUps: [
      'Does Airtable require PKCE for OAuth 2.0?',
      'How do refresh tokens work in Airtable?',
      'What are Airtable OAuth and API rate limits?',
    ],
    sourceUrl: 'https://airtable.com/developers/web/api/oauth-reference',
    sourceTitle: 'Airtable OAuth 2.0 Reference',
  },

  google: {
    title: 'Top 3 Integration Pitfalls for Google OAuth 2.0',
    points: [
      {
        heading: 'Missing Refresh Token on Subsequent Logins',
        detail:
          'Google only issues a refresh_token on the very first time a user consents. On subsequent authorizations, Google returns only an access_token unless you explicitly provide both access_type=offline AND prompt=consent in the authorization URL.',
        fix: 'Include params.set("access_type", "offline") and params.set("prompt", "consent") when building your Google authorization URL.',
      },
      {
        heading: 'Sensitive & Restricted Scopes Verification Gate',
        detail:
          'Requesting sensitive scopes (e.g. Calendar, Drive, Gmail) requires Google Cloud OAuth App Verification and CASA Tier 2 security review before public production launch. In unverified mode, Google displays an unverified app banner and limits testing to 100 whitelisted accounts.',
        fix: 'Start with least-privilege scopes (openid email profile) and apply for Google OAuth verification early if sensitive scopes are required.',
      },
      {
        heading: 'Prohibition of Localhost Wildcards',
        detail:
          'Google Cloud Console permits http://localhost:3000 for local development, but strictly prohibits wildcards (http://localhost:*) or dynamic query parameters on the redirect URI.',
        fix: 'Explicitly whitelist http://localhost:3000/api/auth/callback/google in Google Cloud Console Credentials.',
      },
    ],
    proTip:
      'Use incremental authorization (include_granted_scopes=true) so users only grant basic access initially.',
    followUps: [
      'How do I force Google to return a refresh token?',
      'Does Google allow HTTP localhost redirect URIs?',
      'What is incremental authorization in Google OAuth?',
    ],
    sourceUrl: 'https://developers.google.com/identity/protocols/oauth2/web-server',
    sourceTitle: 'Google Identity Documentation',
  },

  googlecalendar: {
    title: 'Top 3 Integration Pitfalls for Google Calendar OAuth',
    points: [
      {
        heading: 'Sensitive Scope Classification (calendar.readonly / calendar)',
        detail:
          'Google classifies Google Calendar scopes as Sensitive. During development, apps remain in "Testing" status in GCP Console, which restricts logins exclusively to manually whitelisted test email addresses. Deploying publicly without Google Trust & Safety verification will block external users.',
        fix: 'Add all developer and tester email addresses under Google Cloud Console > OAuth Consent Screen > Test Users.',
      },
      {
        heading: 'Offline Sync Requires Explicit Consent Prompt',
        detail:
          'To synchronize calendars in background cron jobs, your server requires a persistent refresh token. If you omit prompt=consent from the initial authorization redirect, subsequent authentications return only an access_token (which expires in 1 hour).',
        fix: 'Always pass access_type=offline and prompt=consent during calendar connect redirects.',
      },
      {
        heading: 'Strict Localhost and Port Rules',
        detail:
          'Google Cloud Console allows http://localhost:PORT without HTTPS, but the exact port must match what is registered in the console. Using a dynamic dev server port (e.g. 5173 vs 3000) causes an immediate redirect URI mismatch.',
        fix: 'Pin your local dev server port in vite.config.ts or package.json scripts (e.g. vite --port 3000).',
      },
    ],
    proTip:
      'Use webhook push notifications (channels.watch) rather than polling calendar events to avoid hitting Google API quota limits.',
    followUps: [
      'Are Google Calendar scopes sensitive or restricted?',
      'How do I get a continuous refresh token for Calendar sync?',
      'How do I force Google to return a refresh token?',
    ],
    sourceUrl:
      'https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scopes',
    sourceTitle: 'Google Calendar API Security Guidelines',
  },

  slack: {
    title: 'Top 3 Integration Pitfalls for Slack OAuth 2.0',
    points: [
      {
        heading: 'Bot Tokens vs. User Tokens (xoxb- vs. xoxp-)',
        detail:
          'Slack splits OAuth into Bot Scopes (which install a bot user with an xoxb- token) and User Scopes (which act on behalf of the individual user with an xoxp- token). Requesting the wrong token type causes unexpected permission errors when posting messages or reading channels.',
        fix: 'For background automations and bot posts, request bot scopes and save the xoxb- token. For user-specific actions, request user scopes.',
      },
      {
        heading: 'HTTPS Strict Requirement (No plain HTTP even on local)',
        detail:
          'Slack strictly disallows plain HTTP redirect URIs, even for local development. Using http://localhost:3000 will be rejected when creating your Slack App.',
        fix: 'Use an SSL proxy or tunnel like ngrok (https://xyz.ngrok-free.app/api/auth/callback/slack) or Cloudflare Tunnel during local development.',
      },
      {
        heading: 'Multi-Workspace Distribution Activation',
        detail:
          'By default, Slack apps are locked to the development workspace where they were created. To allow external Slack workspaces to install your app, you must navigate to "Manage Distribution" and activate public distribution.',
        fix: 'Enable Public Distribution in the Slack App Manifest and provide standard privacy policy & support URLs.',
      },
    ],
    proTip:
      'Store the incoming team.id alongside the bot token so your multi-tenant backend knows which workspace credentials to load.',
    followUps: [
      'What is the difference between Bot tokens and User tokens in Slack?',
      'Does Slack allow HTTP localhost redirect URIs?',
      'How do I request multiple scopes in Slack?',
    ],
    sourceUrl: 'https://api.slack.com/authentication/oauth-v2',
    sourceTitle: 'Slack OAuth v2 Documentation',
  },

  discord: {
    title: 'Top 3 Integration Pitfalls for Discord OAuth2',
    points: [
      {
        heading: 'Bot Invitation vs. User OAuth Authorization Flow',
        detail:
          'Inviting a bot to a Discord server uses the bot and applications.commands scopes with a calculated permissions bitmask, while logging a user into your app uses identify and email scopes. Mixing these flows confuses users with unintended server permission prompts.',
        fix: 'Use separate URL builders for "Add Discord Bot to Server" vs. "Log in with Discord".',
      },
      {
        heading: 'PKCE Required for Public Clients',
        detail:
          'Discord supports and expects RFC 7636 PKCE for public clients (mobile apps, single page applications). Failing to provide code_challenge can expose your authorization flow to code interception.',
        fix: 'Include code_challenge and code_challenge_method=S256 in all client-side initiated requests.',
      },
      {
        heading: 'Aggressive Rate Limits on Token Endpoint',
        detail:
          'Discord enforces strict per-route and global rate limits (50 requests per second globally). Calling /api/oauth2/token in high-concurrency bursts will trigger 429 rate limit errors with retry_after headers.',
        fix: 'Queue token exchanges on your backend and cache access tokens in Redis until their expires_in expiration.',
      },
    ],
    proTip:
      'Discord access tokens expire in 604,800 seconds (7 days). Store the refresh token to renew credentials automatically.',
    followUps: [
      'Does Discord OAuth2 support PKCE for public clients?',
      'How do I generate a Discord Bot invite URL with scopes?',
      'What are Discord token endpoint rate limits?',
    ],
    sourceUrl: 'https://discord.com/developers/docs/topics/oauth2',
    sourceTitle: 'Discord Developer Documentation: OAuth2',
  },

  spotify: {
    title: 'Top 3 Integration Pitfalls for Spotify OAuth 2.0',
    points: [
      {
        heading: 'Authorization Header Basic Auth Format',
        detail:
          'Spotify requires passing client credentials in the Authorization header as HTTP Basic base64(client_id:client_secret). Supplying them in the POST body without the header fails with 400 Bad Request.',
        fix: 'Set headers: { "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64") }.',
      },
      {
        heading: 'Short Token Lifetime (3,600 Seconds)',
        detail:
          'Spotify access tokens expire in exactly 1 hour. Streaming apps must proactively monitor expiration and rotate tokens using grant_type=refresh_token.',
        fix: 'Save token timestamp and refresh 5 minutes before expiration.',
      },
      {
        heading: 'Strict Exact Redirect URI Registration',
        detail:
          'Spotify Developer Dashboard requires verbatim redirect URIs. Wildcards or mismatched ports will immediately reject authorization.',
        fix: 'Register every local port and staging domain explicitly in the Spotify Dashboard.',
      },
    ],
    proTip:
      'For mobile and Single Page Apps, use Spotify Authorization Code Flow with PKCE to avoid bundling client secrets.',
    followUps: [
      'Does Spotify require Basic Auth for token exchange?',
      'What is the token expiration lifetime for Spotify?',
      'Does Spotify support PKCE for mobile apps?',
    ],
    sourceUrl: 'https://developer.spotify.com/documentation/web-api/tutorials/code-flow',
    sourceTitle: 'Spotify Developer Documentation',
  },

  microsoft: {
    title: 'Top 3 Integration Pitfalls for Microsoft Entra ID (Azure AD)',
    points: [
      {
        heading: 'Multi-Tenant (/common) vs Single-Tenant (/{tenant-id}) Mismatch',
        detail:
          'Using https://login.microsoftonline.com/common with an app registered as "Accounts in this organizational directory only" triggers AADSTS50194 or AADSTS700016. If your app only serves your company, replace /common with your specific Tenant ID or domain.',
        fix: 'Use /common for multi-tenant SaaS apps with personal/work accounts; use /{tenant-id} or /organizations for single-tenant or business-only apps.',
      },
      {
        heading: 'Admin Consent Blocking (AADSTS65001)',
        detail:
          'Sensitive Microsoft Graph permissions (e.g. Directory.ReadWrite.All, Mail.ReadWrite) require an Entra ID Tenant Administrator to grant tenant-wide consent before non-admin users can sign in.',
        fix: 'Have a Tenant Administrator click "Grant admin consent for {Tenant}" in Microsoft Entra Admin Center > App registrations > API permissions.',
      },
      {
        heading: 'Missing offline_access Scope for Refresh Tokens',
        detail:
          'Microsoft Identity Platform v2.0 does NOT issue refresh tokens unless the "offline_access" scope is explicitly requested in the authorization URL.',
        fix: 'Include "offline_access" alongside "User.Read" and "openid" in your space-delimited scope string.',
      },
    ],
    proTip:
      'Microsoft access tokens expire in 60 to 90 minutes. Always request offline_access and store the refresh token securely.',
    followUps: [
      'What is the difference between /common and /{tenant-id} endpoints?',
      'How do I fix AADSTS65001 admin consent required error?',
      'Show Microsoft Entra ID token exchange code',
    ],
    sourceUrl: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-overview',
    sourceTitle: 'Microsoft Identity Platform Documentation',
  },

  x: {
    title: 'Top 3 Integration Pitfalls for X (Twitter) API v2 OAuth 2.0',
    points: [
      {
        heading: 'Mandatory PKCE (RFC 7636) Enforcement',
        detail:
          'X API v2 strictly mandates PKCE for all authorization code flows. Omitting code_challenge and code_challenge_method=S256 in the authorization URL immediately results in an invalid_request error.',
        fix: 'Generate a random code_verifier (43-128 chars), compute its SHA-256 base64url code_challenge, and pass code_challenge_method=S256.',
      },
      {
        heading: 'HTTP Basic Auth Header Required for Confidential Clients',
        detail:
          'When exchanging authorization codes at https://api.twitter.com/2/oauth2/token, confidential clients must pass client credentials in the HTTP Basic Authorization header (Authorization: Basic base64(client_id:client_secret)). Putting them in the body results in 401 Unauthorized.',
        fix: 'Set Authorization: Basic Buffer.from(`${clientId}:${clientSecret}`).toString("base64") in request headers.',
      },
      {
        heading: 'Automatic Refresh Token Rotation',
        detail:
          'Every time you refresh an access token with grant_type=refresh_token, X issues a NEW refresh token and invalidates the previous one immediately.',
        fix: 'Always update your database with the new refresh_token returned in the response payload upon every refresh request.',
      },
    ],
    proTip:
      'X user-context access tokens expire in 7,200 seconds (2 hours). Always request offline.access scope to get a refresh token.',
    followUps: [
      'Does X (Twitter) OAuth 2.0 require PKCE?',
      'How does X refresh token rotation work?',
      'Show X OAuth 2.0 token exchange code',
    ],
    sourceUrl: 'https://developer.x.com/en/docs/authentication/oauth-2-0',
    sourceTitle: 'X Developer Platform: OAuth 2.0',
  },

  zoho: {
    title: 'Top 3 Integration Gotchas for Zoho Accounts OAuth 2.0',
    points: [
      {
        heading: 'Multi-Datacenter Domain Routing Requirement',
        detail:
          'Zoho operates in strict isolated regional data centers (.com for US, .eu for Europe, .in for India, .com.au for Australia, .jp for Japan). If an Indian user tries to authenticate against accounts.zoho.com, authentication fails with "invalid_client".',
        fix: 'Use the domain matching the user\'s Zoho account data center (e.g. accounts.zoho.eu for European users, accounts.zoho.in for Indian users).',
      },
      {
        heading: 'Mandatory access_type=offline and prompt=consent',
        detail:
          'Zoho only returns a refresh_token if BOTH access_type=offline AND prompt=consent are present in the authorization URL query parameters.',
        fix: 'Append access_type=offline&prompt=consent to https://accounts.zoho.com/oauth/v2/auth.',
      },
      {
        heading: 'Strict 10-Minute Authorization Code Expiration',
        detail:
          'Zoho authorization codes expire exactly 10 minutes after issuance and are single-use. Any delay or replay fails with "invalid_code".',
        fix: 'Exchange the code immediately upon receiving the redirect callback in your backend handler.',
      },
    ],
    proTip:
      'Zoho access tokens expire in 3,600 seconds (1 hour). Use the refresh token to silently obtain fresh access tokens.',
    followUps: [
      'How do I handle Zoho multi-datacenter domains (.com, .eu, .in)?',
      'How do I force Zoho to return a refresh token?',
      'Show Zoho token exchange code',
    ],
    sourceUrl: 'https://www.zoho.com/accounts/protocol/oauth.html',
    sourceTitle: 'Zoho Accounts OAuth 2.0 Documentation',
  },

  loom: {
    title: 'Top 3 Integration Pitfalls for Loom OAuth & Developer SDK',
    points: [
      {
        heading: 'RecordSDK vs Standard REST API OAuth',
        detail:
          'Loom provides both the RecordSDK (for client-side screen recording in your app) and REST APIs (for managing videos). Client-side RecordSDK uses public application keys with verified origins, whereas REST API integrations use server-side OAuth 2.0.',
        fix: 'For in-app screen recording, configure domain origins in Loom Developer Settings. For video data sync, use OAuth 2.0 authorization code flow.',
      },
      {
        heading: 'Domain Whitelisting for Web Recording',
        detail:
          'Loom blocks recording SDK initialization on unwhitelisted domains or local development origins.',
        fix: 'Whitelisted localhost:3000 and your production URL in Loom Developer Portal settings.',
      },
      {
        heading: 'Atlassian Cloud Centralized Identity',
        detail:
          'Following Loom\'s acquisition by Atlassian, new enterprise integrations manage credentials via Atlassian Cloud Developer Console.',
        fix: 'Ensure your app callback URL is authorized in your Atlassian / Loom developer workspace.',
      },
    ],
    proTip:
      'Always verify your redirect URI and allowed origins in the Loom developer console before initiating user flows.',
    followUps: [
      'Where do I configure allowed domains in Loom?',
      'How do I embed the Loom RecordSDK with OAuth?',
      'Show Loom token exchange code',
    ],
    sourceUrl: 'https://docs.loom.com',
    sourceTitle: 'Loom Developer Documentation',
  },

  odoo: {
    title: 'Top 3 Integration Pitfalls for Odoo OAuth 2.0',
    points: [
      {
        heading: 'Multi-Database Routing (db Parameter Requirement)',
        detail:
          'Odoo instances commonly manage multiple databases on a single domain. If the database name is not explicitly passed as a query parameter (db={database_name}) during the authorization redirect, Odoo will redirect the user to a database selector or fail with an invalid session context.',
        fix: 'Include db: process.env.ODOO_DATABASE in your authorization request parameters or provide an instance selector for end users.',
      },
      {
        heading: 'OAuth Provider Module Activation in Technical Settings',
        detail:
          'Unlike consumer OAuth providers with standalone developer portals, Odoo requires enabling OAuth in the Odoo admin backend under Settings > General Settings > Integrations (or installing the auth_oauth / web_oauth2 module in Technical Settings).',
        fix: 'Log into Odoo as an Administrator, activate Developer Mode, and verify the OAuth Providers configuration under Settings > Technical > OAuth Providers.',
      },
      {
        heading: 'Strict Exact Redirect URI Whitelisting',
        detail:
          'Odoo validates callback URLs against the Allowed Redirect URIs entered in the OAuth Provider configuration. Any mismatch between http and https, trailing slashes, or staging domain port numbers causes an immediate access_denied redirect.',
        fix: 'Ensure your app callback URL (e.g., http://localhost:3000/api/auth/callback/odoo and production URL) is explicitly added to the Odoo provider record.',
      },
    ],
    proTip:
      'When performing ORM operations (CRM leads, Sales, Accounting) after OAuth login, use the verified user session with Odoo\'s JSON-RPC / External API endpoints (/jsonrpc or /xmlrpc/2/object).',
    followUps: [
      'What are the OAuth 2.0 endpoints for Odoo?',
      'How do I configure OAuth Providers in Odoo?',
      'Why is the db parameter required in Odoo OAuth?',
    ],
    sourceUrl: 'https://www.odoo.com/documentation/17.0/applications/general/auth/oauth.html',
    sourceTitle: 'Odoo OAuth 2.0 Documentation',
  },

  autonoma: {
    title: 'Top 3 Setup & Authentication Pitfalls for Autonoma AI',
    points: [
      {
        heading: 'Better Auth Google OAuth & Secret Configuration',
        detail:
          'Autonoma uses Better Auth powered by Google OAuth. Omitting BETTER_AUTH_SECRET or mismatching the Google Cloud Console redirect URI (e.g. http://localhost:3000/api/auth/callback/google) immediately throws a session verification exception during login.',
        fix: 'Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and a strong BETTER_AUTH_SECRET in your .env file, and whitelist http://localhost:3000/api/auth/callback/google in Google Cloud Console.',
      },
      {
        heading: 'Mandatory GEMINI_API_KEY for Agentic Test Execution',
        detail:
          'Autonoma\'s agent core (@autonoma-ai/planner and engine-web) leverages Google Gemini for autonomous screen navigation and multi-step reasoning. Without GEMINI_API_KEY, test plan generation and browser executions will fail.',
        fix: 'Provide a valid Google AI Studio GEMINI_API_KEY in your server environment.',
      },
      {
        heading: 'Postgres & Redis Infrastructure Prerequisites',
        detail:
          'Autonoma depends on PostgreSQL (with Prisma migrations) and Redis for Temporal workflow workers. Initiating auth sessions without running migrations leads to database connection errors.',
        fix: 'Run docker compose up -d followed by pnpm db:migrate before starting the web UI or API.',
      },
    ],
    proTip:
      'For local E2E testing with Autonoma, run pnpm dev to launch both the Hono API and Vite UI in unified development mode.',
    followUps: [
      'What OAuth providers does Autonoma support?',
      'How do I configure Google OAuth for Autonoma?',
      'What environment variables are required for Autonoma?',
    ],
    sourceUrl: 'https://github.com/autonoma-ai/autonoma',
    sourceTitle: 'Autonoma Architecture & Repository Documentation',
  },
};

export const PROVIDER_SEED_FAQS: Record<string, CopilotQA[]> = {
  google: [
    {
      id: 'g-refresh-token',
      question: 'How do I force Google to return a refresh token?',
      category: 'tokens',
      answer:
        'Google only issues a refresh_token on the first user authorization unless you pass both access_type=offline and prompt=consent in the authorization URL. If prompt=consent is omitted on subsequent logins, only an access_token is returned.',
      codeSnippet: `// Force refresh token issuance in authorization URL
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
authUrl.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI!);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'openid email profile');
authUrl.searchParams.set('access_type', 'offline'); // Required for refresh token
authUrl.searchParams.set('prompt', 'consent');      // Forces consent re-prompt to return refresh_token`,
      sourceUrl: 'https://developers.google.com/identity/protocols/oauth2/web-server#creatingclient',
      sourceTitle: 'Google Identity Documentation',
      followUps: ['Does Google allow HTTP localhost redirect URIs?', 'What is incremental authorization in Google OAuth?'],
    },
    {
      id: 'g-localhost-rules',
      question: 'Does Google allow HTTP localhost redirect URIs?',
      category: 'redirects',
      answer:
        'Yes. Google Cloud Console explicitly permits HTTP redirect URIs if and only if the host is localhost (e.g. http://localhost:3000/api/auth/callback/google) or 127.0.0.1. Wildcards or trailing slashes on localhost are prohibited.',
      codeSnippet: `// Allowed by Google Console:
http://localhost:3000/api/auth/callback/google
http://127.0.0.1:8080/auth/callback

// Prohibited by Google Console:
http://localhost/*             (no wildcards allowed)
http://localhost:3000/callback/ (no trailing slash if not registered)`,
      sourceUrl: 'https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation',
      sourceTitle: 'Google OAuth URI Validation Specs',
      followUps: ['How do I force Google to return a refresh token?', 'What is incremental authorization in Google OAuth?'],
    },
    {
      id: 'g-incremental-auth',
      question: 'What is incremental authorization in Google OAuth?',
      category: 'scopes',
      answer:
        'Incremental authorization allows your app to request basic scopes first and then request sensitive or restricted scopes later when needed. Include include_granted_scopes=true in the authorization URL to preserve previously approved permissions.',
      codeSnippet: `// Incremental authorization parameter
authUrl.searchParams.set('include_granted_scopes', 'true');
authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.readonly');`,
      sourceUrl: 'https://developers.google.com/identity/protocols/oauth2/web-server#incrementalAuth',
      sourceTitle: 'Google Incremental Authorization Specs',
      followUps: ['How do I force Google to return a refresh token?', 'What is the lifetime of Google access tokens?'],
    },
    {
      id: 'g-token-lifetime',
      question: 'What is the lifetime of Google access tokens?',
      category: 'tokens',
      answer:
        'Google OAuth access tokens expire after exactly 3,599 seconds (1 hour). Use the refresh_token via a POST to https://oauth2.googleapis.com/token with grant_type=refresh_token to obtain a new access_token.',
      codeSnippet: `// Refreshing an expired Google token
const res = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    refresh_token: savedRefreshToken,
    grant_type: 'refresh_token',
  }),
});`,
      sourceUrl: 'https://developers.google.com/identity/protocols/oauth2/web-server#offline',
      sourceTitle: 'Google Token Expiration Docs',
      followUps: ['How do I force Google to return a refresh token?', 'Does Google allow HTTP localhost redirect URIs?'],
    },
  ],

  discord: [
    {
      id: 'd-pkce-support',
      question: 'Does Discord OAuth2 support PKCE for public clients?',
      category: 'security',
      answer:
        'Yes. Discord supports Proof Key for Code Exchange (RFC 7636). Public clients (mobile, SPA) should provide code_challenge and code_challenge_method=S256 in the authorization request, and pass code_verifier during token exchange.',
      codeSnippet: `// Discord Authorization Request with PKCE
const authUrl = new URL('https://discord.com/api/oauth2/authorize');
authUrl.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID!);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('code_challenge', base64UrlSha256(verifier));
authUrl.searchParams.set('code_challenge_method', 'S256');
authUrl.searchParams.set('scope', 'identify email');`,
      sourceUrl: 'https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-pkce-style',
      sourceTitle: 'Discord Developer Documentation: PKCE',
      followUps: ['How do I generate a Discord Bot invite URL with scopes?', 'What are Discord token endpoint rate limits?'],
    },
    {
      id: 'd-bot-invite',
      question: 'How do I generate a Discord Bot invite URL with scopes?',
      category: 'scopes',
      answer:
        'To invite a bot, construct an authorization URL containing client_id, scope=bot applications.commands, and a numeric permissions bitmask calculated from the Discord Developer Portal.',
      codeSnippet: `// Discord Bot Installation URL
const botUrl = new URL('https://discord.com/api/oauth2/authorize');
botUrl.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID!);
botUrl.searchParams.set('scope', 'bot applications.commands');
botUrl.searchParams.set('permissions', '2048'); // Send Messages permission
botUrl.searchParams.set('redirect_uri', process.env.DISCORD_REDIRECT_URI!);
botUrl.searchParams.set('response_type', 'code');`,
      sourceUrl: 'https://discord.com/developers/docs/topics/oauth2#bot-authorization-flow',
      sourceTitle: 'Discord Bot Authorization Guide',
      followUps: ['Does Discord OAuth2 support PKCE for public clients?', 'What are Discord token endpoint rate limits?'],
    },
    {
      id: 'd-rate-limits',
      question: 'What are Discord token endpoint rate limits?',
      category: 'general',
      answer:
        'Discord enforces a rate limit of 5 requests per second per IP on the token endpoint, with a global rate limit of 50 requests per second. Always inspect X-RateLimit-Remaining and X-RateLimit-Reset headers.',
      sourceUrl: 'https://discord.com/developers/docs/topics/rate-limits',
      sourceTitle: 'Discord API Rate Limits',
      followUps: ['Does Discord OAuth2 support PKCE for public clients?', 'How do I generate a Discord Bot invite URL with scopes?'],
    },
  ],

  slack: [
    {
      id: 's-bot-vs-user',
      question: 'What is the difference between Bot tokens and User tokens in Slack?',
      category: 'tokens',
      answer:
        'Slack distinguishes between bot tokens (prefix xoxb-) and user tokens (prefix xoxp-). Bot tokens represent your app bot user and are recommended for background automations. User tokens represent an individual person and execute actions on their behalf.',
      codeSnippet: `// Identifying token types
const isBotToken = token.startsWith('xoxb-');  // App bot identity
const isUserToken = token.startsWith('xoxp-'); // Delegated user identity`,
      sourceUrl: 'https://api.slack.com/authentication/token-types',
      sourceTitle: 'Slack Token Types Overview',
      followUps: ['Does Slack allow HTTP localhost redirect URIs?', 'How do I request multiple scopes in Slack?'],
    },
    {
      id: 's-localhost',
      question: 'Does Slack allow HTTP localhost redirect URIs?',
      category: 'redirects',
      answer:
        'No. Slack strictly enforces HTTPS for all OAuth redirect URLs, even during local testing. Use an SSL tunnel such as ngrok or Cloudflare Tunnel to expose your local server over HTTPS.',
      codeSnippet: `// Allowed by Slack App Settings:
https://xyz-subdomain.ngrok-free.app/api/auth/callback/slack
https://app.example.com/api/auth/callback/slack

// Prohibited by Slack:
http://localhost:3000/api/auth/callback/slack (HTTP is rejected)`,
      sourceUrl: 'https://api.slack.com/authentication/oauth-v2#redirect_urls',
      sourceTitle: 'Slack Redirect URI Requirements',
      followUps: ['What is the difference between Bot tokens and User tokens in Slack?', 'How do I request multiple scopes in Slack?'],
    },
    {
      id: 's-multiple-scopes',
      question: 'How do I request multiple scopes in Slack?',
      category: 'scopes',
      answer:
        'Slack uses comma-separated scope values, unlike Google or Discord which use space-separated scopes. Use user_scope for user permissions and scope for bot permissions.',
      codeSnippet: `// Slack Scopes Request Format
const params = new URLSearchParams({
  client_id: process.env.SLACK_CLIENT_ID!,
  scope: 'chat:write,channels:read,users:read', // Bot scopes (comma-separated)
  user_scope: 'identity.basic,identity.email',   // User scopes (comma-separated)
  redirect_uri: process.env.SLACK_REDIRECT_URI!,
});`,
      sourceUrl: 'https://api.slack.com/authentication/oauth-v2#asking',
      sourceTitle: 'Slack Scopes Formatting Guide',
      followUps: ['What is the difference between Bot tokens and User tokens in Slack?', 'Does Slack allow HTTP localhost redirect URIs?'],
    },
  ],

  github: [
    {
      id: 'gh-user-agent',
      question: 'Why does GitHub API return 403 Forbidden on token requests?',
      category: 'security',
      answer:
        'GitHub requires a mandatory User-Agent header on all HTTP requests to its API and OAuth endpoints. Omitting the User-Agent header results in an immediate 403 Forbidden response.',
      codeSnippet: `// Mandatory User-Agent header
const res = await fetch('https://github.com/login/oauth/access_token', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'MyOAuthApp/1.0.0 (contact@example.com)',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ client_id, client_secret, code }),
});`,
      sourceUrl: 'https://docs.github.com/en/rest/overview/resources-in-the-rest-api#user-agent-required',
      sourceTitle: 'GitHub API User-Agent Policy',
      followUps: ['How are scopes separated in GitHub OAuth?', 'GitHub OAuth App vs GitHub App: which should I use?'],
    },
    {
      id: 'gh-scope-delimiter',
      question: 'How are scopes separated in GitHub OAuth?',
      category: 'scopes',
      answer:
        'GitHub accepts either comma-delimited or space-delimited scope lists in the authorization URL. Standard practice is comma-delimited (e.g. scope=read:user,user:email).',
      sourceUrl: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps',
      sourceTitle: 'GitHub OAuth Scopes Documentation',
      followUps: ['Why does GitHub API return 403 Forbidden on token requests?', 'GitHub OAuth App vs GitHub App: which should I use?'],
    },
    {
      id: 'gh-app-vs-oauth',
      question: 'GitHub OAuth App vs GitHub App: which should I use?',
      category: 'general',
      answer:
        'For modern integrations, prefer GitHub Apps over legacy OAuth Apps. GitHub Apps use fine-grained repository permissions, have separate higher rate limits (5,000 req/hr per installation), and support short-lived installation access tokens.',
      sourceUrl: 'https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps',
      sourceTitle: 'GitHub Apps Architecture Guide',
      followUps: ['Why does GitHub API return 403 Forbidden on token requests?', 'How are scopes separated in GitHub OAuth?'],
    },
  ],

  spotify: [
    {
      id: 'sp-basic-auth',
      question: 'Does Spotify require Basic Auth for token exchange?',
      category: 'security',
      answer:
        'Yes. Spotify Web API token endpoint requires client credentials passed via Authorization: Basic base64(client_id:client_secret) header in POST requests to https://accounts.spotify.com/api/token.',
      codeSnippet: `const authHeader = 'Basic ' + Buffer.from(\`\${clientId}:\${clientSecret}\`).toString('base64');
const res = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: {
    'Authorization': authHeader,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri,
  }),
});`,
      sourceUrl: 'https://developer.spotify.com/documentation/web-api/tutorials/code-flow',
      sourceTitle: 'Spotify Authorization Code Flow',
      followUps: ['What is the token expiration lifetime for Spotify?', 'Does Spotify support PKCE for mobile apps?'],
    },
    {
      id: 'sp-token-lifetime',
      question: 'What is the token expiration lifetime for Spotify?',
      category: 'tokens',
      answer: 'Spotify access tokens expire after exactly 3,600 seconds (1 hour). Use the refresh token to renew credentials.',
      sourceUrl: 'https://developer.spotify.com/documentation/web-api/tutorials/code-flow#request-an-access-token',
      sourceTitle: 'Spotify Access Token Expiration',
      followUps: ['Does Spotify require Basic Auth for token exchange?', 'Does Spotify support PKCE for mobile apps?'],
    },
    {
      id: 'sp-pkce-mobile',
      question: 'Does Spotify support PKCE for mobile apps?',
      category: 'security',
      answer:
        'Yes. Spotify provides Authorization Code Flow with PKCE specifically for mobile and desktop applications where storing a client secret securely is impossible.',
      sourceUrl: 'https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow',
      sourceTitle: 'Spotify PKCE Flow Documentation',
      followUps: ['Does Spotify require Basic Auth for token exchange?', 'What is the token expiration lifetime for Spotify?'],
    },
  ],

  linear: [
    {
      id: 'lin-actor',
      question: 'How do actor modes work in Linear OAuth?',
      category: 'scopes',
      answer:
        'Linear allows specifying actor=application to authorize an app that acts with its own identity, or omitting it for default user-delegated authorization.',
      sourceUrl: 'https://developers.linear.app/docs/oauth/authentication',
      sourceTitle: 'Linear Developer Docs',
      followUps: ['What scopes are available in Linear?'],
    },
  ],

  notion: [
    {
      id: 'notion-basic',
      question: 'How does Notion authenticate client credentials during token exchange?',
      category: 'security',
      answer:
        'Notion requires HTTP Basic Authorization header (Authorization: Basic base64(client_id:client_secret)) and JSON formatted POST payload with grant_type: "authorization_code".',
      codeSnippet: `// Notion Token Exchange Payload
const authHeader = 'Basic ' + Buffer.from(\`\${clientId}:\${clientSecret}\`).toString('base64');
await fetch('https://api.notion.com/v1/oauth/token', {
  method: 'POST',
  headers: {
    'Authorization': authHeader,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri,
  }),
});`,
      sourceUrl: 'https://developers.notion.com/docs/authorization',
      sourceTitle: 'Notion Authorization Guide',
      followUps: ['Does Notion support refresh tokens?'],
    },
  ],

  zoom: [
    {
      id: 'zoom-basic',
      question: 'Does Zoom require Basic Auth for exchanging authorization code?',
      category: 'security',
      answer:
        'Yes. Zoom App Marketplace requires Authorization: Basic base64(client_id:client_secret) for exchanging the code at https://zoom.us/oauth/token.',
      sourceUrl: 'https://developers.zoom.us/docs/internal-apps/oauth-with-zoom/',
      sourceTitle: 'Zoom OAuth Guide',
      followUps: ['What are Zoom OAuth token expiration times?'],
    },
  ],

  airtable: [
    {
      id: 'at-pkce',
      question: 'Does Airtable require PKCE for OAuth 2.0?',
      category: 'security',
      answer:
        'Yes. Airtable strictly mandates Proof Key for Code Exchange (RFC 7636 PKCE) for all OAuth 2.0 clients. You must include code_challenge and code_challenge_method=S256 in the authorization request, and pass code_verifier in the token exchange POST request.',
      codeSnippet: `// Airtable Authorization URL with PKCE
const authUrl = new URL('https://airtable.com/oauth2/v1/authorize');
authUrl.searchParams.set('client_id', process.env.AIRTABLE_CLIENT_ID!);
authUrl.searchParams.set('redirect_uri', process.env.AIRTABLE_REDIRECT_URI!);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'data.records:read data.records:write schema.bases:read');
authUrl.searchParams.set('code_challenge', base64UrlSha256(codeVerifier));
authUrl.searchParams.set('code_challenge_method', 'S256');`,
      sourceUrl: 'https://airtable.com/developers/web/api/oauth-reference',
      sourceTitle: 'Airtable OAuth 2.0 Reference',
      followUps: ['How do refresh tokens work in Airtable?', 'What are Airtable OAuth and API rate limits?'],
    },
    {
      id: 'at-refresh-rotation',
      question: 'How do refresh tokens work in Airtable?',
      category: 'tokens',
      answer:
        'Airtable rotates refresh tokens on every single refresh request. When exchanging a refresh token at /oauth2/v1/token, Airtable invalidates the old refresh token and returns a brand new one. Always persist the latest refresh token in your database. Refresh tokens expire after 60 days of inactivity.',
      codeSnippet: `// Airtable Refresh Token Exchange
const res = await fetch('https://airtable.com/oauth2/v1/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + Buffer.from(\`\${clientId}:\${clientSecret}\`).toString('base64'),
  },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: currentRefreshToken,
  }),
});
const data = await res.json();
// Store data.refresh_token immediately! Old token is now invalid.`,
      sourceUrl: 'https://airtable.com/developers/web/api/oauth-reference#refreshing-tokens',
      sourceTitle: 'Airtable Token Refresh & Rotation Guide',
      followUps: ['Does Airtable require PKCE for OAuth 2.0?', 'What are Airtable OAuth and API rate limits?'],
    },
    {
      id: 'at-rate-limits',
      question: 'What are Airtable OAuth and API rate limits?',
      category: 'general',
      answer:
        'Airtable enforces a rate limit of 5 requests per second per base. If exceeded, the API returns a 429 status code with a 30-second backoff recommendation.',
      sourceUrl: 'https://airtable.com/developers/web/api/rate-limits',
      sourceTitle: 'Airtable API Rate Limits',
      followUps: ['Does Airtable require PKCE for OAuth 2.0?', 'How do refresh tokens work in Airtable?'],
    },
  ],

  supabase: [
    {
      id: 'sb-portal-location',
      question: 'Where do I create an OAuth App in Supabase?',
      category: 'general',
      answer:
        'Go to your Supabase Dashboard: click your Avatar (bottom left) > Organization or Account Settings > OAuth Apps. Click "Add new application", enter your Application Name and Redirect URI. Supabase immediately provides your Client ID and Client Secret.',
      sourceUrl: 'https://supabase.com/docs/guides/platform/oauth-apps',
      sourceTitle: 'Supabase OAuth Apps Documentation',
      followUps: ['What are the OAuth 2.0 endpoints for Supabase?', 'When should I use Supabase OAuth vs Supabase Auth (GoTrue)?'],
    },
    {
      id: 'sb-endpoints',
      question: 'What are the OAuth 2.0 endpoints for Supabase?',
      category: 'tokens',
      answer:
        'Supabase OAuth operates against the Supabase Management API: Authorization endpoint is https://api.supabase.com/v1/oauth/authorize and Token endpoint is https://api.supabase.com/v1/oauth/token.',
      codeSnippet: `// Supabase Token Exchange
const res = await fetch('https://api.supabase.com/v1/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + Buffer.from(\`\${clientId}:\${clientSecret}\`).toString('base64'),
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.SUPABASE_REDIRECT_URI!,
  }),
});`,
      sourceUrl: 'https://supabase.com/docs/reference/api/oauth',
      sourceTitle: 'Supabase Management API Reference',
      followUps: ['Where do I create an OAuth App in Supabase?', 'When should I use Supabase OAuth vs Supabase Auth (GoTrue)?'],
    },
    {
      id: 'sb-use-case',
      question: 'When should I use Supabase OAuth vs Supabase Auth (GoTrue)?',
      category: 'scopes',
      answer:
        'Use Supabase OAuth 2.0 when you are building developer tools, CLI utilities, or integrations that need to manage Supabase projects, databases, and resources on behalf of a Supabase user. For end-user authentication in your consumer app, use Supabase Auth (GoTrue client SDKs).',
      sourceUrl: 'https://supabase.com/docs/guides/auth',
      sourceTitle: 'Supabase Auth Architecture Guide',
      followUps: ['What are the OAuth 2.0 endpoints for Supabase?', 'Where do I create an OAuth App in Supabase?'],
    },
  ],

  googlecalendar: [
    {
      id: 'gcal-sensitive-scopes',
      question: 'Are Google Calendar scopes sensitive or restricted?',
      category: 'scopes',
      answer:
        'Yes. Google classifies https://www.googleapis.com/auth/calendar and calendar.events as Sensitive Scopes. While in "Testing" mode in Google Cloud Console, only whitelisted test users (up to 100) can authenticate. For public launch, Google requires OAuth verification.',
      sourceUrl: 'https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scopes',
      sourceTitle: 'Google Sensitive Scopes Guidelines',
      followUps: ['How do I get a continuous refresh token for Calendar sync?', 'How do I force Google to return a refresh token?'],
    },
    {
      id: 'gcal-offline-refresh',
      question: 'How do I get a continuous refresh token for Calendar sync?',
      category: 'tokens',
      answer:
        'Always include access_type=offline and prompt=consent in your Google Calendar authorization URL. Without prompt=consent, subsequent authentications by the same user will return only an access token without a refresh token.',
      codeSnippet: `const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
authUrl.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI!);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.readonly');
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');`,
      sourceUrl: 'https://developers.google.com/calendar/api/quickstart/nodejs',
      sourceTitle: 'Google Calendar API Quickstart',
      followUps: ['Are Google Calendar scopes sensitive or restricted?', 'How do I force Google to return a refresh token?'],
    },
  ],

  microsoft: [
    {
      id: 'msft-endpoint',
      question: 'What is the difference between /common and /{tenant-id} in Microsoft OAuth?',
      category: 'endpoints',
      answer:
        'The /common endpoint allows both personal Microsoft accounts (Outlook, Xbox) and organizational Entra ID accounts to authenticate (multi-tenant). If your app is registered as "Single tenant", you MUST replace /common with your Azure Tenant ID (e.g. https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/authorize). Using /common on a single-tenant app throws error AADSTS50194.',
      codeSnippet: `// Single-tenant:
const authUrl = \`https://login.microsoftonline.com/\${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize\`;

// Multi-tenant (Work & Personal):
const authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';`,
      sourceUrl: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-overview',
      sourceTitle: 'Microsoft Entra ID Endpoint Specs',
      followUps: ['How do I fix AADSTS65001 admin consent required error?', 'How do I force Microsoft to return a refresh token?'],
    },
    {
      id: 'msft-refresh',
      question: 'How do I force Microsoft to return a refresh token?',
      category: 'tokens',
      answer:
        'Microsoft Identity Platform (v2.0) only returns a refresh token if you explicitly include the offline_access scope in your scope parameter. Without offline_access, the token endpoint returns only an access_token with no refresh_token.',
      codeSnippet: `// Required scopes for Microsoft Graph + Refresh Token
const scopes = ['openid', 'profile', 'email', 'offline_access', 'User.Read'].join(' ');
authUrl.searchParams.set('scope', scopes);`,
      sourceUrl: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-permissions-and-consent#offline_access',
      sourceTitle: 'Microsoft Identity offline_access Documentation',
      followUps: ['What is the difference between /common and /{tenant-id} in Microsoft OAuth?', 'How do I fix AADSTS65001 admin consent required error?'],
    },
    {
      id: 'msft-admin-consent',
      question: 'How do I fix AADSTS65001 admin consent required error in Microsoft?',
      category: 'errors',
      answer:
        'Error AADSTS65001 occurs when requested Microsoft Graph scopes require organization administrator approval. A global or cloud application administrator must sign into Microsoft Entra Admin Center > App registrations > API permissions and click "Grant admin consent for {Organization}". Alternatively, pass prompt=admin_consent to send an admin through the consent screen.',
      sourceUrl: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-permissions-and-consent#admin-consent',
      sourceTitle: 'Microsoft Entra Admin Consent Docs',
      followUps: ['What is the difference between /common and /{tenant-id} in Microsoft OAuth?'],
    },
  ],

  x: [
    {
      id: 'x-pkce-required',
      question: 'Does X (Twitter) OAuth 2.0 require PKCE?',
      category: 'security',
      answer:
        'Yes. X (Twitter) API v2 strictly mandates PKCE (RFC 7636) for all OAuth 2.0 authorization code flows. You must generate a cryptographic code_verifier, hash it with SHA-256 to create code_challenge, and pass code_challenge_method=S256 in the authorization URL. Plain code grant without PKCE is rejected with invalid_request.',
      codeSnippet: `// X (Twitter) OAuth 2.0 Auth URL with PKCE
const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', process.env.X_CLIENT_ID!);
authUrl.searchParams.set('redirect_uri', process.env.X_REDIRECT_URI!);
authUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access');
authUrl.searchParams.set('state', state);
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');`,
      sourceUrl: 'https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code-with-pkce',
      sourceTitle: 'X Developer Platform: PKCE Authorization Code',
      followUps: ['How does X refresh token rotation work?', 'Does X require Basic Auth for token exchange?'],
    },
    {
      id: 'x-token-rotation',
      question: 'How does X refresh token rotation work?',
      category: 'tokens',
      answer:
        'X API v2 issues a brand new refresh_token on every refresh exchange request and revokes the old refresh_token immediately. If an old refresh token is reused, X revokes the entire authorization grant. Always save the new refresh_token returned in the JSON response payload.',
      sourceUrl: 'https://developer.x.com/en/docs/authentication/oauth-2-0/refresh-tokens',
      sourceTitle: 'X Refresh Token Documentation',
      followUps: ['Does X (Twitter) OAuth 2.0 require PKCE?', 'Does X require Basic Auth for token exchange?'],
    },
  ],

  zoho: [
    {
      id: 'zoho-multi-dc',
      question: 'How do I handle Zoho multi-datacenter domains (.com, .eu, .in)?',
      category: 'endpoints',
      answer:
        'Zoho partitions users across geographical data centers. Authorization, token exchange, and API requests must use the domain matching the user\'s Zoho account (.com for United States, .eu for Europe, .in for India, .com.au for Australia, .jp for Japan). If an Indian user attempts to authenticate against accounts.zoho.com, authentication fails with invalid_client.',
      codeSnippet: `// Dynamic Zoho accounts domain based on tenant DC
const dcDomain = userAccountLocation === 'EU' ? 'accounts.zoho.eu' : 'accounts.zoho.com';
const authUrl = \`https://\${dcDomain}/oauth/v2/auth\`;
const tokenUrl = \`https://\${dcDomain}/oauth/v2/token\`;`,
      sourceUrl: 'https://www.zoho.com/accounts/protocol/oauth/multi-dc.html',
      sourceTitle: 'Zoho Multi-DC Architecture Specs',
      followUps: ['How do I force Zoho to return a refresh token?', 'What is Zoho authorization code expiration time?'],
    },
    {
      id: 'zoho-refresh',
      question: 'How do I force Zoho to return a refresh token?',
      category: 'tokens',
      answer:
        'Zoho only issues a refresh_token if you pass access_type=offline AND prompt=consent in your authorization URL query string. If prompt=consent is missing, Zoho assumes subsequent logins do not require a fresh consent screen and omits the refresh_token.',
      codeSnippet: `// Force Zoho refresh token
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');`,
      sourceUrl: 'https://www.zoho.com/accounts/protocol/oauth/web-apps/authorization.html',
      sourceTitle: 'Zoho Web Apps OAuth Guide',
      followUps: ['How do I handle Zoho multi-datacenter domains (.com, .eu, .in)?'],
    },
  ],

  loom: [
    {
      id: 'loom-sdk-oauth',
      question: 'How do I configure Loom RecordSDK with OAuth?',
      category: 'general',
      answer:
        'Loom provides two integration modes: client-side RecordSDK (for embedded web video recording) and REST API (for video data management). In the Loom Developer Portal, create a developer application, whitelist your web origins (e.g. http://localhost:3000 and your production domain), and use your public App ID for client-side recording.',
      sourceUrl: 'https://docs.loom.com',
      sourceTitle: 'Loom Developer Portal & RecordSDK Specs',
      followUps: ['What scopes are supported by Loom?'],
    },
  ],

  odoo: [
    {
      id: 'odoo-endpoints',
      question: 'What are the OAuth 2.0 endpoints for Odoo?',
      category: 'endpoints',
      answer:
        'Odoo OAuth 2.0 endpoints are served by your Odoo web controller:\n\n' +
        '• Authorization Endpoint: `https://{your-odoo-domain}/web/oauth2/auth`\n' +
        '• Token Exchange Endpoint: `https://{your-odoo-domain}/web/oauth2/token`\n' +
        '• User Session Info Endpoint: `https://{your-odoo-domain}/web/session/get_session_info`\n\n' +
        'Ensure that the active target database is supplied via the `db` parameter if running in a multi-database environment.',
      codeSnippet: `// Odoo OAuth 2.0 URL construction
const authUrl = new URL('https://your-company.odoo.com/web/oauth2/auth');
authUrl.searchParams.set('client_id', process.env.ODOO_CLIENT_ID!);
authUrl.searchParams.set('redirect_uri', process.env.ODOO_REDIRECT_URI!);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'userinfo');
authUrl.searchParams.set('db', process.env.ODOO_DATABASE!); // Multi-tenant database routing`,
      sourceUrl: 'https://www.odoo.com/documentation/17.0/applications/general/auth/oauth.html',
      sourceTitle: 'Odoo OAuth Documentation',
      followUps: ['Why is the db parameter required in Odoo OAuth?', 'How do I configure OAuth Providers in Odoo?'],
    },
    {
      id: 'odoo-db-param',
      question: 'Why is the db parameter required in Odoo OAuth?',
      category: 'problems',
      answer:
        'Odoo servers frequently host multiple isolated company databases on the same server instance. When a user is redirected for authorization without a `db` parameter, Odoo cannot determine which database to authenticate against and either prompts a manual database selector or throws an invalid session error.\n\nProviding `db={database_name}` guarantees deterministic routing directly to the intended database.',
      sourceUrl: 'https://www.odoo.com/documentation/17.0/developer/reference/external_api.html',
      sourceTitle: 'Odoo External API Reference',
      followUps: ['What are the OAuth 2.0 endpoints for Odoo?', 'How do I configure OAuth Providers in Odoo?'],
    },
  ],
};

/**
 * Normalizes provider slug by stripping subdomains and common TLDs
 * so 'docs.odoo.com', 'odoo.com', and 'odoo' all resolve to 'odoo'.
 */
export function extractKnowledgeSlug(raw: string): string {
  if (!raw) return '';
  let clean = raw.toLowerCase().trim();
  clean = clean.replace(/^https?:\/\//, '');
  clean = clean.replace(/\/.*$/, '');
  clean = clean.replace(/^(docs|api|app|developer|developers|login|console|accounts|auth|web|www)\./, '');
  clean = clean.replace(/\.(com|org|net|io|dev|app|co|us|eu|in|ai|so|to)$/, '');
  clean = clean.replace(/[^a-z0-9]/g, '');
  return clean;
}

// Classify developer question intent with high precision
export function classifyIntent(question: string): CopilotIntent {
  const q = question.toLowerCase();

  // 1. Problems / Pitfalls / Gotchas / Issues / Top 3 / Stuck
  if (
    q.includes('problem') ||
    q.includes('issue') ||
    q.includes('gotcha') ||
    q.includes('pitfall') ||
    q.includes('mistake') ||
    q.includes('blocker') ||
    q.includes('challenge') ||
    q.includes('top 3') ||
    q.includes('top 5') ||
    q.includes('stuck') ||
    q.includes('common bug') ||
    q.includes('why does it fail')
  ) {
    return 'problems_and_pitfalls';
  }

  // 2. Token refresh, expiration, and offline access
  if (
    q.includes('refresh') ||
    q.includes('expire') ||
    q.includes('expiry') ||
    q.includes('lifespan') ||
    q.includes('lifetime') ||
    q.includes('offline') ||
    q.includes('rotation')
  ) {
    return 'token_refresh_and_expiry';
  }

  // 3. Redirects, localhost, HTTP vs HTTPS
  if (
    q.includes('localhost') ||
    q.includes('redirect') ||
    q.includes('callback') ||
    q.includes('http:') ||
    q.includes('https') ||
    q.includes('tunnel') ||
    q.includes('ngrok')
  ) {
    return 'redirect_and_localhost';
  }

  // 4. Scopes, permissions, and verification
  if (
    q.includes('scope') ||
    q.includes('permission') ||
    q.includes('sensitive') ||
    q.includes('restricted') ||
    q.includes('grant')
  ) {
    return 'scopes_and_permissions';
  }

  // 5. Registration, portal, where to create app
  if (
    q.includes('create app') ||
    q.includes('register') ||
    q.includes('where do i') ||
    q.includes('portal') ||
    q.includes('console') ||
    q.includes('dashboard') ||
    q.includes('get client id')
  ) {
    return 'registration_and_portal';
  }

  // 6. Code snippet, endpoints, cURL, fetch
  if (
    q.includes('code') ||
    q.includes('snippet') ||
    q.includes('curl') ||
    q.includes('fetch') ||
    q.includes('example') ||
    q.includes('endpoint') ||
    q.includes('authorize url') ||
    q.includes('token url')
  ) {
    return 'code_snippet_and_endpoints';
  }

  // 7. Error troubleshooting
  if (
    q.includes('invalid_grant') ||
    q.includes('invalid_client') ||
    q.includes('invalid_scope') ||
    q.includes('redirect_uri_mismatch') ||
    q.includes('cors') ||
    q.includes('401') ||
    q.includes('400') ||
    q.includes('403') ||
    q.includes('429')
  ) {
    return 'error_troubleshooting';
  }

  return 'general_faq';
}

// Synthesize top integration pitfalls for any provider
export function synthesizeTopProblems(
  providerSlug: string,
  guide?: GuideVersion | null
): CopilotQA {
  const normSlug = providerSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
  const baseSlug = extractKnowledgeSlug(providerSlug);
  const curated = PROVIDER_TOP_PROBLEMS[baseSlug] || PROVIDER_TOP_PROBLEMS[normSlug];

  if (curated) {
    const formattedPoints = curated.points
      .map(
        (p, idx) =>
          `**${idx + 1}. ${p.heading}**\n${p.detail}${p.fix ? `\n> 💡 **Actionable Fix:** ${p.fix}` : ''}`
      )
      .join('\n\n');

    const answer = `Here are the **${curated.title}**:\n\n${formattedPoints}\n\n💡 **Pro-Tip:** ${curated.proTip}`;

    return {
      id: `problems-${normSlug}`,
      question: `What are the top integration problems for ${guide?.providerName || providerSlug}?`,
      category: 'problems',
      answer,
      sourceUrl: curated.sourceUrl,
      sourceTitle: curated.sourceTitle,
      followUps: curated.followUps,
    };
  }

  // Universal dynamic synthesis from guide blockers and claims for any custom or new provider
  const pName = guide?.providerName || providerSlug;
  const blockers = guide?.blockers || [];
  const limitations = guide?.limitations || [];

  const point1Heading = blockers[0]?.title || 'Strict Redirect URI & Protocol Validation';
  const point1Detail =
    blockers[0]?.description ||
    `${pName} strictly requires registered HTTPS callback URLs. Wildcards, trailing slash discrepancies, or unwhitelisted ports will cause immediate 400 Bad Request redirect mismatches.`;

  const point2Heading = blockers[1]?.title || 'Token Expiration & Refresh Handling';
  const point2Detail =
    blockers[1]?.description ||
    `${pName} access tokens expire after a limited duration. Ensure your server securely stores the refresh token and implements automated token renewal with exponential backoff before token expiration.`;

  const point3Heading = limitations[1] ? 'Scope & Permission Least-Privilege' : 'Client Credential Security';
  const point3Detail =
    limitations[1] ||
    `Never expose your client secret in client-side code. Code exchange must occur strictly on your secure backend server. Request only the minimum necessary scopes to prevent authentication rejection.`;

  const answer = `Here are the **Top 3 Integration Pitfalls for ${pName} OAuth 2.0**:\n\n` +
    `**1. ${point1Heading}**\n${point1Detail}\n> 💡 **Actionable Fix:** Pre-register both localhost testing ports and production domains in your ${pName} developer console.\n\n` +
    `**2. ${point2Heading}**\n${point2Detail}\n> 💡 **Actionable Fix:** Persist the latest refresh token in an atomic database transaction.\n\n` +
    `**3. ${point3Heading}**\n${point3Detail}\n> 💡 **Actionable Fix:** Review your requested scopes against the ${pName} least-privilege matrix.\n\n` +
    `💡 **Pro-Tip:** Always test authorization in an isolated incognito browser tab to verify user consent prompts and token issuance.`;

  return {
    id: `problems-dynamic-${Date.now()}`,
    question: `What are the top integration problems for ${pName}?`,
    category: 'problems',
    answer,
    sourceUrl: guide?.sources?.[0]?.url || `https://${guide?.providerSlug || 'example'}.com/developers`,
    sourceTitle: `${pName} Verified Runbook & Documentation`,
    followUps: [
      `Show ${pName} token exchange code`,
      `Where do I create an app in ${pName}?`,
      `Can I test ${pName} on localhost?`,
    ],
  };
}

// Main Copilot query dispatcher: Intent-aware, conversational, and grounded
export function queryCopilot(
  providerSlug: string,
  userQuestion: string,
  guide?: GuideVersion | null
): CopilotQA {
  const normSlug = providerSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
  const baseSlug = extractKnowledgeSlug(providerSlug);
  const pName = guide?.providerName || providerSlug;
  const qLower = userQuestion.toLowerCase().trim();
  const intent = classifyIntent(qLower);

  // 1. High-Priority Intent: Problems & Pitfalls
  if (intent === 'problems_and_pitfalls') {
    return synthesizeTopProblems(providerSlug, guide);
  }

  // 2. Direct match in curated seed FAQs
  const faqs = PROVIDER_SEED_FAQS[baseSlug] || PROVIDER_SEED_FAQS[normSlug] || [];
  for (const faq of faqs) {
    const fLower = faq.question.toLowerCase();
    if (fLower === qLower || qLower.includes(fLower) || fLower.includes(qLower)) {
      return faq;
    }
  }

  // 3. Intent: Redirects & Localhost Rules
  if (intent === 'redirect_and_localhost') {
    const redirectFaq = faqs.find((f) => f.category === 'redirects');
    if (redirectFaq) return redirectFaq;

    const blocker = guide?.blockers?.find((b) =>
      b.title.toLowerCase().includes('http') || b.description.toLowerCase().includes('redirect')
    );

    return {
      id: `redirect-${Date.now()}`,
      question: userQuestion,
      category: 'redirects',
      answer:
        `For **${pName}**, callback URIs are validated using exact string matching.\n\n` +
        `• **HTTPS Enforcement:** ${blocker?.description || `${pName} enforces HTTPS on all external and production redirect URLs.`}\n` +
        `• **Localhost Testing:** Most providers permit \`http://localhost:3000\` or \`http://127.0.0.1\` for development without an SSL certificate, provided the exact port is pre-registered.\n` +
        `• **Trailing Slashes:** Ensure the URI registered in your developer console matches your application route exactly without mismatched trailing slashes.\n\n` +
        `💡 **Pro-Tip:** If ${pName} rejects plain HTTP localhost, launch an HTTPS tunnel using \`ngrok http 3000\` and register the secure ngrok URL.`,
      sourceUrl: guide?.sources?.[0]?.url || `https://${providerSlug}.com/developers`,
      sourceTitle: `${pName} Redirect Guidelines`,
      followUps: [`What are the top integration problems for ${pName}?`, `Show ${pName} token exchange code`],
    };
  }

  // 4. Intent: Token Refresh, Expiration & Lifespans
  if (intent === 'token_refresh_and_expiry') {
    const tokenFaq = faqs.find((f) => f.category === 'tokens');
    if (tokenFaq && (qLower.includes('how') || qLower.includes('refresh') || qLower.includes('expire'))) {
      return tokenFaq;
    }

    return {
      id: `tokens-${Date.now()}`,
      question: userQuestion,
      category: 'tokens',
      answer:
        `Here is how tokens work for **${pName} OAuth 2.0**:\n\n` +
        `• **Access Tokens:** Standard access tokens are short-lived (typically 1 hour / 3,600 seconds) and carry the authorized scopes in Bearer format.\n` +
        `• **Refresh Tokens:** Long-lived tokens used to request new access tokens without requiring the user to re-authenticate.\n` +
        `• **Token Rotation:** If ${pName} enforces refresh token rotation, calling the token endpoint issues a brand new refresh token and invalidates the previous one immediately.\n\n` +
        `💡 **Implementation Rule:** Always store the latest \`refresh_token\` in a secure database table with transactional row updates.`,
      codeSnippet: `// Standard Token Refresh Request for ${pName}
const res = await fetch('${guide?.steps?.[4]?.instructions?.includes('https://') ? 'https://api.' + providerSlug + '.com/oauth/token' : 'https://oauth2.' + providerSlug + '.com/token'}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: process.env.${pName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CLIENT_ID!,
    client_secret: process.env.${pName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CLIENT_SECRET!,
    refresh_token: currentRefreshToken,
    grant_type: 'refresh_token',
  }),
});
const data = await res.json();`,
      sourceUrl: guide?.sources?.[0]?.url || `https://${providerSlug}.com/developers`,
      sourceTitle: `${pName} Token Documentation`,
      followUps: [`What are the top integration problems for ${pName}?`, `Does ${pName} support PKCE?`],
    };
  }

  // 5. Intent: Registration, Portal & Getting Credentials
  if (intent === 'registration_and_portal') {
    const portalUrl = guide?.sources?.[0]?.url || `https://${providerSlug}.com/developers`;
    const step1 = guide?.steps?.[0]?.instructions || `Sign in to the ${pName} developer dashboard and click 'Create New Application'.`;
    const step2 = guide?.steps?.[1]?.instructions || `Add your callback redirect URI in OAuth settings.`;

    return {
      id: `portal-${Date.now()}`,
      question: userQuestion,
      category: 'steps',
      answer:
        `To register your OAuth application and obtain client credentials for **${pName}**:\n\n` +
        `1. **Access Developer Console:** Navigate to [${portalUrl}](${portalUrl}).\n` +
        `2. **Create New App:** ${step1}\n` +
        `3. **Configure Redirect URIs:** ${step2}\n` +
        `4. **Save Credentials:** Copy the generated **Client ID** and **Client Secret**. Store the Client Secret strictly in server environment variables.\n\n` +
        `💡 **Security Checklist:** Never commit the Client Secret into frontend code or version control repositories.`,
      sourceUrl: portalUrl,
      sourceTitle: `${pName} Developer Portal`,
      followUps: [`What are the top integration problems for ${pName}?`, `Show ${pName} token exchange code`],
    };
  }

  // 6. Intent: Code Snippets & Endpoints
  if (intent === 'code_snippet_and_endpoints') {
    const codeFaq = faqs.find((f) => f.codeSnippet);
    if (codeFaq) return codeFaq;

    return {
      id: `code-${Date.now()}`,
      question: userQuestion,
      category: 'general',
      answer:
        `Here is the standard Node.js token exchange implementation for **${pName}**:\n\n` +
        `Exchanging the temporary \`code\` received on your callback route for a permanent access token:`,
      codeSnippet: `// ${pName} OAuth 2.0 Authorization Code Exchange
export async function exchange${pName.replace(/[^a-zA-Z0-9]/g, '')}Code(code: string, redirectUri: string) {
  const tokenEndpoint = '${guide?.steps?.[4]?.instructions?.includes('https://') ? 'https://api.' + providerSlug + '.com/oauth/token' : 'https://oauth2.' + providerSlug + '.com/token'}';

  const res = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      client_id: process.env.${pName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CLIENT_ID!,
      client_secret: process.env.${pName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(\`${pName} token exchange failed: \${res.status} \${errorText}\`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}`,
      sourceUrl: guide?.sources?.[0]?.url || `https://${providerSlug}.com/developers`,
      sourceTitle: `${pName} Code Documentation`,
      followUps: [`What are the top integration problems for ${pName}?`, `Where do I create an app in ${pName}?`],
    };
  }

  // 7. Keyword Relevance in Seed FAQs (with strict intent threshold)
  const words = qLower.split(/\s+/).filter((w) => w.length > 3 && !['what', 'with', 'when', 'does', 'from', 'this', 'that', 'have'].includes(w));
  let bestFaq: CopilotQA | null = null;
  let bestScore = 0;

  for (const faq of faqs) {
    let score = 0;
    const combined = `${faq.question} ${faq.answer}`.toLowerCase();
    for (const w of words) {
      if (combined.includes(w)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestFaq = faq;
    }
  }

  if (bestFaq && bestScore >= 2) {
    return bestFaq;
  }

  // 8. Dynamic Grounded Answer Synthesizer
  const blockerMatch = guide?.blockers?.find((b) =>
    words.some((w) => b.title.toLowerCase().includes(w) || b.description.toLowerCase().includes(w))
  );

  if (blockerMatch) {
    return {
      id: blockerMatch.id,
      question: userQuestion,
      category: 'security',
      answer:
        `Regarding your question on **${pName}**:\n\n` +
        `**${blockerMatch.title}**\n${blockerMatch.description}\n\n` +
        `💡 **Resolution:** Ensure your implementation adheres to ${pName}'s documented security standards and verify your callback URLs.`,
      sourceUrl: guide?.sources?.[0]?.url || `https://${providerSlug}.com/developers`,
      sourceTitle: `${pName} Verified Runbook`,
      followUps: [`What are the top integration problems for ${pName}?`, `Show ${pName} token exchange code`],
    };
  }

  // 9. Conversational Grounded Fallback
  const capabilities = guide?.intent?.capabilities?.join(', ') || 'User Authentication';
  return {
    id: `custom-${Date.now()}`,
    question: userQuestion,
    category: 'general',
    answer:
      `For **${pName} OAuth 2.0**:\n\n` +
      `• **Flow Type:** Standard RFC 6749 Authorization Code Grant with server-side token exchange.\n` +
      `• **Configured Scopes:** ${capabilities}.\n` +
      `• **Security Protocol:** Enforce strict HTTPS for all public callback endpoints, protect your Client Secret on the server, and validate state parameters on redirect callbacks to prevent CSRF attacks.\n\n` +
      `💡 What specific aspect of ${pName} integration would you like to explore?`,
    sourceUrl: guide?.sources?.[0]?.url || `https://${providerSlug}.com/developers`,
    sourceTitle: `${pName} Official Documentation`,
    followUps: [
      `What are the top integration problems for ${pName}?`,
      `Show ${pName} token exchange code`,
      `Where do I create an app in ${pName}?`,
    ],
  };
}
