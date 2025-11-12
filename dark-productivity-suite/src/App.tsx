import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/common/Navigation';
import LoadingTransition from './components/common/LoadingTransition';
import AudioController from './components/common/AudioController';
import TerminalTarot from './components/terminal-tarot/TerminalTarot';
import GhostWriter from './components/ghost-writer/GhostWriter';
import NecronomiconNotes from './components/necronomicon-notes/NecronomiconNotes';
import { GraveyardDashboard } from './components/graveyard-dashboard/GraveyardDashboard';
import './App.css';

const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Trigger loading transition on route change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Brief delay to trigger the transition

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <LoadingTransition isLoading={isLoading} minDisplayTime={500} />
        <Routes>
          <Route path="/" element={<Navigate to="/terminal-tarot" replace />} />
          <Route path="/terminal-tarot" element={<TerminalTarot />} />
          <Route path="/ghost-writer" element={<GhostWriter />} />
          <Route path="/necronomicon-notes" element={<NecronomiconNotes />} />
          <Route path="/graveyard-dashboard" element={<GraveyardDashboard />} />
        </Routes>
      </main>
      <AudioController />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
