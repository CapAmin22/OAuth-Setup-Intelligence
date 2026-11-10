import React, { useState, useEffect } from 'react';
import { ArrowRight, X, ShieldCheck, Bot, Code, Zap } from 'lucide-react';
import {
  registerDeveloper,
  DeveloperProfile,
  getCurrentDeveloper,
} from '../lib/auth';

interface DeveloperAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (profile: DeveloperProfile) => void;
  title?: string;
  subtitle?: string;
  allowDismiss?: boolean;
}

const ROLE_PRESETS = [
  'Full-Stack Engineer',
  'Backend / API Engineer',
  'Frontend Developer',
  'Tech Lead / Founder',
];

export const DeveloperAuthModal: React.FC<DeveloperAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Welcome to OAuth Intelligence',
  subtitle = 'Tell us a bit about yourself to unlock production runbooks, Copilot ⌘J, and the code playground.',
  allowDismiss = true,
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [titleRole, setTitleRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      const existing = getCurrentDeveloper();
      if (existing) {
        setName(existing.name || '');
        setCompany(existing.company || '');
        setTitleRole(existing.title || existing.role || '');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!company.trim()) {
      setErrorMessage('Please enter your company or project name.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerDeveloper({
        name: name.trim(),
        company: company.trim(),
        title: titleRole.trim() || 'Software Engineer',
      });

      if (result.success && result.profile) {
        onSuccess(result.profile);
      } else {
        setErrorMessage(result.error || 'Failed to save profile. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sand-950/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-xl w-full border border-sand-200 shadow-2xl overflow-hidden relative transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Dismiss Button */}
        {allowDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-sand-400 hover:text-sand-700 hover:bg-sand-100 transition-colors cursor-pointer z-10"
            title="Preview Workspace"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Value Banner */}
        <div className="bg-gradient-to-r from-sand-900 to-sand-950 text-white p-6 sm:p-7 border-b border-sand-800">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2.5 border border-amber-500/30">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Developer Onboarding</span>
          </div>

          <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-sand-300 mt-1.5 leading-relaxed">
            {subtitle}
          </p>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-sand-800/80 text-[11px]">
            <div className="flex items-center gap-1.5 text-sand-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero-Drift Runbooks</span>
            </div>
            <div className="flex items-center gap-1.5 text-sand-200">
              <Bot className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>In-Context Copilot ⌘J</span>
            </div>
            <div className="flex items-center gap-1.5 text-sand-200">
              <Code className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Ready-to-Run Code</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-7">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium animate-fadeIn">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sand-900 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Alex Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-sand-300 bg-sand-50/50 hover:bg-white focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 focus:outline-none transition-all placeholder:text-sand-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sand-900 mb-1.5">
                Company or Organization *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Stripe, Linear, or Side Project"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-sand-300 bg-sand-50/50 hover:bg-white focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 focus:outline-none transition-all placeholder:text-sand-400 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-sand-900">
                  Job Title
                </label>
                <span className="text-[10px] text-sand-500 font-medium">Quick select role:</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Senior Backend Engineer, Founder"
                value={titleRole}
                onChange={(e) => setTitleRole(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-sand-300 bg-sand-50/50 hover:bg-white focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 focus:outline-none transition-all placeholder:text-sand-400 font-medium"
              />

              {/* Quick Role Selection Tags */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {ROLE_PRESETS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTitleRole(role)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                      titleRole === role
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-sand-100/70 hover:bg-sand-200 text-sand-700 border-sand-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-sand-900 hover:bg-black transition-all shadow-sm cursor-pointer disabled:opacity-60 group"
            >
              <span>{submitting ? 'Setting up workspace...' : 'Continue to Workspace'}</span>
              <ArrowRight className="w-4 h-4 text-sand-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Secondary Actions */}
          <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between text-[11px] text-sand-600">
            <span>Free forever for developers · Instant access</span>
            {allowDismiss && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="font-semibold text-sand-700 hover:text-sand-950 underline cursor-pointer"
              >
                Explore in Read-Only Preview first →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
