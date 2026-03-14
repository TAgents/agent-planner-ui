import { useQuery } from 'react-query';
import { axiosInstance } from '../services/api';

export interface BottleneckNode {
  node_id: string;
  title: string;
  status: string;
  downstream_count: number;
  blocked_tasks: number;
}

export function useBottlenecks(planId: string) {
  const sessionStr = localStorage.getItem('auth_session');
  let userId = 'anonymous';
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      userId = session.user?.id || session.user?.email || 'anonymous';
    } catch (e) {
      // ignore
    }
  }

  return useQuery<BottleneckNode[]>(
    ['bottlenecks', userId, planId],
    async () => {
      const response = await axiosInstance.get(`/plans/${planId}/bottlenecks`);
      return response.data?.bottlenecks || response.data || [];
    },
    {
      enabled: !!planId && !!sessionStr,
      staleTime: 60000,
    }
  );
}
