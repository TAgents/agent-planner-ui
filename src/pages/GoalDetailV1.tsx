import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Card,
  CriticalPathSubway,
  GoalCompass,
  Kicker,
  Pill,
  SectionHead,
  type PillColor,
} from '../components/v1';
import { useGoalV2, useGoalPath } from '../hooks/useGoalsV2';
import { useCriticalPath } from '../hooks/useDependencies';
import { useRecentActivity } from '../hooks/useRecentActivity';
import { useCoherence } from '../hooks/useDashboard';
import { request } from '../services/api-client';

type Tab = 'briefing' | 'plans' | 'activity';

function statusColor(status?: string): PillColor {
  switch (status) {
    case 'active':
      return 'amber';
    case 'achieved':
      return 'emerald';
    case 'paused':
      return 'slate';
    case 'abandoned':
      return 'red';
    default:
      return 'slate';
  }
}

function relTime(iso?: string): string {
  if (!iso) return 'never';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * Goal Detail v1 — header + briefing + plans + activity tabs.
 * Skips Goal Compass + Tension Hotspots + Critical-Path Subway per
 * Phase 2 scope; <ProposedChip> placeholder cards keep the layout
 * stable for Phase 4.
 */
const GoalDetailV1: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const goalQ = useGoalV2(goalId);
  const pathQ = useGoalPath(goalId);
  const activity = useRecentActivity(20);

  const [tab, setTab] = useState<Tab>('briefing');

  const goal = goalQ.data;
  const path = pathQ.data as { plans?: Array<{ id: string; title: string; progress?: number }> } | undefined;
  const linkedPlans = path?.plans || [];

  if (goalQ.isLoading) {
    return (
      <div className="mx-auto max-w-[1080px] px-6 py-10">
        <Card pad={20}>Loading goal…</Card>
      </div>
    );
  }
  if (!goal) {
    return (
      <div className="mx-auto max-w-[1080px] px-6 py-10">
        <Card pad={20}>
          <p className="font-display text-base font-semibold">Goal not found</p>
          <p className="mt-2 text-sm text-text-sec">
            <Link to="/app/goals" className="underline">Back to goals →</Link>
          </p>
        </Card>
      </div>
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'briefing', label: 'Briefing' },
    { id: 'plans', label: `Plans · ${linkedPlans.length}` },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10 sm:px-9">
      <header className="mb-8">
        <Link
          to="/app/goals"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted hover:text-text"
        >
          ← Goals
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <Kicker className="mb-1">◆ Goal</Kicker>
            <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-text">
              {goal.title}
            </h1>
            {goal.description && (
              <p className="mt-2 max-w-[60ch] text-[13px] leading-[1.55] text-text-sec">
                {goal.description}
              </p>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <Pill color={statusColor(goal.status)}>{goal.status}</Pill>
            <Pill color="slate">{goal.type}</Pill>
          </div>
        </div>
      </header>

      <nav className="mb-6 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors ${
              tab === t.id
                ? 'border-amber text-text'
                : 'border-transparent text-text-muted hover:text-text-sec'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'briefing' && (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card pad={20}>
            <SectionHead kicker="◆ Briefing" title="Status & next steps" />
            <p className="text-[13px] leading-[1.55] text-text-sec">
              {goal.description ||
                'No briefing copy yet. As agents observe progress, they will summarize here.'}
            </p>
            {Array.isArray(goal.evaluations) && goal.evaluations.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {goal.evaluations.slice(0, 3).map((e) => (
                  <li key={e.id} className="rounded-md border border-border bg-bg/50 px-3 py-2 text-[12px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono uppercase text-[9px] tracking-[0.12em] text-text-muted">
                        {relTime(e.evaluatedAt)}
                      </span>
                      {typeof e.score === 'number' && (
                        <span className="font-mono text-[11px] font-bold text-text">
                          {Math.round(e.score * 100)}%
                        </span>
                      )}
                    </div>
                    {e.reasoning && <p className="mt-1 text-text-sec">{e.reasoning}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="flex flex-col gap-6">
            <Card pad={20}>
              <SectionHead kicker="◇ Compass" title="Belief / Desire / Intention" />
              <div className="flex flex-col items-center">
                <GoalCompass
                  centerLabel={goal.title}
                  axes={[
                    {
                      label: 'Beliefs',
                      count: linkedPlans.length,
                      sub: 'Plans serving this goal',
                    },
                    {
                      label: 'Desires',
                      count: Array.isArray(goal.successCriteria)
                        ? goal.successCriteria.length
                        : goal.successCriteria
                          ? 1
                          : 0,
                      sub: 'Success criteria',
                    },
                    {
                      label: 'Intentions',
                      count: Array.isArray(goal.evaluations) ? goal.evaluations.length : 0,
                      sub: 'Evaluations on record',
                    },
                    {
                      label: 'Constraints',
                      count: Array.isArray(goal.links) ? goal.links.length : 0,
                      sub: 'Linked entities',
                    },
                  ]}
                />
              </div>
              <p className="mt-3 text-[11px] leading-[1.55] text-text-muted">
                Counts derived from goal links + evaluations + success criteria.
                Per-axis sub-scoring lands when /goals/:id/coherence ships.
              </p>
            </Card>
            <TensionHotspots />
          </div>
          <div className="lg:col-span-2">
            <Card pad={20}>
              <SubwayPanel linkedPlans={linkedPlans} />
            </Card>
          </div>
        </div>
      )}

      {tab === 'plans' && (
        <Card pad={20}>
          <SectionHead kicker="◆ Linked plans" title="In service of this goal" />
          {linkedPlans.length === 0 ? (
            <p className="text-sm text-text-sec">No plans link to this goal yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {linkedPlans.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/app/plans/${p.id}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3 transition-colors hover:bg-surface-hi/40"
                  >
                    <span className="truncate font-display text-[13.5px] font-semibold text-text">
                      {p.title}
                    </span>
                    {typeof p.progress === 'number' && (
                      <span className="font-mono text-[11px] tabular-nums text-text-sec">
                        {Math.round(p.progress)}%
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'activity' && (
        <Card pad={20}>
          <SectionHead kicker="◇ Activity" title="Recent events" />
          {(activity.data || []).length === 0 ? (
            <p className="text-sm text-text-sec">No recent activity.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {(activity.data || []).slice(0, 15).map((a) => (
                <li key={a.id} className="flex items-start gap-3 py-3">
                  <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-muted">
                    {relTime(a.created_at)}
                  </span>
                  <span className="text-[12.5px] text-text-sec">
                    {a.description || a.type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
};

/**
 * SubwayPanel — picks the first linked plan and renders its critical
 * path as a horizontal subway map. Walks plans top-down so the user
 * sees the most-immediate path; multi-plan composition (one subway
 * per linked plan) is a follow-up if morning review wants it.
 */
const SubwayPanel: React.FC<{ linkedPlans: Array<{ id: string; title: string }> }> = ({
  linkedPlans,
}) => {
  const firstPlan = linkedPlans[0];
  const cp = useCriticalPath(firstPlan?.id || '', !!firstPlan);

  if (!firstPlan) {
    return (
      <>
        <SectionHead kicker="◆ Critical path" title="No plans linked yet" />
        <p className="text-[12.5px] text-text-sec">
          Link a plan to this goal to see its critical path here.
        </p>
      </>
    );
  }

  const result = cp.criticalPath as { path?: Array<{ node_id: string; title: string; status: string }> } | undefined;
  const stations = (result?.path || []).map((p) => ({
    id: p.node_id,
    title: p.title,
    status: p.status,
    href: `/app/plans/${firstPlan.id}`,
  }));

  return (
    <>
      <SectionHead
        kicker="◆ Critical path"
        title={firstPlan.title}
        right={
          stations.length > 0 ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              {`${stations.length} station${stations.length === 1 ? '' : 's'}`}
            </span>
          ) : null
        }
      />
      {cp.isLoading ? (
        <p className="text-[12.5px] text-text-muted">Computing path…</p>
      ) : (
        <CriticalPathSubway stations={stations} />
      )}
    </>
  );
};

/**
 * Tension Hotspots — list of detected workspace tensions composed from
 * the existing /coherence/summary + /knowledge/coverage signals. Each
 * row links to the relevant surface (decisions queue / plan / coverage
 * page) so a user can drill into the underlying detail.
 *
 * Currently org-wide; goal-scoped filtering is a small follow-up that
 * needs the API to expose per-goal coherence signals.
 */
const TensionHotspots: React.FC = () => {
  const coh = useCoherence();
  const cov = useQuery<{
    plans: Array<{
      plan_id: string;
      plan_title: string;
      stale_tasks: Array<{ task_id: string; task_title: string }>;
      conflict_tasks: Array<{ task_id: string; task_title: string }>;
    }>;
  }>(
    ['knowledge', 'coverage'],
    () => request({ url: '/knowledge/coverage', method: 'get' }),
    { staleTime: 60_000 },
  );

  const sig = coh.data?.signals;
  const plansWithStale = (cov.data?.plans || []).filter((p) => p.stale_tasks.length > 0);
  const plansWithConflict = (cov.data?.plans || []).filter((p) => p.conflict_tasks.length > 0);
  const empty =
    !sig ||
    (sig.pending_decisions === 0 &&
      sig.blocked_tasks === 0 &&
      plansWithStale.length === 0 &&
      plansWithConflict.length === 0);

  return (
    <Card pad={20}>
      <SectionHead
        kicker="◇ Tensions"
        title="Hotspots"
        right={
          coh.data ? (
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
              {`${Math.round(coh.data.score * 100)}% coherent`}
            </span>
          ) : null
        }
      />
      {empty ? (
        <p className="text-[12.5px] leading-[1.55] text-text-sec">
          No active tensions. Nothing's contradicting itself, blocking, or going stale.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border text-[12.5px]">
          {sig && sig.pending_decisions > 0 && (
            <li className="flex items-center justify-between py-2">
              <span>{`${sig.pending_decisions} decision${sig.pending_decisions === 1 ? '' : 's'} awaiting you`}</span>
              <Link to="/app" className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber hover:opacity-80">
                Queue →
              </Link>
            </li>
          )}
          {sig && sig.blocked_tasks > 0 && (
            <li className="flex items-center justify-between py-2">
              <span>{`${sig.blocked_tasks} blocked task${sig.blocked_tasks === 1 ? '' : 's'}`}</span>
              <Pill color="red">{`${Math.round(sig.blocked_task_ratio * 100)}%`}</Pill>
            </li>
          )}
          {plansWithStale.slice(0, 3).map((p) => (
            <li key={`stale-${p.plan_id}`} className="flex items-center justify-between py-2">
              <span className="truncate">
                {p.plan_title}
                <span className="ml-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-muted">
                  {`${p.stale_tasks.length} stale`}
                </span>
              </span>
              <Link
                to={`/app/plans/${p.plan_id}`}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber hover:opacity-80"
              >
                Open →
              </Link>
            </li>
          ))}
          {plansWithConflict.slice(0, 3).map((p) => (
            <li key={`conflict-${p.plan_id}`} className="flex items-center justify-between py-2">
              <span className="truncate">
                {p.plan_title}
                <span className="ml-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-muted">
                  {`${p.conflict_tasks.length} conflict`}
                </span>
              </span>
              <Link
                to={`/app/plans/${p.plan_id}`}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-red hover:opacity-80"
              >
                Resolve →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default GoalDetailV1;
