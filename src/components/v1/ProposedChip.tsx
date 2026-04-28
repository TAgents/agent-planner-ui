import React from 'react';
import { cn } from './cn';

export type ProposedChipProps = {
  children?: React.ReactNode;
  className?: string;
};

/**
 * Marker for design elements that don't yet exist in the real backend.
 * Renders a dashed amber pill — keeps reconciliation between design and
 * data model honest. See design_handoff_agentplanner/04-data-model-mapping.md.
 */
export function ProposedChip({ children = 'Proposed', className }: ProposedChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[4px] border border-dashed border-amber px-[6px] py-[1.5px]',
        'font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-amber',
        'bg-transparent',
        className,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-amber opacity-70" />
      {children}
    </span>
  );
}
