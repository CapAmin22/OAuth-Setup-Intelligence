import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { fetchProviders } from '../lib/api';
import { Provider } from '../types';
import { ProviderLogo } from './ProviderLogo';

interface SearchBarProps {
  autoFocus?: boolean;
  size?: 'default' | 'large';
}

export const SearchBar: React.FC<SearchBarProps> = ({ autoFocus = false, size = 'default' }) => {
  const [query, setQuery] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filtered, setFiltered] = useState<Provider[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProviders().then(setProviders);
  }, []);

  // Global '/' and 'Cmd+K' shortcut to focus search
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      setIsOpen(false);
      return;
    }
    const q = query.toLowerCase().trim();
    const matches = providers.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.aliases.some((a) => a.toLowerCase().includes(q))
    );
    setFiltered(matches);
    setIsOpen(true);
  }, [query, providers]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (slug: string) => {
    navigate(`/guides/${slug}/v/1`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (filtered.length > 0) {
        handleSelect(filtered[0].slug);
      } else if (query.trim()) {
        navigate(`/generate?query=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const isLarge = size === 'large';

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <div
        className={`relative flex items-center bg-white border border-sand-300 rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-amber-600/30 focus-within:border-amber-600 ${
          isLarge ? 'h-14 px-4' : 'h-11 px-3'
        }`}
      >
        <Search className={`text-sand-400 mr-2.5 shrink-0 ${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          autoFocus={autoFocus}
          placeholder="Search OAuth provider (e.g. Google, Slack, GitHub, Linear)..."
          className="w-full bg-transparent border-none outline-none text-sand-900 placeholder:text-sand-400 text-sm sm:text-base font-normal"
        />

        {!query && (
          <div className="hidden sm:flex items-center gap-1 shrink-0 ml-2">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-sand-500 bg-sand-100 border border-sand-200 rounded">
              /
            </kbd>
          </div>
        )}

        {query && (
          <button
            onClick={() => {
              if (filtered.length > 0) handleSelect(filtered[0].slug);
              else navigate(`/generate?query=${encodeURIComponent(query.trim())}`);
            }}
            className="ml-2 px-3 py-1 bg-sand-900 hover:bg-black text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1 shrink-0"
          >
            <span>{filtered.length > 0 ? 'Open' : 'Generate'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-sand-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-sand-100 animate-in fade-in duration-100">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <button
                key={p.slug}
                onClick={() => handleSelect(p.slug)}
                className="w-full px-4 py-3 text-left hover:bg-sand-50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sand-50 border border-sand-200 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform">
                    <ProviderLogo slug={p.slug} name={p.displayName} logoUrl={p.logoUrl} size="sm" />
                  </div>
                  <div>
                    <span className="font-semibold text-sand-900 text-sm block group-hover:text-amber-800 transition-colors">
                      {p.displayName}
                    </span>
                    <span className="text-xs text-sand-500 font-mono">
                      {p.canonicalDomain || `${p.slug}.com`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.isCurated && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Curated
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-sand-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-sand-600 mb-2">No curated guide for "{query}" yet.</p>
              <button
                onClick={() => navigate(`/generate?query=${encodeURIComponent(query.trim())}`)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
              >
                Research & Generate with AI
                <ArrowRight className="w-3 h-3 text-amber-600" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
