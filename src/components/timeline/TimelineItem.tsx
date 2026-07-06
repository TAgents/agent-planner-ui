import React from 'react';
import { TimelineEntry } from '../../services/timeline.service';
import { formatDistanceToNow, formatDateTime } from '../../utils/dateUtils';

// Visual language per kind. Events are structured facts, logs are narrative,
// comments are human/agent notes — each gets a distinct accent + glyph.
const KIND_STYLES: Record<string, { dot: string; chip: string; label: string }> = {
  event: { dot: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', label: 'Event' },
  log: { dot: 'bg-gray-400', chip: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', label: 'Log' },
  comment: { dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', label: 'Comment' },
};

const ACTOR_STYLES: Record<string, string> = {
  human: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  agent: 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  system: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

/** Human-readable headline for an entry that has no free-text content. */
function headline(entry: TimelineEntry): string {
  if (entry.content) return entry.content;
  if (entry.kind === 'event') {
    const p = entry.payload || {};
    if (entry.entry_type === 'node.status.changed' || entry.entry_type === 'plan.status.changed') {
      return `Status ${p.from ?? '?'} → ${p.to ?? '?'}`;
    }
    if (entry.entry_type === 'tool.call') return `${p.method || ''} ${p.tool_name || 'tool call'}`.trim();
    return entry.entry_type.replace(/\./g, ' ');
  }
  return entry.entry_type;
}

export interface TimelineItemProps {
  entry: TimelineEntry;
  /** Render the comment author controls (edit/delete) — supplied by Timeline. */
  actions?: React.ReactNode;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ entry, actions }) => {
  const kind = KIND_STYLES[entry.kind] || KIND_STYLES.log;
  const actorClass = ACTOR_STYLES[entry.actor_type || 'system'] || ACTOR_STYLES.system;
  const prov = entry.provenance || {};
  const isShadow = prov.work_mode === 'shadow' || entry.payload?.executed === false;

  return (
    <li className="relative pl-6 pb-4">
      {/* timeline rail + dot */}
      <span className="absolute left-0 top-1.5 -translate-x-1/2 ml-[1px]">
        <span className={`block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 ${kind.dot}`} />
      </span>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${kind.chip}`}>{kind.label}</span>
            <span className="min-w-0 break-all text-xs font-mono text-gray-400 dark:text-gray-500">{entry.entry_type}</span>
            {entry.actor_name && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${actorClass}`}>
                {entry.actor_type === 'agent' ? '🤖 ' : ''}{entry.actor_name}
              </span>
            )}
            {prov.surface && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                {prov.surface}
              </span>
            )}
            {prov.model && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                {prov.model}
              </span>
            )}
            {isShadow && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                shadow
              </span>
            )}
            {entry.edited_at && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 italic">edited</span>
            )}
          </div>

          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap [overflow-wrap:anywhere]">
            {headline(entry)}
          </p>

          {entry.tags?.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {entry.tags.map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <time
            className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap"
            title={formatDateTime(entry.created_at)}
          >
            {formatDistanceToNow(entry.created_at)}
          </time>
          {actions}
        </div>
      </div>
    </li>
  );
};

export default TimelineItem;
