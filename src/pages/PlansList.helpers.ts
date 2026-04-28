/**
 * Bucket the most-recent agent log into a discrete activity state.
 * 'live' (≤5 min) → pulsing green dot on the row; 'recent' (≤1 h) →
 * muted dot + relative time; otherwise hidden.
 */
export function agentActivityKind(
  iso?: string | null,
  now: number = Date.now(),
): 'live' | 'recent' | 'none' {
  if (!iso) return 'none';
  const ms = now - new Date(iso).getTime();
  const min = ms / 60000;
  if (min <= 5) return 'live';
  if (min <= 60) return 'recent';
  return 'none';
}
