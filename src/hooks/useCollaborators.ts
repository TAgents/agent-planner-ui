import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';

interface Collaborator {
  id: string;
  email: string;
  name?: string;
  role: 'viewer' | 'editor' | 'admin' | 'owner';
  avatar?: string;
  created_at?: string;
}

export const useCollaborators = (planId: string) => {
  const queryClient = useQueryClient();

  const { data: response, isLoading, error, refetch } = useQuery(
    ['collaborators', planId],
    () => api.plans.getCollaborators(planId),
    {
      enabled: !!planId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Handle different response formats from the API
  const collaborators = React.useMemo(() => {
    if (!response) return [];
    
    // If response is directly an array
    if (Array.isArray(response)) {
      return response;
    }
    
    // If response has a data property that's an array
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // If response has a collaborators property
    if (response.collaborators && Array.isArray(response.collaborators)) {
      return response.collaborators;
    }
    
    // Default to empty array
    return [];
  }, [response]);

  const addCollaborator = useMutation(
    (data: { email: string; role: 'viewer' | 'editor' | 'admin' }) =>
      api.plans.addCollaborator(planId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['collaborators', planId]);
      },
    }
  );

  const removeCollaborator = useMutation(
    (userId: string) => api.plans.removeCollaborator(planId, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['collaborators', planId]);
      },
    }
  );

  const updateCollaboratorRole = useMutation(
    ({ userId, role }: { userId: string; role: 'viewer' | 'editor' | 'admin' }) =>
      api.plans.updateCollaboratorRole(planId, userId, role),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['collaborators', planId]);
      },
    }
  );

  return {
    collaborators: collaborators as Collaborator[],
    isLoading,
    error,
    refetch,
    addCollaborator,
    removeCollaborator,
    updateCollaboratorRole,
  };
};
