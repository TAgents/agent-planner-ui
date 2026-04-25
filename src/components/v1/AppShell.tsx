import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from './cn';

export type AppShellNavId = 'mission' | 'goals' | 'plans' | 'know';

export type AppShellNavItem = {
  id: AppShellNavId;
  label: string;
  glyph: string;
  to: string;
};

const DEFAULT_NAV: AppShellNavItem[] = [
  { id: 'mission', label: 'Mission', glyph: 'M', to: '/app' },
  { id: 'goals', label: 'Goals', glyph: 'G', to: '/app/goals' },
  { id: 'plans', label: 'Plans', glyph: 'P', to: '/app/plans' },
  { id: 'know', label: 'Knowledge', glyph: 'K', to: '/app/knowledge' },
];

export type AppShellProps = {
  active: AppShellNavId;
  /** Override the default nav set (e.g. for tests or alternate layouts). */
  items?: AppShellNavItem[];
  /** Footer slot, typically a user avatar / monogram. */
  footer?: React.ReactNode;
  /** Brand monogram in the top tile. */
  logoText?: string;
  /** Click handler for the brand tile (defaults to navigation home). */
  logoTo?: string;
  children: React.ReactNode;
};

/**
 * 56px-wide left rail with brand tile + 4 monogram nav tiles. Active tile
 * gets an amber 2px accent bar and `surface-hi` background. See
 * design_handoff_agentplanner/03-component-inventory.md.
 */
export function AppShell({
  active,
  items = DEFAULT_NAV,
  footer,
  logoText = 'ap',
  logoTo = '/app',
  children,
}: AppShellProps) {
  return (
    <div className="flex h-full">
      <aside className="flex w-14 flex-shrink-0 flex-col items-center gap-1 border-r border-border bg-surface py-[14px]">
        <Link
          to={logoTo}
          aria-label="AgentPlanner home"
          className="mb-[14px] flex h-8 w-8 items-center justify-center rounded-lg bg-amber text-bg font-display text-[17px] font-bold leading-none tracking-[-0.04em]"
        >
          {logoText}
        </Link>
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <Link
              key={it.id}
              to={it.to}
              title={it.label}
              aria-label={it.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-[9px]',
                'font-mono text-[11px] font-semibold transition-colors duration-150',
                isActive
                  ? 'bg-surface-hi text-text'
                  : 'text-text-muted hover:bg-surface-hi/50 hover:text-text-sec',
              )}
            >
              {isActive && (
                <span className="absolute -left-[10px] top-2 bottom-2 w-[2px] rounded-[2px] bg-amber" />
              )}
              {it.glyph}
            </Link>
          );
        })}
        <div className="flex-1" />
        {footer ?? (
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-hi font-mono text-[10px] text-text-sec">
            ms
          </div>
        )}
      </aside>
      <main className="relative min-w-0 flex-1">{children}</main>
    </div>
  );
}
