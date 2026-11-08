import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  User,
  LogOut,
  Linkedin,
  Building2,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { getCurrentDeveloper, logoutDeveloper, promptDeveloperAuth, DeveloperProfile } from '../lib/auth';

interface HeaderProps {
  onOpenTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTour }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [workerOnline, setWorkerOnline] = useState<boolean>(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(() => getCurrentDeveloper());

  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setDeveloper(getCurrentDeveloper());
    };

    window.addEventListener('oauth_auth_state_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('oauth_auth_state_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setToolsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logoutDeveloper();
    setDeveloper(null);
    setProfileOpen(false);
    navigate('/');
  };

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
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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
                    to="/admin/reviewer?tab=developers"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-sand-800 hover:text-sand-900 hover:bg-sand-50 transition-colors"
                  >
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Developer Leads & Outreach</span>
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
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-sand-800 hover:text-sand-900 hover:bg-sand-50 transition-colors text-left cursor-pointer"
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

          {/* Developer Authentication / Profile Area */}
          {developer ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-sand-300/80 bg-white hover:bg-sand-50 text-xs font-semibold text-sand-900 transition-all shadow-2xs cursor-pointer"
                title="View Verified Developer Profile"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {developer.name[0]?.toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate hidden sm:inline">
                  {developer.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-sand-500 font-mono hidden md:inline">
                  ({developer.company.slice(0, 10)})
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-sand-200 rounded-2xl shadow-xl z-50 p-4 divide-y divide-sand-100 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-inner">
                          {developer.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-sand-900 text-sm leading-tight">
                            {developer.name}
                          </h4>
                          <span className="text-[11px] text-sand-500 block truncate max-w-[170px]">
                            {developer.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-sand-700 bg-sand-50 p-2.5 rounded-xl border border-sand-200/80 font-sans">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-sand-500 shrink-0" />
                        <span className="font-medium truncate">{developer.company}</span>
                        <span className="text-[10px] text-sand-400">· {developer.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] shrink-0" />
                        <a
                          href={developer.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-800 hover:underline truncate text-[11px]"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] px-1">
                      <span className="text-sand-500">Status:</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        100% Verified Developer
                      </span>
                    </div>
                  </div>

                  <div className="pt-2.5 space-y-1">
                    {onOpenTour && (
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          onOpenTour();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-sand-700 hover:text-sand-900 hover:bg-sand-50 rounded-lg transition-colors text-left cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Replay Developer Tour</span>
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => promptDeveloperAuth()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sand-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Developer Sign In</span>
            </button>
          )}

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
