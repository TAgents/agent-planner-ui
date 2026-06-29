import React from 'react';
import { cn } from './cn';

type CommonProps = {
  /** Use the larger hero size (Onboarding step 1, landing CTA). */
  large?: boolean;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

/** Amber-on-bg primary button — the canonical CTA across connect flows. */
export function PrimaryButton({ large, className, children, ...rest }: CommonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'inline-flex items-center justify-center bg-amber text-bg font-semibold shadow-sm',
        'transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.98]',
        'disabled:opacity-50 disabled:active:scale-100',
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

/** Bordered transparent button — used as the "secondary" CTA across connect flows. */
export function GhostButton({ large, className, children, ...rest }: CommonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border border-border bg-transparent',
        'text-text font-medium transition-[color,background-color,border-color,transform] duration-150',
        'hover:bg-surface-hi hover:border-border-hi active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100',
        large ? 'px-[22px] py-3 text-[13.5px]' : 'px-[14px] py-2 text-xs',
        className,
      )}
    >
      {children}
    </button>
  );
}
