import React, { useState } from 'react';
import { cn } from './cn';

export type TestPanelStatCard = {
  label: string;
  value: string;
  sub?: string;
};

export type TestPanelError = {
  /** Plain-English title (e.g. "Connection took too long"). */
  title: string;
  /** Friendly explanation. */
  plain: string;
  /** Raw error message — hidden behind a `Show technical details` disclosure. */
  technical?: string;
};

export type TestPanelProvenance = {
  /** Endpoint label (e.g. "briefing()"). */
  endpoint?: string;
  /** Server- or client-measured round-trip in ms. */
  serverTimeMs?: number;
  /** From X-Client-Label header chain — e.g. "Claude Desktop". */
  clientLabel?: string | null;
};

export type TestPanelProps = {
  state: 'idle' | 'success' | 'error';
  /** Stat cards rendered in success state — usually exactly 4. */
  briefing?: TestPanelStatCard[];
  error?: TestPanelError;
  provenance?: TestPanelProvenance;
  onRetry?: () => void;
  onGetHelp?: () => void;
  className?: string;
};

/**
 * Inline result of pressing "Test connection". Three states:
 * - `idle`     — renders nothing
 * - `success`  — emerald panel with 4 stat cards + provenance footer
 * - `error`    — red panel with plain-English title, collapsible
 *                technical details, Retry / Get help actions
 *
 * See design_handoff_agentplanner/designs/connect-shared.jsx and
 * 03-component-inventory.md.
 */
export function TestPanel({
  state,
  briefing = [],
  error,
  provenance,
  onRetry,
  onGetHelp,
  className,
}: TestPanelProps) {
  const [showTech, setShowTech] = useState(false);

  if (state === 'idle') return null;

  if (state === 'success') {
    return (
      <div
        className={cn(
          'mt-[14px] rounded-[10px] border border-emerald/40 bg-emerald-soft px-4 py-[14px]',
          className,
        )}
      >
        <div className="mb-[10px] flex items-center gap-2">
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-emerald text-bg text-[11px] font-bold">
            ✓
          </span>
          <span className="font-display text-[14px] font-semibold tracking-[-0.01em] text-emerald">
            Connected — your agent can read your workspace
          </span>
        </div>
        <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-4">
          {briefing.map((row, i) => (
            <div
              key={`${row.label}-${i}`}
              className="rounded-[7px] border border-border bg-surface px-[10px] py-2"
            >
              <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-text-muted">
                {row.label}
              </span>
              <span className="mt-[2px] block font-display text-lg font-bold tracking-[-0.02em] text-text">
                {row.value}
              </span>
              {row.sub && (
                <span className="mt-[1px] block text-[10px] text-text-muted">{row.sub}</span>
              )}
            </div>
          ))}
        </div>
        {(provenance?.endpoint || provenance?.serverTimeMs != null || provenance?.clientLabel) && (
          <span className="mt-[10px] block font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">
            ↳ {provenance.endpoint || 'briefing()'}
            {provenance.serverTimeMs != null && ` · ${provenance.serverTimeMs}ms`}
            {provenance.clientLabel && ` · via ${provenance.clientLabel}`}
          </span>
        )}
      </div>
    );
  }

  // error
  const err = error || { title: 'Something went wrong', plain: 'Try again in a moment.' };
  return (
    <div
      className={cn(
        'mt-[14px] rounded-[10px] border border-red/40 bg-red-soft px-4 py-[14px]',
        className,
      )}
    >
      <div className="mb-[6px] flex items-center gap-2">
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-red text-bg text-[11px] font-bold">
          !
        </span>
        <span className="font-display text-[14px] font-semibold tracking-[-0.01em] text-red">
          {err.title}
        </span>
      </div>
      <p className="ml-[26px] mb-[10px] mt-1 text-xs leading-[1.55] text-text-sec">{err.plain}</p>
      {err.technical && (
        <div className="ml-[26px] text-[11px]">
          <button
            type="button"
            onClick={() => setShowTech((s) => !s)}
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted"
          >
            {showTech ? 'Hide technical details' : 'Show technical details'}
          </button>
          {showTech && (
            <div className="mt-2 rounded-md border border-border bg-bg px-[10px] py-2 font-mono text-[10.5px] leading-[1.6] text-text-sec">
              {err.technical}
            </div>
          )}
        </div>
      )}
      <div className="ml-[26px] mt-3 flex gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-red/40 bg-transparent px-3 py-[6px] text-[11px] font-medium text-red transition-colors hover:bg-red-soft"
          >
            Retry
          </button>
        )}
        {onGetHelp && (
          <button
            type="button"
            onClick={onGetHelp}
            className="rounded-md border border-border bg-transparent px-3 py-[6px] text-[11px] font-medium text-text-sec transition-colors hover:text-text"
          >
            Get help
          </button>
        )}
      </div>
    </div>
  );
}
