import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Closing CTA drawn as a fresh sheet: a bordered panel on the drafting grid
 * with corner registration ticks — the next drawing waiting to be started.
 */
const FinalCtaSection: React.FC = () => (
  <section className="bg-surface-hi">
    <div className="mx-auto max-w-[1080px] px-6 py-20 sm:px-9">
      <div className="bp-grid relative border border-border-hi bg-surface px-7 py-10 sm:px-10">
        {/* corner ticks */}
        {['left-2 top-2', 'right-2 top-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
          <svg key={pos} aria-hidden width="10" height="10" viewBox="0 0 10 10" className={`absolute text-text/40 ${pos}`}>
            <line x1="5" y1="0" x2="5" y2="10" stroke="currentColor" strokeWidth="1" />
            <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1" />
          </svg>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-9">
          <div className="max-w-[560px]">
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
              Sheet 02 · Yours
            </span>
            <h3 className="mt-3 font-display text-[32px] font-semibold leading-[1.05] tracking-[-0.005em] text-text">
              Spin up one live workspace. Reuse the process forever.
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-text-sec">
              Fork your next workspace from a Blueprint, link a goal, and let agents help move it forward.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Link
              to="/login"
              className="rounded-[3px] bg-amber px-5 py-2.5 font-medium text-bg transition-opacity hover:opacity-90"
            >
              Create a workspace →
            </Link>
            <Link
              to="/explore"
              className="rounded-[3px] border border-border-hi bg-surface px-5 py-2.5 font-medium text-text transition-colors hover:bg-surface-hi"
            >
              Browse blueprints
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default FinalCtaSection;
