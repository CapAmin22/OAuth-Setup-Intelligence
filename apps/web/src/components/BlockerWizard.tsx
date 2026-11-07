import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Search,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { diagnoseError, DiagnosticResult } from '../lib/diagnostics';

interface BlockerWizardProps {
  providerSlug?: string;
  providerName?: string;
  initialQuery?: string;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_CHIPS = [
  { label: 'redirect_uri_mismatch', query: 'redirect_uri_mismatch' },
  { label: 'CORS on /token', query: 'CORS error access-control-allow-origin /token' },
  { label: 'invalid_client (401)', query: 'invalid_client client authentication failed' },
  { label: 'invalid_scope', query: 'invalid_scope unauthorized scope' },
  { label: 'Code expired (invalid_grant)', query: 'invalid_grant authorization code expired' },
  { label: 'access_denied', query: 'access_denied user cancelled' },
];

export const BlockerWizard: React.FC<BlockerWizardProps> = ({
  providerSlug,
  providerName = 'OAuth Provider',
  initialQuery = 'redirect_uri_mismatch',
  isOpen,
  onClose,
}) => {
  const [input, setInput] = useState(initialQuery);
  const [copiedWrong, setCopiedWrong] = useState(false);
  const [copiedFixed, setCopiedFixed] = useState(false);

  if (!isOpen) return null;

  const result: DiagnosticResult = diagnoseError(input || initialQuery, providerSlug, providerName);

  const copyCode = (text: string, isFixed: boolean) => {
    navigator.clipboard.writeText(text);
    if (isFixed) {
      setCopiedFixed(true);
      setTimeout(() => setCopiedFixed(false), 2000);
    } else {
      setCopiedWrong(true);
      setTimeout(() => setCopiedWrong(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-sand-300 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-sand-50 border-b border-sand-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-sand-900 text-base flex items-center gap-2">
                OAuth Blocker Diagnostic Wizard
                <span className="text-xs font-mono font-medium text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                  {providerName}
                </span>
              </h3>
              <p className="text-xs text-sand-700">
                Paste your error code, callback URL, or log output to diagnose root causes and fixes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sand-700 hover:text-sand-900 hover:bg-sand-200/50 transition-colors"
            title="Close Wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar & Quick Chips */}
        <div className="p-6 border-b border-sand-200 bg-white">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-sand-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste error message or URL (e.g. redirect_uri_mismatch, 401 invalid_client, CORS)..."
              className="w-full bg-sand-50 border border-sand-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-sand-700 mr-1">Common Blockers:</span>
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => setInput(chip.query)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-all ${
                  input.includes(chip.label)
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-sand-50 border-sand-200 text-sand-800 hover:bg-sand-100 hover:border-sand-300'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Diagnosis Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm flex-1">
          {/* Result Title & Summary */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded">
                {result.category}
              </span>
              <h4 className="font-bold text-sand-900 text-sm sm:text-base">
                {result.title}
              </h4>
            </div>
            <p className="text-sand-800 text-xs sm:text-sm leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Provider Specific Gotcha */}
          {result.providerGotcha && (
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-sand-800">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sand-900 block mb-0.5">{providerName} Specific Rule:</strong>
                <span>{result.providerGotcha}</span>
              </div>
            </div>
          )}

          {/* Code Diff: Wrong vs Fixed */}
          {result.wrongSnippet && result.fixedSnippet && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wrong */}
              <div className="border border-red-200 bg-red-50/20 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-red-100">
                    <span className="font-bold text-xs text-red-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      What went wrong:
                    </span>
                    <button
                      onClick={() => copyCode(result.wrongSnippet || '', false)}
                      className="text-sand-700 hover:text-sand-900 p-1 rounded"
                      title="Copy wrong snippet"
                    >
                      {copiedWrong ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] text-red-950 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {result.wrongSnippet}
                  </pre>
                </div>
              </div>

              {/* Fixed */}
              <div className="border border-emerald-200 bg-emerald-50/20 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-100">
                    <span className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Recommended Fix:
                    </span>
                    <button
                      onClick={() => copyCode(result.fixedSnippet || '', true)}
                      className="text-sand-700 hover:text-sand-900 p-1 rounded"
                      title="Copy fix snippet"
                    >
                      {copiedFixed ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] text-emerald-950 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {result.fixedSnippet}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Actionable Steps */}
          <div>
            <h5 className="font-bold text-sand-900 text-xs uppercase tracking-wider mb-2">
              Actionable Fix Steps:
            </h5>
            <div className="space-y-1.5">
              {result.actionItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-sand-800 bg-sand-50 p-2.5 rounded-lg border border-sand-200">
                  <span className="w-4 h-4 rounded-full bg-sand-200 text-sand-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-sand-50 border-t border-sand-200 flex items-center justify-between text-xs text-sand-700">
          <span>Grounding verified against official {providerName} OAuth 2.0 specifications.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sand-900 hover:bg-black text-white font-semibold rounded-lg transition-colors"
          >
            Done & Return to Guide
          </button>
        </div>
      </div>
    </div>
  );
};

