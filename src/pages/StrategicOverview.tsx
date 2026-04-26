import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Kicker,
  Pill,
  SectionHead,
  Spark,
  StatusDot,
  type PillColor,
} from '../components/v1';
import {
  useActiveGoals,
  usePendingItems,
  useRecentPlans,
  useVelocity,
} from '../hooks/useDashboard';
import { usePlans } from '../hooks/usePlans';
import type { Plan } from '../types';

type Bucket = {
  id: 'stale' | 'needs_input' | 'in_motion' | 'finish_line' | 'done';
  label: string;
  count: number;
  color: PillColor;
};

const BAR_COLOR: Record<Bucket['id'], string> = {
  stale: 'bg-red',
  needs_input: 'bg-amber',
  in_motion: 'bg-violet',
  finish_line: 'bg-emerald',
  done: 'bg-slate',
};

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Strategic Overview — workspace-wide attention spectrum + next-up
 * items + portfolio plan rows. Sits one level above Mission Control:
 * not what's happening today, but where attention should sit.
 *
 * AttentionSpectrum buckets are computed client-side from existing
 * data sources so no new backend endpoint needed:
 *   stale       — active plans not updated in >5 days
 *   needs_input — plans with pending decisions
 *   in_motion   — active plans not in any other bucket
 *   finish_line — active plans with progress >= 80%
 *   done        — completed plans
 */
const StrategicOverview: React.FC = () => {
  const { plans, isLoading } = usePlans(1, 200);
  const pending = usePendingItems(8);
  const goals = useActiveGoals(4);
  const velocity = useVelocity();
  const recent = useRecentPlans(5);

  const buckets = useMemo<Bucket[]>(() => {
    const list = ((plans as Plan[] | undefined) || []).filter(
      (p) => p.status !== 'archived',
    );
    const decisionsByPlan = new Map<string, number>();
    for (const d of pending.data?.decisions || []) {
      decisionsByPlan.set(d.plan_id, (decisionsByPlan.get(d.plan_id) || 0) + 1);
    }
    let stale = 0,
      needsInput = 0,
      inMotion = 0,
      finishLine = 0,
      done = 0;
    for (const p of list) {
      if (p.status === 'completed') {
        done += 1;
        continue;
      }
      const isStale = p.status === 'active' && daysSince(p.updated_at) > 5;
      const wantsInput = (decisionsByPlan.get(p.id) || 0) > 0;
      const finishing = (p.progress || 0) >= 80;
      if (isStale) stale += 1;
      else if (wantsInput) needsInput += 1;
      else if (finishing) finishLine += 1;
      else inMotion += 1;
    }
    return [
      { id: 'stale', label: 'Stale', count: stale, color: 'red' },
      { id: 'needs_input', label: 'Needs input', count: needsInput, color: 'amber' },
      { id: 'in_motion', label: 'In motion', count: inMotion, color: 'violet' },
      { id: 'finish_line', label: 'Finish line', count: finishLine, color: 'emerald' },
      { id: 'done', label: 'Done', count: done, color: 'slate' },
    ];
  }, [plans, pending.data]);

  const total = buckets.reduce((s, b) => s + b.count, 0) || 1;

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10 sm:px-9">
      <header className="mb-8">
        <Kicker className="mb-2">◆ Strategy</Kicker>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
          Where attention sits
        </h1>
        <p className="mt-1 text-[13px] text-text-sec">
          A bird's-eye view of the workspace. Each band below shows the share of plans
          currently in that bucket; click through to drill in.
        </p>
      </header>

      <Card pad={20} className="mb-8">
        <SectionHead
          kicker="◇ Attention spectrum"
          title="Plans by bucket"
          right={
            velocity.data?.series ? (
              <Spark values={velocity.data.series.map((p) => p.count)} width={56} height={20} />
            ) : null
          }
        />

        <div className="flex w-full overflow-hidden rounded-[6px] border border-border-hi">
          {buckets.map((b) => {
            const pct = (b.count / total) * 100;
            return (
              <Link
                key={b.id}
                to="/app/plans"
                className={`relative flex h-9 items-center justify-center text-[10.5px] font-mono uppercase tracking-[0.1em] text-bg transition-opacity hover:opacity-90 ${BAR_COLOR[b.id]}`}
                style={{ width: `${Math.max(2, pct)}%` }}
                title={`${b.label}: ${b.count}`}
              >
                {pct >= 8 && b.count > 0 && b.count}
              </Link>
            );
          })}
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] sm:grid-cols-5">
          {buckets.map((b) => (
            <li key={b.id} className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
                {b.label}
              </span>
              <span className="font-display text-[18px] font-bold tracking-[-0.02em] text-text">
                {b.count}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card pad={20}>
          <SectionHead
            kicker="◆ Next up"
            title="Suggested by your agents"
            right={<Pill color="amber">{(pending.data?.decisions?.length || 0) + (pending.data?.agent_requests?.length || 0)}</Pill>}
          />
          {(pending.data?.decisions?.length || 0) === 0 &&
          (pending.data?.agent_requests?.length || 0) === 0 ? (
            <p className="text-[13px] text-text-sec">
              No specific next-up items. Agents queue them here when they need
              your attention or recommend a starting point.
            </p>
          ) : (
            <ol className="flex flex-col divide-y divide-border">
              {(pending.data?.decisions || []).map((d, i) => (
                <li key={d.id} className="flex items-center gap-3 py-3">
                  <span className="font-mono text-[10px] tabular-nums uppercase tracking-[0.1em] text-text-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Pill color={d.urgency === 'high' ? 'red' : 'amber'}>{d.urgency}</Pill>
                  <Link
                    to={`/app/plans/${d.plan_id}`}
                    className="min-w-0 flex-1 truncate font-display text-[13.5px] font-semibold tracking-[-0.01em] text-text hover:underline"
                  >
                    {d.title}
                  </Link>
                  <span className="font-mono text-[10px] text-text-muted">
                    {d.plan_title}
                  </span>
                </li>
              ))}
              {(pending.data?.agent_requests || []).map((r, i) => (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <span className="font-mono text-[10px] tabular-nums uppercase tracking-[0.1em] text-text-muted">
                    {String(i + 1 + (pending.data?.decisions?.length || 0)).padStart(2, '0')}
                  </span>
                  <Pill color="violet">agent</Pill>
                  <Link
                    to={`/app/plans/${r.plan_id}`}
                    className="min-w-0 flex-1 truncate font-display text-[13.5px] font-semibold tracking-[-0.01em] text-text hover:underline"
                  >
                    {r.task_title}
                  </Link>
                  <span className="font-mono text-[10px] text-text-muted">{r.plan_title}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card pad={20}>
          <SectionHead kicker="◇ Portfolio" title="In motion" />
          {recent.data?.plans && recent.data.plans.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {recent.data.plans.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/app/plans/${p.id}`}
                    className="block rounded-[8px] border border-border p-3 transition-colors hover:bg-surface-hi/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-display text-[13px] font-semibold tracking-[-0.01em] text-text">
                        {p.title}
                      </span>
                      <Pill color={p.status === 'active' ? 'amber' : 'slate'}>{p.status}</Pill>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-surface-hi">
                        <div
                          className="h-full bg-amber"
                          style={{ width: `${Math.round(p.progress || 0)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] tabular-nums text-text-sec">
                        {`${Math.round(p.progress || 0)}%`}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-sec">No active plans.</p>
          )}
        </Card>
      </div>

      <Card pad={20} className="mt-6">
        <SectionHead kicker="◇ Goals" title="What we're aiming at" />
        {goals.data?.goals && goals.data.goals.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {goals.data.goals.map((g) => (
              <li key={g.id}>
                <Link
                  to={`/app/goals/${g.id}`}
                  className="flex items-center justify-between gap-2 rounded-md px-1 py-2 hover:bg-surface-hi/40"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <StatusDot
                      color={
                        g.status === 'on_track'
                          ? 'rgb(var(--emerald) / 1)'
                          : g.status === 'at_risk'
                            ? 'rgb(var(--amber) / 1)'
                            : 'rgb(var(--red) / 1)'
                      }
                    />
                    <span className="truncate text-[12.5px] text-text">{g.title}</span>
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-text-muted">
                    {`${Math.round(g.progress || 0)}%`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-sec">No active goals.</p>
        )}
      </Card>

      {isLoading && (
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
          Loading plans…
        </p>
      )}
    </div>
  );
};

export default StrategicOverview;
