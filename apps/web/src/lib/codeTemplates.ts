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

export function generateNextAuthSnippet(params: CodeTemplateParams): string {
  const slug = params.providerSlug.toLowerCase();
  const name = params.providerName;
  const scopes = (params.scopes && params.scopes.length > 0)
    ? params.scopes.join(slug === 'slack' || slug === 'github' ? ',' : ' ')
    : 'identify email';
  const authUrl = params.authUrl || `https://${slug}.com/oauth/authorize`;
  const tokenUrl = params.tokenUrl || `https://${slug}.com/oauth/token`;
  const userUrl = params.userInfoUrl || `https://${slug}.com/api/v1/user`;

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
  const clientId = params.clientId || `process.env.${slug.toUpperCase()}_CLIENT_ID`;
  const redirectUri = params.redirectUri || `http://localhost:3000/api/auth/callback/${slug}`;
  const scopes = (params.scopes && params.scopes.length > 0)
    ? params.scopes.join(slug === 'slack' || slug === 'github' ? ',' : ' ')
    : 'identify email';
  const authUrl = params.authUrl || `https://${slug}.com/oauth/authorize`;
  const tokenUrl = params.tokenUrl || `https://${slug}.com/oauth/token`;

  const isBasicAuth = slug === 'zoom' || slug === 'spotify';

  return `// server.js - Node.js Express OAuth 2.0 Flow
import express from 'express';
import crypto from 'crypto';

const app = express();

const CLIENT_ID = ${clientId.startsWith('process') ? clientId : `'${clientId}'`};
const CLIENT_SECRET = process.env.${slug.toUpperCase()}_CLIENT_SECRET;
const REDIRECT_URI = '${redirectUri}';

// 1. Redirect user to ${name} Authorization Endpoint
app.get('/auth/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const url = new URL('${authUrl}');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', '${scopes}');
  url.searchParams.set('state', state);

  res.redirect(url.toString());
});

// 2. Callback Route: Exchange Authorization Code for Tokens
app.get('/api/auth/callback/${slug}', async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.status(400).send('Authorization failed: ' + error);

  try {
    ${
      isBasicAuth
        ? `const authHeader = 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64');
    const tokenResponse = await fetch('${tokenUrl}', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: REDIRECT_URI,
      }),
    });`
        : `const tokenResponse = await fetch('${tokenUrl}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code),
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });`
    }

    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(JSON.stringify(tokens));

    // Access Token is ready! Store securely in session
    res.json({ message: '${name} authentication successful!', tokens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));
`;
}

export function generatePythonSnippet(params: CodeTemplateParams): string {
  const slug = params.providerSlug.toLowerCase();
  const name = params.providerName;
  const redirectUri = params.redirectUri || `http://localhost:8000/callback`;
  const scopes = (params.scopes && params.scopes.length > 0)
    ? params.scopes.join(slug === 'slack' || slug === 'github' ? ',' : ' ')
    : 'identify email';
  const authUrl = params.authUrl || `https://${slug}.com/oauth/authorize`;
  const tokenUrl = params.tokenUrl || `https://${slug}.com/oauth/token`;
  const isBasicAuth = slug === 'zoom' || slug === 'spotify';

  return `# main.py - FastAPI + httpx OAuth 2.0 Flow
import os
import secrets
import base64
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse

app = FastAPI(title="${name} OAuth Flow")

CLIENT_ID = os.getenv("${slug.toUpperCase()}_CLIENT_ID", "your_client_id")
CLIENT_SECRET = os.getenv("${slug.toUpperCase()}_CLIENT_SECRET", "your_client_secret")
REDIRECT_URI = "${redirectUri}"

@app.get("/login")
def login():
    state = secrets.token_urlsafe(16)
    auth_url = (
        f"${authUrl}?"
        f"client_id={CLIENT_ID}&"
        f"redirect_uri={REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=${scopes}&"
        f"state={state}"
    )
    return RedirectResponse(auth_url)

@app.get("/callback")
async def callback(code: str = None, error: str = None):
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth Error: {error}")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    async with httpx.AsyncClient() as client:
        ${
          isBasicAuth
            ? `creds = f"{CLIENT_ID}:{CLIENT_SECRET}".encode("utf-8")
        headers = {
            "Authorization": f"Basic {base64.b64encode(creds).decode('utf-8')}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI
        }
        res = await client.post("${tokenUrl}", data=data, headers=headers)`
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
  const clientId = params.clientId || `YOUR_${slug.toUpperCase()}_CLIENT_ID`;
  const clientSecret = params.clientSecret || `YOUR_${slug.toUpperCase()}_CLIENT_SECRET`;
  const redirectUri = params.redirectUri || `http://localhost:3000/api/auth/callback/${slug}`;
  const scopes = (params.scopes && params.scopes.length > 0)
    ? params.scopes.join(slug === 'slack' || slug === 'github' ? ',' : ' ')
    : 'identify email';
  const authUrl = params.authUrl || `https://${slug}.com/oauth/authorize`;
  const tokenUrl = params.tokenUrl || `https://${slug}.com/oauth/token`;
  const isBasicAuth = slug === 'zoom' || slug === 'spotify';

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
