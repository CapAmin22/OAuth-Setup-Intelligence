import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle2, Sparkles } from 'lucide-react';
import { ProviderCard } from '../components/ProviderCard';
import { fetchProviders, fetchAllGuides } from '../lib/api';
import { Provider, GuideVersion } from '../types';

export const Library: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [guides, setGuides] = useState<GuideVersion[]>([]);
  const [filter, setFilter] = useState<'all' | 'curated' | 'generated'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProviders(), fetchAllGuides()]).then(([p, g]) => {
      setProviders(p);
      setGuides(g);
      setLoading(false);
    });
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-sand-900 tracking-tight">
            OAuth Provider Library
          </h1>
          <p className="text-xs sm:text-sm text-sand-700 mt-1">
            Browse verified OAuth integration runbooks, requirements, and approval guides.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex rounded-lg bg-sand-200/60 p-1 text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === 'all' ? 'bg-white text-sand-900 shadow-xs' : 'text-sand-700 hover:text-sand-900'
            }`}
          >
            All Guides ({providers.length})
          </button>
          <button
            onClick={() => setFilter('curated')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
              filter === 'curated' ? 'bg-white text-sand-900 shadow-xs' : 'text-sand-700 hover:text-sand-900'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Curated
          </button>
          <button
            onClick={() => setFilter('generated')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
              filter === 'generated' ? 'bg-white text-sand-900 shadow-xs' : 'text-sand-700 hover:text-sand-900'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            AI Research
          </button>
        </div>
      </div>

      {/* Filter Input */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-sand-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by provider name or domain..."
          className="w-full bg-white border border-sand-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((p) => {
          const matchedGuide = guides.find((g) => g.providerSlug === p.slug);
          return <ProviderCard key={p.slug} provider={p} guide={matchedGuide} />;
        })}
      </div>

      {filteredProviders.length === 0 && (
        <div className="text-center py-16 bg-white border border-sand-200 rounded-xl mt-4">
          <p className="text-sand-700 text-sm mb-3">No providers matched "{search}".</p>
          <a
            href={`/generate?query=${encodeURIComponent(search)}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sand-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Generate New Guide for "{search}"
          </a>
        </div>
      )}
    </div>
  );
};
