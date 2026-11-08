import React, { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sand-950/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-md w-full border border-sand-200/90 shadow-2xl p-6 sm:p-7 relative transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Dismiss Button */}
        {allowDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-sand-400 hover:text-sand-700 hover:bg-sand-100 transition-colors cursor-pointer"
            title="Preview Workspace"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center justify-center font-bold text-sm mb-3.5 shadow-2xs">
            ⚡
          </div>
          <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-bold text-sand-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-sand-600 mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium animate-fadeIn">
            {errorMessage}
          </div>
        )}

        {/* Form: Name, Company, Title */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sand-800 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Alex Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-sand-300/80 bg-sand-50/40 hover:bg-white focus:bg-white focus:border-sand-900 focus:ring-2 focus:ring-sand-200 focus:outline-none transition-all placeholder:text-sand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-800 mb-1.5">
              Company or Organization *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Stripe, Linear, or Side Project"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-sand-300/80 bg-sand-50/40 hover:bg-white focus:bg-white focus:border-sand-900 focus:ring-2 focus:ring-sand-200 focus:outline-none transition-all placeholder:text-sand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-800 mb-1.5">
              Job Title
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Backend Engineer, Founder"
              value={titleRole}
              onChange={(e) => setTitleRole(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-sand-300/80 bg-sand-50/40 hover:bg-white focus:bg-white focus:border-sand-900 focus:ring-2 focus:ring-sand-200 focus:outline-none transition-all placeholder:text-sand-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-sand-900 hover:bg-black transition-all shadow-sm cursor-pointer disabled:opacity-60"
          >
            <span>{submitting ? 'Setting up workspace...' : 'Continue to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-[11px] text-sand-500 mt-4">
          Free forever for developers • Instant access
        </p>
      </div>
    </div>
  );
};
