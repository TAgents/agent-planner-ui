import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Kicker, Pill } from '../../components/v1';
import { useConnectedApps, useDisconnectApp } from '../../hooks/useConnectedApps';
import type { ConnectedApp } from '../../services/connections.service';

/** "X ago" / absolute date for connected-since. */
function relTime(iso: string | undefined): string {
  if (!iso) return 'unknown';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 30 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function absDate(iso: string | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Monogram avatar from the connector type / app name. */
function glyphFor(app: ConnectedApp): string {
  const t = (app.type || app.name || '?').trim();
  return t[0]?.toUpperCase() || '?';
}

/**
 * Settings → Connected apps.
 *
 * A security / access-control panel: the external apps (Claude, ChatGPT, any
 * MCP client) that have an active OAuth connection and can act on your behalf.
 * Connector-agnostic — each row is driven by the registered client name, so new
 * connectors appear with no per-vendor code. API tokens are the separate,
 * advanced path (Settings → API tokens).
 */
const Connections: React.FC = () => {
  const appsQ = useConnectedApps();
  const disconnect = useDisconnectApp();
  const apps = appsQ.data || [];

  const handleDisconnect = (app: ConnectedApp) => {
    const ok = window.confirm(
      `Disconnect “${app.name}”?\n\n` +
        `It will lose access to your AgentPlanner workspace within an hour, and any agent running through it will stop. ` +
        `You can reconnect it anytime.`,
    );
    if (!ok) return;
    disconnect.mutate(app.client_id);
  };

  return (
    <section className="flex flex-col gap-5">
      <header>
        <Kicker className="mb-2">◆ Security</Kicker>
        <h1 className="font-display text-[22px] font-bold tracking-[-0.03em] text-text">
          Connected apps
        </h1>
        <p className="mt-1 text-[13px] text-text-sec">
          External apps that can read and act in your workspace on your behalf, through the
          AgentPlanner connector. Disconnect any you don’t recognize.
        </p>
      </header>

      {appsQ.isLoading && <Card pad={20}>Loading…</Card>}

      {appsQ.isError && (
        <Card pad={20}>
          <p className="text-[13px] text-red">Couldn’t load connected apps. Try again shortly.</p>
        </Card>
      )}

      {!appsQ.isLoading && !appsQ.isError && apps.length === 0 && (
        <Card pad={28}>
          <div className="text-center">
            <p className="font-display text-base font-semibold text-text">No apps connected</p>
            <p className="mx-auto mt-2 max-w-md text-[13px] text-text-sec">
              AgentPlanner does its work through a connected agent. Connect Claude, ChatGPT, or
              another MCP client to let it read and update your plans, goals, and tasks.
            </p>
            <Link
              to="/connect"
              className="mt-4 inline-block rounded-lg bg-amber px-4 py-2 text-[13px] font-semibold text-bg hover:opacity-90"
            >
              Connect an app
            </Link>
          </div>
        </Card>
      )}

      {apps.length > 0 && (
        <div className="flex flex-col gap-2">
          {apps.map((app) => {
            const caps = app.capabilities;
            const areas = caps?.write?.length ? caps.write : caps?.read || [];
            const canWrite = (caps?.write?.length ?? 0) > 0;
            return (
              <Card key={app.client_id} pad={0} className="overflow-hidden">
                <div className="flex flex-col gap-4 px-[18px] py-[16px] sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface-hi font-display text-sm font-bold text-text">
                      {glyphFor(app)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-sm font-semibold text-text">{app.name}</span>
                        <Pill color="slate">{app.type}</Pill>
                        <Pill color="emerald">Connected</Pill>
                      </div>

                      <div className="mt-1 text-[11px] text-text-muted">
                        Connected {relTime(app.connected_at)}
                        {app.connected_at ? ` · ${absDate(app.connected_at)}` : ''}
                        {' · acts as you'}
                      </div>

                      {/* Plain-language capabilities — what it can read / change. */}
                      <div className="mt-3">
                        <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-text-muted">
                          {canWrite ? 'Can read & update' : 'Can read'}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {areas.length > 0 ? (
                            areas.map((a) => (
                              <span
                                key={a}
                                className="rounded-md border border-border bg-bg/50 px-1.5 py-0.5 text-[11px] capitalize text-text-sec"
                              >
                                {a}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-text-sec">{caps?.summary}</span>
                          )}
                        </div>
                        <p className="mt-2 text-[11px] text-text-muted">
                          Access refreshes automatically while connected; disconnecting stops it
                          within an hour.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 sm:pl-4">
                    <button
                      type="button"
                      onClick={() => handleDisconnect(app)}
                      disabled={disconnect.isLoading}
                      className="rounded-lg border border-red/40 px-3 py-1.5 text-[12px] font-medium text-red hover:bg-red/10 disabled:opacity-50"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <footer className="flex flex-wrap items-center gap-4 pt-1 text-[11px]">
        <Link to="/connect" className="font-mono uppercase tracking-[0.12em] text-text-muted hover:text-text">
          Connect another app →
        </Link>
        <Link
          to="/app/settings/tokens"
          className="font-mono uppercase tracking-[0.12em] text-text-muted hover:text-text"
        >
          API tokens (advanced) →
        </Link>
      </footer>
    </section>
  );
};

export default Connections;
