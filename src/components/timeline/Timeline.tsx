import React, { useState } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { TimelineKind, TimelineQuery, SubjectType, TimelineEntry } from '../../services/timeline.service';
import { TimelineItem } from './TimelineItem';

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
      {(showFilter || header) && (
        <div className="flex items-center justify-between gap-2 mb-3">
          {showFilter ? (
            <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              {KIND_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setKind(f.value)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    kind === f.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          ) : <span />}
        </div>
      )}

      {header && <div className="mb-3">{header}</div>}

      {isLoading && (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4">Loading timeline…</p>
      )}
      {isError && (
        <p className="text-sm text-red-500 py-4">Couldn't load the timeline.</p>
      )}

      {!isLoading && !isError && entries.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4">{emptyLabel}</p>
      )}

      {entries.length > 0 && (
        <ul className="relative border-l border-gray-200 dark:border-gray-700 ml-1">
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
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Showing {entries.length} of {data.pagination.total}.
        </p>
      )}
    </div>
  );
};

export default Timeline;
