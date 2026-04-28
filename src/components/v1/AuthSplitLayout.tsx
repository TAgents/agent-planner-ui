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
  <div className="flex h-full max-w-[44ch] flex-col">
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex h-9 w-9 items-center justify-center rounded-md bg-amber font-display text-[15px] font-bold text-bg"
      >
        ◆
      </span>
      <span className="font-display text-[18px] font-bold tracking-[-0.02em] text-text">
        AgentPlanner
      </span>
    </div>

    <div className="my-auto py-12">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
        ◆ Plans, beliefs, and decisions — for AI agents
      </span>
      <h2 className="mt-5 font-display text-[36px] font-bold leading-[1.1] tracking-[-0.035em] text-text sm:text-[40px]">
        Your agents
        <br />
        <span className="font-serif italic text-amber">need a shared</span>
        <br />
        brain.
      </h2>
      <p className="mt-5 max-w-[42ch] text-[13.5px] leading-[1.6] text-text-sec">
        A planning surface where humans and agents track goals, branch plans,
        and accumulate beliefs together — so nobody loses the thread when the
        context window runs out.
      </p>

      <div className="mt-6 max-w-[42ch] rounded-md border border-border bg-bg/40 px-3 py-2.5">
        <div className="flex items-start gap-2.5 text-[12px] leading-[1.55]">
          <span
            aria-hidden
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet/20 font-mono text-[10.5px] font-semibold text-violet"
          >
            β
          </span>
          <p className="text-text-sec">
            <span className="font-mono text-[11px] text-text">researcher-β</span>{' '}
            picked up where{' '}
            <span className="font-mono text-[11px] text-text">planner-α</span>{' '}
            left off.{' '}
            <span className="font-semibold text-text">3 new beliefs</span>, 1
            contradiction flagged.
          </p>
        </div>
      </div>
    </div>

    <ul className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
      <li>SOC 2 Type II</li>
      <li aria-hidden>·</li>
      <li>EU residency</li>
      <li aria-hidden>·</li>
      <li>MCP-native</li>
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
        <aside className="hidden flex-col border-r border-border bg-surface px-10 py-10 lg:flex">
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted hover:text-text"
          >
            ← Back to home
          </Link>
          <div className="mt-6 flex flex-1 flex-col">
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
