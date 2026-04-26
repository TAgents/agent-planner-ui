import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from './cn';

export type AuthSplitLayoutProps = {
  /** Left-rail manifesto / brand content. */
  manifesto?: React.ReactNode;
  /** Right-side form content (the actual login/register/etc form). */
  children: React.ReactNode;
  /** Top-of-form kicker. */
  kicker?: React.ReactNode;
  /** Form heading. */
  title: React.ReactNode;
  /** Optional subline below the title. */
  subtitle?: React.ReactNode;
  /** Bottom-of-form alternate CTA (e.g. "New here? Create an account"). */
  altCta?: React.ReactNode;
  className?: string;
};

const DEFAULT_MANIFESTO = (
  <div className="max-w-[40ch]">
    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
      ◆ AgentPlanner
    </span>
    <h2 className="mt-3 font-display text-[26px] font-bold tracking-[-0.035em] text-text">
      Agents drive. <br /> You steer.
    </h2>
    <p className="mt-4 text-[13.5px] leading-[1.6] text-text-sec">
      A workspace where AI agents check goals, draft plans, gather knowledge,
      and execute — while you set direction and review the decisions that
      matter. Read-only by default; written-back by intent.
    </p>
    <ul className="mt-6 flex flex-col gap-2 text-[12.5px] text-text-muted">
      <li className="flex items-center gap-2">
        <span className="text-amber">◐</span> Goals + plans + knowledge in one graph
      </li>
      <li className="flex items-center gap-2">
        <span className="text-emerald">✓</span> MCP-native — your agent reads it directly
      </li>
      <li className="flex items-center gap-2">
        <span className="text-violet">↳</span> Open core — your data stays yours
      </li>
    </ul>
  </div>
);

/**
 * Two-column auth shell — manifesto on the left, form on the right.
 * Reused for Login, Register, ResetPassword. See
 * design_handoff_agentplanner/03-component-inventory.md → Auth.
 */
export function AuthSplitLayout({
  manifesto,
  children,
  kicker,
  title,
  subtitle,
  altCta,
  className,
}: AuthSplitLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-bg text-text', className)}>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <aside className="hidden border-r border-border bg-surface px-10 py-12 lg:block">
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted hover:text-text"
          >
            ← Back to home
          </Link>
          <div className="mt-16 flex h-[calc(100%-4rem)] items-center">
            {manifesto || DEFAULT_MANIFESTO}
          </div>
        </aside>

        <main className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[400px]">
            {kicker && (
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                {kicker}
              </span>
            )}
            <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-text">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-[13px] leading-[1.55] text-text-sec">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
            {altCta && (
              <div className="mt-8 border-t border-border pt-6 text-[12.5px] text-text-sec">
                {altCta}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export type SSOButtonProps = {
  provider: 'google' | 'github' | 'microsoft' | string;
  glyph: string;
  label: string;
  onClick?: () => void;
  className?: string;
};

/** Full-width SSO button with monogram tile. */
export function SSOButton({ glyph, label, onClick, className }: SSOButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-[10px]',
        'text-[13px] font-medium text-text transition-colors hover:bg-surface-hi',
        className,
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded border border-border bg-bg font-display text-[11px] font-bold text-text">
        {glyph}
      </span>
      <span className="flex-1 text-left">{label}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">→</span>
    </button>
  );
}
