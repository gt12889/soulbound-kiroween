import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { KeyboardProvider } from './contexts/KeyboardContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotesProvider } from './contexts/NotesContext';
import { TasksProvider } from './contexts/TasksContext';
import Navigation from './components/common/Navigation';
// import LoadingTransition from './components/common/LoadingTransition';
import AudioController from './components/common/AudioController';
import { KeyboardShortcutsPanel } from './components/common/KeyboardShortcutsPanel';
import QuickCapture from './components/common/QuickCapture';
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
import { useSettingsInitialization, useSettingsPersistence } from './hooks/useSettingsInitialization';
import { DEFAULT_SHORTCUTS } from './utils/keyboardShortcuts';
import './App.css';

const AppContent: React.FC = () => {
  // const [isLoading, setIsLoading] = useState(false);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/password-reset';

  // Initialize settings on app startup (Requirements: 10.3, 17.3)
  // Run in background without blocking the UI
  useSettingsInitialization();
  
  // Ensure settings persistence across sessions (Requirements: 10.3, 17.3)
  useSettingsPersistence();

  // Trigger loading transition on route change
  // DISABLED: This was causing black screen issues
  // useEffect(() => {
  //   setIsLoading(true);
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 100); // Brief delay to trigger the transition

  //   return () => clearTimeout(timer);
  // }, [location.pathname]);

  // Register global keyboard shortcuts for navigation
  // Requirements: 9.1, 9.2, 9.3
  const navigationShortcuts = DEFAULT_SHORTCUTS.filter(s => s.category === 'navigation');
  
  useKeyboardShortcuts(navigationShortcuts, {
    'navigate-terminal-tarot': () => navigate('/terminal-tarot'),
    'navigate-ghost-writer': () => navigate('/ghost-writer'),
    'navigate-necronomicon-notes': () => navigate('/necronomicon-notes'),
    'navigate-graveyard-dashboard': () => navigate('/graveyard-dashboard'),
  });

  // Register quick capture keyboard shortcut (Ctrl+K)
  // Requirement: 13.1
  const quickCaptureShortcut = DEFAULT_SHORTCUTS.find(s => s.action === 'quick-capture');
  
  useKeyboardShortcuts(
    quickCaptureShortcut ? [quickCaptureShortcut] : [],
    {
      'quick-capture': () => setShowQuickCapture(true),
    }
  );

  const showNavigation = !isLandingPage && !isAuthPage;
  const contentClass = isLandingPage || isAuthPage ? 'landing-content' : 'main-content';

  // Settings load in the background - don't block the UI

  return (
    <div className="app">
      {showNavigation && <Navigation />}
      <main className={contentClass}>
        {/* <LoadingTransition isLoading={isLoading} minDisplayTime={500} /> */}
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
      <QuickCapture isOpen={showQuickCapture} onClose={() => setShowQuickCapture(false)} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>
            <KeyboardProvider>
              <NotesProvider>
                <TasksProvider>
                  <AppContent />
                </TasksProvider>
              </NotesProvider>
            </KeyboardProvider>
          </ThemeProvider>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
