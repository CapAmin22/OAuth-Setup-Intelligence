import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Globe,
  Terminal,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Bot,
  Layers,
  Copy,
  Check,
  Zap,
  Code,
  BookOpen,
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
  const [copiedEnv, setCopiedEnv] = useState(false);
  const navigate = useNavigate();
  const totalSteps = 4;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCopiedEnv(false);
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

  const handleComplete = (targetRoute?: string) => {
    localStorage.setItem('oauth_welcome_dismissed', 'true');
    onClose();
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const copySimulatedEnv = () => {
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const STEP_TABS = [
    { num: 1, label: 'Runbooks', icon: ShieldCheck },
    { num: 2, label: 'Copilot ⌘J', icon: Bot },
    { num: 3, label: 'AI Research', icon: Globe },
    { num: 4, label: 'Blocker Wizard', icon: Terminal },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sand-950/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white border border-sand-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => handleComplete()}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-sand-400 hover:text-sand-800 hover:bg-sand-100 transition-colors cursor-pointer z-10"
          title="Close guide"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge & User Welcome */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-700" />
              <span>Developer Masterclass · Step {step} of {totalSteps}</span>
            </span>
            {developerName && (
              <span className="text-[11px] font-medium text-sand-600 hidden sm:inline">
                Welcome, {developerName.split(' ')[0]}!
              </span>
            )}
          </div>

          <div className="text-[11px] font-mono text-sand-400 hidden sm:block">
            Master the Workflow
          </div>
        </div>

        {/* Interactive Step Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-sand-100/80 rounded-xl mb-6 border border-sand-200/80">
          {STEP_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = step === tab.num;
            const isCompleted = step > tab.num;

            return (
              <button
                key={tab.num}
                type="button"
                onClick={() => setStep(tab.num)}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-sand-900 shadow-2xs border border-sand-200/80'
                    : isCompleted
                    ? 'text-emerald-800 hover:bg-white/60'
                    : 'text-sand-600 hover:text-sand-900 hover:bg-white/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-700' : isCompleted ? 'text-emerald-600' : 'text-sand-500'}`} />
                <span className="hidden sm:inline truncate">{tab.label}</span>
                <span className="sm:hidden">{tab.num}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Region */}
        <div className="overflow-y-auto pr-1 flex-1">
          {/* Slide 1: Curated Runbooks */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-2xs shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-sand-900 tracking-tight">
                    1. Production-Tested OAuth Runbooks
                  </h2>
                  <p className="text-xs sm:text-sm text-sand-600 mt-1 leading-relaxed">
                    Skip scouring outdated tutorials or conflicting vendor forums. Get battle-tested runbooks for Google, GitHub, Slack, Discord, Supabase, Airtable, Linear, and Spotify — verified with 0% documentation drift.
                  </p>
                </div>
              </div>

              {/* Pro Tips Box */}
              <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200/80 text-xs text-sand-800 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Interactive Implementation Checklist:</strong> Tracks your app registration, scopes, and redirect URI setup with local persistence.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Live Effort Estimator:</strong> Realistically know whether setup takes 15 minutes or 3 business days for multi-tenant review.</span>
                </div>
              </div>

              {/* Simulated Interactive Widget: .env Exporter */}
              <div className="bg-sand-900 rounded-xl p-3.5 text-white font-mono text-[11px] shadow-sm border border-sand-800">
                <div className="flex items-center justify-between text-sand-400 text-[10px] pb-2 mb-2 border-b border-sand-800">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-3 h-3 text-emerald-400" />
                    <span>.env.local · Production Ready Template</span>
                  </span>
                  <button
                    type="button"
                    onClick={copySimulatedEnv}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sand-800 hover:bg-sand-700 text-sand-200 hover:text-white transition-colors cursor-pointer text-[10px]"
                  >
                    {copiedEnv ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy .env</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-sand-300 leading-relaxed text-[11px]">
                  <span className="text-emerald-400 font-bold"># Official Google OAuth 2.0 Endpoints</span><br />
                  <span className="text-amber-300">AUTH_URI</span>=https://accounts.google.com/o/oauth2/v2/auth<br />
                  <span className="text-amber-300">TOKEN_URI</span>=https://oauth2.googleapis.com/token<br />
                  <span className="text-sky-300">SCOPES</span>=openid email profile<br />
                  <span className="text-sand-400"># Trailing-slash exact match enforced</span><br />
                  <span className="text-amber-300">REDIRECT_URI</span>=http://localhost:3000/api/auth/callback/google
                </div>
              </div>
            </div>
          )}

          {/* Slide 2: In-Context Grounded Copilot */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-2xs shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-sand-900 tracking-tight">
                    2. In-Context Grounded Copilot (⌘J)
                  </h2>
                  <p className="text-xs sm:text-sm text-sand-600 mt-1 leading-relaxed">
                    Hit a confusing OAuth parameter? Press <kbd className="px-1.5 py-0.5 rounded bg-sand-200 font-mono text-xs font-semibold text-sand-900">⌘J</kbd> on any guide to slide open your dedicated Copilot. It solves provider-specific gotchas with zero hallucinations.
                  </p>
                </div>
              </div>

              {/* Pro Tips Box */}
              <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200/80 text-xs text-sand-800 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Provider-Specific RFC Constraints:</strong> Explains tricky parameters like Supabase Management API vs GoTrue, Odoo multi-database routing, and Slack bot vs user tokens.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Hallucinations:</strong> Every answer is grounded directly in verified documentation links and RFC 6749 specifications.</span>
                </div>
              </div>

              {/* Simulated Interactive Widget: Copilot Slide-over Preview */}
              <div className="bg-sand-900 rounded-xl p-3.5 text-white text-xs shadow-sm border border-sand-800 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-sand-400 pb-2 border-b border-sand-800">
                  <span className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Provider Copilot · Grounded in Official Docs</span>
                  </span>
                  <span className="font-mono text-[10px] bg-sand-800 px-1.5 py-0.5 rounded text-sand-300">⌘J Shortcut</span>
                </div>

                <div className="bg-sand-800/60 rounded-lg p-2.5 text-xs text-sand-200 border border-sand-700/50">
                  <span className="text-[10px] text-sand-400 font-bold uppercase block mb-1">Developer Question</span>
                  &quot;Does Slack use space or comma delimiter for multiple scopes?&quot;
                </div>

                <div className="bg-sand-950/80 rounded-lg p-2.5 text-xs text-sand-300 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">✓ Grounded Copilot Answer</span>
                  <p className="text-[11px] leading-relaxed mb-1.5">
                    Slack <strong>strictly requires comma-separated scopes</strong> (e.g. <code className="text-amber-300 bg-sand-800 px-1 py-0.5 rounded">users.profile:read,chat:write</code>). Using spaces will trigger an <code className="text-red-400">invalid_scope</code> authorization error.
                  </p>
                  <span className="text-[10px] text-sand-400 font-mono">Source: api.slack.com/authentication/oauth-v2#asking</span>
                </div>
              </div>
            </div>
          )}

          {/* Slide 3: Autonomous AI Research */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shadow-2xs shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-sand-900 tracking-tight">
                    3. Research Any Unfamiliar Provider
                  </h2>
                  <p className="text-xs sm:text-sm text-sand-600 mt-1 leading-relaxed">
                    Need to integrate an API not yet in our library? Submit any provider name or developer documentation URL. Our autonomous worker inspects docs, validates endpoints, and synthesizes a verified runbook.
                  </p>
                </div>
              </div>

              {/* Pro Tips Box */}
              <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200/80 text-xs text-sand-800 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span><strong>Zero-Hallucination Pipeline:</strong> Extracts exact grant types (PKCE vs client_secret), delimiter rules, and refresh token behaviors.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span><strong>Official Brand Marks:</strong> Automatically matches authentic vector logos and portal deep-links for immediate developer trust.</span>
                </div>
              </div>

              {/* Simulated Interactive Widget: 4-Stage Research Loop */}
              <div className="bg-sand-900 rounded-xl p-4 text-white text-xs shadow-sm border border-sand-800">
                <span className="text-[10px] uppercase tracking-wider text-sand-400 font-bold block mb-3">
                  Autonomous 4-Stage Verification Loop
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-lg bg-sand-800/80 border border-sand-700 text-center">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] mx-auto mb-1 flex items-center justify-center">1</span>
                    <span className="font-semibold text-white block text-[11px]">Domain Check</span>
                    <span className="text-[10px] text-sand-400">SSRF Guard Active</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-sand-800/80 border border-sand-700 text-center">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] mx-auto mb-1 flex items-center justify-center">2</span>
                    <span className="font-semibold text-white block text-[11px]">Portal Discovery</span>
                    <span className="text-[10px] text-sand-400">Endpoint Crawl</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-sand-800/80 border border-sand-700 text-center">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] mx-auto mb-1 flex items-center justify-center">3</span>
                    <span className="font-semibold text-white block text-[11px]">Fact Extraction</span>
                    <span className="text-[10px] text-sand-400">PKCE &amp; Scopes</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-sand-800/80 border border-emerald-500/40 text-center">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-sand-950 font-bold text-[10px] mx-auto mb-1 flex items-center justify-center">✓</span>
                    <span className="font-semibold text-emerald-300 block text-[11px]">Hash Grounded</span>
                    <span className="text-[10px] text-sand-400">SHA-256 Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slide 4: Blocker Wizard & Multi-Language Code */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shadow-2xs shrink-0">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-sand-900 tracking-tight">
                    4. Blocker Wizard & Multi-Language Code
                  </h2>
                  <p className="text-xs sm:text-sm text-sand-600 mt-1 leading-relaxed">
                    Stuck on <code className="bg-sand-100 px-1 py-0.5 rounded text-sand-900 font-mono text-xs">redirect_uri_mismatch</code>, CORS on token endpoints, or Basic Auth errors? Use our Blocker Wizard for side-by-side Wrong ❌ vs Fixed ✅ code solutions.
                  </p>
                </div>
              </div>

              {/* Pro Tips Box */}
              <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200/80 text-xs text-sand-800 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Multi-Language Implementations:</strong> Switch seamlessly between TypeScript, Python, and cURL snippets tested against real authorization servers.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>One-Click Markdown Export:</strong> Export the entire verified runbook for team handoff in Notion, Confluence, or GitHub READMEs.</span>
                </div>
              </div>

              {/* Simulated Interactive Widget: Wrong vs Fixed Diff */}
              <div className="bg-sand-900 rounded-xl p-3.5 text-white font-mono text-[11px] shadow-sm border border-sand-800 space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-sand-400 font-sans font-bold block">
                  Root-Cause Triage: redirect_uri_mismatch
                </span>

                <div className="p-2.5 rounded bg-red-950/40 border border-red-500/40 text-red-200 text-[11px]">
                  <span className="text-red-400 font-bold">❌ WRONG:</span> redirect_uri: &apos;https://app.com/api/callback/&apos; <span className="text-red-300 font-sans text-[10px]">(Trailing slash causes 400 mismatch)</span>
                </div>

                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-[11px]">
                  <span className="text-emerald-400 font-bold">✅ FIXED:</span> redirect_uri: &apos;https://app.com/api/callback&apos; <span className="text-emerald-300 font-sans text-[10px]">(Matches vendor registration byte-for-byte)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Pro Keyboard Shortcuts Footer */}
        <div className="mt-4 pt-3 border-t border-sand-200/80 flex items-center justify-between text-[11px] text-sand-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-sand-100 font-mono text-[10px] font-semibold text-sand-800 border border-sand-200">⌘J</kbd>
              <span>Copilot</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-sand-100 font-mono text-[10px] font-semibold text-sand-800 border border-sand-200">⌘K</kbd>
              <span>Search Library</span>
            </span>
          </div>

          <span className="text-amber-800 font-medium">Pro tip: Runbooks update with 0% drift</span>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-sand-100 mt-3">
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
              onClick={() => handleComplete()}
              className="text-xs font-medium text-sand-500 hover:text-sand-900 transition-colors cursor-pointer"
            >
              Skip Tour
            </button>
          )}

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 text-xs font-bold text-white bg-sand-900 hover:bg-black rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer group"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleComplete('/generate')}
                className="px-4 py-2 text-xs font-semibold text-sand-800 hover:text-sand-950 bg-sand-100 hover:bg-sand-200 border border-sand-200 rounded-xl transition-all cursor-pointer"
              >
                Research Unlisted App →
              </button>
              <button
                onClick={() => handleComplete('/library')}
                className="px-5 py-2.5 text-xs font-bold text-white bg-sand-900 hover:bg-black rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer group"
              >
                <span>Explore Curated Library</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
