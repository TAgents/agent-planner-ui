import React from 'react';
import { TopBar } from '../v1';
import KnowledgeTabs from './KnowledgeTabs';

export type HeaderStat = {
  /** Numeric value to render. */
  value: number | string;
  /** Suffix label rendered after the number ("facts", "gaps"). */
  label: string;
  /** Optional accent color so contradictions/gaps render as amber/red. */
  tone?: 'text' | 'amber' | 'red';
};

export type KnowledgeHeaderProps = {
  /** Inline stat list rendered as the page title (`473 facts · 11 gaps · 2 contradictions`). */
  stats: HeaderStat[];
  /** Search-box value (controlled). */
  search: string;
  /** Search-box onChange handler. */
  onSearchChange: (value: string) => void;
  /** Search box placeholder. */
  searchPlaceholder?: string;
};

/**
 * Shared knowledge-surface header. Renders through the canonical {@link TopBar}
 * so the four knowledge lenses (Overview / Coverage / Timeline / Graph) read as
 * one product surface and match every other full-page view: the `◇ Knowledge`
 * kicker, the inline stat headline as the title, the search box as the action
 * cluster, and the lens tabs as the full-width controls row. Mount it at the top
 * of each lens's flex-col page shell.
 */
const KnowledgeHeader: React.FC<KnowledgeHeaderProps> = ({
  stats,
  search,
  onSearchChange,
  searchPlaceholder = 'Search knowledge…',
}) => {
  const title = (
    <>
      {stats.map((s, i) => (
        <span key={s.label}>
          {i > 0 && <span className="mx-2 text-text-muted">·</span>}
          <span
            className={
              s.tone === 'amber'
                ? 'text-amber'
                : s.tone === 'red'
                  ? 'text-red'
                  : 'text-text'
            }
          >
            {s.value} {s.label}
          </span>
        </span>
      ))}
    </>
  );

  const searchBox = (
    <label className="flex w-full max-w-[280px] items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-[12px] text-text-sec transition-colors focus-within:border-amber">
      <span aria-hidden className="font-mono text-[10px] text-text-muted">
        ◇
      </span>
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full bg-transparent outline-none placeholder:text-text-muted"
      />
    </label>
  );

  return (
    <TopBar
      kicker="◇ Knowledge · what the agents know"
      title={title}
      actions={searchBox}
      controls={<KnowledgeTabs />}
    />
  );
};

export default KnowledgeHeader;
