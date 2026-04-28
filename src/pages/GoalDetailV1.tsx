import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Card,
  CriticalPathSubway,
  GoalCompass,
  Kicker,
  Pill,
  SectionHead,
  type PillColor,
} from '../components/v1';
import { useGoalV2, useGoalPath, useGoalKnowledgeGaps } from '../hooks/useGoalsV2';
import { usePlans } from '../hooks/usePlans';
import { useCriticalPath } from '../hooks/useDependencies';
import { request } from '../services/api-client';
import { goalDashboardService, goalBdiService } from '../services/goals.service';
import type { Plan } from '../types';

type Tab = 'overview' | 'tasks' | 'beliefs' | 'evaluations';

function relTime(iso?: string): string {
  if (!iso) return 'never';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * Goal Detail — single goal opened up. Composes Goal Compass,
 * Quality score, Tension Hotspots, and the Critical Path subway
 * above a 4-tab body (Overview · Tasks & dependencies · Beliefs ·
 * Evaluations). Mirrors the design handoff "Goal Detail" surface.
 */
const GoalDetailV1: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const goalQ = useGoalV2(goalId);
  const pathQ = useGoalPath(goalId);
  const qualityQ = useQuery(
    ['goal', goalId, 'quality'],
    () => goalBdiService.getQuality(goalId!),
    { enabled: !!goalId, staleTime: 5 * 60_000 },
  );

  const [tab, setTab] = useState<Tab>('overview');

  const goal = goalQ.data;
  const path = pathQ.data;

  // Linked plans come from goal.links (linkedType='plan'). Plan titles +
  // progress are joined client-side from the workspace plans list. The
  // older code read `path.plans` which the backend never set, so the
  // counter and tab body always rendered as empty.
  const plansResp = usePlans(1, 200);
  const planById = React.useMemo(() => {
    const m = new Map<string, Plan>();
    for (const p of (plansResp.plans || []) as Plan[]) m.set(p.id, p);
    return m;
  }, [plansResp.plans]);
  const linkedPlans = React.useMemo(() => {
    const links = goal?.links || [];
    return links
      .filter((l) => l.linkedType === 'plan')
      .map((l) => {
        const p = planById.get(l.linkedId);
        return {
          id: l.linkedId,
          title: p?.title || 'Linked plan',
          status: p?.status,
          progress: typeof p?.progress === 'number' ? p.progress : undefined,
        };
      });
  }, [goal?.links, planById]);

  if (goalQ.isLoading) {
    return (
      <div className="mx-auto max-w-[1080px] px-6 py-10">
        <Card pad={20}>Loading goal…</Card>
      </div>
    );
  }
  if (!goal) {
    return (
      <div className="mx-auto max-w-[1080px] px-6 py-10">
        <Card pad={20}>
          <p className="font-display text-base font-semibold">Goal not found</p>
          <p className="mt-2 text-sm text-text-sec">
            <Link to="/app/goals" className="underline">Back to goals →</Link>
          </p>
        </Card>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; badge?: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: 'Tasks & dependencies' },
    { id: 'beliefs', label: 'Beliefs', badge: 'NEW' },
    { id: 'evaluations', label: `Evaluations · ${(goal.evaluations || []).length}` },
  ];

  const stats = (path as any)?.stats;
  const totalTasks = stats?.total || 0;
  const doneTasks = stats?.completed || 0;
  const blockedTasks = stats?.blocked || 0;
  const inFlightTasks = stats?.in_progress || 0;
  const waitingTasks = Math.max(0, totalTasks - doneTasks - inFlightTasks - blockedTasks);
  const goalProgress = stats?.completion_percentage || 0;

  // Health classification — mirrors the dashboard's heuristics so the
  // pill below the title matches what Mission Control shows.
  const health: { label: string; color: PillColor } = (() => {
    if (totalTasks > 0 && totalTasks - doneTasks > 0 && (path as any)?.last_activity_at) {
      const ageDays = (Date.now() - new Date((path as any).last_activity_at).getTime()) / 86_400_000;
      if (ageDays > 3) return { label: 'Stale', color: 'red' };
    }
    if (blockedTasks / Math.max(totalTasks, 1) > 0.25) return { label: 'At risk', color: 'amber' };
    if (goalProgress >= 90) return { label: 'On track', color: 'emerald' };
    return { label: 'On track', color: 'emerald' };
  })();

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-9">
      <header className="mb-7">
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
          <Link to="/app/goals" className="hover:text-text">
            Goals
          </Link>
          <span aria-hidden>›</span>
          <span className="text-text-sec">{goal.type}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
              {goal.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Pill color="violet">▲ {goal.type}</Pill>
              <Pill color={health.color}>● {health.label}</Pill>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                created {relTime(goal.createdAt)}
              </span>
            </div>
            {goal.description && (
              <p className="mt-3 max-w-[64ch] text-[13px] leading-[1.55] text-text-sec">
                {goal.description}
              </p>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <Link
              to={`/app/knowledge/timeline?goal=${goal.id}`}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-sec transition-colors hover:border-amber hover:text-text"
            >
              ◆ Knowledge →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero row — Compass · Quality + Tensions stack */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Card pad={20}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
              ◇ Goal compass
              <span className="rounded-md border border-dashed border-text-muted/40 px-1.5 py-[1.5px] tracking-[0.14em]">
                ◆ Proposed
              </span>
            </span>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-amber">
              {(() => {
                const c = (qualityQ.data?.suggestions?.length ?? 0) > 0;
                return c ? `${qualityQ.data?.suggestions.length} signal${qualityQ.data!.suggestions.length === 1 ? '' : 's'}` : '';
              })()}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <GoalCompass
              centerLabel={
                <div className="flex flex-col items-center">
                  <span className="font-display text-[24px] font-bold leading-none tracking-[-0.02em] text-text">
                    {goalProgress}%
                  </span>
                  <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
                    goal
                  </span>
                </div>
              }
              axes={[
                {
                  label: 'Beliefs',
                  count: linkedPlans.length,
                  sub: 'Plans serving this goal',
                },
                {
                  label: 'Desires',
                  count: Array.isArray(goal.successCriteria)
                    ? goal.successCriteria.length
                    : goal.successCriteria
                      ? 1
                      : 0,
                  sub: 'Success criteria',
                },
                {
                  label: 'Intentions',
                  count: Array.isArray(goal.evaluations) ? goal.evaluations.length : 0,
                  sub: 'Evaluations on record',
                },
                {
                  label: 'Constraints',
                  count: Array.isArray(goal.links) ? goal.links.length : 0,
                  sub: 'Linked entities',
                },
              ]}
            />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
            <CompassStat label="Beliefs" value={linkedPlans.length} tone="violet" />
            <CompassStat
              label="Desires"
              value={Array.isArray(goal.successCriteria) ? goal.successCriteria.length : goal.successCriteria ? 1 : 0}
              tone="amber"
            />
            <CompassStat
              label="Intentions"
              value={Array.isArray(goal.evaluations) ? goal.evaluations.length : 0}
              tone="emerald"
            />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <QualityScoreCard
            score={qualityQ.data?.score}
            suggestions={qualityQ.data?.suggestions || []}
            stats={{ done: doneTasks, inFlight: inFlightTasks, blocked: blockedTasks, waiting: waitingTasks, total: totalTasks }}
          />
          <TensionHotspots goalId={goal.id} />
        </div>
      </div>

      {/* Critical Path — full width band */}
      <Card pad={20} className="mb-6">
        <SubwayPanel linkedPlans={linkedPlans} />
      </Card>

      {/* Tabs */}
      <nav className="mb-5 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors ${
              tab === t.id
                ? 'border-amber text-text'
                : 'border-transparent text-text-muted hover:text-text-sec'
            }`}
          >
            {t.label}
            {t.badge && (
              <span className="rounded-md border border-dashed border-amber/50 px-1 py-[1px] font-mono text-[8px] tracking-[0.14em] text-amber">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <Card pad={20}>
          <SectionHead kicker="◆ Briefing" title="Status & next steps" />
          <p className="text-[13px] leading-[1.55] text-text-sec">
            {goal.description ||
              'No briefing copy yet. As agents observe progress, they will summarize here.'}
          </p>
          {linkedPlans.length > 0 && (
            <div className="mt-4">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">
                Linked plans · {linkedPlans.length}
              </span>
              <ul className="mt-2 flex flex-col gap-1.5">
                {linkedPlans.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/app/plans/${p.id}`}
                      className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-[12.5px] transition-colors hover:bg-surface-hi/40"
                    >
                      <span className="truncate text-text">{p.title}</span>
                      {typeof p.progress === 'number' && (
                        <span className="font-mono text-[11px] tabular-nums text-text-sec">
                          {Math.round(p.progress)}%
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {tab === 'tasks' && <TasksDependenciesPanel pathQ={pathQ} />}

      {tab === 'beliefs' && <BeliefsPanel goalId={goal.id} />}

      {tab === 'evaluations' && (
        <Card pad={20}>
          <SectionHead kicker="◇ Evaluations" title="Goal-quality history" />
          {!Array.isArray(goal.evaluations) || goal.evaluations.length === 0 ? (
            <p className="text-[12.5px] text-text-sec">
              No evaluations on record. Run a goal-quality check or wait for an agent to evaluate.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {goal.evaluations.map((e) => (
                <li key={e.id} className="rounded-md border border-border bg-bg/50 px-3 py-2 text-[12px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
                      {relTime(e.evaluatedAt)}
                    </span>
                    {typeof e.score === 'number' && (
                      <span className="font-mono text-[11px] font-bold text-text">
                        {Math.round(e.score)}%
                      </span>
                    )}
                  </div>
                  {e.reasoning && <p className="mt-1 text-text-sec">{e.reasoning}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
};

const CompassStat: React.FC<{ label: string; value: number; tone: 'violet' | 'amber' | 'emerald' }> = ({
  label,
  value,
  tone,
}) => {
  const cls =
    tone === 'violet'
      ? 'text-violet'
      : tone === 'amber'
        ? 'text-amber'
        : 'text-emerald';
  return (
    <div>
      <span className={`block font-display text-[22px] font-bold tabular-nums ${cls}`}>{value}</span>
      <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
        {label}
      </span>
    </div>
  );
};

/**
 * Quality Score card — mirrors /goals/:id/quality. Shows overall score
 * out of 100, the workspace progress (% achievers complete) plus a
 * status breakdown (done/in flight/blocked/waiting), and a "Why N?"
 * line driven by the first quality suggestion.
 */
const QualityScoreCard: React.FC<{
  score?: number;
  suggestions: string[];
  stats: { done: number; inFlight: number; blocked: number; waiting: number; total: number };
}> = ({ score, suggestions, stats }) => {
  const score100 = typeof score === 'number' ? Math.round(score * 100) : null;
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  return (
    <Card pad={20}>
      <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
        <span>◇ Quality score</span>
        <span>Progress · {pct}%</span>
      </div>
      <div className="flex items-end gap-4">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-[40px] font-bold leading-none tracking-[-0.03em] text-text">
            {score100 ?? '—'}
          </span>
          <span className="font-mono text-[12px] text-text-muted">/100</span>
        </div>
        <div className="flex-1 pb-2">
          <div className="h-[5px] w-full overflow-hidden rounded-full bg-surface-hi">
            <div className="h-full bg-amber" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
              <span className="text-text-sec">{stats.done} done</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              <span className="text-text-sec">{stats.inFlight} in flight</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red" />
              <span className="text-text-sec">{stats.blocked} blocked</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-text-muted/50" />
              <span className="text-text-sec">{stats.waiting} waiting</span>
            </li>
          </ul>
        </div>
      </div>
      {score100 !== null && suggestions.length > 0 && (
        <p className="mt-3 text-[12px] leading-[1.55] text-text-sec">
          <span className="font-display font-semibold text-text">Why {score100}? </span>
          {suggestions[0]}
        </p>
      )}
    </Card>
  );
};

/**
 * Tasks & dependencies panel — three columns showing direct achievers
 * and depth-2 / depth-3 upstream tasks. Tasks at greater depth are not
 * shown by default to keep the panel scannable; the full tree is in
 * Plan Tree.
 */
const TasksDependenciesPanel: React.FC<{ pathQ: any }> = ({ pathQ }) => {
  if (pathQ.isLoading) {
    return (
      <Card pad={20}>
        <p className="text-[12.5px] text-text-muted">Loading task tree…</p>
      </Card>
    );
  }
  const nodes = (pathQ.data?.nodes || []) as Array<{
    node_id: string;
    title: string;
    status: string;
    depth: number;
    plan_id: string;
  }>;
  if (nodes.length === 0) {
    return (
      <Card pad={20}>
        <p className="text-[12.5px] text-text-sec">
          No achiever tasks yet. Add a plan link or an achieves dependency to see the task tree.
        </p>
      </Card>
    );
  }
  const direct = nodes.filter((n) => n.depth === 1);
  const depth2 = nodes.filter((n) => n.depth === 2);
  const depth3Plus = nodes.filter((n) => n.depth >= 3);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <DependencyColumn label="Direct achievers" items={direct} />
      <DependencyColumn label="Depth 2 (upstream)" items={depth2} />
      <DependencyColumn label="Depth 3+ (upstream)" items={depth3Plus} />
    </div>
  );
};

const DependencyColumn: React.FC<{
  label: string;
  items: Array<{ node_id: string; title: string; status: string; plan_id: string }>;
}> = ({ label, items }) => {
  const dotColor = (s: string) =>
    s === 'completed'
      ? 'bg-emerald'
      : s === 'in_progress'
        ? 'bg-amber'
        : s === 'blocked'
          ? 'bg-red'
          : s === 'plan_ready'
            ? 'bg-violet'
            : 'bg-text-muted/40';
  return (
    <div>
      <span className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
        {label}
      </span>
      {items.length === 0 ? (
        <p className="mt-2 text-[11.5px] text-text-muted">—</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1.5">
          {items.map((n) => (
            <li key={n.node_id}>
              <Link
                to={`/app/plans/${n.plan_id}`}
                className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] transition-colors hover:bg-surface-hi/40"
              >
                <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dotColor(n.status)}`} />
                <span
                  className={`truncate ${
                    n.status === 'completed' ? 'text-text-muted line-through' : 'text-text'
                  }`}
                  title={n.title}
                >
                  {n.title}
                </span>
                {n.status === 'blocked' && (
                  <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.12em] text-red">
                    blocked
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Beliefs panel — surfaces what the knowledge graph "believes" about
 * each achiever task. Built off /goals/:id/knowledge-gaps which
 * already returns top facts per task plus gap classifications.
 */
const BeliefsPanel: React.FC<{ goalId: string }> = ({ goalId }) => {
  const gaps = useGoalKnowledgeGaps(goalId);
  if (gaps.isLoading) {
    return (
      <Card pad={20}>
        <p className="text-[12.5px] text-text-muted">Loading beliefs from knowledge graph…</p>
      </Card>
    );
  }
  if (!gaps.data?.available) {
    return (
      <Card pad={20}>
        <p className="text-[12.5px] text-text-sec">
          Knowledge graph not available — add a Graphiti episode with{' '}
          <code className="rounded bg-surface-hi px-1 py-0.5 font-mono text-[11px]">add_learning</code>{' '}
          via MCP to start populating beliefs.
        </p>
      </Card>
    );
  }
  const tasks = (gaps.data.tasks || []) as Array<{
    node_id: string;
    title: string;
    status: string;
    fact_count: number;
    has_knowledge: boolean;
    top_facts: string[];
    gap_severity?: string | null;
  }>;
  if (tasks.length === 0) {
    return (
      <Card pad={20}>
        <p className="text-[12.5px] text-text-sec">No achiever tasks yet — nothing to ground.</p>
      </Card>
    );
  }
  return (
    <Card pad={20}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <SectionHead kicker="◇ Beliefs" title="What the graph knows about achievers" />
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">
          {gaps.data.coverage.percentage}% covered · {gaps.data.coverage.covered}/
          {gaps.data.coverage.total}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {tasks.map((t) => (
          <li
            key={t.node_id}
            className="rounded-md border border-border bg-surface px-3 py-2.5 text-[12.5px]"
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  t.has_knowledge ? 'bg-emerald' : t.gap_severity === 'blocking' ? 'bg-red' : 'bg-amber'
                }`}
              />
              <span className="font-display text-[12.5px] font-semibold text-text">{t.title}</span>
              <span className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
                {t.fact_count} fact{t.fact_count === 1 ? '' : 's'}
              </span>
            </div>
            {t.top_facts.length > 0 ? (
              <ul className="mt-1.5 flex flex-col gap-0.5 pl-3.5 text-[11.5px] text-text-sec">
                {t.top_facts.map((f, i) => (
                  <li key={i}>· {f}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 pl-3.5 text-[11.5px] text-text-muted">
                No grounding facts. Agents may run with weaker context.
              </p>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
};

/**
 * SubwayPanel — picks the first linked plan and renders its critical
 * path as a horizontal subway map. Walks plans top-down so the user
 * sees the most-immediate path; multi-plan composition (one subway
 * per linked plan) is a follow-up if morning review wants it.
 */
const SubwayPanel: React.FC<{ linkedPlans: Array<{ id: string; title: string }> }> = ({
  linkedPlans,
}) => {
  const firstPlan = linkedPlans[0];
  const cp = useCriticalPath(firstPlan?.id || '', !!firstPlan);

  if (!firstPlan) {
    return (
      <>
        <SectionHead kicker="◆ Critical path" title="No plans linked yet" />
        <p className="text-[12.5px] text-text-sec">
          Link a plan to this goal to see its critical path here.
        </p>
      </>
    );
  }

  const result = cp.criticalPath as { path?: Array<{ node_id: string; title: string; status: string }> } | undefined;
  const stations = (result?.path || []).map((p) => ({
    id: p.node_id,
    title: p.title,
    status: p.status,
    href: `/app/plans/${firstPlan.id}`,
  }));

  return (
    <>
      <SectionHead
        kicker="◆ Critical path"
        title={firstPlan.title}
        right={
          stations.length > 0 ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              {`${stations.length} station${stations.length === 1 ? '' : 's'}`}
            </span>
          ) : null
        }
      />
      {cp.isLoading ? (
        <p className="text-[12.5px] text-text-muted">Computing path…</p>
      ) : (
        <CriticalPathSubway stations={stations} />
      )}
    </>
  );
};

/**
 * Tension Hotspots — per-goal version. Pulls coherence + signal counts
 * from /goals/:id/coherence (server applies the per-component clamping
 * formula so attention sort and Mission Control roll-ups can reuse it
 * without duplicating math), and joins /knowledge/coverage filtered to
 * the goal's linked plans for stale + conflict task counts. Briefing
 * remains the source for linked-plan IDs since coherence intentionally
 * doesn't return per-plan metadata.
 */
const TensionHotspots: React.FC<{ goalId: string }> = ({ goalId }) => {
  const coherence = useQuery<{
    coherence_score: number;
    signals: {
      decisions_count: number;
      blocked_count: number;
      blocked_ratio: number;
      contradictions_count: number;
      total_tasks: number;
    };
  }>(
    ['goal', goalId, 'coherence'],
    () => goalDashboardService.getCoherence(goalId),
    { enabled: !!goalId, staleTime: 60_000 },
  );
  const briefing = useQuery<{
    linked_plans?: Array<{ plan_id: string; title: string; progress_pct: number }>;
  }>(
    ['goal', goalId, 'briefing'],
    () => goalDashboardService.getBriefing(goalId),
    { enabled: !!goalId, staleTime: 60_000 },
  );
  const cov = useQuery<{
    plans: Array<{
      plan_id: string;
      plan_title: string;
      stale_tasks: Array<{ task_id: string; task_title: string }>;
      conflict_tasks: Array<{ task_id: string; task_title: string }>;
    }>;
  }>(
    ['knowledge', 'coverage'],
    () => request({ url: '/knowledge/coverage', method: 'get' }),
    { staleTime: 60_000 },
  );

  const linkedPlanIds = new Set(
    (briefing.data?.linked_plans || []).map((p) => p.plan_id),
  );
  const decisionsCount = coherence.data?.signals.decisions_count ?? 0;
  const blockedCount = coherence.data?.signals.blocked_count ?? 0;
  const blockedRatio = coherence.data?.signals.blocked_ratio ?? 0;
  const contradictionsCount = coherence.data?.signals.contradictions_count ?? 0;
  const coherenceScore = coherence.data?.coherence_score ?? 1;
  const goalScopedPlans = (cov.data?.plans || []).filter((p) =>
    linkedPlanIds.has(p.plan_id),
  );
  const plansWithStale = goalScopedPlans.filter((p) => p.stale_tasks.length > 0);
  const plansWithConflict = goalScopedPlans.filter((p) => p.conflict_tasks.length > 0);
  const empty =
    decisionsCount === 0 &&
    blockedCount === 0 &&
    contradictionsCount === 0 &&
    plansWithStale.length === 0 &&
    plansWithConflict.length === 0;

  return (
    <Card pad={20}>
      <SectionHead
        kicker="◇ Tensions"
        title="Hotspots"
        right={
          coherence.data ? (
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
              {`${Math.round(coherenceScore * 100)}% coherent`}
            </span>
          ) : null
        }
      />
      {empty ? (
        <p className="text-[12.5px] leading-[1.55] text-text-sec">
          No active tensions. Nothing's contradicting itself, blocking, or going stale.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border text-[12.5px]">
          {decisionsCount > 0 && (
            <li className="flex items-center justify-between py-2">
              <span>{`${decisionsCount} decision${decisionsCount === 1 ? '' : 's'} awaiting you`}</span>
              <Link to="/app" className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber hover:opacity-80">
                Queue →
              </Link>
            </li>
          )}
          {blockedCount > 0 && (
            <li className="flex items-center justify-between py-2">
              <span>{`${blockedCount} blocked task${blockedCount === 1 ? '' : 's'}`}</span>
              <Pill color="red">{`${Math.round(blockedRatio * 100)}%`}</Pill>
            </li>
          )}
          {contradictionsCount > 0 && (
            <li className="flex items-center justify-between py-2">
              <span>{`${contradictionsCount} knowledge contradiction${contradictionsCount === 1 ? '' : 's'}`}</span>
              <Link
                to="/app/knowledge/timeline"
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber hover:opacity-80"
              >
                Open →
              </Link>
            </li>
          )}
          {plansWithStale.slice(0, 3).map((p) => (
            <li key={`stale-${p.plan_id}`} className="flex items-center justify-between py-2">
              <span className="truncate">
                {p.plan_title}
                <span className="ml-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-muted">
                  {`${p.stale_tasks.length} stale`}
                </span>
              </span>
              <Link
                to={`/app/plans/${p.plan_id}`}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber hover:opacity-80"
              >
                Open →
              </Link>
            </li>
          ))}
          {plansWithConflict.slice(0, 3).map((p) => (
            <li key={`conflict-${p.plan_id}`} className="flex items-center justify-between py-2">
              <span className="truncate">
                {p.plan_title}
                <span className="ml-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-muted">
                  {`${p.conflict_tasks.length} conflict`}
                </span>
              </span>
              <Link
                to={`/app/plans/${p.plan_id}`}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-red hover:opacity-80"
              >
                Resolve →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default GoalDetailV1;
