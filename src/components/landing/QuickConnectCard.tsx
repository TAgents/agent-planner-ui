import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SnippetBlock } from '../v1';
import { CLIENT_CONFIGS, CLIENT_ORDER, inlineToken, type ClientId } from '../../pages/onboarding/clientConfigs';

/**
 * Hero quick-connect card (structure from the "AgentPlanner Flow v2" design):
 * client chips → per-client snippet → the token/test handoff. The landing is
 * anonymous, so the snippet carries a placeholder token and the "get your
 * token & test" step routes into /connect/:client, which owns token
 * generation and the live connection test.
 */
const QuickConnectCard: React.FC = () => {
  const [clientId, setClientId] = useState<ClientId>('claude-desktop');
  const client = CLIENT_CONFIGS[clientId];

  // Prefer the one-line CLI variant where a client has one — it's the paste
  // path the connect pages recommend too.
  const snippet = useMemo(() => {
    const src = client.cli ?? client;
    return {
      comment: src.comment ?? client.comment,
      language: src.language ?? client.language,
      lines: inlineToken(src.lines, 'your_api_token_here'),
    };
  }, [client]);

  return (
    <div className="overflow-hidden rounded-xl border border-border-hi bg-surface text-left">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-hi px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-sec">
          <span aria-hidden className="h-[6px] w-[6px] animate-pulse rounded-full bg-emerald" />
          Quick connect
        </span>
        <span className="font-mono text-[10px] text-text-muted">60 seconds, one paste</span>
      </div>

      <div className="p-4">
        {/* Client chips */}
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Choose your agent client">
          {CLIENT_ORDER.map((id) => {
            const c = CLIENT_CONFIGS[id];
            const active = id === clientId;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setClientId(id)}
                className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  active
                    ? 'border-amber bg-amber-soft text-amber'
                    : 'border-border bg-bg text-text-sec hover:border-border-hi hover:text-text'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Per-client snippet */}
        <div className="mt-4">
          <SnippetBlock comment={snippet.comment} language={snippet.language} lines={snippet.lines} />
        </div>

        {/* Token + test handoff — auth lives on /connect/:client */}
        <Link
          to={client.connectPath}
          className="mt-3 block w-full rounded-lg bg-amber px-4 py-2.5 text-center font-medium text-bg transition-opacity hover:opacity-90"
        >
          Get your token &amp; test the connection →
        </Link>
        <p className="mt-2.5 text-center font-mono text-[10px] text-text-muted">
          Full guide for {client.name} on the next page · free in alpha
        </p>
      </div>
    </div>
  );
};

export default QuickConnectCard;
