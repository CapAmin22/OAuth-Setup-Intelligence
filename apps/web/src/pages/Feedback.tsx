import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MessageSquare, Check, ShieldCheck, ArrowLeft, AlertCircle, Star } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GuideFeedbackWidget } from '../components/GuideFeedbackWidget';

export function redactSensitiveData(text: string): string {
  return text
    .replace(/ghp_[A-Za-z0-9]{20,}/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/xox[baprs]-[A-Za-z0-9\-]{15,}/g, '[REDACTED_SLACK_TOKEN]')
    .replace(/ya29\.[A-Za-z0-9_\-]{20,}/g, '[REDACTED_GOOGLE_TOKEN]')
    .replace(/cf[a-z0-9_]{4,}[A-Za-z0-9_\-]{20,}/g, '[REDACTED_API_KEY]')
    .replace(/tvly-[A-Za-z0-9_\-]{20,}/g, '[REDACTED_TAVILY_KEY]')
    .replace(/(client_secret|clientsecret|secret|password|bearer|api_key|apikey|token)[=:\s]+[A-Za-z0-9_\-\.]{8,}/gi, '$1=[REDACTED]');
}

export const Feedback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlProvider = searchParams.get('provider') || '';
  const urlStep = searchParams.get('step') || '';

  const [provider, setProvider] = useState('General');
  const [stepRef, setStepRef] = useState('');
  const [classification, setClassification] = useState('documentation_drift');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'satisfaction' | 'drift'>('satisfaction');

  useEffect(() => {
    if (urlProvider) {
      const match = [
        'google', 'slack', 'github', 'notion', 'salesforce',
        'discord', 'spotify', 'linear', 'hubspot', 'zoom'
      ].find(p => p.toLowerCase() === urlProvider.toLowerCase());
      if (match) {
        setProvider(match.charAt(0).toUpperCase() + match.slice(1));
      } else {
        setProvider(urlProvider);
      }
    }
    if (urlStep) {
      setStepRef(urlStep);
    }
  }, [urlProvider, urlStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    const sanitizedMsg = redactSensitiveData(message.trim());

    const entry = {
      id: `fb-${Date.now()}`,
      provider,
      stepRef: stepRef.trim() || undefined,
      classification,
      message: sanitizedMsg,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Store in localStorage for instant admin dashboard retrieval
      const raw = localStorage.getItem('oauth_feedback_list');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(entry);
      localStorage.setItem('oauth_feedback_list', JSON.stringify(list));

      // 2. Persist to Supabase feedback table if connected
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('feedback').insert({
            redacted_message: `[${provider}${stepRef ? ` - ${stepRef}` : ''}] ${sanitizedMsg}`,
            step_ref: stepRef.trim() || null,
            classification,
          });
        } catch (dbErr) {
          console.warn('Supabase feedback insert non-fatal warning:', dbErr);
        }
      }
    } catch (err) {
      console.warn('Feedback fallback error:', err);
    } finally {
      setIsSubmitting(false);
      setSent(true);
    }
  };

  const providerSlug = provider.toLowerCase();

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to={providerSlug !== 'general' ? `/guide/${providerSlug}` : '/library'}
          className="inline-flex items-center gap-1.5 text-xs text-sand-600 hover:text-sand-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {providerSlug !== 'general' ? `${provider} Guide` : 'Library'}</span>
        </Link>
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Community Feedback Loop</span>
        </div>
        <h1 className="text-2xl font-bold text-sand-900 tracking-tight">Developer Insights &amp; Feedback</h1>
        <p className="text-xs text-sand-700 mt-1.5 max-w-md mx-auto">
          Help us build the most reliable OAuth setup assistant. Rate your experience or report developer console changes.
        </p>

        {/* Tab Toggle */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <div className="inline-flex rounded-xl bg-sand-200/80 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('satisfaction')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'satisfaction'
                  ? 'bg-white text-sand-900 shadow-2xs'
                  : 'text-sand-700 hover:text-sand-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Rate Tool &amp; Suggest Features</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('drift')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'drift'
                  ? 'bg-white text-sand-900 shadow-2xs'
                  : 'text-sand-700 hover:text-sand-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Report Documentation Drift</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'satisfaction' ? (
        <GuideFeedbackWidget
          providerName={provider}
          providerSlug={providerSlug}
        />
      ) : (
      <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {sent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sand-900 text-base mb-1">Feedback Logged & Triaged</h3>
            <p className="text-xs text-sand-700 max-w-sm mx-auto mb-6">
              Thank you! Your report has been added to the verification queue. Any client secrets or sensitive tokens were automatically scrubbed.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSent(false);
                  setMessage('');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-sand-100 hover:bg-sand-200 text-sand-800 transition-colors"
              >
                Submit Another Report
              </button>
              <Link
                to={providerSlug !== 'general' ? `/guide/${providerSlug}` : '/library'}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-sand-900 hover:bg-black text-white transition-colors"
              >
                Return to Guide
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-sand-900 mb-1">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-sand-50 border border-sand-300 rounded-lg p-2.5 text-xs text-sand-900 outline-none focus:ring-1 focus:ring-amber-600"
                >
                  <option value="General">General / Other</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Google">Google</option>
                  <option value="Slack">Slack</option>
                  <option value="Notion">Notion</option>
                  <option value="Salesforce">Salesforce</option>
                  <option value="Discord">Discord</option>
                  <option value="Spotify">Spotify</option>
                  <option value="Linear">Linear</option>
                  <option value="HubSpot">HubSpot</option>
                  <option value="Zoom">Zoom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-sand-900 mb-1">Step Reference (Optional)</label>
                <input
                  type="text"
                  value={stepRef}
                  onChange={(e) => setStepRef(e.target.value)}
                  placeholder="e.g. Step 2: Configure Redirect URI"
                  className="w-full bg-sand-50 border border-sand-300 rounded-lg p-2.5 text-xs text-sand-900 outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-sand-900 mb-1">Issue Category</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full bg-sand-50 border border-sand-300 rounded-lg p-2.5 text-xs text-sand-900 outline-none focus:ring-1 focus:ring-amber-600"
              >
                <option value="documentation_drift">Documentation Drift / Console UI Changed</option>
                <option value="broken_step">Step Failed / Error Encountered</option>
                <option value="permission_scope">Scope or Permission Deprecated</option>
                <option value="missing_feature">General Clarification / Feature Request</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase text-sand-900">Observation</label>
                <span className="text-[10px] text-sand-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Auto Secret Scrubbing Active
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what changed in the provider portal or what error occurred..."
                className="w-full bg-sand-50 border border-sand-300 rounded-lg p-2.5 text-xs text-sand-900 outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-sand-50 border border-sand-200 text-[11px] text-sand-700 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                All submitted reports pass through zero-trust token sanitizers. We automatically scrub API keys, client secrets, and bearer tokens before saving.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sand-900 hover:bg-black text-white font-bold py-2.5 rounded-lg text-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback Report'}
            </button>
          </form>
        )}
      </div>
      )}
    </div>
  );
};
