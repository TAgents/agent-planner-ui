import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * A component that protects routes by checking if the user is authenticated
 */
const ProtectedRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const session = localStorage.getItem('auth_session');
      setIsAuthenticated(!!session);
    };

    // Check immediately
    checkAuth();

    // Listen for storage changes (in case of login/logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_session') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for a custom event we can trigger after login
    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [location]); // Re-check when location changes

  // Show loading state while we're checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner border-4 border-blue-500 border-t-transparent h-12 w-12 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, show the protected content
  return <Outlet />;
};

export default ProtectedRoute;
