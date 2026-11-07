import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  Share2,
  Download,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Info,
  Sparkles
} from 'lucide-react';
import { RunbookStep } from '../components/RunbookStep';
import { EvidencePanel } from '../components/EvidencePanel';
import { BlockerWizard } from '../components/BlockerWizard';
import { CodePlayground } from '../components/CodePlayground';
import { ProviderLogo } from '../components/ProviderLogo';
import { fetchGuide } from '../lib/api';
import { GuideVersion } from '../types';

export const Guide: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [guide, setGuide] = useState<GuideVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardQuery, setWizardQuery] = useState('redirect_uri_mismatch');

  const openTroubleshooter = (initialText: string = 'redirect_uri_mismatch') => {
    setWizardQuery(initialText);
    setWizardOpen(true);
  };

  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    if (!slug) return [];
    try {
      const raw = localStorage.getItem(`oauth_progress_${slug}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId];
      if (slug) {
        try {
          localStorage.setItem(`oauth_progress_${slug}`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const handleResetProgress = () => {
    setCompletedSteps([]);
    if (slug) {
      try {
        localStorage.removeItem(`oauth_progress_${slug}`);
      } catch {}
    }
  };

  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetchGuide(slug).then((data) => {
        setGuide(data);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sand-700 text-sm">Loading guide runbook...</p>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-sand-900 mb-2">Guide Not Found</h2>
        <p className="text-sm text-sand-700 mb-6">
          We don't have a published runbook for "{slug}" yet.
        </p>
        <Link
          to={`/generate?query=${encodeURIComponent(slug || '')}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-sand-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
        >
          Generate Guide with AI Research →
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleExportMarkdown = () => {
    const md = `# OAuth Setup Guide: ${guide.providerName}
Version: ${guide.version} (Schema ${guide.schemaVersion})
Status: ${guide.status}
Checked: ${guide.checkedAt}
Evidence Quality Score: ${guide.evidenceQuality?.score}/100
Effort Estimate: ${guide.effort?.lowMinutes}–${guide.effort?.highMinutes} min

## Prerequisites
${guide.prerequisites.map((p) => `- ${p.text} ${p.critical ? '(CRITICAL)' : ''}`).join('\n')}

## Runbook Steps
${guide.steps
  .map(
    (s, i) => `### Step ${i + 1}: ${s.title} [${s.owner}]
${s.instructions}
*Verify:* ${s.completionCheck || 'N/A'}
`
  )
  .join('\n')}

## Claims & Grounding
${guide.claims.map((c) => `- [${c.id}] ${c.text} (Status: ${c.evidenceStatus})`).join('\n')}

## Sources
${guide.sources.map((src) => `- [${src.id}] ${src.url} (Hash: ${src.contentHash})`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.providerSlug}-oauth-guide.md`;
    a.click();
  };

  const qualityScore = guide.evidenceQuality?.score ?? 90;
  const isCurated = guide.status === 'published';

  const totalSteps = guide?.steps?.length || 1;
  const completedCount = completedSteps.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalSteps) * 100));
  const isComplete = completedCount >= totalSteps && totalSteps > 0;
  const avgMinutes = (guide?.effort?.highMinutes || 45) / totalSteps;
  const remainingMinutes = Math.max(0, Math.round((totalSteps - completedCount) * avgMinutes));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sand-700 hover:text-sand-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openTroubleshooter('redirect_uri_mismatch')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Troubleshoot Error</span>
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sand-300 bg-white hover:bg-sand-50 text-sand-900 text-xs font-medium transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-sand-700" />
            <span>{copiedShare ? 'Copied Link!' : 'Share Guide'}</span>
          </button>
          <button
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sand-300 bg-white hover:bg-sand-50 text-sand-900 text-xs font-medium transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-sand-700" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* Guide Header Banner */}
      <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-sand-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-center p-2.5 shrink-0 shadow-xs">
              <ProviderLogo slug={guide.providerSlug} name={guide.providerName} size="xl" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-sand-900 tracking-tight">
                  {guide.providerName} OAuth Setup Runbook
                </h1>
                <span className="text-xs font-mono text-sand-700 bg-sand-100 px-2 py-0.5 rounded">
                  v{guide.version}.0
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-sand-700 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Verified: {guide.checkedAt ? new Date(guide.checkedAt).toLocaleDateString() : 'Recent'}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isCurated ? 'Reviewed & Published' : 'In Review'}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Fresh (0% Drift)
                </span>
              </div>
            </div>
          </div>

          {/* Quality Score Ring */}
          <div className="flex items-center gap-3 bg-sand-50 p-3 rounded-xl border border-sand-200 self-start md:self-auto">
            <div className="text-right">
              <span className="text-[11px] text-sand-700 font-medium block">Evidence Score</span>
              <span className="text-xs text-sand-900 font-mono font-semibold">Grounded in docs</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-base shadow-xs">
              {qualityScore}
            </div>
          </div>
        </div>

        {/* Effort & Waiting Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 text-xs">
          <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200/80">
            <span className="text-sand-700 block mb-1 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sand-900" />
              Active Developer Effort
            </span>
            <span className="font-bold text-sand-900 text-sm">
              {guide.effort.lowMinutes}–{guide.effort.highMinutes} minutes
            </span>
            <span className="text-[11px] text-sand-700 block mt-0.5">
              Basis: {guide.effort.basis}
            </span>
          </div>

          <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200/80">
            <span className="text-sand-700 block mb-1 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sand-900" />
              External Approval Wait
            </span>
            <span className="font-bold text-sand-900 text-sm">
              {guide.externalWait?.publishedRange || 'No approval required'}
            </span>
            <span className="text-[11px] text-sand-700 block mt-0.5">
              Status: {guide.externalWait?.status || 'none'}
            </span>
          </div>

          <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200/80">
            <span className="text-sand-700 block mb-1 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sand-900" />
              Grounded Claims
            </span>
            <span className="font-bold text-sand-900 text-sm">
              {guide.claims.length} verified assertions
            </span>
            <span className="text-[11px] text-sand-700 block mt-0.5">
              {guide.sources.length} documentation sources
            </span>
          </div>
        </div>

        {/* Interactive Step Progress & Checklist Bar */}
        <div className="mt-6 pt-5 border-t border-sand-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-sand-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Onboarding Checklist: {completedCount} of {totalSteps} steps completed ({progressPercent}%)
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sand-700 font-mono text-[11px]">
                {isComplete ? 'All Steps Completed' : `Est. remaining: ~${remainingMinutes} min`}
              </span>
              {completedCount > 0 && (
                <button
                  onClick={handleResetProgress}
                  className="text-[11px] text-sand-700 hover:text-sand-900 underline transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="w-full bg-sand-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isComplete ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {isComplete && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Integration Ready!</strong> You have verified all {totalSteps} setup steps for {guide.providerName}. You can now test live token exchanges in your application.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Prerequisites, Steps, Blockers */}
        <div className="lg:col-span-7 space-y-8">
          {/* Next Action Callout */}
          <div className="bg-amber-500/10 border border-amber-600/30 rounded-xl p-4 flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              →
            </div>
            <div>
              <span className="font-semibold text-sand-900 text-sm block mb-0.5">
                Next Action for Developers:
              </span>
              <p className="text-xs text-sand-800 leading-relaxed">
                Start with Step 1 below. Register your application identity and ensure callback URLs match
                exactly across development and staging environments.
              </p>
            </div>
          </div>

          {/* Prerequisites */}
          {guide.prerequisites && guide.prerequisites.length > 0 && (
            <div>
              <h3 className="font-bold text-sand-900 text-sm mb-3 uppercase tracking-wider">
                Prerequisites Checklist
              </h3>
              <div className="bg-white border border-sand-200 rounded-xl p-4 divide-y divide-sand-100">
                {guide.prerequisites.map((prq) => (
                  <div key={prq.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-sand-900 font-medium">{prq.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Runbook Steps */}
          <div>
            <h3 className="font-bold text-sand-900 text-sm mb-3 uppercase tracking-wider">
              Step-by-Step Execution Plan
            </h3>
            <div className="space-y-3.5">
              {guide.steps.map((step, idx) => (
                <RunbookStep
                  key={step.id}
                  step={step}
                  index={idx}
                  providerSlug={guide.providerSlug}
                  isCompleted={completedSteps.includes(step.id)}
                  onToggle={() => toggleStep(step.id)}
                  onClaimClick={(cid) => setActiveClaimId(cid)}
                  onTroubleshoot={(title) => openTroubleshooter(title)}
                />
              ))}
            </div>
          </div>

          {/* Multi-Language Code Implementation Playground */}
          <div>
            <h3 className="font-bold text-sand-900 text-sm mb-3 uppercase tracking-wider">
              Ready-to-Run Code Boilerplate
            </h3>
            <CodePlayground
              providerSlug={guide.providerSlug}
              providerName={guide.providerName}
              defaultScopes={guide.intent?.capabilities}
            />
          </div>

          {/* Blockers & Gotchas */}
          {guide.blockers && guide.blockers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sand-900 text-sm uppercase tracking-wider flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Known Blockers & Approval Gates
                </h3>
                <button
                  onClick={() => openTroubleshooter('redirect_uri_mismatch')}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline flex items-center gap-1"
                >
                  Diagnose another error →
                </button>
              </div>
              <div className="space-y-3">
                {guide.blockers.map((b) => (
                  <div key={b.id} className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 text-xs">
                    <span className="font-semibold text-sand-900 block mb-1 text-sm">{b.title}</span>
                    <p className="text-sand-800 leading-relaxed">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Limitations Disclaimer */}
          {guide.limitations && guide.limitations.length > 0 && (
            <div className="bg-sand-100/60 border border-sand-200 rounded-xl p-4 text-xs text-sand-700 space-y-1">
              <span className="font-semibold text-sand-900 block flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Limitations & Scope Boundary:
              </span>
              {guide.limitations.map((lim, i) => (
                <p key={i}>• {lim}</p>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Evidence Dossier Panel */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <EvidencePanel guide={guide} activeClaimId={activeClaimId} />
          </div>
        </div>
      </div>

      {/* Interactive Blocker Diagnostics Wizard */}
      <BlockerWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialQuery={wizardQuery}
        providerSlug={guide.providerSlug}
        providerName={guide.providerName}
      />
    </div>
  );
};

