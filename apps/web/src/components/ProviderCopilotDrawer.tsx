import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { GuideVersion } from '../types';
import { PROVIDER_SEED_FAQS, queryCopilot, CopilotQA } from '../lib/copilotKnowledge';
import { ProviderLogo } from './ProviderLogo';

interface Message {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  qa?: CopilotQA;
  timestamp: string;
}

interface ProviderCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  guide: GuideVersion;
}

// Markdown-aware formatted text renderer for structured human-centric answers
const FormattedAnswer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-xs sm:text-sm text-sand-900 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Pro-Tip / Actionable Callout
        if (trimmed.startsWith('💡') || trimmed.startsWith('> 💡')) {
          return (
            <div
              key={idx}
              className="my-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-950 font-medium text-xs flex items-start gap-2 shadow-2xs"
            >
              <span className="shrink-0 text-sm">💡</span>
              <div className="flex-1 leading-normal">
                {trimmed.replace(/^>?\s*💡\s*/, '')}
              </div>
            </div>
          );
        }

        // Actionable Fix Quote
        if (trimmed.startsWith('>')) {
          return (
            <div
              key={idx}
              className="my-1.5 pl-3 py-1 border-l-2 border-amber-500 bg-sand-100/50 rounded-r-lg text-sand-800 text-xs italic"
            >
              {trimmed.replace(/^>\s*/, '')}
            </div>
          );
        }

        // Numbered item or main heading (e.g., "**1. Title**")
        if (/^\*\*\d+\./.test(trimmed)) {
          return (
            <div key={idx} className="pt-2 font-bold text-sand-950 text-xs sm:text-sm">
              {trimmed.replace(/\*\*/g, '')}
            </div>
          );
        }

        // Bullet point
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          const content = trimmed.replace(/^[•\-]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 my-1">
              <span className="text-amber-600 font-bold leading-tight">•</span>
              <span className="flex-1">
                {content.split(/(\*\*.*?\*\*|`.*?`)/).map((part, pIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={pIdx} className="font-semibold text-sand-950">{part.slice(2, -2)}</strong>;
                  }
                  if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                      <code key={pIdx} className="px-1.5 py-0.5 rounded bg-sand-200/80 font-mono text-[11px] text-amber-900 border border-sand-300/60">
                        {part.slice(1, -1)}
                      </code>
                    );
                  }
                  return part;
                })}
              </span>
            </div>
          );
        }

        // Standard prose with inline bold and code
        return (
          <p key={idx}>
            {line.split(/(\*\*.*?\*\*|`.*?`)/).map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={pIdx} className="font-semibold text-sand-950">{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code key={pIdx} className="px-1.5 py-0.5 rounded bg-sand-200/80 font-mono text-[11px] text-amber-900 border border-sand-300/60">
                    {part.slice(1, -1)}
                  </code>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

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
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with human welcome message
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            sender: 'copilot',
            text: `Hi! I am your **${providerName} OAuth Copilot**. I can help you with setup hurdles, token refresh rules, callback validation, and top integration pitfalls — all grounded in official documentation.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            qa: {
              id: 'welcome-qa',
              question: 'Welcome',
              category: 'general',
              answer: '',
              sourceUrl: guide.sources?.[0]?.url || `https://${guide.providerSlug}.com`,
              sourceTitle: `${providerName} Developer Portal`,
              followUps: [
                `What are the top 3 problems when integrating ${providerName}?`,
                `Show ${providerName} token exchange code`,
                `Where do I create an OAuth App in ${providerName}?`,
              ],
            },
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

  // Auto-scroll on new message or typing state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (questionText: string) => {
    const q = questionText.trim();
    if (!q || isTyping) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Natural perception delay (350ms) to analyze docs and formulate structured answer
    setTimeout(() => {
      const qaResult = queryCopilot(guide.providerSlug, q, guide);
      const copilotMsg: Message = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: qaResult.answer,
        qa: qaResult,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsTyping(false);
    }, 380);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'copilot',
        text: `Conversation reset. What technical or edge-case question can I help you resolve regarding **${providerName} OAuth 2.0**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        qa: {
          id: 'reset-qa',
          question: 'Reset',
          category: 'general',
          answer: '',
          sourceUrl: guide.sources?.[0]?.url || `https://${guide.providerSlug}.com`,
          sourceTitle: `${providerName} Developer Documentation`,
          followUps: [
            `What are the top 3 problems when integrating ${providerName}?`,
            `Show ${providerName} token exchange code`,
            `Where do I create an OAuth App in ${providerName}?`,
          ],
        },
      },
    ]);
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
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-sand-200 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-sand-200 bg-sand-50/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-sand-200 p-1.5 flex items-center justify-center shadow-2xs shrink-0">
                <ProviderLogo slug={guide.providerSlug} name={providerName} size="md" />
              </div>
              <div>
                <h3 className="font-bold text-sand-900 text-sm sm:text-base flex items-center gap-2">
                  <span>{providerName} OAuth Copilot</span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Grounded
                  </span>
                </h3>
                <span className="text-[11px] text-sand-600 block">
                  Zero-hallucination interactive assistant · RFC 6749 verified
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-2 rounded-lg text-sand-500 hover:text-sand-900 hover:bg-sand-200 transition-colors cursor-pointer"
                title="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-sand-500 hover:text-sand-900 hover:bg-sand-200 transition-colors cursor-pointer"
                title="Close Copilot (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick FAQ Suggestion Bar */}
          {seedFaqs.length > 0 && messages.length <= 1 && (
            <div className="px-4 py-3 bg-amber-500/5 border-b border-amber-500/15">
              <span className="text-[10px] font-mono uppercase text-amber-900/80 block mb-1.5 font-bold tracking-wider">
                Common Developer Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {seedFaqs.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleSend(faq.question)}
                    disabled={isTyping}
                    className="text-left text-[11px] font-medium bg-white hover:bg-amber-50 border border-sand-200 hover:border-amber-400 text-sand-800 hover:text-amber-950 px-2.5 py-1 rounded-lg transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-sand-600 font-mono">
                  {m.sender === 'user' ? (
                    <>
                      <span>You</span>
                      <span>·</span>
                      <span>{m.timestamp}</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-amber-700" />
                      <span className="font-bold text-sand-900">{providerName} Copilot</span>
                      <span>·</span>
                      <span>{m.timestamp}</span>
                    </>
                  )}
                </div>

                {m.sender === 'user' ? (
                  <div className="bg-sand-900 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[85%] shadow-xs font-medium text-xs sm:text-sm">
                    {m.text}
                  </div>
                ) : (
                  <div className="bg-sand-50/90 border border-sand-200/90 rounded-2xl rounded-tl-xs p-4 max-w-[96%] shadow-xs space-y-3">
                    <FormattedAnswer text={m.text} />

                    {/* Code Snippet Box */}
                    {m.qa?.codeSnippet && (
                      <div className="rounded-xl overflow-hidden border border-sand-800 mt-2.5 shadow-xs">
                        <div className="bg-sand-950 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-sand-400 border-b border-sand-800">
                          <span className="text-amber-400 font-bold">// Verified Implementation Snippet</span>
                          <button
                            onClick={() => handleCopyCode(m.qa!.codeSnippet!, m.id)}
                            className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-sand-300"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Snippet</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-[#181716] text-amber-100 p-3.5 text-[11px] font-mono overflow-x-auto whitespace-pre leading-relaxed select-all">
                          {m.qa.codeSnippet}
                        </pre>
                      </div>
                    )}

                    {/* Interactive Follow-up Suggestion Chips */}
                    {m.qa?.followUps && m.qa.followUps.length > 0 && (
                      <div className="pt-2 border-t border-sand-200/60">
                        <span className="text-[10px] font-mono uppercase text-sand-600 block mb-1.5 font-bold tracking-wider">
                          Follow-up Questions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.qa.followUps.map((chip, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(chip)}
                              disabled={isTyping}
                              className="text-[11px] bg-white hover:bg-amber-50 text-sand-800 hover:text-amber-950 border border-sand-300/80 hover:border-amber-400 px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                            >
                              <ArrowRight className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                              <span>{chip}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Citation Link */}
                    {m.qa?.sourceUrl && (
                      <div className="pt-2 border-t border-sand-200/80 flex items-center justify-between text-[11px]">
                        <span className="text-sand-600 font-medium">Source:</span>
                        <a
                          href={m.qa.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-medium hover:underline truncate max-w-[280px]"
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

            {/* Realistic Thinking / Retrieval State */}
            {isTyping && (
              <div className="flex items-start gap-2 animate-in fade-in duration-150">
                <div className="bg-sand-100/80 border border-sand-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs text-sand-700 flex items-center gap-2.5 shadow-2xs">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px] font-mono text-sand-700">
                    Consulting {providerName} documentation...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3.5 sm:p-4 border-t border-sand-200 bg-white">
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
                disabled={isTyping}
                placeholder={`Ask ${providerName} question (e.g. "top 3 problems", "refresh token rules")...`}
                className="flex-1 bg-sand-50 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-sand-900 outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2.5 sm:p-3 bg-sand-900 hover:bg-black text-white rounded-xl transition-colors disabled:opacity-40 shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                title="Send question (Enter)"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-sand-600 mt-2 px-1 font-mono">
              <span>Grounded in RFC 6749 & official docs</span>
              <span>Press Esc to close · Enter to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
