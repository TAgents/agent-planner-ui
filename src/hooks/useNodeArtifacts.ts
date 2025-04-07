import { useQuery, useMutation, useQueryClient } from 'react-query';
import { artifactService } from '../services/api';
import { Artifact } from '../types';

export const useNodeArtifacts = (planId: string, nodeId: string, options = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ['nodeArtifacts', planId, nodeId];

  const { data: artifactsData, isLoading, error, refetch } = useQuery(
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

  // Safely handle different response formats
  let artifacts: Artifact[] = [];
  if (artifactsData) {
    if (Array.isArray(artifactsData)) {
      artifacts = artifactsData;
    } else if (artifactsData.data && Array.isArray(artifactsData.data)) {
      artifacts = artifactsData.data;
    }
  }

  return {
    artifacts,
    isLoading,
    error,
    refetch,
    addArtifact: addArtifactMutation.mutate,
    isAddingArtifact: addArtifactMutation.isLoading,
  };
};