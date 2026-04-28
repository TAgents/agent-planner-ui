import { publicStatus } from '../PublicPlanV1.helpers';

describe('PublicPlan status mask', () => {
  it.each([
    ['draft', 'not_started'],
    ['plan_ready', 'not_started'],
  ])('hides internal %s status from public viewers (%s)', (input, expected) => {
    expect(publicStatus(input)).toBe(expected);
  });

  it.each(['not_started', 'in_progress', 'completed', 'blocked'])(
    'passes %s through unchanged',
    (status) => {
      expect(publicStatus(status)).toBe(status);
    },
  );
});
