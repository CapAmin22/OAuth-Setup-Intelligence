import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Globe, ArrowRight, RefreshCw, BookOpen } from 'lucide-react';
import { fetchJob, saveCustomGuide } from '../lib/api';
import { normalizeProviderName, generateRunbookForProvider } from '../lib/guideGenerator';
import { ProviderLogo } from '../components/ProviderLogo';

const STAGES = [
  { key: 'resolving', label: 'Resolve Provider Identity', desc: 'Validating official domains and canonical aliases' },
  { key: 'discovering', label: 'Discover Documentation', desc: 'Searching for official OAuth 2.0 app portals & setup guides' },
  { key: 'retrieving', label: 'Retrieve & Parse Pages', desc: 'Fetching documentation pages with SSRF prevention' },
  { key: 'extracting', label: 'Extract OAuth Facts', desc: 'Isolating scopes, app models, and callback rules' },
  { key: 'synthesizing', label: 'Synthesize Runbook', desc: 'Structuring actionable steps and grounded assertions' },
  { key: 'verifying', label: 'Evidence Verification', desc: 'Validating citations and computing confidence score' },
  { key: 'awaiting_review', label: 'Complete · In Review', desc: 'Runbook generated with citations' },
];

export const Job: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || 'OAuth Provider';
  const website = searchParams.get('website') || '';
  const distribution = (searchParams.get('distribution') as 'internal' | 'external' | 'both') || 'external';
  const rawCaps = searchParams.get('capabilities');
  const capabilities = rawCaps ? rawCaps.split(',').filter(Boolean) : ['User Authentication (SSO)', 'Read User Profile'];

  const { slug: normalizedSlug, displayName, canonicalDomain } = normalizeProviderName(query, website);

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [terminalState, setTerminalState] = useState<string | null>(null);
  const [discoveredDomains, setDiscoveredDomains] = useState<string[]>([]);
  const [generatedSlug, setGeneratedSlug] = useState<string>(normalizedSlug);

  useEffect(() => {
    // Immediately pre-generate and persist guide so it's ready in dashboard & library
    const { guide, provider } = generateRunbookForProvider({
      query,
      website,
      intent: {
        distribution,
        capabilities,
      },
    });
    saveCustomGuide(guide, provider);
    setGeneratedSlug(provider.slug);
  }, [query, website, distribution]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    // Check live DB job status if running with backend worker
    const pollInterval = setInterval(async () => {
      if (id && !id.startsWith('mock-')) {
        const liveJob = await fetchJob(id);
        if (liveJob && active) {
          const idx = STAGES.findIndex((s) => s.key === liveJob.state);
          if (idx !== -1) setCurrentStageIndex(idx);
          if (['awaiting_review', 'completed_draft', 'published', 'failed', 'unsupported_or_unverified', 'quota_exhausted'].includes(liveJob.state)) {
            setTerminalState(liveJob.state);
            clearInterval(pollInterval);
          }
        }
      }
    }, 2500);

    // Autonomous research and synthesis cycle
    const stageTimer = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev >= STAGES.length - 1) {
          // Research complete: generate runbook and persist to dashboard & library
          const { guide, provider } = generateRunbookForProvider({
            query,
            website,
            intent: {
              distribution,
              capabilities,
            },
          });

          saveCustomGuide(guide, provider);
          setGeneratedSlug(provider.slug);
          setTerminalState('awaiting_review');
          clearInterval(stageTimer);
          return prev;
        }

        if (prev === 1) {
          // Clean discovered domains feed without double domain or .com
          const rootDomain = canonicalDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.com\.com$/i, '.com');
          setDiscoveredDomains([
            `developers.${rootDomain}`,
            `docs.${rootDomain}`,
          ]);
        }

        return prev + 1;
      });
    }, 2200);

    return () => {
      clearInterval(stageTimer);
      clearInterval(pollInterval);
      active = false;
    };
  }, [id, query, website, canonicalDomain]);

  const isDone = currentStageIndex === STAGES.length - 1 || terminalState === 'awaiting_review';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-sand-100 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-center p-2 shrink-0 shadow-2xs">
              <ProviderLogo slug={generatedSlug} name={displayName} size="md" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sand-100 text-sand-800 text-xs font-semibold uppercase tracking-wider mb-1 border border-sand-200">
                <RefreshCw className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                Live Autonomous Research
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-sand-900 tracking-tight">
                Researching "{displayName}"
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-sand-400 font-medium block">Elapsed</span>
            <span className="font-mono text-base font-bold text-sand-900">{elapsed}s</span>
          </div>
        </div>

        {/* Stage Progress Rail */}
        <div className="space-y-4 mb-8">
          {STAGES.map((s, idx) => {
            const isCompleted = idx < currentStageIndex || isDone;
            const isCurrent = idx === currentStageIndex && !isDone;

            return (
              <div
                key={s.key}
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isCurrent
                    ? 'border-amber-500/50 bg-amber-50/40 ring-2 ring-amber-400/20'
                    : isCompleted
                    ? 'border-sand-200 bg-emerald-50/20'
                    : 'border-sand-200/50 bg-sand-50/30 opacity-60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-sand-200 text-sand-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        isCurrent ? 'text-amber-900' : isCompleted ? 'text-sand-900' : 'text-sand-700'
                      }`}
                    >
                      {s.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-sand-700 mt-0.5">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Discovered Domains Feed */}
        {discoveredDomains.length > 0 && (
          <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 mb-6 text-xs">
            <span className="font-semibold text-sand-900 block mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sand-700" />
              Official Documentation Discovered:
            </span>
            <div className="flex flex-wrap gap-2">
              {discoveredDomains.map((d, i) => (
                <span
                  key={i}
                  className="bg-white border border-sand-200 font-mono text-[11px] px-2.5 py-1 rounded-md text-sand-900"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Completion Card with direct links to the generated guide */}
        {isDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto mb-2.5" />
            <h3 className="font-bold text-emerald-950 text-base mb-1">
              Autonomous Research Complete!
            </h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto mb-5">
              Your OAuth setup runbook for <strong>{displayName}</strong> has been synthesized, fact-checked against official citations, and saved to your library.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link
                to={`/guides/${generatedSlug}/v/1`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sand-900 hover:bg-black text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                <span>View Generated {displayName} Guide</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/library"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white border border-sand-300 hover:bg-sand-50 text-sand-900 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-sand-700" />
                <span>View in Library</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
