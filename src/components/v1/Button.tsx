import React from 'react';
import { cn } from './cn';

/**
 * Button hierarchy (use exactly these — never a raw <button> in app pages):
 *   • PrimaryButton — the ONE main action per view (amber, filled).
 *   • GhostButton   — secondary actions (bordered, transparent).
 *   • IconButton    — icon-only utility actions (toggle, close ✕, inline edit). Pass aria-label.
 *   • LinkButton    — low-emphasis inline text actions ("Edit", "Change", "Clear").
 * All accept native button props (onClick, disabled, type, aria-*).
 */

type CommonProps = {
  /** Use the larger hero size (Onboarding step 1, landing CTA). */
  large?: boolean;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

type BareProps = {
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

/** Amber-on-bg primary button — the canonical CTA across connect flows. */
export function PrimaryButton({ large, className, children, ...rest }: CommonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'inline-flex items-center justify-center bg-amber text-bg font-semibold',
        'transition-opacity duration-150 hover:opacity-90 disabled:opacity-50',
        large
          ? 'rounded-[10px] px-[22px] py-3 text-[13.5px]'
          : 'rounded-lg px-4 py-2 text-xs',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Icon-only utility button — square, subtle border, neutral. For toolbar/inline
 *  actions (theme toggle, close ✕, edit pencil). Always pass an `aria-label`. */
export function IconButton({ className, children, ...rest }: BareProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-transparent',
        'text-[13px] text-text-sec transition-colors duration-150',
        'hover:bg-surface-hi hover:text-text disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Low-emphasis text button — no chrome. For inline secondary actions
 *  ("Edit", "Change", "Clear"). */
export function LinkButton({ large, className, children, ...rest }: CommonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'inline-flex items-center gap-1 bg-transparent font-medium text-text-sec',
        'transition-colors duration-150 hover:text-text disabled:opacity-50',
        large ? 'text-[13px]' : 'text-xs',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Bordered transparent button — used as the "secondary" CTA across connect flows. */
export function GhostButton({ large, className, children, ...rest }: CommonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border border-border bg-transparent',
        'text-text font-medium transition-colors duration-150',
        'hover:bg-surface-hi hover:border-border-hi disabled:opacity-50',
        large ? 'px-[22px] py-3 text-[13.5px]' : 'px-[14px] py-2 text-xs',
        className,
      )}
    >
      {children}
    </button>
  );
}
