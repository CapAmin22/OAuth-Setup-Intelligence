import React from 'react';
import { Terminal, Shield, Key } from 'lucide-react';

export const ApiRef: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-sand-900 tracking-tight">API Reference & Integration Contracts</h1>
        <p className="text-sm text-sand-700 mt-2">
          Programmatic access to verified OAuth runbooks and research job submission.
        </p>
      </div>

      <div className="space-y-6">
        {/* Endpoint 1 */}
        <div className="bg-white border border-sand-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2 font-mono text-xs">
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">GET</span>
            <span className="text-sand-900 font-semibold">/rest/v1/providers</span>
          </div>
          <p className="text-xs text-sand-700 mb-3">
            List supported providers with curation status, aliases, and official domains.
          </p>
          <pre className="bg-sand-900 text-sand-100 p-3 rounded-lg text-[11px] font-mono overflow-x-auto">
{`curl "https://brofyxeeqdxpuzggaiep.supabase.co/rest/v1/providers?select=slug,display_name,is_curated" \\
  -H "apikey: <SUPABASE_ANON_KEY>"`}
          </pre>
        </div>

        {/* Endpoint 2 */}
        <div className="bg-white border border-sand-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2 font-mono text-xs">
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">GET</span>
            <span className="text-sand-900 font-semibold">/rest/v1/guide_versions</span>
          </div>
          <p className="text-xs text-sand-700 mb-3">
            Retrieve published guide content, verification rubric, and evidence citations.
          </p>
          <pre className="bg-sand-900 text-sand-100 p-3 rounded-lg text-[11px] font-mono overflow-x-auto">
{`curl "https://brofyxeeqdxpuzggaiep.supabase.co/rest/v1/guide_versions?status=eq.published&select=content" \\
  -H "apikey: <SUPABASE_ANON_KEY>"`}
          </pre>
        </div>

        {/* Endpoint 3 */}
        <div className="bg-white border border-sand-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2 font-mono text-xs">
            <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">POST</span>
            <span className="text-sand-900 font-semibold">/rest/v1/rpc/enqueue_generation_job</span>
          </div>
          <p className="text-xs text-sand-700 mb-3">
            Enqueue a background research job for an unfamiliar provider.
          </p>
          <pre className="bg-sand-900 text-sand-100 p-3 rounded-lg text-[11px] font-mono overflow-x-auto">
{`curl -X POST "https://brofyxeeqdxpuzggaiep.supabase.co/rest/v1/rpc/enqueue_generation_job" \\
  -H "apikey: <SUPABASE_ANON_KEY>" \\
  -H "Authorization: Bearer <USER_JWT>" \\
  -H "Content-Type: application/json" \\
  -d '{"p_query": "Linear", "p_website": "https://linear.app"}'`}
          </pre>
        </div>
      </div>
    </div>
  );
};
