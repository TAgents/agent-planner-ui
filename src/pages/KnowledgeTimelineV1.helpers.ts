import type { GraphitiEpisode } from '../services/knowledge.service';

/**
 * Reduce an episode's entity_edges to a deduped, capped list of names
 * suitable for chip rendering. Each edge has source + target names; we
 * union them, drop any duplicates, and cap at 6 so a chatty episode
 * doesn't blow out the row.
 */
export function entityChips(
  edges: NonNullable<GraphitiEpisode['entity_edges']>,
  max = 6,
): string[] {
  const names = new Set<string>();
  for (const e of edges) {
    if (e.source_entity_name) names.add(e.source_entity_name);
    if (e.target_entity_name) names.add(e.target_entity_name);
    if (names.size >= max) break;
  }
  return Array.from(names).slice(0, max);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Episodes seeded by agents (or our own seeders) often arrive with
 * `name` set to a task UUID, which renders as opaque hex to humans.
 * When that happens, fall back to the first ~80 chars of `content`
 * so the row is still scannable; only show a generic "Knowledge
 * entry" if there's no usable content either.
 */
export function displayEpisodeName(ep: GraphitiEpisode): string {
  const name = (ep.name || '').trim();
  if (name && !UUID_RE.test(name)) return name;
  const c = (ep.content || '').trim();
  if (!c) return 'Knowledge entry';
  const firstLine = c.split(/\n+/)[0] || c;
  const sentence = firstLine.split(/(?<=[.!?])\s+/)[0] || firstLine;
  return sentence.length > 80 ? `${sentence.slice(0, 77)}…` : sentence;
}
