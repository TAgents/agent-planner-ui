import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  GhostButton,
  Kicker,
  ObjectChip,
  Pill,
  PrimaryButton,
  ProposedChip,
  StatusDot,
  TopBar,
  cn,
} from '../components/v1';
import { useWorkspace } from '../hooks/useWorkspaces';
import { usePlans } from '../hooks/usePlans';
import { useGoalsV2 } from '../hooks/useGoalsV2';

const WorkspaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workspace, isLoading, error } = useWorkspace(id);

  // Live cross-sections — filtered client-side until /plans + /goals support workspace_id consistently
  const { plans: plansArr } = usePlans(1, 100);
  const { data: goalsData } = useGoalsV2();

  const plans = (Array.isArray(plansArr) ? plansArr : []).filter(
    (p: any) => (p.workspace_id || p.workspaceId) === id,
  );
  const goalsArr: any[] = Array.isArray(goalsData) ? goalsData : (goalsData as any)?.goals ?? [];
  const goals = goalsArr.filter((g: any) => (g.workspace_id || g.workspaceId) === id);

  if (isLoading) return <Center>Loading workspace…</Center>;
  if (error)     return <Center tone="error">Failed to load workspace.</Center>;
  if (!workspace) return <Center>Workspace not found.</Center>;

  return (
    <div className="flex h-full flex-col">
      <TopBar
        breadcrumb={[{ label: 'Workspaces', to: '/app/workspaces' }, workspace.title]}
        kicker={
          <span className="inline-flex items-center gap-2">
            <Kicker>Workspace · live</Kicker>
            {workspace.isDefault && (
              <span className="rounded bg-surface-hi px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-text-muted">
                Default
              </span>
            )}
          </span>
        }
        title={workspace.title}
        subtitle={
          <>
            {workspace.description ?? '—'}
            {workspace.forkedFromBlueprintId && (
              <>
                {' · '}
                <Link to={`/app/blueprints/${workspace.forkedFromBlueprintId}`} className="text-amber underline">
                  forked from blueprint
                </Link>
              </>
            )}
          </>
        }
        actions={(
          <div className="flex items-center gap-2">
            <GhostButton onClick={() => navigate(`/app/workspaces/${id}/edit`)}>Edit</GhostButton>
            <PrimaryButton onClick={() => navigate('/app/plans/new')}>New Plan</PrimaryButton>
          </div>
        )}
      />
      <div className="flex flex-1 flex-col gap-4 overflow-auto bg-bg p-6">
        <SummaryStrip workspace={workspace} planCount={plans.length} goalCount={goals.length} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GoalsPanel goals={goals} workspaceId={id!} />
          <PlansPanel plans={plans} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CollaboratorsPanel ownerId={workspace.ownerId} />
          <ProvenancePanel workspace={workspace} />
        </div>
      </div>
    </div>
  );
};

// ─── Sub-panels ─────────────────────────────────────────────────

const SummaryStrip: React.FC<{ workspace: any; planCount: number; goalCount: number }> = ({
  workspace, planCount, goalCount,
}) => (
  <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-4">
    <Cell label="Health" right={<ProposedChip>Proposed</ProposedChip>}>
      <div className="flex items-center gap-2">
        <StatusDot color="emerald" size={9} ring />
        <span className="text-[14px] font-semibold text-text">Healthy</span>
      </div>
      <div className="mt-1.5 text-[11px] text-text-sec">Workspace-level health rollup is server-side TBD.</div>
    </Cell>
    <Cell label="Goals">
      <div className="font-display text-[22px] font-semibold leading-none tracking-[-0.02em] text-text">{goalCount}</div>
      <div className="mt-1 text-[11px] text-text-muted">linked to this workspace</div>
    </Cell>
    <Cell label="Plans">
      <div className="font-display text-[22px] font-semibold leading-none tracking-[-0.02em] text-text">{planCount}</div>
      <div className="mt-1 text-[11px] text-text-muted">execution structures</div>
    </Cell>
    <Cell label="Forked from">
      {workspace.forkedFromBlueprintId
        ? <ObjectChip kind="blueprint" label="Source blueprint" />
        : <span className="font-mono text-[11px] text-text-muted">blank start</span>}
      <div className="mt-1 text-[11px] text-text-muted">
        {workspace.forkedAt ? `forked ${new Date(workspace.forkedAt).toLocaleDateString()}` : 'created from scratch'}
      </div>
    </Cell>
  </div>
);

const Cell: React.FC<{ label: string; right?: React.ReactNode; children: React.ReactNode }> = ({ label, right, children }) => (
  <div className="border-l border-border px-5 py-4 first:border-l-0">
    <div className="mb-2 flex items-center justify-between">
      <Kicker>{label}</Kicker>
      {right}
    </div>
    {children}
  </div>
);

const PanelShell: React.FC<{
  kicker: string; title: string; accent?: 'amber' | 'emerald' | 'violet' | 'red';
  action?: React.ReactNode; children: React.ReactNode;
}> = ({ kicker, title, accent, action, children }) => (
  <Card pad={20} className="relative overflow-hidden">
    {accent && <div className={cn('absolute inset-y-0 left-0 w-[3px]', `bg-${accent}`)} />}
    <div className="mb-3.5 flex items-baseline justify-between">
      <div>
        <Kicker className="block">{kicker}</Kicker>
        <div className="mt-1 font-display text-[16px] font-semibold tracking-[-0.02em] text-text">{title}</div>
      </div>
      {action}
    </div>
    {children}
  </Card>
);

const GoalsPanel: React.FC<{ goals: any[]; workspaceId: string }> = ({ goals, workspaceId }) => (
  <PanelShell kicker="Goals" title="Outcomes this workspace serves" accent="emerald" action={
    <Link to={`/app/goals?workspace=${workspaceId}`} className="text-[11.5px] text-text-sec hover:text-text">Manage →</Link>
  }>
    {goals.length === 0 && (
      <div className="rounded-lg border border-dashed border-border bg-bg p-6 text-center text-[12px] text-text-muted">
        No goals linked yet. Create one via the Goals page and assign it to this workspace.
      </div>
    )}
    <div className="flex flex-col gap-2">
      {goals.slice(0, 4).map((g: any) => (
        <Link
          key={g.id}
          to={`/app/goals/${g.id}`}
          className="flex items-start gap-3 rounded-lg border border-border bg-bg p-3.5 transition-colors hover:bg-surface-hi"
        >
          <Pill color="emerald">Goal</Pill>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-text">{g.title}</div>
            <div className="mt-1 text-[11px] text-text-sec">{g.status ?? 'active'}</div>
          </div>
        </Link>
      ))}
    </div>
  </PanelShell>
);

const PlansPanel: React.FC<{ plans: any[] }> = ({ plans }) => (
  <PanelShell kicker="Plans" title="Execution structures" accent="amber" action={
    <Link to="/app/plans/new" className="text-[11.5px] text-text-sec hover:text-text">New plan →</Link>
  }>
    {plans.length === 0 && (
      <div className="rounded-lg border border-dashed border-border bg-bg p-6 text-center text-[12px] text-text-muted">
        No plans yet. Fork a Blueprint or start a new plan.
      </div>
    )}
    <div className="flex flex-col gap-2">
      {plans.slice(0, 6).map((p: any) => (
        <Link
          key={p.id}
          to={`/app/plans/${p.id}`}
          className="grid grid-cols-[1fr_70px] items-center gap-3 rounded-md border border-border bg-bg px-3 py-2.5 transition-colors hover:bg-surface-hi"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-surface-hi px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.08em] text-text-sec">PL</span>
              <span className="text-[12.5px] font-semibold text-text">{p.title}</span>
            </div>
            <div className="mt-1 text-[10.5px] text-text-muted">
              status: <span className="text-text-sec">{p.status}</span>
            </div>
          </div>
          <span className="text-right font-mono text-[10px] text-text-muted">
            {p.stats?.percentage != null ? `${p.stats.percentage}%` : '—'}
          </span>
        </Link>
      ))}
    </div>
  </PanelShell>
);

const CollaboratorsPanel: React.FC<{ ownerId: string }> = ({ ownerId }) => (
  <PanelShell kicker="People" title="Collaborators" action={
    <span className="text-[11.5px] text-text-muted">workspace inherits org membership</span>
  }>
    <div className="rounded-lg border border-border bg-bg p-3 text-[11.5px] text-text-sec leading-relaxed">
      Workspace permissions inherit from the organization. Owner: <span className="font-mono text-text">{ownerId.slice(0, 8)}…</span>
      <br />
      Per-workspace collaborator roles are a future enhancement (see open question in WORKSPACE_BLUEPRINT_SKETCH.md).
    </div>
  </PanelShell>
);

const ProvenancePanel: React.FC<{ workspace: any }> = ({ workspace }) => (
  <PanelShell kicker="Provenance" title="Where this workspace came from">
    <div className="flex flex-col gap-3 text-[12px] text-text-sec">
      <Row label="Created">{new Date(workspace.createdAt).toLocaleString()}</Row>
      <Row label="Updated">{new Date(workspace.updatedAt).toLocaleString()}</Row>
      <Row label="Slug"><code className="font-mono text-text-sec">{workspace.slug}</code></Row>
      <Row label="Forked from">
        {workspace.forkedFromBlueprintId
          ? <Link to={`/app/blueprints/${workspace.forkedFromBlueprintId}`} className="text-amber underline">view source blueprint</Link>
          : <span className="text-text-muted">—</span>}
      </Row>
    </div>
  </PanelShell>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-[110px_1fr] gap-3">
    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">{label}</span>
    <span className="text-text-sec">{children}</span>
  </div>
);

const Center: React.FC<{ children: React.ReactNode; tone?: 'error' }> = ({ children, tone }) => (
  <div className={cn(
    'flex h-full items-center justify-center bg-bg p-8 text-[13px]',
    tone === 'error' ? 'text-red' : 'text-text-sec',
  )}>
    {children}
  </div>
);

export default WorkspaceDetail;
