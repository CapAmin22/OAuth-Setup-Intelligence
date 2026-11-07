import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { fetchProviders } from '../lib/api';
import { Provider } from '../types';

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

  useEffect(() => {
    fetchProviders().then(setProviders);
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
        <Search className={`text-sand-700 mr-2.5 ${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          autoFocus={autoFocus}
          placeholder="Search OAuth provider (e.g. Google, Slack, GitHub, Linear)..."
          className="w-full bg-transparent border-none outline-none text-sand-900 placeholder:text-sand-700 text-sm sm:text-base font-normal"
        />
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
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-sand-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-sand-100">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <button
                key={p.slug}
                onClick={() => handleSelect(p.slug)}
                className="w-full px-4 py-3 text-left hover:bg-sand-50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-sand-100 border border-sand-200 flex items-center justify-center overflow-hidden">
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={p.displayName} className="w-4 h-4 object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-sand-700">{p.displayName[0]}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-sand-900 text-sm block group-hover:text-amber-700 transition-colors">
                      {p.displayName}
                    </span>
                    <span className="text-xs text-sand-700 font-mono">
                      {p.canonicalDomain || `${p.slug}.com`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.isCurated && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Curated
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-sand-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-sand-700 mb-2">No curated guide for "{query}" yet.</p>
              <button
                onClick={() => navigate(`/generate?query=${encodeURIComponent(query.trim())}`)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
              >
                Research & Generate with AI
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

