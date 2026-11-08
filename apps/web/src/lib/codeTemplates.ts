export interface CodeTemplateParams {
  providerSlug: string;
  providerName: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes?: string[];
  authUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
}

export interface ProviderEndpointConfig {
  authUrl: string;
  tokenUrl: string;
  userUrl: string;
  scopeDelimiter: ' ' | ',';
  authMethod: 'body' | 'basic';
}

export const PROVIDER_ENDPOINTS: Record<string, ProviderEndpointConfig> = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userUrl: 'https://api.github.com/user',
    scopeDelimiter: ',',
    authMethod: 'body',
  },
  slack: {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    userUrl: 'https://slack.com/api/users.identity',
    scopeDelimiter: ',',
    authMethod: 'body',
  },
  notion: {
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    userUrl: 'https://api.notion.com/v1/users/me',
    scopeDelimiter: ' ',
    authMethod: 'basic',
  },
  salesforce: {
    authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
    userUrl: 'https://login.salesforce.com/services/oauth2/userinfo',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  discord: {
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    userUrl: 'https://discord.com/api/users/@me',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  spotify: {
    authUrl: 'https://accounts.spotify.com/authorize',
    tokenUrl: 'https://accounts.spotify.com/api/token',
    userUrl: 'https://api.spotify.com/v1/me',
    scopeDelimiter: ' ',
    authMethod: 'basic',
  },
  linear: {
    authUrl: 'https://linear.app/oauth/authorize',
    tokenUrl: 'https://api.linear.app/oauth/token',
    userUrl: 'https://api.linear.app/graphql',
    scopeDelimiter: ',',
    authMethod: 'body',
  },
  hubspot: {
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    userUrl: 'https://api.hubapi.com/oauth/v1/access-tokens/',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  zoom: {
    authUrl: 'https://zoom.us/oauth/authorize',
    tokenUrl: 'https://zoom.us/oauth/token',
    userUrl: 'https://api.zoom.us/v2/users/me',
    scopeDelimiter: ' ',
    authMethod: 'basic',
  },
  airtable: {
    authUrl: 'https://airtable.com/oauth2/v1/authorize',
    tokenUrl: 'https://airtable.com/oauth2/v1/token',
    userUrl: 'https://api.airtable.com/v0/meta/whoami',
    scopeDelimiter: ' ',
    authMethod: 'basic',
  },
  shopify: {
    authUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize',
    tokenUrl: 'https://{shop}.myshopify.com/admin/oauth/access_token',
    userUrl: 'https://{shop}.myshopify.com/admin/api/2024-01/shop.json',
    scopeDelimiter: ',',
    authMethod: 'body',
  },
  supabase: {
    authUrl: 'https://api.supabase.com/v1/oauth/authorize',
    tokenUrl: 'https://api.supabase.com/v1/oauth/token',
    userUrl: 'https://api.supabase.com/v1/profile',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  box: {
    authUrl: 'https://account.box.com/api/oauth2/authorize',
    tokenUrl: 'https://api.box.com/oauth2/token',
    userUrl: 'https://api.box.com/2.0/users/me',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  asana: {
    authUrl: 'https://app.asana.com/-/oauth_authorize',
    tokenUrl: 'https://app.asana.com/-/oauth_token',
    userUrl: 'https://app.asana.com/api/1.0/users/me',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  'google-calendar': {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  gcal: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  loom: {
    authUrl: 'https://www.loom.com/oauth/authorize',
    tokenUrl: 'https://www.loom.com/oauth/token',
    userUrl: 'https://api.loom.com/v1/user',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  microsoft: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userUrl: 'https://graph.microsoft.com/v1.0/me',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  azure: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userUrl: 'https://graph.microsoft.com/v1.0/me',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  x: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userUrl: 'https://api.twitter.com/2/users/me',
    scopeDelimiter: ' ',
    authMethod: 'basic',
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userUrl: 'https://api.twitter.com/2/users/me',
    scopeDelimiter: ' ',
    authMethod: 'basic',
  },
  zoho: {
    authUrl: 'https://accounts.zoho.com/oauth/v2/auth',
    tokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
    userUrl: 'https://accounts.zoho.com/oauth/user/info',
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
};

function getEndpointConfig(slug: string): ProviderEndpointConfig {
  const norm = slug.toLowerCase();
  return PROVIDER_ENDPOINTS[norm] || {
    authUrl: `https://${norm}.com/oauth/authorize`,
    tokenUrl: `https://${norm}.com/oauth/token`,
    userUrl: `https://${norm}.com/api/v1/user`,
    scopeDelimiter: norm === 'slack' || norm === 'github' ? ',' : ' ',
    authMethod: norm === 'zoom' || norm === 'spotify' || norm === 'notion' ? 'basic' : 'body',
  };
}

export function generateNextAuthSnippet(params: CodeTemplateParams): string {
  const slug = params.providerSlug.toLowerCase();
  const name = params.providerName;
  const cfg = getEndpointConfig(slug);

  const scopes = (params.scopes && params.scopes.length > 0)
    ? params.scopes.join(cfg.scopeDelimiter)
    : 'identify email';
  const authUrl = params.authUrl || cfg.authUrl;
  const tokenUrl = params.tokenUrl || cfg.tokenUrl;
  const userUrl = params.userInfoUrl || cfg.userUrl;

  return `// app/api/auth/[...nextauth]/route.ts (or auth.ts for Auth.js v5)
import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "${slug}",
      name: "${name}",
      type: "oauth",
      authorization: {
        url: "${authUrl}",
        params: { scope: "${scopes}" },
      },
      token: "${tokenUrl}",
      userinfo: "${userUrl}",
      clientId: process.env.${slug.toUpperCase()}_CLIENT_ID!,
      clientSecret: process.env.${slug.toUpperCase()}_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: String(profile.id || profile.sub),
          name: profile.name || profile.username || profile.login,
          email: profile.email,
          image: profile.avatar_url || profile.picture,
        };
      },
    },
  ],
});
`;
}

export function generateNodeSnippet(params: CodeTemplateParams): string {
  const slug = params.providerSlug.toLowerCase();
  const name = params.providerName;
  const cfg = getEndpointConfig(slug);

  const clientId = params.clientId || `process.env.${slug.toUpperCase()}_CLIENT_ID`;
  const redirectUri = params.redirectUri || `http://localhost:3000/api/auth/callback/${slug}`;
  const scopes = (params.scopes && params.scopes.length > 0)
    ? params.scopes.join(cfg.scopeDelimiter)
    : 'identify email';
  const authUrl = params.authUrl || cfg.authUrl;
  const tokenUrl = params.tokenUrl || cfg.tokenUrl;
  const isBasicAuth = cfg.authMethod === 'basic';

  return `// server.js — Node.js Express OAuth 2.0 Integration for ${name}
const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = process.env.${slug.toUpperCase()}_CLIENT_ID || "${params.clientId || 'YOUR_CLIENT_ID'}";
const CLIENT_SECRET = process.env.${slug.toUpperCase()}_CLIENT_SECRET || "${params.clientSecret || 'YOUR_CLIENT_SECRET'}";
const REDIRECT_URI = "${redirectUri}";

// 1. Redirect user to ${name} Authorization page
app.get('/login', (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: "${scopes}",
    state: Math.random().toString(36).substring(7)
  });
  res.redirect(\`${authUrl}?\${params.toString()}\`);
});

// 2. Handle OAuth 2.0 Callback and Exchange Code for Tokens
app.get('/api/auth/callback/${slug}', async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.status(400).send(\`OAuth authorization error: \${error}\`);
  if (!code) return res.status(400).send('Missing authorization code');

  try {
    ${
      isBasicAuth
        ? `// ${name} requires HTTP Basic Auth header for client authentication
    const credentials = Buffer.from(\`\${CLIENT_ID}:\${CLIENT_SECRET}\`).toString('base64');
    const tokenResponse = await axios.post(
      '${tokenUrl}',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: REDIRECT_URI
      }).toString(),
      {
        headers: {
          'Authorization': \`Basic \${credentials}\`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );`
        : `const tokenResponse = await axios.post(
      '${tokenUrl}',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: String(code),
        redirect_uri: REDIRECT_URI
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );`
    }

    const { access_token, refresh_token, token_type } = tokenResponse.data;
    // Securely persist access_token and refresh_token in encrypted session/database
    res.json({ status: 'authenticated', provider: '${slug}', tokens: tokenResponse.data });
  } catch (err) {
    const errorDetails = err.response ? err.response.data : err.message;
    console.error('Token exchange failure:', errorDetails);
    res.status(500).json({ error: 'Token exchange failed', details: errorDetails });
  }
});

app.listen(3000, () => console.log('OAuth server listening on http://localhost:3000'));
`;
}

export function generatePythonSnippet(params: CodeTemplateParams): string {
  const slug = params.providerSlug.toLowerCase();
  const name = params.providerName;
  const cfg = getEndpointConfig(slug);

  const redirectUri = params.redirectUri || `http://localhost:8000/auth/callback/${slug}`;
  const scopes = (params.scopes && params.scopes.length > 0)
    ? params.scopes.join(cfg.scopeDelimiter)
    : 'identify email';
  const authUrl = params.authUrl || cfg.authUrl;
  const tokenUrl = params.tokenUrl || cfg.tokenUrl;
  const isBasicAuth = cfg.authMethod === 'basic';

  return `# main.py — FastAPI + httpx OAuth 2.0 Integration for ${name}
import os
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse

app = FastAPI(title="${name} OAuth Service")

CLIENT_ID = os.getenv("${slug.toUpperCase()}_CLIENT_ID", "${params.clientId || 'YOUR_CLIENT_ID'}")
CLIENT_SECRET = os.getenv("${slug.toUpperCase()}_CLIENT_SECRET", "${params.clientSecret || 'YOUR_CLIENT_SECRET'}")
REDIRECT_URI = "${redirectUri}"

@app.get("/login")
def login():
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": "${scopes}",
        "state": "secure_random_state"
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"${authUrl}?{query}")

@app.get("/auth/callback/${slug}")
async def callback(code: str = None, error: str = None):
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    async with httpx.AsyncClient() as client:
        ${
          isBasicAuth
            ? `auth = (CLIENT_ID, CLIENT_SECRET)
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI
        }
        res = await client.post("${tokenUrl}", data=data, auth=auth)`
            : `data = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI
        }
        res = await client.post("${tokenUrl}", data=data)`
        }

        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail=res.text)

        tokens = res.json()
        return {"status": "success", "tokens": tokens}
`;
}

export function generateCurlSnippet(params: CodeTemplateParams): string {
  const slug = params.providerSlug.toLowerCase();
  const name = params.providerName;
  const cfg = getEndpointConfig(slug);

  const clientId = params.clientId || `YOUR_${slug.toUpperCase()}_CLIENT_ID`;
  const clientSecret = params.clientSecret || `YOUR_${slug.toUpperCase()}_CLIENT_SECRET`;
  const redirectUri = params.redirectUri || `http://localhost:3000/api/auth/callback/${slug}`;
  const scopes = (params.scopes && params.scopes.length > 0)
    ? params.scopes.join(cfg.scopeDelimiter)
    : 'identify email';
  const authUrl = params.authUrl || cfg.authUrl;
  const tokenUrl = params.tokenUrl || cfg.tokenUrl;
  const isBasicAuth = cfg.authMethod === 'basic';

  return `# Step 1: Open the Authorization URL in your web browser:
"${authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}"

# Step 2: Copy the ?code=... returned in your browser callback URL, then run:
${
  isBasicAuth
    ? `curl -X POST "${tokenUrl}" \\
  -u "${clientId}:${clientSecret}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "code=PASTE_CODE_HERE" \\
  -d "redirect_uri=${redirectUri}"`
    : `curl -X POST "${tokenUrl}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=${clientId}" \\
  -d "client_secret=${clientSecret}" \\
  -d "code=PASTE_CODE_HERE" \\
  -d "redirect_uri=${redirectUri}"`
}
`;
}
