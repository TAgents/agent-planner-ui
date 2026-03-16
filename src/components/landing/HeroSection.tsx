import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, BookOpen } from 'lucide-react';

const c = {
  bg: '#0e0c0a',
  surface: '#1e1b15',
  border: '#2a261e',
  text: '#ede8df',
  textSec: '#a09882',
  textMuted: '#6b6354',
  amber: '#d4a24e',
  amberHover: '#ddb05a',
};

export const HeroSection: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden hero-glow hero-dots">
      <div className="relative z-10 max-w-[1080px] mx-auto px-6">
        {/* Badge */}
        <div className="landing-fade-up landing-delay-1">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[0.7rem] uppercase tracking-wider"
            style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.textSec }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: c.amber, boxShadow: '0 0 8px rgba(212,162,78,0.4)' }}
            />
            Alpha
          </span>
        </div>

        {/* Logo + Name */}
        <div className="flex items-center gap-3.5 mt-6 landing-fade-up landing-delay-2">
          <img
            src="/logo.png"
            alt="AgentPlanner"
            className="w-11 h-11 rounded-[10px]"
            style={{ border: `1px solid ${c.border}` }}
          />
          <h1 className="font-display text-[2rem] font-bold tracking-tight" style={{ color: c.text }}>
            AgentPlanner
          </h1>
        </div>

        {/* Headline */}
        <h2
          className="font-display font-bold leading-[1.1] mt-10 max-w-[700px] landing-fade-up landing-delay-3"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: c.text, letterSpacing: '-0.03em' }}
        >
          The planning backend<br />
          your{' '}
          <span className="relative" style={{ color: c.amber }}>
            AI agents
            <span
              className="absolute bottom-0.5 left-0 right-0 h-[3px] rounded-sm"
              style={{ background: c.amber, opacity: 0.3 }}
            />
          </span>{' '}
          deserve.
        </h2>

        {/* Subtitle */}
        <p
          className="mt-6 max-w-[520px] font-light landing-fade-up landing-delay-4"
          style={{ color: c.textSec, fontSize: '1.05rem', lineHeight: 1.7 }}
        >
          Hierarchical plans, dependency tracking, knowledge graph, and
          real-time sync. Works with Claude, ChatGPT, Cursor, Windsurf, Cline, and any MCP client.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 mt-10 flex-wrap landing-fade-up landing-delay-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:-translate-y-px"
            style={{ background: c.amber, color: c.bg }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = c.amberHover;
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(212,162,78,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = c.amber;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="/api/api-docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200"
            style={{ border: `1px solid ${c.border}`, color: c.textSec, background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = c.textMuted;
              e.currentTarget.style.color = c.text;
              e.currentTarget.style.background = c.surface;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = c.border;
              e.currentTarget.style.color = c.textSec;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Terminal className="w-4 h-4" />
            API Docs
          </a>

          <a
            href="https://github.com/TAgents/agent-planner/blob/main/docs/GETTING_STARTED.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200"
            style={{ border: `1px solid ${c.border}`, color: c.textSec, background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = c.textMuted;
              e.currentTarget.style.color = c.text;
              e.currentTarget.style.background = c.surface;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = c.border;
              e.currentTarget.style.color = c.textSec;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <BookOpen className="w-4 h-4" />
            Docs
          </a>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1 px-3.5 py-2.5 text-sm transition-colors duration-200"
            style={{ color: c.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.color = c.amber; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = c.textMuted; }}
          >
            Explore public plans
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
