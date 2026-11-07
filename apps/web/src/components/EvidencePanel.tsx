import React, { useState } from 'react';
import { ExternalLink, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { GuideVersion, Claim, Source } from '../types';

interface EvidencePanelProps {
  guide: GuideVersion;
  activeClaimId?: string | null;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ guide, activeClaimId }) => {
  const [tab, setTab] = useState<'claims' | 'sources' | 'breakdown'>('claims');

  const quality = guide.evidenceQuality;
  const claims = guide.claims || [];
  const sources = guide.sources || [];

  return (
    <div className="bg-white border border-sand-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-sand-200 bg-sand-50/50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sand-900 text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Evidence & Grounding Dossier
          </h3>
          <span className="text-xs text-sand-700">
            Source-backed verification for {guide.providerName}
          </span>
        </div>

        <div className="flex rounded-lg bg-sand-200/60 p-0.5 text-xs font-medium">
          <button
            onClick={() => setTab('claims')}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === 'claims' ? 'bg-white text-sand-900 shadow-xs' : 'text-sand-700 hover:text-sand-900'
            }`}
          >
            Claims ({claims.length})
          </button>
          <button
            onClick={() => setTab('sources')}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === 'sources' ? 'bg-white text-sand-900 shadow-xs' : 'text-sand-700 hover:text-sand-900'
            }`}
          >
            Sources ({sources.length})
          </button>
          <button
            onClick={() => setTab('breakdown')}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === 'breakdown' ? 'bg-white text-sand-900 shadow-xs' : 'text-sand-700 hover:text-sand-900'
            }`}
          >
            Score Rubric
          </button>
        </div>
      </div>

      <div className="p-4 max-h-[460px] overflow-y-auto">
        {tab === 'claims' && (
          <div className="space-y-3">
            {claims.map((claim) => {
              const isHighlighted = activeClaimId === claim.id;
              return (
                <div
                  key={claim.id}
                  className={`p-3.5 rounded-lg border transition-all text-xs ${
                    isHighlighted
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
                      : 'bg-sand-50/40 border-sand-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[11px] font-semibold text-sand-900">
                      #{claim.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {claim.critical && (
                        <span className="bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
                          CRITICAL
                        </span>
                      )}
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.2 rounded text-[10px] font-medium">
                        {claim.evidenceStatus}
                      </span>
                    </div>
                  </div>

                  <p className="text-sand-900 font-medium mb-2">{claim.text}</p>

                  {claim.context && (
                    <span className="text-[11px] text-sand-700 block mb-2 font-mono">
                      Context: {claim.context}
                    </span>
                  )}

                  {claim.sourceIds && claim.sourceIds.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-sand-700 border-t border-sand-200/60 pt-2 mt-2">
                      <span>Cites:</span>
                      {claim.sourceIds.map((sid) => (
                        <span key={sid} className="font-mono text-amber-700 bg-amber-50 px-1 rounded">
                          {sid}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'sources' && (
          <div className="space-y-3">
            {sources.map((src) => (
              <div key={src.id} className="p-3.5 rounded-lg border border-sand-200 bg-sand-50/40 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-sand-900">{src.id}</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium hover:underline"
                  >
                    <span>Visit Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="font-medium text-sand-900 mb-1">{src.publisher || 'Official Documentation'}</p>
                <p className="font-mono text-[11px] text-sand-700 truncate mb-2">{src.url}</p>

                {src.selectedPassages && src.selectedPassages.length > 0 && (
                  <div className="bg-white p-2.5 rounded border border-sand-200 text-sand-700 italic text-[11px] font-mono leading-relaxed">
                    "{src.selectedPassages[0]}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'breakdown' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div>
                <span className="font-semibold text-emerald-900 text-sm block">
                  Overall Score: {quality?.score ?? 90}/100
                </span>
                <span className="text-[11px] text-emerald-700">
                  Calibrated evidence-quality rubric
                </span>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-sand-100">
                <span className="text-sand-700">Critical Claim Grounding (weight 35)</span>
                <span className="font-mono font-semibold text-sand-900">
                  {quality?.breakdown?.criticalClaimGrounding ?? 35}/35
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sand-100">
                <span className="text-sand-700">Official Source Coverage (weight 25)</span>
                <span className="font-mono font-semibold text-sand-900">
                  {quality?.breakdown?.officialSourceCoverage ?? 25}/25
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sand-100">
                <span className="text-sand-700">Step Completeness (weight 20)</span>
                <span className="font-mono font-semibold text-sand-900">
                  {quality?.breakdown?.completeness ?? 18}/20
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sand-100">
                <span className="text-sand-700">Documentation Freshness (weight 10)</span>
                <span className="font-mono font-semibold text-sand-900">
                  {quality?.breakdown?.freshness ?? 8}/10
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-sand-700">Contradiction Consistency (weight 10)</span>
                <span className="font-mono font-semibold text-sand-900">
                  {quality?.breakdown?.consistency ?? 7}/10
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

