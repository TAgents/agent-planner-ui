/**
 * Statuses that internal users may see but anonymous public viewers
 * should not — we mask them as `not_started` to avoid leaking
 * work-in-progress signals (draft, plan_ready) to share-link viewers.
 */
export const PUBLIC_STATUS_MASK: Record<string, string> = {
  draft: 'not_started',
  plan_ready: 'not_started',
};

export function publicStatus(s: string): string {
  return PUBLIC_STATUS_MASK[s] || s;
}
