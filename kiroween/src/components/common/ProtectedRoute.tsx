import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingTransition from './LoadingTransition';
import { logger } from '../../utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Feature flag for bypassing authentication in development
 * Set VITE_BYPASS_AUTH=true in .env to bypass auth checks (development only)
 * WARNING: This should NEVER be enabled in production
 */
const BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === 'true';

/**
 * ProtectedRoute component that guards authenticated-only pages
 * Redirects unauthenticated users to login page
 * Handles session expiration by redirecting to login
 * 
 * Authentication can be bypassed in development by setting VITE_BYPASS_AUTH=true
 * This is useful for local development when Firebase is not configured
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [showContent, setShowContent] = React.useState(false);

  // Development bypass: Skip auth check if flag is enabled
  // This should only be used when Firebase is not configured locally
  if (BYPASS_AUTH) {
    logger.warn(
      '[ProtectedRoute] Authentication bypass is enabled. ' +
      'This should only be used for local development without Firebase.'
    );
    return children;
  }

  // Add timeout to prevent infinite loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 3000); // Max 3 seconds loading

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking authentication (but not forever)
  if (loading && !showContent) {
    return <LoadingTransition isLoading={true} minDisplayTime={500} message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
