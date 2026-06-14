import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { AppShell, type AppShellNavId } from '../v1';
import { useUI } from '../../contexts/UIContext';

/**
 * Resolves the active rail item from the current pathname.
 * /app/strategy + /app/portfolio → strategy (where-to-spend-time view),
 * /app/plans → plans, /app/goals → goals, /app/knowledge → know,
 * everything else (including /app, /app/dashboard, /app/settings) → mission.
 */
function activeNavId(pathname: string): AppShellNavId {
  if (pathname.startsWith('/app/workspaces')) return 'workspaces';
  if (pathname.startsWith('/app/blueprints')) return 'blueprints';
  if (pathname.startsWith('/app/strategy') || pathname.startsWith('/app/portfolio')) {
    return 'strategy';
  }
  if (pathname.startsWith('/app/goals')) return 'goals';
  if (pathname.startsWith('/app/plans')) return 'plans';
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
          <div className="flex flex-col gap-0.5 border-t border-border pt-2">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={state.darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              className="group flex items-center gap-3 rounded-[10px] px-2.5 py-2 text-text-sec transition-colors hover:bg-surface-hi/60 hover:text-text"
            >
              {state.darkMode ? (
                <Sun size={18} strokeWidth={2} className="flex-shrink-0 text-text-muted group-hover:text-text-sec" />
              ) : (
                <Moon size={18} strokeWidth={2} className="flex-shrink-0 text-text-muted group-hover:text-text-sec" />
              )}
              <span className="font-body text-[13.5px] font-medium leading-none">
                {state.darkMode ? 'Light mode' : 'Dark mode'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/settings/profile')}
              aria-label="Profile and settings"
              className="group flex items-center gap-3 rounded-[10px] px-2.5 py-2 text-text-sec transition-colors hover:bg-surface-hi/60 hover:text-text"
            >
              <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border border-border-hi bg-surface-hi font-mono text-[8.5px] font-semibold uppercase leading-none text-text-sec group-hover:text-text">
                {userMonogram(userName)}
              </span>
              <span className="min-w-0 flex-1 truncate font-body text-[13.5px] font-medium leading-none">
                {userName || 'Profile'}
              </span>
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
