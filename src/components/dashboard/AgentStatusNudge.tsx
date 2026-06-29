import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../v1';
import { useConnectedApps } from '../../hooks/useConnectedApps';

/**
 * Mission Control agent-status surface.
 *
 * The platform is inert until an agent is connected, so the ABSENCE state is
 * prominent (a card with a connect CTA) and the connected state stays quiet (a
 * subtle indicator) — per review, this must not become permanent dashboard
 * noise. Connection presence comes from the live /connections/apps list.
 */
const AgentStatusNudge: React.FC = () => {
  const { data, isLoading, isError } = useConnectedApps();
  if (isLoading || isError) return null; // don't flash a "no agent" card before we know

  const apps = data || [];

  if (apps.length === 0) {
    return (
      <Card pad={18} className="mb-6 border-amber/40 bg-amber-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-text">No agent connected</p>
            <p className="mt-1 max-w-[68ch] text-[12px] leading-[1.5] text-text-sec">
              AgentPlanner does its work through a connected agent — planning, gathering knowledge,
              and executing. Nothing runs until you connect one.
            </p>
          </div>
          <Link
            to="/connect"
            className="flex-shrink-0 rounded-lg bg-amber px-4 py-2 text-[13px] font-semibold text-bg hover:opacity-90"
          >
            Connect an agent
          </Link>
        </div>
      </Card>
    );
  }

  // Connected — stay quiet.
  const label =
    apps.length === 1 ? `${apps[0].name} connected` : `${apps.length} agents connected`;
  return (
    <div className="mb-6">
      <Link
        to="/app/settings/connections"
        className="inline-flex items-center gap-2 text-[11px] text-text-muted hover:text-text"
        title="Manage connected apps"
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald" />
        {label}
      </Link>
    </div>
  );
};

export default AgentStatusNudge;
