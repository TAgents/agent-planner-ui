import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Top navigation for the landing page. Logo + ALPHA pill on the left,
 * docs/explore/api links + amber Get Started CTA on the right.
 * Uses Tailwind tokens so it adapts to dark/light theme.
 */
const LandingHeader: React.FC = () => {
  return (
    <header className="border-b border-border/60 bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-6 py-4 sm:px-9">
        <Link to="/" className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-md bg-amber font-mono text-[12px] font-bold text-bg"
            aria-hidden
          >
            ap
          </span>
          <span className="font-display text-[18px] font-bold tracking-[-0.02em] text-text">
            AgentPlanner
          </span>
          <span className="rounded-md border border-border bg-surface px-2 py-[2px] font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-text-sec">
            Alpha
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-[13px] sm:gap-5">
          <a
            href="https://github.com/TAgents/agent-planner/blob/main/docs/GETTING_STARTED.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-text-sec transition-colors hover:text-text sm:inline"
          >
            Docs
          </a>
          <Link
            to="/explore"
            className="hidden text-text-sec transition-colors hover:text-text sm:inline"
          >
            Explore
          </Link>
          <a
            href="/api/api-docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-text-sec transition-colors hover:text-text sm:inline"
          >
            API
          </a>
          <Link
            to="/login"
            className="rounded-md bg-amber px-4 py-1.5 font-medium text-bg transition-opacity hover:opacity-90"
          >
            Get started →
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default LandingHeader;
