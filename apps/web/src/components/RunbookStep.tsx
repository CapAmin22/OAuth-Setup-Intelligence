import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, ChevronRight, User, ShieldAlert, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import { Step } from '../types';

interface RunbookStepProps {
  step: Step;
  index: number;
  providerSlug?: string;
  isCompleted?: boolean;
  onToggle?: () => void;
  onClaimClick?: (claimId: string) => void;
  onTroubleshoot?: (stepTitle: string) => void;
}

export const RunbookStep: React.FC<RunbookStepProps> = ({
  step,
  index,
  providerSlug,
  isCompleted: externalCompleted,
  onToggle,
  onClaimClick,
  onTroubleshoot,
}) => {
  const [internalCompleted, setInternalCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const completed = externalCompleted !== undefined ? externalCompleted : internalCompleted;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCompleted(!internalCompleted);
    }
  };

  const copyInstructions = () => {
    navigator.clipboard.writeText(step.instructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative bg-white border rounded-xl p-5 transition-all shadow-sm ${
        completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-sand-200 hover:border-sand-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <button
            onClick={handleToggle}
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
              completed
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-sand-100 border border-sand-300 text-sand-700 hover:border-amber-600'
            }`}
            title={completed ? 'Mark incomplete' : 'Mark completed'}
          >
            {completed ? <Check className="w-4 h-4" /> : index + 1}
          </button>

          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h4 className={`font-semibold text-base ${completed ? 'text-sand-700 line-through' : 'text-sand-900'}`}>
                {step.title}
              </h4>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                  step.owner === 'admin'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {step.owner}
              </span>
            </div>

            <p className="text-sand-800 text-sm leading-relaxed mb-3 font-normal whitespace-pre-line">
              {step.instructions}
            </p>

            {step.completionCheck && (
              <div className="flex items-center gap-2 text-xs text-sand-700 bg-sand-50 border border-sand-200/80 rounded-md px-3 py-1.5 mb-3 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verify: {step.completionCheck}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-sand-100 flex-wrap">
              {step.claimIds && step.claimIds.length > 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-sand-700">
                  <span className="text-[11px] font-medium text-sand-700">Backed by claims:</span>
                  {step.claimIds.map((cid) => (
                    <button
                      key={cid}
                      onClick={() => onClaimClick?.(cid)}
                      className="px-1.5 py-0.5 rounded bg-sand-100 hover:bg-amber-100 text-sand-700 hover:text-amber-800 font-mono text-[10px] font-medium border border-sand-200 transition-colors"
                    >
                      #{cid}
                    </button>
                  ))}
                </div>
              ) : <div />}

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => onTroubleshoot?.(step.title)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-900 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-600/20 transition-colors"
                  title="Troubleshoot errors on this step"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>Troubleshoot Step</span>
                </button>

                <Link
                  to={`/feedback?provider=${encodeURIComponent(providerSlug || '')}&step=${encodeURIComponent(step.title)}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sand-600 hover:text-sand-900 bg-sand-100/70 hover:bg-sand-200/70 px-2.5 py-1 rounded-md border border-sand-200 transition-colors"
                  title="Report documentation drift or console changes for this step"
                >
                  <MessageSquare className="w-3 h-3 text-sand-500" />
                  <span>Report Drift</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={copyInstructions}
          className="text-sand-700 hover:text-sand-900 p-1.5 rounded-md hover:bg-sand-100 transition-colors shrink-0"
          title="Copy instructions"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

