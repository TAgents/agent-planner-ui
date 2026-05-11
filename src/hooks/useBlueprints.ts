import { useMutation, useQuery, useQueryClient } from 'react-query';
import { blueprintService } from '../services/blueprints.service';
import { Blueprint, BlueprintScope, BlueprintVisibility } from '../types';

export const useBlueprints = (
  filters?: { scope?: BlueprintScope; visibility?: BlueprintVisibility; ownerOnly?: boolean },
) => {
  return useQuery(
    ['blueprints', filters?.scope ?? 'all', filters?.visibility ?? 'any', filters?.ownerOnly ?? false],
    async () => {
      const res = await blueprintService.list({
        scope: filters?.scope,
        visibility: filters?.visibility,
        owner_only: filters?.ownerOnly,
      });
      return res;
    },
  );
};

export const useBlueprint = (id?: string) => {
  return useQuery(['blueprint', id], () => blueprintService.get(id as string), {
    enabled: !!id,
  });
};

export const usePublicBlueprints = (params?: { scope?: BlueprintScope; limit?: number }) => {
  return useQuery(
    ['blueprints', 'public', params?.scope ?? 'all', params?.limit ?? 50],
    () => blueprintService.listPublic(params),
  );
};

export const usePublicBlueprint = (id?: string) => {
  return useQuery(['blueprint', 'public', id], () => blueprintService.getPublic(id as string), {
    enabled: !!id,
  });
};

export const useBlueprintForks = (id?: string) => {
  return useQuery(
    ['blueprint-forks', id],
    () => blueprintService.listForks(id as string),
    { enabled: !!id },
  );
};

export const useForkBlueprint = () => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, workspaceId, title }: { id: string; workspaceId: string; title?: string }) =>
      blueprintService.fork(id, { workspace_id: workspaceId, title }),
    {
      onSuccess: (_data, { id }) => {
        qc.invalidateQueries(['blueprints']);
        qc.invalidateQueries(['blueprint', id]);
        qc.invalidateQueries(['plans']);
        qc.invalidateQueries(['workspaces']);
      },
    },
  );
};

export const useSavePlanAsBlueprint = () => {
  const qc = useQueryClient();
  return useMutation(
    ({
      planId,
      title,
      description,
      visibility,
      tags,
    }: {
      planId: string;
      title?: string;
      description?: string;
      visibility?: BlueprintVisibility;
      tags?: string[];
    }) => blueprintService.saveFromPlan(planId, { title, description, visibility, tags }),
    {
      onSuccess: () => qc.invalidateQueries(['blueprints']),
    },
  );
};

export const useUpdateBlueprint = (id: string) => {
  const qc = useQueryClient();
  return useMutation((data: Parameters<typeof blueprintService.update>[1]) => blueprintService.update(id, data), {
    onSuccess: () => {
      qc.invalidateQueries(['blueprints']);
      qc.invalidateQueries(['blueprint', id]);
    },
  });
};

export const useDeleteBlueprint = () => {
  const qc = useQueryClient();
  return useMutation(blueprintService.remove, {
    onSuccess: () => qc.invalidateQueries(['blueprints']),
  });
};

export type { Blueprint };
