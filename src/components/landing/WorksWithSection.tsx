import React from 'react';
import { Link } from 'react-router-dom';
import { CLIENT_CONFIGS, CLIENT_ORDER } from '../../pages/onboarding/clientConfigs';

/**
 * Works-with strip (structure from the "Flow v2" design): the five supported
 * clients as connect cards, each deep-linking into its /connect/:client guide.
 * Replaces the old quick-start + chip-list SocialProofSection.
 */
const WorksWithSection: React.FC = () => (
  <section className="border-b border-border bg-surface">
    <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-9">
      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
        ◆ Works with the agents you already run
      </span>
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {CLIENT_ORDER.map((id) => {
          const c = CLIENT_CONFIGS[id];
          return (
            <Link
              key={id}
              to={c.connectPath}
              className="group relative rounded-[10px] border border-border bg-surface-hi p-4 transition-colors hover:border-border-hi"
            >
              {c.recommended && (
                <span className="absolute -top-2 right-2.5 rounded-full bg-amber px-2 py-[2px] font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-bg">
                  Easiest
                </span>
              )}
              <div className="font-display text-[13.5px] font-semibold tracking-[-0.01em] text-text">
                {c.name}
              </div>
              <div className="mt-1 font-mono text-[10px] text-text-muted">{c.sub}</div>
              <div className="mt-3 text-[11px] text-amber opacity-80 transition-opacity group-hover:opacity-100">
                Connect →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);

export default WorksWithSection;
