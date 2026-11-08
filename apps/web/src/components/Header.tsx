import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Key,
  HelpCircle,
  ChevronDown,
  Layers,
  FileCode,
  ShieldCheck,
  MessageSquare,
  Github,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  onOpenTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTour }) => {
  const location = useLocation();
  const [workerOnline, setWorkerOnline] = useState<boolean>(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setToolsOpen(false);
  }, [location.pathname]);

  return (
    <header className="border-b border-sand-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-amber-600/10 text-amber-700 flex items-center justify-center font-bold text-lg border border-amber-600/20 group-hover:scale-105 transition-transform shadow-xs">
            ⚡
          </div>
          <div>
            <span className="font-extrabold text-sand-900 tracking-tight text-base sm:text-lg block leading-none">
              OAuth Setup Intelligence
            </span>
            <span className="text-[10px] sm:text-[11px] text-sand-500 font-medium tracking-wider uppercase">
              Production Runbooks & AI Research
            </span>
          </div>
        </Link>

        {/* Primary Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/library"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              location.pathname === '/library'
                ? 'bg-sand-100 text-sand-900'
                : 'text-sand-700 hover:text-sand-900 hover:bg-sand-50'
            }`}
          >
            Library
          </Link>

          <Link
            to="/generate"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              location.pathname === '/generate'
                ? 'bg-amber-500/15 text-amber-900'
                : 'text-sand-700 hover:text-sand-900 hover:bg-sand-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Generate</span>
          </Link>

          {/* Secondary Utilities & Developer Tools Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                toolsOpen || ['/api-reference', '/states', '/feedback', '/admin/reviewer'].includes(location.pathname)
                  ? 'bg-sand-100 text-sand-900'
                  : 'text-sand-700 hover:text-sand-900 hover:bg-sand-50'
              }`}
              title="More developer tools and system controls"
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180 text-sand-900' : 'text-sand-400'}`} />
            </button>

            {toolsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-sand-200 rounded-xl shadow-xl z-50 py-1.5 divide-y divide-sand-100 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="py-1">
                  <Link
                    to="/api-reference"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-sand-800 hover:text-sand-900 hover:bg-sand-50 transition-colors"
                  >
                    <FileCode className="w-4 h-4 text-sand-500" />
                    <span>API Reference</span>
                  </Link>
                  <Link
                    to="/states"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-sand-800 hover:text-sand-900 hover:bg-sand-50 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-sand-500" />
                    <span>Edge States Gallery</span>
                  </Link>
                  <Link
                    to="/admin/reviewer"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-sand-800 hover:text-sand-900 hover:bg-sand-50 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Reviewer & Drift Queue</span>
                  </Link>
                  <Link
                    to="/feedback"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-sand-800 hover:text-sand-900 hover:bg-sand-50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <span>Report Doc Drift</span>
                  </Link>
                </div>

                {onOpenTour && (
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setToolsOpen(false);
                        onOpenTour();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-sand-800 hover:text-sand-900 hover:bg-sand-50 transition-colors text-left"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>Take Onboarding Tour</span>
                    </button>
                  </div>
                )}

                {/* Subdued Status Indicator */}
                <div className="px-3.5 py-2 text-[11px] text-sand-500 flex items-center justify-between bg-sand-50/50">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className={`w-2 h-2 rounded-full ${workerOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span>Research Worker</span>
                  </span>
                  <span className="font-mono text-sand-700 font-semibold">
                    {workerOnline ? 'Online' : 'Standby'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-sand-200 mx-1" />

          {/* GitHub Source Link */}
          <a
            href="https://github.com/CapAmin22/OAuth-Setup-Intelligence"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-sand-600 hover:text-sand-900 hover:bg-sand-100 transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </nav>
      </div>
    </header>
  );
};
