import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';

export const useAvailableUsers = (planId: string) => {
  return useQuery(
    ['available-users', planId],
    () => api.plans.getAvailableUsers(planId),
    {
      enabled: !!planId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    }
  );
};

export const useAllUsers = () => {
  return useQuery(
    ['all-users'],
    () => api.users.getAllUsers(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    }
  );
};

export const useSearchUsers = (query: string, enabled = true) => {
  return useQuery(
    ['search-users', query],
    () => api.users.searchUsers(query),
    {
      enabled: enabled && !!query && query.length > 1,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    }
  );
};

export const useNodeAssignments = (planId: string, nodeId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery(
    ['node-assignments', planId, nodeId],
    () => api.nodes.getNodeAssignments(planId, nodeId),
    {
      enabled: !!planId && !!nodeId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    }
  );

  const assignUser = useMutation(
    (userId: string) =>
      api.nodes.assignUserToNode(planId, nodeId, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['node-assignments', planId, nodeId]);
        queryClient.invalidateQueries(['nodes', planId]);
      },
      onError: (error: any) => {
        console.error('Failed to assign user to node:', error);
      },
    }
  );

  const unassignUser = useMutation(
    (userId: string) =>
      api.nodes.unassignUserFromNode(planId, nodeId, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['node-assignments', planId, nodeId]);
        queryClient.invalidateQueries(['nodes', planId]);
      },
      onError: (error: any) => {
        console.error('Failed to unassign user from node:', error);
      },
    }
  );

  return {
    ...query,
    assignments: query.data || [],
    assignUser: assignUser.mutateAsync,
    unassignUser: unassignUser.mutateAsync,
    isAssigning: assignUser.isLoading,
    isUnassigning: unassignUser.isLoading,
  };
};

export default useAvailableUsers;
