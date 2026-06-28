import React, { useMemo } from 'react';
import { useTrace } from '../../hooks/useTimeline';
import { TimelineEntry } from '../../services/timeline.service';
import { TimelineItem } from './TimelineItem';
import { formatDateTime } from '../../utils/dateUtils';

export interface TraceViewProps {
  correlationId: string;
  className?: string;
}

interface TraceSummary {
  actorName: string | null;
  actorType: string | null;
  startedAt: string | null;
  endedAt: string | null;
  counts: { event: number; log: number; comment: number };
  surfaces: string[];
  models: string[];
  shadow: boolean;
}

function summarize(entries: TimelineEntry[]): TraceSummary {
  const counts = { event: 0, log: 0, comment: 0 };
  const surfaces = new Set<string>();
  const models = new Set<string>();
  let actorName: string | null = null;
  let actorType: string | null = null;
  let shadow = false;
  for (const e of entries) {
    if (counts[e.kind] !== undefined) counts[e.kind] += 1;
    if (e.provenance?.surface) surfaces.add(e.provenance.surface);
    if (e.provenance?.model) models.add(e.provenance.model);
    if (e.provenance?.work_mode === 'shadow' || e.payload?.executed === false) shadow = true;
    // First non-human actor is the run owner (the agent); fall back to first actor.
    if (!actorName && e.actor_name) { actorName = e.actor_name; actorType = e.actor_type; }
    if (e.actor_type === 'agent' && e.actor_name) { actorName = e.actor_name; actorType = 'agent'; }
  }
  return {
    actorName, actorType,
    startedAt: entries[0]?.created_at ?? null,
    endedAt: entries[entries.length - 1]?.created_at ?? null,
    counts, surfaces: [...surfaces], models: [...models], shadow,
  };
}

/**
 * Execution Trace — one run's event/log/comment stream grouped by
 * correlation_id, oldest-first, with a provenance summary header. This is the
 * durable product object: a readable record a human can review.
 */
export const TraceView: React.FC<TraceViewProps> = ({ correlationId, className = '' }) => {
  const { data, isLoading, isError } = useTrace(correlationId);
  const entries = data?.entries ?? [];
  const summary = useMemo(() => summarize(entries), [entries]);

  if (isLoading) return <p className="text-sm text-gray-400 dark:text-gray-500 py-4">Loading trace…</p>;
  if (isError) return <p className="text-sm text-red-500 py-4">Couldn't load this trace.</p>;
  if (entries.length === 0) return <p className="text-sm text-gray-400 dark:text-gray-500 py-4">No entries for this run.</p>;

  return (
    <div className={className}>
      {/* Run summary header */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-3 mb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Execution Trace</span>
            {summary.actorName && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                {summary.actorType === 'agent' ? '🤖 ' : ''}{summary.actorName}
              </span>
            )}
            {summary.shadow && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                shadow run
              </span>
            )}
          </div>
          <code className="text-[11px] text-gray-400 dark:text-gray-500">{correlationId.slice(0, 8)}</code>
        </div>

        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-300">
          <div><span className="text-gray-400 dark:text-gray-500">Events</span><div className="font-medium">{summary.counts.event}</div></div>
          <div><span className="text-gray-400 dark:text-gray-500">Logs</span><div className="font-medium">{summary.counts.log}</div></div>
          <div><span className="text-gray-400 dark:text-gray-500">Comments</span><div className="font-medium">{summary.counts.comment}</div></div>
          <div><span className="text-gray-400 dark:text-gray-500">Steps</span><div className="font-medium">{entries.length}</div></div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
          {summary.startedAt && <span>Started {formatDateTime(summary.startedAt)}</span>}
          {summary.endedAt && summary.endedAt !== summary.startedAt && <span>· Last {formatDateTime(summary.endedAt)}</span>}
          {summary.surfaces.length > 0 && <span>· via {summary.surfaces.join(', ')}</span>}
          {summary.models.length > 0 && <span>· {summary.models.join(', ')}</span>}
        </div>
      </div>

      {/* Ordered run stream (oldest-first) */}
      <ul className="relative border-l border-gray-200 dark:border-gray-700 ml-1">
        {entries.map((entry) => (
          <TimelineItem key={entry.id} entry={entry} />
        ))}
      </ul>
    </div>
  );
};

export default TraceView;
