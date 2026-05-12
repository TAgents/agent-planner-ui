import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Kicker,
  ObjectChip,
  Pill,
  PrimaryButton,
  StatusSpine,
  type PillColor,
} from '../components/v1';
import { usePlans } from '../hooks/usePlans';
import { useWorkspaces } from '../hooks/useWorkspaces';
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

function CreatePlanDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { createPlan } = usePlans();
  const { data: wsData } = useWorkspaces();
  const workspaces = wsData?.workspaces ?? [];
  const defaultWs = workspaces.find((w) => w.isDefault) ?? workspaces[0];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [workspaceId, setWorkspaceId] = useState<string | undefined>(defaultWs?.id);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload: any = { title, description, status };
      if (workspaceId) payload.workspace_id = workspaceId;
      const newPlan = await createPlan.mutateAsync(payload);
      const planId = newPlan?.id || (newPlan as any)?.plan?.id;
      onClose();
      if (planId) navigate(`/app/plans/${planId}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to create plan');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[460px] rounded-[10px] border border-border bg-surface p-5 shadow-xl"
      >
        <h3 className="mb-4 font-display text-base font-semibold text-text">Create plan</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              Title
            </label>
            <input
              placeholder="What are we shipping?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-amber focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              Description
            </label>
            <textarea
              placeholder="Optional — what's the shape of this work?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-amber focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'active')}
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-amber focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
            {workspaces.length > 1 && (
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                  Workspace
                </label>
                <select
                  value={workspaceId ?? ''}
                  onChange={(e) => setWorkspaceId(e.target.value || undefined)}
                  className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-amber focus:outline-none"
                >
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>{w.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {error && <div className="rounded-md bg-red/10 px-3 py-2 text-xs text-red">{error}</div>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-sec transition-colors hover:bg-surface-hi"
            >
              Cancel
            </button>
            <PrimaryButton type="submit" disabled={createPlan.isLoading || !title.trim()}>
              {createPlan.isLoading ? 'Creating…' : 'Create plan'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

const PlansList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { plans, isLoading } = usePlans(1, 100);
  const { data: wsData } = useWorkspaces();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('updated');
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
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

  const filtered = useMemo<Plan[]>(() => {
    if (!plans) return [];
    let list = [...(plans as Plan[])];
    if (statusFilter !== 'all') list = list.filter((p: Plan) => p.status === statusFilter);
    if (workspaceFilter !== 'all') {
      list = list.filter((p: Plan) => {
        const wsId = (p as any).workspace_id || (p as any).workspaceId;
        if (workspaceFilter === 'none') return !wsId;
        return wsId === workspaceFilter;
      });
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p: Plan) =>
          p.title.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q),
      );
    }
    list.sort((a: Plan, b: Plan) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      const aIso = sort === 'created' ? a.created_at : a.updated_at;
      const bIso = sort === 'created' ? b.created_at : b.updated_at;
      return new Date(bIso).getTime() - new Date(aIso).getTime();
    });
    return list;
  }, [plans, statusFilter, workspaceFilter, sort, query]);

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

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10 sm:px-9">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker className="mb-2">◆ Plans</Kicker>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
            Plans
          </h1>
          <p className="mt-1 text-[13px] text-text-sec">
            {plans ? `${plans.length} total · ${counts.active} active` : 'Loading…'}
          </p>
        </div>
        <PrimaryButton onClick={() => setShowCreate(true)}>+ New plan</PrimaryButton>
      </header>
      {showCreate && <CreatePlanDialog onClose={() => setShowCreate(false)} />}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
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
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search plans…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-[6px] text-xs text-text placeholder:text-text-muted focus:outline-none"
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

      {isLoading && (
        <Card pad={20}>
          <span className="text-sm text-text-muted">Loading plans…</span>
        </Card>
      )}

      {!isLoading && filtered.length === 0 && (
        <Card pad={32}>
          <div className="text-center">
            <p className="font-display text-base font-semibold text-text">No plans here yet</p>
            <p className="mt-2 text-sm text-text-sec">
              {query || statusFilter !== 'all'
                ? 'No plans match the current filters.'
                : 'Create your first plan to get started.'}
            </p>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((plan: Plan) => {
          const stale = plan.status === 'active' && daysSince(plan.updated_at) > 5;
          const accent: PillColor = stale ? 'red' : STATUS_COLOR[plan.status];
          return (
            <Link key={plan.id} to={`/app/plans/${plan.id}`} className="block">
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
                      <Pill color={STATUS_COLOR[plan.status]}>{plan.status}</Pill>
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
                    {/* Goal tether — only first goal shown to keep rows tight */}
                    {plan.goal_tethers && plan.goal_tethers.length > 0 && (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-mono uppercase tracking-[0.1em] text-[9.5px] text-text-muted">
                          ◆ goal
                        </span>
                        <Link
                          to={`/app/goals/${plan.goal_tethers[0].goal_id}`}
                          className="max-w-[40ch] truncate text-text-sec underline-offset-2 hover:text-text hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {plan.goal_tethers[0].goal_title}
                        </Link>
                        {plan.goal_tethers.length > 1 && (
                          <span className="font-mono text-[9.5px] text-text-muted">
                            +{plan.goal_tethers.length - 1}
                          </span>
                        )}
                      </div>
                    )}
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
        })}
      </div>
    </div>
  );
};

export default PlansList;
