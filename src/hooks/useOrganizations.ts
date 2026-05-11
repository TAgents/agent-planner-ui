import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { organizationService, Organization } from '../services/api';

/**
 * Fetches the orgs the current user belongs to. Stale-time of 5 minutes —
 * org list rarely changes during a session and many surfaces want to cross-
 * reference workspaces/plans/goals against the parent org.
 */
export function useOrganizations() {
  const query = useQuery(['organizations'], () => organizationService.list(), {
    staleTime: 5 * 60_000,
  });
  const byId = useMemo(() => {
    const m = new Map<string, Organization>();
    for (const o of query.data?.organizations ?? []) m.set(o.id, o);
    return m;
  }, [query.data]);
  return { ...query, byId, organizations: query.data?.organizations ?? [] };
}
