import React from 'react';

/**
 * The one big claim, set as a specification note — flanked by registration
 * crosshairs, in the display face. No figure number: this is a statement,
 * not a drawing.
 */
const DifferentiationSection: React.FC = () => (
  <section className="bp-grid-faint border-b border-border">
    <div className="relative mx-auto max-w-[880px] px-6 py-24 text-center sm:px-9">
      <Crosshair className="left-2 top-8" />
      <Crosshair className="right-2 top-8" />
      <Crosshair className="bottom-8 left-2" />
      <Crosshair className="bottom-8 right-2" />

      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-amber">
        More than task tracking
      </span>
      <h2 className="mt-5 font-display text-[38px] font-semibold leading-[1.08] tracking-[-0.005em] text-text sm:text-[46px]">
        A system for turning reusable operating knowledge into{' '}
        <span className="text-amber">live, goal-aligned workspaces</span>{' '}
        — with agents in the work.
      </h2>
    </div>
  </section>
);

const Crosshair: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    aria-hidden
    width="14"
    height="14"
    viewBox="0 0 14 14"
    className={`absolute hidden text-text/30 sm:block ${className || ''}`}
  >
    <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" strokeWidth="1" />
    <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export default DifferentiationSection;
