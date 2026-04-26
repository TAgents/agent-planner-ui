import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ClientTile,
  GhostButton,
  Kicker,
  PrimaryButton,
  SnippetBlock,
  TestPanel,
  TokenBlock,
} from '../../components/v1';
import { tokenService } from '../../services/api';
import type { ApiToken } from '../../types';
import {
  useMcpbRelease,
  useTestConnection,
} from '../../hooks/useOnboarding';
import {
  CLIENT_CONFIGS,
  CLIENT_ORDER,
  type ClientId,
  inlineToken,
} from '../onboarding/clientConfigs';

const isClientId = (s: string | undefined): s is ClientId =>
  !!s && (CLIENT_ORDER as string[]).includes(s);

/**
 * Per-client connect page. Composed shell: header (glyph + kicker +
 * title + sub) → token block → snippet → test → alt-clients footer.
 * Mounted as /connect/:client and reused for all five clients.
 */
const ConnectPage: React.FC = () => {
  const params = useParams<{ client: string }>();
  const clientId = isClientId(params.client) ? params.client : null;

  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const testConnection = useTestConnection();
  const mcpb = useMcpbRelease();

  useEffect(() => {
    if (!clientId || token || tokenLoading) return;
    let cancelled = false;
    setTokenLoading(true);
    (async () => {
      try {
        const list = (await tokenService.getTokens()) as ApiToken[] | { data: ApiToken[] };
        const tokens = Array.isArray(list) ? list : list?.data || [];
        const existing = tokens.find((t) => t.token);
        if (existing?.token && !cancelled) {
          setToken(existing.token);
        } else {
          const created = (await tokenService.createToken(`Connect — ${clientId}`, ['read'])) as
            | ApiToken
            | { data: ApiToken };
          const next = 'data' in created ? created.data : created;
          if (!cancelled) setToken(next.token || null);
        }
      } catch (err: any) {
        if (!cancelled) setTokenError(err?.message || 'Could not retrieve a token');
      } finally {
        if (!cancelled) setTokenLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientId, token, tokenLoading]);

  const config = clientId ? CLIENT_CONFIGS[clientId] : null;
  const snippetLines = useMemo(
    () => (config && token ? inlineToken(config.lines, token) : []),
    [config, token],
  );

  if (!clientId || !config) {
    return <Navigate to="/onboarding" replace />;
  }

  const altClients = CLIENT_ORDER.filter((id) => id !== clientId);

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface px-6 py-4 sm:px-9">
        <div className="mx-auto flex max-w-[760px] items-center justify-between">
          <Link
            to="/app"
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted hover:text-text"
          >
            ← AgentPlanner
          </Link>
          <Link
            to="/onboarding"
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted hover:text-text"
          >
            All clients →
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[760px] px-6 pb-16 pt-12 sm:px-9">
        <div className="mb-10 flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-amber font-display text-xl font-bold tracking-[-0.04em] text-bg">
            {config.glyph}
          </span>
          <div>
            <Kicker className="mb-1">◆ Connect</Kicker>
            <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-text">
              {config.name}
            </h1>
            <p className="mt-1 text-[13px] text-text-sec">{config.sub}</p>
          </div>
        </div>

        {clientId === 'claude-desktop' && mcpb.data && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-border bg-surface px-4 py-3 text-xs text-text-sec">
            <span>
              Latest bundle:{' '}
              <span className="font-mono text-text">{mcpb.data.version}</span>
              {mcpb.data.published_at && (
                <span className="text-text-muted"> · {new Date(mcpb.data.published_at).toDateString()}</span>
              )}
            </span>
            <a
              href={mcpb.data.url}
              className="rounded-md bg-amber px-3 py-[6px] font-display text-xs font-semibold text-bg hover:opacity-90"
            >
              Download .mcpb
            </a>
          </div>
        )}

        <section className="mb-7">
          <h2 className="mb-3 font-display text-[15px] font-semibold tracking-[-0.01em] text-text">
            1 · Your API token
          </h2>
          {tokenLoading && <p className="text-xs text-text-muted">Looking for an API token…</p>}
          {tokenError && (
            <p className="text-xs text-red">
              {tokenError}.{' '}
              <button className="underline" onClick={() => setTokenError(null)}>
                Try again
              </button>
            </p>
          )}
          {token && <TokenBlock token={token} />}
        </section>

        <section className="mb-7">
          <h2 className="mb-3 font-display text-[15px] font-semibold tracking-[-0.01em] text-text">
            2 · Configure {config.name}
          </h2>
          {token ? (
            <SnippetBlock
              comment={config.comment}
              language={config.language}
              lines={snippetLines}
            />
          ) : (
            <p className="text-xs text-text-muted">Token will appear above when ready.</p>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-[15px] font-semibold tracking-[-0.01em] text-text">
            3 · Test the connection
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton
              onClick={() => testConnection.run()}
              disabled={!token || testConnection.state === 'loading'}
            >
              {testConnection.state === 'loading' ? 'Testing…' : 'Test connection'}
            </PrimaryButton>
            <GhostButton
              onClick={() =>
                window.open('mailto:support@agentplanner.io?subject=Connect%20help', '_blank')
              }
            >
              Get help
            </GhostButton>
          </div>

          {testConnection.result?.ok === true && (
            <TestPanel
              state="success"
              briefing={testConnection.result.briefing.cards}
              provenance={{
                endpoint: testConnection.result.provenance.endpoint,
                serverTimeMs: testConnection.result.provenance.server_time_ms,
                clientLabel: testConnection.result.provenance.client_label || config.name,
              }}
            />
          )}
          {testConnection.result?.ok === false && (
            <TestPanel
              state="error"
              error={testConnection.result.error}
              onRetry={() => testConnection.run()}
            />
          )}
        </section>

        <section className="mt-12 border-t border-border pt-8">
          <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            ◇ Other clients
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {altClients.map((id) => {
              const c = CLIENT_CONFIGS[id];
              return (
                <Link key={id} to={`/connect/${id}`}>
                  <ClientTile
                    glyph={c.glyph}
                    name={c.name}
                    sub={c.sub}
                    recommended={c.recommended}
                    compact
                  />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ConnectPage;
