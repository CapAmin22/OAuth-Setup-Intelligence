import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Globe,
  Shield,
  ArrowRight,
  Check,
  Zap,
  Clock,
  ShieldCheck,
  ExternalLink,
  Lock,
  Layers,
  Code,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { enqueueJob } from '../lib/api';

const POPULAR_SUGGESTIONS = [
  { name: 'Google Calendar', website: 'https://developers.google.com/calendar/api' },
  { name: 'Shopify', website: 'https://shopify.dev/docs/apps/auth/oauth' },
  { name: 'Supabase', website: 'https://supabase.com/docs/guides/auth/social-login' },
  { name: 'Asana', website: 'https://developers.asana.com/docs/oauth' },
  { name: 'Box', website: 'https://developer.box.com/guides/authentication/oauth2/' },
  { name: 'Twilio', website: 'https://www.twilio.com/docs/usage/api' },
  { name: 'Airtable', website: 'https://airtable.com/developers/web/api/oauth-reference' },
];

const CAPABILITY_PRESETS = [
  { id: 'sso', label: 'User Authentication (SSO)', desc: 'Identity verification & profile' },
  { id: 'read_write', label: 'Read & Write Resources', desc: 'CRUD operations on data' },
  { id: 'offline', label: 'Offline Access / Refresh Tokens', desc: 'Background jobs & continuous sync' },
  { id: 'webhooks', label: 'Webhooks & Real-time Events', desc: 'Event-driven subscriptions' },
  { id: 'admin', label: 'Admin & Team Controls', desc: 'Workspace settings & memberships' },
];

export const Intake: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const initialWebsite = searchParams.get('website') || '';

  const [query, setQuery] = useState(initialQuery);
  const [website, setWebsite] = useState(initialWebsite);
  const [distribution, setDistribution] = useState<'external' | 'internal'>('external');
  const [selectedCaps, setSelectedCaps] = useState<string[]>([
    'User Authentication (SSO)',
    'Offline Access / Refresh Tokens',
  ]);
  const [customScopes, setCustomScopes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialQuery && !query) setQuery(initialQuery);
    if (initialWebsite && !website) setWebsite(initialWebsite);
  }, [initialQuery, initialWebsite]);

  // Keyboard shortcut: Cmd+Enter or Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (query.trim()) {
          executeSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query, website, distribution, selectedCaps, customScopes]);

  const toggleCapability = (capLabel: string) => {
    if (selectedCaps.includes(capLabel)) {
      setSelectedCaps(selectedCaps.filter((c) => c !== capLabel));
    } else {
      setSelectedCaps([...selectedCaps, capLabel]);
    }
  };

  const applySuggestion = (sug: { name: string; website: string }) => {
    setQuery(sug.name);
    setWebsite(sug.website);
  };

  const executeSubmit = async () => {
    if (!query.trim() || submitting) return;

    setSubmitting(true);
    const combinedCaps = [...selectedCaps];
    if (customScopes.trim()) {
      combinedCaps.push(`Custom Scopes: ${customScopes.trim()}`);
    }

    try {
      const result = await enqueueJob(query.trim(), website.trim(), {
        distribution,
        capabilities: combinedCaps,
        customScopes: customScopes.trim(),
      });
      const webParam = website.trim() ? `&website=${encodeURIComponent(website.trim())}` : '';
      const distParam = `&distribution=${encodeURIComponent(distribution)}`;
      const capsParam = combinedCaps.length > 0 ? `&capabilities=${encodeURIComponent(combinedCaps.join(','))}` : '';
      navigate(`/jobs/${result.jobId}?query=${encodeURIComponent(query.trim())}${webParam}${distParam}${capsParam}`);
    } catch (err) {
      console.error(err);
      const webParam = website.trim() ? `&website=${encodeURIComponent(website.trim())}` : '';
      const distParam = `&distribution=${encodeURIComponent(distribution)}`;
      const capsParam = combinedCaps.length > 0 ? `&capabilities=${encodeURIComponent(combinedCaps.join(','))}` : '';
      navigate(`/jobs/mock-${Date.now()}?query=${encodeURIComponent(query.trim())}${webParam}${distParam}${capsParam}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSubmit();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-3.5 border border-amber-500/25 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Autonomous Documentation Research Agent
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-sand-900 tracking-tight leading-tight">
          Request AI-Generated OAuth Runbook
        </h1>
        <p className="text-sm sm:text-base text-sand-700 mt-2.5 max-w-2xl mx-auto leading-relaxed">
          Need an integration guide for an unlisted provider or specialized API? Our autonomous research agent crawls official documentation, extracts exact endpoints and callback rules, and synthesizes a verified runbook.
        </p>
      </div>

      {/* Main Two-Column Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Intake Form Console (7 of 12 cols) */}
        <div className="lg:col-span-7 bg-white border border-sand-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field 1: Provider Name with Smart Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-sand-900 flex items-center gap-1">
                  <span>Provider or API Name</span>
                  <span className="text-amber-600">*</span>
                </label>
                <span className="text-[11px] text-sand-400 font-mono">e.g. Google Calendar, Shopify</span>
              </div>
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter service or API (e.g. Google Calendar, Supabase, Box)..."
                className="w-full bg-sand-50/60 border border-sand-300 rounded-xl px-4 py-3 text-sm text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-medium transition-all"
                autoFocus
              />

              {/* Quick suggestion pills */}
              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap text-xs">
                <span className="text-[11px] text-sand-400 font-medium">Quick suggestions:</span>
                {POPULAR_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.name}
                    type="button"
                    onClick={() => applySuggestion(sug)}
                    className="px-2 py-0.5 rounded-md bg-sand-100/70 hover:bg-amber-100 text-sand-700 hover:text-amber-900 text-[11px] transition-colors border border-sand-200/60 font-medium"
                  >
                    {sug.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2: Developer Website or Documentation URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-sand-900">
                  Documentation or Developer Portal URL <span className="text-sand-400 font-normal font-sans">(Optional)</span>
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono border border-emerald-200">
                  SSRF Guard Active
                </span>
              </div>
              <div className="relative">
                <Globe className="w-4 h-4 text-sand-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://docs.example.com/oauth (or leave blank to auto-discover)"
                  className="w-full bg-sand-50/60 border border-sand-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-mono text-xs transition-all"
                />
              </div>
              <p className="text-[11px] text-sand-500 mt-1.5">
                Leave blank to let our agent autonomously locate official OAuth 2.0 specifications.
              </p>
            </div>

            {/* Field 3: Target Distribution (Compact Toggle) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-sand-900 mb-2">
                Target OAuth Distribution
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDistribution('external')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    distribution === 'external'
                      ? 'border-amber-600 bg-amber-500/10 ring-1 ring-amber-600 shadow-2xs'
                      : 'border-sand-200 bg-sand-50/40 hover:border-sand-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-sand-900">External / Multi-Tenant</span>
                    {distribution === 'external' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <span className="text-[11px] text-sand-600 block leading-tight">
                    Public apps serving multiple third-party accounts & tenants
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDistribution('internal')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    distribution === 'internal'
                      ? 'border-amber-600 bg-amber-500/10 ring-1 ring-amber-600 shadow-2xs'
                      : 'border-sand-200 bg-sand-50/40 hover:border-sand-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-sand-900">Internal / Single-Org</span>
                    {distribution === 'internal' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <span className="text-[11px] text-sand-600 block leading-tight">
                    Private apps restricted to your company workspace
                  </span>
                </button>
              </div>
            </div>

            {/* Field 4: Desired Capabilities & Scopes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-sand-900 mb-2">
                Desired Capabilities & Scope Categories
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {CAPABILITY_PRESETS.map((cap) => {
                  const isSelected = selectedCaps.includes(cap.label);
                  return (
                    <button
                      type="button"
                      key={cap.id}
                      onClick={() => toggleCapability(cap.label)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-sand-900 bg-sand-900 text-white shadow-xs'
                          : 'border-sand-200 bg-sand-50/40 hover:bg-sand-50 text-sand-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 text-[10px] ${
                          isSelected ? 'bg-amber-400 text-sand-950 font-bold' : 'border border-sand-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0">
                        <span className={`block text-xs font-semibold leading-tight ${isSelected ? 'text-white' : 'text-sand-900'}`}>
                          {cap.label}
                        </span>
                        <span className={`text-[10px] block mt-0.5 leading-tight ${isSelected ? 'text-sand-300' : 'text-sand-500'}`}>
                          {cap.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Scopes Optional Input */}
              <div>
                <label className="block text-[11px] font-medium text-sand-600 mb-1">
                  Specific Scope Identifiers (Optional)
                </label>
                <input
                  type="text"
                  value={customScopes}
                  onChange={(e) => setCustomScopes(e.target.value)}
                  placeholder="e.g. calendar.readonly, https://www.googleapis.com/auth/calendar.events"
                  className="w-full bg-sand-50/60 border border-sand-300 rounded-xl px-3 py-2 text-xs font-mono text-sand-900 outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !query.trim()}
                className="w-full bg-sand-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2.5 text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed group"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span>Enqueuing Autonomous Research Worker...</span>
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Synthesize OAuth Runbook with AI</span>
                    <span className="hidden sm:inline-block text-[11px] font-mono text-sand-400 bg-sand-800 px-2 py-0.5 rounded ml-1">
                      ~60s SLA
                    </span>
                    <ArrowRight className="w-4 h-4 text-sand-300 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              <div className="flex items-center justify-between text-[11px] text-sand-500 mt-2.5 px-1">
                <span>Free during developer preview · No API key required</span>
                <span className="hidden sm:inline font-mono text-sand-400">Shortcut: ⌘ + Enter</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Engine Architecture & Trust Guarantees (5 of 12 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* How the Agent Works Card */}
          <div className="bg-sand-900 text-white rounded-2xl p-6 shadow-md border border-sand-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Stage Autonomous Agent</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
              How Autonomous Research Works
            </h3>
            <p className="text-xs text-sand-300 leading-relaxed mb-4">
              Our agent avoids hallucinated APIs by executing a strict 4-stage verification loop grounded in official vendor docs:
            </p>

            <div className="space-y-3 text-xs border-t border-sand-800 pt-4">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span className="font-semibold text-white block">Identity & Domain Resolution</span>
                  <span className="text-[11px] text-sand-400">Validates official domain and blocks SSRF / internal IPs.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span className="font-semibold text-white block">Portal & Endpoint Discovery</span>
                  <span className="text-[11px] text-sand-400">Crawls developer documentation to extract Auth, Token, and Profile endpoints.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <span className="font-semibold text-white block">Fact Extraction & Scopes</span>
                  <span className="text-[11px] text-sand-400">Extracts grant types (PKCE vs client_secret) and delimiter rules (space vs comma).</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <span className="font-semibold text-emerald-300 block">Citation & Hash Grounding</span>
                  <span className="text-[11px] text-sand-400">Every assertion is linked to an official source SHA-256 hash.</span>
                </div>
              </div>
            </div>
          </div>

          {/* SLA & Confidence Gates */}
          <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-xs text-xs space-y-3">
            <div className="flex items-center gap-2 text-sand-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Production Guarantees</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-sand-50 border border-sand-100">
                <span className="text-[10px] font-mono uppercase text-sand-500 block mb-1">
                  Speed SLA
                </span>
                <span className="font-bold text-sand-900 text-sm block">≤ 120s</span>
                <span className="text-[10px] text-sand-500">Observed avg: 69s</span>
              </div>

              <div className="p-3 rounded-xl bg-sand-50 border border-sand-100">
                <span className="text-[10px] font-mono uppercase text-sand-500 block mb-1">
                  Confidence Gate
                </span>
                <span className="font-bold text-emerald-700 text-sm block">≥ 90% Score</span>
                <span className="text-[10px] text-sand-500">Sub-90 held for review</span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-600/20 rounded-xl text-amber-900 text-[11px] leading-relaxed">
              <strong>Need a popular provider right now?</strong> Curated runbooks for Google, GitHub, Slack, Discord, Linear, Spotify, and HubSpot are instantly available in the{' '}
              <Link to="/library" className="underline font-bold text-amber-950">
                Library
              </Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
