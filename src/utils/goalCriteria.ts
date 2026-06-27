/**
 * Client-side mirror of the backend's success-criteria semantics
 * (agent-planner/src/utils/goalCriteria.js). Used to render structured criteria
 * and compute attainment for goal cards/lists where a full goal_state read
 * isn't fetched per goal. The goal detail page prefers the server's
 * progress.attainment_pct; this keeps list views consistent without N requests.
 */

export interface GoalCriterion {
  id?: string;
  statement: string;
  metric?: string;
  target?: number | string;
  current?: number | string | boolean;
  unit?: string;
  direction?: 'increase' | 'decrease' | 'boolean';
}

/** Flatten any stored success_criteria shape into a criterion array. */
export function normalizeCriteria(raw: unknown): GoalCriterion[] {
  if (!raw) return [];
  let arr: unknown = raw;
  if (!Array.isArray(raw) && typeof raw === 'object') {
    const wrapped = (raw as { criteria?: unknown }).criteria;
    arr = Array.isArray(wrapped) ? wrapped : [];
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((c) => c !== null && c !== undefined && c !== '')
    .map((c) => (typeof c === 'string' ? { statement: c } : (c as GoalCriterion)));
}

/** A criterion is measurable only with metric + direction (+ target for inc/dec). */
export function isMeasurableCriterion(c: GoalCriterion | string): boolean {
  if (!c || typeof c !== 'object') return false;
  if (typeof c.metric !== 'string' || c.metric.trim() === '') return false;
  if (c.direction === 'boolean') return true;
  if (c.direction === 'increase' || c.direction === 'decrease') {
    return c.target !== undefined && c.target !== null && (c.target as unknown) !== '';
  }
  return false;
}

const TRUTHY = ['true', 'yes', 'done', '1', 'complete', 'completed'];

/** Has a measurable criterion reached its target? */
export function isCriterionMet(c: GoalCriterion): boolean {
  if (!isMeasurableCriterion(c)) return false;
  const cur = c.current;
  if (cur === undefined || cur === null || cur === '') return false;
  if (c.direction === 'boolean') {
    if (typeof cur === 'number') return cur > 0;
    if (typeof cur === 'boolean') return cur;
    return TRUTHY.includes(String(cur).trim().toLowerCase());
  }
  const curN = Number(cur);
  const tgtN = Number(c.target);
  if (Number.isNaN(curN) || Number.isNaN(tgtN)) return false;
  return c.direction === 'increase' ? curN >= tgtN : curN <= tgtN;
}

export interface CriteriaAttainment {
  measurable_count: number;
  met_count: number;
  attainment_pct: number | null;
}

/** Attainment over MEASURABLE criteria only (null when none are measurable). */
export function criteriaAttainment(raw: unknown): CriteriaAttainment {
  const measurable = normalizeCriteria(raw).filter(isMeasurableCriterion);
  const met = measurable.filter(isCriterionMet).length;
  return {
    measurable_count: measurable.length,
    met_count: met,
    attainment_pct: measurable.length ? Math.round((met / measurable.length) * 100) : null,
  };
}
