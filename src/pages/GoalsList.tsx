import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  GhostButton,
  Kicker,
  ObjectChip,
  Pill,
  PrimaryButton,
  StatusSpine,
  cn,
  type PillColor,
} from '../components/v1';
import { usePlans } from '../hooks/usePlans';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { useGoalsTree, type GoalV2 } from '../hooks/useGoalsV2';
import { useUI } from '../contexts/UIContext';
import { GOAL_STARTER, PLAN_STARTER } from '../components/chat/starters';
import type { Plan, PlanStatus } from '../types';
import { agentActivityKind } from './PlansList.helpers';

type StatusFilter = 'all' | PlanStatus;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'draft', label: 'Draft' },
  { id: 'completed', label: 'Done' },
  { id: 'archived', label: 'Archived' },
];

type SortKey = 'updated' | 'created' | 'title';

const STATUS_COLOR: Record<PlanStatus, PillColor> = {
  active: 'amber',
  draft: 'slate',
  completed: 'emerald',
  archived: 'slate',
};

// Goal vocabulary borrowed from the (now folded-in) Goals page. Glyph color
// classes are STATIC strings so Tailwind's purge keeps them.
const GOAL_GLYPH: Record<string, string> = {
  outcome: '◉', metric: '▲', constraint: '◐', principle: '◆',
};
const GOAL_GLYPH_CLS: Record<string, string> = {
  outcome: 'text-amber', metric: 'text-emerald', constraint: 'text-red', principle: 'text-violet',
};
const GOAL_STATUS_PILL: Record<string, PillColor> = {
  active: 'amber', achieved: 'emerald', paused: 'slate', abandoned: 'slate',
};

/** Flatten the goal tree to a list carrying depth, parents before children. */
function flattenGoals(goals: GoalV2[], depth = 0): (GoalV2 & { depth: number })[] {
  const out: (GoalV2 & { depth: number })[] = [];
  for (const g of goals) {
    out.push({ ...g, depth });
    if (g.children?.length) out.push(...flattenGoals(g.children, depth + 1));
  }
  return out;
}

const goalWorkspaceId = (g: { workspaceId?: string | null; workspace_id?: string | null }) =>
  g.workspaceId || g.workspace_id || null;

/**
 * Segmented progress bar — emerald (done) → amber (doing) → red
 * (blocked) over a slate (todo) base. Lets the Plans Index communicate
 * not just "how far" a plan is but "where the work is sitting" at a
 * glance. Hidden on plans with no tasks.
 */
const SegmentedProgress: React.FC<{
  stats: NonNullable<Plan['stats']>;
  className?: string;
}> = ({ stats, className }) => {
  const total = stats.total || 1;
  const segs = [
    { key: 'done', count: stats.done, cls: 'bg-emerald' },
    { key: 'doing', count: stats.doing, cls: 'bg-amber' },
    { key: 'blocked', count: stats.blocked, cls: 'bg-red' },
  ];
  return (
    <div
      className={`flex h-[3px] w-full overflow-hidden rounded-full bg-surface-hi ${className || ''}`}
      role="img"
      aria-label={`${stats.done} done, ${stats.doing} in progress, ${stats.blocked} blocked, ${stats.todo} todo of ${total}`}
    >
      {segs.map((s) =>
        s.count > 0 ? (
          <div key={s.key} className={s.cls} style={{ width: `${(s.count / total) * 100}%` }} />
        ) : null,
      )}
    </div>
  );
};

/**
 * Days since timestamp. Used to flag stale plans (>5 days without an
 * update) so they show a red status spine + 'Stale · Nd' pill.
 */
function daysSince(iso: string | undefined): number {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function relativeTime(iso: string | undefined): string {
  if (!iso) return 'never';
  const days = daysSince(iso);
  if (days === 0) {
    const hours = Math.floor((Date.now() - new Date(iso).getTime()) / (60 * 60 * 1000));
    if (hours <= 0) return 'just now';
    if (hours === 1) return '1h ago';
    return `${hours}h ago`;
  }
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

/**
 * A single plan row. Extracted so it can render both under a goal section
 * and under the "Unlinked plans" group. The goal tether link is omitted —
 * under a goal header it's redundant; unlinked plans have no tether.
 */
const PlanRow: React.FC<{
  plan: Plan;
  workspacesById: Map<string, { id: string; title: string }>;
}> = ({ plan, workspacesById }) => {
  const stale = plan.active && daysSince(plan.updated_at) > 5;
  const accent: PillColor = stale ? 'red' : plan.active ? 'amber' : 'slate';
  return (
    <Link to={`/app/plans/${plan.id}`} className="block">
      <StatusSpine accent={accent}>
        <div className="flex items-center gap-4 px-[18px] py-[14px]">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-display text-sm font-semibold tracking-[-0.01em] text-text">
                {plan.title}
              </span>
              {plan.visibility === 'public' && (
                <span className="rounded border border-border px-[5px] py-[1px] font-mono text-[9px] uppercase tracking-[0.08em] text-text-muted">
                  Public
                </span>
              )}
              {stale && <Pill color="red">Stale · {daysSince(plan.updated_at)}d</Pill>}
              <Pill color={plan.active ? 'emerald' : 'slate'}>
                {plan.active ? 'Active' : 'Inactive'}
              </Pill>
              {/* Surface terminal lifecycle states alongside the execution flag */}
              {(plan.status === 'completed' || plan.status === 'archived') && (
                <Pill color={STATUS_COLOR[plan.status]}>{plan.status}</Pill>
              )}
              {(() => {
                const wsId = (plan as any).workspace_id || (plan as any).workspaceId;
                if (!wsId) return null;
                const ws = workspacesById.get(wsId);
                if (!ws) return null;
                return <ObjectChip kind="workspace" label={ws.title} dim />;
              })()}
              {/* Agent activity within last 5 min → live dot, last hour → recent (idle) */}
              {agentActivityKind(plan.last_agent_log_at) === 'live' && (
                <span
                  className="inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-emerald"
                  title={`Last agent log ${relativeTime(plan.last_agent_log_at!)}`}
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" aria-hidden />
                  live
                </span>
              )}
              {agentActivityKind(plan.last_agent_log_at) === 'recent' && (
                <span
                  className="inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-text-muted"
                  title={`Last agent log ${relativeTime(plan.last_agent_log_at!)}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted" aria-hidden />
                  idle · {relativeTime(plan.last_agent_log_at!)}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
              <span className="font-mono uppercase tracking-[0.1em] text-[9.5px]">updated</span>
              <span className="font-mono text-[10px]">{relativeTime(plan.updated_at)}</span>
              {plan.stats && plan.stats.total > 0 && (
                <>
                  <span className="text-border-hi">·</span>
                  <span className="font-mono text-[10px]">
                    {plan.stats.done}/{plan.stats.total} tasks
                  </span>
                  {plan.stats.blocked > 0 && (
                    <Pill color="red">{plan.stats.blocked} blocked</Pill>
                  )}
                </>
              )}
              {plan.description && (
                <>
                  <span className="text-border-hi">·</span>
                  <span className="truncate">{plan.description}</span>
                </>
              )}
            </div>
            {plan.stats && plan.stats.total > 0 && (
              <SegmentedProgress className="mt-2" stats={plan.stats} />
            )}
          </div>
          {typeof plan.progress === 'number' && (
            <div className="flex-shrink-0 text-right font-display text-sm font-bold tracking-[-0.02em] text-text">
              {Math.round(plan.progress)}%
            </div>
          )}
        </div>
      </StatusSpine>
    </Link>
  );
};

/** A goal as a section header above its nested plans. Lightweight — borrows
 *  the type glyph, status, plan count, and a thin progress bar from the goal. */
type GoalHeaderData = {
  id: string;
  title: string;
  type?: string;
  status?: string;
  progress?: { completion_percentage?: number } | null;
};

const GoalSectionHeader: React.FC<{
  goal: GoalHeaderData;
  depth?: number;
  planCount: number;
}> = ({ goal, depth = 0, planCount }) => {
  const glyph = GOAL_GLYPH[goal.type ?? 'outcome'] ?? GOAL_GLYPH.outcome;
  const glyphCls = GOAL_GLYPH_CLS[goal.type ?? 'outcome'] ?? GOAL_GLYPH_CLS.outcome;
  const statusColor = GOAL_STATUS_PILL[goal.status ?? 'active'] ?? 'slate';
  const pct = goal.progress?.completion_percentage;
  return (
    <Link
      to={`/app/goals/${goal.id}`}
      className="group flex items-center gap-2.5 px-1 py-1"
      style={{ marginLeft: depth ? depth * 16 : undefined }}
    >
      <span className={cn('font-mono text-[13px] leading-none', glyphCls)} aria-hidden>
        {glyph}
      </span>
      <span className="truncate font-display text-[15px] font-semibold tracking-[-0.02em] text-text underline-offset-4 group-hover:underline">
        {goal.title}
      </span>
      <Pill color={statusColor}>{goal.status ?? 'active'}</Pill>
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted">
        {planCount} plan{planCount === 1 ? '' : 's'}
      </span>
      {typeof pct === 'number' && (
        <div className="ml-auto flex flex-shrink-0 items-center gap-2">
          <div className="h-[3px] w-[120px] overflow-hidden rounded-full bg-surface-hi">
            <div className="h-full bg-emerald" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-display text-[12px] font-bold text-text-sec">{pct}%</span>
        </div>
      )}
    </Link>
  );
};

const GoalsList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { plans, isLoading } = usePlans(1, 100);
  const { data: goalTree, isLoading: goalsLoading } = useGoalsTree();
  const { data: wsData } = useWorkspaces();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('updated');
  const [query, setQuery] = useState('');
  const [showEmptyGoals, setShowEmptyGoals] = useState(false);
  const { openChatDockWithDraft } = useUI();
  const workspaceFilter = searchParams.get('workspace') || 'all';
  const setWorkspaceFilter = (id: string) => {
    const next = new URLSearchParams(searchParams);
    if (id === 'all') next.delete('workspace');
    else next.set('workspace', id);
    setSearchParams(next, { replace: true });
  };

  const workspacesById = useMemo(() => {
    const m = new Map<string, { id: string; title: string }>();
    for (const w of wsData?.workspaces ?? []) m.set(w.id, { id: w.id, title: w.title });
    return m;
  }, [wsData]);

  // Plan-level filtering. Search matches the plan's own text OR any of its
  // tethered goal titles (carried on plan.goal_tethers), so a goal-name search
  // surfaces the plans beneath it.
  const filteredPlans = useMemo<Plan[]>(() => {
    if (!plans) return [];
    let list = [...(plans as Plan[])];
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
    if (workspaceFilter !== 'all') {
      list = list.filter((p) => {
        const wsId = (p as any).workspace_id || (p as any).workspaceId;
        if (workspaceFilter === 'none') return !wsId;
        return wsId === workspaceFilter;
      });
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.goal_tethers || []).some((t) => (t.goal_title || '').toLowerCase().includes(q)),
      );
    }
    const sortPlans = (a: Plan, b: Plan) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      const aIso = sort === 'created' ? a.created_at : a.updated_at;
      const bIso = sort === 'created' ? b.created_at : b.updated_at;
      return new Date(bIso).getTime() - new Date(aIso).getTime();
    };
    return list.sort(sortPlans);
  }, [plans, statusFilter, workspaceFilter, sort, query]);

  // Bucket filtered plans under their goals (dedup per goal) + an unlinked set.
  const { plansByGoal, unlinked } = useMemo(() => {
    const byGoal = new Map<string, Plan[]>();
    const none: Plan[] = [];
    for (const p of filteredPlans) {
      const tethers = p.goal_tethers ?? [];
      if (tethers.length === 0) {
        none.push(p);
        continue;
      }
      const seen = new Set<string>();
      for (const t of tethers) {
        if (!t.goal_id || seen.has(t.goal_id)) continue;
        seen.add(t.goal_id);
        const arr = byGoal.get(t.goal_id) ?? [];
        arr.push(p);
        byGoal.set(t.goal_id, arr);
      }
    }
    return { plansByGoal: byGoal, unlinked: none };
  }, [filteredPlans]);

  // Ordered goal groups: tree order first (rich headers), then any tethered
  // goals missing from the tree (synthesized from the tether title so plans
  // never silently disappear), then the unlinked group is rendered separately.
  const goalGroups = useMemo(() => {
    const flat = flattenGoals(goalTree ?? []);
    const groups: { goal: GoalHeaderData; depth: number; plans: Plan[] }[] = [];
    const rendered = new Set<string>();
    const q = query.trim().toLowerCase();
    for (const g of flat) {
      const gp = plansByGoal.get(g.id) ?? [];
      const wsId = goalWorkspaceId(g);
      const goalMatchesWs =
        workspaceFilter === 'all'
          ? true
          : workspaceFilter === 'none'
            ? !wsId
            : wsId === workspaceFilter;
      const goalMatchesQuery = !q || g.title.toLowerCase().includes(q);
      if (gp.length > 0 || (showEmptyGoals && goalMatchesWs && goalMatchesQuery)) {
        groups.push({ goal: g, depth: g.depth, plans: gp });
        rendered.add(g.id);
      }
    }
    // Orphan goals — tethered plans whose goal isn't in the tree (cross-workspace
    // visibility, or a failed /goals/tree). Render with a minimal header.
    for (const [goalId, gp] of plansByGoal) {
      if (rendered.has(goalId)) continue;
      const title =
        gp[0]?.goal_tethers?.find((t) => t.goal_id === goalId)?.goal_title || 'Goal';
      groups.push({ goal: { id: goalId, title }, depth: 0, plans: gp });
      rendered.add(goalId);
    }
    return groups;
  }, [goalTree, plansByGoal, showEmptyGoals, workspaceFilter, query]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: plans?.length || 0,
      active: 0,
      draft: 0,
      completed: 0,
      archived: 0,
    };
    (plans || []).forEach((p: Plan) => {
      c[p.status] = (c[p.status] || 0) + 1;
    });
    return c;
  }, [plans]);

  // Stable goal total from the full tree — independent of filters / the
  // "show empty goals" toggle, so the header count doesn't jump around.
  const goalCount = useMemo(() => flattenGoals(goalTree ?? []).length, [goalTree]);

  const loading = isLoading || goalsLoading;
  const nothing = !loading && goalGroups.length === 0 && unlinked.length === 0;

  return (
    <div className="mx-auto max-w-[1180px] 2xl:max-w-[1600px] px-6 py-10 sm:px-9">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker className="mb-2">◆ Goals</Kicker>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
            Goals
          </h1>
          <p className="mt-1 text-[13px] text-text-sec">
            {loading
              ? 'Loading…'
              : `${goalCount} goal${goalCount === 1 ? '' : 's'} · ${plans.length} plan${plans.length === 1 ? '' : 's'} · ${counts.active} active`}
          </p>
        </div>
        {/* Create flows hand off to the assistant (agent-first: the LLM
            refines intent into structure — type, criteria, phases, deps —
            instead of a form collecting raw fields). */}
        <div className="flex items-center gap-2" data-tour="create-actions">
          <GhostButton onClick={() => openChatDockWithDraft(GOAL_STARTER)}>+ New goal</GhostButton>
          <PrimaryButton onClick={() => openChatDockWithDraft(PLAN_STARTER)}>+ New plan</PrimaryButton>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3" data-tour="plan-filters">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={statusFilter === f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`rounded-full border px-3 py-[5px] font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${
                statusFilter === f.id
                  ? 'border-amber bg-amber-soft text-amber'
                  : 'border-border bg-surface text-text-sec hover:bg-surface-hi'
              }`}
            >
              {f.label} · {counts[f.id]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-text-sec">
            <input
              type="checkbox"
              checked={showEmptyGoals}
              onChange={(e) => setShowEmptyGoals(e.target.checked)}
              className="accent-amber"
            />
            Show empty goals
          </label>
          <input
            type="search"
            placeholder="Search goals & plans…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-[6px] text-xs text-text placeholder:text-text-muted focus:outline-none sm:flex-none"
          />
          <select
            value={workspaceFilter}
            onChange={(e) => setWorkspaceFilter(e.target.value)}
            className={`rounded-md border bg-surface px-3 py-[6px] text-xs focus:outline-none ${
              workspaceFilter !== 'all' ? 'border-amber text-text' : 'border-border text-text-sec'
            }`}
            title="Filter by workspace"
          >
            <option value="all">Workspace: Any</option>
            {(wsData?.workspaces ?? []).filter((w) => !w.archivedAt).map((w) => (
              <option key={w.id} value={w.id}>{w.title}</option>
            ))}
            <option value="none">— Unassigned —</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-border bg-surface px-3 py-[6px] text-xs text-text focus:outline-none"
          >
            <option value="updated">Updated</option>
            <option value="created">Created</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {loading && (
        <Card pad={20}>
          <span className="text-sm text-text-muted">Loading goals…</span>
        </Card>
      )}

      {nothing && (
        <Card pad={32}>
          <div className="text-center">
            {query || statusFilter !== 'all' || workspaceFilter !== 'all' ? (
              <>
                <p className="font-display text-base font-semibold text-text">Nothing matches</p>
                <p className="mt-2 text-sm text-text-sec">No goals or plans match the current filters.</p>
              </>
            ) : goalCount > 0 ? (
              <>
                <p className="font-display text-base font-semibold text-text">No plans yet</p>
                <p className="mt-2 text-sm text-text-sec">
                  Your goals don’t have any plans yet. Tick “Show empty goals” to see them, or add a plan.
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-base font-semibold text-text">No goals here yet</p>
                <p className="mt-2 text-sm text-text-sec">
                  Tell the assistant what you want to achieve — it will shape it into a goal with you.
                </p>
                <PrimaryButton className="mt-4" onClick={() => openChatDockWithDraft(GOAL_STARTER)}>
                  Start with the assistant →
                </PrimaryButton>
              </>
            )}
          </div>
        </Card>
      )}

      {!loading && (
        <div className="flex flex-col gap-7" data-tour="plan-list">
          {goalGroups.map(({ goal, depth, plans: gp }) => (
            <section key={goal.id}>
              <GoalSectionHeader goal={goal} depth={depth} planCount={gp.length} />
              {gp.length > 0 ? (
                <div
                  className="mt-1.5 flex flex-col gap-2"
                  style={{ marginLeft: depth ? depth * 16 : undefined }}
                >
                  {gp.map((p) => (
                    <PlanRow key={`${goal.id}:${p.id}`} plan={p} workspacesById={workspacesById} />
                  ))}
                </div>
              ) : (
                <div
                  className="mt-1.5 rounded-lg border border-dashed border-border bg-bg px-4 py-3 text-[12px] text-text-muted"
                  style={{ marginLeft: depth ? depth * 16 : undefined }}
                >
                  No plans linked yet.
                </div>
              )}
            </section>
          ))}

          {unlinked.length > 0 && (
            <section>
              <div className="flex items-center gap-2 px-1 py-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
                  — Plans without a goal · {unlinked.length}
                </span>
              </div>
              <div className="mt-1.5 flex flex-col gap-2">
                {unlinked.map((p) => (
                  <PlanRow key={`none:${p.id}`} plan={p} workspacesById={workspacesById} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalsList;
