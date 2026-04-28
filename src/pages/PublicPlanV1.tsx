import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import {
  Card,
  Kicker,
  Pill,
  type PillColor,
} from '../components/v1';
import { planService } from '../services/plans.service';
import type { NodeStatus, NodeType } from '../types';
import { publicStatus } from './PublicPlanV1.helpers';

type ApiNode = {
  id: string;
  planId: string;
  parentId?: string | null;
  nodeType: string;
  title: string;
  description?: string;
  status: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  children?: ApiNode[];
};

type PublicPlanResponse = {
  id: string;
  title: string;
  description?: string;
  status: string;
  visibility: string;
  view_count: number;
  owner: { id: string; name: string } | null;
  nodes: ApiNode[];
  created_at: string;
  updated_at: string;
};

const STATUS_GLYPH: Record<string, string> = {
  not_started: '○',
  in_progress: '◐',
  completed: '✓',
  blocked: '⚠',
  plan_ready: '◇',
};

const STATUS_COLOR: Record<string, PillColor> = {
  not_started: 'slate',
  in_progress: 'amber',
  completed: 'emerald',
  blocked: 'red',
  plan_ready: 'violet',
};

const TYPE_COLOR: Record<string, PillColor> = {
  root: 'slate',
  phase: 'violet',
  task: 'amber',
  milestone: 'emerald',
};

type FlatRow = {
  id: string;
  title: string;
  description?: string;
  status: string;
  nodeType: string;
  depth: number;
};

function flatten(nodes: ApiNode[], depth = 0, out: FlatRow[] = []): FlatRow[] {
  const sorted = [...nodes].sort((a, b) => a.orderIndex - b.orderIndex);
  for (const n of sorted) {
    out.push({
      id: n.id,
      title: n.title,
      description: n.description,
      status: publicStatus(n.status),
      nodeType: n.nodeType,
      depth,
    });
    if (n.children && n.children.length > 0) flatten(n.children, depth + 1, out);
  }
  return out;
}

/**
 * Public Plan v1 — read-only render of a published plan. Reuses the
 * tree row pattern from /app/plans/:planId/tree but without agents,
 * dependency graph, or detail panel write actions. Beliefs digest is
 * a placeholder for the upcoming briefing.knowledge surfacing.
 *
 * Mounted at /public/plans/:planId-v1 for now (additive).
 */
const PublicPlanV1: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const planQ = useQuery<PublicPlanResponse>(
    ['publicPlan-v1', planId],
    () => planService.getPublicPlan(planId!) as Promise<PublicPlanResponse>,
    { enabled: !!planId, retry: 1 },
  );

  const [selected, setSelected] = useState<string | null>(null);

  const flat = useMemo(() => (planQ.data ? flatten(planQ.data.nodes) : []), [planQ.data]);
  const selectedRow = useMemo(
    () => (selected ? flat.find((r) => r.id === selected) || null : flat[0] || null),
    [flat, selected],
  );

  if (planQ.isLoading) {
    return (
      <div className="mx-auto max-w-[1080px] px-6 py-10">
        <Card pad={20}>Loading public plan…</Card>
      </div>
    );
  }
  if (planQ.error || !planQ.data) {
    return (
      <div className="mx-auto max-w-[1080px] px-6 py-10">
        <Card pad={20}>
          <p className="font-display text-base font-semibold">Plan not found</p>
          <p className="mt-2 text-sm text-text-sec">
            This plan may be private or no longer published.{' '}
            <Link to="/explore" className="underline">
              Explore public plans →
            </Link>
          </p>
        </Card>
      </div>
    );
  }

  const plan = planQ.data;
  const canonicalUrl = `https://agentplanner.io/public/plans/${plan.id}`;
  const ogImage = `https://agentplanner.io/api/plans/public/${plan.id}/og.svg`;
  const ogDescription = (plan.description?.slice(0, 200) || 'A shared plan on AgentPlanner').replace(/\s+/g, ' ').trim();

  return (
    <div className="min-h-screen bg-bg text-text">
      <Helmet>
        <title>{`${plan.title} · AgentPlanner`}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="description" content={ogDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={plan.title} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="AgentPlanner" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={plan.title} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      <header className="border-b border-border bg-surface px-6 py-3 sm:px-9">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted hover:text-text"
          >
            ← AgentPlanner
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted hover:text-text"
            >
              Sign in
            </Link>
            <Link
              to={`/login?redirect=/explore/clone/${plan.id}`}
              className="rounded-md bg-amber px-3 py-[6px] font-display text-[11.5px] font-semibold text-bg hover:opacity-90"
            >
              Fork this plan
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-6 py-10 sm:px-9">
        <div className="mb-8">
          <Kicker className="mb-2">◆ Public plan</Kicker>
          <h1 className="font-display text-[32px] font-bold tracking-[-0.04em] text-text">
            {plan.title}
          </h1>
          {plan.description && (
            <p className="mt-2 max-w-[60ch] text-[14px] leading-[1.55] text-text-sec">
              {plan.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
            {plan.owner && (
              <span className="font-mono uppercase tracking-[0.1em] text-[9.5px]">
                {`by ${plan.owner.name}`}
              </span>
            )}
            <span className="text-border-hi">·</span>
            <span className="font-mono text-[10px]">{`${flat.length} node${flat.length === 1 ? '' : 's'}`}</span>
            <span className="text-border-hi">·</span>
            <span className="font-mono text-[10px]">{`${plan.view_count} view${plan.view_count === 1 ? '' : 's'}`}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <Card pad={0} className="overflow-hidden">
            <div className="border-b border-border px-[18px] py-3">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-text-muted">
                ◇ Plan tree
              </span>
            </div>
            <ul className="divide-y divide-border">
              {flat.map((row) => {
                const isSelected = selectedRow?.id === row.id;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(row.id)}
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
                                : 'text-text-muted'
                        }`}
                      >
                        {STATUS_GLYPH[row.status] || '○'}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-text">
                        {row.title}
                      </span>
                      <Pill color={TYPE_COLOR[row.nodeType] || 'slate'}>{row.nodeType}</Pill>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="lg:sticky lg:top-6 lg:self-start flex flex-col gap-4">
            {selectedRow && (
              <Card pad={20}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Kicker className="mb-1">◆ Node</Kicker>
                    <h2 className="font-display text-[15px] font-semibold tracking-[-0.02em] text-text">
                      {selectedRow.title}
                    </h2>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <Pill color={STATUS_COLOR[selectedRow.status] || 'slate'}>
                      {selectedRow.status}
                    </Pill>
                    <Pill color={TYPE_COLOR[selectedRow.nodeType] || 'slate'}>
                      {selectedRow.nodeType}
                    </Pill>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-[12.5px] leading-[1.55] text-text-sec">
                  {selectedRow.description || 'No description.'}
                </p>
              </Card>
            )}

            <Card pad={20}>
              <Kicker className="mb-2">◇ Beliefs digest</Kicker>
              <p className="text-[12.5px] leading-[1.55] text-text-sec">
                A summary of what agents have learned in service of this plan
                will appear here once the public knowledge surface ships
                (Phase 4 — coherence + critical path; Phase 5 — graph view).
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPlanV1;
