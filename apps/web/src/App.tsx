import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { WelcomeModal } from './components/WelcomeModal';
import { DeveloperAuthModal } from './components/DeveloperAuthModal';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Guide } from './pages/Guide';
import { Intake } from './pages/Intake';
import { Job } from './pages/Job';
import { Reviewer } from './pages/Reviewer';
import { Feedback } from './pages/Feedback';
import { ApiRef } from './pages/ApiRef';
import { States } from './pages/States';
import { Login } from './pages/Login';
import { getCurrentDeveloper, DeveloperProfile } from './lib/auth';

export const App: React.FC = () => {
  const [tourOpen, setTourOpen] = useState(false);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(() => getCurrentDeveloper());
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(() => !getCurrentDeveloper());

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('oauth_welcome_dismissed');
      // If user is already authenticated and hasn't seen the tour, show it
      if (developer && !dismissed) {
        setTourOpen(true);
      }
    } catch {
      // Ignore in private browsing mode
    }
  }, [developer]);

  useEffect(() => {
    const handleAuthChange = () => {
      const current = getCurrentDeveloper();
      setDeveloper(current);
      if (!current) {
        setAuthModalOpen(true);
      }
    };

    const handleOpenModal = () => {
      setAuthModalOpen(true);
    };

    window.addEventListener('oauth_auth_state_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('oauth_open_auth_modal', handleOpenModal);

    return () => {
      window.removeEventListener('oauth_auth_state_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('oauth_open_auth_modal', handleOpenModal);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#faf9f5] text-[#1f1e1d]">
        {/* Sticky Unauthenticated Preview Banner */}
        {!developer && (
          <div className="bg-sand-900 text-white text-xs py-2 px-4 shadow-xs sticky top-0 z-60 border-b border-sand-800">
            <div className="max-w-6xl mx-auto w-full flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span>
                  You are in <strong>Read-Only Preview</strong>. Verify your profile with LinkedIn to unlock all 10+ production runbooks, Copilot ⌘J, and ready-to-run snippets.
                </span>
              </span>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-sand-950 font-bold px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
              >
                Unlock Developer Workspace →
              </button>
            </div>
          </div>
        )}

        <Header onOpenTour={() => setTourOpen(true)} />

        {/* Global Developer Access Modal (First-time & Action Gate) */}
        <DeveloperAuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(prof) => {
            setDeveloper(prof);
            setAuthModalOpen(false);
            setTourOpen(true); // Smooth handoff into 4-step Product Tour!
          }}
        />

        {/* 4-Step Value-Centric Product Tour */}
        <WelcomeModal
          isOpen={tourOpen}
          onClose={() => setTourOpen(false)}
          developerName={developer?.name}
        />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/guides/:slug/v/:version" element={<Guide />} />
            <Route path="/guides/:slug" element={<Guide />} />
            <Route path="/guide/:slug/v/:version" element={<Guide />} />
            <Route path="/guide/:slug" element={<Guide />} />
            <Route path="/generate" element={<Intake />} />
            <Route path="/jobs/:id" element={<Job />} />
            <Route path="/states" element={<States />} />
            <Route path="/admin/reviewer" element={<Reviewer />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/api-reference" element={<ApiRef />} />
            <Route
              path="/login"
              element={
                <Login
                  onLoginSuccess={(prof) => {
                    setDeveloper(prof);
                    setAuthModalOpen(false);
                    setTourOpen(true);
                  }}
                />
              }
            />
            <Route
              path="/join"
              element={
                <Login
                  onLoginSuccess={(prof) => {
                    setDeveloper(prof);
                    setAuthModalOpen(false);
                    setTourOpen(true);
                  }}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};
