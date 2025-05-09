// src/hooks/usePlanActivity.ts
import { useQuery } from 'react-query';
import { activityService } from '../services/api';
import { PaginatedResponse, Activity } from '../types'; // Adjust Activity type if needed

export const usePlanActivity = (planId: string, page = 1, limit = 5, options = {}) => {
  const queryKey = ['planActivity', planId, page, limit];

  const { data, isLoading, error, refetch } = useQuery<PaginatedResponse<Activity>>(
    queryKey,
    () => activityService.getPlanActivity(planId, page, limit),
    {
      enabled: !!planId,
      staleTime: 60 * 1000, // 1 minute
      ...options,
    }
  );

  // Extract relevant data, provide defaults
  const activities = data?.data || [];
  const totalActivities = data?.total || 0;
  const totalPages = data?.total_pages || 0;

  return {
    activities,
    isLoading,
    error,
    refetch,
    totalActivities,
    totalPages,
    currentPage: page,
  };
};