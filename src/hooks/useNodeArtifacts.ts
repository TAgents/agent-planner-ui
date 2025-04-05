import { useQuery, useMutation, useQueryClient } from 'react-query';
import { artifactService } from '../services/api';
import { Artifact } from '../types';

export const useNodeArtifacts = (planId: string, nodeId: string, options = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ['nodeArtifacts', planId, nodeId];

  const { data, isLoading, error, refetch } = useQuery<{ data: Artifact[] }>(
    queryKey,
    () => artifactService.getArtifacts(planId, nodeId),
    {
      enabled: !!planId && !!nodeId,
      staleTime: 60 * 1000 * 5, // 5 minutes
      ...options,
    }
  );

  const addArtifactMutation = useMutation(
    (artifactData: { name: string; content_type: string; url: string; metadata?: object }) =>
      artifactService.addArtifact(planId, nodeId, artifactData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      },
      onError: (err: any) => {
        console.error("Error adding artifact:", err);
         // Handle error feedback
      }
    }
  );

  const artifacts = data?.data || [];

  return {
    artifacts,
    isLoading,
    error,
    refetch,
    addArtifact: addArtifactMutation.mutate,
    isAddingArtifact: addArtifactMutation.isLoading,
  };
};