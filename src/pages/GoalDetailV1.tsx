import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Card,
  Kicker,
  Pill,
  ProposedChip,
  SectionHead,
  type PillColor,
} from '../components/v1';
import { useGoalV2, useGoalPath } from '../hooks/useGoalsV2';
import { useRecentActivity } from '../hooks/useRecentActivity';

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
              <SectionHead kicker="◇ Compass" title="Belief / Desire / Intention" right={<ProposedChip />} />
              <p className="text-[12px] leading-[1.55] text-text-sec">
                The Goal Compass wires up in Phase 4. Until then, agents flag tensions
                and stale beliefs inline; this card holds the layout slot.
              </p>
            </Card>
            <Card pad={20}>
              <SectionHead kicker="◇ Tensions" title="Hotspots" right={<ProposedChip />} />
              <p className="text-[12px] leading-[1.55] text-text-sec">
                Tension hotspots (contradictions, stale beliefs) are surfaced
                inline on plans for now; the dedicated panel arrives in Phase 4.
              </p>
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

export default GoalDetailV1;
