import { useMutation, useQuery, useQueryClient } from 'react-query';
import { workspaceService } from '../services/workspaces.service';
import { Workspace } from '../types';

function getActiveOrgId(): string | null {
  const fromStore = localStorage.getItem('active_org_id');
  if (fromStore) return fromStore;
  const sessionStr = localStorage.getItem('auth_session');
  if (!sessionStr) return null;
  try {
    const s = JSON.parse(sessionStr);
    return s?.user?.organizationId || s?.user?.organization_id || null;
  } catch {
    return null;
  }
}

function getUserId(): string {
  const sessionStr = localStorage.getItem('auth_session');
  if (!sessionStr) return 'anonymous';
  try {
    const s = JSON.parse(sessionStr);
    return s?.user?.id || s?.user?.email || 'anonymous';
  } catch {
    return 'anonymous';
  }
}

export const useWorkspaces = (
  organizationId?: string | null,
  options?: { includeArchived?: boolean; enabled?: boolean },
) => {
  const orgId = organizationId ?? getActiveOrgId();
  const userId = getUserId();
  return useQuery(
    ['workspaces', userId, orgId, options?.includeArchived ? 'all' : 'active'],
    async () => {
      if (!orgId) return { workspaces: [] as Workspace[] };
      const res = await workspaceService.list({
        organization_id: orgId,
        include_archived: options?.includeArchived,
      });
      return res;
    },
    { enabled: options?.enabled !== false && !!orgId },
  );
};

export const useWorkspace = (id?: string) => {
  return useQuery(['workspace', id], () => workspaceService.get(id as string), {
    enabled: !!id,
  });
};

export const useCreateWorkspace = () => {
  const qc = useQueryClient();
  return useMutation(workspaceService.create, {
    onSuccess: () => qc.invalidateQueries(['workspaces']),
  });
};

export const useUpdateWorkspace = (id: string) => {
  const qc = useQueryClient();
  return useMutation((data: Parameters<typeof workspaceService.update>[1]) => workspaceService.update(id, data), {
    onSuccess: () => {
      qc.invalidateQueries(['workspaces']);
      qc.invalidateQueries(['workspace', id]);
    },
  });
};

export const useArchiveWorkspace = () => {
  const qc = useQueryClient();
  return useMutation(workspaceService.archive, {
    onSuccess: () => qc.invalidateQueries(['workspaces']),
  });
};

export const useRestoreWorkspace = () => {
  const qc = useQueryClient();
  return useMutation(workspaceService.restore, {
    onSuccess: () => qc.invalidateQueries(['workspaces']),
  });
};
