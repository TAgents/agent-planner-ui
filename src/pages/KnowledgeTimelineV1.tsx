import React, { useMemo, useState } from 'react';
import {
  Card,
  Kicker,
  Pill,
  StatusDot,
} from '../components/v1';
import {
  useGraphitiEpisodes,
  useGraphitiStatus,
} from '../hooks/useGraphitiKnowledge';
import type { GraphitiEpisode } from '../services/knowledge.service';

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
  let label = d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  if (sameDay(d, today)) label = `Today · ${label}`;
  else if (sameDay(d, yesterday)) label = `Yesterday · ${label}`;
  return { dayKey, label };
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Knowledge — Timeline view (Phase 3 task 754027b8).
 * Chronological feed of Graphiti episodes grouped by day, with agent
 * attribution from `source_description`. Entity-extraction chips and
 * contradiction markers are intentionally hidden until the backend
 * coverage endpoint lands (deferred to Phase 5).
 */
const KnowledgeTimelineV1: React.FC = () => {
  const status = useGraphitiStatus();
  const [maxEpisodes, setMaxEpisodes] = useState(50);
  const episodes = useGraphitiEpisodes(maxEpisodes, status.data?.available === true);

  const grouped = useMemo(() => {
    const list = (episodes.data?.episodes || []) as GraphitiEpisode[];
    const sorted = [...list].sort(
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
  }, [episodes.data]);

  const available = status.data?.available;

  return (
    <div className="mx-auto max-w-[920px] px-6 py-10 sm:px-9">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Kicker className="mb-2">◆ Knowledge</Kicker>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
            Timeline
          </h1>
          <p className="mt-1 text-[13px] text-text-sec">
            Episodes recorded by your agents, newest first.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusDot
            color={available ? 'rgb(var(--emerald) / 1)' : 'rgb(var(--red) / 1)'}
            ring={available}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            {available ? 'Graphiti · live' : 'Graphiti · offline'}
          </span>
        </div>
      </header>

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
            <p className="font-display text-base font-semibold text-text">No episodes yet</p>
            <p className="mt-2 text-sm text-text-sec">
              Episodes appear here when an agent calls{' '}
              <span className="font-mono text-text">add_learning()</span>.
            </p>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-8">
        {grouped.map((day) => (
          <section key={day.label}>
            <div className="mb-3 border-b border-border pb-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                ◇ {day.label}
              </span>
            </div>
            <ul className="flex flex-col">
              {day.items.map((ep) => (
                <li
                  key={ep.uuid}
                  className="grid grid-cols-[80px_1fr] gap-4 border-l-2 border-border pl-4 py-3 hover:border-amber"
                >
                  <span className="font-mono text-[10px] text-text-muted">
                    {formatTime(ep.created_at)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[13.5px] font-semibold tracking-[-0.01em] text-text">
                        {ep.name || 'Episode'}
                      </span>
                      {ep.source_description && (
                        <Pill color="violet">{ep.source_description}</Pill>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-3 text-[12.5px] leading-[1.55] text-text-sec">
                      {ep.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {episodes.data && grouped.length > 0 && (
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

export default KnowledgeTimelineV1;
