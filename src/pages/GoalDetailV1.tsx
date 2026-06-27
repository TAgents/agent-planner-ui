import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Card,
  CriticalPathSubway,
  GhostButton,
  GoalCompass,
  Kicker,
  ObjectChip,
  Pill,
  PrimaryButton,
  SectionHead,
  type PillColor,
} from '../components/v1';
import { useGoalV2, useGoalPath, useGoalKnowledgeGaps, useUpdateGoal, useGoalState, type GoalStateResult } from '../hooks/useGoalsV2';
import { criteriaAttainment, normalizeCriteria, isMeasurableCriterion, isCriterionMet, type GoalCriterion } from '../utils/goalCriteria';
import { goalHealthBadge } from '../utils/goalHealth';
import { usePlans } from '../hooks/usePlans';
import { useWorkspace, useWorkspaces } from '../hooks/useWorkspaces';
import { useCriticalPath } from '../hooks/useDependencies';
import { request } from '../services/api-client';
import { goalDashboardService, goalBdiService, type GoalContradictions } from '../services/goals.service';
import type { Plan } from '../types';

type Tab = 'overview' | 'tasks' | 'knowledge' | 'evaluations';

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
 * above a 4-tab body (Overview · Tasks & dependencies · Knowledge ·
 * Evaluations). Mirrors the design handoff "Goal Detail" surface.
 */
const GoalDetailV1: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const goalQ = useGoalV2(goalId);
  const pathQ = useGoalPath(goalId);
  // Composed read — execution/attainment progress, quality dimensions, hidden
  // linked-plan count, bottlenecks, linked tasks in one call. Preferred source.
  const stateQ = useGoalState(goalId);
  const qualityQ = useQuery(
    ['goal', goalId, 'quality'],
    () => goalBdiService.getQuality(goalId!),
    { enabled: !!goalId, staleTime: 5 * 60_000 },
  );

  const [tab, setTab] = useState<Tab>('overview');
  const [showMove, setShowMove] = useState(false);

  const goal = goalQ.data;
  const path = pathQ.data;
  const gs: GoalStateResult | undefined = stateQ.data;

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
  // Canonical linked plans = the non-archived, deduped, access-filtered set
  // from goal_state (gs.linked_plans) — the SAME basis the Quality→Actionability
  // count uses. The raw goal.links list double-counts and includes archived
  // plans (that was the "32 vs 11" split on one page). Before goal_state
  // resolves, fall back to deduped non-archived raw links.
  const linkedPlans = React.useMemo(() => {
    const enrich = (id: string) => {
      const p = planById.get(id);
      return {
        id,
        title: p?.title || 'Linked plan',
        status: p?.status,
        progress: typeof p?.progress === 'number' ? p.progress : undefined,
      };
    };
    if (gs?.linked_plans) {
      return gs.linked_plans.map((lp) => enrich(lp.id));
    }
    const ids = Array.from(
      new Set((goal?.links || []).filter((l) => l.linkedType === 'plan').map((l) => l.linkedId)),
    );
    return ids.map(enrich).filter((p) => p.status !== 'archived');
  }, [gs?.linked_plans, goal?.links, planById]);

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
    { id: 'knowledge', label: 'Knowledge' },
    { id: 'evaluations', label: `Evaluations · ${(goal.evaluations || []).length}` },
  ];

  // Headline execution progress = the canonical rollup (the SAME number Mission
  // and the Goals list show, one rounding rule) when the goal is active. Falls
  // back to the achiever-path stats for non-active goals or before goal_state
  // resolves, so the page still renders.
  const rollup = gs?.rollup;
  const pathStats = (path as any)?.stats;
  const totalTasks = rollup?.total_nodes ?? pathStats?.total ?? 0;
  const doneTasks = rollup?.completed_nodes ?? pathStats?.completed ?? 0;
  const blockedTasks = rollup?.blocked_nodes ?? pathStats?.blocked ?? 0;
  const inFlightTasks = rollup?.in_progress_nodes ?? pathStats?.in_progress ?? 0;
  const waitingTasks = Math.max(0, totalTasks - doneTasks - inFlightTasks - blockedTasks);
  const goalProgress = rollup?.execution_pct ?? pathStats?.completion_percentage ?? 0;

  // Execution (tasks done) is distinct from attainment (success criteria met).
  const executionPct = rollup?.execution_pct ?? gs?.progress?.execution_pct ?? goalProgress;
  const clientAttain = criteriaAttainment(goal.successCriteria);
  const attainment = gs?.progress?.attainment ?? {
    measurable_count: clientAttain.measurable_count,
    met_count: clientAttain.met_count,
  };
  const attainmentPct = gs?.progress?.attainment_pct ?? clientAttain.attainment_pct;
  const isAchieved = goal.status === 'achieved';
  const criteria = normalizeCriteria(goal.successCriteria);

  // Health comes from the canonical server rollup (gs.health) — the SAME
  // computation Mission and the dashboard use, so the detail header can't
  // disagree with the list. Non-active goals aren't in the rollup, so show
  // their lifecycle status instead of a health verdict.
  const STATUS_BADGE: Record<string, { label: string; color: PillColor }> = {
    achieved: { label: 'Achieved', color: 'emerald' },
    paused: { label: 'Paused', color: 'slate' },
    draft: { label: 'Draft', color: 'violet' },
    archived: { label: 'Archived', color: 'slate' },
    abandoned: { label: 'Abandoned', color: 'slate' },
  };
  const health: { label: string; color: PillColor } = gs?.health
    ? goalHealthBadge(gs.health)
    : STATUS_BADGE[goal.status] ?? goalHealthBadge(undefined);

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-9">
      <header className="mb-7">
        <GoalBreadcrumb goal={goal} />
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
              <WorkspaceChip goal={goal} />
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
            <GhostButton onClick={() => setShowMove(true)}>Move →</GhostButton>
          </div>
        </div>
      </header>
      {isAchieved && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald/40 bg-emerald/[0.07] px-4 py-3">
          <span className="font-display text-[18px] leading-none text-emerald">✓</span>
          <div>
            <p className="font-display text-[13px] font-semibold text-text">Goal achieved</p>
            <p className="text-[12px] leading-[1.5] text-text-sec">
              {attainment.measurable_count > 0
                ? `All ${attainment.measurable_count} measurable criteria are met — this goal closed itself.`
                : 'Marked achieved.'}
            </p>
          </div>
        </div>
      )}
      {showMove && (
        <MoveGoalModal goal={goal as any} onClose={() => setShowMove(false)} />
      )}

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
                    {attainmentPct != null ? attainmentPct : executionPct}%
                  </span>
                  <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
                    {attainmentPct != null ? 'attained' : 'tasks'}
                  </span>
                </div>
              }
              axes={[
                {
                  label: 'Plans',
                  count: linkedPlans.length,
                  sub: 'Plans serving this goal',
                },
                {
                  label: 'Criteria',
                  count: criteria.length,
                  sub: 'Success criteria',
                },
                {
                  label: 'Reviews',
                  count: Array.isArray(goal.evaluations) ? goal.evaluations.length : 0,
                  sub: 'Evaluations on record',
                },
                {
                  label: 'Links',
                  count: Array.isArray(goal.links) ? goal.links.length : 0,
                  sub: 'Linked entities',
                },
              ]}
            />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
            <CompassStat label="Plans" value={linkedPlans.length} tone="violet" />
            <CompassStat label="Criteria" value={criteria.length} tone="amber" />
            <CompassStat
              label="Reviews"
              value={Array.isArray(goal.evaluations) ? goal.evaluations.length : 0}
              tone="emerald"
            />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <ProgressMeters
            executionPct={executionPct}
            attainmentPct={attainmentPct}
            measurableCount={attainment.measurable_count}
            metCount={attainment.met_count}
            done={doneTasks}
            total={totalTasks}
            achieved={isAchieved}
          />
          <QualityScoreCard
            score={gs?.quality?.score ?? qualityQ.data?.score}
            suggestions={gs?.quality?.suggestions ?? qualityQ.data?.suggestions ?? []}
            dimensions={gs?.quality?.dimensions}
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
        <div className="flex flex-col gap-4">
        <SuccessCriteriaCard criteria={criteria} />
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
                {gs?.hidden_linked_plan_count
                  ? ` · +${gs.hidden_linked_plan_count} you can't access`
                  : ''}
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
        <BottlenecksCard bottlenecks={gs?.bottlenecks || []} />
        </div>
      )}

      {tab === 'tasks' && <TasksDependenciesPanel pathQ={pathQ} />}

      {tab === 'knowledge' && <KnowledgePanel goalId={goal.id} />}

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
 * Bottlenecks — incomplete achiever-path tasks blocking the most downstream
 * work, from goal_state. Renders nothing when clear (keeps the page calm).
 */
const BottlenecksCard: React.FC<{ bottlenecks: GoalStateResult['bottlenecks'] }> = ({ bottlenecks }) => {
  const open = (bottlenecks || []).filter((b) => b.status !== 'completed');
  if (open.length === 0) return null;
  return (
    <Card pad={20}>
      <SectionHead kicker="◆ Bottlenecks" title="Holding the goal back" />
      <ul className="mt-3 flex flex-col gap-1.5">
        {open.map((b) => (
          <li
            key={b.node_id}
            className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[12.5px]"
          >
            <span
              className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                b.status === 'blocked' ? 'bg-red' : b.status === 'in_progress' ? 'bg-amber' : 'bg-text-muted/40'
              }`}
            />
            <span className="truncate text-text" title={b.title}>
              {b.title}
            </span>
            {b.direct_downstream_count > 0 && (
              <span className="ml-auto flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
                blocks {b.direct_downstream_count}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
};

/**
 * Success-criteria list — renders the goal's structured criteria. Measurable
 * ones (metric + target + direction) show current→target and a met/open badge;
 * qualitative ones render as plain statements. This is what makes "done"
 * inspectable instead of a bare count.
 */
const SuccessCriteriaCard: React.FC<{ criteria: GoalCriterion[] }> = ({ criteria }) => {
  const measurable = criteria.filter(isMeasurableCriterion);
  const metCount = measurable.filter(isCriterionMet).length;
  return (
    <Card pad={20}>
      <SectionHead
        kicker="◆ Success criteria"
        title="What “done” means"
        right={
          measurable.length > 0 ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              {metCount}/{measurable.length} met
            </span>
          ) : null
        }
      />
      {criteria.length === 0 ? (
        <p className="mt-2 text-[12.5px] leading-[1.55] text-text-sec">
          No success criteria yet. Agents add measurable criteria (metric + target + direction) so
          attainment can be tracked.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {criteria.map((c, i) => (
            <CriterionRow key={c.id || i} c={c} />
          ))}
        </ul>
      )}
    </Card>
  );
};

const CriterionRow: React.FC<{ c: GoalCriterion }> = ({ c }) => {
  const measurable = isMeasurableCriterion(c);
  const met = measurable && isCriterionMet(c);
  const dot = !measurable ? 'bg-text-muted/40' : met ? 'bg-emerald' : 'bg-amber';
  const arrow = c.direction === 'increase' ? '↑' : c.direction === 'decrease' ? '↓' : '';
  return (
    <li className="flex items-start gap-2.5 rounded-md border border-border bg-surface px-3 py-2.5">
      <span className={`mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full ${dot}`} />
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] leading-[1.5] text-text">{c.statement}</p>
        {measurable ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">{c.metric}</span>
            <span className="font-mono text-[11px] tabular-nums text-text-sec">
              {c.direction === 'boolean'
                ? met ? 'done' : 'pending'
                : `${c.current ?? '—'} ${arrow} ${c.target}${c.unit ? ` ${c.unit}` : ''}`}
            </span>
            <Pill color={met ? 'emerald' : 'amber'}>{met ? 'met' : 'open'}</Pill>
          </div>
        ) : (
          <span className="mt-1 inline-block font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
            qualitative · not measurable
          </span>
        )}
      </div>
    </li>
  );
};

/**
 * Progress meters — execution (tasks completed) vs attainment (success criteria
 * met). These are deliberately DISTINCT: a goal can be 100% task-done yet 0%
 * attained. attainment_pct is null when the goal has no measurable criteria.
 */
const ProgressMeters: React.FC<{
  executionPct: number;
  attainmentPct: number | null;
  measurableCount: number;
  metCount: number;
  done: number;
  total: number;
  achieved: boolean;
}> = ({ executionPct, attainmentPct, measurableCount, metCount, done, total, achieved }) => {
  return (
    <Card pad={20}>
      <div className="mb-3 flex items-center justify-between gap-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
        <span>◇ Progress</span>
        {achieved && <Pill color="emerald">✓ Achieved</Pill>}
      </div>

      {/* Attainment — the outcome meter (criteria met). Headline when measurable. */}
      <div className="mb-4">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-sec">Attainment</span>
          <span className="font-mono text-[11px] tabular-nums text-text">
            {attainmentPct != null ? `${attainmentPct}%` : '—'}
          </span>
        </div>
        <div className="h-[6px] w-full overflow-hidden rounded-full bg-surface-hi">
          {attainmentPct != null && (
            <div
              className={`h-full ${attainmentPct >= 100 ? 'bg-emerald' : 'bg-violet'}`}
              style={{ width: `${attainmentPct}%` }}
            />
          )}
        </div>
        <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-muted">
          {measurableCount > 0
            ? `${metCount}/${measurableCount} measurable criteria met`
            : 'No measurable criteria — add metric + target'}
        </span>
      </div>

      {/* Execution — the work meter (tasks done). */}
      <div>
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-sec">Execution</span>
          <span className="font-mono text-[11px] tabular-nums text-text">{executionPct}%</span>
        </div>
        <div className="h-[6px] w-full overflow-hidden rounded-full bg-surface-hi">
          <div className="h-full bg-amber" style={{ width: `${executionPct}%` }} />
        </div>
        <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-muted">
          {total > 0 ? `${done}/${total} tasks complete` : 'No linked tasks yet'}
        </span>
      </div>
    </Card>
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
  dimensions?: GoalStateResult['quality']['dimensions'];
  stats: { done: number; inFlight: number; blocked: number; waiting: number; total: number };
}> = ({ score, suggestions, dimensions, stats }) => {
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
      {dimensions && (
        <ul className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
          {(['clarity', 'measurability', 'actionability', 'knowledge_grounding', 'commitment'] as const).map((key) => {
            const d = dimensions[key];
            if (!d) return null;
            const pct = Math.round((d.score || 0) * 100);
            return (
              <li key={key} className="flex items-center gap-2.5" title={d.detail}>
                <span className="w-[88px] flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-text-muted">
                  {key.replace('_', ' ')}
                </span>
                <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-surface-hi">
                  <div
                    className={`h-full ${pct >= 80 ? 'bg-emerald' : pct >= 40 ? 'bg-amber' : 'bg-red'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-[112px] flex-shrink-0 truncate text-right font-mono text-[9px] text-text-muted">
                  {d.detail}
                </span>
              </li>
            );
          })}
        </ul>
      )}
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
 * Knowledge panel — surfaces what the knowledge graph knows about
 * each achiever task. Built off /goals/:id/knowledge-gaps which
 * already returns top facts per task plus gap classifications.
 */
const KnowledgePanel: React.FC<{ goalId: string }> = ({ goalId }) => {
  const gaps = useGoalKnowledgeGaps(goalId);
  if (gaps.isLoading) {
    return (
      <Card pad={20}>
        <p className="text-[12.5px] text-text-muted">Loading knowledge…</p>
      </Card>
    );
  }
  if (!gaps.data?.available) {
    return (
      <Card pad={20}>
        <p className="text-[12.5px] text-text-sec">
          Knowledge graph not available — add a Graphiti episode with{' '}
          <code className="rounded bg-surface-hi px-1 py-0.5 font-mono text-[11px]">add_learning</code>{' '}
          via MCP to start populating knowledge.
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
        <SectionHead kicker="◇ Knowledge" title="What the graph knows about achievers" />
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
// Drill-down behind the "N knowledge contradictions" count — shows the actual
// superseded (outdated) facts and the current facts that replaced them, so the
// number is inspectable in the product instead of only via the API.
const ContradictionsModal: React.FC<{ goalId: string; onClose: () => void }> = ({ goalId, onClose }) => {
  const q = useQuery<GoalContradictions>(
    ['goal', goalId, 'contradictions'],
    () => goalDashboardService.getContradictions(goalId),
    { enabled: !!goalId },
  );
  const superseded = q.data?.superseded || [];
  const current = q.data?.current || [];
  const fmt = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <Card pad={0} className="relative z-10 w-full max-w-2xl overflow-hidden">
        <div className="flex items-start justify-between border-b border-border px-5 py-3.5">
          <div>
            <Kicker className="mb-1">◇ Knowledge</Kicker>
            <h3 className="font-display text-[16px] font-semibold text-text">Knowledge contradictions</h3>
            <p className="mt-0.5 text-[11.5px] text-text-sec">
              Facts about this goal’s work that newer knowledge has superseded.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-[13px] text-text-muted hover:text-text">✕</button>
        </div>

        <div className="max-h-[68vh] overflow-y-auto px-5 py-4">
          {q.isLoading && <p className="text-[12.5px] text-text-sec">Loading contradictions…</p>}
          {q.isError && <p className="text-[12.5px] text-red">Couldn’t load contradiction details.</p>}
          {!q.isLoading && !q.isError && superseded.length === 0 && current.length === 0 && (
            <p className="text-[12.5px] text-text-sec">
              No contradiction details available — knowledge may be consistent now, or the knowledge graph is unavailable.
            </p>
          )}

          {superseded.length > 0 && (
            <section className="mb-5">
              <div className="mb-2 flex items-center gap-2">
                <Pill color="red">Superseded</Pill>
                <span className="text-[11px] text-text-muted">Outdated — replaced by newer knowledge</span>
              </div>
              <ul className="flex flex-col gap-2">
                {superseded.map((f) => (
                  <li key={f.uuid} className="rounded-lg border border-red/30 bg-red/5 px-3 py-2">
                    <p className="text-[13px] leading-[1.5] text-text">{f.fact}</p>
                    <div className="mt-1 font-mono text-[10px] text-text-muted">
                      {f.created_at ? `recorded ${fmt(f.created_at)}` : ''}
                      {f.expired_at || f.invalid_at ? ` · superseded ${fmt(f.expired_at || f.invalid_at)}` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {current.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-2">
                <Pill color="emerald">Current</Pill>
                <span className="text-[11px] text-text-muted">In effect now</span>
              </div>
              <ul className="flex flex-col gap-2">
                {current.map((f) => (
                  <li key={f.uuid} className="rounded-lg border border-border bg-bg/40 px-3 py-2">
                    <p className="text-[13px] leading-[1.5] text-text">{f.fact}</p>
                    <div className="mt-1 font-mono text-[10px] text-text-muted">
                      {f.created_at ? `recorded ${fmt(f.created_at)}` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-5 flex justify-end">
            <Link
              to="/app/knowledge/timeline"
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted hover:text-text"
            >
              Open Knowledge Timeline →
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

const TensionHotspots: React.FC<{ goalId: string }> = ({ goalId }) => {
  const [showContradictions, setShowContradictions] = useState(false);
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
  // Gate the empty state on the signal queries having LOADED. Before they
  // resolve every count defaults to 0, which optimistically rendered "No active
  // tensions" and then flipped to "8 contradictions" once data arrived.
  const signalsLoading = coherence.isLoading || cov.isLoading || briefing.isLoading;
  const empty =
    decisionsCount === 0 &&
    blockedCount === 0 &&
    contradictionsCount === 0 &&
    plansWithStale.length === 0 &&
    plansWithConflict.length === 0;

  return (
    <>
    <Card pad={20}>
      <SectionHead
        kicker="◇ Tensions"
        title="Hotspots"
        right={
          coherence.data ? (
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
              {`${Math.round(coherenceScore * 100)}% in sync`}
            </span>
          ) : null
        }
      />
      {signalsLoading ? (
        <p className="text-[12.5px] leading-[1.55] text-text-muted">Checking for tensions…</p>
      ) : empty ? (
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
              <button
                type="button"
                onClick={() => setShowContradictions(true)}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber hover:opacity-80"
              >
                Inspect →
              </button>
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
    {showContradictions && (
      <ContradictionsModal goalId={goalId} onClose={() => setShowContradictions(false)} />
    )}
    </>
  );
};

// ─── Move goal to workspace modal ────────────────────────────────

const MoveGoalModal: React.FC<{
  goal: { id: string; title: string; workspaceId?: string | null; workspace_id?: string | null };
  onClose: () => void;
}> = ({ goal, onClose }) => {
  const { data: wsData } = useWorkspaces();
  const update = useUpdateGoal();
  const currentId = goal.workspaceId ?? goal.workspace_id ?? '';
  const [target, setTarget] = useState<string>(currentId);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    try {
      await update.mutateAsync({ id: goal.id, workspaceId: target || null } as any);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to move goal.');
    }
  }

  const dirty = target !== currentId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Kicker className="block">Move goal</Kicker>
        <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
          Move "{goal.title}" to a workspace
        </h2>
        <p className="mt-1 text-[12.5px] text-text-sec">
          Goals live inside workspaces (folders under your organization). Unassign to leave the goal org-personal.
        </p>

        <label className="mt-4 block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">Workspace</span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-amber"
          >
            <option value="">— Unassigned —</option>
            {(wsData?.workspaces ?? []).filter((w) => !w.archivedAt).map((w) => (
              <option key={w.id} value={w.id}>{w.title}{w.isDefault ? ' (default)' : ''}</option>
            ))}
          </select>
        </label>

        {error && (
          <div className="mt-3 rounded-md border border-red bg-red/[0.08] px-3 py-2 text-[12px] text-red">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onClose} disabled={update.isLoading}>Cancel</GhostButton>
          <PrimaryButton onClick={submit} disabled={update.isLoading || !dirty}>
            {update.isLoading ? 'Moving…' : 'Move'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

/**
 * Breadcrumb at the top of a goal detail. Promotes the workspace into
 * the path when present: `Workspaces › <Workspace> › Goals · <type>`.
 * Falls back to plain `Goals · <type>` for personal/unscoped goals.
 */
const GoalBreadcrumb: React.FC<{ goal: { workspaceId?: string | null; workspace_id?: string | null; type: string } }> = ({ goal }) => {
  const wsId = goal.workspaceId ?? goal.workspace_id ?? undefined;
  const { data: ws } = useWorkspace(wsId);
  return (
    <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
      {wsId && ws ? (
        <>
          <Link to="/app/workspaces" className="hover:text-text">Workspaces</Link>
          <span aria-hidden>›</span>
          <Link to={`/app/workspaces/${ws.id}`} className="hover:text-text">{ws.title}</Link>
          <span aria-hidden>›</span>
        </>
      ) : null}
      <Link to="/app/goals" className="hover:text-text">Goals</Link>
      <span aria-hidden>›</span>
      <span className="text-text-sec">{goal.type}</span>
    </div>
  );
};

/**
 * Inline chip rendered next to the goal-status pills, declaring which
 * workspace the goal lives in. Renders `Personal` for goals without a
 * workspace (org-less, or pre-backfill rows).
 */
const WorkspaceChip: React.FC<{ goal: { workspaceId?: string | null; workspace_id?: string | null } }> = ({ goal }) => {
  const wsId = goal.workspaceId ?? goal.workspace_id ?? undefined;
  const { data: ws } = useWorkspace(wsId);
  if (wsId && ws) {
    return (
      <Link to={`/app/workspaces/${ws.id}`} className="inline-flex">
        <ObjectChip kind="workspace" label={ws.title} />
      </Link>
    );
  }
  return (
    <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">
      Personal · no workspace
    </span>
  );
};

export default GoalDetailV1;
