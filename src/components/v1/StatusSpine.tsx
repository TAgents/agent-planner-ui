import React from 'react';
import { cn } from './cn';
import type { PillColor } from './Pill';

const ACCENT_CLASSES: Record<PillColor, string> = {
  amber: 'bg-amber',
  emerald: 'bg-emerald',
  red: 'bg-red',
  violet: 'bg-violet',
  slate: 'bg-slate',
};

export type StatusSpineProps = {
  /** Semantic accent color for the 3px left bar. */
  accent: PillColor;
  /** Card content. The wrapper supplies the surface, border, radius, and overflow clip. */
  children: React.ReactNode;
  className?: string;
};

/**
 * "Status spine" row: a horizontal row card with a 3px colored left bar.
 * Used for plan rows in the new Plans index (see screen-plans-list.jsx).
 * The accent color encodes plan health at a glance.
 */
export function StatusSpine({ accent, children, className }: StatusSpineProps) {
  return (
    <div
      className={cn(
        'relative flex items-stretch overflow-hidden rounded-[10px] border border-border bg-surface',
        className,
      )}
    >
      <div className={cn('w-[3px] flex-shrink-0', ACCENT_CLASSES[accent])} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
