import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Card, Pill } from '../v1';
import { CONNECTOR_CLIENTS, MCP_CONNECTOR_URL } from '../../pages/onboarding/clientConfigs';

/**
 * Connector-first setup guide — the recommended, token-free path.
 *
 * One shared connector URL + per-client steps (Claude, ChatGPT). Reused on the
 * /connect hub and in onboarding so the activation moment is consistent. Copy:
 * "Use this when you want Claude/ChatGPT to access AgentPlanner through a secure
 * remote MCP connector. No API token copy-paste."
 */
const ConnectorGuide: React.FC = () => {
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
    </div>
  );
};

export default ConnectorGuide;
