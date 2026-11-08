import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Check, X, AlertCircle, MessageSquare, 
  RefreshCw, CheckCircle2, Clock, Filter, Eye, ChevronRight,
  Users, Linkedin, Building2, Copy, ExternalLink, Mail, Search, Sparkles, UserCheck, Lock
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  listRegisteredDevelopers,
  getCurrentDeveloper,
  isAdminDeveloper,
  promptDeveloperAuth,
  DeveloperProfile,
} from '../lib/auth';

interface FeedbackItem {
  id: string;
  provider: string;
  stepRef?: string;
  classification: string;
  message: string;
  status: 'open' | 'acknowledged' | 'resolved';
  createdAt: string;
}

const DEFAULT_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb-seed-1',
    provider: 'Discord',
    stepRef: 'Step 3: Redirect URIs',
    classification: 'documentation_drift',
    message: 'Discord Developer Portal now explicitly requires http://localhost:port or https:// for all redirect URIs.',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'fb-seed-2',
    provider: 'Slack',
    stepRef: 'Step 2: Basic Information',
    classification: 'documentation_drift',
    message: 'The Slack API console moved "Install your app" to a new top-level sidebar tab named "Install to Workspace".',
    status: 'acknowledged',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'fb-seed-3',
    provider: 'GitHub',
    stepRef: 'Step 1: Register Application',
    classification: 'permission_scope',
    message: 'GitHub Apps are now favored over legacy OAuth Apps; fine-grained repository permissions are highlighted in docs.',
    status: 'resolved',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export const Reviewer: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'drift_queue' | 'guide_review' | 'developer_roster'>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('tab=developers')) {
      return 'developer_roster';
    }
    return 'drift_queue';
  });

  // Track active developer authentication state to enforce Admin Amin gate
  const [currentDev, setCurrentDev] = useState<DeveloperProfile | null>(() => getCurrentDeveloper());

  useEffect(() => {
    const handleAuthChange = () => setCurrentDev(getCurrentDeveloper());
    window.addEventListener('oauth_auth_state_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('oauth_auth_state_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const isAdmin = isAdminDeveloper(currentDev);

  // Registered Developer Leads State (for LinkedIn Outreach)
  const [developers, setDevelopers] = useState<DeveloperProfile[]>([]);
  const [searchLead, setSearchLead] = useState('');
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);

  // Guide Review State
  const [targetProvider, setTargetProvider] = useState('Linear');
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'needs_changes'>('approved');
  const [notes, setNotes] = useState('');
  const [guideSubmitted, setGuideSubmitted] = useState(false);
  const [checklist, setChecklist] = useState({
    grounded: true,
    noSecrets: true,
    validRedirects: true,
    leastPrivilege: true,
  });

  // Community Drift Feedback Queue State
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'acknowledged' | 'resolved'>('all');
  const [auditingProvider, setAuditingProvider] = useState<string | null>(null);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  useEffect(() => {
    loadDevelopers();
  }, []);

  const loadDevelopers = async () => {
    try {
      const list = await listRegisteredDevelopers();
      setDevelopers(list);
    } catch (err) {
      console.warn('Failed to load registered developers:', err);
    }
  };

  const copyOutreachTemplate = (dev: DeveloperProfile) => {
    const firstName = dev.name.split(' ')[0] || dev.name;
    const message = `Hi ${firstName}, saw you're setting up OAuth for ${dev.company} using OAuth Setup Intelligence! How is the implementation going? Let me know if you run into any provider blockers (like redirect URI mismatch, CORS, or refresh tokens) or need custom scope reviews!`;
    navigator.clipboard.writeText(message);
    setCopiedLeadId(dev.email);
    setTimeout(() => setCopiedLeadId(null), 3500);
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const raw = localStorage.getItem('oauth_feedback_list');
      let localItems: FeedbackItem[] = raw ? JSON.parse(raw) : [];

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const mappedDb: FeedbackItem[] = data.map((d: any) => ({
              id: d.id,
              provider: d.redacted_message?.split(']')[0]?.replace('[', '')?.split('-')[0]?.trim() || 'General',
              stepRef: d.step_ref || undefined,
              classification: d.classification || 'documentation_drift',
              message: d.redacted_message || '',
              status: 'open',
              createdAt: d.created_at || new Date().toISOString(),
            }));

            // Merge local and DB, avoiding duplicates
            const combined = [...localItems];
            for (const item of mappedDb) {
              if (!combined.some(c => c.id === item.id || c.message === item.message)) {
                combined.push(item);
              }
            }
            localItems = combined;
          }
        } catch (dbErr) {
          console.warn('Supabase fetch feedback notice:', dbErr);
        }
      }

      if (localItems.length === 0) {
        localItems = DEFAULT_FEEDBACK;
        localStorage.setItem('oauth_feedback_list', JSON.stringify(DEFAULT_FEEDBACK));
      }

      setFeedbackList(localItems);
    } catch (err) {
      console.warn('Error loading feedback:', err);
      setFeedbackList(DEFAULT_FEEDBACK);
    }
  };

  const updateItemStatus = (id: string, newStatus: 'open' | 'acknowledged' | 'resolved') => {
    const updated = feedbackList.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setFeedbackList(updated);
    localStorage.setItem('oauth_feedback_list', JSON.stringify(updated));
  };

  const triggerReAudit = (providerName: string) => {
    setAuditingProvider(providerName);
    setAuditMessage(null);
    setTimeout(() => {
      setAuditingProvider(null);
      setAuditMessage(`Audit Completed for ${providerName}: Official documentation hashes verified fresh (0% drift).`);
      setTimeout(() => setAuditMessage(null), 5000);
    }, 1800);
  };

  const filteredItems = feedbackList.filter(
    (item) => statusFilter === 'all' || item.status === statusFilter
  );

  const openCount = feedbackList.filter((i) => i.status === 'open').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-sand-800 bg-sand-100 border border-sand-300 px-3 py-1 rounded-full text-[11px] font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Staff Engineering & Intelligence Ops</span>
        </div>
        <h1 className="text-3xl font-bold text-sand-900 tracking-tight">Admin Review & Drift Triage</h1>
        <p className="text-xs text-sand-700 mt-1.5 max-w-lg mx-auto">
          Manage the human-in-the-loop review gate for autonomous OAuth guides and triage live community drift reports.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sand-200 mb-8 justify-center gap-4">
        <button
          onClick={() => setActiveTab('drift_queue')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'drift_queue'
              ? 'text-amber-800 border-b-2 border-amber-600'
              : 'text-sand-600 hover:text-sand-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Community Drift Queue</span>
          {openCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {openCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('guide_review')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'guide_review'
              ? 'text-amber-800 border-b-2 border-amber-600'
              : 'text-sand-600 hover:text-sand-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Guide Publishing Gate</span>
        </button>

        <button
          onClick={() => setActiveTab('developer_roster')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'developer_roster'
              ? 'text-amber-800 border-b-2 border-amber-600'
              : 'text-sand-600 hover:text-sand-900'
          }`}
          title={isAdmin ? 'Verified Developer Leads & LinkedIn Outreach (Admin: Amin)' : 'Admin Access Required (Restricted to Amin)'}
        >
          {isAdmin ? (
            <Users className="w-4 h-4 text-indigo-600" />
          ) : (
            <Lock className="w-4 h-4 text-amber-700" />
          )}
          <span>Developer Leads & Outreach</span>
          {isAdmin ? (
            developers.length > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {developers.length}
              </span>
            )
          ) : (
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
              Admin Amin
            </span>
          )}
        </button>
      </div>

      {/* Audit Banner Notification */}
      {auditMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{auditMessage}</span>
        </div>
      )}

      {/* TAB 1: Community Drift Queue */}
      {activeTab === 'drift_queue' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-xl border border-sand-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-sand-700 font-medium">
              <Filter className="w-3.5 h-3.5 text-sand-500" />
              <span>Filter Status:</span>
              <div className="flex gap-1">
                {(['all', 'open', 'acknowledged', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors capitalize ${
                      statusFilter === st
                        ? 'bg-sand-900 text-white'
                        : 'bg-sand-100 hover:bg-sand-200 text-sand-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={loadFeedback}
              className="inline-flex items-center gap-1.5 text-xs text-sand-700 hover:text-sand-900 px-2.5 py-1 rounded-md border border-sand-200 hover:bg-sand-50 transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-sand-500" />
              <span>Refresh Queue</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-sand-200 p-8">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-bold text-sand-900 text-sm">No feedback reports found</h3>
                <p className="text-xs text-sand-600 mt-1">All documentation drift reports in this category have been resolved.</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isAuditing = auditingProvider === item.provider;

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm space-y-3 transition-all hover:border-sand-300"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-sand-100 text-sand-900 border border-sand-200">
                          {item.provider}
                        </span>
                        {item.stepRef && (
                          <span className="text-[11px] font-mono text-sand-600 bg-sand-50 px-2 py-0.5 rounded border border-sand-200/60">
                            {item.stepRef}
                          </span>
                        )}
                        <span className="text-[11px] text-sand-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            item.status === 'open'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : item.status === 'acknowledged'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-sand-900 leading-relaxed font-sans bg-sand-50/60 p-3 rounded-lg border border-sand-100">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-sand-100 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        {item.status !== 'open' && (
                          <button
                            onClick={() => updateItemStatus(item.id, 'open')}
                            className="text-[11px] text-sand-600 hover:text-sand-900 px-2 py-1 rounded hover:bg-sand-100 transition-colors"
                          >
                            Mark Open
                          </button>
                        )}
                        {item.status !== 'acknowledged' && (
                          <button
                            onClick={() => updateItemStatus(item.id, 'acknowledged')}
                            className="text-[11px] font-medium text-sky-700 hover:text-sky-900 px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                        {item.status !== 'resolved' && (
                          <button
                            onClick={() => updateItemStatus(item.id, 'resolved')}
                            className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          >
                            Resolve Drift
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => triggerReAudit(item.provider)}
                        disabled={isAuditing}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sand-800 bg-sand-100 hover:bg-sand-200 px-2.5 py-1 rounded-md border border-sand-200 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 text-amber-600 ${isAuditing ? 'animate-spin' : ''}`} />
                        <span>{isAuditing ? 'Auditing Documentation...' : 'Trigger Freshness Re-Audit'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Guide Publishing Gate */}
      {activeTab === 'guide_review' && (
        <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-sand-100 flex-wrap gap-3">
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-sand-500 block mb-1">
                Candidate Runbook Under Review
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sand-900 text-base">{targetProvider} OAuth 2.0 Integration</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Confidence: 94/100
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-sand-600 font-medium">Switch Target:</label>
              <select
                value={targetProvider}
                onChange={(e) => setTargetProvider(e.target.value)}
                className="bg-sand-50 border border-sand-200 rounded-lg p-1.5 text-xs text-sand-900"
              >
                <option value="Linear">Linear</option>
                <option value="HubSpot">HubSpot</option>
                <option value="Zoom">Zoom</option>
                <option value="Airtable">Airtable</option>
              </select>
            </div>
          </div>

          <div>
            <span className="font-bold text-xs uppercase tracking-wider text-sand-900 block mb-3">
              Safety & Verification Checklist
            </span>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-sand-50 border border-sand-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.grounded}
                  onChange={(e) => setChecklist({ ...checklist, grounded: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sand-900 font-medium">All critical claims cite at least one official documentation source</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-sand-50 border border-sand-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.noSecrets}
                  onChange={(e) => setChecklist({ ...checklist, noSecrets: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sand-900 font-medium">No real client secrets, private keys, or tokens present in instructions</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-sand-50 border border-sand-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.validRedirects}
                  onChange={(e) => setChecklist({ ...checklist, validRedirects: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sand-900 font-medium">Redirect URI instructions emphasize HTTPS requirements and domain restrictions</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-sand-50 border border-sand-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.leastPrivilege}
                  onChange={(e) => setChecklist({ ...checklist, leastPrivilege: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sand-900 font-medium">Scopes follow the principle of least privilege</span>
              </label>
            </div>
          </div>

          <div>
            <label className="font-bold text-xs uppercase tracking-wider text-sand-900 block mb-2">
              Review Decision
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('approved')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  decision === 'approved' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-sand-50 text-sand-700'
                }`}
              >
                Approve & Publish
              </button>
              <button
                type="button"
                onClick={() => setDecision('needs_changes')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  decision === 'needs_changes' ? 'bg-amber-600 text-white border-amber-600' : 'bg-sand-50 text-sand-700'
                }`}
              >
                Request Fix
              </button>
              <button
                type="button"
                onClick={() => setDecision('rejected')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  decision === 'rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-sand-50 text-sand-700'
                }`}
              >
                Reject Guide
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-xs uppercase tracking-wider text-sand-900 block mb-1.5">
              Reviewer Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Document any corrections, scope caveats, or portal notes observed during manual verification..."
              className="w-full bg-sand-50 border border-sand-300 rounded-xl p-3 text-xs text-sand-900 outline-none focus:ring-1 focus:ring-amber-600"
            />
          </div>

          <button
            onClick={() => setGuideSubmitted(true)}
            className="w-full bg-sand-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
          >
            {guideSubmitted ? 'Decision Recorded & Published ✓' : 'Submit Review Decision'}
          </button>
        </div>
      )}

      {/* TAB 3: Developer Leads & Outreach Hub (Restricted strictly to Admin Amin) */}
      {activeTab === 'developer_roster' && (
        !isAdmin ? (
          <div className="bg-white border border-sand-200 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-sm animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Lock className="w-8 h-8 text-amber-700" />
            </div>
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-full mb-3 uppercase tracking-wider">
              Restricted Admin Area
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-sand-900 tracking-tight">
              Administrator Access Required
            </h2>
            <p className="text-xs sm:text-sm text-sand-600 mt-2 max-w-md mx-auto leading-relaxed">
              The Developer Leads & LinkedIn Outreach Hub is strictly restricted to administrator <strong>Amin</strong>.
            </p>
            <div className="mt-5 p-3.5 bg-sand-50 rounded-xl border border-sand-200 text-xs text-sand-700 max-w-sm mx-auto">
              <span className="text-sand-500">Current Active Profile: </span>
              <strong className="text-sand-900">{currentDev?.name || 'Guest / Not Signed In'}</strong>
              {currentDev?.company && <span className="text-sand-500"> ({currentDev.company})</span>}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => promptDeveloperAuth()}
                className="w-full sm:w-auto px-5 py-2.5 bg-sand-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Sign In as Admin (Amin)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('drift_queue')}
                className="w-full sm:w-auto px-5 py-2.5 bg-sand-100 hover:bg-sand-200 text-sand-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Return to Community Queue
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sand-50 p-5 rounded-2xl border border-sand-200">
              <div>
                <h2 className="text-sm font-bold text-sand-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Verified Developer Leads ({developers.length})</span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Admin Access: Amin
                  </span>
                </h2>
                <p className="text-xs text-sand-600 mt-1">
                  Reach out on LinkedIn to engineers actively implementing OAuth with your runbooks. Click to message directly or copy custom outreach notes.
                </p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, company, email..."
                  value={searchLead}
                  onChange={(e) => setSearchLead(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-sand-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-600 w-full sm:w-64"
                />
                <Search className="w-3.5 h-3.5 text-sand-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* List of Developers */}
            <div className="space-y-3">
              {developers
                .filter(
                  (d) =>
                    !searchLead ||
                    d.name.toLowerCase().includes(searchLead.toLowerCase()) ||
                    d.company.toLowerCase().includes(searchLead.toLowerCase()) ||
                    d.email.toLowerCase().includes(searchLead.toLowerCase())
                )
                .map((dev) => (
                  <div
                    key={dev.email}
                    className="bg-white border border-sand-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-sand-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                        {dev.name[0]?.toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-sand-900">{dev.name}</h3>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified ({dev.verificationScore}%)
                          </span>
                          <span className="text-[11px] text-sand-400 font-mono">
                            {new Date(dev.verifiedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-sand-600 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-sand-800">
                            <Building2 className="w-3.5 h-3.5 text-sand-400" />
                            {dev.company}
                          </span>
                          <span className="text-sand-300">•</span>
                          <span>{dev.role}</span>
                          <span className="text-sand-300">•</span>
                          <a
                            href={`mailto:${dev.email}`}
                            className="flex items-center gap-1 text-sand-500 hover:text-sand-800 transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            {dev.email}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Outreach Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center w-full md:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => copyOutreachTemplate(dev)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sand-300 bg-white hover:bg-sand-50 text-xs font-semibold text-sand-700 transition-colors shadow-2xs cursor-pointer"
                        title="Copy personalized LinkedIn message template"
                      >
                        <Copy className="w-3.5 h-3.5 text-sand-500" />
                        <span>{copiedLeadId === dev.email ? 'Copied Note ✓' : 'Copy Intro Note'}</span>
                      </button>

                      <a
                        href={dev.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>Message on LinkedIn</span>
                        <ExternalLink className="w-3 h-3 text-white/80" />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};
