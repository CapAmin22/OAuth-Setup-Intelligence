import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Terminal, ArrowRight, ArrowLeft, X, CheckCircle2 } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) {
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
          className="absolute top-4 right-4 p-1.5 rounded-lg text-sand-500 hover:text-sand-900 hover:bg-sand-100 transition-colors"
          title="Close tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
            Step {step} of 3
          </span>
          <div className="flex gap-1.5 flex-1 max-w-[120px]">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-amber-600' : 'bg-sand-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-amber-600' : 'bg-sand-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-amber-600' : 'bg-sand-200'}`} />
          </div>
        </div>

        {/* Slide 1: Curated Library */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sand-900 tracking-tight">
                1. Browse Verified Runbooks
              </h2>
              <p className="text-xs sm:text-sm text-sand-700 mt-2 leading-relaxed">
                Access 10 curated, production-tested OAuth 2.0 guides for Google, GitHub, Slack, Discord, Linear, Zoom, and more.
                Every critical assertion is backed by official documentation hashes with 0 unsupported claims.
              </p>
            </div>
            <div className="bg-sand-50 rounded-xl p-3 border border-sand-200/80 text-xs text-sand-800 space-y-1.5 font-sans">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Interactive checklist with local progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Least-privilege scope recommendations & audit notes</span>
              </div>
            </div>
          </div>
        )}

        {/* Slide 2: Autonomous Research */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sand-900 tracking-tight">
                2. Research Any Provider Live
              </h2>
              <p className="text-xs sm:text-sm text-sand-700 mt-2 leading-relaxed">
                Integrating an API not yet in our library? Simply enter the provider's domain.
                Our background agent crawls official docs via Tavily and synthesizes a structured runbook in under 2 minutes.
              </p>
            </div>
            <div className="bg-sand-50 rounded-xl p-3 border border-sand-200/80 text-xs text-sand-800 space-y-1.5 font-sans">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Live streaming SSE pipeline status & citation extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Fact-grounding confidence scores (90%+ target)</span>
              </div>
            </div>
          </div>
        )}

        {/* Slide 3: Blocker Resolution & Code Playground */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sand-900 tracking-tight">
                3. Instant Blocker Fixes & Code
              </h2>
              <p className="text-xs sm:text-sm text-sand-700 mt-2 leading-relaxed">
                Never get stuck on <code className="bg-sand-100 px-1 py-0.5 rounded text-sand-900 font-mono text-xs">redirect_uri_mismatch</code>, CORS on token endpoints, or missing Basic Auth headers.
                Our Blocker Wizard shows side-by-side Wrong ❌ vs Fixed ✅ code diffs with copyable NextAuth, Node, and Python snippets.
              </p>
            </div>
            <div className="bg-sand-50 rounded-xl p-3 border border-sand-200/80 text-xs text-sand-800 space-y-1.5 font-sans">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Multi-language code generator tailored to exact provider endpoints</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>One-click export to Markdown for engineering wikis</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-sand-100">
          <button
            onClick={handleComplete}
            className="text-xs font-semibold text-sand-600 hover:text-sand-900 transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-sand-200 text-xs font-semibold text-sand-700 hover:bg-sand-50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sand-900 hover:bg-black text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{step === 3 ? 'Get Started' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
