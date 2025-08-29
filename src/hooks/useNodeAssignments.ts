import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';

interface Assignment {
  id: string;
  node_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
}

export const useNodeAssignments = (planId: string, nodeId: string) => {
  const queryClient = useQueryClient();
  
  // Fetch current assignments for the node
  const { data: assignments = [], isLoading, error } = useQuery(
    ['node-assignments', planId, nodeId],
    () => api.nodes.getNodeAssignments(planId, nodeId),
    {
      enabled: !!planId && !!nodeId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 404 or 403
        if (error?.response?.status === 404 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
    }
  );
  
  // Mutation to assign a user to the node
  const assignUser = useMutation(
    (userId: string) => api.nodes.assignUserToNode(planId, nodeId, userId),
    {
      onSuccess: () => {
        // Invalidate and refetch assignments
        queryClient.invalidateQueries(['node-assignments', planId, nodeId]);
        // Also invalidate activities as assignments appear there
        queryClient.invalidateQueries(['node-activities', planId, nodeId]);
      },
      onError: (error: any) => {
        console.error('Failed to assign user:', error);
      }
    }
  );
  
  // Mutation to unassign a user from the node
  const unassignUser = useMutation(
    (userId: string) => api.nodes.unassignUserFromNode(planId, nodeId, userId),
    {
      onSuccess: () => {
        // Invalidate and refetch assignments
        queryClient.invalidateQueries(['node-assignments', planId, nodeId]);
        // Also invalidate activities
        queryClient.invalidateQueries(['node-activities', planId, nodeId]);
      },
      onError: (error: any) => {
        console.error('Failed to unassign user:', error);
      }
    }
  );
  
  return {
    assignments: assignments as Assignment[],
    isLoading,
    error,
    assignUser: assignUser.mutateAsync,
    unassignUser: unassignUser.mutateAsync,
    isAssigning: assignUser.isLoading,
    isUnassigning: unassignUser.isLoading,
  };
};
