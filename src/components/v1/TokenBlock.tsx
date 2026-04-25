import React, { useCallback, useState } from 'react';
import { cn } from './cn';

export type TokenBlockProps = {
  token: string;
  /** Uppercase mono kicker label above the input row. Pass `null` to omit. */
  label?: string | null;
  className?: string;
};

/**
 * Single-line API token display: ⚿ glyph + monospace token + Copy button.
 * Used in onboarding step 2, /connect/* pages, and Settings → Integrations.
 * See design_handoff_agentplanner/designs/connect-shared.jsx.
 */
export function TokenBlock({ token, label = 'Your API token', className }: TokenBlockProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(token).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {
        // swallow — the copy button is a non-critical convenience
      },
    );
  }, [token]);

  return (
    <div className={className}>
      {label && (
        <span className="mb-[6px] block font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          {label}
        </span>
      )}
      <div
        className={cn(
          'flex items-center gap-[10px] rounded-lg border border-border bg-bg',
          'px-3 py-[10px]',
        )}
      >
        <span aria-hidden className="font-mono text-[11px] text-text-muted">
          ⚿
        </span>
        <span className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis font-mono text-[12px] text-text">
          {token}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            'rounded-[5px] border border-border bg-surface-hi px-[10px] py-[4px]',
            'font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-text-sec',
            'transition-colors duration-150 hover:bg-border-hi hover:text-text',
          )}
          aria-label={copied ? 'Token copied' : 'Copy token'}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
