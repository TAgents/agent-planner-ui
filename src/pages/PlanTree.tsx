import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Card,
  Kicker,
  Pill,
  type PillColor,
} from '../components/v1';
import { usePlan } from '../hooks/usePlans';
import { useNodes } from '../hooks/useNodes';
import { commentService, logService } from '../services/api';
import { nodeService } from '../services/nodes.service';
import type { PlanNode, NodeStatus, NodeType } from '../types';

type DetailTab = 'details' | 'comments' | 'logs' | 'agent';

const STATUS_GLYPH: Record<NodeStatus, string> = {
  not_started: '○',
  in_progress: '◐',
  completed: '✓',
  blocked: '⚠',
  plan_ready: '◇',
};

const STATUS_COLOR: Record<NodeStatus, PillColor> = {
  not_started: 'slate',
  in_progress: 'amber',
  completed: 'emerald',
  blocked: 'red',
  plan_ready: 'violet',
};

const TYPE_COLOR: Record<NodeType, PillColor> = {
  root: 'slate',
  phase: 'violet',
  task: 'amber',
  milestone: 'emerald',
};

function relTime(iso?: string): string {
  if (!iso) return 'never';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type TreeRow = PlanNode & { depth: number; childCount: number };

/** Comments service may return either Comment[] or ApiResponse<Comment[]>. */
function getCommentList(raw: unknown): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const obj = raw as { data?: unknown };
  if (Array.isArray(obj.data)) return obj.data;
  return [];
}

/** Flatten the parent_id tree into an indented row list. */
function flattenTree(nodes: PlanNode[]): TreeRow[] {
  const byParent = new Map<string | null, PlanNode[]>();
  for (const n of nodes) {
    const key = (n.parent_id as string | undefined) || null;
    const arr = byParent.get(key) || [];
    arr.push(n);
    byParent.set(key, arr);
  }
  for (const arr of Array.from(byParent.values())) {
    arr.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
  }
  const out: TreeRow[] = [];
  function walk(parentId: string | null, depth: number) {
    for (const n of byParent.get(parentId) || []) {
      const childCount = (byParent.get(n.id) || []).length;
      out.push({ ...n, depth, childCount });
      walk(n.id, depth + 1);
    }
  }
  walk(null, 0);
  return out;
}

const PlanTree: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const safePlanId = planId || '';
  const { plan } = usePlan(safePlanId);
  const { nodes, isLoading } = useNodes(safePlanId);
  const flat = useMemo(() => flattenTree((nodes as PlanNode[] | undefined) || []), [nodes]);

  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<DetailTab>('details');

  const selectedNode = useMemo(
    () => (selected ? flat.find((n) => n.id === selected) || null : flat[0] || null),
    [flat, selected],
  );

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 sm:px-9">
      <header className="mb-8">
        <Link
          to="/app/plans"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted hover:text-text"
        >
          ← Plans
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Kicker className="mb-1">◆ Plan</Kicker>
            <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-text">
              {plan?.title || 'Loading…'}
            </h1>
            {plan?.description && (
              <p className="mt-2 max-w-[60ch] text-[13px] leading-[1.55] text-text-sec">
                {plan.description}
              </p>
            )}
          </div>
          {plan && (
            <div className="flex flex-shrink-0 items-center gap-2">
              <Pill color={plan.status === 'active' ? 'amber' : plan.status === 'completed' ? 'emerald' : 'slate'}>
                {plan.status}
              </Pill>
              {plan.visibility === 'public' && <Pill color="slate">Public</Pill>}
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card pad={0} className="overflow-hidden">
          <div className="border-b border-border px-[18px] py-3">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-text-muted">
              ◇ Tree · {flat.length} node{flat.length === 1 ? '' : 's'}
            </span>
          </div>
          {isLoading && <div className="px-[18px] py-6 text-sm text-text-muted">Loading…</div>}
          {!isLoading && flat.length === 0 && (
            <div className="px-[18px] py-6 text-sm text-text-muted">
              No nodes yet. Add a phase or task to get started.
            </div>
          )}
          <ul className="divide-y divide-border">
            {flat.map((row) => {
              const isSelected = selectedNode?.id === row.id;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(row.id);
                      setTab('details');
                    }}
                    className={`flex w-full items-center gap-3 px-[18px] py-[10px] text-left transition-colors ${
                      isSelected ? 'bg-surface-hi/60' : 'hover:bg-surface-hi/30'
                    }`}
                    style={{ paddingLeft: 18 + row.depth * 16 }}
                  >
                    <span
                      className={`font-mono text-[12px] ${
                        row.status === 'blocked'
                          ? 'text-red'
                          : row.status === 'completed'
                            ? 'text-emerald'
                            : row.status === 'in_progress'
                              ? 'text-amber'
                              : row.status === 'plan_ready'
                                ? 'text-violet'
                                : 'text-text-muted'
                      }`}
                    >
                      {STATUS_GLYPH[row.status]}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-text">
                      {row.title}
                    </span>
                    <Pill color={TYPE_COLOR[row.node_type]}>{row.node_type}</Pill>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="lg:sticky lg:top-6 lg:self-start">
          {selectedNode ? (
            <DetailPanel
              key={selectedNode.id}
              node={selectedNode}
              planId={safePlanId}
              tab={tab}
              setTab={setTab}
            />
          ) : (
            <Card pad={20}>
              <p className="text-sm text-text-sec">Pick a node to inspect.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted ${className}`}
  >
    {children}
  </div>
);

const DetailPanel: React.FC<{
  node: TreeRow;
  planId: string;
  tab: DetailTab;
  setTab: (t: DetailTab) => void;
}> = ({ node, planId, tab, setTab }) => {
  // Real event kinds per design risk #3 in 05-build-order.md:
  // log_added (logs tab), status_change (logs tab), comment (comments tab).
  // The fictional "reasoning trace" tab does NOT belong here.
  const TABS: { id: DetailTab; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'agent', label: 'Agent' },
    { id: 'comments', label: 'Comments' },
    { id: 'logs', label: 'Logs' },
  ];

  // Tree list endpoint omits description, timestamps, agent_instructions,
  // metadata, due_date — fetch the single-node row so the Details + Agent
  // tabs can render against real data.
  const fullNode = useQuery(
    ['plan-tree', planId, node.id, 'detail'],
    () => nodeService.getNode(planId, node.id),
    { enabled: !!node.id, staleTime: 30_000 },
  );
  // nodeService.getNode wraps as { data: PlanNode, status }
  const detailedNode = ((fullNode.data as any)?.data as Partial<PlanNode> | undefined) || node;

  // /context returns plan + node + children + recent logs joined — what an
  // agent that claims this task gets handed first.
  const context = useQuery(
    ['plan-tree', planId, node.id, 'context'],
    () => nodeService.getNodeContext(planId, node.id),
    { enabled: tab === 'agent' && !!node.id, staleTime: 30_000 },
  );

  const ancestry = useQuery(
    ['plan-tree', planId, node.id, 'ancestry'],
    () => nodeService.getNodeAncestry(planId, node.id),
    { enabled: tab === 'agent' && !!node.id, staleTime: 30_000 },
  );

  const comments = useQuery(
    ['plan-tree', planId, node.id, 'comments'],
    () => commentService.getComments(planId, node.id),
    { enabled: tab === 'comments', staleTime: 30_000 },
  );

  const logs = useQuery(
    ['plan-tree', planId, node.id, 'logs'],
    () => logService.getLogs(planId, node.id) as Promise<Array<{
      id: string;
      log_type?: string;
      content: string;
      created_at: string;
      user_name?: string;
    }>>,
    { enabled: tab === 'logs', staleTime: 30_000 },
  );

  return (
    <Card pad={0} className="overflow-hidden">
      <div className="border-b border-border px-[18px] py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Kicker className="mb-1">◆ Node</Kicker>
            <h2 className="font-display text-[15px] font-semibold tracking-[-0.02em] text-text">
              {node.title}
            </h2>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            <Pill color={STATUS_COLOR[node.status]}>{node.status}</Pill>
            <Pill color={TYPE_COLOR[node.node_type]}>{node.node_type}</Pill>
          </div>
        </div>
      </div>

      <nav className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
              tab === t.id
                ? 'border-amber text-text'
                : 'border-transparent text-text-muted hover:text-text-sec'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="px-[18px] py-4">
        {tab === 'details' && (
          <div className="text-[12.5px] leading-[1.55] text-text-sec">
            {detailedNode.description ? (
              <p className="whitespace-pre-wrap">{detailedNode.description}</p>
            ) : (
              <p className="text-text-muted">No description.</p>
            )}
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
              <dt className="font-mono uppercase tracking-[0.12em] text-text-muted">Children</dt>
              <dd>{node.childCount}</dd>
              {detailedNode.task_mode && (
                <>
                  <dt className="font-mono uppercase tracking-[0.12em] text-text-muted">Mode</dt>
                  <dd>{detailedNode.task_mode}</dd>
                </>
              )}
              {(detailedNode as any).coherence_status &&
                (detailedNode as any).coherence_status !== 'unchecked' && (
                  <>
                    <dt className="font-mono uppercase tracking-[0.12em] text-text-muted">Coherence</dt>
                    <dd>{(detailedNode as any).coherence_status}</dd>
                  </>
                )}
              {typeof (detailedNode as any).quality_score === 'number' && (
                <>
                  <dt className="font-mono uppercase tracking-[0.12em] text-text-muted">Quality</dt>
                  <dd>{Math.round(((detailedNode as any).quality_score as number) * 100)}%</dd>
                </>
              )}
              {detailedNode.due_date && (
                <>
                  <dt className="font-mono uppercase tracking-[0.12em] text-text-muted">Due</dt>
                  <dd>{detailedNode.due_date}</dd>
                </>
              )}
              <dt className="font-mono uppercase tracking-[0.12em] text-text-muted">Created</dt>
              <dd>{relTime(detailedNode.created_at)}</dd>
              <dt className="font-mono uppercase tracking-[0.12em] text-text-muted">Updated</dt>
              <dd>{relTime(detailedNode.updated_at)}</dd>
              <dt className="font-mono uppercase tracking-[0.12em] text-text-muted">Node ID</dt>
              <dd className="truncate font-mono text-[10px]" title={node.id}>
                {node.id.slice(0, 8)}…
              </dd>
            </dl>
          </div>
        )}

        {tab === 'agent' && (
          <div className="text-[12.5px] leading-[1.55] text-text-sec">
            <SectionLabel>Agent instructions</SectionLabel>
            {detailedNode.agent_instructions ? (
              <pre className="mt-1 whitespace-pre-wrap rounded-md border border-border bg-bg/60 px-3 py-2 font-mono text-[11px] text-text">
                {detailedNode.agent_instructions}
              </pre>
            ) : (
              <p className="text-text-muted">
                No agent instructions set. Agents fall back to the description and
                ancestry context.
              </p>
            )}

            <SectionLabel className="mt-5">Plan context</SectionLabel>
            {context.isLoading && <p className="text-text-muted">Loading…</p>}
            {context.data?.plan && (
              <div className="mt-1 rounded-md border border-border px-3 py-2">
                <p className="font-display text-[12.5px] font-semibold text-text">
                  {context.data.plan.title}
                </p>
                {context.data.plan.description && (
                  <p className="mt-1 text-[11.5px] text-text-sec">
                    {context.data.plan.description}
                  </p>
                )}
              </div>
            )}

            <SectionLabel className="mt-5">Ancestry</SectionLabel>
            {ancestry.isLoading && <p className="text-text-muted">Loading…</p>}
            {ancestry.data && (
              <ol className="mt-1 flex flex-col gap-[3px] font-mono text-[11px]">
                {((ancestry.data as any).ancestry ||
                  (ancestry.data as any).ancestors ||
                  (Array.isArray(ancestry.data) ? ancestry.data : []) ||
                  []).map(
                  (a: any, i: number, arr: any[]) => (
                    <li key={a.id} className="flex items-center gap-2">
                      <span className="text-text-muted">
                        {'·'.repeat(i)}
                        {i > 0 && '→ '}
                      </span>
                      <span className={i === arr.length - 1 ? 'text-text' : 'text-text-sec'}>
                        {a.title}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-text-muted">
                        {a.node_type}
                      </span>
                    </li>
                  ),
                )}
              </ol>
            )}

            <SectionLabel className="mt-5">
              Recent logs the agent will see ({(context.data?.logs || []).length})
            </SectionLabel>
            {context.data?.logs && context.data.logs.length === 0 && (
              <p className="text-text-muted">No logs yet.</p>
            )}
            <ul className="mt-1 flex flex-col gap-1 font-mono text-[11px]">
              {(context.data?.logs || []).slice(0, 6).map((l: any) => (
                <li key={l.id} className="flex items-start gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-text-muted">
                    {(l.log_type || 'log').slice(0, 4)}
                  </span>
                  <span className="flex-1 truncate text-text-sec" title={l.content}>
                    {l.content}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-[10.5px] text-text-muted">
              The agent also receives a knowledge layer (Graphiti episodes touching
              this task) when context_depth ≥ 3 — that runs server-side and isn't
              previewed here.
            </p>
          </div>
        )}

        {tab === 'comments' && (
          <div className="text-[12.5px]">
            {comments.isLoading && <p className="text-text-muted">Loading comments…</p>}
            {!comments.isLoading && getCommentList(comments.data).length === 0 && (
              <p className="text-text-muted">No comments yet.</p>
            )}
            <ul className="flex flex-col divide-y divide-border">
              {getCommentList(comments.data).map((c: any) => (
                <li key={c.id} className="py-3">
                  <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-text-muted">
                    <span className="font-display text-[12px] font-semibold text-text">
                      {c.user_name || c.user?.name || 'Someone'}
                    </span>
                    <span className="font-mono uppercase tracking-[0.1em]">{relTime(c.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-text-sec">{c.content}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'logs' && (
          <div className="text-[12px]">
            {logs.isLoading && <p className="text-text-muted">Loading logs…</p>}
            {!logs.isLoading && (!logs.data || logs.data.length === 0) && (
              <p className="text-text-muted">No log events yet.</p>
            )}
            <ul className="flex flex-col divide-y divide-border">
              {(logs.data || []).map((l) => (
                <li key={l.id} className="flex items-start gap-3 py-2">
                  <span className="mt-[2px] font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
                    {relTime(l.created_at)}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
                    {l.log_type || 'log'}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap text-text-sec">{l.content}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlanTree;
