export interface DiagnosticResult {
  id: string;
  category: 'redirect' | 'credentials' | 'scopes' | 'tokens' | 'cors' | 'approval';
  title: string;
  summary: string;
  providerGotcha?: string;
  wrongSnippet?: string;
  fixedSnippet?: string;
  actionItems: string[];
}

export function diagnoseError(
  rawInput: string,
  providerSlug?: string,
  providerName?: string
): DiagnosticResult {
  const input = rawInput.trim();
  const lower = input.toLowerCase();
  const name = providerName || 'this provider';
  const slug = providerSlug?.toLowerCase() || '';

  // 1. CORS on Token Endpoint
  if (
    lower.includes('cors') ||
    lower.includes('access-control-allow-origin') ||
    lower.includes('failed to fetch') ||
    lower.includes('network error') && (lower.includes('/token') || lower.includes('oauth/token'))
  ) {
    return {
      id: 'cors-token-exchange',
      category: 'cors',
      title: 'CORS Error on Token Endpoint (Browser-side Token Exchange)',
      summary: `You are attempting to exchange the authorization code directly from browser-side JavaScript using fetch() or axios. ${name}'s token endpoint deliberately blocks browser CORS requests for security.`,
      providerGotcha: `${name} requires client authentication with your Client Secret. Client Secrets must NEVER be stored or used in browser client code.`,
      wrongSnippet: `// ❌ WRONG: Calling token endpoint in React/Browser
const res = await fetch('https://${slug ? slug + '.com' : 'provider.com'}/oauth/token', {
  method: 'POST',
  body: JSON.stringify({ code, client_id, client_secret })
}); // -> Blocked by CORS policy!`,
      fixedSnippet: `// ✅ FIXED: Exchange token inside backend route (Next.js / Node / Python)
// In app/api/auth/callback/route.ts or your backend server:
export async function POST(req: Request) {
  const { code } = await req.json();
  const tokenRes = await fetch('https://${slug ? slug + '.com' : 'provider.com'}/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.${slug.toUpperCase()}_CLIENT_ID!,
      client_secret: process.env.${slug.toUpperCase()}_CLIENT_SECRET!,
      redirect_uri: process.env.NEXTAUTH_URL + '/api/auth/callback/${slug}'
    })
  });
  return Response.json(await tokenRes.json());
}`,
      actionItems: [
        'Move the POST request to your backend API server (e.g. Next.js API route, Express, FastAPI).',
        'Store client credentials in secure server environment variables (.env.local).',
        'Return only the application session cookie or user token to the frontend browser.',
      ],
    };
  }

  // 2. Redirect URI Mismatch
  if (
    lower.includes('redirect_uri_mismatch') ||
    lower.includes('invalid_redirect_uri') ||
    lower.includes('redirect uri does not match') ||
    lower.includes('callback url mismatch')
  ) {
    let specificHint = '';
    if (slug === 'google') {
      specificHint = 'Google Cloud Console does not allow wildcards, path fragments (#), or IP addresses without exact protocol matching.';
    } else if (slug === 'discord') {
      specificHint = 'Discord enforces strict exact matching including trailing slashes and port numbers.';
    } else if (slug === 'slack') {
      specificHint = 'Slack requires exact redirect URLs in the "OAuth & Permissions" dashboard under Redirect URLs.';
    }

    return {
      id: 'redirect-mismatch',
      category: 'redirect',
      title: 'Redirect URI Mismatch (redirect_uri_mismatch)',
      summary: `The redirect_uri sent in your authorization request does not character-for-character match any callback URL configured in the ${name} Developer Console.`,
      providerGotcha: specificHint || `${name} performs exact string matching. Even a trailing slash difference or localhost vs 127.0.0.1 causes this error.`,
      wrongSnippet: `// ❌ Common Mismatches:
// Configured in Console:  https://example.com/api/auth/callback/${slug}
// Sent in Request:        https://example.com/api/auth/callback/${slug}/ (Trailing slash!)
// Or:
// Configured in Console:  http://localhost:3000/callback
// Sent in Request:        http://127.0.0.1:3000/callback (Host mismatch!)`,
      fixedSnippet: `// ✅ FIXED: Ensure 100% exact character match across all environments:
const REDIRECT_URI = process.env.NODE_ENV === 'production'
  ? 'https://app.example.com/api/auth/callback/${slug}'
  : 'http://localhost:3000/api/auth/callback/${slug}';

// Make sure BOTH URLs are added into ${name} Developer Console redirect whitelist!`,
      actionItems: [
        `Open the ${name} Developer Console and check the exact whitelist under Redirect / Callback URLs.`,
        'Verify trailing slashes: if the console has /callback, your code cannot send /callback/.',
        'Ensure protocol matches: production requires https://, development can use http://localhost.',
        'URL-encode the redirect_uri when passing it in query strings (e.g. encodeURIComponent).',
      ],
    };
  }

  // 3. Invalid Client / 401 Unauthorized
  if (
    lower.includes('invalid_client') ||
    lower.includes('client authentication failed') ||
    lower.includes('unauthorized_client') ||
    lower.includes('401')
  ) {
    let headerHint = '';
    if (slug === 'zoom' || slug === 'spotify') {
      headerHint = `${name} requires HTTP Basic Authentication in the header: 'Authorization: Basic ' + Base64(CLIENT_ID + ':' + CLIENT_SECRET), rather than sending credentials in the POST body.`;
    }

    return {
      id: 'invalid-client',
      category: 'credentials',
      title: 'Invalid Client or Authentication Failed',
      summary: `The client credentials (Client ID or Client Secret) were rejected by ${name}, or the authentication mechanism (header vs body) did not match.`,
      providerGotcha: headerHint || `Make sure you have copied the full secret without surrounding whitespace or quotation marks.`,
      wrongSnippet: `// ❌ WRONG: Credentials passed incorrectly or missing Basic Auth
const res = await fetch('token_url', {
  method: 'POST',
  body: 'grant_type=authorization_code&code=' + code // Missing client credentials!
});`,
      fixedSnippet: `// ✅ FIXED: Pass credentials properly formatted:
${
  slug === 'zoom' || slug === 'spotify'
    ? `const basicAuth = Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64');
const res = await fetch('https://${slug === 'zoom' ? 'zoom.us' : 'accounts.spotify.com'}/oauth/token', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + basicAuth,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI
  })
});`
    : `const res = await fetch('token_url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI
  })
});`
}`,
      actionItems: [
        `Re-check your Client ID and Client Secret in the ${name} Developer Dashboard.`,
        'Verify environment variables are loaded in your server (console.log(process.env.CLIENT_ID?.slice(0, 4))).',
        slug === 'zoom' || slug === 'spotify'
          ? 'Provide the credentials via the HTTP Basic Authorization header.'
          : 'Send client_id and client_secret in the urlencoded request body.',
      ],
    };
  }

  // 4. Invalid Scope / Insufficient Permissions
  if (
    lower.includes('invalid_scope') ||
    lower.includes('scope not allowed') ||
    lower.includes('unauthorized scope') ||
    lower.includes('restricted_scope')
  ) {
    const separator = slug === 'slack' || slug === 'github' ? 'comma (,)' : 'space (%20 or +)';
    return {
      id: 'invalid-scope',
      category: 'scopes',
      title: 'Invalid or Unapproved Scopes (invalid_scope)',
      summary: `One or more requested permissions are unrecognized, formatted with the wrong delimiter, or require elevated developer verification by ${name}.`,
      providerGotcha: `${name} requires scopes separated by a ${separator}. If you use the wrong separator, the provider reads the entire list as a single invalid scope name.`,
      wrongSnippet: `// ❌ WRONG Delimiter or unverified scopes:
${slug === 'google' ? '// Google requires spaces, not commas:' : '// Check delimiter:'}
scope=read,write,admin // If provider expects space-separated scopes!`,
      fixedSnippet: `// ✅ FIXED: Use official scope names and standard delimiter:
const scopes = ${
        slug === 'slack' || slug === 'github'
          ? "['read:user', 'repo'].join(',');"
          : "['identify', 'email'].join(' ');"
      }
const authUrl = \`\${AUTH_ENDPOINT}?client_id=\${CLIENT_ID}&scope=\${encodeURIComponent(scopes)}&redirect_uri=\${encodeURIComponent(REDIRECT_URI)}&response_type=code\`;`,
      actionItems: [
        `Verify requested scopes against the ${name} runbook permissions section.`,
        `Ensure scope separator is correct: ${name} expects ${separator}.`,
        'Check if requested scopes require App Review or Verification before third-party users can authorize them.',
      ],
    };
  }

  // 5. Expired or Already Used Authorization Code
  if (
    lower.includes('invalid_grant') ||
    lower.includes('code expired') ||
    lower.includes('code has already been used') ||
    lower.includes('authorization code expired')
  ) {
    return {
      id: 'expired-code',
      category: 'tokens',
      title: 'Authorization Code Expired or Already Exchanged (invalid_grant)',
      summary: `OAuth 2.0 authorization codes are single-use tokens with short lifetimes (usually 5 to 10 minutes). They cannot be reused or exchanged more than once.`,
      providerGotcha: `In React 18 Strict Mode in development, useEffect runs twice. If your token exchange executes in an un-guarded useEffect, the first run consumes the code and the second fails with invalid_grant.`,
      wrongSnippet: `// ❌ WRONG: Calling token exchange in a component that executes twice
useEffect(() => {
  const code = new URLSearchParams(window.location.search).get('code');
  exchangeCode(code); // React StrictMode fires this twice! Second call fails.
}, []);`,
      fixedSnippet: `// ✅ FIXED: Guard exchange or process code server-side:
const hasExchanged = useRef(false);

useEffect(() => {
  const code = new URLSearchParams(window.location.search).get('code');
  if (code && !hasExchanged.current) {
    hasExchanged.current = true;
    exchangeCode(code);
  }
}, []);`,
      actionItems: [
        'Trigger a fresh authorization flow in the browser to obtain a new authorization code.',
        'Ensure React StrictMode or duplicate network calls do not consume the code twice.',
        'Verify system clocks: server time drift can cause premature token expiration.',
      ],
    };
  }

  // 6. Access Denied / Approval Rejection
  if (
    lower.includes('access_denied') ||
    lower.includes('user_denied') ||
    lower.includes('consent_required')
  ) {
    return {
      id: 'access-denied',
      category: 'approval',
      title: 'User or Admin Denied Consent (access_denied)',
      summary: `The end-user clicked 'Cancel', or their organization policy restricts third-party app installations without workspace admin pre-approval.`,
      providerGotcha: `In enterprise workspaces (${name}), regular members often cannot authorize apps that request write or sensitive access.`,
      wrongSnippet: `// Handling user cancellation:
if (error === 'access_denied') {
  // Gracefully inform the user rather than crashing
}`,
      fixedSnippet: `// ✅ FIXED: Provide fallback UI and admin approval guidance
if (searchParams.get('error') === 'access_denied') {
  return (
    <div className="error-banner">
      <h3>Authorization Cancelled</h3>
      <p>You cancelled the authorization prompt, or your workspace administrator has restricted access for this app.</p>
      <button onClick={retryAuth}>Try Again</button>
    </div>
  );
}`,
      actionItems: [
        'Present a helpful user message explaining that authorization was cancelled.',
        'If connecting to an enterprise workspace, prompt the user to request admin installation.',
        'Audit your requested scopes to minimize unnecessary permissions.',
      ],
    };
  }

  // Default Fallback
  return {
    id: 'general-oauth-issue',
    category: 'credentials',
    title: `OAuth Configuration Issue Detected`,
    summary: `We analyzed your input: "${input.slice(0, 80)}${input.length > 80 ? '...' : ''}". The most common cause is parameter naming divergence or mismatched environment variables.`,
    providerGotcha: `Check that your Client ID, Redirect URI, and Scope definitions match the specifications in the ${name} runbook above.`,
    wrongSnippet: `// Typical issue: parameter spelling divergence
// Check redirect_uri vs callback_url, client_id vs app_id`,
    fixedSnippet: `// Standard OAuth 2.0 Authorization Code URL:
const url = new URL('AUTHORIZATION_URL');
url.searchParams.set('client_id', CLIENT_ID);
url.searchParams.set('redirect_uri', REDIRECT_URI);
url.searchParams.set('response_type', 'code');
url.searchParams.set('scope', SCOPES);
window.location.href = url.toString();`,
    actionItems: [
      `Review Step 1 and Step 2 of the ${name} runbook.`,
      'Confirm your redirect URL is explicitly added to the provider whitelist.',
      'Check server logs for the full HTTP response body returned by the token endpoint.',
    ],
  };
}

