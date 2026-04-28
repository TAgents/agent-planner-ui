import React from 'react';
import { Kicker } from '../v1';

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
  /** Search box placeholder. Defaults to "Search beliefs…" to match the design copy. */
  searchPlaceholder?: string;
};

/**
 * Shared knowledge-surface header. Mounts above `<KnowledgeTabs />` on
 * each lens (Coverage / Timeline / Graph) so the three views read as a
 * single product surface — single kicker, big stat headline, search
 * input — instead of three separate pages.
 */
const KnowledgeHeader: React.FC<KnowledgeHeaderProps> = ({
  stats,
  search,
  onSearchChange,
  searchPlaceholder = 'Search beliefs…',
}) => {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <Kicker className="mb-2">◇ Knowledge · what the agents know</Kicker>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
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
        </h1>
      </div>
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
    </header>
  );
};

export default KnowledgeHeader;
