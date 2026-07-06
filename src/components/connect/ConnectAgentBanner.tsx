import React from 'react';
import { Link } from 'react-router-dom';
import { useConnectedApps } from '../../hooks/useConnectedApps';
import { useRecentCalls } from '../../hooks/useOnboarding';
import { useTokens } from '../../hooks/useTokens';

const CLIENTS = ['Claude Code', 'Claude Desktop', 'Cursor', 'ChatGPT', 'Windsurf'];

/**
 * Mission Control activation banner. AgentPlanner does its real work through a
 * connected AI agent, so until the user has wired one up we surface a prominent
 * "connect your agent" call to action at the top of the dashboard. It removes
 * itself the moment a connection exists — either an OAuth connector app or any
 * recent MCP tool call from a token-based client. Polls slowly (60s) so a fresh
 * connection made in another tab clears the banner without hammering the API.
 */
const ConnectAgentBanner: React.FC = () => {
  const apps = useConnectedApps(60_000);
  const calls = useRecentCalls({ pollMs: 60_000 });
  const { tokens, loading: tokensLoading, error: tokensError } = useTokens();

  // Don't flash the banner for already-connected users: wait for the first
  // fetch of every signal to settle before deciding to show anything.
  if (apps.isLoading || calls.isLoading || tokensLoading) return null;

  // Fail closed: if a signal errored we can't confirm the user is NOT
  // connected, so don't nag them with the onboarding CTA on a transient blip.
  if (apps.isError || calls.isError || tokensError) return null;

  const hasConnectedApp = (apps.data?.length ?? 0) > 0; // OAuth connector (Claude/ChatGPT)
  const hasRecentCalls = (calls.data?.calls?.length ?? 0) > 0; // recent MCP tool activity
  const hasApiToken = (tokens?.length ?? 0) > 0; // token-based client (Claude Code/Cursor) set up
  if (hasConnectedApp || hasRecentCalls || hasApiToken) return null;

  return (
    <section className="mb-8 overflow-hidden rounded-[10px] border border-amber/40 bg-surface">
      <div className="flex flex-col gap-4 border-l-2 border-amber p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-amber">
            ◆ Connect your agent
          </span>
          <h2 className="mt-2 font-display text-[19px] font-semibold tracking-[-0.02em] text-text">
            Connect your agent to start
          </h2>
          <p className="mt-1 max-w-[64ch] text-[13px] leading-[1.55] text-text-sec">
            AgentPlanner does its work through an AI agent that reads your goals and writes back
            what it learns. Point Claude, Cursor, ChatGPT, or any MCP client at your workspace —
            one paste, about 60 seconds.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CLIENTS.map((n) => (
              <span
                key={n}
                className="rounded border border-border bg-surface-hi px-2 py-0.5 font-mono text-[10px] text-text-muted"
              >
                {n}
              </span>
            ))}
            <span className="rounded border border-border bg-surface-hi px-2 py-0.5 font-mono text-[10px] text-text-muted">
              + any MCP client
            </span>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          <Link
            to="/connect"
            className="rounded-md bg-amber px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-bg transition-opacity hover:opacity-90"
          >
            Connect an agent →
          </Link>
          <Link
            to="/app/settings/tokens"
            className="rounded-md border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text transition-colors hover:bg-surface-hi"
          >
            Create a token
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ConnectAgentBanner;
