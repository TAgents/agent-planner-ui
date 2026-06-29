import type { GraphitiEpisode } from '../services/knowledge.service';
import type { PillColor } from '../components/v1';

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

export type EpisodeType = { label: string; tone: PillColor };

// Clean taxonomy → pill tone. Red is reserved for contradiction.
const TYPE_TONES: Record<string, PillColor> = {
  Decision: 'amber',
  Constraint: 'amber',
  Learning: 'emerald',
  Fact: 'emerald',
  Pattern: 'violet',
  Technique: 'violet',
  Research: 'violet',
  Progress: 'slate',
  Update: 'slate',
  Contradiction: 'red',
  Note: 'slate',
};

// Match patterns checked in order against (content prefix, then
// source_description). First hit wins.
const TYPE_MATCHERS: Array<[RegExp, string]> = [
  [/contradict|supersed/, 'Contradiction'],
  [/decision/, 'Decision'],
  [/constraint/, 'Constraint'],
  [/pattern/, 'Pattern'],
  [/technique/, 'Technique'],
  [/research|reasoning|investigat/, 'Research'],
  [/completion|work.?session|progress|status/, 'Progress'],
  [/task update/, 'Update'],
  [/learning|learned|knowledge entry|fact/, 'Learning'],
];

/**
 * Episodes arrive tagged only with a free-text `source_description`
 * ("AGENTPLANNER KNOWLEDGE ENTRY", "V1 TASK UPDATE", "AGENT LOOP
 * WORK-SESSION COMPLETION") because the write path never persisted the
 * entry_type taxonomy into Graphiti. Map those — plus a leading
 * "Decision:/Learning:/..." prefix in the content, which our log/learning
 * conventions emit — onto the clean taxonomy so the timeline pill reads
 * "Decision" / "Learning" / "Progress" instead of raw plumbing strings.
 *
 * (Write-time fix — persisting entry_type on new episodes — is tracked
 * separately; this read-time normalizer also covers all legacy episodes.)
 */
export function normalizeEpisodeType(ep: GraphitiEpisode): EpisodeType {
  const contentPrefix = (ep.content || '').slice(0, 24).toLowerCase();
  const src = (ep.source_description || '').toLowerCase();
  for (const [re, label] of TYPE_MATCHERS) {
    if (re.test(contentPrefix) || re.test(src)) {
      return { label, tone: TYPE_TONES[label] || 'slate' };
    }
  }
  return { label: 'Note', tone: 'slate' };
}

export type EpisodeScope = {
  plan_id: string;
  plan_title: string;
  node_id?: string;
  node_title?: string;
};

/**
 * Dedupe an episode's plan/task links into scope chips — one per distinct
 * (plan, node) — so a human sees what each fact is about and where it
 * applies. Prefers task-level granularity; collapses to plan-only links.
 */
export function scopeChips(ep: GraphitiEpisode, max = 3): EpisodeScope[] {
  const seen = new Set<string>();
  const out: EpisodeScope[] = [];
  for (const l of ep.links || []) {
    if (!l.plan_id) continue;
    const key = `${l.plan_id}:${l.node_id || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      plan_id: l.plan_id,
      plan_title: l.plan_title,
      node_id: l.node_id,
      node_title: l.node_title,
    });
    if (out.length >= max) break;
  }
  return out;
}
