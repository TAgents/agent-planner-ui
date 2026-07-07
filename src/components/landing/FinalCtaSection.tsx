import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Closing CTA (structure from the "Flow v2" design): one centered promise,
 * the two arrival paths as buttons, and the terms in a single mono line.
 */
const FinalCtaSection: React.FC = () => (
  <section className="bp-grid-faint relative">
    <div className="mx-auto max-w-[1080px] px-6 py-20 text-center sm:px-9">
      <h3 className="font-display text-[32px] font-semibold leading-[1.05] tracking-[-0.01em] text-text sm:text-[36px]">
        Sixty seconds to a connected agent.
      </h3>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          to="/connect"
          className="rounded-lg bg-amber px-6 py-3 font-medium text-bg transition-opacity hover:opacity-90"
        >
          Connect an agent →
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-border-hi bg-surface px-6 py-3 font-medium text-text transition-colors hover:bg-surface-hi"
        >
          Open chat
        </Link>
      </div>
      <p className="mt-4 font-mono text-[10.5px] text-text-muted">
        free in alpha · no card · works with 5 clients
      </p>
    </div>
  </section>
);

export default FinalCtaSection;
