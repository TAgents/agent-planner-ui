import React from 'react';
import { cn } from './cn';

export type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  /** Highlights the border (amber) to signal a non-default filter is applied. */
  active?: boolean;
  title?: string;
  className?: string;
  /** <option> elements. */
  children: React.ReactNode;
};

/**
 * Canonical filter-row dropdown. One look for every toolbar `<select>` on the
 * list pages (Plans, Goals) so the filter rows read as one product instead of
 * mixing sentence-case `text-xs` with `font-mono` uppercase. Pairs with
 * {@link FilterChip}; active=true tints the border amber like the chips do.
 */
export function FilterSelect({
  value,
  onChange,
  active = false,
  title,
  className,
  children,
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={title}
      className={cn(
        'min-w-0 rounded-md border bg-surface px-3 py-[6px] text-xs focus:outline-none',
        active ? 'border-amber text-text' : 'border-border text-text-sec',
        className,
      )}
    >
      {children}
    </select>
  );
}

export default FilterSelect;
