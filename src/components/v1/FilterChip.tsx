import React from 'react';
import { cn } from './cn';

export type FilterChipProps = {
  /** Whether this chip is the active selection. */
  active?: boolean;
  /** Optional trailing count (rendered mono, muted). */
  count?: number;
  /** Optional leading glyph (e.g. a goal-type marker). */
  glyph?: React.ReactNode;
  /** `red` tints an inactive chip (e.g. a contradictions filter with hits). */
  tone?: 'default' | 'red';
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
};

/**
 * Canonical filter-row chip. One look across every labeled filter row
 * (Goals status/type, Plans status, Knowledge timeline) so the surfaces read
 * as one product instead of three chip dialects. Neutral bordered pill, active
 * = raised surface; matches the v1 token system and the Blueprints CategoryChip.
 * (For unlabeled toggle groups use the segmented control on Workspaces/Blueprints.)
 */
export function FilterChip({
  active = false,
  count,
  glyph,
  tone = 'default',
  onClick,
  className,
  children,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] transition-colors',
        active
          ? 'border-border-hi bg-surface-hi font-medium text-text'
          : tone === 'red'
            ? 'border-border bg-surface text-red hover:bg-surface-hi'
            : 'border-border bg-surface text-text-sec hover:bg-surface-hi',
        className,
      )}
    >
      {glyph}
      {children}
      {count != null && <span className="font-mono text-[9px] text-text-muted">{count}</span>}
    </button>
  );
}

export default FilterChip;
