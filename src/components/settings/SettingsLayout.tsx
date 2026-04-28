import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  User,
  Building2,
  Plug,
  Key,
  Bell,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { useTokens } from '../../hooks/useTokens';

interface Section {
  path: string;
  label: string;
  sub: string;
  icon: React.FC<{ className?: string }>;
  danger?: boolean;
}

function readActiveOrgName(): string {
  try {
    const session = JSON.parse(localStorage.getItem('auth_session') || '{}');
    const orgs: { id: string; name: string }[] = session.user?.organizations || [];
    const activeId = localStorage.getItem('active_org_id');
    return orgs.find((o) => o.id === activeId)?.name || 'Organization';
  } catch {
    return 'Organization';
  }
}

function readUser(): { name: string; role: string } {
  try {
    const session = JSON.parse(localStorage.getItem('auth_session') || '{}');
    const name = session?.user?.name || session?.name || 'You';
    const role = session?.user?.role || 'Member';
    return { name, role };
  } catch {
    return { name: 'You', role: 'Member' };
  }
}

function userMonogram(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'U';
}

/**
 * Backward-compat shim. Existing settings pages render <SettingsNav/> inline;
 * the real chrome now comes from <SettingsLayout/> below, so this is a no-op.
 */
export const SettingsNav: React.FC = () => null;

/**
 * Settings shell — vertical section rail on the left, page content (via
 * <Outlet/>) on the right. Mirrors the standalone-design "settings-light"
 * artboard: each rail item shows a label + sub-label, plus a top header card
 * with the active org and member identity.
 */
const SettingsLayout: React.FC = () => {
  const location = useLocation();
  const { tokens } = useTokens();
  const orgName = readActiveOrgName();
  const user = readUser();

  const sections: Section[] = [
    { path: '/app/settings/profile', label: 'Profile', sub: 'Personal info', icon: User },
    { path: '/app/settings/organization', label: 'Organization', sub: orgName, icon: Building2 },
    {
      path: '/app/settings/agents',
      label: 'Agents & integrations',
      sub: 'MCP · Slack · webhooks',
      icon: Plug,
    },
    {
      path: '/app/settings/tokens',
      label: 'API tokens',
      sub: `${tokens?.length ?? 0} active`,
      icon: Key,
    },
    {
      path: '/app/settings/notifications',
      label: 'Notifications',
      sub: 'Email · Slack',
      icon: Bell,
    },
    { path: '/app/settings/billing', label: 'Billing', sub: 'Plan & invoices', icon: CreditCard },
    { path: '/app/settings/danger', label: 'Danger zone', sub: 'Irreversible', icon: AlertTriangle, danger: true },
  ];

  // Legacy aliases keep old links working (organizations → organization, integrations → agents).
  const aliases: Record<string, string> = {
    '/app/settings/organizations': '/app/settings/organization',
    '/app/settings/integrations': '/app/settings/agents',
    '/app/settings/connections': '/app/settings/agents',
    '/app/settings': '/app/settings/profile',
  };
  const normalizedPath = aliases[location.pathname] || location.pathname;

  return (
    <div className="min-h-full bg-bg text-text">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-6 py-6">
        {/* Page header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-[12px] uppercase tracking-[0.18em] text-text-sec">
              ◇ Settings
            </span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-text-sec">
            <Link
              to="/app/settings/organization"
              className="hover:text-text"
              title="Active organization"
            >
              {orgName}
            </Link>
            <span className="text-border">·</span>
            <Link to="/app/settings/profile" className="flex items-center gap-2 hover:text-text">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface-hi font-mono text-[9px] uppercase text-text-sec">
                {userMonogram(user.name)}
              </span>
              <span>
                {user.name} · <span className="capitalize">{user.role}</span>
              </span>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-[260px_1fr] gap-6">
          {/* Section rail */}
          <nav aria-label="Settings sections" className="flex flex-col gap-1">
            {sections.map((s) => {
              const isActive =
                normalizedPath === s.path || normalizedPath.startsWith(s.path + '/');
              const Icon = s.icon;
              return (
                <NavLink
                  key={s.path}
                  to={s.path}
                  className={[
                    'group flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                    isActive
                      ? 'border-border bg-surface'
                      : 'border-transparent hover:border-border hover:bg-surface',
                    s.danger ? 'text-red' : '',
                  ].join(' ')}
                >
                  <Icon
                    className={[
                      'mt-0.5 h-3.5 w-3.5 flex-shrink-0',
                      isActive ? 'text-text' : 'text-text-sec',
                      s.danger ? 'text-red' : '',
                    ].join(' ')}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span
                      className={[
                        'text-[12px] font-medium leading-tight',
                        isActive ? 'text-text' : 'text-text',
                      ].join(' ')}
                    >
                      {s.label}
                    </span>
                    <span className="truncate text-[11px] text-text-sec">{s.sub}</span>
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Section content */}
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
