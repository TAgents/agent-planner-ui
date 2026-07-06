import React from 'react';
import { TimelineEntry } from '../../services/timeline.service';
import { formatDistanceToNow, formatDateTime } from '../../utils/dateUtils';
import { Pill, PillColor } from '../v1';

// Kind → accent (dot + label pill). Events are structured facts, logs are
// narrative, comments are human/agent notes.
const KIND: Record<string, { color: PillColor; dot: string; label: string }> = {
  event: { color: 'violet', dot: 'bg-violet', label: 'Event' },
  log: { color: 'slate', dot: 'bg-slate', label: 'Log' },
  comment: { color: 'emerald', dot: 'bg-emerald', label: 'Comment' },
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
  /** When set and the entry has a correlation_id, show a "view trace" button. */
  onOpenTrace?: (correlationId: string) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ entry, actions, onOpenTrace }) => {
  const kind = KIND[entry.kind] || KIND.log;
  const prov = entry.provenance || {};
  const isShadow = prov.work_mode === 'shadow' || entry.payload?.executed === false;

  return (
    <li className="relative pl-6 pb-4">
      {/* timeline rail dot */}
      <span className="absolute left-0 top-[7px] -translate-x-1/2 ml-[1px]">
        <span className={`block h-2 w-2 rounded-full ring-2 ring-surface ${kind.dot}`} />
      </span>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Pill color={kind.color}>{kind.label}</Pill>
            <span className="min-w-0 break-all font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
              {entry.entry_type}
            </span>
            {entry.actor_name && (
              <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-sec">
                {entry.actor_type === 'agent' ? '🤖 ' : '◆ '}{entry.actor_name}
              </span>
            )}
            {prov.surface && (
              <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">{prov.surface}</span>
            )}
            {prov.model && (
              <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">{prov.model}</span>
            )}
            {isShadow && <Pill color="amber">shadow</Pill>}
            {entry.edited_at && <span className="text-[10px] italic text-text-muted">edited</span>}
          </div>

          <p className="text-[12.5px] leading-[1.5] text-text-sec whitespace-pre-wrap [overflow-wrap:anywhere]">
            {headline(entry)}
          </p>

          {entry.tags?.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {entry.tags.map((t) => (
                <span key={t} className="rounded bg-surface-hi px-1.5 py-0.5 text-[10px] text-text-muted">#{t}</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onOpenTrace && entry.correlation_id && (
            <button
              type="button"
              onClick={() => onOpenTrace(entry.correlation_id as string)}
              title="View the full execution trace for this run"
              className="whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.1em] text-amber transition-opacity hover:opacity-80"
            >
              ⧉ Trace
            </button>
          )}
          <time
            className="whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-muted"
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
