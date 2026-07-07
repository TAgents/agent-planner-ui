import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Target,
  Brain,
  LayoutTemplate,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from './cn';

export type AppShellNavId =
  | 'mission'
  | 'workspaces'
  | 'blueprints'
  | 'goals'
  | 'plans'
  | 'chat'
  | 'know';

export type AppShellNavItem = {
  id: AppShellNavId;
  label: string;
  /** One-line plain-language explanation, shown beneath the label / on hover. */
  hint: string;
  to: string;
  icon: LucideIcon;
};

// Workspaces → goals → knowledge lead, with Mission as the home overview.
// Goals lead the work surface; Plans are folded into each goal (the Goals page
// is a goal-grouped list, and you open a goal to reach its plans), so there's
// no standalone Plans nav item. Templates + analysis are demoted to a second
// group so the primary surface stays focused.
const PRIMARY_NAV: AppShellNavItem[] = [
  { id: 'mission', label: 'Mission', hint: "Today's overview", to: '/app/dashboard', icon: LayoutDashboard },
  { id: 'workspaces', label: 'Workspaces', hint: 'Folders of work', to: '/app/workspaces', icon: Boxes },
  { id: 'goals', label: 'Goals', hint: 'Outcomes & the plans that reach them', to: '/app/goals', icon: Target },
  { id: 'know', label: 'Knowledge', hint: 'What agents have learned', to: '/app/knowledge', icon: Brain },
];

const SECONDARY_NAV: AppShellNavItem[] = [
  { id: 'blueprints', label: 'Blueprints', hint: 'Reusable templates', to: '/app/blueprints', icon: LayoutTemplate },
];

export type AppShellProps = {
  active: AppShellNavId;
  primary?: AppShellNavItem[];
  secondary?: AppShellNavItem[];
  /** Footer slot, typically theme toggle + user controls. */
  footer: React.ReactNode;
  logoText?: string;
  logoTo?: string;
  children: React.ReactNode;
};

function NavRow({
  item,
  active,
  onNavigate,
}: {
  item: AppShellNavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      data-tour={`nav-${item.id}`}
      title={item.hint}
      aria-label={`${item.label} — ${item.hint}`}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-3 rounded-[10px] px-2.5 py-2 transition-colors duration-150',
        active
          ? 'bg-surface-hi text-text'
          : 'text-text-sec hover:bg-surface-hi/60 hover:text-text',
      )}
    >
      {active && (
        <span aria-hidden className="absolute -left-[9px] top-2.5 bottom-2.5 w-[3px] rounded-full bg-amber" />
      )}
      <Icon
        size={18}
        strokeWidth={2}
        aria-hidden
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

function Brand({
  logoText,
  logoTo,
  onNavigate,
  size = 'md',
}: {
  logoText: string;
  logoTo: string;
  onNavigate?: () => void;
  size?: 'sm' | 'md';
}) {
  const box = size === 'sm' ? 'h-7 w-7 text-[14px]' : 'h-8 w-8 text-[16px]';
  return (
    <Link
      to={logoTo}
      aria-label="AgentPlanner home"
      onClick={onNavigate}
      className="flex items-center gap-2.5"
    >
      <span
        aria-hidden
        className={cn(
          'flex items-center justify-center rounded-lg bg-amber font-display font-bold leading-none tracking-[-0.04em] text-bg',
          box,
        )}
      >
        {logoText}
      </span>
      <span className="font-display text-[15px] font-semibold tracking-[-0.02em] text-text">
        AgentPlanner
      </span>
    </Link>
  );
}

/**
 * App shell. On `lg+` a fixed ~220px left rail sits beside the content. Below
 * `lg`, the rail collapses to an off-canvas drawer toggled by a hamburger in a
 * slim mobile top bar — so the app stays usable from phone to desktop.
 */
export function AppShell({
  active,
  primary = PRIMARY_NAV,
  secondary = SECONDARY_NAV,
  footer,
  logoText = 'ap',
  // The mark opens the public landing (per the Flow v2 design) — in-app
  // navigation lives in the nav rail, so "home" here means the front door.
  logoTo = '/',
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex h-full">
      {/* Drawer scrim (mobile only) */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[220px] max-w-[82%] flex-shrink-0 flex-col border-r border-border bg-surface px-3 py-4',
          'transition-transform duration-200 ease-out lg:static lg:z-auto lg:max-w-none lg:translate-x-0 lg:shadow-none',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        )}
      >
        <div className="mb-5 flex items-center justify-between px-1">
          <Brand logoText={logoText} logoTo={logoTo} onNavigate={closeMobile} />
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation"
            className="-mr-1 rounded-md p-1 text-text-muted transition-colors hover:bg-surface-hi hover:text-text lg:hidden"
          >
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex flex-col gap-0.5">
          {primary.map((it) => (
            <NavRow key={it.id} item={it} active={it.id === active} onNavigate={closeMobile} />
          ))}
        </nav>

        <div className="my-3 flex items-center gap-2 px-2.5">
          <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-text-muted">
            More
          </span>
          <span aria-hidden className="h-px flex-1 bg-border" />
        </div>

        <nav aria-label="More" className="flex flex-col gap-0.5">
          {secondary.map((it) => (
            <NavRow key={it.id} item={it} active={it.id === active} onNavigate={closeMobile} />
          ))}
        </nav>

        <div className="flex-1" />
        {footer}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar — hamburger + brand. Hidden on lg where the rail shows. */}
        <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="app-sidebar"
            className="-ml-1 rounded-md p-1.5 text-text-sec transition-colors hover:bg-surface-hi hover:text-text"
          >
            <Menu size={20} strokeWidth={2} aria-hidden />
          </button>
          <Brand logoText={logoText} logoTo={logoTo} size="sm" />
        </header>

        <div className="relative min-w-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
