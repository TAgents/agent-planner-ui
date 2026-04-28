import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill, type PillColor } from '../../components/v1';
import { useRecentCalls } from '../../hooks/useOnboarding';
import { useTokens } from '../../hooks/useTokens';
import type { ApiToken, TokenPermission } from '../../types';
import type { RecentToolCall } from '../../services/onboarding.service';

const REFRESH_MS = 10_000;

function formatRelative(d: string): string {
  const ms = Date.now() - new Date(d).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type ConnectionStatus = 'live' | 'idle' | 'never';
const STATUS_LABEL: Record<ConnectionStatus, string> = {
  live: 'LIVE',
  idle: 'IDLE',
  never: 'NEVER USED',
};
const STATUS_DOT: Record<ConnectionStatus, string> = {
  live: 'bg-emerald',
  idle: 'bg-text-muted/60',
  never: 'bg-red',
};

const PERMISSION_TONE: Record<TokenPermission, PillColor> = {
  admin: 'amber',
  write: 'violet',
  read: 'emerald',
};

type ClientFilter = 'all' | 'claude-desktop' | 'claude-code' | 'cursor' | 'openclaw' | 'chatgpt';

const CLIENT_TABS: { id: ClientFilter; label: string; glyph: string; match: (label: string) => boolean }[] = [
  { id: 'all', label: 'Active connections', glyph: '◇', match: () => true },
  { id: 'claude-desktop', label: 'Claude Desktop', glyph: 'CD', match: (l) => /claude\s*desktop/i.test(l) },
  { id: 'claude-code', label: 'Claude Code', glyph: 'CC', match: (l) => /claude\s*code/i.test(l) },
  { id: 'cursor', label: 'Cursor', glyph: 'C', match: (l) => /cursor/i.test(l) },
  { id: 'openclaw', label: 'OpenClaw', glyph: 'OC', match: (l) => /openclaw/i.test(l) },
  { id: 'chatgpt', label: 'ChatGPT', glyph: 'GPT', match: (l) => /chatgpt|openai|gpt/i.test(l) },
];

type Connection = {
  token: ApiToken;
  status: ConnectionStatus;
  lastCall?: RecentToolCall;
  recentCalls: RecentToolCall[];
  weekCount: number;
  origin: string;
  clientGlyph: string;
};

/** Derive per-token connection state from the live tool_calls feed. */
function buildConnections(
  tokens: ApiToken[],
  calls: RecentToolCall[],
): Connection[] {
  const callsByToken = new Map<string, RecentToolCall[]>();
  for (const c of calls) {
    if (!c.token_id) continue;
    const arr = callsByToken.get(c.token_id) || [];
    arr.push(c);
    callsByToken.set(c.token_id, arr);
  }

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const oneMin = 60 * 1000;
  const oneDay = 24 * 60 * 60 * 1000;

  return tokens.map((token) => {
    const tCalls = (callsByToken.get(token.id) || []).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const lastCall = tCalls[0];
    const lastCallAt = lastCall ? new Date(lastCall.created_at).getTime() : null;
    let status: ConnectionStatus = 'never';
    if (lastCallAt && Date.now() - lastCallAt < oneMin) status = 'live';
    else if (lastCallAt && Date.now() - lastCallAt < oneDay) status = 'idle';
    else if (token.last_used) status = 'idle';

    const weekCount = tCalls.filter((c) => new Date(c.created_at).getTime() > weekAgo).length;
    const origin = lastCall?.client_label || (token.last_used ? 'Unknown client' : '—');
    const matchedTab = CLIENT_TABS.find((t) => t.id !== 'all' && t.match(origin));
    const clientGlyph = matchedTab?.glyph || '◇';

    return { token, status, lastCall, recentCalls: tCalls, weekCount, origin, clientGlyph };
  });
}

/**
 * Settings → Integrations · Connected agents.
 *
 * Hybrid table of live token sessions: one row per API token with a
 * last-call timestamp, status dot, origin label, 7-day call count, and
 * an inline expandable detail row that lists recent tool_calls and
 * exposes Rotate/Test/Revoke actions. Polls /onboarding/recent-calls
 * every 10s — that's the trust layer the design calls out.
 */
const IntegrationsSettings: React.FC = () => {
  const { tokens, loading: tokensLoading, revokeToken } = useTokens();
  const callsQ = useRecentCalls({ pollMs: REFRESH_MS });
  const calls = (callsQ.data?.calls || []) as RecentToolCall[];

  const [tab, setTab] = useState<ClientFilter>('all');
  const [sort, setSort] = useState<'last_seen' | 'calls' | 'name'>('last_seen');
  const [filter, setFilter] = useState<'all' | 'live' | 'idle' | 'never'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const allConnections = useMemo(() => buildConnections(tokens, calls), [tokens, calls]);

  const filtered = useMemo(() => {
    let list = allConnections;
    if (tab !== 'all') {
      const matcher = CLIENT_TABS.find((t) => t.id === tab)?.match || (() => true);
      list = list.filter((c) => matcher(c.origin));
    }
    if (filter !== 'all') list = list.filter((c) => c.status === filter);
    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.token.name.localeCompare(b.token.name);
      if (sort === 'calls') return b.weekCount - a.weekCount;
      const at = a.lastCall ? new Date(a.lastCall.created_at).getTime() : 0;
      const bt = b.lastCall ? new Date(b.lastCall.created_at).getTime() : 0;
      return bt - at;
    });
    return list;
  }, [allConnections, tab, filter, sort]);

  const totals = useMemo(() => {
    let connected = 0;
    let idle = 0;
    let never = 0;
    for (const c of allConnections) {
      if (c.status === 'live') connected += 1;
      else if (c.status === 'idle') idle += 1;
      else never += 1;
    }
    return { connected, idle, never };
  }, [allConnections]);

  const tabCounts = useMemo(() => {
    const counts: Record<ClientFilter, number> = {
      all: allConnections.length,
      'claude-desktop': 0,
      'claude-code': 0,
      cursor: 0,
      openclaw: 0,
      chatgpt: 0,
    };
    for (const c of allConnections) {
      for (const t of CLIENT_TABS) {
        if (t.id !== 'all' && t.match(c.origin)) counts[t.id] += 1;
      }
    }
    return counts;
  }, [allConnections]);

  const handleRevoke = (tokenId: string, name: string) => {
    if (!window.confirm(`Revoke token "${name}"? Existing agents using it will be disconnected.`)) return;
    revokeToken(tokenId);
    if (expanded === tokenId) setExpanded(null);
  };

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
            ◇ Integrations
          </span>
          <h1 className="mt-1.5 font-display text-[26px] font-bold tracking-[-0.03em] text-text">
            Connected agents
          </h1>
          <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-sec">
            {totals.connected} connected · {totals.idle} idle · {totals.never} token{totals.never === 1 ? '' : 's'} never used
          </p>
        </div>
        <Link
          to="/connect"
          className="rounded-md bg-amber px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90"
        >
          + Connect a new agent
        </Link>
      </header>

      {/* Per-client tabs */}
      <nav className="flex flex-wrap items-center gap-x-1 gap-y-1 border-b border-border">
        {CLIENT_TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 transition-colors ${
                active
                  ? 'border-amber text-text'
                  : 'border-transparent text-text-muted hover:text-text-sec'
              }`}
            >
              <span
                className={`flex h-5 min-w-[20px] items-center justify-center rounded border px-1 font-mono text-[8.5px] font-bold uppercase ${
                  active ? 'border-amber/60 bg-amber/10 text-amber' : 'border-border bg-surface text-text-muted'
                }`}
              >
                {t.glyph}
              </span>
              <span className="font-display text-[12px] font-semibold tracking-tight">
                {t.label}
              </span>
              <span className={`font-mono text-[10px] tabular-nums ${active ? 'text-amber' : 'text-text-muted'}`}>
                {tabCounts[t.id]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Live indicator + filter/sort row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-sec">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
          Live · refreshes every {REFRESH_MS / 1000}s
        </span>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
          <label className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-text-sec">
            <span className="text-text-muted">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent text-text outline-none"
            >
              <option value="all">All</option>
              <option value="live">Live</option>
              <option value="idle">Idle</option>
              <option value="never">Never used</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-text-sec">
            <span className="text-text-muted">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-transparent text-text outline-none"
            >
              <option value="last_seen">Last seen</option>
              <option value="calls">Calls</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
      </div>

      {/* Hybrid table */}
      <div className="rounded-md border border-border bg-surface">
        <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_0.8fr_36px] gap-3 border-b border-border px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
          <span>Token</span>
          <span>Last call</span>
          <span>Status</span>
          <span>Origin</span>
          <span className="text-right">7-day calls</span>
          <span />
        </div>

        {tokensLoading ? (
          <p className="px-4 py-6 text-center text-[12px] text-text-muted">Loading tokens…</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-[12px] text-text-sec">
            No connections match this filter.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((c) => (
              <ConnectionRow
                key={c.token.id}
                conn={c}
                expanded={expanded === c.token.id}
                onToggle={() => setExpanded(expanded === c.token.id ? null : c.token.id)}
                onRevoke={() => handleRevoke(c.token.id, c.token.name)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">
        <span>Telemetry powered by tool_calls table · last 90 days</span>
        <Link to="/app/settings/tokens" className="text-text-sec hover:text-text">
          Manage API tokens →
        </Link>
      </div>
    </section>
  );
};

const ConnectionRow: React.FC<{
  conn: Connection;
  expanded: boolean;
  onToggle: () => void;
  onRevoke: () => void;
}> = ({ conn, expanded, onToggle, onRevoke }) => {
  const { token, status, lastCall, recentCalls, weekCount, origin, clientGlyph } = conn;
  const primaryPerm = (token.permissions || [])[0] || 'read';

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full grid-cols-[2fr_1fr_1fr_1.5fr_0.8fr_36px] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hi/40"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-mono text-[12.5px] text-text">{token.name}</span>
            <Pill color={PERMISSION_TONE[primaryPerm]}>{primaryPerm}</Pill>
          </div>
          <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
            created {new Date(token.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="min-w-0">
          {lastCall ? (
            <>
              <span className="block truncate font-mono text-[12px] text-text">{lastCall.tool_name}()</span>
              <span className="block font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
                {formatRelative(lastCall.created_at)}
              </span>
            </>
          ) : (
            <>
              <span className="block font-mono text-[12px] text-text-muted">—</span>
              <span className="block font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
                never
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-sec">
            {STATUS_LABEL[status]}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded border border-border bg-bg px-1 font-mono text-[8.5px] uppercase text-text-muted">
              {clientGlyph}
            </span>
            <span className="truncate font-mono text-[12px] text-text">{origin}</span>
          </div>
          {lastCall?.ip && (
            <span className="block truncate font-mono text-[9.5px] text-text-muted">{lastCall.ip}</span>
          )}
        </div>
        <div className="text-right">
          <span className="block font-display text-[16px] font-bold tabular-nums text-text">
            {weekCount}
          </span>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
            calls
          </span>
        </div>
        <span
          aria-hidden
          className={`inline-flex h-6 w-6 items-center justify-center rounded text-text-muted transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div className="grid gap-4 border-t border-border bg-bg/40 px-4 py-3 md:grid-cols-[1.6fr_1fr]">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
              Recent tool calls
            </span>
            {recentCalls.length === 0 ? (
              <p className="mt-2 text-[12px] text-text-sec">
                No calls yet on this token. Run any MCP tool to see it stream in here.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {recentCalls.slice(0, 4).map((c) => (
                  <li
                    key={c.id}
                    className="grid grid-cols-[80px_1fr_60px] items-baseline gap-2 font-mono text-[11.5px]"
                  >
                    <span className="text-text-muted">{formatRelative(c.created_at)}</span>
                    <span className="truncate text-text">
                      <span className="text-amber">{c.tool_name}</span>
                      <span className="text-text-muted"> ()</span>
                    </span>
                    <span className="text-right text-text-muted">
                      {c.duration_ms != null ? `${c.duration_ms}ms` : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
              Actions
            </span>
            <div className="mt-2 flex flex-col gap-1.5">
              <Link
                to="/app/settings/tokens"
                className="rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text transition-colors hover:bg-surface-hi"
              >
                Rotate token →
              </Link>
              <Link
                to="/connect"
                className="rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text transition-colors hover:bg-surface-hi"
              >
                Test connection
              </Link>
              <Link
                to="/app/settings/tokens"
                className="rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text transition-colors hover:bg-surface-hi"
              >
                Edit permissions
              </Link>
              <button
                type="button"
                onClick={onRevoke}
                className="rounded-md border border-red/30 bg-red/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-red transition-colors hover:bg-red/10"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default IntegrationsSettings;
