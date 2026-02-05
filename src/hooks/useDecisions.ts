import { useQuery, useMutation, useQueryClient } from 'react-query';
import { decisionsApi, Decision } from '../services/api';

// Hook for listing decisions
export function useDecisions(
  planId: string, 
  status?: 'pending' | 'resolved' | 'cancelled' | 'expired',
  options?: { enabled?: boolean }
) {
  return useQuery(
    ['decisions', planId, status],
    () => decisionsApi.list(planId, { status }),
    {
      enabled: !!planId && (options?.enabled ?? true),
      refetchInterval: status === 'pending' ? 30000 : false, // Poll pending decisions every 30s
    }
  );
}

// Hook for getting pending decision count
export function usePendingDecisionCount(planId: string) {
  return useQuery(
    ['decisions', planId, 'pending', 'count'],
    () => decisionsApi.getPendingCount(planId),
    {
      enabled: !!planId,
      refetchInterval: 30000, // Poll every 30s
    }
  );
}

// Hook for getting a single decision
export function useDecision(planId: string, decisionId: string) {
  return useQuery(
    ['decision', planId, decisionId],
    () => decisionsApi.get(planId, decisionId),
    {
      enabled: !!planId && !!decisionId,
    }
  );
}

// Hook for resolving a decision
export function useResolveDecision(planId: string) {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ decisionId, data }: { 
      decisionId: string; 
      data: { decision: string; rationale?: string; selected_option_id?: string } 
    }) => decisionsApi.resolve(planId, decisionId, data),
    {
      onSuccess: () => {
        // Invalidate decision queries to refresh lists
        queryClient.invalidateQueries(['decisions', planId]);
        queryClient.invalidateQueries(['decision', planId]);
      },
    }
  );
}

// Hook for cancelling a decision
export function useCancelDecision(planId: string) {
  const queryClient = useQueryClient();
  
  return useMutation(
    (decisionId: string) => decisionsApi.cancel(planId, decisionId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['decisions', planId]);
        queryClient.invalidateQueries(['decision', planId]);
      },
    }
  );
}

export type { Decision };
