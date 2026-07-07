import React from 'react';
import { Link } from 'react-router-dom';
import { useOpenChatLink } from './useOpenChatLink';

/**
 * Top navigation for the landing page. The mark is a drafting glyph — a
 * registration crosshair over a plotted square — instead of a filled tile.
 * Docs/Explore/API links + ultramarine Get Started CTA on the right.
 */
const LandingHeader: React.FC = () => {
  const openChat = useOpenChatLink();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-6 py-3.5 sm:px-9">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden className="shrink-0">
              <rect x="4.5" y="4.5" width="21" height="21" rx="2" className="fill-amber/10 stroke-amber" strokeWidth="1.5" />
              <line x1="15" y1="0" x2="15" y2="9" className="stroke-amber" strokeWidth="1.5" />
              <line x1="15" y1="21" x2="15" y2="30" className="stroke-amber" strokeWidth="1.5" />
              <line x1="0" y1="15" x2="9" y2="15" className="stroke-amber" strokeWidth="1.5" />
              <line x1="21" y1="15" x2="30" y2="15" className="stroke-amber" strokeWidth="1.5" />
              <circle cx="15" cy="15" r="2.5" className="fill-amber" />
            </svg>
            <span className="font-display text-[19px] font-semibold tracking-[0.01em] text-text">
              AgentPlanner
            </span>
            <span className="rounded-md border border-border-hi bg-surface px-1.5 py-[2px] font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-text-sec">
              Alpha
            </span>
          </Link>
          <a
            href="https://talkingagents.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:text-text md:inline"
            title="The team behind AgentPlanner"
          >
            by Talking Agents ↗
          </a>
        </div>
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
            to={openChat.to}
            onClick={openChat.onClick}
            className="hidden rounded-lg border border-border-hi bg-surface px-4 py-1.5 font-medium text-text transition-colors hover:bg-surface-hi sm:inline"
          >
            Open chat
          </Link>
          <Link
            to="/connect"
            className="rounded-lg bg-amber px-4 py-1.5 font-medium text-bg transition-opacity hover:opacity-90"
          >
            Connect an agent →
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default LandingHeader;
