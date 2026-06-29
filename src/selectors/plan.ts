/**
 * src/selectors — pure client-side mirrors of the SERVER rollup formulas.
 *
 * The rule (see agent-planner/docs/DERIVATIONS_AUDIT.md): derived metrics are
 * computed ONCE on the server and returned as fields (`plan.rollup`,
 * `goal.health`, `workspace.progressPct`). The UI renders those fields. These
 * selectors exist ONLY for the few legitimate live-compute cases — chiefly the
 * brief window before `plan.rollup` has loaded — and they MUST stay byte-for-byte
 * equivalent to their server counterpart (planRollup.service.js). Do NOT add new
 * ad-hoc completed/total math in components; add a selector here instead.
 */
import type { PlanNode, PlanRollup } from '../types';

export type PlanStats = {
  total: number;
  done: number;
  doing: number;
  blocked: number;
  planReady: number;
  todo: number;
};

/**
 * Project the canonical server rollup into the local Stats shape. PREFERRED
 * source — read it whenever `plan.rollup` is loaded.
 */
export function statsFromRollup(rollup: PlanRollup): PlanStats {
  const c = rollup.status_counts;
  return {
    total: rollup.total_work,
    done: c.completed,
    doing: c.in_progress,
    blocked: c.blocked,
    planReady: c.plan_ready,
    todo: c.not_started,
  };
}

/**
 * Client-side mirror of planRollup over LEAF WORK nodes (task + milestone) only.
 * Root + phases are structure, never counted — counting them made a fully-done
 * plan read <100% and disagree with the server. FALLBACK ONLY: prefer
 * `plan.rollup` via {@link statsFromRollup}.
 */
export function computeStats(nodes: PlanNode[]): PlanStats {
  const stats: PlanStats = { total: 0, done: 0, doing: 0, blocked: 0, planReady: 0, todo: 0 };
  for (const n of nodes) {
    if (n.node_type !== 'task' && n.node_type !== 'milestone') continue;
    stats.total += 1;
    if (n.status === 'completed') stats.done += 1;
    else if (n.status === 'in_progress') stats.doing += 1;
    else if (n.status === 'blocked') stats.blocked += 1;
    else if (n.status === 'plan_ready') stats.planReady += 1;
    else stats.todo += 1;
  }
  return stats;
}

/**
 * Client mirror of planRollup's container_status. A container (phase/root) reads
 * "completed" once it has ≥1 work descendant and ALL are completed. FALLBACK
 * ONLY: prefer `plan.rollup.container_status`.
 */
export function effectivePhaseStatus(nodes: PlanNode[]): Map<string, string> {
  const byParent = new Map<string | null, PlanNode[]>();
  for (const n of nodes) {
    const key = (n.parent_id as string | undefined) || null;
    const arr = byParent.get(key) || [];
    arr.push(n);
    byParent.set(key, arr);
  }
  const override = new Map<string, string>();
  function summarize(phaseId: string): { hasWork: boolean; allDone: boolean } {
    let hasWork = false;
    let allDone = true;
    for (const c of byParent.get(phaseId) || []) {
      if (c.node_type === 'phase') {
        const s = summarize(c.id);
        if (s.hasWork) {
          hasWork = true;
          if (!s.allDone) allDone = false;
        }
      } else if (c.node_type === 'task' || c.node_type === 'milestone') {
        hasWork = true;
        if (c.status !== 'completed') allDone = false;
      }
    }
    return { hasWork, allDone };
  }
  for (const n of nodes) {
    if (n.node_type === 'phase' || n.node_type === 'root') {
      const s = summarize(n.id);
      if (s.hasWork && s.allDone) override.set(n.id, 'completed');
    }
  }
  return override;
}
