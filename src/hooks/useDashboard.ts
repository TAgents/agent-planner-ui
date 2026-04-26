import { useQuery } from 'react-query';
import {
  dashboardApi,
  DashboardSummary,
  PendingItems,
  DashboardPlan,
  DashboardGoal,
  PendingDecision,
  PendingAgentRequest,
} from '../services/api';

// Hooks
export const useDashboardSummary = () => {
  return useQuery<DashboardSummary>('dashboardSummary', dashboardApi.getSummary, {
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  });
};

export const usePendingItems = (limit: number = 5) => {
  return useQuery<PendingItems>(
    ['pendingItems', limit],
    () => dashboardApi.getPending(limit),
    {
      staleTime: 30000,
      refetchInterval: 60000,
    }
  );
};

export const useRecentPlans = (limit: number = 6) => {
  return useQuery<{ plans: DashboardPlan[] }>(
    ['recentPlans', limit],
    () => dashboardApi.getRecentPlans(limit),
    {
      staleTime: 30000,
    }
  );
};

export const useActiveGoals = (limit: number = 5) => {
  return useQuery<{ goals: DashboardGoal[] }>(
    ['activeGoals', limit],
    () => dashboardApi.getActiveGoals(limit),
    {
      staleTime: 30000,
    }
  );
};

export const useVelocity = () => {
  return useQuery<{ series: Array<{ date: string; count: number }>; total: number; days: number }>(
    ['velocity'],
    () => dashboardApi.getVelocity(),
    {
      staleTime: 60_000,
      refetchInterval: 5 * 60_000,
    }
  );
};

export const useCoherence = () => {
  return useQuery(
    ['coherence', 'summary'],
    () => dashboardApi.getCoherence(),
    {
      staleTime: 60_000,
      refetchInterval: 2 * 60_000,
    }
  );
};

// Re-export types for convenience
export type {
  DashboardSummary,
  PendingDecision,
  PendingAgentRequest,
  PendingItems,
  DashboardPlan as RecentPlan,
  DashboardGoal as ActiveGoal,
};
