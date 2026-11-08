import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Linkedin,
  Building2,
  Mail,
  User,
  Briefcase,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  auditDeveloperProfile,
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
  title = 'Join 2,400+ Verified Engineers',
  subtitle = 'Verify your profile to unlock production-grade OAuth runbooks, grounded RFC Copilot, and autonomous AI research.',
  allowDismiss = true,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [role, setRole] = useState('Full-Stack Engineer');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live verification audit state
  const audit = auditDeveloperProfile({
    name,
    email,
    company,
    linkedinUrl,
  });

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      // Pre-populate if existing session in storage
      const existing = getCurrentDeveloper();
      if (existing) {
        setName(existing.name || '');
        setEmail(existing.email || '');
        setCompany(existing.company || '');
        setLinkedinUrl(existing.linkedinUrl || '');
        setRole(existing.role || 'Full-Stack Engineer');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!audit.canProceed) {
      const err =
        audit.errors.name ||
        audit.errors.email ||
        audit.errors.company ||
        audit.errors.linkedin ||
        'Please provide genuine details for all required fields.';
      setErrorMessage(err);
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerDeveloper({
        name,
        email,
        company,
        linkedinUrl,
        role,
      });

      if (result.success && result.profile) {
        onSuccess(result.profile);
      } else {
        setErrorMessage(result.error || 'Failed to verify developer profile. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during verification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sand-950/60 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-xl w-full border border-sand-200 shadow-2xl overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-600" />

        {/* Dismiss Button (if allowed) */}
        {allowDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-sand-400 hover:text-sand-700 hover:bg-sand-100 transition-colors cursor-pointer"
            title="Preview Read-Only"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Verified Developer Workspace
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Anti-Spam Verified
              </span>
            </div>
            <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-bold text-sand-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-sand-600 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Verification Progress Bar */}
          <div className="space-y-1.5 bg-sand-50 p-3.5 rounded-xl border border-sand-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-sand-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sand-600" />
                Genuine Profile Verification
              </span>
              <span className={`font-mono font-bold ${audit.score === 100 ? 'text-emerald-600' : 'text-amber-700'}`}>
                {audit.score}% {audit.score === 100 ? '(Ready)' : '(Required: 100%)'}
              </span>
            </div>
            <div className="w-full bg-sand-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  audit.score === 100
                    ? 'bg-emerald-500'
                    : audit.score >= 50
                    ? 'bg-amber-500'
                    : 'bg-sand-400'
                }`}
                style={{ width: `${audit.score}%` }}
              />
            </div>

            {/* Checklist Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[11px]">
              <div className={`flex items-center gap-1 ${audit.checks.name ? 'text-emerald-700 font-semibold' : 'text-sand-500'}`}>
                <CheckCircle2 className={`w-3 h-3 ${audit.checks.name ? 'text-emerald-600' : 'text-sand-300'}`} />
                <span>Full Name</span>
              </div>
              <div className={`flex items-center gap-1 ${audit.checks.email ? 'text-emerald-700 font-semibold' : 'text-sand-500'}`}>
                <CheckCircle2 className={`w-3 h-3 ${audit.checks.email ? 'text-emerald-600' : 'text-sand-300'}`} />
                <span>Work Email</span>
              </div>
              <div className={`flex items-center gap-1 ${audit.checks.company ? 'text-emerald-700 font-semibold' : 'text-sand-500'}`}>
                <CheckCircle2 className={`w-3 h-3 ${audit.checks.company ? 'text-emerald-600' : 'text-sand-300'}`} />
                <span>Company</span>
              </div>
              <div className={`flex items-center gap-1 ${audit.checks.linkedin ? 'text-emerald-700 font-semibold' : 'text-sand-500'}`}>
                <CheckCircle2 className={`w-3 h-3 ${audit.checks.linkedin ? 'text-emerald-600' : 'text-sand-300'}`} />
                <span>LinkedIn URL</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Name & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-sand-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-sand-500" />
                    Full Name *
                  </span>
                  {audit.checks.name && <span className="text-[10px] text-emerald-600 font-bold">✓ Valid</span>}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                    name && !audit.checks.name
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-sand-200 focus:border-sand-900 focus:ring-sand-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sand-700 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-sand-500" />
                  Engineering Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-sand-200 bg-white focus:border-sand-900 focus:ring-2 focus:ring-sand-200 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Full-Stack Engineer">Full-Stack Engineer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Tech Lead / Architect">Tech Lead / Architect</option>
                  <option value="Engineering Manager">Engineering Manager</option>
                  <option value="Founder / CTO">Founder / CTO</option>
                </select>
              </div>
            </div>

            {/* Row 2: Work Email & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-sand-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-sand-500" />
                    Work / Dev Email *
                  </span>
                  {audit.checks.email && <span className="text-[10px] text-emerald-600 font-bold">✓ Official</span>}
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                    email && !audit.checks.email
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-sand-200 focus:border-sand-900 focus:ring-sand-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sand-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-sand-500" />
                    Company / Team *
                  </span>
                  {audit.checks.company && <span className="text-[10px] text-emerald-600 font-bold">✓ Valid</span>}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                    company && !audit.checks.company
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-sand-200 focus:border-sand-900 focus:ring-sand-200'
                  }`}
                />
              </div>
            </div>

            {/* Row 3: LinkedIn Profile URL */}
            <div>
              <label className="block text-xs font-semibold text-sand-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Linkedin className="w-3.5 h-3.5 text-[#0a66c2]" />
                  LinkedIn Profile URL *
                </span>
                {audit.checks.linkedin && (
                  <span className="text-[10px] text-emerald-600 font-bold">✓ Verified URL</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="https://linkedin.com/in/your-profile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className={`w-full pl-3 pr-8 py-2 text-xs sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all font-mono ${
                    linkedinUrl && !audit.checks.linkedin
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-sand-200 focus:border-sand-900 focus:ring-sand-200'
                  }`}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sand-400">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-[10px] text-sand-500 mt-1">
                Required to connect with you on LinkedIn for OAuth advisories and updates. Dummy handles are blocked.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-between">
              {allowDismiss && onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto text-xs font-semibold text-sand-500 hover:text-sand-800 transition-colors py-2 px-3 rounded-lg hover:bg-sand-50 cursor-pointer order-2 sm:order-1"
                >
                  Explore Read-Only Preview
                </button>
              ) : (
                <div className="text-[11px] text-sand-500 flex items-center gap-1 order-2 sm:order-1">
                  <Lock className="w-3 h-3 text-sand-400" />
                  Verified access required
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !audit.canProceed}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md cursor-pointer order-1 sm:order-2 ${
                  audit.canProceed && !submitting
                    ? 'bg-sand-900 hover:bg-black hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-sand-400 cursor-not-allowed opacity-75'
                }`}
              >
                <span>{submitting ? 'Verifying & Saving...' : 'Verify Profile & Unlock Workspace'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Trust Banner */}
          <div className="pt-3 border-t border-sand-100 flex items-center justify-between text-[11px] text-sand-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Stored in Supabase Database with zero-trust protection
            </span>
            <span>100% Free for Developers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

