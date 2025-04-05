import { useQuery, useMutation, useQueryClient } from 'react-query';
import { logService } from '../services/api';
import { Log } from '../types';

export const useNodeLogs = (planId: string, nodeId: string, options = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ['nodeLogs', planId, nodeId];

  const { data, isLoading, error, refetch } = useQuery<{ data: Log[] }>(
    queryKey,
    () => logService.getLogs(planId, nodeId),
    {
      enabled: !!planId && !!nodeId,
      staleTime: 60 * 1000 * 2, // 2 minutes
      ...options,
    }
  );

  const addLogMutation = useMutation(
    (logData: { content: string; log_type: string; tags?: string[]; metadata?: object }) =>
      logService.addLogEntry(planId, nodeId, logData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      },
      onError: (err: any) => {
        console.error("Error adding log entry:", err);
        // Handle error feedback
      }
    }
  );

  const logs = data?.data || [];

  return {
    logs,
    isLoading,
    error,
    refetch,
    addLogEntry: addLogMutation.mutate,
    isAddingLog: addLogMutation.isLoading,
  };
};