import { GuideVersion } from '../types';

export interface CopilotQA {
  id: string;
  question: string;
  category: 'tokens' | 'redirects' | 'scopes' | 'security' | 'general';
  answer: string;
  codeSnippet?: string;
  sourceUrl: string;
  sourceTitle: string;
}

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
    },
    {
      id: 'd-bot-invite',
      question: 'How do I generate a Discord bot invite link with OAuth scopes?',
      category: 'scopes',
      answer:
        'To invite a bot and grant slash command capabilities simultaneously, combine the bot and applications.commands scopes with a calculated permissions bitfield integer.',
      codeSnippet: `// Combined Bot Invite + Slash Commands URL
const inviteUrl = 'https://discord.com/api/oauth2/authorize?' +
  new URLSearchParams({
    client_id: 'YOUR_CLIENT_ID',
    permissions: '2048', // e.g. Send Messages bit
    scope: 'bot applications.commands',
  }).toString();`,
      sourceUrl: 'https://discord.com/developers/docs/topics/oauth2#bot-authorization-flow',
      sourceTitle: 'Discord Bot Authorization Docs',
    },
    {
      id: 'd-token-rate-limit',
      question: 'What are the rate limits on Discord token exchange?',
      category: 'tokens',
      answer:
        'Discord limits requests to the /api/oauth2/token endpoint to 5 requests per second per IP/client. Exceeding this returns HTTP 429 with a Retry-After header.',
      sourceUrl: 'https://discord.com/developers/docs/reference#rate-limits',
      sourceTitle: 'Discord API Rate Limits',
    },
  ],

  slack: [
    {
      id: 's-bot-vs-user',
      question: 'What is the difference between Slack bot tokens and user tokens?',
      category: 'tokens',
      answer:
        'In Slack OAuth v2, requesting scopes in the scope parameter returns a bot token (prefixed with xoxb-), representing your app bot. Requesting scopes in user_scope returns a user token (prefixed with xoxp-), acting on behalf of the authorizing user.',
      codeSnippet: `// Slack OAuth v2 Request with both Bot & User Scopes
const authUrl = 'https://slack.com/oauth/v2/authorize?' +
  new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    scope: 'chat:write,commands',        // Returns xoxb- Bot Token
    user_scope: 'identity.basic,read',   // Returns xoxp- User Token
    redirect_uri: process.env.SLACK_REDIRECT_URI!,
  }).toString();`,
      sourceUrl: 'https://api.slack.com/authentication/oauth-v2',
      sourceTitle: 'Slack API: OAuth v2 Specs',
    },
    {
      id: 's-scope-delimiter',
      question: 'What delimiter does Slack OAuth use for multiple scopes?',
      category: 'scopes',
      answer:
        'Slack OAuth v2 uses comma delimiters (,) rather than spaces for separating multiple requested scopes (e.g. scope=chat:write,commands,users:read).',
      codeSnippet: `// Correct Slack delimiter: commas
scope: 'channels:read,chat:write,users:read'`,
      sourceUrl: 'https://api.slack.com/scopes',
      sourceTitle: 'Slack Permission Scopes',
    },
  ],

  github: [
    {
      id: 'gh-app-vs-oauth',
      question: 'Should I build a GitHub App or a legacy OAuth App?',
      category: 'general',
      answer:
        'GitHub strongly recommends GitHub Apps over legacy OAuth Apps. GitHub Apps support fine-grained repository permissions, expire user-to-server tokens automatically, and allow bot identity attribution.',
      sourceUrl: 'https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/differences-between-github-apps-and-oauth-apps',
      sourceTitle: 'GitHub Docs: App Archetypes',
    },
    {
      id: 'gh-scope-delimiter',
      question: 'What delimiter does GitHub use for scopes?',
      category: 'scopes',
      answer:
        'GitHub supports space-delimited or comma-delimited scopes in the authorization URL (e.g. scope=read:user,user:email).',
      codeSnippet: `// GitHub Scope parameter
scope: 'read:user,user:email,repo'`,
      sourceUrl: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps',
      sourceTitle: 'GitHub OAuth Scopes',
    },
  ],

  spotify: [
    {
      id: 'sp-basic-auth',
      question: 'Does Spotify require Basic Auth header for token exchange?',
      category: 'security',
      answer:
        'Yes. Spotify Web API token endpoint (/api/token) requires passing client credentials as an HTTP Basic Authorization header: Authorization: Basic base64(client_id:client_secret). Supplying them in the body alone will fail.',
      codeSnippet: `// Spotify Token Exchange with Basic Auth
const basicAuth = Buffer.from(\`\${clientId}:\${clientSecret}\`).toString('base64');
const res = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: {
    'Authorization': \`Basic \${basicAuth}\`,
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
    },
    {
      id: 'at-rate-limits',
      question: 'What are Airtable OAuth and API rate limits?',
      category: 'general',
      answer:
        'Airtable enforces a rate limit of 5 requests per second per base. If exceeded, the API returns a 429 status code with a 30-second backoff recommendation.',
      sourceUrl: 'https://airtable.com/developers/web/api/rate-limits',
      sourceTitle: 'Airtable API Rate Limits',
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
    },
    {
      id: 'sb-use-case',
      question: 'When should I use Supabase OAuth vs Supabase Auth (GoTrue)?',
      category: 'scopes',
      answer:
        'Use Supabase OAuth 2.0 when you are building developer tools, CLI utilities, or integrations that need to manage Supabase projects, databases, and resources on behalf of a Supabase user. For end-user authentication in your consumer app, use Supabase Auth (GoTrue client SDKs).',
      sourceUrl: 'https://supabase.com/docs/guides/auth',
      sourceTitle: 'Supabase Auth Architecture Guide',
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
    },
  ],
};

export function queryCopilot(
  providerSlug: string,
  userQuestion: string,
  guide?: GuideVersion | null
): CopilotQA {
  const normSlug = providerSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
  const faqs = PROVIDER_SEED_FAQS[normSlug] || [];
  const qLower = userQuestion.toLowerCase().trim();

  // 1. Direct or partial keyword match in seed FAQs
  for (const faq of faqs) {
    const fLower = faq.question.toLowerCase();
    if (fLower.includes(qLower) || qLower.includes(fLower)) {
      return faq;
    }
  }

  // 2. Keyword relevance scoring in seed FAQs
  const words = qLower.split(/\s+/).filter((w) => w.length > 2);
  let bestFaq: CopilotQA | null = null;
  let bestScore = 0;

  for (const faq of faqs) {
    let score = 0;
    const combined = `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase();
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

  // 3. Fallback grounded in guide claims and blockers
  if (guide) {
    // Check known blockers
    if (guide.blockers && guide.blockers.length > 0) {
      for (const blk of guide.blockers) {
        if (words.some((w) => blk.title.toLowerCase().includes(w) || blk.description.toLowerCase().includes(w))) {
          return {
            id: blk.id,
            question: userQuestion,
            category: 'security',
            answer: `${blk.title}: ${blk.description}`,
            sourceUrl: guide.sources?.[0]?.url || `https://${guide.providerSlug}.com`,
            sourceTitle: `${guide.providerName} Verified Runbook`,
          };
        }
      }
    }

    // Check claims
    if (guide.claims && guide.claims.length > 0) {
      for (const clm of guide.claims) {
        if (words.some((w) => clm.text.toLowerCase().includes(w))) {
          return {
            id: clm.id,
            question: userQuestion,
            category: 'general',
            answer: clm.text,
            sourceUrl: guide.sources?.[0]?.url || `https://${guide.providerSlug}.com`,
            sourceTitle: `${guide.providerName} Documentation Claim`,
          };
        }
      }
    }
  }

  // 4. Fallback default grounded answer for provider
  const pName = guide?.providerName || providerSlug;
  return {
    id: `custom-${Date.now()}`,
    question: userQuestion,
    category: 'general',
    answer: `For ${pName}, ensure your OAuth 2.0 flow uses authorization code exchange with exact redirect URI matching. Check that your client ID and secret are securely configured, and only request the minimum required scopes.`,
    sourceUrl: guide?.sources?.[0]?.url || `https://${providerSlug}.com/developers`,
    sourceTitle: `${pName} Official Documentation`,
  };
}

