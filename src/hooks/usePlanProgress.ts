import { useQuery } from 'react-query';
import api from '../services/api';

interface PlanProgress {
  total_nodes: number;
  completed_nodes: number;
  in_progress_nodes: number;
  blocked_nodes: number;
  completion_percentage: number;
}

export const usePlanProgress = (planId: string) => {
  return useQuery<PlanProgress>(
    ['plan-progress', planId],
    () => api.plans.getPlanProgress(planId),
    {
      enabled: !!planId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry if endpoint doesn't exist yet
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    }
  );
};

export default usePlanProgress;
