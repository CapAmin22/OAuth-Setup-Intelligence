import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Code,
  HelpCircle,
  CornerDownLeft,
} from 'lucide-react';
import { GuideVersion } from '../types';
import { PROVIDER_SEED_FAQS, queryCopilot, CopilotQA } from '../lib/copilotKnowledge';

interface Message {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  qa?: CopilotQA;
}

interface ProviderCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  guide: GuideVersion;
}

export const ProviderCopilotDrawer: React.FC<ProviderCopilotDrawerProps> = ({
  isOpen,
  onClose,
  guide,
}) => {
  const slug = guide.providerSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
  const providerName = guide.providerName;
  const seedFaqs = PROVIDER_SEED_FAQS[slug] || [];

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with seed welcome
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            sender: 'copilot',
            text: `Ask any technical or edge-case question regarding ${providerName} OAuth 2.0. All answers are strictly grounded in official vendor documentation.`,
          },
        ]);
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, providerName]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
    };

    const qaResult = queryCopilot(slug, q, guide);
    const copilotMsg: Message = {
      id: `copilot-${Date.now()}`,
      sender: 'copilot',
      text: qaResult.answer,
      qa: qaResult,
    };

    setMessages((prev) => [...prev, userMsg, copilotMsg]);
    setInput('');
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-sand-200 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-sand-200 bg-sand-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sand-900 text-sm sm:text-base flex items-center gap-2">
                  <span>{providerName} OAuth Copilot</span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-200">
                    Grounded
                  </span>
                </h3>
                <span className="text-[11px] text-sand-500 block">
                  Zero-hallucination Q&A from official documentation
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-sand-400 hover:text-sand-900 hover:bg-sand-200 transition-colors"
              title="Close copilot (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Seed Question Pills (if available) */}
          {seedFaqs.length > 0 && (
            <div className="px-4 py-3 bg-sand-100/40 border-b border-sand-200/80">
              <span className="text-[10px] font-mono uppercase text-sand-500 block mb-1.5 font-bold">
                Common Developer Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {seedFaqs.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleSend(faq.question)}
                    className="text-left text-[11px] font-medium bg-white hover:bg-amber-50 border border-sand-200 hover:border-amber-400 text-sand-800 hover:text-amber-900 px-2.5 py-1 rounded-lg transition-all shadow-2xs"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {m.sender === 'user' ? (
                  <div className="bg-sand-900 text-white rounded-2xl rounded-tr-xs px-3.5 py-2 max-w-[85%] shadow-2xs font-medium">
                    {m.text}
                  </div>
                ) : (
                  <div className="bg-sand-50 border border-sand-200 rounded-2xl rounded-tl-xs p-3.5 max-w-[95%] shadow-2xs space-y-2.5">
                    <p className="text-sand-900 leading-relaxed font-normal">{m.text}</p>

                    {/* Code Snippet Box */}
                    {m.qa?.codeSnippet && (
                      <div className="rounded-xl overflow-hidden border border-sand-800 mt-2">
                        <div className="bg-sand-950 px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-sand-400 border-b border-sand-800">
                          <span>Snippet</span>
                          <button
                            onClick={() => handleCopyCode(m.qa!.codeSnippet!, m.id)}
                            className="inline-flex items-center gap-1 hover:text-white transition-colors"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-[#1a1918] text-amber-100 p-3 text-[11px] font-mono overflow-x-auto whitespace-pre leading-relaxed">
                          {m.qa.codeSnippet}
                        </pre>
                      </div>
                    )}

                    {/* Citation Link */}
                    {m.qa?.sourceUrl && (
                      <div className="pt-2 border-t border-sand-200/80 flex items-center justify-between text-[11px]">
                        <span className="text-sand-500 font-medium">Source:</span>
                        <a
                          href={m.qa.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium hover:underline truncate max-w-[240px]"
                        >
                          <span>{m.qa.sourceTitle}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3.5 border-t border-sand-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${providerName} OAuth question...`}
                className="flex-1 bg-sand-50 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 bg-sand-900 hover:bg-black text-white rounded-xl transition-colors disabled:opacity-40 shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                title="Send question"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-sand-400 mt-2 px-1">
              <span>Grounded in RFC 6749 & vendor docs</span>
              <span>Press Esc to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
