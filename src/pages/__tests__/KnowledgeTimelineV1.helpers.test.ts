import { displayEpisodeName, entityChips } from '../KnowledgeTimelineV1.helpers';
import type { GraphitiEpisode } from '../../services/knowledge.service';

const ep = (over: Partial<GraphitiEpisode>): GraphitiEpisode => ({
  uuid: 'e-1',
  name: '',
  content: '',
  created_at: '2026-04-27T00:00:00Z',
  ...over,
});

describe('displayEpisodeName', () => {
  it('uses name when it is human-readable', () => {
    expect(displayEpisodeName(ep({ name: 'Spec write-up' }))).toBe('Spec write-up');
  });

  it('falls back to content first sentence when name is a UUID', () => {
    const e = ep({
      name: '550e8400-e29b-41d4-a716-446655440000',
      content: 'Investigated migration safety. The lock contention is bounded.',
    });
    expect(displayEpisodeName(e)).toBe('Investigated migration safety.');
  });

  it('truncates very long fallback content to 80 chars', () => {
    const e = ep({
      name: '550e8400-e29b-41d4-a716-446655440000',
      content: 'a'.repeat(200),
    });
    const out = displayEpisodeName(e);
    expect(out.length).toBeLessThanOrEqual(80);
    expect(out.endsWith('…')).toBe(true);
  });

  it('uses first content line when no sentence-terminator is present', () => {
    const e = ep({
      name: '550e8400-e29b-41d4-a716-446655440000',
      content: 'one liner without punctuation\nsecond line ignored',
    });
    expect(displayEpisodeName(e)).toBe('one liner without punctuation');
  });

  it('returns generic label when both name and content are empty', () => {
    expect(displayEpisodeName(ep({}))).toBe('Knowledge entry');
  });

  it('treats UUID with mixed case as UUID', () => {
    const e = ep({
      name: '550E8400-E29B-41D4-A716-446655440000',
      content: 'Real title here.',
    });
    expect(displayEpisodeName(e)).toBe('Real title here.');
  });
});

describe('entityChips', () => {
  it('unions source + target names and dedups', () => {
    expect(
      entityChips([
        { relation_type: 'r', source_entity_name: 'Alice', target_entity_name: 'Bob' },
        { relation_type: 'r', source_entity_name: 'Bob', target_entity_name: 'Carol' },
      ]),
    ).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('respects the cap', () => {
    const edges = Array.from({ length: 10 }, (_, i) => ({
      relation_type: 'r',
      source_entity_name: `S${i}`,
      target_entity_name: `T${i}`,
    }));
    const out = entityChips(edges, 4);
    expect(out).toHaveLength(4);
  });

  it('skips falsy names', () => {
    expect(
      entityChips([
        { relation_type: 'r', source_entity_name: '', target_entity_name: 'Only' },
      ] as any),
    ).toEqual(['Only']);
  });
});
