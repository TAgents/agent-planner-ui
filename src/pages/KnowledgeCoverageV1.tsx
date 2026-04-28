import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Card,
  Pill,
  SectionHead,
  type PillColor,
} from '../components/v1';
import { request } from '../services/api-client';
import KnowledgeTabs from '../components/knowledge/KnowledgeTabs';
import KnowledgeHeader from '../components/knowledge/KnowledgeHeader';

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

// Coverage buckets use neutral progression (slate → amber → emerald). Red is
// reserved per the design tokens for blocked/contradiction, so a "Gap" — which
// just means *unstarted* knowledge linkage — gets slate, not red.
function bucket(ratio: number): { color: PillColor; label: string } {
  if (ratio >= 0.8) return { color: 'emerald', label: 'Covered' };
  if (ratio >= 0.5) return { color: 'amber', label: 'Partial' };
  return { color: 'slate', label: 'Gap' };
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
          b.color === 'emerald'
            ? 'bg-emerald'
            : b.color === 'amber'
              ? 'bg-amber'
              : 'bg-slate';
        const stalePill =
          p.stale_tasks.length > 0 ? (
            <Pill color="red">{`${p.stale_tasks.length} stale`}</Pill>
          ) : null;
        const conflictPill =
          p.conflict_tasks.length > 0 ? (
            <Pill color="red">{`${p.conflict_tasks.length} conflict`}</Pill>
          ) : null;
        // Show up to 3 stale + 3 conflict task tethers per row. Anything
        // beyond that collapses into "+N more" so dense plans stay scannable.
        const staleTethers = p.stale_tasks.slice(0, 3);
        const staleOverflow = Math.max(0, p.stale_tasks.length - staleTethers.length);
        const conflictTethers = p.conflict_tasks.slice(0, 3);
        const conflictOverflow = Math.max(0, p.conflict_tasks.length - conflictTethers.length);
        return (
          <Card key={p.plan_id} pad={0} className="overflow-hidden">
            <div className="block px-[18px] py-[14px] transition-colors hover:bg-surface-hi/40">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    to={`/app/plans/${p.plan_id}`}
                    className="block truncate font-display text-[14px] font-semibold tracking-[-0.01em] text-text hover:underline"
                  >
                    {p.plan_title}
                  </Link>
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

              {/* Per-task tethers — stale + conflict task chips clickable to the plan tree */}
              {(staleTethers.length > 0 || conflictTethers.length > 0) && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {staleTethers.map((t) => (
                    <Link
                      key={`s-${t.task_id}`}
                      to={`/app/plans/${p.plan_id}?node=${t.task_id}`}
                      title={`Stale — last link ${new Date(t.last_link_at).toLocaleDateString()}`}
                      className="inline-flex items-center gap-1 rounded border border-red/40 bg-red/10 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-red transition-colors hover:bg-red/15"
                    >
                      <span className="text-red/70">stale</span>
                      <span className="max-w-[24ch] truncate normal-case text-text">{t.task_title}</span>
                    </Link>
                  ))}
                  {staleOverflow > 0 && (
                    <span className="font-mono text-[9.5px] text-text-muted">+{staleOverflow}</span>
                  )}
                  {conflictTethers.map((t) => (
                    <Link
                      key={`c-${t.task_id}`}
                      to={`/app/plans/${p.plan_id}?node=${t.task_id}`}
                      title="Conflict — knowledge episodes contradict each other"
                      className="inline-flex items-center gap-1 rounded border border-red/40 bg-red/10 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-red transition-colors hover:bg-red/15"
                    >
                      <span className="text-red/70">conflict</span>
                      <span className="max-w-[24ch] truncate normal-case text-text">{t.task_title}</span>
                    </Link>
                  ))}
                  {conflictOverflow > 0 && (
                    <span className="font-mono text-[9.5px] text-text-muted">+{conflictOverflow}</span>
                  )}
                </div>
              )}
            </div>
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

  const [search, setSearch] = useState('');
  const data = coverage.data;
  const orgRatio = data?.org_summary.ratio ?? 0;
  const orgBucket = bucket(orgRatio);

  // Workspace-wide gap/contradiction/stale counts roll up the per-plan
  // coverage rows so the header reads "473 facts · 11 gaps · 2 contradictions"
  // matching the design without an extra endpoint round-trip.
  const totals = useMemo(() => {
    const plans = data?.plans || [];
    let stale = 0;
    let contradictions = 0;
    for (const p of plans) {
      stale += p.stale_tasks?.length || 0;
      contradictions += p.conflict_tasks?.length || 0;
    }
    const totalTasks = data?.org_summary.total_tasks ?? 0;
    const tasksWithFacts = data?.org_summary.tasks_with_facts ?? 0;
    const gaps = Math.max(0, totalTasks - tasksWithFacts);
    return { covered: tasksWithFacts, gaps, contradictions, stale, totalTasks };
  }, [data]);

  // Filter plan rows by free-text search across plan title + task titles
  // so the in-page search matches the spec's "Search beliefs..." behavior.
  const filteredPlans = useMemo(() => {
    const plans = data?.plans || [];
    if (!search.trim()) return plans;
    const q = search.toLowerCase();
    return plans.filter((p) => {
      if (p.plan_title.toLowerCase().includes(q)) return true;
      if (p.stale_tasks.some((t) => t.task_title.toLowerCase().includes(q))) return true;
      if (p.conflict_tasks.some((t) => t.task_title.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [data, search]);

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10 sm:px-9">
      <KnowledgeHeader
        stats={[
          { value: totals.covered, label: 'facts' },
          { value: totals.gaps, label: 'gaps', tone: 'amber' },
          { value: totals.contradictions, label: 'contradictions', tone: 'red' },
        ]}
        search={search}
        onSearchChange={setSearch}
      />
      <KnowledgeTabs />

      {/* Hero: gauge + 4-stat breakdown */}
      <Card pad={24} className="mb-7">
        <div className="flex flex-wrap items-center gap-8">
          <CoverageGauge ratio={orgRatio} label={orgBucket.label} />
          <div className="flex-1 min-w-[260px]">
            <p className="font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
              {data
                ? `${totals.covered} of ${totals.totalTasks} tasks `
                : 'Computing… '}
              <span className="text-text-sec font-normal">have supporting knowledge</span>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              <CoverageStat value={totals.covered} label="covered" tone="emerald" />
              <CoverageStat value={totals.gaps} label="knowledge gaps" tone="amber" />
              <CoverageStat value={totals.contradictions} label="contradictions" tone="red" />
              <CoverageStat value={totals.stale} label="stale facts" tone="violet" />
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
            ◆ Per-plan breakdown
          </span>
          <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
            Where is knowledge missing?
          </h2>
        </div>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">
          sorted by coverage ↑
        </span>
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

      <PlanCoverageList data={data ? { ...data, plans: filteredPlans } : undefined} />
    </div>
  );
};

const CoverageStat: React.FC<{ value: number; label: string; tone: 'emerald' | 'amber' | 'red' | 'violet' }> = ({
  value,
  label,
  tone,
}) => {
  const cls =
    tone === 'emerald'
      ? 'text-emerald'
      : tone === 'amber'
        ? 'text-amber'
        : tone === 'red'
          ? 'text-red'
          : 'text-violet';
  return (
    <div>
      <span className={`block font-display text-[24px] font-bold tabular-nums ${cls}`}>
        {value}
      </span>
      <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">
        {label}
      </span>
    </div>
  );
};

export default KnowledgeCoverageV1;
