import React from 'react';
import { cn } from './cn';

export type ClientTileProps = {
  /** 1–3 char monogram (e.g. "CD" for Claude Desktop, "CC" for Claude Code). */
  glyph: string;
  /** Display name (e.g. "Claude Desktop"). */
  name: React.ReactNode;
  /** One-line subtitle (e.g. "One-click .mcpb"). */
  sub: React.ReactNode;
  /** Show the amber "Easiest" badge. */
  recommended?: boolean;
  /** Selected state — amber border + filled monogram tile. */
  active?: boolean;
  /** Tighter padding + smaller monogram for the landing-page Works-with strip. */
  compact?: boolean;
  onClick?: () => void;
  className?: string;
};

/**
 * Picker tile for an MCP client. Used in onboarding step 1 and the
 * landing page Works-with strip.
 * See design_handoff_agentplanner/designs/connect-shared.jsx.
 */
export function ClientTile({
  glyph,
  name,
  sub,
  recommended = false,
  active = false,
  compact = false,
  onClick,
  className,
}: ClientTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative flex flex-col items-stretch gap-[10px] rounded-[10px] border p-4',
        'text-left transition-colors duration-150 hover:bg-surface-hi/60',
        active ? 'border-amber bg-surface-hi' : 'border-border bg-surface',
        compact ? 'gap-[6px] min-h-[88px] px-[14px] py-3' : 'min-h-[120px]',
        className,
      )}
    >
      {recommended && (
        <span
          className={cn(
            'absolute -top-[7px] right-3 rounded-full bg-amber px-2',
            'py-[1.5px] font-mono text-[8.5px] font-bold uppercase tracking-[0.14em] text-bg',
          )}
        >
          Easiest
        </span>
      )}
      <span
        className={cn(
          'flex items-center justify-center rounded-lg font-display font-bold',
          'tracking-[-0.04em]',
          active ? 'bg-amber text-bg' : 'border border-border bg-surface-hi text-text',
          compact ? 'h-7 w-7 text-[13px]' : 'h-9 w-9 text-base',
        )}
      >
        {glyph}
      </span>
      <span className="block">
        <span
          className={cn(
            'block font-display font-semibold tracking-[-0.01em] text-text',
            compact ? 'text-[12.5px]' : 'text-[14px]',
          )}
        >
          {name}
        </span>
        <span
          className={cn(
            'mt-[2px] block text-text-muted',
            compact ? 'text-[10.5px]' : 'text-[11.5px]',
          )}
        >
          {sub}
        </span>
      </span>
    </button>
  );
}
