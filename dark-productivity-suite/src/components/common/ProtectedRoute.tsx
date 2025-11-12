import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingTransition from './LoadingTransition';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

/**
 * ProtectedRoute component that guards authenticated-only pages
 * Redirects unauthenticated users to login page
 * Handles session expiration by redirecting to login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingTransition isLoading={true} minDisplayTime={500} />;
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
