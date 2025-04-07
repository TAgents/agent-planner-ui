import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * A component that protects routes by checking if the user is authenticated
 */
const ProtectedRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check if there's a Supabase session in localStorage
    const session = localStorage.getItem('supabase_session');
    setIsAuthenticated(!!session);
  }, []);

  // Show loading state while we're checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner border-4 border-blue-500 border-t-transparent h-12 w-12 rounded-full"></div>
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
