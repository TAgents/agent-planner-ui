import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CoherenceDial,
  Kicker,
  Pill,
  Spark,
  type PillColor,
} from '../components/v1';
import { useQuery } from 'react-query';
import {
  useCoherence,
  useDashboardSummary,
  usePendingItems,
  useVelocity,
} from '../hooks/useDashboard';
import { goalDashboardService } from '../services/goals.service';
import { request } from '../services/api-client';

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

function timeOfDayGreeting(): string {
  const d = new Date();
  const day = d.toLocaleDateString(undefined, { weekday: 'long' });
  const h = d.getHours();
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `${day} ${part}`;
}

type GoalRow = {
  id: string;
  title: string;
  type?: string;
  goal_type?: string;
  status: string;
  health: 'on_track' | 'at_risk' | 'stale';
  bottleneck_summary?: Array<unknown>;
  knowledge_gap_count?: number;
  last_activity?: string | null;
  linked_plan_progress?: {
    total_nodes: number;
    completed_nodes: number;
    blocked_nodes: number;
    percent_completed: number;
    percent_blocked: number;
    linked_plan_count: number;
  };
  pending_decision_count?: number;
};

const TYPE_GLYPH: Record<string, string> = {
  outcome: '◎',
  metric: '▲',
  constraint: '◆',
  principle: '◇',
};

function healthLabel(h: GoalRow['health'], pendingDecisions: number, contradictions: number): {
  label: string;
  color: PillColor;
} {
  if (contradictions > 0) return { label: 'Contradiction', color: 'red' };
  if (h === 'stale') return { label: 'Stale beliefs', color: 'amber' };
  if (h === 'at_risk') return { label: 'At risk', color: 'amber' };
  if (pendingDecisions > 0) return { label: 'Coherent', color: 'emerald' };
  return { label: 'Coherent', color: 'emerald' };
}

/**
 * Mission Control — agent-first dashboard. Mirrors the design handoff
 * (01-screen-specs.md "Mission Control" section): time-of-day greeting,
 * BDI Coherence dial paired with Today's Pulse + Awaiting-your-call
 * decisions, and a Goal Constellation grid scored by tension. Data
 * sources: /coherence/summary, /dashboard/summary + /pending,
 * /goals/dashboard, /dashboard/velocity.
 */
const MissionControl: React.FC = () => {
  const summary = useDashboardSummary();
  const pending = usePendingItems(5);
  const velocity = useVelocity();
  const coherence = useCoherence();
  const goalsDashboard = useQuery<{ goals: GoalRow[] }>(
    ['mission-control', 'goals-dashboard'],
    () => goalDashboardService.getDashboard(),
    { staleTime: 60_000 },
  );

  // Workspace-wide coverage tensions — extra signal beyond /coherence/summary
  // since coverage tracks per-task stale + conflict states tied to specific
  // plans, not just contradictions in the knowledge graph.
  const coverage = useQuery<{
    plans: Array<{
      stale_tasks: Array<{ task_id: string }>;
      conflict_tasks: Array<{ task_id: string }>;
    }>;
  }>(
    ['mission-control', 'coverage-tensions'],
    () => request({ url: '/knowledge/coverage', method: 'get' }),
    { staleTime: 60_000, refetchInterval: 5 * 60_000 },
  );
  const tensionTotals = (coverage.data?.plans || []).reduce(
    (acc, p) => ({
      stale: acc.stale + p.stale_tasks.length,
      conflict: acc.conflict + p.conflict_tasks.length,
    }),
    { stale: 0, conflict: 0 },
  );

  const decisions = pending.data?.decisions || [];
  const agentRequests = pending.data?.agent_requests || [];
  const allPending = [...decisions, ...agentRequests];
  const goals = goalsDashboard.data?.goals || [];
  const goalsInMotion = goals.filter((g) => g.status === 'active').length;
  const onTrackCount = goals.filter((g) => g.health === 'on_track').length;

  // BDI sub-scores synthesized from existing signals so the three rings
  // tell different stories instead of all matching the overall score.
  // Beliefs: knowledge alignment — penalised by contradictions.
  // Desires: goal commitment — share of goals on track.
  // Intentions: execution health — derived from blocked-ratio + pending decisions.
  const contradictions = coherence.data?.signals.contradictions ?? 0;
  const blockedRatio = coherence.data?.signals.blocked_task_ratio ?? 0;
  const pendingDecisions = coherence.data?.signals.pending_decisions ?? 0;
  const beliefs = Math.max(0, 1 - Math.min(1, contradictions / 15));
  const desires = goals.length > 0 ? onTrackCount / goals.length : 1;
  const intentions = Math.max(0, 1 - blockedRatio - Math.min(0.4, pendingDecisions * 0.05));

  // Sort goal cards by tension: contradictions first, then at-risk, then
  // by linked-plan progress ascending (so attention goes where it's needed).
  const sortedGoals = [...goals].sort((a, b) => {
    const aTen = (a.health === 'stale' ? 2 : 0) + (a.health === 'at_risk' ? 1 : 0);
    const bTen = (b.health === 'stale' ? 2 : 0) + (b.health === 'at_risk' ? 1 : 0);
    if (aTen !== bTen) return bTen - aTen;
    return (a.linked_plan_progress?.percent_completed || 0) - (b.linked_plan_progress?.percent_completed || 0);
  });

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-9">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <Kicker className="mb-2">◆ Mission Control</Kicker>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
            <span>{timeOfDayGreeting()}, </span>
            <span className="text-amber">
              {goalsInMotion} {goalsInMotion === 1 ? 'goal' : 'goals'} in motion
            </span>
          </h1>
          <p className="mt-1 text-[13px] leading-[1.5] text-text-sec">
            The first thing you see — what's in motion, what needs you, what's drifting.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
          <span>{summary.data?.active_plans_count ?? '—'} plans active</span>
          <span aria-hidden>·</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
            live
          </span>
        </div>
      </header>

      {/* Hero row: BDI Coherence dial · Today's Pulse + decisions */}
      <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Card pad={20}>
          <div className="mb-1 flex items-start justify-between gap-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
              ◇ BDI Coherence
            </span>
            {coherence.data?.formula_version?.includes('starter') && (
              <span className="rounded-md border border-dashed border-text-muted/40 px-1.5 py-[2px] font-mono text-[8.5px] uppercase tracking-[0.14em] text-text-muted">
                ◆ Proposed
              </span>
            )}
          </div>
          <p className="font-display text-[14px] font-semibold tracking-[-0.01em] text-text">
            Belief · Desire · Intention
          </p>

          {coherence.data ? (
            <div className="mt-4 flex flex-col items-center gap-3">
              <CoherenceDial
                score={coherence.data.score}
                beliefs={beliefs}
                desires={desires}
                intentions={intentions}
                size={196}
                centerLabel={
                  <div className="flex flex-col items-center">
                    <span className="font-display text-[34px] font-bold tracking-[-0.03em] text-text leading-none">
                      {Math.round(coherence.data.score * 100)}
                    </span>
                    <span className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.18em] text-text-muted">
                      Coherence
                    </span>
                    {contradictions > 0 && (
                      <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-amber">
                        △ {contradictions} contradiction{contradictions === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                }
              />
              <div className="grid w-full grid-cols-3 gap-2 pt-1 text-center">
                <BdiLegend label="Beliefs" pct={Math.round(beliefs * 100)} dot="bg-violet" />
                <BdiLegend label="Desires" pct={Math.round(desires * 100)} dot="bg-amber" />
                <BdiLegend label="Intentions" pct={Math.round(intentions * 100)} dot="bg-emerald" />
              </div>
            </div>
          ) : (
            <p className="mt-4 text-[12px] text-text-sec">Computing…</p>
          )}
        </Card>

        <Card pad={20}>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
            ◇ Today's Pulse
          </span>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            <PulseStat
              value={allPending.length}
              label="Need attention"
              tone={allPending.length > 0 ? 'amber' : 'muted'}
            />
            <PulseStat value={summary.data?.active_goals_count ?? 0} label="Active goals" />
            <PulseStat value={summary.data?.active_plans_count ?? 0} label="Active plans" />
            <PulseStat
              value={velocity.data?.total ?? summary.data?.tasks_completed_this_week ?? 0}
              label="Done this week"
              spark={velocity.data?.series?.map((p) => p.count)}
            />
          </div>

          <div className="mt-5 rounded-md border border-border bg-surface-hi/30">
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
                Awaiting your call
                <Pill color={allPending.length > 0 ? 'amber' : 'slate'}>{allPending.length}</Pill>
              </span>
              {pending.data?.total !== undefined && pending.data.total > allPending.length && (
                <Link
                  to="/app/decisions"
                  className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted hover:text-text"
                >
                  View all →
                </Link>
              )}
            </div>
            {allPending.length === 0 ? (
              <p className="px-3 py-3 text-[12px] text-text-sec">
                No pending decisions. Agents will queue items here when they need your input.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {decisions.slice(0, 3).map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-3 py-2.5">
                    <span className="flex h-2 w-2 flex-shrink-0 items-center justify-center rounded-full bg-amber" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
                        <span>◆ planner-α</span>
                        <span aria-hidden>·</span>
                        <span className="truncate text-text-sec">{d.plan_title}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[12.5px] text-text">{d.title}</p>
                    </div>
                    <span className="flex-shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
                      {relTime(d.created_at)}
                    </span>
                    <Link
                      to={`/app/plans/${d.plan_id}`}
                      className="flex-shrink-0 rounded-md bg-amber px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-bg hover:opacity-90"
                    >
                      Resolve
                    </Link>
                  </li>
                ))}
                {agentRequests.slice(0, Math.max(0, 3 - decisions.length)).map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                    <span className="flex h-2 w-2 flex-shrink-0 items-center justify-center rounded-full bg-violet" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
                        <span>◆ agent</span>
                        <span aria-hidden>·</span>
                        <span className="truncate text-text-sec">{r.plan_title}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[12.5px] text-text">{r.task_title}</p>
                    </div>
                    <span className="flex-shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
                      {relTime(r.requested_at)}
                    </span>
                    <Link
                      to={`/app/plans/${r.plan_id}`}
                      className="flex-shrink-0 rounded-md border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-text hover:bg-surface-hi"
                    >
                      Review
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* Goal Constellation */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
              ◇ Goal constellation
            </span>
            <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
              Health, beliefs, and tension at a glance
            </h2>
          </div>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">
            sorted by tension ↓
          </span>
        </div>

        {goalsDashboard.isLoading ? (
          <p className="text-[12.5px] text-text-sec">Loading…</p>
        ) : sortedGoals.length === 0 ? (
          <Card pad={20}>
            <p className="text-[12.5px] text-text-sec">No active goals yet.</p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {sortedGoals.map((g) => (
              <GoalConstellationCard
                key={g.id}
                goal={g}
                velocitySeries={velocity.data?.series?.map((p) => p.count) || []}
                coverageContradictions={tensionTotals.conflict}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const BdiLegend: React.FC<{ label: string; pct: number; dot: string }> = ({ label, pct, dot }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">
        {label}
      </span>
    </div>
    <span className="font-display text-[14px] font-semibold tabular-nums text-text">{pct}%</span>
  </div>
);

const PulseStat: React.FC<{
  value: React.ReactNode;
  label: string;
  tone?: 'muted' | 'amber';
  spark?: number[];
}> = ({ value, label, tone, spark }) => (
  <div>
    <div className="flex items-end gap-2">
      <span
        className={`font-display text-[32px] font-bold leading-none tracking-[-0.03em] ${
          tone === 'amber' ? 'text-amber' : 'text-text'
        }`}
      >
        {value}
      </span>
      {spark && spark.length > 0 && <Spark values={spark} width={48} height={20} className="opacity-80" />}
    </div>
    <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
      {label}
    </span>
  </div>
);

/**
 * One goal in the constellation. Shows the goal type icon, health pill,
 * progress bar (with linked-plan completion %), pending-decisions pill,
 * and a workspace velocity proxy as a 7d sparkline. The "VELOCITY" tag
 * mirrors the design's emphasis pill — links through to the goal detail.
 */
const GoalConstellationCard: React.FC<{
  goal: GoalRow;
  velocitySeries: number[];
  coverageContradictions: number;
}> = ({ goal, velocitySeries, coverageContradictions }) => {
  const typeKey = (goal.type || 'outcome').toLowerCase();
  const glyph = TYPE_GLYPH[typeKey] || '◎';
  const pct = goal.linked_plan_progress?.percent_completed ?? 0;
  const blockedPct = goal.linked_plan_progress?.percent_blocked ?? 0;
  const pendingDecisions = goal.pending_decision_count ?? 0;
  // Per-goal contradiction count would require a /goals/:id/coherence
  // call here. We use the aggregate as a hint in the subtitle until the
  // tree-row prefetch lands.
  const goalContradictions = goal.health === 'stale' ? coverageContradictions : 0;
  const health = healthLabel(goal.health, pendingDecisions, goalContradictions);
  const sparkColor =
    health.color === 'red'
      ? 'rgb(var(--red))'
      : health.color === 'amber'
        ? 'rgb(var(--amber))'
        : 'rgb(var(--emerald))';

  return (
    <Link
      to={`/app/goals/${goal.id}`}
      className="block rounded-[10px] border border-border bg-surface p-4 transition-colors hover:bg-surface-hi/40"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-border text-[14px]">
          {glyph}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
              {typeKey}
            </span>
            <Pill color={health.color}>{health.label}</Pill>
            {pendingDecisions > 0 && <Pill color="amber">{pendingDecisions} pending</Pill>}
          </div>
          <p className="mt-1.5 line-clamp-2 font-display text-[14px] font-semibold tracking-[-0.01em] text-text">
            {goal.title}
          </p>
        </div>
        {velocitySeries.length > 0 && (
          <div className="flex flex-shrink-0 flex-col items-end gap-1">
            <Spark values={velocitySeries} width={56} height={20} color={sparkColor} className="opacity-90" />
            <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-text-muted">
              7d velocity
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div
          className="flex h-[3px] flex-1 overflow-hidden rounded-full bg-surface-hi"
          role="img"
          aria-label={`${pct}% complete, ${blockedPct}% blocked`}
        >
          {pct > 0 && <div className="bg-emerald" style={{ width: `${pct - blockedPct}%` }} />}
          {blockedPct > 0 && <div className="bg-red" style={{ width: `${blockedPct}%` }} />}
        </div>
        <span className="font-mono text-[11px] tabular-nums text-text">{pct}%</span>
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
        <span>
          {goalContradictions > 0
            ? `${goalContradictions} contradiction${goalContradictions === 1 ? '' : 's'}`
            : 'no contradictions'}
          <span className="mx-1.5" aria-hidden>·</span>
          {relTime(goal.last_activity || undefined)}
        </span>
        <span className="rounded-md border border-dashed border-text-muted/40 px-1.5 py-[1.5px] tracking-[0.16em]">
          ◆ Velocity
        </span>
      </div>
    </Link>
  );
};

export default MissionControl;
