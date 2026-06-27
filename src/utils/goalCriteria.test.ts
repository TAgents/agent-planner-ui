import { normalizeCriteria, isMeasurableCriterion, isCriterionMet, criteriaAttainment } from './goalCriteria';

describe('goalCriteria (UI mirror of backend semantics)', () => {
  it('normalizes strings, objects, and the wrapped shape', () => {
    expect(normalizeCriteria(['a', 'b'])).toEqual([{ statement: 'a' }, { statement: 'b' }]);
    expect(normalizeCriteria({ criteria: ['x'] })).toEqual([{ statement: 'x' }]);
    expect(normalizeCriteria(null)).toEqual([]);
    const obj = [{ statement: 's', metric: 'm', target: 1, direction: 'increase' as const }];
    expect(normalizeCriteria(obj)).toEqual(obj);
  });

  it('flags measurable criteria (metric + direction, target for inc/dec)', () => {
    expect(isMeasurableCriterion({ statement: 'x' })).toBe(false);
    expect(isMeasurableCriterion({ statement: 'x', metric: 'p99', target: 100, direction: 'decrease' })).toBe(true);
    expect(isMeasurableCriterion({ statement: 'x', metric: 'shipped', direction: 'boolean' })).toBe(true);
    expect(isMeasurableCriterion({ statement: 'x', metric: 'p99', direction: 'decrease' })).toBe(false);
  });

  it('evaluates met state by direction', () => {
    expect(isCriterionMet({ statement: '', metric: 'm', target: 100, current: 90, direction: 'decrease' })).toBe(true);
    expect(isCriterionMet({ statement: '', metric: 'm', target: 100, current: 140, direction: 'decrease' })).toBe(false);
    expect(isCriterionMet({ statement: '', metric: 'm', direction: 'boolean', current: 'true' })).toBe(true);
    expect(isCriterionMet({ statement: '', metric: 'm', direction: 'boolean', current: 'false' })).toBe(false);
  });

  it('computes attainment over measurable criteria only (null when none)', () => {
    expect(criteriaAttainment([
      { statement: '', metric: 'a', target: 1, current: 5, direction: 'increase' },
      { statement: '', metric: 'b', target: 1, current: 0, direction: 'increase' },
      'qualitative',
    ])).toEqual({ measurable_count: 2, met_count: 1, attainment_pct: 50 });
    expect(criteriaAttainment(['vague'])).toEqual({ measurable_count: 0, met_count: 0, attainment_pct: null });
  });
});
