import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClientTile,
  GhostButton,
  Kicker,
  PrimaryButton,
  SectionHead,
  SnippetBlock,
  StepCard,
  type StepState,
  TestPanel,
  TokenBlock,
} from '../../components/v1';
import { tokenService } from '../../services/api';
import type { ApiToken } from '../../types';
import { useTestConnection, useMcpbRelease } from '../../hooks/useOnboarding';
import {
  CLIENT_CONFIGS,
  CLIENT_ORDER,
  type ClientId,
  inlineToken,
} from './clientConfigs';

/**
 * Three-step onboarding wizard. Soft-locks the dashboard until a
 * successful test-connection roundtrip lands. The "Skip for now" path
 * leaves a persistent banner — handled by the dashboard guard, not
 * this page (banner component lives elsewhere; this page just navigates).
 */
const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientId | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const testConnection = useTestConnection();
  const mcpb = useMcpbRelease();

  // Step 1 done once a client is picked; Step 2 done once a token is in hand;
  // Step 3 done once a successful test-connection lands.
  const step1State: StepState = client ? 'done' : 'active';
  const step2State: StepState = !client ? 'pending' : token ? 'done' : 'active';
  const step3State: StepState =
    !token ? 'pending' : testConnection.state === 'success' ? 'done' : 'active';

  // Auto-load (or auto-create) an API token when step 2 becomes active.
  useEffect(() => {
    if (!client || token || tokenLoading) return;
    let cancelled = false;
    setTokenLoading(true);
    (async () => {
      try {
        const list = (await tokenService.getTokens()) as ApiToken[] | { data: ApiToken[] };
        const tokens = Array.isArray(list) ? list : list?.data || [];
        // Best-effort: reuse the first token whose `token` value we already
        // have (only available immediately after creation). Otherwise
        // create a new "Onboarding" token so we have a value to display.
        const existingWithValue = tokens.find((t) => t.token);
        if (existingWithValue?.token && !cancelled) {
          setToken(existingWithValue.token);
        } else {
          const created = (await tokenService.createToken('Onboarding', ['read'])) as
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
  }, [client, token, tokenLoading]);

  const config = client ? CLIENT_CONFIGS[client] : null;
  const snippetLines = useMemo(() => {
    if (!config || !token) return [];
    return inlineToken(config.lines, token);
  }, [config, token]);

  const onSuccess = () => navigate('/app');
  const onSkip = () => navigate('/app');

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-[760px] px-6 pb-16 pt-12 sm:px-9">
        <header className="mb-10">
          <Kicker className="mb-2">◆ Setup</Kicker>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
            Connect an agent
          </h1>
          <p className="mt-2 max-w-[60ch] text-[13px] leading-[1.55] text-text-sec">
            AgentPlanner is most useful with an AI agent that can read your goals and write back
            what it learns. Pick the client you use, paste a token, and confirm the connection.
          </p>
        </header>

        <StepCard n={1} title="Pick your agent client" state={step1State}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CLIENT_ORDER.map((id) => {
              const c = CLIENT_CONFIGS[id];
              return (
                <ClientTile
                  key={id}
                  glyph={c.glyph}
                  name={c.name}
                  sub={c.sub}
                  recommended={c.recommended}
                  active={client === id}
                  onClick={() => setClient(id)}
                />
              );
            })}
          </div>
        </StepCard>

        <StepCard n={2} title="Get a token" state={step2State}>
          {tokenLoading && (
            <p className="text-xs text-text-muted">Looking for an API token…</p>
          )}
          {tokenError && (
            <p className="text-xs text-red">
              {tokenError}. <button className="underline" onClick={() => setTokenError(null)}>Try again</button>
            </p>
          )}
          {token && <TokenBlock token={token} />}
          {!token && !tokenLoading && !tokenError && (
            <p className="text-xs text-text-muted">Pick a client above to retrieve your token.</p>
          )}
        </StepCard>

        <StepCard n={3} title="Test the connection" state={step3State}>
          {config && token && (
            <>
              {client === 'claude-desktop' && mcpb.data && (
                <div className="mb-3 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-xs text-text-sec">
                  <span>
                    Latest Claude Desktop bundle:{' '}
                    <span className="font-mono text-text">{mcpb.data.version}</span>
                  </span>
                  <a
                    href={mcpb.data.url}
                    className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber hover:opacity-80"
                  >
                    Download .mcpb
                  </a>
                </div>
              )}
              <SnippetBlock comment={config.comment} language={config.language} lines={snippetLines} />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <PrimaryButton onClick={() => testConnection.run()} disabled={testConnection.state === 'loading'}>
                  {testConnection.state === 'loading' ? 'Testing…' : 'Test connection'}
                </PrimaryButton>
                <GhostButton onClick={onSkip}>Skip for now</GhostButton>
              </div>

              {testConnection.result?.ok === true && (
                <TestPanel
                  state="success"
                  briefing={testConnection.result.briefing.cards}
                  provenance={{
                    endpoint: testConnection.result.provenance.endpoint,
                    serverTimeMs: testConnection.result.provenance.server_time_ms,
                    clientLabel:
                      testConnection.result.provenance.client_label || config.name,
                  }}
                />
              )}
              {testConnection.result?.ok === false && (
                <TestPanel
                  state="error"
                  error={testConnection.result.error}
                  onRetry={() => testConnection.run()}
                  onGetHelp={() => window.open('mailto:support@agentplanner.io?subject=Connect%20help', '_blank')}
                />
              )}

              {testConnection.state === 'success' && (
                <div className="mt-6 flex justify-end">
                  <PrimaryButton large onClick={onSuccess}>
                    Continue to dashboard →
                  </PrimaryButton>
                </div>
              )}
            </>
          )}
        </StepCard>
      </div>
    </div>
  );
};

export default Onboarding;
