import React from 'react';

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
    body: 'Every workspace ties back to an outcome, so the team and agents know why the work matters.',
  },
  {
    kind: 'plan',
    title: 'Plans + agents make it move',
    body: "When it's time to execute, agents help with planning, research, and review inside structure.",
  },
];

/** Legend swatches: dashed stroke = reusable/static, solid = live. */
const KIND_META: Record<Kind, { name: string; stroke: string; dashed: boolean }> = {
  blueprint: { name: 'Blueprint', stroke: 'stroke-violet', dashed: true },
  workspace: { name: 'Workspace', stroke: 'stroke-amber', dashed: false },
  goal:      { name: 'Goal', stroke: 'stroke-emerald', dashed: false },
  plan:      { name: 'Plan', stroke: 'stroke-text-sec', dashed: false },
};

/**
 * The object model, presented like a drawing legend: each object gets a
 * line-style swatch (dashed = reusable, solid ink = live) so the section
 * teaches the same vocabulary the hero drawing uses.
 */
const WhyDifferentSection: React.FC = () => (
  <section className="border-b border-border">
    <div className="mx-auto max-w-[1180px] px-6 py-20 sm:px-9 md:py-24">
      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
        Fig. 02 — Object model
      </span>
      <h2 className="mt-3 max-w-[680px] font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.005em] text-text sm:text-[40px]">
        Most tools track tasks. AgentPlanner structures the way you actually run work.
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {BLOCKS.map((b) => {
          const m = KIND_META[b.kind];
          return (
            <div
              key={b.kind}
              className="rounded-[4px] border border-border bg-surface p-[22px]"
            >
              <div className="mb-4 flex items-center gap-2.5">
                <svg width="26" height="18" viewBox="0 0 26 18" aria-hidden>
                  <rect
                    x="1"
                    y="1"
                    width="24"
                    height="16"
                    rx="2"
                    className={`fill-none ${m.stroke}`}
                    strokeWidth="1.5"
                    strokeDasharray={m.dashed ? '4 3' : undefined}
                  />
                </svg>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-sec">
                  {m.name}
                </span>
              </div>
              <div className="mb-2 font-display text-[19px] font-semibold leading-tight text-text">
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
