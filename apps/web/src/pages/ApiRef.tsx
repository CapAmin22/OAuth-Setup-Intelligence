import React, { useState } from 'react';
import { Terminal, Shield, Key, Copy, Check, FileCode, ExternalLink, Code } from 'lucide-react';

export const ApiRef: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copySnippet = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const ENDPOINTS = [
    {
      method: 'GET',
      path: '/rest/v1/providers',
      desc: 'List supported OAuth 2.0 providers with curation status, canonical domains, and aliases.',
      curl: `curl "https://brofyxeeqdxpuzggaiep.supabase.co/rest/v1/providers?select=slug,display_name,is_curated,canonical_domain" \\
  -H "apikey: sb_publishable_z2rHiIeGJWwd75IjfVwdVg_aLDszx_T"`,
      response: `[
  {
    "slug": "google",
    "display_name": "Google",
    "is_curated": true,
    "canonical_domain": "accounts.google.com"
  },
  {
    "slug": "discord",
    "display_name": "Discord",
    "is_curated": true,
    "canonical_domain": "discord.com"
  }
]`,
    },
    {
      method: 'GET',
      path: '/rest/v1/guide_versions',
      desc: 'Retrieve published guide content, step instructions, verification checks, and evidence citations.',
      curl: `curl "https://brofyxeeqdxpuzggaiep.supabase.co/rest/v1/guide_versions?status=eq.published&provider_slug=eq.discord&select=content" \\
  -H "apikey: sb_publishable_z2rHiIeGJWwd75IjfVwdVg_aLDszx_T"`,
      response: `[
  {
    "content": {
      "providerSlug": "discord",
      "providerName": "Discord",
      "version": 1,
      "evidenceQuality": { "score": 95 },
      "effort": { "lowMinutes": 15, "highMinutes": 35 },
      "steps": [ ... ]
    }
  }
]`,
    },
    {
      method: 'POST',
      path: '/rest/v1/rpc/enqueue_generation_job',
      desc: 'Enqueue an autonomous research worker job for an unfamiliar or specialized OAuth provider.',
      curl: `curl -X POST "https://brofyxeeqdxpuzggaiep.supabase.co/rest/v1/rpc/enqueue_generation_job" \\
  -H "apikey: sb_publishable_z2rHiIeGJWwd75IjfVwdVg_aLDszx_T" \\
  -H "Content-Type: application/json" \\
  -d '{"p_query": "Linear", "p_website": "https://linear.app", "p_intent": {"distribution": "external"}}'`,
      response: `{
  "job_id": "gen_job_8f2b3a",
  "state": "resolving",
  "status": "queued",
  "created_at": "2026-11-08T06:00:00Z"
}`,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-100 text-sand-800 text-xs font-semibold uppercase tracking-wider mb-3 border border-sand-200">
          <Terminal className="w-3.5 h-3.5 text-sand-700" />
          Developer API & Integration Contracts
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-sand-900 tracking-tight">
          API Reference & Integration Specs
        </h1>
        <p className="text-sm text-sand-600 mt-2 max-w-2xl leading-relaxed">
          Programmatic REST endpoints for fetching verified OAuth runbooks, reading evidence rubrics, and enqueuing background research jobs.
        </p>
      </div>

      {/* Authentication Notice Card */}
      <div className="bg-sand-900 text-sand-100 rounded-2xl p-5 sm:p-6 mb-8 border border-sand-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
            API Authentication
          </span>
          <p className="text-xs text-sand-300 leading-relaxed">
            All public endpoints require passing the public publishable anon key in the <code className="bg-sand-800 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px]">apikey</code> request header.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-sand-400 bg-sand-800 px-2.5 py-1 rounded-lg border border-sand-700">
            Base URL: https://brofyxeeqdxpuzggaiep.supabase.co
          </span>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-8">
        {ENDPOINTS.map((ep, idx) => (
          <div key={ep.path} className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 font-mono text-xs">
                <span
                  className={`font-bold px-2.5 py-1 rounded-md text-[11px] ${
                    ep.method === 'GET'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="text-sand-900 font-bold text-sm sm:text-base font-mono">
                  {ep.path}
                </span>
              </div>

              <button
                onClick={() => copySnippet(ep.curl, idx)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sand-100 hover:bg-sand-200 text-sand-800 text-xs font-semibold transition-colors self-start sm:self-auto"
                title="Copy cURL command"
              >
                {copiedIndex === idx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-sand-600" />
                )}
                <span>{copiedIndex === idx ? 'Copied cURL!' : 'Copy cURL'}</span>
              </button>
            </div>

            <p className="text-xs text-sand-600 mb-4 leading-relaxed">
              {ep.desc}
            </p>

            {/* Request cURL */}
            <div className="mb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sand-400 block mb-1.5">
                Example Request
              </span>
              <pre className="bg-[#1a1918] text-amber-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-sand-800">
                {ep.curl}
              </pre>
            </div>

            {/* Response Preview */}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block mb-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Example Response (200 OK)
              </span>
              <pre className="bg-sand-50 text-sand-900 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-sand-200">
                {ep.response}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
