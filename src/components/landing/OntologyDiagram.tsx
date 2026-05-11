import React from 'react';
import { cn } from '../v1/cn';

/**
 * Compact 4-layer model for the landing hero. Blueprint stack on the left
 * forks into a live Workspace card on the right, which holds a Goal + a
 * Plan with phases + agent indicators. A second arrow underneath shows
 * the symmetric "save as blueprint" return path.
 */
const OntologyDiagram: React.FC = () => {
  const phaseRows: Array<{ label: string; pct: number; agent?: boolean }> = [
    { label: 'Strategy', pct: 100 },
    { label: 'Pricing', pct: 100 },
    { label: 'Launch assets', pct: 62, agent: true },
    { label: 'Distribution', pct: 18 },
  ];

  return (
    <div className="relative h-[460px] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_12px_36px_-16px_rgba(20,16,8,0.12)]">
      {/* faint grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(var(--text)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--text)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Blueprint stack — left */}
      <div className="absolute left-6 top-14 w-[130px]">
        <Label kind="blueprint" name="Blueprint" caption="reusable model" />
        <div className="relative mt-2.5 h-24">
          {[2, 1, 0].map((i) => (
            <div
              key={i}
              className="absolute h-[76px] w-[110px] rounded-md border border-border bg-surface shadow-[0_4px_14px_-8px_rgba(0,0,0,0.12)]"
              style={{ left: i * 5, top: i * 5 }}
            >
              <div className="flex flex-col gap-1.5 p-2">
                <div className="h-[5px] w-3/5 rounded-sm bg-violet opacity-60" />
                <div className="h-[3px] w-[90%] rounded-sm bg-border-hi" />
                <div className="h-[3px] w-[70%] rounded-sm bg-border-hi" />
                <div className="h-[3px] w-[85%] rounded-sm bg-border-hi" />
                <div className="h-[3px] w-1/2 rounded-sm bg-border-hi" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* fork-into arrow */}
      <svg className="absolute left-[154px] top-[100px]" width="80" height="16" aria-hidden>
        <line x1="0" y1="8" x2="70" y2="8" stroke="rgb(var(--border-hi))" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M 70 4 L 76 8 L 70 12 Z" fill="rgb(var(--border-hi))" />
      </svg>
      <span className="absolute left-[158px] top-[80px] font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
        fork into
      </span>

      {/* Workspace — live container, right */}
      <div className="absolute right-6 top-6 w-[280px] rounded-xl border-[1.5px] border-amber bg-bg p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <Label kind="workspace" name="Workspace" inline />
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-amber">
            <span className="inline-block h-[5px] w-[5px] rounded-full bg-amber shadow-[0_0_0_3px_rgba(212,162,78,0.2)]" />
            Live
          </span>
        </div>
        <div className="mb-1 font-display text-[13px] font-semibold tracking-[-0.01em] text-text">
          Growth Engine
        </div>
        <div className="mb-2.5 font-mono text-[9px] tracking-[0.06em] text-text-muted">
          forked from · Product Launch v3
        </div>

        {/* Goal pill */}
        <div className="mb-2 flex items-center gap-2 rounded-md bg-emerald/[0.18] px-2.5 py-2">
          <span className="font-mono text-[8.5px] font-bold tracking-[0.08em] text-emerald">GOAL</span>
          <span className="text-[11px] font-medium text-text">Ship publicly</span>
          <span className="ml-auto font-mono text-[10px] text-emerald">68%</span>
        </div>

        {/* Plan block */}
        <div className="rounded-md border border-border bg-surface p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[8.5px] font-bold tracking-[0.08em] text-text-sec">PLAN · Launch Plan</span>
            <span className="font-mono text-[9px] text-text-muted">4 phases</span>
          </div>
          {phaseRows.map((r, i) => (
            <div key={r.label} className={cn('flex items-center gap-2', i < phaseRows.length - 1 && 'mb-1.5')}>
              <span className="flex-1 text-[11px] text-text">{r.label}</span>
              {r.agent && <span className="inline-block h-[5px] w-[5px] rounded-full bg-amber shadow-[0_0_0_3px_rgba(212,162,78,0.2)]" />}
              <div className="h-[3px] w-[60px] overflow-hidden rounded-full bg-surface-hi">
                <div className="h-full rounded-full bg-amber" style={{ width: `${r.pct}%` }} />
              </div>
              <span className="min-w-[24px] text-right font-mono text-[9px] text-text-muted">{r.pct}%</span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="inline-block h-[6px] w-[6px] rounded-full bg-amber shadow-[0_0_0_3px_rgba(212,162,78,0.2)]" />
          <span className="font-mono tracking-[0.1em]">2 agents · planner, reviewer</span>
        </div>
      </div>

      {/* save-back affordance */}
      <svg className="absolute left-[144px] top-[360px]" width="90" height="22" aria-hidden>
        <path d="M 80 4 C 60 4, 40 18, 8 18" stroke="rgb(var(--border-hi))" strokeWidth="1" strokeDasharray="3 3" fill="none" />
        <path d="M 12 14 L 4 18 L 12 22 Z" fill="rgb(var(--border-hi))" />
      </svg>
      <span className="absolute left-[156px] top-[384px] font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
        save as blueprint
      </span>

      {/* legend strip */}
      <div className="absolute inset-x-6 bottom-[18px] flex items-center justify-between rounded-md bg-surface-hi px-3.5 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-sec">
          Workspace = live · Blueprint = reusable
        </span>
        <span className="font-mono text-[10px] tracking-[0.06em] text-text-muted">v 2026.05</span>
      </div>
    </div>
  );
};

const KIND_COLOR: Record<'blueprint' | 'workspace' | 'goal' | 'plan', { fg: string; glyph: string }> = {
  blueprint: { fg: 'text-violet', glyph: 'BP' },
  workspace: { fg: 'text-amber',  glyph: 'WS' },
  goal:      { fg: 'text-emerald', glyph: 'GO' },
  plan:      { fg: 'text-text-sec', glyph: 'PL' },
};

const Label: React.FC<{
  kind: 'blueprint' | 'workspace' | 'goal' | 'plan';
  name: string;
  caption?: string;
  inline?: boolean;
}> = ({ kind, name, caption, inline }) => {
  const c = KIND_COLOR[kind];
  return (
    <div className="flex items-center gap-2">
      <span className={cn('rounded-sm bg-black/5 px-[5px] py-[2px] font-mono text-[9px] font-bold tracking-[0.08em] dark:bg-white/5', c.fg)}>
        {c.glyph}
      </span>
      <div>
        <div className="font-display text-[12px] font-semibold tracking-[-0.01em] text-text">{name}</div>
        {caption && !inline && (
          <div className="font-mono text-[9px] tracking-[0.04em] text-text-muted">{caption}</div>
        )}
      </div>
    </div>
  );
};

export default OntologyDiagram;
