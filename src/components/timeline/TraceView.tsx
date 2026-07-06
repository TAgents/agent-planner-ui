import React, { useMemo } from 'react';
import { useTrace } from '../../hooks/useTimeline';
import { TimelineEntry } from '../../services/timeline.service';
import { TimelineItem } from './TimelineItem';
import { formatDateTime } from '../../utils/dateUtils';
import { Kicker, Pill } from '../v1';

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

const Stat: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <div>
    <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">{label}</div>
    <div className="text-[13px] font-semibold text-text">{value}</div>
  </div>
);

/**
 * Execution Trace — one run's event/log/comment stream grouped by
 * correlation_id, oldest-first, with a provenance summary header. This is the
 * durable product object: a readable record a human can review.
 */
export const TraceView: React.FC<TraceViewProps> = ({ correlationId, className = '' }) => {
  const { data, isLoading, isError } = useTrace(correlationId);
  const entries = data?.entries ?? [];
  const summary = useMemo(() => summarize(entries), [entries]);

  if (isLoading) return <p className="py-4 text-[12.5px] text-text-muted">Loading trace…</p>;
  if (isError) return <p className="py-4 text-[12.5px] text-red">Couldn't load this trace.</p>;
  if (entries.length === 0) return <p className="py-4 text-[12.5px] text-text-muted">No entries for this run.</p>;

  return (
    <div className={`min-w-0 ${className}`}>
      {/* Run summary header */}
      <div className="mb-4 rounded-lg border border-border bg-surface-hi/40 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Kicker>◇ Execution Trace</Kicker>
            {summary.actorName && (
              <Pill color={summary.actorType === 'agent' ? 'violet' : 'slate'}>
                {summary.actorType === 'agent' ? '🤖 ' : ''}{summary.actorName}
              </Pill>
            )}
            {summary.shadow && <Pill color="amber">shadow run</Pill>}
          </div>
          <code className="font-mono text-[10px] text-text-muted">{correlationId.slice(0, 8)}</code>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Events" value={summary.counts.event} />
          <Stat label="Logs" value={summary.counts.log} />
          <Stat label="Comments" value={summary.counts.comment} />
          <Stat label="Steps" value={entries.length} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-muted">
          {summary.startedAt && <span>Started {formatDateTime(summary.startedAt)}</span>}
          {summary.endedAt && summary.endedAt !== summary.startedAt && <span>· Last {formatDateTime(summary.endedAt)}</span>}
          {summary.surfaces.length > 0 && <span>· via {summary.surfaces.join(', ')}</span>}
          {summary.models.length > 0 && <span>· {summary.models.join(', ')}</span>}
        </div>
      </div>

      {/* Ordered run stream (oldest-first) */}
      <ul className="relative ml-1 border-l border-border">
        {entries.map((entry) => (
          <TimelineItem key={entry.id} entry={entry} />
        ))}
      </ul>
    </div>
  );
};

export default TraceView;
