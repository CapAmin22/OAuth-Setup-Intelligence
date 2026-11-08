import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Linkedin,
  Building2,
  Mail,
  User,
  ArrowRight,
  Briefcase,
  Lock,
} from 'lucide-react';
import {
  auditDeveloperProfile,
  registerDeveloper,
  getCurrentDeveloper,
  DeveloperProfile,
} from '../lib/auth';

interface LoginProps {
  onLoginSuccess?: (profile: DeveloperProfile) => void;
}

const ROLES = [
  'Backend Engineer',
  'Full-Stack Developer',
  'Frontend / Mobile Engineer',
  'Tech Lead / Architect',
  'DevOps / Platform Engineer',
  'Engineering Manager / Founder',
];

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [role, setRole] = useState(ROLES[0]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    const existing = getCurrentDeveloper();
    if (existing) {
      navigate(returnTo);
    }
  }, [navigate, returnTo]);

  // Compute live verification audit
  const audit = auditDeveloperProfile({
    name,
    email,
    company,
    linkedinUrl,
  });

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, company: true, linkedin: true });

    if (!audit.canProceed) {
      setSubmissionError('Please provide genuine details for all highlighted fields to pass developer verification.');
      return;
    }

    setSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await registerDeveloper({
        name,
        email,
        company,
        linkedinUrl,
        role,
      });

      if (res.success && res.profile) {
        onLoginSuccess?.(res.profile);
        // Dispatch tour open event for smooth transition into the tour
        localStorage.removeItem('oauth_welcome_dismissed'); // Ensure fresh tour experience on first login
        navigate(returnTo);
      } else {
        setSubmissionError(res.error || 'Failed to complete registration. Please check your credentials.');
      }
    } catch (err: any) {
      setSubmissionError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Value Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 text-xs font-semibold uppercase tracking-wider border border-amber-500/25 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Verified Developer Access
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-sand-900 tracking-tight leading-tight">
              Production OAuth Runbooks & Intelligent Copilot
            </h1>
            <p className="text-sand-700 text-xs sm:text-sm mt-3 leading-relaxed">
              We verify all engineers to protect our autonomous research worker from spam and guarantee high-trust community doc drift reports.
            </p>
          </div>

          <div className="bg-white border border-sand-200 rounded-2xl p-5 space-y-3.5 shadow-xs">
            <h3 className="font-bold text-sand-900 text-xs sm:text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              What You Unlock With Verified Access:
            </h3>

            <div className="space-y-2.5 text-xs text-sand-700">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>10 Curated Zero-Drift Guides:</strong> Google, Slack, GitHub, Supabase, Airtable, Discord, Linear, Zoom.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>In-Context Grounded Copilot (⌘J):</strong> Instant answers for RFC 6749 gotchas and provider quirks.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Autonomous AI Research Worker:</strong> Synthesize runbooks for any unfamiliar OAuth API in &lt;69s.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-sand-500">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero spam. Data persisted securely to Supabase.</span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 bg-white border border-sand-200 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-5 border-b border-sand-200 mb-6">
            <div>
              <h2 className="text-lg font-bold text-sand-900 tracking-tight">
                Developer Sign In & Registration
              </h2>
              <span className="text-xs text-sand-500">
                Provide your genuine professional details below
              </span>
            </div>

            {/* Live Verification Meter Badge */}
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase font-bold text-sand-500 block">
                Verification Meter
              </span>
              <span
                className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full border ${
                  audit.score === 100
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : audit.score >= 50
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-sand-100 text-sand-700 border-sand-300'
                }`}
              >
                {audit.score}% Verified
              </span>
            </div>
          </div>

          {submissionError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{submissionError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-sand-800 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sand-500" />
                  Full Name *
                </span>
                {touched.name && audit.checks.name && (
                  <span className="text-[11px] text-emerald-600 font-normal flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Genuine Name
                  </span>
                )}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. Satya Nadella or Alex Chen"
                className={`w-full bg-sand-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-sand-900 outline-none transition-all ${
                  touched.name && !audit.checks.name
                    ? 'border-red-400 focus:ring-2 focus:ring-red-400/30'
                    : 'border-sand-300 focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600'
                }`}
              />
              {touched.name && audit.errors.name && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {audit.errors.name}
                </p>
              )}
            </div>

            {/* Work / Developer Email */}
            <div>
              <label className="block text-xs font-bold text-sand-800 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sand-500" />
                  Work or Official Email *
                </span>
                {touched.email && audit.checks.email && (
                  <span className="text-[11px] text-emerald-600 font-normal flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Non-Disposable Email
                  </span>
                )}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="e.g. alex@stripe.com or alex.chen@dev.io"
                className={`w-full bg-sand-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-sand-900 outline-none transition-all ${
                  touched.email && !audit.checks.email
                    ? 'border-red-400 focus:ring-2 focus:ring-red-400/30'
                    : 'border-sand-300 focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600'
                }`}
              />
              {touched.email && audit.errors.email && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {audit.errors.email}
                </p>
              )}
            </div>

            {/* Company / Organization Name */}
            <div>
              <label className="block text-xs font-bold text-sand-800 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sand-500" />
                  Company or Organization *
                </span>
                {touched.company && audit.checks.company && (
                  <span className="text-[11px] text-emerald-600 font-normal flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid Organization
                  </span>
                )}
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onBlur={() => handleBlur('company')}
                placeholder="e.g. Stripe, Acme Corp, or Independent Developer"
                className={`w-full bg-sand-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-sand-900 outline-none transition-all ${
                  touched.company && !audit.checks.company
                    ? 'border-red-400 focus:ring-2 focus:ring-red-400/30'
                    : 'border-sand-300 focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600'
                }`}
              />
              {touched.company && audit.errors.company && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {audit.errors.company}
                </p>
              )}
            </div>

            {/* LinkedIn Profile URL */}
            <div>
              <label className="block text-xs font-bold text-sand-800 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                  LinkedIn Profile Link *
                </span>
                {touched.linkedin && audit.checks.linkedin && (
                  <span className="text-[11px] text-emerald-600 font-normal flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Profile URL
                  </span>
                )}
              </label>
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                onBlur={() => handleBlur('linkedin')}
                placeholder="https://linkedin.com/in/username"
                className={`w-full bg-sand-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-sand-900 outline-none transition-all ${
                  touched.linkedin && !audit.checks.linkedin
                    ? 'border-red-400 focus:ring-2 focus:ring-red-400/30'
                    : 'border-sand-300 focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600'
                }`}
              />
              {touched.linkedin && audit.errors.linkedin ? (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {audit.errors.linkedin}
                </p>
              ) : (
                <p className="text-[10px] text-sand-500 mt-1">
                  Used strictly for developer authenticity check (no public scraping).
                </p>
              )}
            </div>

            {/* Developer Role / Focus */}
            <div>
              <label className="block text-xs font-bold text-sand-800 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-sand-500" />
                Primary Engineering Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-sand-50 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Checklist Pills */}
            <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div
                className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                  audit.checks.name
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-sand-50 text-sand-600 border-sand-200'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${audit.checks.name ? 'text-emerald-600' : 'text-sand-400'}`} />
                <span>Real Name Quality</span>
              </div>

              <div
                className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                  audit.checks.email
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-sand-50 text-sand-600 border-sand-200'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${audit.checks.email ? 'text-emerald-600' : 'text-sand-400'}`} />
                <span>Legitimate Email</span>
              </div>

              <div
                className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                  audit.checks.company
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-sand-50 text-sand-600 border-sand-200'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${audit.checks.company ? 'text-emerald-600' : 'text-sand-400'}`} />
                <span>Authentic Company</span>
              </div>

              <div
                className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                  audit.checks.linkedin
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-sand-50 text-sand-600 border-sand-200'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${audit.checks.linkedin ? 'text-emerald-600' : 'text-sand-400'}`} />
                <span>Valid LinkedIn Link</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting || !audit.canProceed}
                className="w-full bg-sand-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {submitting ? (
                  <span>Verifying Credentials & Syncing to Supabase...</span>
                ) : (
                  <>
                    <span>Verify & Enter Workspace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

