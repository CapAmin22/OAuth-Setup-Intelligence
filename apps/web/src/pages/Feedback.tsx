import React, { useState } from 'react';
import { MessageSquare, Check } from 'lucide-react';

export const Feedback: React.FC = () => {
  const [message, setMessage] = useState('');
  const [provider, setProvider] = useState('General');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-sand-900 tracking-tight">Report Documentation Drift</h1>
        <p className="text-xs text-sand-700 mt-1">
          Did a provider alter their OAuth console or scope naming? Help us keep runbooks accurate.
        </p>
      </div>

      <div className="bg-white border border-sand-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {sent ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sand-900 text-base mb-1">Feedback Received</h3>
            <p className="text-xs text-sand-700">
              Thank you. Our verification system will schedule a freshness re-check.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-sand-900 mb-1">Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-sand-50 border border-sand-300 rounded-lg p-2.5 text-xs text-sand-900"
              >
                <option value="General">General / Other</option>
                <option value="Google">Google</option>
                <option value="Slack">Slack</option>
                <option value="GitHub">GitHub</option>
                <option value="Notion">Notion</option>
                <option value="Salesforce">Salesforce</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-sand-900 mb-1">Observation</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what changed or what step was blocked..."
                className="w-full bg-sand-50 border border-sand-300 rounded-lg p-2.5 text-xs text-sand-900 outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sand-900 hover:bg-black text-white font-bold py-2.5 rounded-lg text-xs transition-colors"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

