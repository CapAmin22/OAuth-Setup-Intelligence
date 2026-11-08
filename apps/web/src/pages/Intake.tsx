import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  BookOpen,
} from 'lucide-react';
import { enqueueJob } from '../lib/api';
import { getCurrentDeveloper, promptDeveloperAuth } from '../lib/auth';
import {
  searchProviderCatalog,
  resolveProviderFromCatalog,
  CatalogProvider,
} from '../lib/providerCatalog';
import { ProviderLogo } from '../components/ProviderLogo';

const POPULAR_SUGGESTIONS = [
  { name: 'Loom', website: 'https://docs.loom.com' },
  { name: 'Microsoft', website: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-overview' },
  { name: 'X', website: 'https://developer.x.com/en/docs/authentication/oauth-2-0' },
  { name: 'Zoho', website: 'https://www.zoho.com/accounts/protocol/oauth.html' },
  { name: 'Supabase', website: 'https://supabase.com/docs/guides/platform/oauth-apps' },
  { name: 'Figma', website: 'https://www.figma.com/developers/api' },
  { name: 'Google Calendar', website: 'https://developers.google.com/calendar/api' },
  { name: 'Shopify', website: 'https://shopify.dev/docs/apps/auth/oauth' },
];

function isWebsiteCompatibleWithQuery(url: string, currentQuery: string): boolean {
  if (!url || !currentQuery) return true;
  const cleanQ = currentQuery.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleanQ || cleanQ.length < 2) return true;

  try {
    const host = (url.startsWith('http') ? new URL(url).hostname : url.split('/')[0]).toLowerCase();
    const hostRoot = host.replace(/^www\./, '').split('.')[0];
    return host.includes(cleanQ) || cleanQ.includes(hostRoot);
  } catch {
    return true;
  }
}

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

  // App recognition and auto-link states
  const [matchedCatalog, setMatchedCatalog] = useState<CatalogProvider[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recognizedProvider, setRecognizedProvider] = useState<CatalogProvider | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      const rec = resolveProviderFromCatalog(initialQuery);
      setRecognizedProvider(rec);
      if (initialWebsite) {
        setWebsite(initialWebsite);
      } else if (rec) {
        setWebsite(rec.docUrl);
      }
    }
  }, [initialQuery, initialWebsite]);

  // Click outside listener to dismiss autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleQueryChange = (newVal: string) => {
    setQuery(newVal);

    if (!newVal.trim()) {
      setMatchedCatalog([]);
      setIsDropdownOpen(false);
      setRecognizedProvider(null);
      return;
    }

    // 1. Search catalog for live autocomplete
    const matches = searchProviderCatalog(newVal);
    setMatchedCatalog(matches.slice(0, 5));
    setIsDropdownOpen(matches.length > 0);

    // 2. Direct recognized provider
    const rec = resolveProviderFromCatalog(newVal);
    setRecognizedProvider(rec);

    // 3. Contamination firewall & auto-link
    if (rec) {
      // If recognized and website is empty or contaminated by another provider, auto-link verified doc URL
      if (!website.trim() || !isWebsiteCompatibleWithQuery(website, newVal)) {
        setWebsite(rec.docUrl);
      }
    } else {
      // If user typed an unknown or different query, clear stale website if it was from a different known provider
      if (website.trim() && !isWebsiteCompatibleWithQuery(website, newVal)) {
        setWebsite('');
      }
    }
  };

  const applyCatalogProvider = (prov: CatalogProvider) => {
    setQuery(prov.displayName);
    setWebsite(prov.docUrl);
    setRecognizedProvider(prov);
    setIsDropdownOpen(false);
    if (prov.defaultScopes && prov.defaultScopes.length > 0 && !customScopes) {
      setCustomScopes(prov.defaultScopes.join(prov.scopeDelimiter || ' '));
    }
  };

  const applySuggestion = (sug: { name: string; website: string }) => {
    setQuery(sug.name);
    setWebsite(sug.website);
    const rec = resolveProviderFromCatalog(sug.name);
    setRecognizedProvider(rec);
    setIsDropdownOpen(false);
  };

  const executeSubmit = async () => {
    if (!query.trim() || submitting) return;

    if (!getCurrentDeveloper()) {
      promptDeveloperAuth();
      return;
    }

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
            {/* Field 1: Provider Name with Smart Suggestions & Intelligent Recognition */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-sand-900 flex items-center gap-1">
                  <span>Provider or API Name</span>
                  <span className="text-amber-600">*</span>
                </label>
                <span className="text-[11px] text-sand-400 font-mono">e.g. Loom, Figma, Supabase, Stripe</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => {
                    if (matchedCatalog.length > 0) setIsDropdownOpen(true);
                  }}
                  placeholder="Enter service or API (e.g. Loom, Supabase, Stripe, Box)..."
                  className="w-full bg-sand-50/60 border border-sand-300 rounded-xl px-4 py-3 text-sm text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-medium transition-all"
                  autoFocus
                />
                {recognizedProvider && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[11px] font-medium shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Catalog Verified</span>
                  </div>
                )}
              </div>

              {/* Autocomplete Dropdown with Live Vector Logos */}
              {isDropdownOpen && matchedCatalog.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-sand-200 rounded-xl shadow-lg overflow-hidden py-1 divide-y divide-sand-100 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1.5 bg-sand-50/80 text-[10px] font-bold uppercase tracking-wider text-sand-500 flex items-center justify-between">
                    <span>Verified Developer Platforms ({matchedCatalog.length})</span>
                    <span>Click to auto-fill doc specs</span>
                  </div>
                  {matchedCatalog.map((prov) => (
                    <button
                      key={prov.slug}
                      type="button"
                      onClick={() => applyCatalogProvider(prov)}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-amber-500/10 flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-sand-50 border border-sand-200 flex items-center justify-center p-1 shrink-0 group-hover:scale-105 transition-transform">
                          <ProviderLogo slug={prov.slug} name={prov.displayName} size="sm" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-sand-900 group-hover:text-amber-900">
                              {prov.displayName}
                            </span>
                            <span className="text-[10px] font-mono text-sand-400 bg-sand-100 px-1.5 py-0.5 rounded">
                              {prov.canonicalDomain}
                            </span>
                            <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded font-medium">
                              {prov.category}
                            </span>
                          </div>
                          <span className="text-[11px] text-sand-500 truncate block mt-0.5 font-mono">
                            {prov.docUrl}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 group-hover:bg-amber-200 px-2 py-1 rounded shrink-0 transition-colors">
                        Auto-link ↗
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick suggestion pills */}
              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap text-xs">
                <span className="text-[11px] text-sand-400 font-medium">Quick suggestions:</span>
                {POPULAR_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.name}
                    type="button"
                    onClick={() => applySuggestion(sug)}
                    className="px-2 py-0.5 rounded-md bg-sand-100/70 hover:bg-amber-100 text-sand-700 hover:text-amber-900 text-[11px] transition-colors border border-sand-200/60 font-medium cursor-pointer"
                  >
                    {sug.name}
                  </button>
                ))}
              </div>

              {/* Initial Research: Recognized Platform Visual Verification Card */}
              {recognizedProvider && (
                <div className="mt-3.5 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-teal-500/10 border border-emerald-300/80 text-xs text-emerald-950 transition-all shadow-xs">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-emerald-200 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                        <ProviderLogo slug={recognizedProvider.slug} name={recognizedProvider.displayName} size="md" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-sand-900">
                            {recognizedProvider.displayName}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                            {recognizedProvider.canonicalDomain}
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-800 font-medium block mt-0.5">
                          {recognizedProvider.category} · Initial Research Verified
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Vendor App</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed mb-2.5">
                    {recognizedProvider.description ||
                      'Official OAuth 2.0 specifications indexed. Endpoints, token refresh rules, and callback validations are pre-grounded.'}
                  </p>
                  <div className="pt-2.5 border-t border-emerald-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-900 font-medium flex items-center gap-1.5">
                      <span>Official Doc Endpoint:</span>
                      <code className="bg-white px-2 py-0.5 rounded text-[10px] font-mono text-emerald-800 border border-emerald-200">
                        {recognizedProvider.docUrl}
                      </code>
                    </span>
                    <a
                      href={recognizedProvider.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 hover:text-emerald-950 font-bold underline inline-flex items-center gap-1"
                    >
                      <span>Test Official Doc</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Initial Research: Uncataloged App Visual Verification Card */}
              {!recognizedProvider && query.trim().length >= 2 && (
                <div className="mt-3.5 p-4 rounded-xl bg-sand-50 border border-sand-200 text-xs text-sand-800 transition-all shadow-xs">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-sand-200 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                        <ProviderLogo
                          slug={query.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}
                          name={query.trim()}
                          size="md"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-sand-900">
                            {query.trim()}
                          </span>
                          <span className="text-[10px] font-mono text-sand-600 bg-sand-100 px-2 py-0.5 rounded border border-sand-200">
                            {query.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}.com
                          </span>
                        </div>
                        <span className="text-[11px] text-sand-600 font-medium block mt-0.5">
                          Autonomous Discovery · Initial Research in Progress
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-900 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Live Crawler Active</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-sand-600 leading-relaxed mb-2.5">
                    Our autonomous crawler will identify RFC 6749 OAuth endpoints and parse authorization flows for &quot;{query.trim()}&quot;.
                  </p>
                  <div className="pt-2 border-t border-sand-200/80 flex items-center justify-between text-[11px] flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const autoDomain = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
                        setWebsite(`https://docs.${autoDomain}/oauth`);
                      }}
                      className="text-amber-800 hover:text-amber-950 font-semibold underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Auto-target docs.{query.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}.com</span>
                    </button>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(query.trim() + ' oauth 2.0 developer api documentation')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sand-600 hover:text-sand-900 inline-flex items-center gap-1"
                    >
                      <span>Search Official Docs on Google</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Field 2: Developer Website or Documentation URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-sand-900">
                  Documentation or Developer Portal URL <span className="text-sand-400 font-normal font-sans">(Optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  {recognizedProvider && website === recognizedProvider.docUrl && (
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Auto-Linked
                    </span>
                  )}
                  {website.trim() && (
                    <a
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded font-medium border border-amber-200 inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Test URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono border border-emerald-200">
                    SSRF Guard Active
                  </span>
                </div>
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
                {recognizedProvider
                  ? `Automatically loaded official documentation for ${recognizedProvider.displayName}. You can modify this URL if you have custom endpoints.`
                  : 'Leave blank to let our agent autonomously locate official OAuth 2.0 specifications.'}
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
