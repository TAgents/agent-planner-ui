import { computeStats, flattenTree } from '../PlanTree.helpers';
import type { PlanNode } from '../../types';

const make = (over: Partial<PlanNode>): PlanNode =>
  ({
    id: over.id || 'n',
    plan_id: 'p',
    parent_id: over.parent_id,
    title: over.title || 'Node',
    node_type: over.node_type || 'task',
    status: over.status || 'not_started',
    order_index: over.order_index ?? 0,
    created_at: over.created_at || '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...over,
  }) as PlanNode;

describe('PlanTree helpers', () => {
  describe('computeStats', () => {
    it('returns zeros for an empty tree', () => {
      expect(computeStats([])).toEqual({
        total: 0,
        done: 0,
        doing: 0,
        blocked: 0,
        planReady: 0,
        todo: 0,
      });
    });

    it('excludes the root node from totals', () => {
      const nodes = [
        make({ id: 'r', node_type: 'root', status: 'in_progress' }),
        make({ id: 'a', status: 'completed' }),
      ];
      expect(computeStats(nodes).total).toBe(1);
      expect(computeStats(nodes).done).toBe(1);
    });

    it('routes each status into its own bucket', () => {
      const nodes = [
        make({ id: 'a', status: 'completed' }),
        make({ id: 'b', status: 'in_progress' }),
        make({ id: 'c', status: 'blocked' }),
        make({ id: 'd', status: 'plan_ready' }),
        make({ id: 'e', status: 'not_started' }),
      ];
      const s = computeStats(nodes);
      expect(s).toEqual({ total: 5, done: 1, doing: 1, blocked: 1, planReady: 1, todo: 1 });
    });

    it('treats unknown statuses as todo', () => {
      const nodes = [make({ id: 'a', status: 'mystery' as any })];
      expect(computeStats(nodes).todo).toBe(1);
    });
  });

  describe('flattenTree', () => {
    it('returns an empty list for no nodes', () => {
      expect(flattenTree([])).toEqual([]);
    });

    it('emits children depth-first under their parent', () => {
      const nodes = [
        make({ id: 'a', parent_id: undefined, created_at: '2026-01-01' }),
        make({ id: 'a1', parent_id: 'a', created_at: '2026-01-02' }),
        make({ id: 'a2', parent_id: 'a', created_at: '2026-01-03' }),
        make({ id: 'b', parent_id: undefined, created_at: '2026-01-04' }),
      ];
      const flat = flattenTree(nodes);
      expect(flat.map((r) => r.id)).toEqual(['a', 'a1', 'a2', 'b']);
      expect(flat.map((r) => r.depth)).toEqual([0, 1, 1, 0]);
    });

    it('annotates each row with childCount', () => {
      const nodes = [
        make({ id: 'a', parent_id: undefined }),
        make({ id: 'a1', parent_id: 'a' }),
        make({ id: 'a2', parent_id: 'a' }),
      ];
      const flat = flattenTree(nodes);
      const a = flat.find((r) => r.id === 'a')!;
      const a1 = flat.find((r) => r.id === 'a1')!;
      expect(a.childCount).toBe(2);
      expect(a1.childCount).toBe(0);
    });

    it('orders siblings by created_at ascending', () => {
      const nodes = [
        make({ id: 'late', parent_id: 'a', created_at: '2026-02-01' }),
        make({ id: 'a', parent_id: undefined, created_at: '2026-01-01' }),
        make({ id: 'early', parent_id: 'a', created_at: '2026-01-15' }),
      ];
      const flat = flattenTree(nodes);
      // Children of `a` should be: early (Jan 15), late (Feb 1).
      expect(flat.map((r) => r.id)).toEqual(['a', 'early', 'late']);
    });
  });
});
