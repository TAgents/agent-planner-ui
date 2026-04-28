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
 * Tree-row counts excluding the root node. Mirrors the per-status
 * breakdown used by the Plans Index segmented bar so the same numbers
 * render in both surfaces — closes the "index shows more than the
 * detail" gap.
 */
export function computeStats(nodes: PlanNode[]): PlanStats {
  const stats: PlanStats = { total: 0, done: 0, doing: 0, blocked: 0, planReady: 0, todo: 0 };
  for (const n of nodes) {
    if (n.node_type === 'root') continue;
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
