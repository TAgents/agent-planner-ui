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

/*
 * The aside is a fixed warm-obsidian sheet in BOTH themes — it is the
 * "blueprint" side of the split, so it uses warm print-white / gold literals
 * rather than theme tokens. The form side stays token-driven and follows
 * light/dark.
 */
const OBSIDIAN = {
  bg: '#0e0c0a',
  text: '#ede9e2',
  sec: '#a8a092',
  muted: '#928a7c',
  gold: '#d4a24e',
  emerald: '#5ba89a',
};

const ASIDE_GRID: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, rgba(212,162,78,0.12) 1px, transparent 1px),' +
    'linear-gradient(to bottom, rgba(212,162,78,0.12) 1px, transparent 1px),' +
    'linear-gradient(to right, rgba(212,162,78,0.05) 1px, transparent 1px),' +
    'linear-gradient(to bottom, rgba(212,162,78,0.05) 1px, transparent 1px)',
  backgroundSize: '80px 80px, 80px 80px, 16px 16px, 16px 16px',
};

const DEFAULT_MANIFESTO = (
  <div className="flex h-full max-w-[46ch] flex-col">
    <div className="my-auto py-12">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: OBSIDIAN.muted }}>
        Goals, plans, and shared memory — for AI agents
      </span>
      <h2
        className="mt-5 font-display text-[44px] font-semibold leading-[1.0] tracking-[-0.005em] sm:text-[50px]"
        style={{ color: OBSIDIAN.text }}
      >
        Your agents need
        <br />
        a <span style={{ color: OBSIDIAN.gold }}>shared brain</span>.
      </h2>
      <p className="mt-5 max-w-[44ch] text-[13.5px] leading-[1.65]" style={{ color: OBSIDIAN.sec }}>
        A planning surface where humans and agents track goals, branch plans,
        and accumulate shared knowledge — so nobody loses the thread when the
        context window runs out.
      </p>

      {/* compressed blueprint → workspace motif */}
      <svg viewBox="0 0 340 70" className="mt-9 block w-full max-w-[340px]" aria-hidden>
        <rect x="2" y="14" width="88" height="42" rx="4" fill="none" stroke={OBSIDIAN.gold} strokeOpacity="0.75" strokeWidth="1.25" strokeDasharray="5 4" />
        <text x="14" y="39" fill={OBSIDIAN.sec} fontFamily="Spline Sans Mono, monospace" fontSize="8" letterSpacing="1.5">
          BLUEPRINT
        </text>
        <line x1="100" y1="35" x2="150" y2="35" stroke={OBSIDIAN.gold} strokeWidth="1.25" strokeDasharray="5 4" />
        <path d="M 150 31 L 158 35 L 150 39 Z" fill={OBSIDIAN.gold} />
        <text x="106" y="26" fill={OBSIDIAN.gold} fontFamily="Spline Sans Mono, monospace" fontSize="7" letterSpacing="1.5">
          FORK
        </text>
        <rect x="164" y="8" width="172" height="54" rx="4" fill="rgba(212,162,78,0.06)" stroke={OBSIDIAN.gold} strokeWidth="1.5" />
        <text x="176" y="27" fill={OBSIDIAN.text} fontFamily="Spline Sans Mono, monospace" fontSize="8" letterSpacing="1.5">
          WORKSPACE
        </text>
        <circle cx="316" cy="23" r="3" fill={OBSIDIAN.gold} className="bp-pulse" />
        <circle cx="180" cy="44" r="3" fill={OBSIDIAN.emerald} className="bp-pulse" />
        <text x="190" y="47" fill={OBSIDIAN.sec} fontFamily="Spline Sans Mono, monospace" fontSize="7" letterSpacing="1">
          AGENTS ON DUTY
        </text>
      </svg>
    </div>

    {/* Trust strip kept minimal — only claims we can stand behind today. */}
    <ul
      className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em]"
      style={{ color: OBSIDIAN.muted }}
    >
      <li>Open core</li>
      <li aria-hidden>·</li>
      <li>MCP-native</li>
      <li aria-hidden>·</li>
      <li>Self-host or hosted</li>
    </ul>
  </div>
);

/**
 * Two-column auth shell — cyanotype manifesto sheet on the left, form on the
 * right. Reused for Login, Register, ForgotPassword, ResetPassword.
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
        <aside
          className="relative hidden flex-col px-10 py-10 lg:flex"
          style={{ backgroundColor: OBSIDIAN.bg }}
        >
          <div aria-hidden className="absolute inset-0" style={ASIDE_GRID} />
          <div className="relative flex flex-1 flex-col">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5" style={{ color: OBSIDIAN.text }}>
                <svg width="26" height="26" viewBox="0 0 30 30" aria-hidden>
                  <rect x="4.5" y="4.5" width="21" height="21" rx="2" fill="rgba(212,162,78,0.1)" stroke={OBSIDIAN.gold} strokeWidth="1.5" />
                  <line x1="15" y1="0" x2="15" y2="9" stroke={OBSIDIAN.gold} strokeWidth="1.5" />
                  <line x1="15" y1="21" x2="15" y2="30" stroke={OBSIDIAN.gold} strokeWidth="1.5" />
                  <line x1="0" y1="15" x2="9" y2="15" stroke={OBSIDIAN.gold} strokeWidth="1.5" />
                  <line x1="21" y1="15" x2="30" y2="15" stroke={OBSIDIAN.gold} strokeWidth="1.5" />
                  <circle cx="15" cy="15" r="2.5" fill={OBSIDIAN.gold} />
                </svg>
                <span className="font-display text-[17px] font-semibold tracking-[0.01em]">AgentPlanner</span>
              </Link>
              <Link
                to="/"
                className="font-mono text-[10px] uppercase tracking-[0.18em] transition-opacity hover:opacity-80"
                style={{ color: OBSIDIAN.muted }}
              >
                ← Back to home
              </Link>
            </div>
            <div className="mt-6 flex flex-1 flex-col">
              {manifesto || DEFAULT_MANIFESTO}
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[400px]">
            {kicker && (
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                {kicker}
              </span>
            )}
            <h1 className="font-display text-[32px] font-semibold tracking-[-0.005em] text-text">
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
        'flex w-full items-center gap-3 rounded-[3px] border border-border bg-surface px-4 py-[10px]',
        'text-[13px] font-medium text-text transition-colors hover:bg-surface-hi',
        className,
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-[2px] border border-border bg-bg font-mono text-[11px] font-semibold text-text">
        {glyph}
      </span>
      <span className="flex-1 text-left">{label}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">→</span>
    </button>
  );
}
