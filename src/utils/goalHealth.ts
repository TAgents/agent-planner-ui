import type { PillColor } from '../components/v1';

/**
 * Canonical goal health, as computed server-side by classifyGoalHealth
 * (agent-planner/src/utils/goalHealth.js) and surfaced via /goals/dashboard.
 * This is the SINGLE source of truth — Mission, Goals list, and Goal detail
 * all render from it instead of each re-deriving health from status/age/
 * progress with different thresholds (which produced a different verdict on
 * every surface for the same goal).
 */
export type GoalHealth = 'on_track' | 'at_risk' | 'stale';

export interface HealthBadge {
  label: string;
  color: PillColor;
}

/**
 * Map canonical health → one badge (label + color) used everywhere. A pending
 * contradiction overrides to red. `undefined` health (e.g. a non-active goal
 * absent from the dashboard) falls back to "On track" — the prior default.
 */
export function goalHealthBadge(health: GoalHealth | undefined, contradictions = 0): HealthBadge {
  if (contradictions > 0) return { label: 'Contradiction', color: 'red' };
  if (health === 'stale') return { label: 'Stale', color: 'amber' };
  if (health === 'at_risk') return { label: 'At risk', color: 'amber' };
  return { label: 'On track', color: 'emerald' };
}
