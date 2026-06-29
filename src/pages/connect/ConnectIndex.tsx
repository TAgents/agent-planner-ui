import React from 'react';
import { Link } from 'react-router-dom';
import { ClientTile, Kicker } from '../../components/v1';
import ConnectorGuide from '../../components/connect/ConnectorGuide';
import { CLIENT_CONFIGS, TOKEN_CLIENT_ORDER } from '../onboarding/clientConfigs';

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
        <div className="mb-8 max-w-[60ch]">
          <Kicker className="mb-2">◆ Connect</Kicker>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
            Connect your AI agent
          </h1>
          <p className="mt-2 text-[13px] leading-[1.55] text-text-sec">
            AgentPlanner does its work through an AI agent that can read your goals and write back
            what it learns. The quickest way is the connector — paste one URL and sign in.
          </p>
        </div>

        {/* Primary path — connector (no token). */}
        <section className="mb-12">
          <h2 className="mb-3 font-display text-[16px] font-semibold tracking-[-0.02em] text-text">
            Connect with the AgentPlanner connector
          </h2>
          <ConnectorGuide />
        </section>

        {/* Secondary path — token-based / local clients. */}
        <section>
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="font-display text-[16px] font-semibold tracking-[-0.02em] text-text">
              Advanced — connect with a token
            </h2>
            <Link
              to="/onboarding"
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted hover:text-text"
            >
              Guided wizard →
            </Link>
          </div>
          <p className="mb-4 max-w-[60ch] text-[12px] leading-[1.55] text-text-sec">
            For MCP clients that connect with a header token or run locally — Claude Code, Cursor,
            and stdio setups. These create an API token you paste into the client.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TOKEN_CLIENT_ORDER.map((id) => {
              const c = CLIENT_CONFIGS[id];
              return (
                <Link key={id} to={`/connect/${id}`} className="block">
                  <ClientTile glyph={c.glyph} name={c.name} sub={c.sub} compact />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ConnectIndex;
