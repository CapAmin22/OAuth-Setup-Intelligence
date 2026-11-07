import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, Shield, ArrowUpRight, Sparkles } from 'lucide-react';
import { GuideVersion, Provider } from '../types';
import { ProviderLogo } from './ProviderLogo';

interface ProviderCardProps {
  guide?: GuideVersion;
  provider?: Provider;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ guide, provider }) => {
  const name = guide?.providerName || provider?.displayName || 'Provider';
  const slug = guide?.providerSlug || provider?.slug || '';
  const score = guide?.evidenceQuality?.score ?? 90;
  const lowMin = guide?.effort?.lowMinutes ?? 20;
  const highMin = guide?.effort?.highMinutes ?? 60;
  const isCurated = provider?.isCurated ?? true;
  const stepCount = guide?.steps?.length ?? 4;

  const scoreColor =
    score >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200';

  return (
    <Link
      to={`/guides/${slug}/v/1`}
      className="group bg-white border border-sand-200 hover:border-sand-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sand-50 border border-sand-200 flex items-center justify-center p-2 group-hover:scale-105 transition-transform shrink-0">
              <ProviderLogo slug={slug} name={name} logoUrl={provider?.logoUrl} size="md" />
            </div>
            <div>
              <h3 className="font-semibold text-sand-900 text-base group-hover:text-amber-700 transition-colors flex items-center gap-1.5">
                {name}
                <ArrowUpRight className="w-4 h-4 text-sand-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <span className="text-xs text-sand-700 font-mono">
                {provider?.canonicalDomain || `${slug}.com`}
              </span>
            </div>
          </div>

          {isCurated ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle className="w-3 h-3" />
              Curated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              AI Researched
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 my-3 text-xs">
          <div className="bg-sand-50 rounded-lg p-2.5 border border-sand-100">
            <span className="text-sand-700 block text-[11px] mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Active Effort
            </span>
            <span className="font-semibold text-sand-900">{lowMin}–{highMin} min</span>
          </div>

          <div className="bg-sand-50 rounded-lg p-2.5 border border-sand-100">
            <span className="text-sand-700 block text-[11px] mb-0.5 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Evidence Score
            </span>
            <span className={`inline-block font-semibold px-1.5 py-0.2 rounded ${scoreColor}`}>
              {score}/100
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-sand-100 flex items-center justify-between text-xs text-sand-700">
        <span>{stepCount} verification steps</span>
        <span className="font-medium text-sand-900 group-hover:text-amber-700 transition-colors">
          View Guide →
        </span>
      </div>
    </Link>
  );
};

