import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Card, Pill, SectionHead } from '../components/v1';
import { request } from '../services/api-client';
import KnowledgeHeader from '../components/knowledge/KnowledgeHeader';
import { useGraphitiEpisodes } from '../hooks/useGraphitiKnowledge';
import type { GraphitiEpisode } from '../services/knowledge.service';
import { formatDistanceToNow } from '../utils/dateUtils';

type CoverageResponse = {
  org_summary: { total_tasks: number; tasks_with_facts: number; ratio: number };
  plans: Array<{ plan_id: string; plan_title: string; ratio: number }>;
};

/**
 * Knowledge — Overview landing (Phase 4 task 1a004c3f). The /app/knowledge
 * index used to bounce straight to the Timeline; now it answers the three
 * lens questions at a glance with real data and routes into each full view.
 *
 *   Do we have what we need? → coverage ratio (episode_node_links)
 *   When did we learn it?     → recent episodes
 *   How is it connected?      → top entities (from episode entity_edges)
 *
 * Each card is a doorway into its lens, so the landing is a summary, not a
 * fourth competing surface.
 */
const KnowledgeOverviewV1: React.FC = () => {
  const coverageQ = useQuery(
    ['knowledge', 'coverage'],
    () => request<CoverageResponse>({ url: '/knowledge/coverage', method: 'get' }),
    { staleTime: 30_000 },
  );
  const episodesQ = useGraphitiEpisodes(25);

  const cov = coverageQ.data?.org_summary;
  const coveragePct = cov ? Math.round(cov.ratio * 100) : null;
  const plansWithGaps = (coverageQ.data?.plans || []).filter((p) => p.ratio < 0.5).length;

  const episodes: GraphitiEpisode[] = episodesQ.data?.episodes || [];
  const recent = episodes.slice(0, 5);

  // Top entities by mention frequency across recent episodes' entity_edges.
  // Cheap, real signal — no extra Graphiti search on the landing.
  const topEntities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ep of episodes) {
      for (const edge of ep.entity_edges || []) {
        for (const name of [edge.source_entity_name, edge.target_entity_name]) {
          if (!name) continue;
          counts.set(name, (counts.get(name) || 0) + 1);
        }
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }));
  }, [episodes]);

  const coverageTone = coveragePct == null ? 'text' : coveragePct >= 50 ? 'text' : 'amber';

  return (
    <div className="flex h-full flex-col">
      <KnowledgeHeader
        stats={[
          { value: coveragePct == null ? '—' : `${coveragePct}%`, label: 'coverage', tone: coverageTone as any },
          { value: episodes.length || '—', label: 'episodes' },
          { value: topEntities.length || '—', label: 'entities' },
        ]}
        search=""
        onSearchChange={() => {}}
        searchPlaceholder="Search knowledge…"
      />
      <div className="flex-1 overflow-auto bg-bg">
        <div className="mx-auto max-w-[1200px] px-6 py-8 sm:px-9">
          <div className="grid gap-6 md:grid-cols-3">
        {/* ── Do we have what we need? → Coverage ── */}
        <Link to="/app/knowledge/coverage" className="group">
          <Card pad={20} className="h-full transition-colors group-hover:border-amber">
            <SectionHead
              kicker="◇ Coverage"
              title="Do we have what we need?"
              right={
                cov ? (
                  <Pill color={coveragePct! >= 50 ? 'emerald' : 'amber'}>
                    {coveragePct}%
                  </Pill>
                ) : null
              }
            />
            {coverageQ.isLoading ? (
              <p className="text-[12.5px] text-text-muted">Computing coverage…</p>
            ) : !cov ? (
              <p className="text-[12.5px] text-text-muted">Coverage unavailable.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[12.5px] leading-[1.55] text-text-sec">
                  <span className="font-mono tabular-nums text-text">
                    {cov.tasks_with_facts}/{cov.total_tasks}
                  </span>{' '}
                  tasks have knowledge backing them.
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hi">
                  <div
                    className="h-full rounded-full bg-amber"
                    style={{ width: `${coveragePct}%` }}
                  />
                </div>
                {plansWithGaps > 0 && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted">
                    {plansWithGaps} plan{plansWithGaps === 1 ? '' : 's'} under 50%
                  </p>
                )}
              </div>
            )}
          </Card>
        </Link>

        {/* ── When did we learn it? → Timeline ── */}
        <Link to="/app/knowledge/timeline" className="group">
          <Card pad={20} className="h-full transition-colors group-hover:border-amber">
            <SectionHead
              kicker="◷ Timeline"
              title="When did we learn it?"
              right={<Pill color="violet">{episodes.length}</Pill>}
            />
            {episodesQ.isLoading ? (
              <p className="text-[12.5px] text-text-muted">Loading episodes…</p>
            ) : recent.length === 0 ? (
              <p className="text-[12.5px] text-text-muted">
                No episodes yet. Agent learnings will appear here.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {recent.map((ep) => (
                  <li key={ep.uuid} className="py-2">
                    <p className="line-clamp-1 text-[12px] font-medium text-text">{ep.name}</p>
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-muted">
                      {formatDistanceToNow(ep.valid_at || ep.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Link>

        {/* ── How is it connected? → Graph ── */}
        <Link to="/app/knowledge/graph" className="group">
          <Card pad={20} className="h-full transition-colors group-hover:border-amber">
            <SectionHead
              kicker="◆ Graph"
              title="How is it connected?"
              right={<Pill color="violet">{topEntities.length}</Pill>}
            />
            {episodesQ.isLoading ? (
              <p className="text-[12.5px] text-text-muted">Mapping entities…</p>
            ) : topEntities.length === 0 ? (
              <p className="text-[12.5px] text-text-muted">
                No entities extracted yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {topEntities.map((e) => (
                  <span
                    key={e.name}
                    className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-text-sec"
                    title={`${e.count} mention${e.count === 1 ? '' : 's'} in recent episodes`}
                  >
                    {e.name}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeOverviewV1;
