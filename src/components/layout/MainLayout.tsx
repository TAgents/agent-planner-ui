import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppShell, type AppShellNavId } from '../v1';
import { useUI } from '../../contexts/UIContext';

/**
 * Resolves the active rail item from the current pathname. Anything under
 * /app/plans, /app/portfolio, /app/strategy maps to 'plans' since they
 * surface a portfolio-style view. /app/goals/* → goals, /app/knowledge/* → know,
 * everything else (including /app, /app/dashboard, /app/settings) → mission.
 */
function activeNavId(pathname: string): AppShellNavId {
  if (pathname.startsWith('/app/goals')) return 'goals';
  if (pathname.startsWith('/app/plans') ||
      pathname.startsWith('/app/portfolio') ||
      pathname.startsWith('/app/strategy')) {
    return 'plans';
  }
  if (pathname.startsWith('/app/knowledge')) return 'know';
  return 'mission';
}

function userMonogram(name?: string | null): string {
  if (!name) return 'ap';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'ap';
}

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleDarkMode } = useUI();
  const active = activeNavId(location.pathname);

  // Read user from auth_session for the rail footer monogram.
  const userName = (() => {
    try {
      const raw = localStorage.getItem('auth_session');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.user?.name || parsed?.name || null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="h-screen overflow-hidden bg-bg text-text">
      <AppShell
        active={active}
        footer={
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={toggleDarkMode}
              title={state.darkMode ? 'Switch to light' : 'Switch to dark'}
              aria-label={state.darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-[12px] text-text-sec transition-colors hover:bg-surface-hi"
            >
              {state.darkMode ? '☀' : '☾'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/settings/profile')}
              title={userName || 'Profile'}
              aria-label="Profile"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-hi font-mono text-[10px] uppercase text-text-sec transition-colors hover:bg-surface"
            >
              {userMonogram(userName)}
            </button>
          </div>
        }
      >
        <main className="h-full overflow-y-auto">
          <Outlet />
        </main>
      </AppShell>
    </div>
  );
};

export default MainLayout;
