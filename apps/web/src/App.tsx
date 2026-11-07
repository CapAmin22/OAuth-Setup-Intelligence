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

export const App: React.FC = () => {
  const [tourOpen, setTourOpen] = useState(false);

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

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#faf9f5] text-[#1f1e1d]">
        <Header onOpenTour={() => setTourOpen(true)} />
        <WelcomeModal isOpen={tourOpen} onClose={() => setTourOpen(false)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/guides/:slug/v/:version" element={<Guide />} />
            <Route path="/guides/:slug" element={<Guide />} />
            <Route path="/generate" element={<Intake />} />
            <Route path="/jobs/:id" element={<Job />} />
            <Route path="/states" element={<States />} />
            <Route path="/admin/reviewer" element={<Reviewer />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/api-reference" element={<ApiRef />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

