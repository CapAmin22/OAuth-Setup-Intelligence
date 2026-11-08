import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { WelcomeModal } from './components/WelcomeModal';
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

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('oauth_welcome_dismissed');
      if (!dismissed) {
        setTourOpen(true);
      }
    } catch {
      // Ignore in private browsing mode
    }
  }, []);

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

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#faf9f5] text-[#1f1e1d]">
        <Header onOpenTour={() => setTourOpen(true)} />
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
                    setTourOpen(true); // Smooth onboarding handoff into the value-centric tour!
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
