import {
  computeAttentionBuckets,
  selectOnePushFromDone,
  selectBlockedOnYou,
  selectDriftingWithoutYou,
} from '../StrategicOverview.helpers';
import type { Plan } from '../../types';

const ISO_NOW = new Date().toISOString();
const ISO_2D_AGO = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const ISO_8D_AGO = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
const ISO_30D_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

const makePlan = (over: Partial<Plan>): Plan =>
  ({
    id: over.id || 'p',
    title: over.title || 'Plan',
    description: '',
    status: 'active',
    owner_id: 'u1',
    created_at: ISO_2D_AGO,
    updated_at: ISO_2D_AGO,
    progress: 0,
    ...over,
  }) as Plan;

describe('StrategicOverview helpers', () => {
  describe('computeAttentionBuckets', () => {
    it('returns five buckets in fixed left-to-right order even when empty', () => {
      const buckets = computeAttentionBuckets([], new Map());
      expect(buckets.map((b) => b.id)).toEqual([
        'stale',
        'needs_input',
        'in_motion',
        'finish_line',
        'done',
      ]);
      expect(buckets.every((b) => b.count === 0)).toBe(true);
    });

    it('puts a stale active plan in the stale bucket', () => {
      const plans = [makePlan({ id: 'p1', status: 'active', updated_at: ISO_8D_AGO })];
      const buckets = computeAttentionBuckets(plans, new Map());
      expect(buckets.find((b) => b.id === 'stale')!.count).toBe(1);
      expect(buckets.find((b) => b.id === 'in_motion')!.count).toBe(0);
    });

    it('routes a fresh plan with pending decisions to needs_input', () => {
      const plans = [makePlan({ id: 'p1', status: 'active', updated_at: ISO_NOW })];
      const buckets = computeAttentionBuckets(plans, new Map([['p1', 2]]));
      expect(buckets.find((b) => b.id === 'needs_input')!.count).toBe(1);
    });

    it('decisions on a stale plan still mark it stale (stale wins)', () => {
      const plans = [makePlan({ id: 'p1', status: 'active', updated_at: ISO_8D_AGO })];
      const buckets = computeAttentionBuckets(plans, new Map([['p1', 1]]));
      expect(buckets.find((b) => b.id === 'stale')!.count).toBe(1);
      expect(buckets.find((b) => b.id === 'needs_input')!.count).toBe(0);
    });

    it('routes high-progress fresh plans to finish_line', () => {
      const plans = [makePlan({ id: 'p1', status: 'active', updated_at: ISO_NOW, progress: 92 })];
      const buckets = computeAttentionBuckets(plans, new Map());
      expect(buckets.find((b) => b.id === 'finish_line')!.count).toBe(1);
    });

    it('routes completed plans to done', () => {
      const plans = [makePlan({ id: 'p1', status: 'completed', progress: 100 })];
      const buckets = computeAttentionBuckets(plans, new Map());
      expect(buckets.find((b) => b.id === 'done')!.count).toBe(1);
    });

    it('drops archived plans from every bucket', () => {
      const plans = [makePlan({ id: 'p1', status: 'archived' as Plan['status'] })];
      const buckets = computeAttentionBuckets(plans, new Map());
      expect(buckets.every((b) => b.count === 0)).toBe(true);
    });

    it('default in_motion catches everything not stale/needs/finish', () => {
      const plans = [makePlan({ id: 'p1', status: 'active', updated_at: ISO_2D_AGO, progress: 40 })];
      const buckets = computeAttentionBuckets(plans, new Map());
      expect(buckets.find((b) => b.id === 'in_motion')!.count).toBe(1);
    });
  });

  describe('selectOnePushFromDone', () => {
    it('only includes active plans with progress in [70, 100)', () => {
      const plans = [
        makePlan({ id: 'p1', status: 'active', progress: 65 }),
        makePlan({ id: 'p2', status: 'active', progress: 72 }),
        makePlan({ id: 'p3', status: 'active', progress: 100 }),
        makePlan({ id: 'p4', status: 'completed', progress: 90 }),
      ];
      const out = selectOnePushFromDone(plans);
      expect(out.map((p) => p.id)).toEqual(['p2']);
    });

    it('orders by progress descending and respects the limit', () => {
      const plans = [
        makePlan({ id: 'a', status: 'active', progress: 75 }),
        makePlan({ id: 'b', status: 'active', progress: 95 }),
        makePlan({ id: 'c', status: 'active', progress: 80 }),
        makePlan({ id: 'd', status: 'active', progress: 88 }),
      ];
      const out = selectOnePushFromDone(plans, 2);
      expect(out.map((p) => p.id)).toEqual(['b', 'd']);
    });
  });

  describe('selectBlockedOnYou', () => {
    it('orders plans by pending-decision count desc', () => {
      const plans = [
        makePlan({ id: 'a' }),
        makePlan({ id: 'b' }),
        makePlan({ id: 'c' }),
      ];
      const decisions = new Map([
        ['a', 1],
        ['b', 4],
        ['c', 2],
      ]);
      const out = selectBlockedOnYou(plans, decisions);
      expect(out.map((p) => p.id)).toEqual(['b', 'c', 'a']);
    });

    it('drops plans with zero pending decisions', () => {
      const plans = [makePlan({ id: 'a' }), makePlan({ id: 'b' })];
      const out = selectBlockedOnYou(plans, new Map([['a', 1]]));
      expect(out.map((p) => p.id)).toEqual(['a']);
    });
  });

  describe('selectDriftingWithoutYou', () => {
    it('orders by staleness (oldest first) and only counts active >5d', () => {
      const plans = [
        makePlan({ id: 'fresh', status: 'active', updated_at: ISO_2D_AGO }),
        makePlan({ id: 'mid', status: 'active', updated_at: ISO_8D_AGO }),
        makePlan({ id: 'old', status: 'active', updated_at: ISO_30D_AGO }),
        makePlan({ id: 'completed', status: 'completed', updated_at: ISO_30D_AGO }),
      ];
      const out = selectDriftingWithoutYou(plans);
      expect(out.map((p) => p.id)).toEqual(['old', 'mid']);
    });
  });
});
