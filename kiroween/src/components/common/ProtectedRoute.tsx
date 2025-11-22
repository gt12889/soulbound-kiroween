import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import LoadingTransition from './LoadingTransition';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

/**
 * ProtectedRoute component that guards authenticated-only pages
 * Redirects unauthenticated users to login page
 * Handles session expiration by redirecting to login
 * 
 * TEMPORARY: Auth bypass for development
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // const { isAuthenticated, loading } = useAuth();
  // const location = useLocation();

  // TEMPORARY: Skip auth check for development
  // TODO: Re-enable authentication once Firebase is properly configured
  
  // For now, just render the children without auth check
  return children;

  /* Original auth logic - commented out for development
  const [showContent, setShowContent] = React.useState(false);

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
  */
};

export default ProtectedRoute;
