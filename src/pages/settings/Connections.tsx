import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { SettingsNav } from '../../components/settings/SettingsLayout';
import { Card, Kicker, Pill, StatusDot, ClientTile } from '../../components/v1';
import { tokenService } from '../../services/api';
import { useRecentCalls } from '../../hooks/useOnboarding';
import type { ApiToken } from '../../types';
import {
  CLIENT_CONFIGS,
  CLIENT_ORDER,
} from '../onboarding/clientConfigs';
import type { RecentToolCall } from '../../services/onboarding.service';

/** Seconds since timestamp. Used for "X ago" liveness. */
function secondsSince(iso: string | undefined): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
}

function relTime(iso: string | undefined): string {
  if (!iso) return 'never';
  const s = secondsSince(iso);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/**
 * Settings → Connections (v1 redesign of the old Settings → MCP card).
 * Active connections table with 10s live polling, per-client setup tiles
 * linking into the /connect/* pages from Phase 1.
 */
const Connections: React.FC = () => {
  const tokensQ = useQuery<ApiToken[]>({
    queryKey: ['tokens'],
    queryFn: async () => {
      const result = await tokenService.getTokens();
      return Array.isArray(result) ? result : (result as { data: ApiToken[] }).data || [];
    },
  } as any);

  const recent = useRecentCalls({ pollMs: 10_000 });
  const [expanded, setExpanded] = useState<string | null>(null);

  /** Group recent calls by token_id for the per-token expand row. */
  const byToken = useMemo(() => {
    const map = new Map<string, RecentToolCall[]>();
    for (const c of recent.data?.calls || []) {
      if (!c.token_id) continue;
      const arr = map.get(c.token_id) || [];
      arr.push(c);
      map.set(c.token_id, arr);
    }
    return map;
  }, [recent.data]);

  const tokens = (tokensQ.data as ApiToken[] | undefined) || [];

  return (
    <div className="min-h-screen bg-bg text-text">
      <SettingsNav />
      <div className="mx-auto max-w-[1080px] px-6 py-10 sm:px-9">
        <header className="mb-8">
          <Kicker className="mb-2">◆ Settings</Kicker>
          <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-text">
            Connections
          </h1>
          <p className="mt-1 text-[13px] text-text-sec">
            What's calling AgentPlanner on your behalf, and from where.
          </p>
        </header>

        <section className="mb-10">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-[17px] font-semibold tracking-[-0.02em] text-text">
              Active connections
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              ↳ polls every 10s
            </span>
          </div>

          {tokensQ.isLoading && <Card pad={20}>Loading…</Card>}
          {!tokensQ.isLoading && tokens.length === 0 && (
            <Card pad={32}>
              <div className="text-center">
                <p className="font-display text-base font-semibold">No tokens yet</p>
                <p className="mt-2 text-sm text-text-sec">
                  Visit a connect page below to create your first token.
                </p>
              </div>
            </Card>
          )}

          <div className="flex flex-col gap-2">
            {tokens.map((token) => {
              const calls = byToken.get(token.id) || [];
              const lastCall = calls[0];
              const lastSec = lastCall ? secondsSince(lastCall.created_at) : Number.POSITIVE_INFINITY;
              const live = lastSec < 60;
              const stale = lastSec === Number.POSITIVE_INFINITY || lastSec > 5 * 24 * 60 * 60;
              const dotColor = live
                ? 'rgb(var(--emerald) / 1)'
                : stale
                  ? 'rgb(var(--red) / 1)'
                  : 'rgb(var(--slate) / 1)';
              const isExpanded = expanded === token.id;
              return (
                <Card key={token.id} pad={0} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : token.id)}
                    className="grid w-full grid-cols-1 items-center gap-3 px-[18px] py-[14px] text-left hover:bg-surface-hi/40 sm:grid-cols-[minmax(0,1fr)_120px_120px_120px_60px]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusDot color={dotColor} ring={live} ringColor={dotColor} />
                        <span className="truncate font-display text-sm font-semibold text-text">
                          {token.name}
                        </span>
                        {token.permissions?.length ? (
                          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-text-muted">
                            {token.permissions.join(' · ')}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-[2px] font-mono text-[10px] text-text-muted">
                        Created {relTime(token.created_at)}
                      </div>
                    </div>
                    <div className="text-[11px] text-text-sec">
                      <div className="font-mono uppercase text-[8.5px] tracking-[0.14em] text-text-muted">
                        Last call
                      </div>
                      <div className="font-mono text-[11px] text-text">{relTime(lastCall?.created_at)}</div>
                    </div>
                    <div className="text-[11px] text-text-sec">
                      <div className="font-mono uppercase text-[8.5px] tracking-[0.14em] text-text-muted">
                        Status
                      </div>
                      <Pill color={live ? 'emerald' : stale ? 'red' : 'slate'}>
                        {live ? 'Live' : stale ? 'Idle' : 'Recent'}
                      </Pill>
                    </div>
                    <div className="text-[11px] text-text-sec">
                      <div className="font-mono uppercase text-[8.5px] tracking-[0.14em] text-text-muted">
                        Origin
                      </div>
                      <div className="font-mono text-[11px] text-text">{lastCall?.client_label || '—'}</div>
                    </div>
                    <div className="text-right text-[11px] text-text-muted font-mono">
                      {isExpanded ? '▴' : '▾'}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border bg-bg/50 px-[18px] py-[12px]">
                      {calls.length === 0 ? (
                        <p className="text-xs text-text-muted">
                          No calls yet on this token. After your client connects, recent calls show up here.
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-[6px]">
                          {calls.slice(0, 8).map((c) => (
                            <li
                              key={c.id}
                              className="grid grid-cols-[120px_1fr_60px_80px] items-center gap-3 font-mono text-[11px]"
                            >
                              <span className="text-text-muted">{relTime(c.created_at)}</span>
                              <span className="truncate text-text">{c.tool_name}</span>
                              <span className="text-text-sec">{c.duration_ms ?? '—'}ms</span>
                              <Pill color={c.response_status && c.response_status >= 400 ? 'red' : 'slate'}>
                                {c.response_status ?? '—'}
                              </Pill>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-[17px] font-semibold tracking-[-0.02em] text-text">
              Set up a client
            </h2>
            <Link
              to="/onboarding"
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted hover:text-text"
            >
              Open onboarding →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CLIENT_ORDER.map((id) => {
              const c = CLIENT_CONFIGS[id];
              return (
                <Link key={id} to={`/connect/${id}`}>
                  <ClientTile glyph={c.glyph} name={c.name} sub={c.sub} recommended={c.recommended} compact />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Connections;
