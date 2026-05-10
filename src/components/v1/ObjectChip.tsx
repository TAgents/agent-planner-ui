import React from 'react';
import { cn } from './cn';

export type ObjectChipKind = 'blueprint' | 'workspace' | 'goal' | 'plan';

export type ObjectChipProps = {
  kind: ObjectChipKind;
  label: string;
  /** Outline-only variant for muted contexts. */
  dim?: boolean;
  className?: string;
};

const KIND_GLYPH: Record<ObjectChipKind, string> = {
  blueprint: 'BP',
  workspace: 'WS',
  goal: 'GO',
  plan: 'PL',
};

const KIND_COLOR: Record<ObjectChipKind, { fg: string; bg: string }> = {
  blueprint: { fg: 'text-violet', bg: 'bg-violet/[0.18]' },
  workspace: { fg: 'text-amber', bg: 'bg-amber/[0.15]' },
  goal: { fg: 'text-emerald', bg: 'bg-emerald/[0.18]' },
  plan: { fg: 'text-text-sec', bg: 'bg-surface-hi' },
};

/**
 * Visualizes a relationship to another object: Blueprint, Workspace,
 * Goal, or Plan. Two-tone — colored 2-letter glyph + label. The glyph
 * teaches the system without making the chip noisy.
 */
export function ObjectChip({ kind, label, dim, className }: ObjectChipProps) {
  const c = KIND_COLOR[kind];
  return (
    <span
      className={cn(
        'inline-flex max-w-[260px] items-center gap-1.5 rounded-md py-[3px] pr-2 pl-1',
        'font-body text-[11.5px] font-medium text-text',
        dim ? 'border border-border bg-transparent' : `border border-transparent ${c.bg}`,
        className,
      )}
    >
      <span
        className={cn(
          'rounded-[3px] px-1 py-[2px] font-mono text-[8.5px] font-bold tracking-[0.06em]',
          c.fg,
          dim ? c.bg : 'bg-black/10',
        )}
      >
        {KIND_GLYPH[kind]}
      </span>
      <span className="truncate">{label}</span>
    </span>
  );
}
