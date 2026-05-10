import React from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { Kicker } from './Kicker';

export type TopBarProps = {
  title: string;
  subtitle?: React.ReactNode;
  /** Mono-uppercase kicker above the title. Can be a string or a node (e.g., chip). */
  kicker?: React.ReactNode;
  /** Breadcrumb items (string or `{label, to}`). Renders above the kicker. */
  breadcrumb?: Array<BreadcrumbItem | string>;
  /** Right-aligned action cluster (Btns, etc.). */
  actions?: React.ReactNode;
};

/**
 * In-page top bar: breadcrumb + kicker + display title + subtitle on the
 * left, action cluster on the right. Bordered bottom, snug to the page
 * edges. Used at the top of every full-page view (Workspaces, Blueprints,
 * Plan tree, etc.).
 */
export function TopBar({ title, subtitle, kicker, breadcrumb, actions }: TopBarProps) {
  return (
    <header className="flex items-start justify-between gap-6 border-b border-border bg-bg px-7 pt-5 pb-[18px]">
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="mb-1.5">
            <Breadcrumb items={breadcrumb} />
          </div>
        )}
        {kicker && (
          <div className="mb-1.5">
            {typeof kicker === 'string' ? <Kicker>{kicker}</Kicker> : kicker}
          </div>
        )}
        <h1 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.02em] text-text">
          {title}
        </h1>
        {subtitle && (
          <div className="mt-1 font-body text-[13px] text-text-sec">{subtitle}</div>
        )}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
