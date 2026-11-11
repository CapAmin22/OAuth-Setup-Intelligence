import React, { useState } from 'react';
import { Star, Check, Sparkles, AlertCircle, MessageSquare, Send } from 'lucide-react';
import {
  FEEDBACK_FEATURE_OPTIONS,
  saveDeveloperFeedback,
  DeveloperFeedbackItem,
} from '../lib/feedbackStore';
import { getCurrentDeveloper } from '../lib/auth';

interface GuideFeedbackWidgetProps {
  providerSlug?: string;
  providerName?: string;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Needs improvement',
  2: 'Somewhat helpful',
  3: 'Good runbook',
  4: 'Very helpful',
  5: 'Exceptional · Saved hours!',
};

export const GuideFeedbackWidget: React.FC<GuideFeedbackWidgetProps> = ({
  providerSlug = 'general',
  providerName = 'OAuth Runbook',
  className = '',
}) => {
  const currentDev = getCurrentDeveloper();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    FEEDBACK_FEATURE_OPTIONS[0],
    FEEDBACK_FEATURE_OPTIONS[1],
  ]);
  const [improvementText, setImprovementText] = useState('');
  const [ideasText, setIdeasText] = useState('');
  const [name, setName] = useState(currentDev?.name || '');
  const [company, setCompany] = useState(currentDev?.company || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [maxWarning, setMaxWarning] = useState(false);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const toggleFeature = (feat: string) => {
    setMaxWarning(false);
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures((prev) => prev.filter((f) => f !== feat));
    } else {
      if (selectedFeatures.length >= 3) {
        setMaxWarning(true);
        setTimeout(() => setMaxWarning(false), 2500);
        return;
      }
      setSelectedFeatures((prev) => [...prev, feat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await saveDeveloperFeedback({
        rating,
        helpfulFeatures: selectedFeatures,
        improvementSuggestion: improvementText.trim() || undefined,
        featureIdeas: ideasText.trim() || undefined,
        providerSlug,
        providerName,
        developerName: name.trim() || currentDev?.name || 'Anonymous Developer',
        developerCompany: company.trim() || currentDev?.company || 'Developer Project',
        developerRole: currentDev?.role || currentDev?.title || 'Engineer',
        developerEmail: currentDev?.email,
      });

      setSubmitted(true);
    } catch (err) {
      console.warn('Failed to submit feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`bg-white border border-sand-200 rounded-2xl p-6 sm:p-8 shadow-xs text-sand-900 transition-all ${className}`}
    >
      {submitted ? (
        <div className="text-center py-6 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sand-900 text-base mb-1">
            Thank you! Your feedback has been recorded.
          </h3>
          <p className="text-xs text-sand-600 max-w-md mx-auto mb-5 leading-relaxed">
            Your review ({rating} ★) and feature insights for <strong>{providerName}</strong> directly prioritize our upcoming runbook updates and tooling roadmap.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setImprovementText('');
              setIdeasText('');
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-sand-100 hover:bg-sand-200 text-sand-800 transition-colors cursor-pointer"
          >
            Submit Another Response
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sand-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-1.5 border border-amber-500/20">
                <MessageSquare className="w-3 h-3 text-amber-600" />
                <span>Developer Feedback Loop</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-sand-900 tracking-tight">
                Was this OAuth runbook helpful?
              </h2>
              <p className="text-xs text-sand-600 mt-0.5">
                Tell us how this guide performed during your implementation of {providerName}.
              </p>
            </div>

            {/* 5-Star Interactive Rating */}
            <div className="flex flex-col sm:items-end">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 rounded-md hover:bg-amber-50 transition-colors cursor-pointer focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-6 h-6 transition-all ${
                        star <= activeRating
                          ? 'fill-amber-400 text-amber-500 scale-105'
                          : 'fill-transparent text-sand-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-bold text-amber-900 mt-1 font-mono">
                {RATING_LABELS[activeRating] || 'Select Rating'}
              </span>
            </div>
          </div>

          {/* Question 2: What helped them the most? (Max 3) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-sand-900">
                What helped you the most?
              </label>
              <div className="flex items-center gap-2">
                {maxWarning && (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 animate-fadeIn">
                    Max 3 features allowed
                  </span>
                )}
                <span className="text-[11px] font-mono text-sand-500">
                  Select up to 3 ({selectedFeatures.length}/3 chosen)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {FEEDBACK_FEATURE_OPTIONS.map((feat) => {
                const isSelected = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-600 text-amber-950 font-bold ring-1 ring-amber-500/30 shadow-2xs'
                        : 'bg-sand-50/80 hover:bg-sand-100 border-sand-200 text-sand-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                    <span>{feat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 3: Suggested Improvement (1-2 lines) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-sand-900">
                Suggest an improvement
              </label>
              <span className="text-[10px] text-sand-400 font-mono">1–2 lines</span>
            </div>
            <textarea
              rows={2}
              value={improvementText}
              onChange={(e) => setImprovementText(e.target.value)}
              placeholder="e.g. Include Django/FastAPI examples, clarify user vs bot token permissions, faster crawler..."
              className="w-full bg-sand-50/60 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 leading-relaxed transition-all placeholder:text-sand-400"
            />
          </div>

          {/* Question 4: What to add or remove (1-2 lines) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-sand-900">
                What can be added more, or removed?
              </label>
              <span className="text-[10px] text-sand-400 font-mono">1–2 lines</span>
            </div>
            <textarea
              rows={2}
              value={ideasText}
              onChange={(e) => setIdeasText(e.target.value)}
              placeholder="e.g. Add webhook signature verification, remove deprecated v1 OAuth tabs..."
              className="w-full bg-sand-50/60 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 leading-relaxed transition-all placeholder:text-sand-400"
            />
          </div>

          {/* Developer Attribution & Submit Action */}
          <div className="pt-2 border-t border-sand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-sand-600">
              {currentDev ? (
                <span>
                  Posting as <strong>{currentDev.name}</strong> ({currentDev.company})
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="px-2.5 py-1 text-xs border border-sand-300 rounded-lg bg-sand-50/40 text-sand-900 w-36"
                  />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company (Optional)"
                    className="px-2.5 py-1 text-xs border border-sand-300 rounded-lg bg-sand-50/40 text-sand-900 w-36"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sand-900 hover:bg-black text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Recording feedback...' : 'Submit Developer Feedback'}</span>
              <Send className="w-3.5 h-3.5 text-sand-300" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
