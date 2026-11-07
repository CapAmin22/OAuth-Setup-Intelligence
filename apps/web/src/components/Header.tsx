import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Compass, Sparkles, BookOpen, Key, AlertCircle, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTour }) => {
  const location = useLocation();
  const [workerOnline, setWorkerOnline] = useState<boolean>(true);

  return (
    <header className="border-b border-sand-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-amber-600/10 text-amber-700 flex items-center justify-center font-bold text-lg border border-amber-600/20 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <span className="font-semibold text-sand-900 tracking-tight text-base sm:text-lg block leading-none">
              OAuth Setup Intelligence
            </span>
            <span className="text-[11px] text-sand-700 font-medium tracking-wide uppercase">
              Developer Runbooks & AI Research
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/library"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/library'
                ? 'bg-sand-100 text-sand-900'
                : 'text-sand-700 hover:text-sand-900 hover:bg-sand-50'
            }`}
          >
            Library
          </Link>
          <Link
            to="/generate"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === '/generate'
                ? 'bg-amber-500/10 text-amber-800'
                : 'text-sand-700 hover:text-sand-900 hover:bg-sand-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Generate</span>
          </Link>
          <Link
            to="/states"
            className={`hidden md:inline-block px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/states'
                ? 'bg-sand-100 text-sand-900'
                : 'text-sand-700 hover:text-sand-900 hover:bg-sand-50'
            }`}
          >
            States
          </Link>
          <Link
            to="/api-reference"
            className={`hidden sm:inline-block px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/api-reference'
                ? 'bg-sand-100 text-sand-900'
                : 'text-sand-700 hover:text-sand-900 hover:bg-sand-50'
            }`}
          >
            API
          </Link>

          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-sand-700 hover:text-sand-900 hover:bg-sand-100 transition-colors"
              title="Open onboarding tour"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          )}

          <div className="h-4 w-px bg-sand-200 mx-1 sm:mx-2" />

          {/* Worker Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              workerOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title={workerOnline ? 'Research worker active' : 'Worker offline (curated library available)'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                workerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="hidden md:inline">Worker:</span>
            <span>{workerOnline ? 'Online' : 'Standby'}</span>
          </div>
        </nav>
      </div>
    </header>
  );
};

