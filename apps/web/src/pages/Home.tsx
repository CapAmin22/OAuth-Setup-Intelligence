import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers, BookOpen } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { ProviderCard } from '../components/ProviderCard';
import { fetchProviders, fetchAllGuides } from '../lib/api';
import { Provider, GuideVersion } from '../types';

export const Home: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [guides, setGuides] = useState<GuideVersion[]>([]);
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

  const curatedProviders = providers.filter((p) => p.isCurated);
  const generatedProviders = providers.filter((p) => !p.isCurated);

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (generateInput.trim()) {
      navigate(`/generate?query=${encodeURIComponent(generateInput.trim())}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-5 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Phase 1 MVP · Source-Grounded Guides
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-sand-900 tracking-tight leading-[1.15] mb-4">
            Setup and Approval Intelligence for OAuth Apps
          </h1>

          <p className="text-base sm:text-lg text-sand-700 max-w-2xl mx-auto leading-relaxed mb-8">
            Clear, actionable developer runbooks for popular OAuth providers — with live,
            source-grounded AI research for unfamiliar APIs.
          </p>

          <SearchBar size="large" autoFocus={true} />
        </div>

        {/* AI Researched Guides Section (shows immediately when any custom provider is researched) */}
        {generatedProviders.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-1.5 border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  AI Researched Guides
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-sand-900 tracking-tight">
                  Recently Researched Providers
                </h2>
                <p className="text-xs sm:text-sm text-sand-700">
                  Dynamically synthesized and verified runbooks for requested OAuth providers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedProviders.map((p) => {
                const matchedGuide = guides.find(
                  (g) => g.providerSlug === p.slug || g.providerSlug === p.slug.replace(/\.[a-z0-9]+$/, '')
                );
                return <ProviderCard key={p.slug} provider={p} guide={matchedGuide} />;
              })}
            </div>
          </div>
        )}

        {/* Curated Guides Library Grid */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-sand-900 tracking-tight">
                Curated & Verified Providers
              </h2>
              <p className="text-xs sm:text-sm text-sand-700">
                Hand-verified integration runbooks with citations and time estimates.
              </p>
            </div>
            <Link
              to="/library"
              className="text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 transition-colors"
            >
              <span>View all guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {curatedProviders.map((p) => {
              const matchedGuide = guides.find((g) => g.providerSlug === p.slug);
              return <ProviderCard key={p.slug} provider={p} guide={matchedGuide} />;
            })}
          </div>
        </div>

        {/* Live Research / Generator Banner */}
        <div className="bg-gradient-to-r from-sand-100 to-amber-50 border border-sand-300/80 rounded-2xl p-6 sm:p-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" />
              Live Autonomous Research
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-sand-900 mb-2">
              Need a guide for another OAuth provider?
            </h3>
            <p className="text-sm text-sand-700 mb-5 leading-relaxed">
              Submit any provider name or website. Our research worker discovers official developer
              documentation, extracts verified scopes and redirect rules, and synthesizes a cited runbook.
            </p>

            <form onSubmit={handleGenerateSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
              <input
                type="text"
                value={generateInput}
                onChange={(e) => setGenerateInput(e.target.value)}
                placeholder="Enter provider (e.g. Linear, Asana, Dropbox)..."
                className="flex-1 bg-white border border-sand-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-sand-900"
              />
              <button
                type="submit"
                className="bg-sand-900 hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
              >
                <span>Research & Generate</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-sand-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand-700">
          <span>OAuth Setup Intelligence · Phase 1 MVP</span>
          <div className="flex items-center gap-4">
            <Link to="/library" className="hover:text-sand-900">Library</Link>
            <Link to="/api-reference" className="hover:text-sand-900">API Documentation</Link>
            <a
              href="https://github.com/CapAmin22/OAuth-Setup-Intelligence"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sand-900"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

