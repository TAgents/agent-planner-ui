import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';

interface Collaborator {
  id: string;
  email?: string;
  name?: string;
  role: 'viewer' | 'editor' | 'admin' | 'owner';
  avatar?: string;
  created_at?: string;
  // Additional fields that might come from the API
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
  user_id?: string;
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
      retry: (failureCount, error: any) => {
        // Don't retry if it's a 404 (collaborators endpoint might not be implemented yet)
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    }
  );

  // Handle different response formats from the API
  const collaborators = React.useMemo(() => {
    if (!response) return [];
    
    console.log('Raw collaborators response:', response);
    
    // If response is directly an array
    if (Array.isArray(response)) {
      console.log('Response is array:', response);
      return response;
    }
    
    // If response has a data property that's an array
    if (response.data && Array.isArray(response.data)) {
      console.log('Response has data array:', response.data);
      return response.data;
    }
    
    // If response has a collaborators property
    if (response.collaborators && Array.isArray(response.collaborators)) {
      console.log('Response has collaborators array:', response.collaborators);
      // Also include the owner if present
      if (response.owner) {
        return [
          { ...response.owner, role: 'owner', id: response.owner.id },
          ...response.collaborators
        ];
      }
      return response.collaborators;
    }
    
    // If response has owner and collaborators separately (from listCollaborators endpoint)
    if (response.owner) {
      const result = [];
      // Add owner first
      result.push({ ...response.owner, role: 'owner', id: response.owner.id });
      // Add collaborators if they exist
      if (response.collaborators && Array.isArray(response.collaborators)) {
        result.push(...response.collaborators);
      }
      console.log('Built collaborators list with owner:', result);
      return result;
    }
    
    // Default to empty array
    console.log('No collaborators found in response');
    return [];
  }, [response]);

  const addCollaborator = useMutation(
    (data: { email: string; role: 'viewer' | 'editor' | 'admin' }) =>
      api.plans.addCollaborator(planId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['collaborators', planId]);
        queryClient.invalidateQueries(['plans']); // Also refresh plans list in case metadata changed
      },
      onError: (error: any) => {
        console.error('Failed to add collaborator:', error);
      }
    }
  );

  const removeCollaborator = useMutation(
    (userId: string) => api.plans.removeCollaborator(planId, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['collaborators', planId]);
        queryClient.invalidateQueries(['plans']);
      },
      onError: (error: any) => {
        console.error('Failed to remove collaborator:', error);
      }
    }
  );

  const updateCollaboratorRole = useMutation(
    ({ userId, role }: { userId: string; role: 'viewer' | 'editor' | 'admin' }) =>
      api.plans.updateCollaboratorRole(planId, userId, role),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['collaborators', planId]);
      },
      onError: (error: any) => {
        console.error('Failed to update collaborator role:', error);
      }
    }
  );

  return {
    collaborators: collaborators as Collaborator[],
    isLoading,
    error,
    refetch,
    addCollaborator: addCollaborator.mutateAsync,
    removeCollaborator: removeCollaborator.mutateAsync,
    updateCollaboratorRole: updateCollaboratorRole.mutateAsync,
    // Also expose the mutation objects for loading states
    isAddingCollaborator: addCollaborator.isLoading,
    isRemovingCollaborator: removeCollaborator.isLoading,
    isUpdatingRole: updateCollaboratorRole.isLoading,
  };
};
