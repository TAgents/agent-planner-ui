import { useQuery, useMutation, useQueryClient } from 'react-query';
import { agentRequestApi, webhookApi, AgentRequest, WebhookConfig } from '../services/api';

export type { AgentRequest, WebhookConfig };

// Hook for listing agent requests for a task
export function useTaskAgentRequests(planId: string, taskId: string, options?: { enabled?: boolean }) {
  return useQuery(
    ['agentRequests', planId, taskId],
    () => agentRequestApi.listForTask(planId, taskId),
    {
      enabled: !!planId && !!taskId && (options?.enabled ?? true),
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
      refetchInterval: 30000,
    }
  );
}

// Hook for creating an agent request
export function useCreateAgentRequest(planId: string) {
  const queryClient = useQueryClient();

  return useMutation(
    ({ taskId, data }: {
      taskId: string;
      data: {
        request_type: 'execute' | 'review' | 'plan' | 'custom';
        prompt?: string;
        priority?: 'normal' | 'urgent';
      };
    }) => agentRequestApi.create(planId, taskId, data),
    {
      onSuccess: (_, { taskId }) => {
        queryClient.invalidateQueries(['agentRequests', planId, taskId]);
        queryClient.invalidateQueries(['agentRequests', planId, 'all']);
      },
    }
  );
}

// Hook for webhook config
export function useWebhookConfig(planId: string) {
  return useQuery(
    ['webhook', planId],
    () => webhookApi.get(planId),
    {
      enabled: !!planId,
    }
  );
}

// Hook for updating webhook config
export function useUpdateWebhookConfig(planId: string) {
  const queryClient = useQueryClient();

  return useMutation(
    (config: Partial<WebhookConfig>) => webhookApi.update(planId, config),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['webhook', planId]);
      },
    }
  );
}

// Hook for testing webhook
export function useTestWebhook(planId: string) {
  return useMutation(
    () => webhookApi.test(planId)
  );
}
