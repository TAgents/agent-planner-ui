import React from 'react';
import { cn } from './cn';

export type PillColor = 'amber' | 'emerald' | 'red' | 'violet' | 'slate';

const COLOR_CLASSES: Record<PillColor, string> = {
  amber: 'bg-amber-soft text-amber',
  emerald: 'bg-emerald-soft text-emerald',
  red: 'bg-red-soft text-red',
  violet: 'bg-violet-soft text-violet',
  slate: 'bg-surface-hi text-text-sec',
};

export type PillProps = {
  color?: PillColor;
  className?: string;
  children: React.ReactNode;
};

export function Pill({ color = 'slate', className, children }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[5px] rounded-full px-[7px] py-[2px]',
        'font-mono text-[9.5px] font-semibold uppercase tracking-[0.04em]',
        COLOR_CLASSES[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
