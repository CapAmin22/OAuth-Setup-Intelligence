import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, Globe, AlertCircle, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { fetchJob } from '../lib/api';
import { JobState } from '../types';

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

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [terminalState, setTerminalState] = useState<string | null>(null);
  const [discoveredDomains, setDiscoveredDomains] = useState<string[]>([]);

  // Simulation timer for smooth preview if live worker isn't running on the user's terminal right now
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    // Check live DB job status
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

    // If mock/standalone preview, advance through stages automatically over ~15s
    if (id?.startsWith('mock-')) {
      const stageTimer = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev >= STAGES.length - 1) {
            setTerminalState('awaiting_review');
            clearInterval(stageTimer);
            return prev;
          }
          if (prev === 1) {
            setDiscoveredDomains([`developers.${query.toLowerCase()}.com`, `docs.${query.toLowerCase()}.com`]);
          }
          return prev + 1;
        });
      }, 2500);
      return () => {
        clearInterval(stageTimer);
        clearInterval(pollInterval);
        active = false;
      };
    }

    return () => {
      clearInterval(pollInterval);
      active = false;
    };
  }, [id, query]);

  const currentStage = STAGES[currentStageIndex];
  const isDone = currentStageIndex === STAGES.length - 1 || terminalState === 'awaiting_review';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-sand-100 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-1.5 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Live Autonomous Research
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-sand-900">
              Researching "{query}"
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-sand-700 block">Elapsed Time</span>
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

        {/* Completion CTA */}
        {isDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-bold text-emerald-950 text-base mb-1">
              Autonomous Research Complete!
            </h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto mb-4">
              Your OAuth setup runbook has been synthesized, fact-checked against citations, and saved.
            </p>
            <Link
              to="/library"
              className="inline-flex items-center gap-2 bg-sand-900 hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <span>View Generated Guide in Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
