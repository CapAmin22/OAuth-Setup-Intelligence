import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Globe, Shield, ArrowRight, Layers, Check } from 'lucide-react';
import { enqueueJob } from '../lib/api';

const CAPABILITIES = [
  'User Authentication (SSO)',
  'Read User Profile',
  'Read / Write CRM Data',
  'Send Messages / Notifications',
  'Webhooks & Event Subscriptions',
  'Administrative Controls',
];

export const Intake: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [website, setWebsite] = useState('');
  const [distribution, setDistribution] = useState<'external' | 'internal'>('external');
  const [selectedCaps, setSelectedCaps] = useState<string[]>(['User Authentication (SSO)']);
  const [currentStage, setCurrentStage] = useState('Not started');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const toggleCapability = (cap: string) => {
    if (selectedCaps.includes(cap)) {
      setSelectedCaps(selectedCaps.filter((c) => c !== cap));
    } else {
      setSelectedCaps([...selectedCaps, cap]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSubmitting(true);
    try {
      const result = await enqueueJob(query.trim(), website.trim(), {
        distribution,
        capabilities: selectedCaps,
        currentStage,
      });
      navigate(`/jobs/${result.jobId}?query=${encodeURIComponent(query.trim())}`);
    } catch (err) {
      console.error(err);
      navigate(`/jobs/mock-${Date.now()}?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-3 border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Autonomous Documentation Research
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-sand-900 tracking-tight">
          Request AI-Generated OAuth Runbook
        </h1>
        <p className="text-xs sm:text-sm text-sand-700 mt-2 max-w-lg mx-auto">
          Our worker will inspect official documentation, find app registration portals, and verify scopes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Provider Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-sand-900 mb-1.5">
            Provider Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Linear, Asana, Discord, HubSpot"
            className="w-full bg-sand-50/50 border border-sand-300 rounded-xl px-4 py-2.5 text-sm text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
          />
        </div>

        {/* Website URL */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-sand-900 mb-1.5">
            Documentation or Developer Website (Optional)
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-sand-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. https://developers.linear.app"
              className="w-full bg-sand-50/50 border border-sand-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
            />
          </div>
        </div>

        {/* Distribution Target */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-sand-900 mb-2">
            Target Distribution
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDistribution('external')}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                distribution === 'external'
                  ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                  : 'border-sand-200 bg-sand-50/40 hover:border-sand-300'
              }`}
            >
              <span className="font-bold text-sand-900 block mb-0.5">External / Public</span>
              <span className="text-sand-700 text-[11px]">Multiple tenants & external customers</span>
            </button>

            <button
              type="button"
              onClick={() => setDistribution('internal')}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                distribution === 'internal'
                  ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                  : 'border-sand-200 bg-sand-50/40 hover:border-sand-300'
              }`}
            >
              <span className="font-bold text-sand-900 block mb-0.5">Internal / Organization</span>
              <span className="text-sand-700 text-[11px]">Workspace or enterprise team members only</span>
            </button>
          </div>
        </div>

        {/* Required Capabilities */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-sand-900 mb-2">
            Desired Capabilities & Scopes
          </label>
          <div className="flex flex-wrap gap-2">
            {CAPABILITIES.map((cap) => {
              const selected = selectedCaps.includes(cap);
              return (
                <button
                  type="button"
                  key={cap}
                  onClick={() => toggleCapability(cap)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    selected
                      ? 'bg-sand-900 text-white border-sand-900'
                      : 'bg-sand-50 text-sand-700 border-sand-200 hover:border-sand-300'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  <span>{cap}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Setup Stage */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-sand-900 mb-1.5">
            Where are you currently in the process?
          </label>
          <select
            value={currentStage}
            onChange={(e) => setCurrentStage(e.target.value)}
            className="w-full bg-sand-50/50 border border-sand-300 rounded-xl px-3.5 py-2.5 text-sm text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
          >
            <option value="Not started">Haven't started — need full overview</option>
            <option value="Registered app">Created app, but stuck on redirect URIs or scopes</option>
            <option value="Testing">Testing locally, planning for production approval</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-sand-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {submitting ? (
            <span>Enqueuing Research Job...</span>
          ) : (
            <>
              <span>Start Autonomous Research</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
