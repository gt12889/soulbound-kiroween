import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { KeyboardProvider } from './contexts/KeyboardContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotesProvider } from './contexts/NotesContext';
import { TasksProvider } from './contexts/TasksContext';
import { ToastProvider } from './contexts/ToastContext';
import Navigation from './components/common/Navigation';
import AudioController from './components/common/AudioController';
import { KeyboardShortcutsPanel } from './components/common/KeyboardShortcutsPanel';
import QuickCapture from './components/common/QuickCapture';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingFallback from './components/common/LoadingFallback';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastContainer } from './components/common/ToastNotification';
// Keep auth pages as regular imports for faster initial load
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import PasswordReset from './components/auth/PasswordReset';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useUndoRedoShortcuts } from './hooks/useUndoRedoShortcuts';
import { useSettingsInitialization, useSettingsPersistence } from './hooks/useSettingsInitialization';
import { DEFAULT_SHORTCUTS } from './utils/keyboardShortcuts';
import './App.css';

// Lazy load main application routes for code splitting
// Requirements: 1.4, 1.5
const TerminalTarot = lazy(() => import('./components/terminal-tarot/TerminalTarot'));
const GhostWriter = lazy(() => import('./components/ghost-writer/GhostWriter'));
const NecronomiconNotes = lazy(() => import('./components/necronomicon-notes/NecronomiconNotes'));
const GraveyardDashboard = lazy(() => import('./components/graveyard-dashboard/GraveyardDashboard').then(module => ({ default: module.GraveyardDashboard })));
const ForestHub = lazy(() => import('./components/forest-hub/ForestHub'));

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

  // Register undo/redo keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  // Requirements: 8.2, 8.3, 8.4
  useUndoRedoShortcuts();

  const isForestHub = location.pathname === '/forest-hub';
  const showNavigation = !isLandingPage && !isAuthPage && !isForestHub;
  const contentClass = isLandingPage || isAuthPage || isForestHub ? 'landing-content' : 'main-content';

  // Settings load in the background - don't block the UI

  return (
    <div className="app">
      {showNavigation && <Navigation />}
      <main className={contentClass}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route 
              path="/" 
              element={
                <ErrorBoundary>
                  <LandingPage />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/login" 
              element={
                <ErrorBoundary>
                  <LoginPage />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ErrorBoundary>
                  <RegisterPage />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/password-reset" 
              element={
                <ErrorBoundary>
                  <PasswordReset />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/forest-hub" 
              element={
                <ErrorBoundary>
                  <ForestHub />
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/terminal-tarot" 
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <TerminalTarot />
                  </ProtectedRoute>
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/ghost-writer" 
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <GhostWriter />
                  </ProtectedRoute>
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/necronomicon-notes" 
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <NecronomiconNotes />
                  </ProtectedRoute>
                </ErrorBoundary>
              } 
            />
            <Route 
              path="/graveyard-dashboard" 
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <GraveyardDashboard />
                  </ProtectedRoute>
                </ErrorBoundary>
              } 
            />
          </Routes>
        </Suspense>
      </main>
      {showNavigation && <AudioController />}
      <KeyboardShortcutsPanel />
      <QuickCapture isOpen={showQuickCapture} onClose={() => setShowQuickCapture(false)} />
      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>
            <ToastProvider>
              <KeyboardProvider>
                <NotesProvider>
                  <TasksProvider>
                    <AppContent />
                  </TasksProvider>
                </NotesProvider>
              </KeyboardProvider>
            </ToastProvider>
          </ThemeProvider>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
