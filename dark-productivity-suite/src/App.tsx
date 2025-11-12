import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { KeyboardProvider } from './contexts/KeyboardContext';
import Navigation from './components/common/Navigation';
import LoadingTransition from './components/common/LoadingTransition';
import AudioController from './components/common/AudioController';
import { KeyboardShortcutsPanel } from './components/common/KeyboardShortcutsPanel';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import PasswordReset from './components/auth/PasswordReset';
import TerminalTarot from './components/terminal-tarot/TerminalTarot';
import GhostWriter from './components/ghost-writer/GhostWriter';
import NecronomiconNotes from './components/necronomicon-notes/NecronomiconNotes';
import { GraveyardDashboard } from './components/graveyard-dashboard/GraveyardDashboard';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { DEFAULT_SHORTCUTS } from './utils/keyboardShortcuts';
import './App.css';

const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/password-reset';

  // Trigger loading transition on route change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Brief delay to trigger the transition

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Register global keyboard shortcuts for navigation
  // Requirements: 9.1, 9.2, 9.3
  const navigationShortcuts = DEFAULT_SHORTCUTS.filter(s => s.category === 'navigation');
  
  useKeyboardShortcuts(navigationShortcuts, {
    'navigate-terminal-tarot': () => navigate('/terminal-tarot'),
    'navigate-ghost-writer': () => navigate('/ghost-writer'),
    'navigate-necronomicon-notes': () => navigate('/necronomicon-notes'),
    'navigate-graveyard-dashboard': () => navigate('/graveyard-dashboard'),
  });

  const showNavigation = !isLandingPage && !isAuthPage;
  const contentClass = isLandingPage || isAuthPage ? 'landing-content' : 'main-content';

  return (
    <div className="app">
      {showNavigation && <Navigation />}
      <main className={contentClass}>
        <LoadingTransition isLoading={isLoading} minDisplayTime={500} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route 
            path="/terminal-tarot" 
            element={
              <ProtectedRoute>
                <TerminalTarot />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ghost-writer" 
            element={
              <ProtectedRoute>
                <GhostWriter />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/necronomicon-notes" 
            element={
              <ProtectedRoute>
                <NecronomiconNotes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/graveyard-dashboard" 
            element={
              <ProtectedRoute>
                <GraveyardDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {showNavigation && <AudioController />}
      <KeyboardShortcutsPanel />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <KeyboardProvider>
          <AppContent />
        </KeyboardProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
