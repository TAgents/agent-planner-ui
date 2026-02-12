import { useQuery } from 'react-query';
import { activityService } from '../services/api';

export interface RecentActivityItem {
  id: string;
  type?: string;
  description: string;
  content?: string;
  created_at: string;
  plan_id?: string;
  plan_title?: string;
  node_id?: string;
  node_title?: string;
  user?: {
    id: string;
    name: string;
  };
  metadata?: Record<string, any>;
}

interface ActivityFeedItem {
  id: string;
  type?: string;
  content?: string;
  activity_type?: string;
  created_at: string;
  user?: { id: string; name: string; email?: string };
  node?: { id: string; title: string; node_type?: string };
  plan?: { id: string; title: string };
}

const mapActivity = (a: ActivityFeedItem): RecentActivityItem => ({
  id: a.id,
  type: a.activity_type || a.type,
  description: a.content || '',
  content: a.content,
  created_at: a.created_at,
  plan_id: a.plan?.id,
  plan_title: a.plan?.title,
  node_id: a.node?.id,
  node_title: a.node?.title,
  user: a.user,
});

export const useRecentActivity = (limit: number = 10) => {
  return useQuery<RecentActivityItem[]>(
    ['recentActivity', limit],
    async (): Promise<RecentActivityItem[]> => {
      try {
        const response: any = await activityService.getActivityFeed(1, limit);
        // API returns { activities: [...], pagination: {...} }
        const items = response?.activities || response?.data || [];
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
