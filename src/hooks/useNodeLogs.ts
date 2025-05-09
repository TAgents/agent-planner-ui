import { useQuery, useMutation, useQueryClient } from 'react-query';
import { logService } from '../services/api';
import { Log, ApiResponse } from '../types';

export const useNodeLogs = (planId: string, nodeId: string, options = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ['nodeLogs', planId, nodeId];

  const { data, isLoading, error, refetch } = useQuery(
    queryKey,
    () => logService.getLogs(planId, nodeId),
    {
      enabled: !!planId && !!nodeId,
      staleTime: 60 * 1000 * 2, // 2 minutes
      ...options,
    }
  );

  const addLogMutation = useMutation(
    (logData: { content: string; log_type: string; tags?: string[]; metadata?: object }) => {
      console.log(`[useNodeLogs] Adding log entry to plan=${planId}, node=${nodeId}:`, logData);
      return logService.addLogEntry(planId, nodeId, logData);
    },
    {
      onSuccess: (data) => {
        console.log('[useNodeLogs] Log added successfully:', data);
        console.log('[useNodeLogs] Invalidating and refetching queries with key:', queryKey);
        // Immediately refetch the data
        queryClient.invalidateQueries(queryKey);
        queryClient.refetchQueries(queryKey);
      },
      onError: (err: any) => {
        console.error("[useNodeLogs] Error adding log entry:", err);
        // Handle error feedback
      }
    }
  );

  // Handle different response formats
  let logs: Log[] = [];
  if (data) {
    if (window.DEBUG_ENABLED) console.log('Raw logs data received:', data);
    if (Array.isArray(data)) {
      logs = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      if (window.DEBUG_ENABLED) console.log('Logs data is a direct array');
    } else if (data.data && Array.isArray(data.data)) {
      logs = [...data.data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      if (window.DEBUG_ENABLED) console.log('Logs data is in data property');
    } else {
      if (window.DEBUG_ENABLED) console.error('Unexpected logs data format:', data);
    }
  }

  if (window.DEBUG_ENABLED) console.log(`useNodeLogs hook for plan=${planId}, node=${nodeId}: found ${logs.length} logs`);

  return {
    logs,
    isLoading,
    error,
    refetch,
    addLogEntry: addLogMutation.mutate,
    isAddingLog: addLogMutation.isLoading,
  };
};