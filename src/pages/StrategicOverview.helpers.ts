import type { Plan } from '../types';

export type BucketId = 'stale' | 'needs_input' | 'in_motion' | 'finish_line' | 'done';

export type Bucket = {
  id: BucketId;
  label: string;
  count: number;
};

const STALE_DAYS = 5;
const FINISH_LINE_PCT = 80;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Bucket every active plan into the attention spectrum. Bucket order
 * is fixed (stale → done) so the heatline always reads left-to-right
 * even when individual buckets are empty. Pure function so the spec
 * for "where does this plan land?" is unit-testable in isolation.
 */
export function computeAttentionBuckets(
  plans: Plan[],
  decisionsByPlan: Map<string, number>,
): Bucket[] {
  const list = plans.filter((p) => p.status !== 'archived');
  let stale = 0;
  let needsInput = 0;
  let inMotion = 0;
  let finishLine = 0;
  let done = 0;
  for (const p of list) {
    if (p.status === 'completed') {
      done += 1;
      continue;
    }
    if (p.status === 'active' && daysSince(p.updated_at) > STALE_DAYS) stale += 1;
    else if ((decisionsByPlan.get(p.id) || 0) > 0) needsInput += 1;
    else if ((p.progress || 0) >= FINISH_LINE_PCT) finishLine += 1;
    else inMotion += 1;
  }
  return [
    { id: 'stale', label: 'Stale', count: stale },
    { id: 'needs_input', label: 'Needs input', count: needsInput },
    { id: 'in_motion', label: 'In motion', count: inMotion },
    { id: 'finish_line', label: 'Finish line', count: finishLine },
    { id: 'done', label: 'Done', count: done },
  ];
}

/** Plans within striking distance of done — the "one push" card roster. */
export function selectOnePushFromDone(plans: Plan[], limit = 3): Plan[] {
  return plans
    .filter((p) => p.status === 'active' && (p.progress || 0) >= 70 && (p.progress || 0) < 100)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, limit);
}

/** Plans with at least one pending decision, ordered by decision count desc. */
export function selectBlockedOnYou(
  plans: Plan[],
  decisionsByPlan: Map<string, number>,
  limit = 3,
): Plan[] {
  return plans
    .filter((p) => (decisionsByPlan.get(p.id) || 0) > 0)
    .sort((a, b) => (decisionsByPlan.get(b.id) || 0) - (decisionsByPlan.get(a.id) || 0))
    .slice(0, limit);
}

/** Active plans untouched longer than the staleness threshold. */
export function selectDriftingWithoutYou(plans: Plan[], limit = 3): Plan[] {
  return plans
    .filter((p) => p.status === 'active' && daysSince(p.updated_at) > STALE_DAYS)
    .sort((a, b) => daysSince(b.updated_at) - daysSince(a.updated_at))
    .slice(0, limit);
}
