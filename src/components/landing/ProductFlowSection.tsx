import React from 'react';

const STEPS = [
  { n: '01', title: 'Choose or create a Blueprint', body: 'Start from a reusable operating model, either yours or one from the community library.' },
  { n: '02', title: 'Fork it into a Workspace', body: 'Spin up a live operating surface for the real effort.' },
  { n: '03', title: 'Link goals and plans inside', body: 'Tie execution to outcomes that actually matter.' },
  { n: '04', title: 'Run with humans and agents', body: 'Plans, decisions, and agent help move idea to delivery.' },
];

/**
 * The operating sequence as one bordered 4-column row (structure from the
 * "Flow v2" design): steps sit shoulder-to-shoulder behind shared hairline
 * dividers, each with a registration tick at its top edge. The 01–04
 * numbering is honest — this is the actual order of operations.
 */
const ProductFlowSection: React.FC = () => (
  <section className="border-b border-border">
    <div className="mx-auto max-w-[1180px] px-6 py-16 sm:px-9">
      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
        How it works
      </span>
      <h2 className="mt-2.5 font-display text-[28px] font-semibold tracking-[-0.01em] text-text">
        Reuse, fork, align, execute.
      </h2>

      <ol className="mt-7 grid list-none grid-cols-1 overflow-hidden border border-border sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li
            key={s.n}
            className={`relative bg-surface p-6 ${i > 0 ? 'border-t border-border sm:border-t-0 sm:border-l' : ''}`}
          >
            <span aria-hidden className="absolute left-1/2 top-0 h-px w-2 -translate-x-1/2 bg-amber" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-amber">{s.n}</span>
            <div className="mt-2.5 font-display text-[16px] font-semibold leading-[1.25] tracking-[-0.01em] text-text">
              {s.title}
            </div>
            <div className="mt-1.5 text-[12px] leading-[1.55] text-text-sec">{s.body}</div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default ProductFlowSection;
