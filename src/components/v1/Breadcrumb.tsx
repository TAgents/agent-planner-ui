import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from './cn';

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export type BreadcrumbProps = {
  items: Array<BreadcrumbItem | string>;
  className?: string;
};

/**
 * Inline breadcrumb: `Workspaces › Growth Engine › Launch Plan`. Last
 * item is the current page (bold, non-link). Intermediate items can be
 * `{label, to}` for navigation, or plain strings for non-linked steps.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const normalized = items.map((it) => (typeof it === 'string' ? { label: it } : it));
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 font-body text-[12px]', className)}
    >
      {normalized.map((it, i) => {
        const isLast = i === normalized.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-text-muted">›</span>}
            {it.to && !isLast ? (
              <Link to={it.to} className="text-text-sec transition-colors hover:text-text">
                {it.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-text' : 'text-text-sec'}>
                {it.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
