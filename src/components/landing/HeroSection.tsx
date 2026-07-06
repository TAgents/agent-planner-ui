import React from 'react';
import { Link } from 'react-router-dom';
import OntologyDiagram from './OntologyDiagram';

/**
 * Hero as thesis: the shared-brain claim on the left, the product's mental
 * model drawn as an actual working drawing (FIG. 01) on the right. The
 * section sits on a faint drafting grid; the diagram carries the boldness,
 * everything else stays quiet.
 */
const HeroSection: React.FC = () => {
  return (
    <section className="bp-grid-faint relative">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-6 py-16 sm:px-9 md:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        {/* Left — copy + CTAs */}
        <div className="landing-fade-up">
          <span className="inline-flex items-center gap-2 border border-border-hi bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-sec">
            <span aria-hidden className="h-[6px] w-[6px] bg-amber" />
            Operating system for repeatable work
          </span>
          <h1 className="mt-6 font-display text-[52px] font-semibold leading-[0.98] tracking-[-0.01em] text-text sm:text-[68px] lg:text-[74px]">
            Your agents need
            <br />
            a <span className="text-amber">shared brain</span>.
          </h1>
          <p className="mt-6 max-w-[54ch] text-[15px] leading-[1.65] text-text-sec">
            AgentPlanner is the persistent substrate agents and humans run on.
            Fork a reusable Blueprint into a live Workspace, wire goals to
            plans, and keep every dependency, decision, and learning — even
            when the context window doesn't.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
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
              Explore blueprints
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-text-muted">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.14em]">Built for</span>
            <span>Founders</span>
            <span aria-hidden className="opacity-40">/</span>
            <span>Operators</span>
            <span aria-hidden className="opacity-40">/</span>
            <span>Agencies</span>
          </div>
        </div>

        <div className="landing-fade-up landing-delay-2">
          <OntologyDiagram />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
