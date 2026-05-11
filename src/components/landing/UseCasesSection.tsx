import React from 'react';

const CASES = [
  {
    tag: 'Internal ops',
    title: 'Standardize the work that repeats',
    body: 'Launches, hiring, research, and operating cadences run the same way every time.',
    examples: ['Quarterly launch', 'Hiring round', 'Weekly research brief'],
  },
  {
    tag: 'Client delivery',
    title: 'Productize your best engagements',
    body: 'Turn winning service workflows into reusable blueprints you can fork per client.',
    examples: ['Client onboarding', 'Discovery sprint', 'Quarterly review'],
  },
  {
    tag: 'Repeatable AI workflows',
    title: 'Give agents real ground to operate on',
    body: 'Structured workspaces where agents do useful work — not just generate text.',
    examples: ['Research → brief', 'Inbox triage', 'Spec → PR draft'],
  },
];

const UseCasesSection: React.FC = () => (
  <section className="border-b border-border">
    <div className="mx-auto max-w-[1180px] px-6 py-20 sm:px-9 md:py-24">
      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
        Where it fits
      </span>
      <h2 className="mt-3 font-display text-[28px] font-semibold tracking-[-0.025em] text-text">
        Three lanes that compound.
      </h2>
      <div className="mt-9 grid grid-cols-1 gap-[18px] md:grid-cols-3">
        {CASES.map((c) => (
          <div
            key={c.tag}
            className="flex min-h-[240px] flex-col gap-3.5 rounded-[10px] border border-border bg-surface p-6"
          >
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-amber">{c.tag}</span>
            <div className="font-display text-[18px] font-semibold leading-tight tracking-[-0.02em] text-text">
              {c.title}
            </div>
            <div className="text-[13px] leading-relaxed text-text-sec">{c.body}</div>
            <div className="mt-auto flex flex-wrap gap-1.5">
              {c.examples.map((e) => (
                <span
                  key={e}
                  className="rounded-sm border border-border bg-surface-hi px-2 py-[3px] font-mono text-[10px] tracking-[0.02em] text-text-sec"
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default UseCasesSection;
