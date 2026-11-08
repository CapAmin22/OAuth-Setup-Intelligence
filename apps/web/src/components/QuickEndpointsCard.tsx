import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Key, ShieldCheck, Terminal, FileCode } from 'lucide-react';
import { PROVIDER_ENDPOINTS, ProviderEndpointConfig } from '../lib/codeTemplates';

interface QuickEndpointsCardProps {
  providerSlug: string;
  providerName: string;
  defaultScopes?: string[];
  canonicalDomain?: string;
}

const DEVELOPER_PORTALS: Record<string, { name: string; url: string }> = {
  google: { name: 'Google Cloud Console Credentials', url: 'https://console.cloud.google.com/apis/credentials' },
  github: { name: 'GitHub Developer Settings', url: 'https://github.com/settings/developers' },
  slack: { name: 'Slack API Console', url: 'https://api.slack.com/apps' },
  notion: { name: 'Notion My Integrations', url: 'https://www.notion.so/my-integrations' },
  salesforce: { name: 'Salesforce App Manager', url: 'https://login.salesforce.com/' },
  discord: { name: 'Discord Developer Portal', url: 'https://discord.com/developers/applications' },
  spotify: { name: 'Spotify Developer Dashboard', url: 'https://developer.spotify.com/dashboard' },
  linear: { name: 'Linear API Settings', url: 'https://linear.app/settings/api' },
  hubspot: { name: 'HubSpot Developer Portal', url: 'https://app.hubspot.com/developer/' },
  zoom: { name: 'Zoom App Marketplace', url: 'https://marketplace.zoom.us/' },
  airtable: { name: 'Airtable Developer Hub', url: 'https://airtable.com/create/oauth' },
  shopify: { name: 'Shopify Partners Console', url: 'https://partners.shopify.com' },
  supabase: { name: 'Supabase Dashboard Auth', url: 'https://supabase.com/dashboard/project/_/auth/providers' },
  box: { name: 'Box Developer Console', url: 'https://app.box.com/developers/console' },
  asana: { name: 'Asana Developer App Console', url: 'https://app.asana.com/0/my-apps' },
  'google-calendar': { name: 'Google Cloud Credentials', url: 'https://console.cloud.google.com/apis/credentials' },
  gcal: { name: 'Google Cloud Credentials', url: 'https://console.cloud.google.com/apis/credentials' },
  loom: { name: 'Loom Developer Portal', url: 'https://www.loom.com/developers' },
};

export const QuickEndpointsCard: React.FC<QuickEndpointsCardProps> = ({
  providerSlug,
  providerName,
  defaultScopes,
  canonicalDomain,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const slug = providerSlug.toLowerCase();
  const endpoints: ProviderEndpointConfig = PROVIDER_ENDPOINTS[slug] || {
    authUrl: `https://${slug}.com/oauth/authorize`,
    tokenUrl: `https://${slug}.com/oauth/token`,
    userUrl: `https://${slug}.com/api/v1/user`,
    scopeDelimiter: ' ',
    authMethod: 'body',
  };

  const portal = DEVELOPER_PORTALS[slug] || {
    name: `${providerName} Developer Portal`,
    url: `https://${canonicalDomain || `${slug}.com`}`,
  };

  const scopesString = defaultScopes && defaultScopes.length > 0
    ? defaultScopes.join(endpoints.scopeDelimiter)
    : (slug === 'google' ? 'openid email profile' : slug === 'github' ? 'read:user,user:email' : 'identity');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyEnvTemplate = () => {
    const envPrefix = slug.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const envText = `# ${providerName} OAuth 2.0 Credentials
${envPrefix}_CLIENT_ID=your_${slug}_client_id
${envPrefix}_CLIENT_SECRET=your_${slug}_client_secret
${envPrefix}_REDIRECT_URI=http://localhost:3000/api/auth/callback/${slug}
${envPrefix}_SCOPES="${scopesString}"
`;
    copyToClipboard(envText, 'env');
  };

  return (
    <div className="bg-sand-900 text-sand-50 rounded-2xl p-5 sm:p-6 mb-8 shadow-md border border-sand-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sand-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base tracking-tight flex items-center gap-2">
              <span>{providerName} OAuth 2.0 Quick Endpoints</span>
              <span className="text-[10px] uppercase font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                Auth: {endpoints.authMethod}
              </span>
            </h3>
            <span className="text-xs text-sand-400">
              Direct URLs for your OAuth client & environment variables
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copyEnvTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sand-800 hover:bg-sand-700 text-sand-200 text-xs font-semibold border border-sand-700 transition-colors shadow-xs"
            title="Copy .env template variables"
          >
            {copiedKey === 'env' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{copiedKey === 'env' ? 'Copied .env!' : 'Copy .env Template'}</span>
          </button>

          <a
            href={portal.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <span>Open {portal.name.split(' ')[0]} Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 text-xs">
        {/* Authorization URL */}
        <div className="bg-sand-950/60 rounded-xl p-3 border border-sand-800/80 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-sand-400 uppercase font-mono tracking-wider block mb-0.5">
              Authorization URL (GET)
            </span>
            <span className="font-mono text-sand-100 truncate block text-[11px]">
              {endpoints.authUrl}
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(endpoints.authUrl, 'authUrl')}
            className="p-1.5 rounded-md hover:bg-sand-800 text-sand-400 hover:text-white transition-colors shrink-0"
            title="Copy Authorization URL"
          >
            {copiedKey === 'authUrl' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Token URL */}
        <div className="bg-sand-950/60 rounded-xl p-3 border border-sand-800/80 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-sand-400 uppercase font-mono tracking-wider block mb-0.5">
              Token URL (POST)
            </span>
            <span className="font-mono text-sand-100 truncate block text-[11px]">
              {endpoints.tokenUrl}
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(endpoints.tokenUrl, 'tokenUrl')}
            className="p-1.5 rounded-md hover:bg-sand-800 text-sand-400 hover:text-white transition-colors shrink-0"
            title="Copy Token URL"
          >
            {copiedKey === 'tokenUrl' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* User Profile URL */}
        <div className="bg-sand-950/60 rounded-xl p-3 border border-sand-800/80 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-sand-400 uppercase font-mono tracking-wider block mb-0.5">
              User Profile URL (GET)
            </span>
            <span className="font-mono text-sand-100 truncate block text-[11px]">
              {endpoints.userUrl}
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(endpoints.userUrl, 'userUrl')}
            className="p-1.5 rounded-md hover:bg-sand-800 text-sand-400 hover:text-white transition-colors shrink-0"
            title="Copy User Profile URL"
          >
            {copiedKey === 'userUrl' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Default Scopes */}
        <div className="bg-sand-950/60 rounded-xl p-3 border border-sand-800/80 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-sand-400 uppercase font-mono tracking-wider block mb-0.5">
              Recommended Scopes (delimited by '{endpoints.scopeDelimiter === ' ' ? 'space' : 'comma'}')
            </span>
            <span className="font-mono text-sand-100 truncate block text-[11px]">
              {scopesString}
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(scopesString, 'scopes')}
            className="p-1.5 rounded-md hover:bg-sand-800 text-sand-400 hover:text-white transition-colors shrink-0"
            title="Copy Scopes"
          >
            {copiedKey === 'scopes' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

