import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, User, Building2, Briefcase } from 'lucide-react';
import {
  registerDeveloper,
  getCurrentDeveloper,
  DeveloperProfile,
} from '../lib/auth';

interface LoginProps {
  onLoginSuccess?: (profile: DeveloperProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    const existing = getCurrentDeveloper();
    if (existing) {
      navigate(returnTo);
    }
  }, [navigate, returnTo]);

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
      const res = await registerDeveloper({
        name: name.trim(),
        company: company.trim(),
        title: title.trim() || 'Software Engineer',
      });

      if (res.success && res.profile) {
        if (onLoginSuccess) {
          onLoginSuccess(res.profile);
        }
        navigate(returnTo);
      } else {
        setErrorMessage(res.error || 'Failed to complete registration.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl max-w-md w-full border border-sand-200/90 shadow-xl p-7 sm:p-8 relative">
        {/* Header */}
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center justify-center font-bold text-base mb-4 shadow-2xs">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-sand-900 tracking-tight">
            Developer Sign In
          </h1>
          <p className="text-xs sm:text-sm text-sand-600 mt-1.5 leading-relaxed">
            Enter your details to access production OAuth runbooks, Copilot ⌘J, and the code playground.
          </p>
        </div>

        {/* Error Alert */}
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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

        <div className="mt-5 text-center">
          <Link to="/" className="text-xs text-sand-500 hover:text-sand-800 transition-colors">
            ← Back to Public Library
          </Link>
        </div>
      </div>
    </div>
  );
};
