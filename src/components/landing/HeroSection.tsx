import React from 'react';
import { Link } from 'react-router-dom';
import OntologyDiagram from './OntologyDiagram';

/**
 * Workspace-first hero. Left column carries the headline + CTAs; right
 * column renders a compact 4-layer ontology diagram (Blueprint forks
 * into a live Workspace that holds Goals + Plans + Agents) so the
 * mental model is visible before scrolling.
 */
const HeroSection: React.FC = () => {
  return (
    <section className="relative border-b border-border">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-6 py-16 sm:px-9 md:py-20 lg:grid-cols-2 lg:gap-14">
        {/* Left — copy + CTAs */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-sec">
            <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-amber" />
            Operating system for repeatable work
          </span>
          <h1 className="mt-6 font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-text sm:text-[52px] lg:text-[56px]">
            Turn repeatable work into{' '}
            <span className="font-serif italic font-medium text-amber">live workspaces</span>{' '}
            with agents.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[15px] leading-[1.6] text-text-sec">
            AgentPlanner helps you fork reusable Blueprints into live Workspaces,
            connect goals and plans inside them, and run execution with humans
            and AI agents in one system.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/login"
              className="rounded-md bg-amber px-5 py-2.5 font-medium text-bg transition-opacity hover:opacity-90"
            >
              Create Workspace →
            </Link>
            <Link
              to="/explore"
              className="rounded-md border border-border bg-surface px-5 py-2.5 font-medium text-text transition-colors hover:bg-surface-hi"
            >
              Explore Blueprints
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-text-muted">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.14em]">Built for</span>
            <span>Founders</span>
            <span className="opacity-40">·</span>
            <span>Operators</span>
            <span className="opacity-40">·</span>
            <span>Agencies</span>
          </div>
        </div>

        <OntologyDiagram />
      </div>
    </section>
  );
};

export default HeroSection;
