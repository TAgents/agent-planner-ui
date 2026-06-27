import React from 'react';
import { criteriaAttainment } from '../../utils/goalCriteria';

/**
 * Compact "N/M met" badge for a goal's MEASURABLE success criteria — the
 * outcome signal, distinct from task/execution progress. Renders nothing when
 * the goal has no measurable criteria (so it never clutters qualitative goals).
 * Shared by the Goals list and the Workspace detail goal cards.
 */
const GoalAttainmentBadge: React.FC<{ successCriteria: unknown; className?: string }> = ({
  successCriteria,
  className,
}) => {
  const a = criteriaAttainment(successCriteria);
  if (a.measurable_count === 0) return null;
  const pct = a.attainment_pct ?? 0;
  const color = pct >= 100 ? 'text-emerald' : pct > 0 ? 'text-violet' : 'text-text-muted';
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] ${color} ${className || ''}`}
      title={`${a.met_count}/${a.measurable_count} measurable criteria met (${pct}% attained)`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {a.met_count}/{a.measurable_count} met
    </span>
  );
};

export default GoalAttainmentBadge;
