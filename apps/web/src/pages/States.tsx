import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, AlertTriangle, UserCheck, Scale, Zap, 
  ArrowRight, ShieldCheck, CheckCircle2, ExternalLink 
} from 'lucide-react';

export const States: React.FC = () => {
  const [selectedDisambig, setSelectedDisambig] = useState<'square' | 'squarespace' | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-sand-800 bg-sand-100 border border-sand-300 px-3 py-1 rounded-full text-[11px] font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Zero-Hallucination Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold text-sand-900 tracking-tight">
          Edge Cases & Honest States
        </h1>
        <p className="text-xs sm:text-sm text-sand-700 mt-2 max-w-lg mx-auto leading-relaxed">
          When AI systems guess, developers waste hours debugging phantom configurations.
          OAuth Setup Intelligence communicates ambiguity, missing evidence, and boundaries honestly.
        </p>
      </div>

      <div className="space-y-6">
        {/* State 1: Needs Clarification (Disambiguation) */}
        <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2.5 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>State 1: Needs Clarification (Disambiguation)</span>
          </div>
          <h2 className="text-lg font-bold text-sand-900 mb-1">Which provider do you mean?</h2>
          <p className="text-xs text-sand-700 mb-4">
            Several distinct OAuth providers match query <code className="bg-sand-100 px-1 py-0.5 rounded text-sand-900 font-mono text-[11px]">"Square"</code>. Pick your target application:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setSelectedDisambig('square')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedDisambig === 'square'
                  ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                  : 'border-sand-200 bg-sand-50/50 hover:bg-sand-100/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-sand-900">Square (Block)</span>
                <span className="text-[10px] bg-sand-200 px-2 py-0.5 rounded font-mono text-sand-700">squareup.com</span>
              </div>
              <p className="text-[11px] text-sand-600">
                Payment processing, point-of-sale terminals, and merchant merchant APIs.
              </p>
            </button>

            <button
              onClick={() => setSelectedDisambig('squarespace')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedDisambig === 'squarespace'
                  ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                  : 'border-sand-200 bg-sand-50/50 hover:bg-sand-100/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-sand-900">Squarespace</span>
                <span className="text-[10px] bg-sand-200 px-2 py-0.5 rounded font-mono text-sand-700">squarespace.com</span>
              </div>
              <p className="text-[11px] text-sand-600">
                Website builder, CMS extensions, and e-commerce store management.
              </p>
            </button>
          </div>

          {selectedDisambig && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              <span>Ready to research selected provider: <strong>{selectedDisambig === 'square' ? 'Square POS' : 'Squarespace CMS'}</strong></span>
              <Link to={`/generate?q=${selectedDisambig}`} className="font-bold underline text-emerald-800">Proceed &rarr;</Link>
            </div>
          )}
        </div>

        {/* State 2: Unverified OAuth Support */}
        <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2.5 text-sand-800 text-xs font-bold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>State 2: Unverified OAuth 2.0 Support</span>
          </div>
          <h2 className="text-lg font-bold text-sand-900 mb-1">Standard OAuth 2.0 not documented</h2>
          <p className="text-xs text-sand-700 leading-relaxed mb-4">
            Official developer documentation for this service documents API Key authentication and HTTP Basic Auth,
            but provides no public OAuth 2.0 Authorization Code grant or token endpoints.
          </p>

          <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200/80 text-xs text-sand-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded bg-sand-200 text-sand-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              i
            </div>
            <div>
              <span className="font-semibold text-sand-900 block mb-0.5">Recommended Next Action:</span>
              <p className="text-[11px] text-sand-700 leading-relaxed">
                Use Static API Key authentication with environment variables, or contact the provider's enterprise partnership team for private SSO/SAML integration.
              </p>
            </div>
          </div>
        </div>

        {/* State 3: Human Handoff */}
        <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2.5 text-sky-800 text-xs font-bold uppercase tracking-wider mb-2">
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>State 3: Human Handoff (Authentication Wall)</span>
          </div>
          <h2 className="text-lg font-bold text-sand-900 mb-1">Step requires your proprietary account login</h2>
          <p className="text-xs text-sand-700 leading-relaxed mb-4">
            Our automated crawlers do not authenticate into developer consoles or impersonate organizations.
            When a provider hides client secrets behind MFA or internal workspace permissions, we flag the exact step for human execution.
          </p>

          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Human action required on Step 3:</strong> Log into your Salesforce Developer Edition org, navigate to Setup &rarr; App Manager, and copy the Consumer Key.
            </div>
          </div>
        </div>

        {/* State 4: Sources Disagree (Conflict Gate) */}
        <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2.5 text-red-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Scale className="w-4 h-4 text-red-600" />
            <span>State 4: Conflicting Official Sources</span>
          </div>
          <h2 className="text-lg font-bold text-sand-900 mb-1">Documentation disagreement detected</h2>
          <p className="text-xs text-sand-700 leading-relaxed mb-4">
            Source A states that the token endpoint accepts JSON request bodies, while Source B specifies <code className="bg-sand-100 px-1 py-0.5 rounded text-sand-900 font-mono text-[11px]">application/x-www-form-urlencoded</code>.
            Automatic publication is halted until a staff engineer verifies the live endpoint.
          </p>

          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900">
            <span>Status: Held in Review Queue (Staff Engineer Alerted)</span>
            <Link to="/admin/reviewer" className="font-bold underline text-red-800">Open Reviewer &rarr;</Link>
          </div>
        </div>

        {/* State 5: Quota Reached */}
        <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2.5 text-sand-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>State 5: Daily Free Research Limit Reached</span>
          </div>
          <h2 className="text-lg font-bold text-sand-900 mb-1">Daily community research capacity reached</h2>
          <p className="text-xs text-sand-700 leading-relaxed mb-4">
            To maintain zero-cost availability, live research queries are subject to a daily neuron budget.
            All 10 curated guides and previously researched runbooks remain permanently readable.
          </p>

          <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200 text-xs text-sand-800 flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] text-sand-700">Resets daily at 00:00 UTC. We will never auto-bill or force payment.</span>
            <Link to="/library" className="px-3 py-1.5 rounded-lg bg-sand-900 hover:bg-black text-white text-xs font-bold transition-colors">
              Browse Cached Library
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
