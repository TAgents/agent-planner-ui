import React from 'react';
import { Link } from 'react-router-dom';
import { ClientTile, Kicker } from '../../components/v1';
import { CLIENT_CONFIGS, CLIENT_ORDER } from '../onboarding/clientConfigs';

/**
 * Standalone client picker landing — exposed at /connect for marketing
 * deep-links and as a fallback when /connect/:client is hit without a
 * valid client id. Authenticated users still get the full /onboarding
 * wizard (3-step + token + test); this page is the no-funnel version.
 */
const ConnectIndex: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface px-6 py-4 sm:px-9">
        <div className="mx-auto flex max-w-[920px] items-center justify-between">
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted hover:text-text"
          >
            ← AgentPlanner
          </Link>
          <Link
            to="/login"
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted hover:text-text"
          >
            Sign in →
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[920px] px-6 pb-16 pt-12 sm:px-9">
        <div className="mb-10 max-w-[60ch]">
          <Kicker className="mb-2">◆ Connect</Kicker>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
            Pick your AI client
          </h1>
          <p className="mt-2 text-[13px] leading-[1.55] text-text-sec">
            AgentPlanner is most useful with an AI agent that can read your goals and write back
            what it learns. Each guide gets you connected in about a minute.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CLIENT_ORDER.map((id) => {
            const c = CLIENT_CONFIGS[id];
            return (
              <Link key={id} to={`/connect/${id}`} className="block">
                <ClientTile glyph={c.glyph} name={c.name} sub={c.sub} recommended={c.recommended} />
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-[12px] text-text-sec">
          Already have an account?{' '}
          <Link to="/onboarding" className="text-text underline underline-offset-2">
            Open the guided wizard
          </Link>{' '}
          — it auto-creates a token and runs a live test against your workspace.
        </p>
      </div>
    </div>
  );
};

export default ConnectIndex;
