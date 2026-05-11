import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  Card,
  GhostButton,
  Kicker,
  PrimaryButton,
  cn,
} from '../components/v1';
import { useForkBlueprint, usePublicBlueprint } from '../hooks/useBlueprints';
import { useWorkspaces } from '../hooks/useWorkspaces';
import type { Blueprint, BlueprintPayloadNode } from '../types';

function isLoggedIn(): boolean {
  return !!localStorage.getItem('auth_session');
}

/**
 * Public, unauthenticated Blueprint viewer. Mirrors the authenticated
 * BlueprintDetail layout (MetaStrip + StructurePreview) but trims the
 * panels that depend on auth context (Fork History, owner-only actions).
 * The Fork CTA opens the same modal for logged-in users, or routes to
 * /login?next=… for anonymous visitors.
 */
const PublicBlueprint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: bp, isLoading, error } = usePublicBlueprint(id);
  const loggedIn = isLoggedIn();
  const [showFork, setShowFork] = useState(false);

  if (isLoading) return <Center>Loading…</Center>;
  if (error)     return <Center tone="error">This blueprint isn't available or has been made private.</Center>;
  if (!bp)       return <Center>Blueprint not found.</Center>;

  const isWs = bp.scope === 'workspace';
  const ctaLabel = isWs ? 'Fork into Workspace →' : 'Add as Plan →';

  function onFork() {
    if (!loggedIn) {
      navigate(`/login?next=${encodeURIComponent(`/public/blueprints/${id}`)}`);
      return;
    }
    setShowFork(true);
  }

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10 sm:px-9">
      <Breadcrumb items={[{ label: 'Explore', to: '/explore' }, bp.title]} />
      <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className={cn(
              'rounded border bg-bg px-1.5 py-[2px] font-mono text-[9px] font-bold uppercase tracking-[0.16em]',
              isWs ? 'border-amber/50 text-amber' : 'border-violet/50 text-violet',
            )}>{isWs ? 'WORKSPACE BLUEPRINT' : 'PLAN BLUEPRINT'}</span>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-text-muted">
              v{bp.version} · {bp.visibility}
            </span>
          </div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
            {bp.title}
          </h1>
          {bp.description && (
            <p className="mt-2 max-w-[64ch] text-[13px] leading-[1.55] text-text-sec">{bp.description}</p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <PrimaryButton onClick={onFork}>{ctaLabel}</PrimaryButton>
        </div>
      </header>

      <div className="mt-7 grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-4">
        <MetaCell label="Scope" value={isWs ? 'Workspace' : 'Plan'} sub={isWs ? 'Forks into a workspace' : 'Adds a plan into a workspace'} />
        <MetaCell label="Forks" value={String(bp.forkCount)} sub="all-time" />
        <MetaCell label="Structure" value={`${(bp.payload?.nodes ?? []).filter(n => n.node_type === 'phase').length}p · ${(bp.payload?.nodes ?? []).filter(n => n.node_type === 'task').length}t`} sub={`${(bp.payload?.dependencies ?? []).length} dep edge${(bp.payload?.dependencies ?? []).length !== 1 ? 's' : ''}`} />
        <MetaCell label="Last updated" value={new Date(bp.updatedAt).toLocaleDateString()} sub={`v${bp.version}`} />
      </div>

      <div className="mt-4">
        <StructurePreview nodes={bp.payload?.nodes ?? []} />
      </div>

      {bp.tags && bp.tags.length > 0 && (
        <Card pad={20} className="mt-4">
          <Kicker className="mb-2 block">Tags</Kicker>
          <div className="flex flex-wrap gap-1.5">
            {bp.tags.map((t) => (
              <span key={t} className="rounded bg-surface-hi px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-text-sec">{t}</span>
            ))}
          </div>
        </Card>
      )}

      <Card pad={20} className="mt-4 border-dashed">
        <div className="text-[12px] text-text-sec leading-relaxed">
          Forking creates a new plan in <span className="text-text font-semibold">your workspace</span> with this blueprint's
          structure. Statuses start at <code className="font-mono text-text">not_started</code>; nothing about your run is
          shared back to the publisher.
        </div>
      </Card>

      {showFork && loggedIn && <ForkModal bp={bp} onClose={() => setShowFork(false)} />}
    </div>
  );
};

const MetaCell: React.FC<{ label: string; value: string; sub: string }> = ({ label, value, sub }) => (
  <div className="border-l border-border px-5 py-4 first:border-l-0">
    <Kicker className="mb-2 block">{label}</Kicker>
    <div className="font-display text-[16px] font-semibold tracking-[-0.015em] text-text">{value}</div>
    <div className="mt-1 text-[11px] text-text-muted">{sub}</div>
  </div>
);

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
              </div>
              <div className="flex flex-wrap gap-1">
                {t.slice(0, 3).map((tk) => (
                  <span key={tk.key} className="rounded border border-border bg-surface-hi px-1.5 py-0.5 text-[10.5px] text-text-sec">
                    {tk.title}
                  </span>
                ))}
                {t.length > 3 && <span className="self-center font-mono text-[10px] text-text-muted">+{t.length - 3}</span>}
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

// ─── Fork modal (logged-in users) ─────────────────────────────────

const ForkModal: React.FC<{ bp: Blueprint; onClose: () => void }> = ({ bp, onClose }) => {
  const navigate = useNavigate();
  const { data: wsData } = useWorkspaces();
  const fork = useForkBlueprint();
  const [workspaceId, setWorkspaceId] = useState<string>(wsData?.workspaces?.[0]?.id ?? '');
  const [title, setTitle] = useState<string>(bp.title);

  async function submit() {
    if (!workspaceId) return;
    try {
      const newPlan = await fork.mutateAsync({ id: bp.id, workspaceId, title: title.trim() || undefined });
      onClose();
      navigate(`/app/plans/${newPlan.id}`);
    } catch {
      // Stay open on error so the user can retry; we don't surface to keep this view simple.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Kicker className="block">Fork blueprint</Kicker>
        <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
          {bp.scope === 'workspace' ? 'Fork into a workspace' : 'Add as plan to a workspace'}
        </h2>
        <label className="mt-4 block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">Target workspace</span>
          <select
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-text"
          >
            {(wsData?.workspaces ?? []).filter((w) => !w.archivedAt).map((w) => (
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
          <GhostButton onClick={onClose} disabled={fork.isLoading}>Cancel</GhostButton>
          <PrimaryButton onClick={submit} disabled={!workspaceId || fork.isLoading}>
            {fork.isLoading ? 'Forking…' : 'Fork'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

const Center: React.FC<{ children: React.ReactNode; tone?: 'error' }> = ({ children, tone }) => (
  <div className={cn(
    'mx-auto max-w-[640px] py-20 text-center text-[13px]',
    tone === 'error' ? 'text-red' : 'text-text-sec',
  )}>
    {children}
    <div className="mt-6">
      <Link to="/explore" className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber hover:underline">
        ← Back to Explore
      </Link>
    </div>
  </div>
);

export default PublicBlueprint;
