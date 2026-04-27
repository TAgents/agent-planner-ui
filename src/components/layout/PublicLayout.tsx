import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * PublicLayout — minimal chrome for unauthenticated and read-only public
 * surfaces (Landing, Explore, /public/plans/:id). Authenticated users see
 * the same shell here so brand context stays consistent; their in-app
 * navigation lives behind /app via MainLayout.
 */
const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber font-display text-[14px] font-bold text-bg"
            aria-hidden
          >
            ap
          </span>
          <span className="font-display text-[14px] font-semibold tracking-[-0.01em] text-text">
            AgentPlanner
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-[12px]">
          <Link to="/explore" className="text-text-sec hover:text-text">
            Explore
          </Link>
          {isAuthenticated ? (
            <Link
              to="/app"
              className="rounded-md bg-text px-3 py-1.5 font-medium text-bg transition-opacity hover:opacity-90"
            >
              Open app
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-text-sec hover:text-text">
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-amber px-3 py-1.5 font-medium text-bg transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
