import React, { useState } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { TimelineKind, TimelineQuery, SubjectType, TimelineEntry } from '../../services/timeline.service';
import { TimelineItem } from './TimelineItem';
import { FilterChip } from '../v1';

const KIND_FILTERS: { value: TimelineKind | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'event', label: 'Events' },
  { value: 'log', label: 'Logs' },
  { value: 'comment', label: 'Comments' },
];

export interface TimelineProps {
  /** One of these scopes the stream. */
  planId?: string;
  nodeId?: string;
  goalId?: string;
  workspaceId?: string;
  subjectType?: SubjectType;
  subjectId?: string;
  /** Render the kind filter chips (default true). */
  showFilter?: boolean;
  limit?: number;
  /** Optional slot under the header (e.g. a comment composer). */
  header?: React.ReactNode;
  /** Per-item actions (e.g. author edit/delete controls for comments). */
  renderItemActions?: (entry: TimelineEntry) => React.ReactNode;
  /** When set, entries with a correlation_id get a "view trace" affordance. */
  onOpenTrace?: (correlationId: string) => void;
  className?: string;
  emptyLabel?: string;
}

/**
 * The single timeline component — one kind-aware stream reused on node / plan /
 * goal / workspace detail. Read-only; comment compose/edit is layered via
 * `header` and `renderItemActions` (the comment box task).
 */
export const Timeline: React.FC<TimelineProps> = ({
  planId, nodeId, goalId, workspaceId, subjectType, subjectId,
  showFilter = true, limit = 50, header, renderItemActions, onOpenTrace,
  className = '', emptyLabel = 'No activity yet.',
}) => {
  const [kind, setKind] = useState<TimelineKind | 'all'>('all');

  const query: TimelineQuery = {
    planId, nodeId, goalId, workspaceId, subjectType, subjectId, limit,
    kind: kind === 'all' ? undefined : kind,
  };

  const { data, isLoading, isError } = useTimeline(query);
  const entries = data?.entries ?? [];

  return (
    <div className={`min-w-0 ${className}`}>
      {showFilter && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {KIND_FILTERS.map((f) => (
            <FilterChip key={f.value} active={kind === f.value} onClick={() => setKind(f.value)}>
              {f.label}
            </FilterChip>
          ))}
        </div>
      )}

      {header && <div className="mb-3">{header}</div>}

      {isLoading && (
        <p className="py-4 text-[12.5px] text-text-muted">Loading timeline…</p>
      )}
      {isError && (
        <p className="py-4 text-[12.5px] text-red">Couldn't load the timeline.</p>
      )}

      {!isLoading && !isError && entries.length === 0 && (
        <p className="py-4 text-[12.5px] text-text-muted">{emptyLabel}</p>
      )}

      {entries.length > 0 && (
        <ul className="relative ml-1 border-l border-border">
          {entries.map((entry) => (
            <TimelineItem
              key={entry.id}
              entry={entry}
              actions={renderItemActions?.(entry)}
              onOpenTrace={onOpenTrace}
            />
          ))}
        </ul>
      )}

      {data?.pagination?.has_more && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted">
          Showing {entries.length} of {data.pagination.total}
        </p>
      )}
    </div>
  );
};

export default Timeline;
