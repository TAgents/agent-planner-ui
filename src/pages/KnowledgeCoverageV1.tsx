import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Card,
  Kicker,
  Pill,
  ProposedChip,
  SectionHead,
  type PillColor,
} from '../components/v1';
import { request } from '../services/api-client';

type StaleTask = { task_id: string; task_title: string; last_link_at: string };
type ConflictTask = { task_id: string; task_title: string };
type PlanCoverage = {
  plan_id: string;
  plan_title: string;
  total_tasks: number;
  tasks_with_facts: number;
  ratio: number;
  stale_tasks: StaleTask[];
  conflict_tasks: ConflictTask[];
};
type CoverageResponse = {
  org_summary: {
    total_tasks: number;
    tasks_with_facts: number;
    ratio: number;
    stale_days_threshold: number;
  };
  plans: PlanCoverage[];
  computed_at: string;
};

function bucket(ratio: number): { color: PillColor; label: string } {
  if (ratio >= 0.8) return { color: 'emerald', label: 'Covered' };
  if (ratio >= 0.5) return { color: 'amber', label: 'Partial' };
  return { color: 'red', label: 'Gap' };
}

const CoverageGauge: React.FC<{ ratio: number; label: string }> = ({ ratio, label }) => {
  const pct = Math.max(0, Math.min(1, ratio));
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const display = `${Math.round(pct * 100)}%`;

  return (
    <div className="relative flex h-[140px] w-[140px] items-center justify-center">
      <svg width={140} height={140} className="-rotate-90">
        <circle
          cx={70}
          cy={70}
          r={radius}
          stroke="rgb(var(--surface-hi))"
          strokeWidth={8}
          fill="none"
        />
        <circle
          cx={70}
          cy={70}
          r={radius}
          stroke="rgb(var(--amber))"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-[28px] font-bold tracking-[-0.04em] text-text">
          {display}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
          {label}
        </span>
      </div>
    </div>
  );
};

function PlanCoverageList({ data }: { data?: CoverageResponse }) {
  const plans = data?.plans || [];
  if (plans.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {plans.map((p) => {
        const b = bucket(p.ratio);
        const barColor =
          b.color === 'emerald' ? 'bg-emerald' : b.color === 'amber' ? 'bg-amber' : 'bg-red';
        const stalePill =
          p.stale_tasks.length > 0 ? (
            <Pill color="red">{`${p.stale_tasks.length} stale`}</Pill>
          ) : null;
        const conflictPill =
          p.conflict_tasks.length > 0 ? (
            <Pill color="red">{`${p.conflict_tasks.length} conflict`}</Pill>
          ) : null;
        return (
          <Card key={p.plan_id} pad={0} className="overflow-hidden">
            <Link
              to={`/app/plans/${p.plan_id}`}
              className="block px-[18px] py-[14px] transition-colors hover:bg-surface-hi/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="block truncate font-display text-[14px] font-semibold tracking-[-0.01em] text-text">
                    {p.plan_title}
                  </span>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                    <span className="font-mono uppercase tracking-[0.1em] text-[9.5px]">tasks</span>
                    <span className="font-mono text-[10px]">
                      {`${p.tasks_with_facts}/${p.total_tasks}`}
                    </span>
                    {stalePill}
                    {conflictPill}
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <span className="font-display text-[20px] font-bold tracking-[-0.03em] text-text">
                    {`${Math.round(p.ratio * 100)}%`}
                  </span>
                  <Pill color={b.color}>{b.label}</Pill>
                </div>
              </div>
              <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-surface-hi">
                <div
                  className={`h-full ${barColor}`}
                  style={{ width: `${Math.round(p.ratio * 100)}%` }}
                />
              </div>
            </Link>
          </Card>
        );
      })}
    </div>
  );
};

const KnowledgeCoverageV1: React.FC = () => {
  const coverage = useQuery(
    ['knowledge', 'coverage'],
    () => request<CoverageResponse>({ url: '/knowledge/coverage', method: 'get' }),
    { staleTime: 60_000 },
  );

  const data = coverage.data;
  const orgRatio = data?.org_summary.ratio ?? 0;
  const orgBucket = bucket(orgRatio);

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10 sm:px-9">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Kicker className="mb-2">◆ Knowledge</Kicker>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
            Coverage
          </h1>
          <p className="mt-1 text-[13px] text-text-sec">
            How much of your active work is backed by what your agents have learned.
          </p>
        </div>
      </header>

      <div className="mb-10 grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card pad={20} className="flex flex-col items-center">
          <CoverageGauge ratio={orgRatio} label={orgBucket.label} />
          <p className="mt-4 text-center text-[12px] text-text-sec">
            {data
              ? `${data.org_summary.tasks_with_facts} of ${data.org_summary.total_tasks} active tasks have at least one knowledge episode linked.`
              : 'Loading…'}
          </p>
        </Card>

        <Card pad={20}>
          <SectionHead
            kicker="◇ Coverage breakdown"
            title="What's strong, what's thin"
          />
          <p className="text-[13px] leading-[1.55] text-text-sec">
            Plans below sort lowest-coverage first so gaps surface quickly.
          </p>
        </Card>
      </div>

      {coverage.isLoading && (
        <Card pad={20}>
          <p className="text-sm text-text-muted">Loading coverage…</p>
        </Card>
      )}

      {coverage.error ? (
        <Card pad={20}>
          <p className="text-sm text-red">Could not load coverage data.</p>
        </Card>
      ) : null}

      <PlanCoverageList data={data} />

      <Card pad={20} className="mt-10">
        <SectionHead
          kicker="◇ What this measures"
          title="Methodology"
        />
        <p className="text-[12.5px] leading-[1.55] text-text-sec">
          Coverage is computed from the structured episode_node_links table.
          A task is stale when its most recent link is older than the
          threshold; conflict when at least one link is tagged contradicts.
        </p>
      </Card>

    </div>
  );
};

export default KnowledgeCoverageV1;
