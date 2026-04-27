import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Kicker,
  Pill,
  PrimaryButton,
  Spark,
  cn,
  type PillColor,
} from '../components/v1';
import {
  useGoalsTree,
  useCreateGoal,
  GoalV2,
} from '../hooks/useGoalsV2';

type GoalType = 'outcome' | 'constraint' | 'metric' | 'principle';
type GoalStatus = 'active' | 'achieved' | 'paused' | 'abandoned';

const TYPE_CONFIG: Record<GoalType, { label: string; glyph: string; color: PillColor }> = {
  outcome:    { label: 'Outcome',    glyph: '◉', color: 'amber' },
  metric:     { label: 'Metric',     glyph: '▲', color: 'emerald' },
  constraint: { label: 'Constraint', glyph: '◐', color: 'red' },
  principle:  { label: 'Principle',  glyph: '◆', color: 'violet' },
};

const STATUS_SPINE: Record<GoalStatus, PillColor> = {
  active:    'amber',
  achieved:  'emerald',
  paused:    'slate',
  abandoned: 'slate',
};

const STATUS_FILTERS: { id: 'all' | GoalStatus; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'active',    label: 'Active' },
  { id: 'achieved',  label: 'Achieved' },
  { id: 'paused',    label: 'Paused' },
  { id: 'abandoned', label: 'Abandoned' },
];

const TYPE_FILTERS: { id: 'all' | GoalType; label: string; glyph?: string; color?: PillColor }[] = [
  { id: 'all',        label: 'All' },
  { id: 'outcome',    label: 'Outcome',    glyph: '◉', color: 'amber' },
  { id: 'metric',     label: 'Metric',     glyph: '▲', color: 'emerald' },
  { id: 'constraint', label: 'Constraint', glyph: '◐', color: 'red' },
  { id: 'principle',  label: 'Principle',  glyph: '◆', color: 'violet' },
];

type SortKey = 'attention' | 'updated' | 'title';

function flattenGoals(goals: GoalV2[], depth = 0): (GoalV2 & { depth: number })[] {
  const result: (GoalV2 & { depth: number })[] = [];
  for (const goal of goals) {
    result.push({ ...goal, depth });
    if (goal.children?.length) result.push(...flattenGoals(goal.children, depth + 1));
  }
  return result;
}

function daysSince(iso: string | undefined): number {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

function shortDate(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

type AttentionKind = 'you' | 'atrisk' | 'noplan' | 'stale' | 'paused' | 'done';
type Attention = {
  kind: AttentionKind;
  label: string;
  color: PillColor;
} | null;

function deriveAttention(goal: GoalV2, completionPct?: number): Attention {
  const linkCount = goal.links?.length || 0;
  if (goal.status === 'achieved') {
    return { kind: 'done', label: `Done · ${shortDate(goal.updatedAt)}`, color: 'emerald' };
  }
  if (goal.status === 'paused') {
    const d = daysSince(goal.updatedAt);
    return { kind: 'paused', label: `Paused ${d}d`, color: 'slate' };
  }
  if (goal.status === 'active' && goal.type !== 'principle' && linkCount === 0) {
    return { kind: 'noplan', label: 'No plan', color: 'amber' };
  }
  if (
    goal.status === 'active' &&
    linkCount > 0 &&
    typeof completionPct === 'number' &&
    completionPct < 25 &&
    daysSince(goal.createdAt) > 14
  ) {
    return { kind: 'atrisk', label: 'At risk', color: 'red' };
  }
  if (goal.status === 'active' && daysSince(goal.updatedAt) > 5) {
    return { kind: 'stale', label: 'Stale', color: 'amber' };
  }
  return null;
}

function attentionRank(a: Attention): number {
  if (!a) return 5;
  if (a.kind === 'you') return 0;
  if (a.kind === 'atrisk') return 1;
  if (a.kind === 'noplan') return 2;
  if (a.kind === 'stale') return 3;
  if (a.kind === 'paused') return 6;
  if (a.kind === 'done') return 7;
  return 4;
}

function bdiSparkSeries(goal: GoalV2): number[] {
  // Server-side: 10-day node_logs density across achieving tasks. Real
  // BDI signal — a node_log fires whenever an agent makes progress,
  // claims, comments, or transitions status on an achieving task.
  if (Array.isArray(goal.density) && goal.density.some((v) => v > 0)) {
    return goal.density;
  }
  // Fallback: evaluations bucket. Empty for unevaluated goals.
  const evals = goal.evaluations || [];
  if (evals.length === 0) return [];
  const buckets: number[] = new Array(10).fill(0);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  for (const e of evals) {
    const ageDays = Math.floor((now - new Date(e.evaluatedAt).getTime()) / dayMs);
    if (ageDays >= 0 && ageDays < 10) buckets[9 - ageDays] += 1;
  }
  return buckets;
}

function CreateGoalDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const createGoal = useCreateGoal();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType>('outcome');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createGoal.mutateAsync({ title, type, description, priority: 0 });
    onClose();
    if (result?.id) navigate(`/app/goals/${result.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[440px] rounded-[10px] border border-border bg-surface p-5 shadow-xl"
      >
        <h3 className="mb-4 font-display text-base font-semibold text-text">Create goal</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              Title
            </label>
            <input
              placeholder="What do you want to achieve?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-amber focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              Type
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(TYPE_CONFIG) as GoalType[]).map((k) => {
                const conf = TYPE_CONFIG[k];
                const isActive = type === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setType(k)}
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors',
                      isActive
                        ? 'border-amber bg-amber-soft text-amber'
                        : 'border-border bg-bg text-text-sec hover:bg-surface-hi',
                    )}
                  >
                    <TypeGlyph color={conf.color}>{conf.glyph}</TypeGlyph>
                    {conf.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              Description
            </label>
            <textarea
              placeholder="Optional context for the goal."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-amber focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-sec transition-colors hover:bg-surface-hi"
            >
              Cancel
            </button>
            <PrimaryButton
              type="submit"
              disabled={createGoal.isLoading || !title.trim()}
            >
              {createGoal.isLoading ? 'Creating…' : 'Create goal'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

const SPINE_BG: Record<PillColor, string> = {
  amber:   'bg-amber',
  emerald: 'bg-emerald',
  red:     'bg-red',
  violet:  'bg-violet',
  slate:   'bg-slate',
};

const SWATCH_BG: Record<PillColor, string> = {
  amber:   'bg-amber-soft text-amber',
  emerald: 'bg-emerald-soft text-emerald',
  red:     'bg-red-soft text-red',
  violet:  'bg-violet-soft text-violet',
  slate:   'bg-surface-hi text-text-sec',
};

function TypeGlyph({ color, children }: { color: PillColor; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-[18px] w-[18px] items-center justify-center rounded text-[11px]',
        SWATCH_BG[color],
      )}
    >
      {children}
    </span>
  );
}

function GoalRidge({
  goal,
  pulseDot,
}: {
  goal: GoalV2 & { depth: number; _attention: Attention };
  pulseDot: boolean;
}) {
  const typeConf = TYPE_CONFIG[goal.type as GoalType] ?? TYPE_CONFIG.outcome;
  const spine: PillColor = STATUS_SPINE[goal.status as GoalStatus] ?? 'slate';
  const linkCount = goal.links?.length || 0;

  // Progress now comes from /goals/tree (bulk-loaded server-side). Falls
  // back to empty stats so principle / unlinked goals render their
  // 'standing rule' / 'no plan' placeholders.
  const stats = goal.progress;
  const total = stats?.total ?? 0;
  const pct = stats && stats.total > 0 ? stats.completion_percentage : null;
  const attention = goal._attention;

  const evals = goal.evaluations || [];
  const lastScore =
    evals.length > 0
      ? [...evals].sort(
          (a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime(),
        )[0].score
      : null;
  const qualityColor =
    lastScore == null
      ? 'text-text-muted'
      : lastScore >= 80
      ? 'text-emerald'
      : lastScore >= 60
      ? 'text-amber'
      : 'text-red';

  const sparkSeries = bdiSparkSeries(goal);
  const sparkColorVar =
    goal.status === 'achieved'
      ? 'rgb(var(--emerald) / 1)'
      : goal.type === 'principle'
      ? 'rgb(var(--violet) / 1)'
      : goal.status === 'paused' || goal.status === 'abandoned'
      ? 'rgb(var(--slate) / 1)'
      : 'rgb(var(--amber) / 1)';

  return (
    <div className="relative" style={{ paddingLeft: goal.depth * 24 }}>
      {goal.depth > 0 && (
        <>
          <span
            aria-hidden
            className="absolute top-0 h-1/2 w-px bg-border"
            style={{ left: (goal.depth - 1) * 24 + 12 }}
          />
          <span
            aria-hidden
            className="absolute top-1/2 h-px bg-border"
            style={{ left: (goal.depth - 1) * 24 + 12, width: 12 }}
          />
        </>
      )}

      <Link to={`/app/goals/${goal.id}`} className="block">
        <div
          className={cn(
            'relative flex overflow-hidden rounded-[10px] border border-border bg-surface',
            'transition-colors hover:bg-surface-hi',
          )}
        >
          <div className={cn('w-[3px] flex-shrink-0', SPINE_BG[spine])} />
          <div
            className="grid min-w-0 flex-1 items-center gap-4 px-4 py-3"
            style={{ gridTemplateColumns: 'minmax(0, 1fr) 110px 120px 110px 70px' }}
          >
            {/* Goal cluster */}
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-[14px]',
                  SWATCH_BG[typeConf.color],
                )}
              >
                {typeConf.glyph}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-display text-[13.5px] font-semibold tracking-[-0.01em] text-text">
                    {goal.title}
                  </span>
                  {attention && (
                    <Pill color={attention.color}>
                      {attention.kind === 'you' && (
                        <span
                          className="inline-block h-[5px] w-[5px] rounded-full bg-current"
                          aria-hidden
                        />
                      )}
                      {attention.label}
                    </Pill>
                  )}
                </div>
                <div className="mt-[2px] flex min-w-0 items-center gap-2 text-[10.5px] text-text-muted">
                  <span
                    className={cn(
                      'flex-shrink-0 font-mono uppercase tracking-[0.14em] text-[9px]',
                      `text-${typeConf.color}`,
                    )}
                    style={{ color: `rgb(var(--${typeConf.color}) / 1)` }}
                  >
                    {typeConf.label}
                  </span>
                  {goal.description && (
                    <>
                      <span className="text-border-hi">·</span>
                      <span className="truncate">{goal.description}</span>
                    </>
                  )}
                  {goal.ownerName && (
                    <>
                      <span className="flex-shrink-0 text-border-hi">·</span>
                      <span className="flex-shrink-0 font-mono text-[10px]">{goal.ownerName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* BDI density spark */}
            <div className="flex flex-col gap-[2px]">
              {sparkSeries.length > 0 ? (
                <>
                  <Spark values={sparkSeries} color={sparkColorVar} width={100} height={20} />
                  <div className="flex justify-between font-mono text-[8.5px] tracking-[0.08em] text-text-muted">
                    <span>{sparkSeries[0]}</span>
                    <span>{sparkSeries[sparkSeries.length - 1]} now</span>
                  </div>
                </>
              ) : (
                <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-text-muted">
                  no signal
                </span>
              )}
            </div>

            {/* Quality / Plans */}
            <div className="flex items-center gap-3">
              <div>
                <div
                  className={cn(
                    'font-display text-[18px] font-bold leading-none tracking-[-0.03em]',
                    qualityColor,
                  )}
                >
                  {lastScore ?? '—'}
                </div>
                <div className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-text-muted">
                  quality
                </div>
              </div>
              <div className="h-[22px] w-px bg-border" aria-hidden />
              <div>
                <div
                  className={cn(
                    'font-display text-[14px] font-semibold leading-none',
                    linkCount === 0 && goal.type !== 'principle' ? 'text-red' : 'text-text',
                  )}
                >
                  {linkCount}
                </div>
                <div className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-text-muted">
                  {linkCount === 1 ? 'plan' : 'plans'}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-1">
              {goal.type === 'principle' ? (
                <span className="py-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-text-muted">
                  standing rule
                </span>
              ) : stats && total > 0 ? (
                <>
                  <div className="flex h-[6px] overflow-hidden rounded-full bg-surface-hi">
                    {stats.completed > 0 && (
                      <div
                        className="bg-emerald"
                        style={{ width: `${(stats.completed / total) * 100}%` }}
                      />
                    )}
                    {stats.in_progress > 0 && (
                      <div
                        className="bg-amber"
                        style={{ width: `${(stats.in_progress / total) * 100}%` }}
                      />
                    )}
                    {stats.blocked > 0 && (
                      <div
                        className="bg-red"
                        style={{ width: `${(stats.blocked / total) * 100}%` }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9.5px]">
                    <span className="font-display font-bold text-text">{pct}%</span>
                    <span className="font-mono text-[9px] text-text-muted">
                      · {stats.completed}/{total}
                    </span>
                  </div>
                </>
              ) : linkCount === 0 ? (
                <span className="py-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-text-muted">
                  no plan
                </span>
              ) : (
                <span className="py-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-text-muted">
                  no achievers
                </span>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-end gap-1.5">
              <span
                className={cn(
                  'inline-block h-[7px] w-[7px] flex-shrink-0 rounded-full',
                  SPINE_BG[spine],
                  pulseDot && 'shadow-[0_0_0_3px_rgb(var(--amber)_/_0.18)]',
                )}
                aria-hidden
              />
              <span className="font-mono text-[9.5px] capitalize tracking-[0.06em] text-text-sec">
                {goal.status}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function GoalsPage() {
  const { data: tree, isLoading, error } = useGoalsTree();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | GoalStatus>('active');
  const [typeFilter, setTypeFilter] = useState<'all' | GoalType>('all');
  const [sort, setSort] = useState<SortKey>('attention');
  const [searchQuery, setSearchQuery] = useState('');

  const flatGoals = useMemo(() => flattenGoals(tree || []), [tree]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: flatGoals.length };
    for (const g of flatGoals) counts[g.status] = (counts[g.status] || 0) + 1;
    return counts;
  }, [flatGoals]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: flatGoals.length };
    for (const g of flatGoals) counts[g.type] = (counts[g.type] || 0) + 1;
    return counts;
  }, [flatGoals]);

  const decorated = useMemo(
    () =>
      flatGoals.map((g) => {
        // Use server-side completion_percentage (from /goals/tree) so the
        // at-risk rule fires at sort time, not after a per-row fetch.
        const pct =
          g.progress && g.progress.total > 0
            ? g.progress.completion_percentage
            : undefined;
        return {
          ...g,
          _attention: deriveAttention(g, pct),
        };
      }),
    [flatGoals],
  );

  const filtered = useMemo(() => {
    let list = decorated;
    if (statusFilter !== 'all') list = list.filter((g) => g.status === statusFilter);
    if (typeFilter !== 'all') list = list.filter((g) => g.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.description || '').toLowerCase().includes(q),
      );
    }
    if (sort === 'attention') {
      list = [...list].sort((a, b) => {
        const r = attentionRank(a._attention) - attentionRank(b._attention);
        if (r !== 0) return r;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    } else if (sort === 'updated') {
      list = [...list].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    } else {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [decorated, statusFilter, typeFilter, searchQuery, sort]);

  const activeGoals = statusCounts.active || 0;
  const needLook = decorated.filter(
    (g) =>
      g.status === 'active' &&
      g._attention &&
      (g._attention.kind === 'noplan' ||
        g._attention.kind === 'stale' ||
        g._attention.kind === 'atrisk' ||
        g._attention.kind === 'you'),
  ).length;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 sm:px-9">
      <header className="mb-6">
        <Kicker className="mb-2">◆ Goals</Kicker>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
            {activeGoals} active goal{activeGoals === 1 ? '' : 's'}
            {needLook > 0 && (
              <>
                ,{' '}
                <span className="text-amber">
                  {needLook} need{needLook === 1 ? 's' : ''} a look
                </span>
              </>
            )}
          </h1>
          <PrimaryButton onClick={() => setShowCreate(true)}>+ New goal</PrimaryButton>
        </div>
      </header>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
            Status
          </span>
          {STATUS_FILTERS.map((f) => {
            const isActive = statusFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'bg-text text-bg'
                    : 'text-text-sec hover:bg-surface-hi',
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'font-mono text-[9px]',
                    isActive ? 'opacity-70' : 'opacity-55',
                  )}
                >
                  {statusCounts[f.id] || 0}
                </span>
              </button>
            );
          })}
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Search goals…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] rounded-md border border-border bg-surface px-3 py-[6px] text-xs text-text placeholder:text-text-muted focus:border-amber focus:outline-none"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-border bg-surface px-2.5 py-[6px] font-mono text-[10px] uppercase tracking-[0.06em] text-text-sec focus:outline-none"
            >
              <option value="attention">Sort: Attention</option>
              <option value="updated">Sort: Updated</option>
              <option value="title">Sort: Title</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
            Type
          </span>
          {TYPE_FILTERS.map((f) => {
            const isActive = typeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypeFilter(f.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] transition-colors',
                  isActive
                    ? 'border-border-hi bg-surface-hi text-text'
                    : 'border-border bg-surface text-text-sec hover:bg-surface-hi',
                )}
              >
                {f.glyph && (
                  <span
                    className="text-[10px]"
                    style={{ color: f.color ? `rgb(var(--${f.color}) / 1)` : undefined }}
                  >
                    {f.glyph}
                  </span>
                )}
                {f.label}
                <span className="font-mono text-[9px] opacity-55">
                  {typeCounts[f.id] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Column header strip */}
      <div
        className="mb-2 grid items-center gap-4 border-b border-border bg-bg px-4 py-2"
        style={{ gridTemplateColumns: 'minmax(0, 1fr) 110px 120px 110px 70px' }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
          Goal
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
          BDI density (10d)
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
          Quality / Plans
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
          Progress
        </span>
        <span className="text-right font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
          Status
        </span>
      </div>

      {/* List */}
      {isLoading && (
        <Card pad={20}>
          <span className="text-sm text-text-muted">Loading goals…</span>
        </Card>
      )}
      {!!error && (
        <Card pad={20}>
          <span className="text-sm text-red">Failed to load goals.</span>
        </Card>
      )}
      {!isLoading && !error && filtered.length === 0 && (
        <Card pad={32}>
          <div className="text-center">
            <p className="font-display text-base font-semibold text-text">
              {flatGoals.length === 0 ? 'No goals yet' : 'No goals match the current filters'}
            </p>
            <p className="mt-2 text-sm text-text-sec">
              {flatGoals.length === 0
                ? 'Create your first goal to give your agents a direction.'
                : 'Try a different status or type filter.'}
            </p>
            {flatGoals.length === 0 && (
              <div className="mt-4 flex justify-center">
                <PrimaryButton onClick={() => setShowCreate(true)}>+ New goal</PrimaryButton>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-1.5">
        {filtered.map((g) => (
          <GoalRidge
            key={g.id}
            goal={g}
            pulseDot={g.status === 'active'}
          />
        ))}
      </div>

      {/* Legend footnote */}
      {flatGoals.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-4 px-3 py-2.5 text-[10px] text-text-muted">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em]">Legend</span>
          <span className="inline-flex items-center gap-1.5">
            <span style={{ color: 'rgb(var(--amber) / 1)' }}>◉</span>
            Outcome — measurable end state
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span style={{ color: 'rgb(var(--emerald) / 1)' }}>▲</span>
            Metric — quantitative target
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span style={{ color: 'rgb(var(--red) / 1)' }}>◐</span>
            Constraint — must-not-violate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span style={{ color: 'rgb(var(--violet) / 1)' }}>◆</span>
            Principle — durable invariant
          </span>
        </div>
      )}

      {showCreate && <CreateGoalDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
