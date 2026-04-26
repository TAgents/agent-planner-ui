import React from 'react';
import { cn } from './cn';

export type StepState = 'done' | 'active' | 'pending';

export type StepCardProps = {
  /** Step number shown inside the rail circle (replaced by ✓ when done). */
  n: number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  state?: StepState;
  /** Children render only when state is 'active' or 'done'; pending steps collapse. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Onboarding wizard step row. Number rail on the left + title/content
 * on the right. Active = amber number, done = emerald checkmark, pending
 * = muted with content collapsed. Connector line drops between consecutive
 * cards via the per-card `min-h` rail segment — no separate connector needed.
 *
 * See design_handoff_agentplanner/designs/connect-shared.jsx.
 */
export function StepCard({
  n,
  title,
  subtitle,
  state = 'pending',
  children,
  className,
}: StepCardProps) {
  const isDone = state === 'done';
  const isActive = state === 'active';
  const isPending = state === 'pending';

  // Single-source-of-truth Tailwind class triplet keyed off state.
  const railClasses = isDone
    ? 'bg-emerald-soft text-emerald border-emerald'
    : isActive
      ? 'bg-amber-soft text-amber border-amber'
      : 'bg-surface-hi text-text-muted border-text-muted';

  return (
    <div className={cn('flex gap-4', isPending && 'opacity-55', className)}>
      <div className="flex flex-shrink-0 flex-col items-center">
        <div
          className={cn(
            'flex h-[30px] w-[30px] items-center justify-center rounded-full border-[1.5px]',
            'font-mono text-xs font-semibold',
            railClasses,
          )}
        >
          {isDone ? '✓' : n}
        </div>
        <div className="mt-[6px] min-h-3 w-[1.5px] flex-1 bg-border" />
      </div>

      <div className="flex-1 pb-7">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-base font-semibold tracking-[-0.02em] text-text">
            {title}
          </span>
          {isDone && (
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-emerald">
              ✓ Done
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 mb-[14px] text-[12.5px] leading-[1.55] text-text-sec">{subtitle}</p>
        )}
        {!isPending && children && (
          <div className={cn(subtitle ? 'mt-0' : 'mt-3')}>{children}</div>
        )}
      </div>
    </div>
  );
}
