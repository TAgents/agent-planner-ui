import React from 'react';

const STEPS = [
  { n: '01', title: 'Choose or create a Blueprint', body: 'Start from a reusable operating model — yours or from the community library.' },
  { n: '02', title: 'Fork it into a Workspace', body: 'Spin up a live operating surface for the real effort.' },
  { n: '03', title: 'Link goals and plans inside', body: 'Tie execution to outcomes that actually matter.' },
  { n: '04', title: 'Run with humans and agents', body: 'Plans, decisions, and agent help move idea to delivery.' },
];

/**
 * The operating sequence, drawn as a numbered assembly line: a continuous
 * plotted line with node markers, one per step. The 01–04 numbering is
 * honest — this is the actual order of operations.
 */
const ProductFlowSection: React.FC = () => (
  <section className="bg-surface-hi">
    <div className="mx-auto max-w-[1180px] px-6 py-20 sm:px-9 md:py-24">
      <div className="mb-12 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            Fig. 03 — Operating sequence
          </span>
          <h2 className="mt-3 font-display text-[34px] font-semibold tracking-[-0.005em] text-text">
            Reuse, fork, align, execute.
          </h2>
        </div>
        <span className="font-mono text-[10.5px] tracking-[0.06em] text-text-sec">
          From blueprint to live workspace in one system.
        </span>
      </div>

      <ol className="relative grid list-none grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-4 lg:gap-y-0">
        {STEPS.map((s) => (
          <li key={s.n} className="relative lg:pr-8">
            {/* node marker */}
            <span aria-hidden className="relative z-10 flex h-[23px] items-center">
              <span className="flex h-[23px] w-[23px] items-center justify-center border-[1.5px] border-amber bg-surface">
                <span className="h-[7px] w-[7px] bg-amber" />
              </span>
            </span>
            <span className="mt-4 block font-mono text-[11px] font-semibold tracking-[0.16em] text-amber">
              {s.n}
            </span>
            <div className="mt-2 mb-2 font-display text-[20px] font-semibold leading-tight text-text">
              {s.title}
            </div>
            <div className="max-w-[30ch] text-[13px] leading-relaxed text-text-sec">{s.body}</div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default ProductFlowSection;
