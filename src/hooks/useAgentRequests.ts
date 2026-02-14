import { useQuery, useMutation, useQueryClient } from 'react-query';
import { agentRequestApi, AgentRequest } from '../services/api';
import { useWebSocketEvent } from './useWebSocket';
import { AGENT_EVENTS } from '../types/websocket';

export type { AgentRequest };

// Hook for listing agent requests for a task
export function useTaskAgentRequests(planId: string, taskId: string, options?: { enabled?: boolean }) {
  return useQuery(
    ['agentRequests', planId, taskId],
    () => agentRequestApi.listForTask(planId, taskId),
    {
      enabled: !!planId && !!taskId && (options?.enabled ?? true),
      retry: false, // Don't retry on failure to prevent rate limit cascades
      staleTime: 30000, // Consider data stale after 30s
      refetchInterval: 30000, // Poll every 30s for updates
    }
  );
}

// Hook for listing all agent requests for a plan
export function usePlanAgentRequests(planId: string, status?: string) {
  return useQuery(
    ['agentRequests', planId, 'all', status],
    () => agentRequestApi.listForPlan(planId, status),
    {
      enabled: !!planId,
      retry: false,
      staleTime: 30000,
      refetchInterval: 30000,
    }
  );
}

// Hook for creating an agent request with optimistic updates
export function useCreateAgentRequest(planId: string, taskId?: string) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ taskId: tId, data }: {
      taskId: string;
      data: {
        request_type: 'execute' | 'review' | 'plan' | 'custom';
        prompt?: string;
        priority?: 'normal' | 'urgent';
      };
    }) => agentRequestApi.create(planId, tId, data),
    {
      // Optimistic update for instant UI feedback
      onMutate: async ({ taskId: tId, data }) => {
        const queryKey = ['agentRequests', planId, tId];
        await queryClient.cancelQueries(queryKey);
        const previous = queryClient.getQueryData<AgentRequest[]>(queryKey);
        
        // Optimistically add the new request
        queryClient.setQueryData<AgentRequest[]>(queryKey, (old) => [
          {
            id: 'temp-' + Date.now(),
            plan_id: planId,
            task_id: tId,
            request_type: data.request_type,
            prompt: data.prompt,
            status: 'pending',
            priority: data.priority || 'normal',
            requested_by: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...(old || []),
        ]);
        
        return { previous, taskId: tId };
      },
      onError: (err, vars, context) => {
        // Rollback on error
        if (context?.previous) {
          queryClient.setQueryData(['agentRequests', planId, context.taskId], context.previous);
        }
      },
      onSettled: (_, __, { taskId: tId }) => {
        // Always refetch after mutation
        queryClient.invalidateQueries(['agentRequests', planId, tId]);
        queryClient.invalidateQueries(['agentRequests', planId, 'all']);
      },
    }
  );
}


// Hook to subscribe to agent WebSocket events and refresh queries
export function useAgentRequestEvents(planId: string) {
  const queryClient = useQueryClient();

  // Listen for agent.requested events
  useWebSocketEvent(AGENT_EVENTS.REQUESTED, (message) => {
    if (message.payload?.plan_id === planId) {
      queryClient.invalidateQueries(['agentRequests', planId]);
    }
  }, [planId, queryClient]);

  // Listen for agent.response events
  useWebSocketEvent(AGENT_EVENTS.RESPONSE, (message) => {
    if (message.payload?.plan_id === planId) {
      queryClient.invalidateQueries(['agentRequests', planId]);
      // Also invalidate specific task query if task_id is present
      if (message.payload?.task_id) {
        queryClient.invalidateQueries(['agentRequests', planId, message.payload.task_id]);
      }
    }
  }, [planId, queryClient]);

  // Listen for agent.failed events
  useWebSocketEvent(AGENT_EVENTS.FAILED, (message) => {
    if (message.payload?.plan_id === planId) {
      queryClient.invalidateQueries(['agentRequests', planId]);
    }
  }, [planId, queryClient]);
}
