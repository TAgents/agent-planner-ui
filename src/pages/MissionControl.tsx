import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Kicker,
  Pill,
  ProposedChip,
  SectionHead,
  Spark,
  StatusDot,
  type PillColor,
} from '../components/v1';
import {
  useActiveGoals,
  useDashboardSummary,
  usePendingItems,
  useRecentPlans,
  useVelocity,
} from '../hooks/useDashboard';

function statusColor(status?: string): PillColor {
  if (!status) return 'slate';
  if (status === 'on_track' || status === 'active' || status === 'completed') return 'emerald';
  if (status === 'at_risk' || status === 'in_progress') return 'amber';
  if (status === 'stale' || status === 'blocked' || status === 'paused') return 'red';
  return 'slate';
}

function relTime(iso?: string): string {
  if (!iso) return 'never';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const StatCard: React.FC<{ label: string; value: React.ReactNode; sub?: string }> = ({
  label,
  value,
  sub,
}) => (
  <Card pad={16}>
    <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-text-muted">
      {label}
    </span>
    <span className="mt-1 block font-display text-[28px] font-bold tracking-[-0.04em] text-text">
      {value}
    </span>
    {sub && <span className="mt-1 block text-[10.5px] text-text-muted">{sub}</span>}
  </Card>
);

/**
 * Mission Control — v1 redesign of Dashboard. Composes goal cards,
 * decisions queue, recent plans, and a placeholder for the (proposed)
 * BDI Coherence Dial. Skips the dial wiring per Phase 2 scope; the
 * placeholder card carries a <ProposedChip /> to keep the metaphor
 * honest until Phase 4.
 */
const MissionControl: React.FC = () => {
  const summary = useDashboardSummary();
  const pending = usePendingItems(5);
  const goals = useActiveGoals(5);
  const plans = useRecentPlans(4);
  const velocity = useVelocity();

  const decisions = pending.data?.decisions || [];
  const agentRequests = pending.data?.agent_requests || [];
  const activeGoals = goals.data?.goals || [];
  const recentPlans = plans.data?.plans || [];

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10 sm:px-9">
      <header className="mb-8">
        <Kicker className="mb-2">◆ Mission Control</Kicker>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
          Today
        </h1>
      </header>

      <section className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Goals"
          value={summary.data?.active_goals_count ?? '—'}
          sub="Active"
        />
        <StatCard
          label="Plans"
          value={summary.data?.active_plans_count ?? '—'}
          sub="Active"
        />
        <StatCard
          label="Decisions"
          value={summary.data?.pending_decisions_count ?? '—'}
          sub="Awaiting you"
        />
        <Card pad={16}>
          <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-text-muted">
            Done · 7d
          </span>
          <div className="mt-1 flex items-end justify-between gap-3">
            <span className="font-display text-[28px] font-bold tracking-[-0.04em] text-text">
              {velocity.data?.total ?? summary.data?.tasks_completed_this_week ?? '—'}
            </span>
            {velocity.data?.series && (
              <Spark
                values={velocity.data.series.map((p) => p.count)}
                width={64}
                height={24}
                className="opacity-90"
              />
            )}
          </div>
          <span className="mt-1 block text-[10.5px] text-text-muted">Tasks</span>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card pad={20}>
            <SectionHead
              kicker="◆ Awaiting your call"
              title="Decisions queue"
              right={
                <Pill color="amber">
                  {decisions.length + agentRequests.length}
                </Pill>
              }
            />
            {decisions.length === 0 && agentRequests.length === 0 ? (
              <p className="text-sm text-text-sec">No pending decisions. Agents will queue items here when they need your input.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {decisions.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 py-3">
                    <StatusDot color="rgb(var(--amber) / 1)" ring />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/app/plans/${d.plan_id}`}
                        className="block truncate font-display text-[13.5px] font-semibold tracking-[-0.01em] text-text hover:underline"
                      >
                        {d.title}
                      </Link>
                      <div className="mt-[2px] text-[11px] text-text-muted">
                        <span className="font-mono uppercase text-[9px] tracking-[0.1em]">{d.plan_title}</span>
                        <span className="mx-1 text-border-hi">·</span>
                        <span>{relTime(d.created_at)}</span>
                      </div>
                    </div>
                    <Pill color={d.urgency === 'high' ? 'red' : 'amber'}>{d.urgency}</Pill>
                  </li>
                ))}
                {agentRequests.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-3">
                    <StatusDot color="rgb(var(--violet) / 1)" />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/app/plans/${r.plan_id}`}
                        className="block truncate font-display text-[13.5px] font-semibold tracking-[-0.01em] text-text hover:underline"
                      >
                        {r.task_title}
                      </Link>
                      <div className="mt-[2px] text-[11px] text-text-muted">
                        <span>Agent request · {relTime(r.requested_at)}</span>
                      </div>
                    </div>
                    <Pill color="violet">{r.request_type}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card pad={20}>
            <SectionHead kicker="◇ Goals" title="In motion" />
            {activeGoals.length === 0 ? (
              <p className="text-sm text-text-sec">No active goals.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {activeGoals.map((g) => (
                  <li key={g.id}>
                    <Link
                      to={`/app/goals/${g.id}`}
                      className="block rounded-[10px] border border-border p-3 transition-colors hover:bg-surface-hi/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-clamp-2 font-display text-[13.5px] font-semibold tracking-[-0.01em] text-text">
                          {g.title}
                        </span>
                        <Pill color={statusColor(g.status)}>{g.status}</Pill>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px]">
                        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-surface-hi">
                          <div
                            className="h-full bg-amber"
                            style={{ width: `${Math.min(100, Math.max(0, g.progress || 0))}%` }}
                          />
                        </div>
                        <span className="font-mono tabular-nums text-text-sec">
                          {Math.round(g.progress || 0)}%
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card pad={20}>
            <SectionHead
              kicker="◇ Coherence"
              title="BDI Dial"
              right={<ProposedChip />}
            />
            <p className="text-[12px] leading-[1.55] text-text-sec">
              Cross-goal coherence dial wires up in Phase 4. Until then, agents
              flag contradictions inline; this card stays as a placeholder so
              the metaphor's place in the layout doesn't shift later.
            </p>
          </Card>

          <Card pad={20}>
            <SectionHead kicker="◇ Plans" title="Recent" />
            {recentPlans.length === 0 ? (
              <p className="text-sm text-text-sec">No recent plans.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentPlans.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/app/plans/${p.id}`}
                      className="flex items-center justify-between gap-2 rounded-md px-1 py-[6px] hover:bg-surface-hi/40"
                    >
                      <span className="truncate text-[12.5px] text-text">{p.title}</span>
                      <span className="font-mono text-[10px] text-text-muted">
                        {relTime(p.updated_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MissionControl;
