import React from 'react';
import { Link } from 'react-router-dom';
import LandingBdiRadar from './LandingBdiRadar';

/**
 * Landing hero — two-column composition matching the design handoff:
 *   Left  · kicker, big italic-amber-accent headline, subtitle, CTAs,
 *           inline "Connects to" client list.
 *   Right · BDI radar with stat overlays (facts count, plans live,
 *           agents working).
 * Uses Tailwind tokens so it reads in both light and dark mode.
 */
const HeroSection: React.FC = () => {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-[1180px] gap-12 px-6 py-16 sm:px-9 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16">
        {/* Left column — copy + CTAs */}
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            ◆ AI-first agent coordination
          </span>
          <h1 className="mt-5 font-display text-[40px] font-bold leading-[1.05] tracking-[-0.035em] text-text sm:text-[52px] lg:text-[60px]">
            Plans your agents{' '}
            <br className="hidden sm:inline" />
            actually{' '}
            <span className="font-serif italic text-amber">remember.</span>
          </h1>
          <p className="mt-6 max-w-[52ch] text-[15px] leading-[1.6] text-text-sec">
            Hierarchical plans, explicit beliefs and intentions, and a temporal
            knowledge graph your agents share across sessions, tools, and
            teammates.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/login"
              className="rounded-md bg-amber px-5 py-2.5 font-medium text-bg transition-opacity hover:opacity-90"
            >
              Get started →
            </Link>
            <Link
              to="/connect"
              className="rounded-md border border-border bg-surface px-5 py-2.5 font-mono text-[13px] text-text transition-colors hover:bg-surface-hi"
            >
              <span className="text-text-muted">$</span> install mcp
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
              Connects to
            </span>
            {[
              { id: 'claude-desktop', label: 'Claude Desktop' },
              { id: 'claude-code', label: 'Claude Code' },
              { id: 'cursor', label: 'Cursor' },
              { id: 'openclaw', label: 'Windsurf' },
            ].map((c, i, arr) => (
              <React.Fragment key={c.id}>
                <Link
                  to={`/connect/${c.id}`}
                  className="text-text-sec transition-colors hover:text-text"
                >
                  {c.label}
                </Link>
                {i < arr.length - 1 && (
                  <span className="text-text-muted" aria-hidden>
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right column — BDI radar with stat callouts */}
        <div className="relative hidden lg:block">
          <div className="relative aspect-square w-full">
            <LandingBdiRadar className="h-full w-full" />
            <span className="absolute left-2 top-6 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
              ◆ 2,431 facts
            </span>
            <span className="absolute right-2 top-6 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
              47 plans live
            </span>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
              ◆ 12 agents working
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
