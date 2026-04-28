import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import {
  Card,
  Kicker,
  Pill,
  type PillColor,
} from '../components/v1';
import { planService } from '../services/plans.service';
import { useAuth } from '../hooks/useAuth';

type PublicPlan = {
  id: string;
  title: string;
  description?: string;
  status: string;
  view_count: number;
  fork_count?: number;
  star_count?: number;
  updated_at: string;
  created_at: string;
  owner?: { id: string; name: string };
  metadata?: { categories?: string[] };
};

type SortKey = 'recent' | 'popular' | 'alphabetical';

const STATUS_COLOR: Record<string, PillColor> = {
  active: 'amber',
  completed: 'emerald',
  draft: 'slate',
  archived: 'slate',
};

function relTime(iso: string): string {
  if (!iso) return 'recently';
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d < 1) return 'today';
  if (d === 1) return '1d';
  if (d < 30) return `${d}d`;
  return `${Math.floor(d / 30)}mo`;
}

/**
 * Explore — v1 catalog of published public plans. Composes the existing
 * /plans/public catalog endpoint with bucket pills and a "Plan of the
 * week" featured slot at the top.
 *
 * Plan publishing infrastructure (slugs, snapshots) is task 3c30455d
 * and ships separately; this v1 surface uses the existing public-plans
 * endpoint so the marketing landing CTA + PublicPlanV1 fork CTA both
 * have a real catalog to link into today.
 */
const ExploreV1: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sort, setSort] = useState<SortKey>('recent');
  const [query, setQuery] = useState('');
  const [forkingId, setForkingId] = useState<string | null>(null);

  const forkMutation = useMutation(
    async (planId: string) => planService.forkPlan(planId),
    {
      onSuccess: (data: any) => {
        const newId = data?.plan?.id || data?.id;
        if (newId) navigate(`/app/plans/${newId}`);
      },
      onSettled: () => setForkingId(null),
    },
  );

  const plansQ = useQuery(
    ['publicPlans-v1', sort],
    async () => {
      const res = await planService.getPublicPlans(sort, 100, 0);
      // The endpoint returns { plans, total, page, limit, total_pages };
      // accept a bare array as a defensive fallback for older deployments.
      const list = Array.isArray(res) ? res : res?.plans || res?.data || [];
      return list as PublicPlan[];
    },
    { staleTime: 60_000 },
  );

  const filtered = useMemo<PublicPlan[]>(() => {
    const list = plansQ.data || [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q),
    );
  }, [plansQ.data, query]);

  // Featured = first plan with a recent update + non-trivial view count.
  // Editorial featuring (a `featured_plans` table) is part of the full
  // publishing task; this is a defensible MVP signal until that lands.
  const featured = useMemo<PublicPlan | null>(() => {
    const list = plansQ.data || [];
    const withViews = list.filter((p) => (p.view_count || 0) >= 5);
    return withViews.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))[0] || list[0] || null;
  }, [plansQ.data]);

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10 sm:px-9">
      <header className="mb-8">
        <Kicker className="mb-2">◆ Explore</Kicker>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
          Public plans
        </h1>
        <p className="mt-1 text-[13px] text-text-sec">
          Plans others have made public. Open one to read it; fork it to start working on a copy.
        </p>
      </header>

      {featured && (
        <Card pad={28} className="mb-10">
          <Kicker className="mb-3">◇ Featured</Kicker>
          <h2 className="font-display text-[22px] font-bold tracking-[-0.03em] text-text">
            <Link to={`/public/plans/${featured.id}`} className="hover:underline">
              {featured.title}
            </Link>
          </h2>
          {featured.description && (
            <p className="mt-2 max-w-[60ch] text-[13.5px] leading-[1.55] text-text-sec">
              {featured.description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
            {featured.owner && (
              <span className="font-mono uppercase tracking-[0.1em] text-[9.5px]">
                {`by ${featured.owner.name}`}
              </span>
            )}
            <span className="text-border-hi">·</span>
            <span className="font-mono text-[10px]">{`${featured.view_count} views`}</span>
            <span className="text-border-hi">·</span>
            <span className="font-mono text-[10px]">{`updated ${relTime(featured.updated_at)} ago`}</span>
            <Link
              to={`/public/plans/${featured.id}`}
              className="ml-auto rounded-md bg-amber px-3 py-[6px] font-display text-xs font-semibold text-bg hover:opacity-90"
            >
              Read plan →
            </Link>
          </div>
        </Card>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Search public plans…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[260px] flex-1 rounded-md border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-text-muted focus:outline-none"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-xs text-text"
        >
          <option value="recent">Recently updated</option>
          <option value="popular">Most viewed</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      {plansQ.isLoading && <Card pad={20}>Loading catalog…</Card>}
      {!plansQ.isLoading && filtered.length === 0 && (
        <Card pad={32}>
          <div className="text-center">
            <p className="font-display text-base font-semibold text-text">No public plans yet</p>
            <p className="mt-2 text-sm text-text-sec">
              {query
                ? 'Nothing matches that search.'
                : 'When workspace owners publish a plan, it will appear here.'}
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((p) => (
          <Card key={p.id} pad={0}>
            <div className="px-[18px] py-[14px]">
              <Link
                to={`/public/plans/${p.id}`}
                className="block transition-colors hover:opacity-90"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="block flex-1 truncate font-display text-[14px] font-semibold tracking-[-0.01em] text-text hover:underline">
                    {p.title}
                  </span>
                  <Pill color={STATUS_COLOR[p.status] || 'slate'}>{p.status}</Pill>
                </div>
                {p.description && (
                  <p className="mt-1 line-clamp-2 text-[12px] leading-[1.5] text-text-sec">
                    {p.description}
                  </p>
                )}
              </Link>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-text-muted">
                <div className="flex flex-wrap items-center gap-2">
                  {p.owner && <span className="uppercase tracking-[0.1em] text-[9px]">{p.owner.name}</span>}
                  <span>{`${p.view_count} views`}</span>
                  {typeof p.fork_count === 'number' && <span>{`${p.fork_count} forks`}</span>}
                  <span className="text-border-hi">·</span>
                  <span>{`updated ${relTime(p.updated_at)} ago`}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isAuthenticated) {
                      navigate(`/login?next=${encodeURIComponent(`/explore/clone/${p.id}`)}`);
                      return;
                    }
                    setForkingId(p.id);
                    forkMutation.mutate(p.id);
                  }}
                  disabled={forkingId === p.id}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-sec transition-colors hover:border-amber hover:text-text disabled:opacity-50"
                  title="Copy this plan to your workspace"
                >
                  {forkingId === p.id ? 'Forking…' : '◐ Fork'}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExploreV1;
