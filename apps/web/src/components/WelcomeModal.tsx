import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Terminal,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Bot,
  Layers,
  Key,
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  developerName?: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  developerName,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('oauth_welcome_dismissed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sand-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white border border-sand-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-sand-500 hover:text-sand-900 hover:bg-sand-100 transition-colors cursor-pointer"
          title="Close tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator Header */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
              Developer Tour · {step} of {totalSteps}
            </span>
            {developerName && (
              <span className="text-[11px] font-medium text-sand-600 hidden sm:inline">
                Welcome, {developerName.split(' ')[0]}!
              </span>
            )}
          </div>

          <div className="flex gap-1.5 w-24">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step >= s ? 'bg-amber-600' : 'bg-sand-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Slide 1: Curated Runbooks */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sand-900 tracking-tight">
                1. Production-Tested OAuth Runbooks
              </h2>
              <p className="text-xs sm:text-sm text-sand-700 mt-2 leading-relaxed">
                Skip scouring outdated tutorials or conflicting vendor forums. Get battle-tested runbooks for Google, GitHub, Slack, Discord, Supabase, Airtable, Linear, and Spotify — verified with 0% documentation drift.
              </p>
            </div>
            <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200/80 text-xs text-sand-800 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Interactive checklist with local state & remaining effort timer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>One-click .env template & verified endpoint copying</span>
              </div>
            </div>
          </div>
        )}

        {/* Slide 2: In-Context Grounded Copilot */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-2xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sand-900 tracking-tight">
                2. In-Context Grounded Copilot (⌘J)
              </h2>
              <p className="text-xs sm:text-sm text-sand-700 mt-2 leading-relaxed">
                Hit a confusing OAuth parameter? Press <kbd className="px-1.5 py-0.5 rounded bg-sand-200 font-mono text-xs font-semibold text-sand-900">⌘J</kbd> on any guide to slide open your dedicated Copilot. It solves provider-specific gotchas with zero hallucinations.
              </p>
            </div>
            <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200/80 text-xs text-sand-800 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Explains tricky parameters (e.g. Supabase Management API vs GoTrue)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Interactive follow-up questions & instant code snippet copy</span>
              </div>
            </div>
          </div>
        )}

        {/* Slide 3: Autonomous AI Research */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sand-900 tracking-tight">
                3. Research Any Unfamiliar Provider
              </h2>
              <p className="text-xs sm:text-sm text-sand-700 mt-2 leading-relaxed">
                Need to integrate an API not yet in our library? Submit any provider name or developer documentation URL. Our autonomous worker inspects docs, validates endpoints, and synthesizes a verified runbook in under 69 seconds.
              </p>
            </div>
            <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200/80 text-xs text-sand-800 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Calibrated active effort & evidence scores (never generic copy-paste)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Instant SVG logo matching and portal deep-links</span>
              </div>
            </div>
          </div>
        )}

        {/* Slide 4: Blocker Diagnostic Engine & Code Playground */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shadow-2xs">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sand-900 tracking-tight">
                4. Blocker Wizard & Multi-Language Code
              </h2>
              <p className="text-xs sm:text-sm text-sand-700 mt-2 leading-relaxed">
                Stuck on <code className="bg-sand-100 px-1 py-0.5 rounded text-sand-900 font-mono text-xs">redirect_uri_mismatch</code>, CORS on token endpoints, or Basic Auth errors? Use our Blocker Wizard for side-by-side Wrong ❌ vs Fixed ✅ code solutions.
              </p>
            </div>
            <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200/80 text-xs text-sand-800 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Ready-to-run NextAuth, Node.js, Python, and cURL snippets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>One-click export to clean Markdown for team documentation wikis</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-sand-200 mt-6">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-3.5 py-2 text-xs font-semibold text-sand-700 hover:text-sand-900 hover:bg-sand-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="text-xs font-medium text-sand-500 hover:text-sand-900 transition-colors cursor-pointer"
            >
              Skip Tour
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-5 py-2.5 text-xs font-bold text-white bg-sand-900 hover:bg-black rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer group"
          >
            <span>{step === totalSteps ? 'Start Exploring Workspace' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
