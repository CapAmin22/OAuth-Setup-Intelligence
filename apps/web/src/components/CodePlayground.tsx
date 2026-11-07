import React, { useState } from 'react';
import { Code, Copy, Check, Terminal, ExternalLink, Sliders } from 'lucide-react';
import {
  generateNextAuthSnippet,
  generateNodeSnippet,
  generatePythonSnippet,
  generateCurlSnippet,
  CodeTemplateParams,
} from '../lib/codeTemplates';

interface CodePlaygroundProps {
  providerSlug: string;
  providerName: string;
  defaultScopes?: string[];
  authUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
}

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  providerSlug,
  providerName,
  defaultScopes,
  authUrl,
  tokenUrl,
  userInfoUrl,
}) => {
  const [tab, setTab] = useState<'nextauth' | 'node' | 'python' | 'curl'>('nextauth');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const slug = providerSlug.toLowerCase();
  const effectiveClientId = clientId.trim() || `your_${slug}_client_id`;
  const effectiveClientSecret = clientSecret.trim() || `your_${slug}_client_secret`;
  const effectiveRedirect = redirectUri.trim() || `http://localhost:3000/api/auth/callback/${slug}`;

  const templateParams: CodeTemplateParams = {
    providerSlug,
    providerName,
    clientId: effectiveClientId,
    clientSecret: effectiveClientSecret,
    redirectUri: effectiveRedirect,
    scopes: defaultScopes,
    authUrl,
    tokenUrl,
    userInfoUrl,
  };

  let code = '';
  let language = 'typescript';
  switch (tab) {
    case 'nextauth':
      code = generateNextAuthSnippet(templateParams);
      language = 'typescript';
      break;
    case 'node':
      code = generateNodeSnippet(templateParams);
      language = 'javascript';
      break;
    case 'python':
      code = generatePythonSnippet(templateParams);
      language = 'python';
      break;
    case 'curl':
      code = generateCurlSnippet(templateParams);
      language = 'bash';
      break;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-sand-200 rounded-2xl shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-sand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sand-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sand-900 text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
            {'</>'}
          </div>
          <div>
            <h3 className="font-bold text-sand-900 text-base sm:text-lg flex items-center gap-2">
              Implementation Code Playground
              <span className="text-xs font-mono font-medium text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                {providerName}
              </span>
            </h3>
            <p className="text-xs text-sand-700">
              Ready-to-run authentication code with correct endpoints, grant types, and parameters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              showConfig
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-sand-300 text-sand-700 hover:text-sand-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showConfig ? 'Hide Variables' : 'Customize Credentials'}</span>
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sand-900 hover:bg-black text-white text-xs font-semibold transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Code!' : 'Copy Snippet'}</span>
          </button>
        </div>
      </div>

      {/* Customizable Variables Bar (Collapsible) */}
      {showConfig && (
        <div className="p-4 bg-sand-50/90 border-b border-sand-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in slide-in-from-top-2 duration-150">
          <div>
            <label className="block text-[11px] font-bold text-sand-900 uppercase mb-1">
              Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder={`e.g. ${slug}-client-id-123`}
              className="w-full bg-white border border-sand-300 rounded-lg px-2.5 py-1.5 text-xs text-sand-900 outline-none focus:ring-1 focus:ring-amber-600"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-sand-900 uppercase mb-1">
              Client Secret
            </label>
            <input
              type="text"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder={`e.g. sec_xyz987...`}
              className="w-full bg-white border border-sand-300 rounded-lg px-2.5 py-1.5 text-xs text-sand-900 outline-none focus:ring-1 focus:ring-amber-600"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-sand-900 uppercase mb-1">
              Callback URL (Redirect URI)
            </label>
            <input
              type="text"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              placeholder={`http://localhost:3000/api/auth/callback/${slug}`}
              className="w-full bg-white border border-sand-300 rounded-lg px-2.5 py-1.5 text-xs text-sand-900 outline-none focus:ring-1 focus:ring-amber-600"
            />
          </div>
        </div>
      )}

      {/* Language Tabs */}
      <div className="flex border-b border-sand-200 bg-sand-100/50 px-4 pt-2 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setTab('nextauth')}
          className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
            tab === 'nextauth'
              ? 'border-sand-900 text-sand-900 bg-white rounded-t-lg'
              : 'border-transparent text-sand-700 hover:text-sand-900'
          }`}
        >
          <span>NextAuth / Auth.js</span>
        </button>
        <button
          onClick={() => setTab('node')}
          className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
            tab === 'node'
              ? 'border-sand-900 text-sand-900 bg-white rounded-t-lg'
              : 'border-transparent text-sand-700 hover:text-sand-900'
          }`}
        >
          <span>Node.js Express</span>
        </button>
        <button
          onClick={() => setTab('python')}
          className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
            tab === 'python'
              ? 'border-sand-900 text-sand-900 bg-white rounded-t-lg'
              : 'border-transparent text-sand-700 hover:text-sand-900'
          }`}
        >
          <span>Python (FastAPI)</span>
        </button>
        <button
          onClick={() => setTab('curl')}
          className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
            tab === 'curl'
              ? 'border-sand-900 text-sand-900 bg-white rounded-t-lg'
              : 'border-transparent text-sand-700 hover:text-sand-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>cURL CLI</span>
        </button>
      </div>

      {/* Code Editor Preview */}
      <div className="relative bg-[#1a1918] p-4 sm:p-5 overflow-x-auto">
        <pre className="font-mono text-xs sm:text-[13px] text-amber-100 leading-relaxed font-normal whitespace-pre">
          {code}
        </pre>
      </div>

      {/* Card Footer */}
      <div className="p-3 bg-sand-50 border-t border-sand-200 flex items-center justify-between text-xs text-sand-700">
        <span>Framework-compliant boilerplate tailored for {providerName}.</span>
        <span className="font-mono text-[11px] text-sand-700">Language: {language}</span>
      </div>
    </div>
  );
};

