import type { PlanNode } from '../types';

// Plan metric selectors now live in src/selectors (the canonical home for
// client-side mirrors of the server rollup). Re-exported here for the existing
// PlanTree call sites + tests. flattenTree below is tree STRUCTURE, not a
// derived metric, so it stays local.
export { statsFromRollup, computeStats, effectivePhaseStatus, type PlanStats } from '../selectors';

export type TreeRow = PlanNode & { depth: number; childCount: number };

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
