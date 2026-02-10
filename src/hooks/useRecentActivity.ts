import { useQuery } from 'react-query';
import { activityService } from '../services/api';
import { Activity } from '../types';

export interface RecentActivityItem {
  id: string;
  type?: string;
  description: string;
  content?: string;
  created_at: string;
  plan_id?: string;
  plan_title?: string;
  node_id?: string;
  user?: {
    id: string;
    name: string;
  };
  metadata?: Record<string, any>;
}

const mapActivity = (a: Activity): RecentActivityItem => ({
  id: a.id,
  description: a.content || '',
  content: a.content,
  created_at: a.created_at,
  user: a.user,
});

export const useRecentActivity = (limit: number = 10) => {
  return useQuery<RecentActivityItem[]>(
    ['recentActivity', limit],
    async (): Promise<RecentActivityItem[]> => {
      try {
        const response = await activityService.getActivityFeed(1, limit);
        const items = response?.data || response || [];
        if (Array.isArray(items)) {
          return items.slice(0, limit).map(mapActivity);
        }
        return [];
      } catch {
        return [];
      }
    },
    {
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
      retry: false,
      placeholderData: [],
    }
  );
};

export default useRecentActivity;
