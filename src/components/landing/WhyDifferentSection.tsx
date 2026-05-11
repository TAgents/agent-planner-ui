import React from 'react';
import { cn } from '../v1/cn';

type Kind = 'blueprint' | 'workspace' | 'goal' | 'plan';

const BLOCKS: Array<{ kind: Kind; title: string; body: string }> = [
  {
    kind: 'blueprint',
    title: 'Blueprints capture what works',
    body: 'Save a winning workflow once — fork it into a fresh workspace any time you need to run it again.',
  },
  {
    kind: 'workspace',
    title: 'Workspaces are where work lives',
    body: 'A live operating surface for a real effort — goals, plans, agents, and decisions in one place.',
  },
  {
    kind: 'goal',
    title: 'Goals keep work aligned',
    body: "Every workspace ties back to an outcome, so the team and agents know why the work matters.",
  },
  {
    kind: 'plan',
    title: 'Plans + agents make it move',
    body: "When it's time to execute, agents help with planning, research, and review inside structure.",
  },
];

const KIND_META: Record<Kind, { fg: string; glyph: string; name: string }> = {
  blueprint: { fg: 'text-violet',   glyph: 'BP', name: 'Blueprint' },
  workspace: { fg: 'text-amber',    glyph: 'WS', name: 'Workspace' },
  goal:      { fg: 'text-emerald',  glyph: 'GO', name: 'Goal' },
  plan:      { fg: 'text-text-sec', glyph: 'PL', name: 'Plan' },
};

const WhyDifferentSection: React.FC = () => (
  <section className="border-b border-border">
    <div className="mx-auto max-w-[1180px] px-6 py-20 sm:px-9 md:py-24">
      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
        Why this is different
      </span>
      <h2 className="mt-3 max-w-[720px] font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-text sm:text-[32px]">
        Most tools track tasks. AgentPlanner structures the way you actually run work.
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {BLOCKS.map((b) => {
          const m = KIND_META[b.kind];
          return (
            <div
              key={b.kind}
              className="rounded-[10px] border border-border bg-surface p-[22px]"
            >
              <div className="mb-3.5 flex items-center gap-2">
                <span className={cn(
                  'rounded-sm bg-black/5 px-[5px] py-[2px] font-mono text-[9px] font-bold tracking-[0.08em] dark:bg-white/5',
                  m.fg,
                )}>{m.glyph}</span>
                <div className="font-display text-[12px] font-semibold tracking-[-0.01em] text-text">
                  {m.name}
                </div>
              </div>
              <div className="mb-2 font-display text-[16px] font-semibold leading-tight tracking-[-0.015em] text-text">
                {b.title}
              </div>
              <div className="text-[13px] leading-relaxed text-text-sec">
                {b.body}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default WhyDifferentSection;
