import { agentActivityKind } from '../PlansList.helpers';

describe('agentActivityKind', () => {
  // Frozen "now" so tests are deterministic and don't drift across runs.
  const NOW = new Date('2026-04-27T18:00:00Z').getTime();

  it('returns "none" when no timestamp is provided', () => {
    expect(agentActivityKind(null, NOW)).toBe('none');
    expect(agentActivityKind(undefined, NOW)).toBe('none');
    expect(agentActivityKind('', NOW)).toBe('none');
  });

  it('returns "live" within 5 minutes', () => {
    const now = new Date(NOW);
    expect(agentActivityKind(now.toISOString(), NOW)).toBe('live');
    expect(
      agentActivityKind(new Date(NOW - 4 * 60_000).toISOString(), NOW),
    ).toBe('live');
  });

  it('returns "recent" within an hour but past 5 minutes', () => {
    expect(
      agentActivityKind(new Date(NOW - 6 * 60_000).toISOString(), NOW),
    ).toBe('recent');
    expect(
      agentActivityKind(new Date(NOW - 59 * 60_000).toISOString(), NOW),
    ).toBe('recent');
  });

  it('returns "none" for activity older than an hour', () => {
    expect(
      agentActivityKind(new Date(NOW - 90 * 60_000).toISOString(), NOW),
    ).toBe('none');
    expect(
      agentActivityKind(new Date(NOW - 24 * 60 * 60_000).toISOString(), NOW),
    ).toBe('none');
  });

  it('handles boundary at exactly 5 minutes as "live"', () => {
    expect(
      agentActivityKind(new Date(NOW - 5 * 60_000).toISOString(), NOW),
    ).toBe('live');
  });

  it('handles boundary at exactly 60 minutes as "recent"', () => {
    expect(
      agentActivityKind(new Date(NOW - 60 * 60_000).toISOString(), NOW),
    ).toBe('recent');
  });
});
