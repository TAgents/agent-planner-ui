import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { planService } from '../services/plans.service';
import { useGoalV2 } from '../hooks/useGoalsV2';
import { Card, Pill } from '../components/v1';
import {
  useGraphitiEpisodes,
  useGraphitiStatus,
} from '../hooks/useGraphitiKnowledge';
import type { GraphitiEpisode } from '../services/knowledge.service';
import { displayEpisodeName, entityChips } from './KnowledgeTimelineV1.helpers';
import KnowledgeTabs from '../components/knowledge/KnowledgeTabs';
import KnowledgeHeader from '../components/knowledge/KnowledgeHeader';

function formatDay(iso: string): { dayKey: string; label: string } {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  let label;
  if (sameDay(d, today)) label = 'Today';
  else if (sameDay(d, yesterday)) label = 'Yesterday';
  else label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
  return { dayKey, label };
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

type FilterId = 'all' | 'agents' | 'you' | 'cross_plan' | 'contradictions';

/**
 * Knowledge — Timeline. Chronological feed of Graphiti episodes,
 * grouped by day, filterable by source / scope / contradiction. Card
 * layout mirrors the design handoff: timestamp top-right, source pill,
 * body excerpt, fact tags as code chips, optional contradiction
 * red-callout band when the episode supersedes another fact.
 */
const KnowledgeTimelineV1: React.FC = () => {
  const status = useGraphitiStatus();
  const [maxEpisodes, setMaxEpisodes] = useState(50);
  const episodes = useGraphitiEpisodes(maxEpisodes, status.data?.available === true);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');

  // Optional scope filter — Plan Tree and Goal Detail link in here with
  // ?plan=:id or ?goal=:id so the page can show only knowledge relevant
  // to the originating object.
  const [searchParams, setSearchParams] = useSearchParams();
  const planFilterId = searchParams.get('plan') || null;
  const goalFilterId = searchParams.get('goal') || null;

  const planFilter = useQuery(
    ['knowledge-timeline-plan-filter', planFilterId],
    () => (planFilterId ? planService.getPlan(planFilterId) : Promise.resolve(null)),
    { enabled: !!planFilterId, staleTime: 60_000 },
  );
  const goalFilter = useGoalV2(goalFilterId || undefined);
  const goalLinkedPlanIds = useMemo(() => {
    if (!goalFilter.data) return new Set<string>();
    const links = (goalFilter.data as any).links || [];
    return new Set(
      links
        .filter((l: any) => (l.linkedType || l.linked_type) === 'plan')
        .map((l: any) => l.linkedId || l.linked_id)
        .filter(Boolean),
    );
  }, [goalFilter.data]);

  const allEpisodes = (episodes.data?.episodes || []) as GraphitiEpisode[];

  // Per-filter counts for the filter-bar badges.
  const counts = useMemo(() => {
    const c = { all: 0, agents: 0, you: 0, cross_plan: 0, contradictions: 0 };
    for (const e of allEpisodes) {
      c.all += 1;
      const src = (e.source_description || '').toLowerCase();
      if (src.includes('agent') || src.match(/researcher|planner|implementer/)) c.agents += 1;
      else c.you += 1;
      if ((e.links || []).map((l) => l.plan_id).filter((v, i, a) => a.indexOf(v) === i).length > 1) c.cross_plan += 1;
      const desc = (e.source_description || '').toLowerCase();
      if (desc.includes('contradict') || desc.includes('superseded')) c.contradictions += 1;
    }
    return c;
  }, [allEpisodes]);

  const todayCount = useMemo(() => {
    const t = new Date();
    return allEpisodes.filter((e) => {
      const d = new Date(e.created_at);
      return (
        d.getFullYear() === t.getFullYear() &&
        d.getMonth() === t.getMonth() &&
        d.getDate() === t.getDate()
      );
    }).length;
  }, [allEpisodes]);

  const filteredEpisodes = useMemo(() => {
    let list = allEpisodes;

    // Scope filter (URL params)
    if (planFilterId) {
      list = list.filter((e) => (e.links || []).some((l) => l.plan_id === planFilterId));
    } else if (goalFilterId) {
      if (goalLinkedPlanIds.size > 0) {
        list = list.filter((e) =>
          (e.links || []).some((l) => goalLinkedPlanIds.has(l.plan_id)),
        );
      }
    }

    // Filter pill
    if (filter === 'agents') {
      list = list.filter((e) => {
        const src = (e.source_description || '').toLowerCase();
        return src.includes('agent') || /researcher|planner|implementer/.test(src);
      });
    } else if (filter === 'you') {
      list = list.filter((e) => {
        const src = (e.source_description || '').toLowerCase();
        return !src.includes('agent') && !/researcher|planner|implementer/.test(src);
      });
    } else if (filter === 'cross_plan') {
      list = list.filter(
        (e) => (e.links || []).map((l) => l.plan_id).filter((v, i, a) => a.indexOf(v) === i).length > 1,
      );
    } else if (filter === 'contradictions') {
      list = list.filter((e) => {
        const desc = (e.source_description || '').toLowerCase();
        return desc.includes('contradict') || desc.includes('superseded');
      });
    }

    // Search across name + content + entity names + plan/task titles.
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => {
        if ((e.name || '').toLowerCase().includes(q)) return true;
        if ((e.content || '').toLowerCase().includes(q)) return true;
        if (e.entity_edges?.some((ed: any) => (ed.name || '').toLowerCase().includes(q))) return true;
        if (e.links?.some((l) => (l.plan_title || '').toLowerCase().includes(q))) return true;
        if (e.links?.some((l) => (l.node_title || '').toLowerCase().includes(q))) return true;
        return false;
      });
    }

    return list;
  }, [allEpisodes, planFilterId, goalFilterId, goalLinkedPlanIds, filter, search]);

  const grouped = useMemo(() => {
    const sorted = [...filteredEpisodes].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const days = new Map<string, { label: string; items: GraphitiEpisode[] }>();
    for (const ep of sorted) {
      const { dayKey, label } = formatDay(ep.created_at);
      const slot = days.get(dayKey) || { label, items: [] };
      slot.items.push(ep);
      days.set(dayKey, slot);
    }
    return Array.from(days.values());
  }, [filteredEpisodes]);

  const available = status.data?.available;
  const scopeLabel = planFilterId
    ? (planFilter.data as any)?.title
    : goalFilterId
      ? (goalFilter.data as any)?.title
      : null;
  const scopeKind: 'plan' | 'goal' | null = planFilterId
    ? 'plan'
    : goalFilterId
      ? 'goal'
      : null;
  const clearScope = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('plan');
    next.delete('goal');
    setSearchParams(next);
  };

  const FILTERS: { id: FilterId; label: string; count: number; tone?: 'red' | 'amber' }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'agents', label: 'From agents', count: counts.agents },
    { id: 'you', label: 'From you', count: counts.you },
    { id: 'cross_plan', label: 'Cross-plan', count: counts.cross_plan },
    { id: 'contradictions', label: 'Contradictions', count: counts.contradictions, tone: 'red' },
  ];

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10 sm:px-9">
      <KnowledgeHeader
        stats={[
          { value: counts.all, label: 'episodes' },
          { value: todayCount, label: 'added today', tone: 'amber' },
        ]}
        search={search}
        onSearchChange={setSearch}
      />
      <KnowledgeTabs />

      {/* Filter row */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted mr-1">
            Filter
          </span>
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                  active
                    ? 'bg-text text-bg'
                    : f.tone === 'red' && f.count > 0
                      ? 'text-red hover:bg-surface-hi/40'
                      : 'text-text-sec hover:bg-surface-hi/40'
                }`}
              >
                {f.label}{' '}
                <span className={`ml-0.5 ${active ? 'text-bg/70' : 'text-text-muted'}`}>{f.count}</span>
              </button>
            );
          })}
        </div>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">
          {`Last ${Math.min(maxEpisodes, counts.all)} episodes`}
        </span>
      </div>

      {scopeKind && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-text-sec">
          <span className="font-mono uppercase tracking-[0.14em] text-text-muted">
            {scopeKind === 'plan' ? 'plan' : 'goal'}
          </span>
          <span className="max-w-[40ch] truncate font-medium text-text">
            {scopeLabel || (scopeKind === 'plan' ? 'Plan' : 'Goal')}
          </span>
          <button
            type="button"
            onClick={clearScope}
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted hover:text-text"
            aria-label="Clear scope filter"
          >
            clear ×
          </button>
        </div>
      )}

      {!available && (
        <Card pad={20} className="mb-6">
          <p className="text-sm text-text-sec">
            The knowledge graph backend is offline. Once Graphiti is reachable,
            episodes will stream in here.
          </p>
        </Card>
      )}

      {episodes.isLoading && (
        <Card pad={20}>
          <p className="text-sm text-text-muted">Loading episodes…</p>
        </Card>
      )}

      {!episodes.isLoading && grouped.length === 0 && available && (
        <Card pad={32}>
          <div className="text-center">
            <p className="font-display text-base font-semibold text-text">No episodes match</p>
            <p className="mt-2 text-sm text-text-sec">
              {filter === 'all' && !search.trim() && !scopeKind
                ? 'Episodes appear here when an agent calls add_learning().'
                : 'Try clearing filters or the search box.'}
            </p>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-7">
        {grouped.map((day) => (
          <section key={day.label}>
            <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                {day.label}
              </span>
              <span className="font-mono text-[10px] tabular-nums text-text-muted">
                {day.items.length}
              </span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {day.items.map((ep) => (
                <EpisodeCard key={ep.uuid} episode={ep} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {episodes.data && grouped.length > 0 && counts.all >= maxEpisodes && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setMaxEpisodes((n) => n + 50)}
            className="rounded-md border border-border bg-surface px-4 py-2 text-xs text-text-sec transition-colors hover:bg-surface-hi"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Boxed episode card — one per row in the timeline. Renders the spine
 * dot + timestamp/title row + source/context line + content excerpt +
 * optional contradiction red-callout + fact tags as code chips.
 */
const EpisodeCard: React.FC<{ episode: GraphitiEpisode }> = ({ episode: ep }) => {
  const desc = (ep.source_description || '').toLowerCase();
  const isContradiction = desc.includes('contradict') || desc.includes('superseded');
  const isCrossPlan =
    (ep.links || []).map((l) => l.plan_id).filter((v, i, a) => a.indexOf(v) === i).length > 1;
  const dotColor = isContradiction ? 'bg-red' : isCrossPlan ? 'bg-violet' : 'bg-amber';
  const sourceLabel = ep.source_description || 'agent';
  const firstLink = (ep.links || [])[0];

  return (
    <li className="relative flex gap-3">
      <span
        aria-hidden
        className={`mt-3 inline-block h-2 w-2 flex-shrink-0 rounded-full ${dotColor}`}
      />
      <article
        className={`flex-1 rounded-md border bg-surface px-4 py-3 transition-colors ${
          isContradiction ? 'border-red/40' : 'border-border hover:border-amber/40'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="font-display text-[13.5px] font-semibold tracking-[-0.01em] text-text">
            {displayEpisodeName(ep)}
          </span>
          <span className="font-mono text-[10px] tabular-nums text-text-muted">
            {formatTime(ep.created_at)}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11.5px]">
          <Pill color={isContradiction ? 'red' : 'violet'}>{sourceLabel}</Pill>
          {firstLink && (
            <>
              <span className="text-text-muted">·</span>
              <Link
                to={`/app/plans/${firstLink.plan_id}`}
                className="text-text-sec hover:text-text"
              >
                {firstLink.plan_title}
              </Link>
            </>
          )}
          {isCrossPlan && (
            <span className="rounded-md border border-violet/40 bg-violet/10 px-1.5 py-[1.5px] font-mono text-[9px] uppercase tracking-[0.12em] text-violet">
              Cross-plan
            </span>
          )}
          {isContradiction && (
            <span className="rounded-md border border-red/40 bg-red/10 px-1.5 py-[1.5px] font-mono text-[9px] uppercase tracking-[0.12em] text-red">
              Contradicts
            </span>
          )}
        </div>

        {ep.content && (
          <p className="mt-2 line-clamp-3 text-[12.5px] leading-[1.55] text-text-sec">
            {ep.content}
          </p>
        )}

        {/* Contradiction callout band — surfaces the superseded reference if Graphiti tagged it */}
        {isContradiction && (
          <div className="mt-2 rounded-md border border-red/40 bg-red/[0.06] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-red">
            △ Contradicts: prior fact in this knowledge graph
          </div>
        )}

        {/* Entity chips — code-style tags for the entities Graphiti extracted */}
        {ep.entity_edges && ep.entity_edges.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {entityChips(ep.entity_edges).map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded bg-surface-hi px-1.5 py-[1px] font-mono text-[10px] text-text-sec"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </article>
    </li>
  );
};

export default KnowledgeTimelineV1;
