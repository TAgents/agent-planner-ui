import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  Card,
  GhostButton,
  Kicker,
  ObjectChip,
  PrimaryButton,
  ProposedChip,
  cn,
} from '../components/v1';
import { useBlueprint, useBlueprintForks, useForkBlueprint } from '../hooks/useBlueprints';
import { useWorkspaces } from '../hooks/useWorkspaces';
import type { Blueprint, BlueprintPayloadNode } from '../types';
import type { BlueprintFork } from '../services/blueprints.service';

const BlueprintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: bp, isLoading, error } = useBlueprint(id);
  const { data: wsData } = useWorkspaces();
  const fork = useForkBlueprint();
  const [showForkModal, setShowForkModal] = useState(false);

  if (isLoading) return <Center>Loading blueprint…</Center>;
  if (error)     return <Center tone="error">Failed to load blueprint.</Center>;
  if (!bp)       return <Center>Blueprint not found.</Center>;

  const isWs = bp.scope === 'workspace';
  const ctaLabel = isWs ? 'Fork into Workspace →' : 'Add as Plan →';

  const nodes = bp.payload?.nodes ?? [];
  const phases = nodes.filter((n) => n.node_type === 'phase');
  const tasks = nodes.filter((n) => n.node_type === 'task');
  const deps = bp.payload?.dependencies ?? [];

  return (
    <div className="mx-auto max-w-[1180px] 2xl:max-w-[1600px] px-6 py-10 sm:px-9">
      <header className="mb-7">
        <Breadcrumb items={[{ label: 'Blueprints', to: '/app/blueprints' }, bp.title]} />
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <Kicker>◆ {isWs ? 'Workspace' : 'Plan'} Blueprint</Kicker>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-text-muted">
                v{bp.version} · {bp.visibility}
              </span>
            </div>
            <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
              {bp.title}
            </h1>
            <p className="mt-2 max-w-[64ch] text-[13px] leading-[1.55] text-text-sec">
              {bp.description ?? '—'}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <GhostButton onClick={() => alert('Edit blueprint structure — coming soon.')}>Edit structure</GhostButton>
            <PrimaryButton onClick={() => setShowForkModal(true)}>{ctaLabel}</PrimaryButton>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <MetaStrip bp={bp} phaseCount={phases.length} taskCount={tasks.length} depCount={deps.length} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          <StructurePreview nodes={nodes} />
          <PayloadInfo bp={bp} />
        </div>
        <DerivedWorkspaces blueprintId={bp.id} />
        <OutcomeSignals bp={bp} />
      </div>

      {showForkModal && (
        <ForkModal
          bp={bp}
          workspaces={wsData?.workspaces ?? []}
          onClose={() => setShowForkModal(false)}
          onFork={async (workspaceId, title) => {
            const newPlan = await fork.mutateAsync({ id: bp.id, workspaceId, title });
            setShowForkModal(false);
            navigate(`/app/plans/${newPlan.id}`);
          }}
          submitting={fork.isLoading}
        />
      )}
    </div>
  );
};

// ─── Meta strip ──────────────────────────────────────────────────

const MetaStrip: React.FC<{
  bp: Blueprint; phaseCount: number; taskCount: number; depCount: number;
}> = ({ bp, phaseCount, taskCount, depCount }) => {
  const cells = [
    { l: 'Scope',        v: bp.scope === 'workspace' ? 'Workspace' : 'Plan',
      sub: bp.scope === 'workspace' ? 'Forks into a live workspace' : 'Adds a plan into a workspace' },
    { l: 'Forks',        v: String(bp.forkCount), sub: 'all-time' },
    { l: 'Structure',    v: `${phaseCount}p · ${taskCount}t`, sub: `${depCount} dependency edge${depCount !== 1 ? 's' : ''}` },
    { l: 'Visibility',   v: bp.visibility, sub: bp.publishedAt ? `published ${new Date(bp.publishedAt).toLocaleDateString()}` : 'unpublished' },
    { l: 'Last updated', v: new Date(bp.updatedAt).toLocaleDateString(), sub: `v${bp.version}` },
  ];
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-5">
      {cells.map((c, i) => (
        <div key={c.l} className={cn('px-5 py-4', i > 0 && 'md:border-l border-border')}>
          <Kicker className="mb-2 block">{c.l}</Kicker>
          <div className="font-display text-[16px] font-semibold tracking-[-0.015em] text-text">{c.v}</div>
          <div className="mt-1 text-[11px] text-text-muted">{c.sub}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Structure preview (real nodes) ──────────────────────────────

const StructurePreview: React.FC<{ nodes: BlueprintPayloadNode[] }> = ({ nodes }) => {
  const phases = nodes.filter((n) => n.node_type === 'phase');
  const tasksByParent = useMemo(() => {
    const m = new Map<string, BlueprintPayloadNode[]>();
    for (const n of nodes) {
      if (n.node_type !== 'task') continue;
      const k = n.parent_key ?? '_';
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(n);
    }
    return m;
  }, [nodes]);

  // Phases with no tasks (or top-level tasks) still need to render
  const orphanTasks = nodes.filter((n) => n.node_type === 'task' && !n.parent_key);

  return (
    <Card pad={20}>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <Kicker className="block">Structure</Kicker>
          <div className="mt-1 font-display text-[16px] font-semibold tracking-[-0.02em] text-text">
            {phases.length} phase{phases.length !== 1 ? 's' : ''} · {nodes.filter(n => n.node_type === 'task').length} tasks
          </div>
        </div>
      </div>
      {phases.length === 0 && orphanTasks.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-bg p-6 text-center text-[12px] text-text-muted">
          No structure captured in payload.
        </div>
      )}
      <div className="flex flex-col gap-2">
        {phases.map((p, i) => {
          const t = tasksByParent.get(p.key) ?? [];
          return (
            <div
              key={p.key}
              className="grid grid-cols-[32px_1.4fr_2fr] items-center gap-3.5 rounded-lg border border-border bg-bg px-3.5 py-3"
            >
              <span className="font-mono text-[10px] tracking-[0.1em] text-amber">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div className="text-[13px] font-semibold text-text">{p.title}</div>
                {p.task_mode && p.task_mode !== 'free' && (
                  <span className="font-mono text-[10px] tracking-[0.06em] text-amber">↳ mode: {p.task_mode}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {t.slice(0, 3).map((tk) => (
                  <span
                    key={tk.key}
                    className="rounded border border-border bg-surface-hi px-1.5 py-0.5 text-[10.5px] text-text-sec"
                  >
                    {tk.title}
                  </span>
                ))}
                {t.length > 3 && (
                  <span className="self-center font-mono text-[10px] text-text-muted">+{t.length - 3}</span>
                )}
                {t.length === 0 && (
                  <span className="font-mono text-[10px] text-text-muted">no tasks</span>
                )}
              </div>
            </div>
          );
        })}
        {orphanTasks.length > 0 && (
          <div className="rounded-lg border border-dashed border-border bg-bg px-3.5 py-3">
            <Kicker>Top-level tasks</Kicker>
            <div className="mt-2 flex flex-wrap gap-1">
              {orphanTasks.map((tk) => (
                <span key={tk.key} className="rounded border border-border bg-surface-hi px-1.5 py-0.5 text-[10.5px] text-text-sec">
                  {tk.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ─── Right-hand side: payload info, source linkage ───────────────

const PayloadInfo: React.FC<{ bp: Blueprint }> = ({ bp }) => (
  <Card pad={20}>
    <Kicker className="block">Source</Kicker>
    <div className="mt-1 font-display text-[16px] font-semibold tracking-[-0.02em] text-text">Where this came from</div>

    <div className="mt-3.5 flex flex-col gap-2 text-[12px] text-text-sec">
      {bp.sourcePlanId && (
        <Row label="Source plan">
          <ObjectChip kind="plan" label="View source plan" />
        </Row>
      )}
      {bp.sourceWorkspaceId && (
        <Row label="Source workspace">
          <ObjectChip kind="workspace" label="View source workspace" />
        </Row>
      )}
      <Row label="Created">{new Date(bp.createdAt).toLocaleString()}</Row>
      <Row label="Updated">{new Date(bp.updatedAt).toLocaleString()}</Row>
      <Row label="Tags">
        {(bp.tags && bp.tags.length > 0)
          ? bp.tags.map((t) => (
              <span key={t} className="mr-1.5 inline-block rounded bg-surface-hi px-1.5 py-0.5 font-mono text-[10px] text-text-sec">{t}</span>
            ))
          : <span className="text-text-muted">none</span>}
      </Row>
    </div>

    <div className="mt-4 rounded-md border border-dashed border-border bg-bg p-3 text-[11.5px] leading-relaxed text-text-sec">
      Blueprint <span className="text-amber font-semibold">excludes run-state</span>: claims, knowledge episodes, logs, decisions, statuses, and agent assignments are not snapshotted. Forking starts every node at <code className="font-mono text-text">not_started</code>.
    </div>
  </Card>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-[120px_1fr] gap-3">
    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">{label}</span>
    <span className="text-text-sec">{children}</span>
  </div>
);

// ─── Derived Workspaces (forks history) ──────────────────────────

const DerivedWorkspaces: React.FC<{ blueprintId: string }> = ({ blueprintId }) => {
  const { data, isLoading } = useBlueprintForks(blueprintId);
  const forks = data?.forks ?? [];

  return (
    <Card pad={20}>
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <Kicker className="block">Fork history</Kicker>
          <div className="mt-1 font-display text-[16px] font-semibold tracking-[-0.02em] text-text">
            Plans forked from this blueprint
          </div>
        </div>
        <span className="font-mono text-[10px] text-text-muted">{forks.length}</span>
      </div>
      {isLoading ? (
        <div className="rounded-lg border border-dashed border-border bg-bg p-6 text-center text-[12px] text-text-muted">
          Loading…
        </div>
      ) : forks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-bg p-6 text-center text-[12px] text-text-muted">
          No forks yet. Click <span className="text-amber font-semibold">Fork into Workspace</span> above to be the first.
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {forks.map((f) => <ForkRow key={f.id} fork={f} />)}
        </ul>
      )}
    </Card>
  );
};

const ForkRow: React.FC<{ fork: BlueprintFork }> = ({ fork }) => {
  const statusColor = fork.status === 'active' ? 'amber'
    : fork.status === 'completed' ? 'emerald'
    : 'slate';
  return (
    <li>
      <Link
        to={`/app/plans/${fork.id}`}
        className="grid grid-cols-[20px_1fr_minmax(0,200px)_80px] items-center gap-3 rounded-md border border-border bg-bg px-3 py-2.5 transition-colors hover:bg-surface-hi"
      >
        <span className={cn(
          'inline-block h-2 w-2 rounded-full',
          statusColor === 'amber' ? 'bg-amber' : statusColor === 'emerald' ? 'bg-emerald' : 'bg-slate',
        )} />
        <div className="min-w-0">
          <ObjectChip kind="plan" label={fork.title} />
        </div>
        {fork.workspace ? (
          <Link
            to={`/app/workspaces/${fork.workspace.id}`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="min-w-0"
          >
            <ObjectChip kind="workspace" label={fork.workspace.title} dim />
          </Link>
        ) : (
          <span className="font-mono text-[10px] text-text-muted">no workspace</span>
        )}
        <span className="text-right font-mono text-[10px] text-text-muted">
          {fork.forkedAt ? relTimeShort(fork.forkedAt) : '—'}
        </span>
      </Link>
    </li>
  );
};

function relTimeShort(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return 'just now';
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

// ─── Outcome signals (proposed) ──────────────────────────────────

const OutcomeSignals: React.FC<{ bp: Blueprint }> = ({ bp }) => (
  <Card pad={20}>
    <div className="mb-2 flex items-baseline gap-2">
      <Kicker>Outcome signals</Kicker>
      <ProposedChip>Proposed</ProposedChip>
    </div>
    <div className="font-display text-[16px] font-semibold tracking-[-0.02em] text-text">Is this blueprint working?</div>
    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="Forks" value={String(bp.forkCount)} sub="all-time" />
      <Stat label="Outcome rate" value="—" sub="needs goal-completion tracking" />
      <Stat label="Time to ship" value="—" sub="needs run timing" />
      <Stat label="Reuse" value={`${bp.forkCount > 0 ? '+' : ''}${bp.forkCount} fork${bp.forkCount !== 1 ? 's' : ''}`} sub="trend tracking is future" />
    </div>
  </Card>
);

const Stat: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div className="rounded-lg border border-border bg-bg p-3">
    <Kicker className="block">{label}</Kicker>
    <div className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">{value}</div>
    {sub && <div className="mt-0.5 text-[10.5px] text-text-muted">{sub}</div>}
  </div>
);

// ─── Fork modal ──────────────────────────────────────────────────

const ForkModal: React.FC<{
  bp: Blueprint;
  workspaces: any[];
  onClose: () => void;
  onFork: (workspaceId: string, title?: string) => void;
  submitting: boolean;
}> = ({ bp, workspaces, onClose, onFork, submitting }) => {
  const [workspaceId, setWorkspaceId] = useState<string>(workspaces[0]?.id ?? '');
  const [title, setTitle] = useState<string>(bp.title);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <Kicker className="block">Fork blueprint</Kicker>
        <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
          {bp.scope === 'workspace' ? 'Fork into a workspace' : 'Add as plan to a workspace'}
        </h2>
        <p className="mt-1 text-[12.5px] text-text-sec">
          A new plan will be created inside the chosen workspace, with this blueprint's structure.
        </p>

        <label className="mt-4 block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">Target workspace</span>
          <select
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-text"
          >
            {workspaces.length === 0 && <option value="">No workspaces yet</option>}
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>{w.title}{w.isDefault ? ' (default)' : ''}</option>
            ))}
          </select>
        </label>

        <label className="mt-3 block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">New plan title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-text"
          />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onClose} disabled={submitting}>Cancel</GhostButton>
          <PrimaryButton
            onClick={() => onFork(workspaceId, title.trim() || undefined)}
            disabled={!workspaceId || submitting}
          >
            {submitting ? 'Forking…' : 'Fork'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

const Center: React.FC<{ children: React.ReactNode; tone?: 'error' }> = ({ children, tone }) => (
  <div className={cn(
    'flex h-full items-center justify-center bg-bg p-8 text-[13px]',
    tone === 'error' ? 'text-red' : 'text-text-sec',
  )}>
    {children}
  </div>
);

export default BlueprintDetail;
