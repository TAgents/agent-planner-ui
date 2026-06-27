import React from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { Kicker } from './Kicker';

export type TopBarProps = {
  /** Display title. A node so pages can pass a dynamic/stat headline
   *  (e.g. Mission's "15 active goals, 15 need a look" with colored spans). */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Mono-uppercase kicker above the title. Can be a string or a node (e.g., chip). */
  kicker?: React.ReactNode;
  /** Breadcrumb above the kicker — either items (string or `{label, to}`) or a
   *  custom breadcrumb node (e.g. a page-specific <GoalBreadcrumb/>). */
  breadcrumb?: Array<BreadcrumbItem | string> | React.ReactNode;
  /** Right-aligned action cluster (buttons, and/or a search box + dropdowns). */
  actions?: React.ReactNode;
  /** Optional full-width controls row below the title (filter chips, search,
   *  dropdowns). Renders above the bottom border so every page has ONE
   *  consistent place for its filter bar. Omit to keep the bar header-only. */
  controls?: React.ReactNode;
};

/**
 * In-page top bar: breadcrumb + kicker + display title + subtitle on the
 * left, action cluster on the right, and an optional full-width controls row
 * (filters/search) below. Bordered bottom, snug to the page edges. The single
 * page-header for every full-page view (Workspaces, Blueprints, Mission,
 * Goals, Plans, Knowledge, Settings).
 */
export function TopBar({ title, subtitle, kicker, breadcrumb, actions, controls }: TopBarProps) {
  return (
    <header className="border-b border-border bg-bg px-7 pt-5 pb-[18px]">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          {breadcrumb && (Array.isArray(breadcrumb) ? breadcrumb.length > 0 : true) && (
            <div className="mb-1.5">
              {Array.isArray(breadcrumb) ? <Breadcrumb items={breadcrumb} /> : breadcrumb}
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
      </div>
      {controls && <div className="mt-4 flex flex-wrap items-center gap-2">{controls}</div>}
    </header>
  );
}
