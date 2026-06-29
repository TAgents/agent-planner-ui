import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GhostButton,
  Kicker,
  ObjectChip,
  PrimaryButton,
  Progress,
  StatusDot,
  cn,
  type ProgressColor,
} from '../components/v1';
import { useCreateWorkspace, useWorkspaces } from '../hooks/useWorkspaces';
import { useOrganizations } from '../hooks/useOrganizations';
import type { Workspace } from '../types';

function getActiveOrgId(): string | null {
  const stored = localStorage.getItem('active_org_id');
  if (stored) return stored;
  const raw = localStorage.getItem('auth_session');
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    return s?.user?.organizationId || s?.user?.organization_id || null;
  } catch {
    return null;
  }
}

type HealthFilter = 'all' | 'mine' | 'healthy' | 'waiting' | 'risk' | 'idle' | 'archived';

const FILTERS: { id: HealthFilter; label: string }[] = [
  { id: 'all',      label: 'All' },
  { id: 'mine',     label: 'Mine' },
  { id: 'healthy',  label: 'Healthy' },
  { id: 'waiting',  label: 'Waiting' },
  { id: 'risk',     label: 'At risk' },
  { id: 'idle',     label: 'Idle' },
  { id: 'archived', label: 'Archived' },
];

function userId(): string {
  const raw = localStorage.getItem('auth_session');
  if (!raw) return '';
  try { return JSON.parse(raw)?.user?.id ?? ''; } catch { return ''; }
}

function relativeTime(iso?: string | null): string {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return 'just now';
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

type SourceFilter = 'any' | 'forked' | 'blank';
type OwnerFilter = 'any' | 'mine';

const Workspaces: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<HealthFilter>('all');
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('any');
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('any');
  const [showCreate, setShowCreate] = useState(false);
  const includeArchived = filter === 'archived';
  const { data, isLoading, error } = useWorkspaces(undefined, { includeArchived });
  const { byId: orgsById } = useOrganizations();
  const me = userId();

  const all = data?.workspaces ?? [];

  const counts = useMemo(() => ({
    all:      all.filter((w) => !w.archivedAt).length,
    mine:     all.filter((w) => w.ownerId === me && !w.archivedAt).length,
    healthy:  all.filter((w) => !w.archivedAt).length, // placeholder until health is wired
    waiting:  0,
    risk:     0,
    idle:     0,
    archived: all.filter((w) => !!w.archivedAt).length,
  }), [all, me]);

  const filtered = useMemo(() => {
    const live = all.filter((w) => !w.archivedAt);
    let rows: Workspace[];
    switch (filter) {
      case 'archived': rows = all.filter((w) => !!w.archivedAt); break;
      case 'mine':     rows = live.filter((w) => w.ownerId === me); break;
      default:         rows = live;
    }
    if (sourceFilter === 'forked') rows = rows.filter((w) => !!w.forkedFromBlueprintId);
    if (sourceFilter === 'blank')  rows = rows.filter((w) => !w.forkedFromBlueprintId);
    if (ownerFilter === 'mine')    rows = rows.filter((w) => w.ownerId === me);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((w) =>
        w.title.toLowerCase().includes(q) ||
        (w.description ?? '').toLowerCase().includes(q) ||
        w.slug.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [all, filter, me, query, sourceFilter, ownerFilter]);

  return (
    <div className="mx-auto max-w-[1180px] 2xl:max-w-[1600px] px-6 py-10 sm:px-9">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker className="mb-2">◆ Workspaces</Kicker>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
            Live work in motion
          </h1>
          <p className="mt-1 text-[13px] text-text-sec">
            Every workspace is a folder under your organization that owns its goals and plans.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GhostButton onClick={() => navigate('/app/blueprints')}>Fork from Blueprint</GhostButton>
          <PrimaryButton onClick={() => setShowCreate(true)}>Create Workspace</PrimaryButton>
        </div>
      </header>
      <div className="flex flex-col gap-4">
        <React.Fragment>
          <Filters
            filter={filter} setFilter={setFilter} counts={counts}
            query={query} setQuery={setQuery}
            sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
            ownerFilter={ownerFilter} setOwnerFilter={setOwnerFilter}
          />
          {isLoading && <EmptyState>Loading workspaces…</EmptyState>}
          {error ? <EmptyState tone="error">Failed to load workspaces.</EmptyState> : null}
          {!isLoading && !error && filtered.length === 0 && (
            <EmptyState>
              {query || sourceFilter !== 'any' || ownerFilter !== 'any'
                ? <>No workspaces match your filters. <button type="button" onClick={() => { setQuery(''); setSourceFilter('any'); setOwnerFilter('any'); }} className="text-amber underline">Clear filters</button>.</>
                : <>No workspaces yet. <button type="button" onClick={() => setShowCreate(true)} className="text-amber underline">Create one</button>{' or '}<Link to="/app/blueprints" className="text-amber underline">fork a Blueprint</Link>.</>}
            </EmptyState>
          )}
          {!isLoading && filtered.length > 0 && <WorkspaceTable rows={filtered} orgsById={orgsById} />}
        </React.Fragment>
      </div>
      {showCreate && (
        <CreateWorkspaceModal
          onClose={() => setShowCreate(false)}
          onCreated={(ws) => {
            setShowCreate(false);
            navigate(`/app/workspaces/${ws.id}`);
          }}
        />
      )}
    </div>
  );
};

// ─── Create Workspace modal ──────────────────────────────────────

const CreateWorkspaceModal: React.FC<{
  onClose: () => void;
  onCreated: (ws: Workspace) => void;
}> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const create = useCreateWorkspace();
  const orgId = getActiveOrgId();

  async function submit() {
    setError(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!orgId) {
      setError('No active organization. Switch organization in Settings.');
      return;
    }
    try {
      const ws = await create.mutateAsync({
        organization_id: orgId,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onCreated(ws);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to create workspace.';
      setError(msg);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Kicker className="block">New workspace</Kicker>
        <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
          Create a workspace
        </h2>
        <p className="mt-1 text-[12.5px] text-text-sec">
          A folder under your organization that owns goals and plans. Pure container — no semantic behavior.
        </p>

        <label className="mt-4 block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">Title</span>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Growth Engine, Q3 Launch"
            className="mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-amber"
          />
        </label>

        <label className="mt-3 block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">Description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What kind of work lives here?"
            className="mt-1.5 w-full resize-none rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-amber"
          />
        </label>

        {error && (
          <div className="mt-3 rounded-md border border-red bg-red/[0.08] px-3 py-2 text-[12px] text-red">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onClose} disabled={create.isLoading}>Cancel</GhostButton>
          <PrimaryButton onClick={submit} disabled={create.isLoading || !title.trim()}>
            {create.isLoading ? 'Creating…' : 'Create'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

const Filters: React.FC<{
  filter: HealthFilter;
  setFilter: (f: HealthFilter) => void;
  counts: Record<HealthFilter, number>;
  query: string;
  setQuery: (q: string) => void;
  sourceFilter: SourceFilter;
  setSourceFilter: (s: SourceFilter) => void;
  ownerFilter: OwnerFilter;
  setOwnerFilter: (o: OwnerFilter) => void;
}> = ({ filter, setFilter, counts, query, setQuery, sourceFilter, setSourceFilter, ownerFilter, setOwnerFilter }) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const on = f.id === filter;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3 py-[5px] font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${
              on
                ? 'border-amber bg-amber-soft text-amber'
                : 'border-border bg-surface text-text-sec hover:bg-surface-hi'
            }`}
          >
            {f.label} · {counts[f.id] ?? 0}
          </button>
        );
      })}
    </div>
    <div className="flex-1" />
    <label className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] text-text-sec focus-within:border-amber">
      <span className="text-text-muted">⌕</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search workspaces, descriptions…"
        className="min-w-[220px] bg-transparent text-text placeholder:text-text-muted outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          aria-label="Clear search"
          className="text-text-muted hover:text-text"
        >
          ×
        </button>
      )}
    </label>
    <FilterSelect
      label="Source"
      value={sourceFilter}
      onChange={(v) => setSourceFilter(v as SourceFilter)}
      options={[
        { value: 'any',    label: 'Any' },
        { value: 'forked', label: 'Forked' },
        { value: 'blank',  label: 'Blank start' },
      ]}
    />
    <FilterSelect
      label="Owner"
      value={ownerFilter}
      onChange={(v) => setOwnerFilter(v as OwnerFilter)}
      options={[
        { value: 'any',  label: 'Anyone' },
        { value: 'mine', label: 'Mine' },
      ]}
    />
  </div>
);

const FilterSelect: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}> = ({ label, value, onChange, options }) => {
  const active = value !== 'any';
  return (
    <label className={cn(
      'inline-flex items-center gap-1.5 rounded-md border bg-surface pl-2.5 pr-1.5 text-[11.5px]',
      active ? 'border-amber text-text' : 'border-border text-text-sec',
    )}>
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent py-1.5 pr-1 outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
};

type Health = 'on-track' | 'wait' | 'risk' | 'idle';
const HEALTH_META: Record<Health, { color: ProgressColor; label: string; tw: string }> = {
  'on-track': { color: 'emerald', label: 'Healthy',  tw: 'text-emerald' },
  wait:       { color: 'amber',   label: 'Waiting',  tw: 'text-amber'   },
  risk:       { color: 'red',     label: 'At risk',  tw: 'text-red'     },
  idle:       { color: 'text-muted', label: 'Idle',  tw: 'text-text-muted' },
};

function inferHealth(_w: Workspace): Health {
  // Health rollup is a future server-side aggregation. For now,
  // every live workspace shows "on-track" as the neutral default.
  return 'on-track';
}

const WorkspaceTable: React.FC<{ rows: Workspace[]; orgsById: Map<string, { isPersonal: boolean }> }> = ({ rows, orgsById }) => (
  <div className="overflow-hidden rounded-xl border border-border bg-surface">
    <div className="grid grid-cols-[24px_1.8fr_1.5fr_1.3fr_110px_1fr_100px_90px] items-center gap-3.5 border-b border-border bg-surface-hi px-[18px] py-[11px]">
      <span />
      {['Workspace', 'Goal', 'Source blueprint', 'Plans', 'Health', 'Progress', 'Updated'].map((h) => (
        <span key={h} className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">{h}</span>
      ))}
    </div>
    {rows.map((w, i) => {
      const h = inferHealth(w);
      const meta = HEALTH_META[h];
      const isLast = i === rows.length - 1;
      const goalCount = w.goalCount ?? 0;
      const planCount = w.planCount ?? 0;
      // Progress is goal/plan-derived; we don't have a real % yet, so 0.
      const progress = 0;
      return (
        <Link
          key={w.id}
          to={`/app/workspaces/${w.id}`}
          className={cn(
            'grid grid-cols-[24px_1.8fr_1.5fr_1.3fr_110px_1fr_100px_90px] items-center gap-3.5 px-[18px] py-3.5 transition-colors hover:bg-surface-hi',
            !isLast && 'border-b border-border',
          )}
        >
          <StatusDot color={meta.color} size={8} ring />
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-text">{w.title}{w.isDefault && (
              <span className="ml-2 rounded bg-surface-hi px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-text-muted">Default</span>
            )}{orgsById.get(w.organizationId)?.isPersonal && (
              <span className="ml-1.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-text-sec">Personal</span>
            )}</div>
            <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-text-muted">
              {w.description ? <span className="truncate">{w.description}</span> : <span>—</span>}
            </div>
          </div>
          <div className="min-w-0 text-[10px] text-text-muted">
            {goalCount > 0
              ? <span>{goalCount} goal{goalCount !== 1 ? 's' : ''}</span>
              : <span className="font-mono uppercase tracking-[0.08em] text-amber">— link a goal</span>}
          </div>
          <div className="min-w-0">
            {w.forkedFromBlueprintId
              ? <ObjectChip kind="blueprint" label="Forked blueprint" dim />
              : <span className="font-mono text-[10px] text-text-muted">blank start</span>}
          </div>
          <div className="font-mono text-[10.5px] text-text-sec">{planCount} plan{planCount !== 1 ? 's' : ''}</div>
          <div className={cn('font-mono text-[10.5px] tracking-[0.04em]', meta.tw)}>{meta.label}</div>
          <div className="flex flex-col gap-1">
            <Progress value={progress} height={3} color={meta.color} />
            <span className="font-mono text-[9.5px] text-text-muted">{progress}%</span>
          </div>
          <span className="font-mono text-[10.5px] text-text-muted">{relativeTime(w.updatedAt)}</span>
        </Link>
      );
    })}
  </div>
);

const EmptyState: React.FC<{ children: React.ReactNode; tone?: 'error' }> = ({ children, tone }) => (
  <div className={cn(
    'rounded-xl border border-border bg-surface p-8 text-center text-[13px]',
    tone === 'error' ? 'text-red' : 'text-text-sec',
  )}>
    {children}
  </div>
);

export default Workspaces;
