import React from 'react';

const STEPS = [
  { n: '01', title: 'Choose or create a Blueprint', body: 'Start from a reusable operating model — yours or from the community library.' },
  { n: '02', title: 'Fork it into a Workspace', body: 'Spin up a live operating surface for the real effort.' },
  { n: '03', title: 'Link goals and plans inside', body: 'Tie execution to outcomes that actually matter.' },
  { n: '04', title: 'Run with humans and agents', body: 'Plans, decisions, and agent help move idea to delivery.' },
];

const ProductFlowSection: React.FC = () => (
  <section className="border-b border-border bg-surface-hi">
    <div className="mx-auto max-w-[1180px] px-6 py-20 sm:px-9 md:py-24">
      <div className="mb-9 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            How it works
          </span>
          <h2 className="mt-3 font-display text-[28px] font-semibold tracking-[-0.025em] text-text">
            Reuse, fork, align, execute.
          </h2>
        </div>
        <span className="font-mono text-[10.5px] tracking-[0.06em] text-text-sec">
          From blueprint to live workspace in one system.
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className={
              'relative bg-surface px-[22px] py-7 ' +
              (i === 0 ? 'border-l border-border-hi ' : '') +
              'border-r border-border-hi ' +
              (i !== 0 ? 'border-l-0 sm:border-l-0' : '')
            }
          >
            <span aria-hidden className="absolute left-1/2 top-0 h-px w-2 -translate-x-1/2 bg-amber" />
            <span className="font-mono text-[10px] tracking-[0.14em] text-amber">{s.n}</span>
            <div className="mt-2.5 mb-2 font-display text-[17px] font-semibold leading-tight tracking-[-0.02em] text-text">
              {s.title}
            </div>
            <div className="text-[13px] leading-relaxed text-text-sec">{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProductFlowSection;
