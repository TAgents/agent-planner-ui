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
  type?: string;         // 'log' | 'comment' — the activity source
  content?: string;
  activity_type?: string; // 'progress' | 'decision' | 'challenge' | 'reasoning' — more specific
  created_at: string;
  user?: { id: string; name: string; email?: string };
  node?: { id: string; title: string; node_type?: string };
  plan?: { id: string; title: string };
}

interface ActivityFeedResponse {
  activities: ActivityFeedItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
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
        // API returns { activities: [...], pagination: {...} }
        const response = await activityService.getActivityFeed(1, limit) as unknown as ActivityFeedResponse;
        const items = response?.activities || [];
        if (Array.isArray(items)) {
          return items.slice(0, limit).map(mapActivity);
        }
        return [];
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching recent activity:', error);
        }
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
