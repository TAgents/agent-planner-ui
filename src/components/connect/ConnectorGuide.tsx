import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Card, Pill } from '../v1';
import { CONNECTOR_CLIENTS, MCP_CONNECTOR_URL } from '../../pages/onboarding/clientConfigs';
import { useConnectedApps } from '../../hooks/useConnectedApps';

/**
 * Live "Waiting → Connected" strip. Only useful in an authenticated context
 * (it polls /connections/apps), so the connect hub passes `watch` only when the
 * viewer is signed in. Signal = an active OAuth connection exists; we don't yet
 * have per-connection activity to show the stronger "Active" (first tool call)
 * state, so common failure modes are offered as troubleshooting instead.
 */
const ConnectionWatcher: React.FC = () => {
  const { data, isLoading } = useConnectedApps(5_000);
  const apps = data || [];
  const connected = apps.length > 0;

  return (
    <Card pad={16} className={connected ? 'border-emerald/50' : ''}>
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            connected ? 'bg-emerald' : 'bg-amber animate-pulse'
          }`}
        />
        <span className="font-display text-sm font-semibold text-text">
          {connected
            ? apps.length === 1
              ? `Connected — ${apps[0].name}`
              : `Connected — ${apps.length} apps`
            : isLoading
              ? 'Checking for a connection…'
              : 'Waiting for your agent to connect…'}
        </span>
      </div>
      {connected ? (
        <p className="mt-1.5 text-[12px] text-text-sec">
          Your agent can now read and update your workspace. Manage or disconnect it anytime from
          Settings → Connected apps.
        </p>
      ) : (
        <details className="mt-2">
          <summary className="cursor-pointer text-[11px] text-text-muted hover:text-text">
            Not seeing it?
          </summary>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-[11px] leading-[1.45] text-text-muted">
            <li>In a chat, enable AgentPlanner from the + (Connectors) / apps menu.</li>
            <li>Double-check the connector URL above (it must be the exact https URL).</li>
            <li>If you cancelled or mistyped the sign-in, add the connector again and re-authorize.</li>
            <li>Team / Enterprise: an owner may need to add the connector for the org first.</li>
          </ul>
        </details>
      )}
    </Card>
  );
};

/**
 * Connector-first setup guide — the recommended, token-free path.
 *
 * One shared connector URL + per-client steps (Claude, ChatGPT). Reused on the
 * /connect hub and in onboarding so the activation moment is consistent. Copy:
 * "Use this when you want Claude/ChatGPT to access AgentPlanner through a secure
 * remote MCP connector. No API token copy-paste." Pass `watch` (authenticated
 * contexts only) to show a live Waiting → Connected status.
 */
const ConnectorGuide: React.FC<{ watch?: boolean }> = ({ watch = false }) => {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(MCP_CONNECTOR_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Shared connector URL — same for every client. */}
      <Card pad={16}>
        <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-text-muted">
          AgentPlanner connector URL
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-bg/50 px-3 py-2">
          <code className="flex-1 truncate font-mono text-[13px] text-text">{MCP_CONNECTOR_URL}</code>
          <button
            type="button"
            onClick={copyUrl}
            className="flex flex-shrink-0 items-center gap-1 rounded-md border border-border bg-surface-hi px-2 py-1 text-[11px] text-text-sec hover:text-text"
            aria-label="Copy connector URL"
          >
            {copied ? <Check className="h-3 w-3 text-emerald" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-text-muted">
          Same URL for every client. You sign in with your AgentPlanner account — no API token to
          paste, and you can disconnect anytime from Settings → Connected apps.
        </p>
      </Card>

      {/* Per-client steps. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CONNECTOR_CLIENTS.map((c) => (
          <Card key={c.id} pad={18} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-hi font-display text-sm font-bold text-text">
                {c.glyph}
              </span>
              <span className="font-display text-sm font-semibold text-text">{c.name}</span>
              <Pill color="emerald">Recommended</Pill>
            </div>
            <p className="text-[12px] leading-[1.5] text-text-sec">{c.tagline}</p>
            <ol className="flex flex-col gap-1.5">
              {c.steps.map((s, i) => (
                <li key={i} className="flex gap-2 text-[12px] leading-[1.45] text-text">
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-border font-mono text-[9px] text-text-muted">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            {c.teamNote && (
              <p className="rounded-md border border-border bg-bg/40 px-2.5 py-2 text-[11px] leading-[1.45] text-text-muted">
                {c.teamNote}
              </p>
            )}
            {c.enableNote && <p className="text-[11px] leading-[1.45] text-text-muted">↳ {c.enableNote}</p>}
          </Card>
        ))}
      </div>

      {watch && <ConnectionWatcher />}
    </div>
  );
};

export default ConnectorGuide;
