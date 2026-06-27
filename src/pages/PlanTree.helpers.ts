import type { PlanNode } from '../types';

export type PlanStats = {
  total: number;
  done: number;
  doing: number;
  blocked: number;
  planReady: number;
  todo: number;
};

export type TreeRow = PlanNode & { depth: number; childCount: number };

/**
 * Progress counts over LEAF WORK nodes (task + milestone) only. Phases and the
 * root are structure, not work — counting them made a plan with every task done
 * read as <100% (e.g. 15 tasks done but 6 phases still not_started → 15/21 =
 * 71%) and disagreed with the goal rollup, which counts task+milestone only.
 * Now both agree.
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
 * Effective status override for container nodes (phases + root). A container is
 * shown "completed" once every task/milestone in its subtree is completed (and
 * it has at least one) — there is no server-side roll-up, so without this a
 * phase (or the root) sits at not_started forever even when all its work is
 * done. Returns nodeId -> 'completed' for such containers.
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

/**
 * Flatten the parent_id tree into a depth-aware row list. Children
 * within a parent are ordered by created_at ascending so the tree
 * reads chronologically left-to-right.
 */
export function flattenTree(nodes: PlanNode[]): TreeRow[] {
  const byParent = new Map<string | null, PlanNode[]>();
  for (const n of nodes) {
    const key = (n.parent_id as string | undefined) || null;
    const arr = byParent.get(key) || [];
    arr.push(n);
    byParent.set(key, arr);
  }
  for (const arr of Array.from(byParent.values())) {
    arr.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
  }
  const out: TreeRow[] = [];
  function walk(parentId: string | null, depth: number) {
    for (const n of byParent.get(parentId) || []) {
      const childCount = (byParent.get(n.id) || []).length;
      out.push({ ...n, depth, childCount });
      walk(n.id, depth + 1);
    }
  }
  walk(null, 0);
  return out;
}
