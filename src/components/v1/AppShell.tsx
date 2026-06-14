import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Target,
  ListTree,
  Brain,
  LayoutTemplate,
  Compass,
  type LucideIcon,
} from 'lucide-react';
import { cn } from './cn';

export type AppShellNavId =
  | 'mission'
  | 'strategy'
  | 'workspaces'
  | 'blueprints'
  | 'goals'
  | 'plans'
  | 'know';

export type AppShellNavItem = {
  id: AppShellNavId;
  label: string;
  /** One-line plain-language explanation, shown beneath the label / on hover. */
  hint: string;
  to: string;
  icon: LucideIcon;
};

// The four core elements (workspaces → goals → plans → knowledge) lead, with
// Mission as the home overview. Templates + analysis are demoted to a second
// group so the primary surface stays focused.
const PRIMARY_NAV: AppShellNavItem[] = [
  { id: 'mission', label: 'Mission', hint: "Today's overview", to: '/app', icon: LayoutDashboard },
  { id: 'workspaces', label: 'Workspaces', hint: 'Folders of work', to: '/app/workspaces', icon: Boxes },
  { id: 'goals', label: 'Goals', hint: "What you're aiming for", to: '/app/goals', icon: Target },
  { id: 'plans', label: 'Plans', hint: 'How the work gets done', to: '/app/plans', icon: ListTree },
  { id: 'know', label: 'Knowledge', hint: 'What agents have learned', to: '/app/knowledge', icon: Brain },
];

const SECONDARY_NAV: AppShellNavItem[] = [
  { id: 'blueprints', label: 'Blueprints', hint: 'Reusable templates', to: '/app/blueprints', icon: LayoutTemplate },
  { id: 'strategy', label: 'Strategy', hint: 'Where to focus next', to: '/app/strategy', icon: Compass },
];

export type AppShellProps = {
  active: AppShellNavId;
  primary?: AppShellNavItem[];
  secondary?: AppShellNavItem[];
  /** Footer slot, typically theme toggle + user controls. */
  footer?: React.ReactNode;
  logoText?: string;
  logoTo?: string;
  children: React.ReactNode;
};

function NavRow({ item, active }: { item: AppShellNavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      title={item.hint}
      aria-label={`${item.label} — ${item.hint}`}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-[10px] px-2.5 py-2 transition-colors duration-150',
        active
          ? 'bg-surface-hi text-text'
          : 'text-text-sec hover:bg-surface-hi/60 hover:text-text',
      )}
    >
      {active && (
        <span className="absolute -left-[9px] top-2.5 bottom-2.5 w-[3px] rounded-full bg-amber" />
      )}
      <Icon
        size={18}
        strokeWidth={2}
        className={cn(
          'flex-shrink-0 transition-colors',
          active ? 'text-amber' : 'text-text-muted group-hover:text-text-sec',
        )}
      />
      <span className="min-w-0 flex-1 truncate font-body text-[13.5px] font-medium leading-none">
        {item.label}
      </span>
    </Link>
  );
}

/**
 * Left navigation sidebar (~220px). Brand + two grouped sections of
 * icon-and-label nav rows, with an amber accent bar on the active row.
 */
export function AppShell({
  active,
  primary = PRIMARY_NAV,
  secondary = SECONDARY_NAV,
  footer,
  logoText = 'ap',
  logoTo = '/app',
  children,
}: AppShellProps) {
  return (
    <div className="flex h-full">
      <aside className="flex w-[220px] flex-shrink-0 flex-col border-r border-border bg-surface px-3 py-4">
        <Link
          to={logoTo}
          aria-label="AgentPlanner home"
          className="mb-5 flex items-center gap-2.5 px-1"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber font-display text-[16px] font-bold leading-none tracking-[-0.04em] text-bg">
            {logoText}
          </span>
          <span className="font-display text-[15px] font-semibold tracking-[-0.02em] text-text">
            AgentPlanner
          </span>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {primary.map((it) => (
            <NavRow key={it.id} item={it} active={it.id === active} />
          ))}
        </nav>

        <div className="my-3 flex items-center gap-2 px-2.5">
          <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-text-muted">
            More
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <nav className="flex flex-col gap-0.5">
          {secondary.map((it) => (
            <NavRow key={it.id} item={it} active={it.id === active} />
          ))}
        </nav>

        <div className="flex-1" />
        {footer}
      </aside>
      <main className="relative min-w-0 flex-1">{children}</main>
    </div>
  );
}
