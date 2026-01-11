import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navigation: React.FC = () => {
  const { isAuthenticated, userName, userEmail, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path: string) => {
    const base = "text-xs sm:text-sm font-medium transition-colors px-2 py-1 sm:px-0";
    return isActive(path)
      ? `${base} text-blue-600`
      : `${base} text-gray-700 hover:text-gray-900`;
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <img
              src="/logo.png"
              alt="Agent Planner"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain"
            />
            <span className="hidden xs:inline sm:inline">Agent Planner</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500 text-white rounded uppercase ml-2">
              Alpha
            </span>
          </Link>

          {/* Navigation Links and Auth */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {isAuthenticated ? (
              <>
                {/* Main Navigation Links - New Plan, My Plans, Settings, Explore */}
                <Link to="/app/plans/ai-create" className={navLinkClass('/app/plans/ai-create')}>
                  New Plan
                </Link>

                <Link to="/app/plans" className={navLinkClass('/app/plans')}>
                  My Plans
                </Link>

                <Link to="/app/settings" className={navLinkClass('/app/settings')}>
                  Settings
                </Link>

                <Link to="/explore" className={navLinkClass('/explore')}>
                  Explore
                </Link>

                {/* User Info (links to profile) and Sign Out */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    to="/app/profile"
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 max-w-[80px] sm:max-w-none truncate">
                      {userName || userEmail || 'User'}
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/explore" className={navLinkClass('/explore')}>
                  Explore
                </Link>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
