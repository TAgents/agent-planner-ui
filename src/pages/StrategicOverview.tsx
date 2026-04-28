import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Pill, type PillColor } from '../components/v1';
import {
  usePendingItems,
  useRecentPlans,
} from '../hooks/useDashboard';
import { usePlans } from '../hooks/usePlans';
import type { Plan } from '../types';
import {
  computeAttentionBuckets,
  selectOnePushFromDone,
  selectBlockedOnYou,
  selectDriftingWithoutYou,
  type BucketId,
} from './StrategicOverview.helpers';

const BUCKET_CLS: Record<BucketId, { bar: string; text: string }> = {
  stale: { bar: 'bg-red', text: 'text-red' },
  needs_input: { bar: 'bg-amber', text: 'text-amber' },
  in_motion: { bar: 'bg-violet', text: 'text-violet' },
  finish_line: { bar: 'bg-emerald', text: 'text-emerald' },
  done: { bar: 'bg-text-muted/30', text: 'text-text-muted' },
};

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

function relTime(iso?: string): string {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/**
 * Strategic Overview — agent-recommended attention map.
 * "Where to spend the next hour": attention spectrum heatline,
 * suggested-by-agents next-up list, near-finish + blocked-on-you
 * pair, drifting-without-you red strip, plans→goals roll-up.
 *
 * All buckets derive client-side from existing endpoints
 * (/dashboard/pending, /plans, /dashboard/recent-plans) so this
 * page lights up without new backend work; the agent-suggestion
 * list specifically uses /dashboard/pending decisions + agent_requests.
 */
const StrategicOverview: React.FC = () => {
  const { plans, isLoading } = usePlans(1, 200);
  const pending = usePendingItems(8);
  const recent = useRecentPlans(8);
  const planList = (plans as Plan[] | undefined) || [];

  const decisions = pending.data?.decisions || [];
  const agentRequests = pending.data?.agent_requests || [];
  const decisionsByPlan = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of decisions) m.set(d.plan_id, (m.get(d.plan_id) || 0) + 1);
    return m;
  }, [decisions]);

  const buckets = useMemo(
    () => computeAttentionBuckets(planList, decisionsByPlan),
    [planList, decisionsByPlan],
  );
  const totalForHeatline = buckets.reduce((s, b) => s + b.count, 0) || 1;

  const onePushFromDone = useMemo(() => selectOnePushFromDone(planList), [planList]);
  const blockedOnYou = useMemo(
    () => selectBlockedOnYou(planList, decisionsByPlan),
    [planList, decisionsByPlan],
  );
  const drifting = useMemo(() => selectDriftingWithoutYou(planList), [planList]);

  // Agent suggestions feed — same data Mission Control's "Awaiting your call"
  // shows but ordered with mode chip + unblocks count for the next-up list.
  const suggestions = useMemo(() => {
    const mapDecision = (d: typeof decisions[number]) => ({
      id: d.id,
      title: d.title,
      planId: d.plan_id,
      planTitle: d.plan_title,
      mode: 'decide' as const,
      tone: 'amber' as PillColor,
      ageIso: d.created_at,
    });
    const mapAgentReq = (r: typeof agentRequests[number]) => {
      const t = (r.request_type || '').toLowerCase();
      const mode = t.includes('research') ? 'research' : t.includes('plan') ? 'plan' : 'implement';
      const tone: PillColor = mode === 'research' ? 'violet' : mode === 'plan' ? 'amber' : 'emerald';
      return {
        id: r.id,
        title: r.task_title,
        planId: r.plan_id,
        planTitle: r.plan_title,
        mode,
        tone,
        ageIso: r.requested_at,
      };
    };
    return [...decisions.map(mapDecision), ...agentRequests.map(mapAgentReq)].slice(0, 6);
  }, [decisions, agentRequests]);

  // Plans → goals roll-up — group active plans by their first goal tether.
  const goalRollup = useMemo(() => {
    const byGoal = new Map<string, { goalId: string; goalTitle: string; plans: Plan[] }>();
    for (const p of planList) {
      const tether = p.goal_tethers?.[0];
      if (!tether) continue;
      const slot = byGoal.get(tether.goal_id) || {
        goalId: tether.goal_id,
        goalTitle: tether.goal_title,
        plans: [],
      };
      slot.plans.push(p);
      byGoal.set(tether.goal_id, slot);
    }
    return Array.from(byGoal.values()).slice(0, 6);
  }, [planList]);

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const decisionsCount = decisions.length;

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10 sm:px-9">
      <header className="mb-7">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
          ◇ Strategic overview
        </span>
        <h1 className="mt-2 font-display text-[28px] font-bold tracking-[-0.035em] text-text">
          Where to{' '}
          <span className="text-amber">spend the next hour</span>
        </h1>
        <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-text-sec">
          {decisionsCount} decision{decisionsCount === 1 ? '' : 's'} in your queue · {dateLabel}
        </p>
      </header>

      {/* Attention spectrum heatline */}
      <Card pad={20} className="mb-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
            ◆ Attention spectrum
          </span>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">
            {planList.length} plan{planList.length === 1 ? '' : 's'} · live
          </span>
        </div>
        <div
          role="img"
          aria-label="Attention spectrum heatline"
          className="flex h-9 w-full overflow-hidden rounded-md bg-surface-hi"
        >
          {buckets.map((b) => {
            const pct = (b.count / totalForHeatline) * 100;
            if (b.count === 0) return null;
            return (
              <Link
                key={b.id}
                to={`/app/plans?bucket=${b.id}`}
                title={`${b.label}: ${b.count}`}
                className={`flex h-full items-center justify-center font-display text-[16px] font-bold tracking-[-0.02em] text-bg transition-opacity hover:opacity-90 ${BUCKET_CLS[b.id].bar}`}
                style={{ width: `${Math.max(2, pct)}%` }}
              >
                {pct >= 6 && b.count}
              </Link>
            );
          })}
        </div>
        <ul className="mt-3 grid grid-cols-5 gap-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
          {buckets.map((b) => (
            <li key={b.id} className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${BUCKET_CLS[b.id].bar}`} aria-hidden />
              <span>{b.label}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Suggested by your agents — numbered next-up list */}
      <Card pad={20} className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
              ◆ Next up
            </span>
            <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
              Suggested by your agents
            </h2>
          </div>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">
            top {suggestions.length} of {decisions.length + agentRequests.length}
          </span>
        </div>
        {suggestions.length === 0 ? (
          <p className="text-[12.5px] text-text-sec">
            No specific next-up items. Agents queue suggestions here when they need
            your attention or recommend a starting point.
          </p>
        ) : (
          <ol className="flex flex-col divide-y divide-border">
            {suggestions.map((s, i) => (
              <li key={s.id}>
                <Link
                  to={`/app/plans/${s.planId}`}
                  className="flex items-center gap-3 py-2.5 text-text transition-colors hover:bg-surface-hi/40"
                >
                  <span className="w-6 flex-shrink-0 font-mono text-[10px] tabular-nums uppercase tracking-[0.12em] text-text-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Pill color={s.tone}>{s.mode}</Pill>
                  <span className="min-w-0 flex-1 truncate font-display text-[13px] font-semibold tracking-[-0.01em]">
                    {s.title}
                  </span>
                  <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted sm:inline">
                    {s.planTitle}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums uppercase tracking-[0.12em] text-text-muted">
                    {relTime(s.ageIso)}
                  </span>
                  <span aria-hidden className="text-text-muted">→</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Card>

      {/* One push from done · Blocked on you */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <PlanRowsCard
          kicker="◆ Almost there"
          title="One push from done"
          plans={onePushFromDone}
          accent="emerald"
        />
        <PlanRowsCard
          kicker="◆ Awaiting your call"
          title="Blocked on you"
          plans={blockedOnYou}
          decisionsByPlan={decisionsByPlan}
          accent="amber"
        />
      </div>

      {/* Drifting without you — red-tinted full width */}
      {drifting.length > 0 && (
        <Card pad={20} className="mb-6 border-red/40 bg-red/[0.04]">
          <div className="mb-3">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-red">
              ◆ Stale
            </span>
            <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
              Drifting without you
            </h2>
          </div>
          <ul className="flex flex-col divide-y divide-red/20">
            {drifting.map((p) => {
              const days = daysSince(p.updated_at);
              const pct = Math.round(p.progress || 0);
              return (
                <li key={p.id}>
                  <Link
                    to={`/app/plans/${p.id}`}
                    className="flex items-center gap-3 py-2.5 transition-colors hover:bg-red/5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[13px] font-semibold text-text">
                        {p.title}
                      </span>
                      {p.goal_tethers?.[0] && (
                        <span className="block truncate font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
                          ↳ {p.goal_tethers[0].goal_title}
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-text-sec">
                      {pct}%
                    </span>
                    <Pill color="red">{`${days}d stale`}</Pill>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* Plans → goals */}
      {goalRollup.length > 0 && (
        <Card pad={20}>
          <div className="mb-3">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
              ◆ Roll-up
            </span>
            <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
              Plans → goals
            </h2>
          </div>
          <ul className="flex flex-col divide-y divide-border">
            {goalRollup.map((g) => {
              const totalProgress = g.plans.reduce((s, p) => s + (p.progress || 0), 0);
              const avgPct = Math.round(totalProgress / g.plans.length);
              return (
                <li key={g.goalId}>
                  <Link
                    to={`/app/goals/${g.goalId}`}
                    className="flex items-center gap-3 py-2.5 transition-colors hover:bg-surface-hi/40"
                  >
                    <span className="min-w-0 flex-1 truncate font-display text-[13px] font-semibold text-text">
                      {g.goalTitle}
                    </span>
                    <div className="flex h-[3px] w-32 overflow-hidden rounded-full bg-surface-hi">
                      <div className="bg-emerald" style={{ width: `${avgPct}%` }} />
                    </div>
                    <span className="font-mono text-[11px] tabular-nums text-text-sec">
                      {avgPct}%
                    </span>
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
                      {g.plans.length} {g.plans.length === 1 ? 'plan' : 'plans'}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {recent.data?.plans && recent.data.plans.length === 0 && planList.length === 0 && (
        <p className="text-center text-[12.5px] text-text-sec">No plans yet.</p>
      )}

      {isLoading && (
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
          Loading plans…
        </p>
      )}
    </div>
  );
};

const PlanRowsCard: React.FC<{
  kicker: string;
  title: string;
  plans: Plan[];
  decisionsByPlan?: Map<string, number>;
  accent: 'emerald' | 'amber';
}> = ({ kicker, title, plans, decisionsByPlan, accent }) => {
  const accentCls = accent === 'emerald' ? 'bg-emerald' : 'bg-amber';
  return (
    <Card pad={20}>
      <div className="mb-3">
        <span className={`font-mono text-[9.5px] uppercase tracking-[0.16em] ${accent === 'emerald' ? 'text-emerald' : 'text-amber'}`}>
          {kicker}
        </span>
        <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
          {title}
        </h2>
      </div>
      {plans.length === 0 ? (
        <p className="text-[12.5px] text-text-sec">Nothing here right now.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {plans.map((p) => {
            const pct = Math.round(p.progress || 0);
            const waiting = decisionsByPlan?.get(p.id) || 0;
            return (
              <li key={p.id}>
                <Link
                  to={`/app/plans/${p.id}`}
                  className="block rounded-md transition-colors hover:bg-surface-hi/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate font-display text-[13px] text-text">
                      {p.title}
                    </span>
                    <div className="flex h-[3px] w-28 overflow-hidden rounded-full bg-surface-hi">
                      <div className={accentCls} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-mono text-[11px] tabular-nums text-text-sec">{pct}%</span>
                  </div>
                  {waiting > 0 && (
                    <span className="ml-1 mt-1 inline-block font-mono text-[9.5px] uppercase tracking-[0.12em] text-amber">
                      {waiting} agent{waiting === 1 ? '' : 's'} waiting
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default StrategicOverview;
