import React, { useState } from 'react';
import { ShieldCheck, Check, X, AlertCircle } from 'lucide-react';

export const Reviewer: React.FC = () => {
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'needs_changes'>('approved');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [checklist, setChecklist] = useState({
    grounded: true,
    noSecrets: true,
    validRedirects: true,
    leastPrivilege: true,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-sand-900 tracking-tight">Admin Guide Review Gate</h1>
        <p className="text-xs text-sand-700 mt-1">
          Low-confidence or new AI-generated OAuth guides require review before public publishing.
        </p>
      </div>

      <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="font-bold text-xs uppercase tracking-wider text-sand-900 block mb-3">
            Safety & Quality Checklist
          </span>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-sand-50 border border-sand-100 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.grounded}
                onChange={(e) => setChecklist({ ...checklist, grounded: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sand-900">All critical claims cite at least one official documentation source</span>
            </label>
            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-sand-50 border border-sand-100 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.noSecrets}
                onChange={(e) => setChecklist({ ...checklist, noSecrets: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sand-900">No real client secrets, private keys, or tokens present in instructions</span>
            </label>
            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-sand-50 border border-sand-100 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.validRedirects}
                onChange={(e) => setChecklist({ ...checklist, validRedirects: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sand-900">Redirect URI instructions emphasize HTTPS requirements</span>
            </label>
            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-sand-50 border border-sand-100 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.leastPrivilege}
                onChange={(e) => setChecklist({ ...checklist, leastPrivilege: e.target.checked })}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sand-900">Scopes follow the principle of least privilege</span>
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
              Approve
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
              Reject
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
            placeholder="Document any corrections or caveats observed during verification..."
            className="w-full bg-sand-50/50 border border-sand-300 rounded-xl p-3 text-xs text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/30"
          />
        </div>

        <button
          onClick={() => setSubmitted(true)}
          className="w-full bg-sand-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
        >
          {submitted ? 'Decision Recorded ✓' : 'Submit Review Decision'}
        </button>
      </div>
    </div>
  );
};
