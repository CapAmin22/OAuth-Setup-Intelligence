import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { ProviderCard } from '../components/ProviderCard';
import { fetchProviders, fetchAllGuides } from '../lib/api';
import { Provider, GuideVersion } from '../types';

export const Library: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [guides, setGuides] = useState<GuideVersion[]>([]);
  const [filter, setFilter] = useState<'all' | 'curated' | 'generated'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [generateInput, setGenerateInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => {
      Promise.all([fetchProviders(), fetchAllGuides()]).then(([p, g]) => {
        setProviders(p);
        setGuides(g);
        setLoading(false);
      });
    };
    load();
    window.addEventListener('oauth_custom_guide_saved', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('oauth_custom_guide_saved', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'curated') return p.isCurated;
    if (filter === 'generated') return !p.isCurated;
    return true;
  });

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (generateInput.trim()) {
      navigate(`/generate?query=${encodeURIComponent(generateInput.trim())}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-sand-900 tracking-tight">
          OAuth Provider Library
        </h1>
        <p className="text-xs sm:text-sm text-sand-600 mt-1">
          Verified runbooks, requirements, and approval guides for OAuth integrations.
        </p>
      </div>

      {/* Dual-Action Bar: Search + AI Generate, side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">

        {/* Left: Browse / Search */}
        <div className="bg-white border border-sand-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-sand-100 border border-sand-200 flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-sand-600" />
            </div>
            <span className="text-xs font-bold text-sand-900 uppercase tracking-wide">Browse Library</span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-sand-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by provider name or domain..."
              className="w-full bg-sand-50 border border-sand-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-sand-900 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              autoFocus
            />
          </div>
          {/* Filter Pills inline */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {[
              { key: 'all', label: `All (${providers.length})` },
              { key: 'curated', label: 'Curated', icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" /> },
              { key: 'generated', label: 'AI Research', icon: <Zap className="w-3 h-3 text-amber-600" /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key as 'all' | 'curated' | 'generated')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filter === key
                    ? 'bg-sand-900 text-white shadow-xs'
                    : 'bg-sand-100 text-sand-700 hover:bg-sand-200 border border-sand-200'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: AI Generate */}
        <div className="bg-gradient-to-br from-amber-50 to-sand-50 border border-amber-200/60 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">AI Research</span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-md">
              Any Provider
            </span>
          </div>
          <p className="text-[11px] text-sand-600 mb-3 leading-relaxed">
            Not in the library? Enter any provider name or docs URL — our agent crawls official docs and synthesizes a verified runbook.
          </p>
          <form onSubmit={handleGenerateSubmit} className="flex gap-2">
            <input
              type="text"
              value={generateInput}
              onChange={(e) => setGenerateInput(e.target.value)}
              placeholder="e.g. Asana, Dropbox, Figma..."
              className="flex-1 min-w-0 bg-white border border-sand-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sand-900 transition-all"
            />
            <button
              type="submit"
              disabled={!generateInput.trim()}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-sand-900 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <span>Generate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Provider Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((p) => {
          const pBase = p.slug.toLowerCase().replace(/^(docs|api|app|developer|developers|login|auth|www)\./, '').replace(/\.[a-z0-9]+$/, '');
          const matchedGuide = guides.find((g) => {
            const gBase = g.providerSlug.toLowerCase().replace(/^(docs|api|app|developer|developers|login|auth|www)\./, '').replace(/\.[a-z0-9]+$/, '');
            return (
              g.providerSlug.toLowerCase() === p.slug.toLowerCase() ||
              g.providerSlug.toLowerCase() === p.canonicalDomain?.toLowerCase() ||
              (Boolean(pBase) && Boolean(gBase) && pBase === gBase) ||
              g.providerName.toLowerCase() === p.displayName.toLowerCase()
            );
          });
          return <ProviderCard key={p.slug} provider={p} guide={matchedGuide} />;
        })}
      </div>

      {/* Empty State — no results */}
      {filteredProviders.length === 0 && !loading && (
        <div className="text-center py-16 bg-white border border-sand-200 rounded-2xl mt-4 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-sand-700 text-sm font-medium">
            No providers matched <span className="font-bold text-sand-900">"{search}"</span>.
          </p>
          <p className="text-xs text-sand-500">Use AI Research to synthesize a guide for this provider.</p>
          <Link
            to={`/generate?query=${encodeURIComponent(search)}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-sand-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Research &amp; Generate Guide for "{search}"
          </Link>
        </div>
      )}
    </div>
  );
};

