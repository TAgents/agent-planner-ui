import { useQuery } from 'react-query';
import api from '../services/api';

interface ActivityTimelineEvent {
  id: string;
  type: string;
  description: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  metadata?: Record<string, any>;
}

export const useActivityTimeline = (planId: string) => {
  return useQuery<ActivityTimelineEvent[]>(
    ['activity-timeline', planId],
    () => api.activity.getPlanTimeline(planId),
    {
      enabled: !!planId,
      staleTime: 1 * 60 * 1000, // 1 minute
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

export const useNodeActivity = (planId: string, nodeId: string) => {
  return useQuery<ActivityTimelineEvent[]>(
    ['node-activity', planId, nodeId],
    () => api.activity.getNodeActivity(planId, nodeId),
    {
      enabled: !!planId && !!nodeId,
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 2 * 60 * 1000, // 2 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    }
  );
};

export default useActivityTimeline;
