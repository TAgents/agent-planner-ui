import React from 'react';
import { cn } from './cn';

export type ProgressColor = 'amber' | 'emerald' | 'red' | 'violet' | 'slate' | 'text-muted';

export type ProgressProps = {
  /** 0–100. Clamped. */
  value: number;
  /** Bar height in px. Defaults to 4. */
  height?: number;
  color?: ProgressColor;
  className?: string;
};

const COLOR_CLASS: Record<ProgressColor, string> = {
  amber: 'bg-amber',
  emerald: 'bg-emerald',
  red: 'bg-red',
  violet: 'bg-violet',
  slate: 'bg-slate',
  'text-muted': 'bg-text-muted',
};

/**
 * Single-color thin progress bar. For the segmented (done/doing/blocked)
 * variant on the Goals index, see GoalsList.tsx's SegmentedProgress.
 */
export function Progress({ value, height = 4, color = 'amber', className }: ProgressProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-surface-hi', className)}
      style={{ height }}
    >
      <div className={cn('h-full rounded-full', COLOR_CLASS[color])} style={{ width: `${v}%` }} />
    </div>
  );
}
