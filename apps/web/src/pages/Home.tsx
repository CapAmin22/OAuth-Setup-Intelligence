import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Terminal, Bot } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { ProviderCard } from '../components/ProviderCard';
import { ProviderLogo } from '../components/ProviderLogo';
import { fetchProviders, fetchAllGuides } from '../lib/api';
import { Provider, GuideVersion } from '../types';

export const Home: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [guides, setGuides] = useState<GuideVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [topGenerateInput, setTopGenerateInput] = useState('');
  const [bottomGenerateInput, setBottomGenerateInput] = useState('');
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

  const handleTopGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topGenerateInput.trim()) {
      navigate(`/generate?query=${encodeURIComponent(topGenerateInput.trim())}`);
    }
  };

  const handleBottomGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bottomGenerateInput.trim()) {
      navigate(`/generate?query=${encodeURIComponent(bottomGenerateInput.trim())}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">

        {/* ── Hero Section ── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-sand-100 text-sand-700 text-xs font-semibold uppercase tracking-wider mb-5 border border-sand-200">
            Verified OAuth 2.0 Runbooks · Zero Hallucinations
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-sand-900 tracking-tight leading-[1.15] mb-4">
            Setup &amp; Approval Intelligence<br className="hidden sm:block" /> for OAuth Apps
          </h1>

          <p className="text-sm sm:text-base text-sand-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Battle-tested runbooks, 1-click endpoints, and ready-to-run code snippets for popular OAuth providers — with autonomous AI research for any unlisted API.
          </p>

          {/* Primary Search Bar */}
          <SearchBar size="large" autoFocus={true} />

          {/* Popular Quick-Launch Pills */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap text-xs">
            <span className="text-sand-500 font-medium mr-1">Popular:</span>
            {[
              { slug: 'google', name: 'Google' },
              { slug: 'github', name: 'GitHub' },
              { slug: 'slack', name: 'Slack' },
              { slug: 'discord', name: 'Discord' },
              { slug: 'linear', name: 'Linear' },
              { slug: 'spotify', name: 'Spotify' },
              { slug: 'notion', name: 'Notion' },
            ].map((item) => (
              <Link
                key={item.slug}
                to={`/guides/${item.slug}/v/1`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-sand-200 hover:border-amber-400 text-sand-800 hover:text-amber-900 font-medium transition-all shadow-2xs hover:shadow-xs"
              >
                <ProviderLogo slug={item.slug} name={item.name} size="sm" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Top Quick Guide Generator Bar (Under Search Bar) */}
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-sand-50 via-amber-50/70 to-sand-50 border border-amber-200/80 rounded-2xl p-3 sm:p-3.5 shadow-2xs text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shadow-2xs">
                    <Zap className="w-4 h-4 fill-amber-500/20" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-sand-900 tracking-tight">Need an unlisted provider?</span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 border border-amber-200 px-1.5 py-0.5 rounded-md">
                        AI Generator
                      </span>
                    </div>
                    <p className="text-[11px] text-sand-500 hidden sm:block">
                      Extract verified OAuth 2.0 endpoints &amp; specs from any doc URL
                    </p>
                  </div>
                </div>

                <form onSubmit={handleTopGenerateSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={topGenerateInput}
                    onChange={(e) => setTopGenerateInput(e.target.value)}
                    placeholder="Enter provider (e.g. Asana, Loom, Zoho)..."
                    className="w-full sm:w-64 bg-white border border-sand-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sand-900 transition-all shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={!topGenerateInput.trim()}
                    className="shrink-0 inline-flex items-center gap-1 px-3.5 py-2 bg-sand-900 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <span>Generate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3-Step Value Workflow ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 sm:mb-14">
          {[
            {
              step: '1',
              colorClass: 'bg-emerald-50 border-emerald-200',
              icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
              title: 'Pick or Synthesize',
              desc: 'Select a pre-verified provider or submit any API doc URL to autonomously crawl and extract OAuth 2.0 specifications.',
            },
            {
              step: '2',
              colorClass: 'bg-amber-50 border-amber-200',
              icon: <Terminal className="w-5 h-5 text-amber-700" />,
              title: 'Drop-in Code & .env',
              desc: 'Export verified callback rules, scope delimiters (space vs comma), and production code in TypeScript, Python, or cURL.',
            },
            {
              step: '3',
              colorClass: 'bg-sky-50 border-sky-200',
              icon: <Bot className="w-5 h-5 text-sky-700" />,
              title: 'Solve Gotchas with Copilot',
              desc: 'Press ⌘J on any guide for in-context gotcha triage. Use the Blocker Wizard for side-by-side wrong vs. fixed diffs.',
            },
          ].map(({ step, colorClass, icon, title, desc }) => (
            <div key={step} className="p-5 rounded-2xl bg-white border border-sand-200 shadow-2xs hover:shadow-xs transition-shadow flex gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${colorClass}`}>
                {icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-sand-900 mb-1">{title}</h3>
                <p className="text-xs text-sand-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── AI Researched Guides (only when present) ── */}
        {generatedProviders.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-1.5 border border-amber-200">
                  <Zap className="w-3 h-3" />
                  AI Researched
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-sand-900 tracking-tight">
                  Recently Researched Providers
                </h2>
                <p className="text-xs sm:text-sm text-sand-600">
                  Dynamically synthesized and verified runbooks.
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

        {/* ── Curated Library ── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-sand-900 tracking-tight">
                Curated &amp; Verified Providers
              </h2>
              <p className="text-xs sm:text-sm text-sand-600">
                Hand-verified runbooks with citations and time estimates.
              </p>
            </div>
            <Link
              to="/library"
              className="text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1 transition-colors"
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

        {/* ── Bottom Live Autonomous Research / Generator Banner ── */}
        <div className="bg-gradient-to-r from-sand-100 to-amber-50 border border-sand-300/80 rounded-2xl p-6 sm:p-8 mb-12 shadow-2xs">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" />
              <span>Live Autonomous Research</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-sand-900 mb-2">
              Need a guide for another OAuth provider?
            </h3>
            <p className="text-sm text-sand-700 mb-5 leading-relaxed">
              Submit any provider name or website. Our research worker discovers official developer
              documentation, extracts verified scopes and redirect rules, and synthesizes a cited runbook.
            </p>

            <form onSubmit={handleBottomGenerateSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
              <input
                type="text"
                value={bottomGenerateInput}
                onChange={(e) => setBottomGenerateInput(e.target.value)}
                placeholder="Enter provider (e.g. Linear, Asana, Dropbox)..."
                className="flex-1 bg-white border border-sand-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-sand-900 shadow-2xs"
              />
              <button
                type="submit"
                disabled={!bottomGenerateInput.trim()}
                className="bg-sand-900 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Research &amp; Generate</span>
                <ArrowRight className="w-4 h-4 text-sand-300" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-sand-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand-700">
          <span className="font-medium text-sand-800">OAuth Setup Intelligence</span>
          <div className="flex items-center gap-4">
            <Link to="/library" className="hover:text-sand-900 transition-colors">Library</Link>
            <Link to="/generate" className="hover:text-sand-900 transition-colors">AI Generator</Link>
            <Link to="/api-reference" className="hover:text-sand-900 transition-colors">API Documentation</Link>
            <a
              href="https://github.com/CapAmin22/OAuth-Setup-Intelligence"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sand-900 transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
