import { useQuery, useMutation, useQueryClient } from 'react-query';
import { planService } from '../services/api';
import { Plan } from '../types';

/**
 * Hook for fetching and managing plans
 */
export const usePlans = (page = 1, limit = 10, status?: string) => {
  // Use React Query to fetch plans with pagination
  const { data, isLoading, error, refetch } = useQuery(
    ['plans', page, limit, status],
    async () => {
      try {
        // Check if authentication session exists
        const sessionStr = localStorage.getItem('supabase_session');
        if (!sessionStr) {
          throw new Error('No authentication session found');
        }

        console.log('Fetching plans with authentication');
        const response = await planService.getPlans(page, limit, status);
        console.log('Plans API response:', response);
        return response;
      } catch (err) {
        console.error('Error fetching plans:', err);
        throw err;
      }
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3, // Retry 3 times on failure
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    }
  );

  const queryClient = useQueryClient();

  // Mutation for creating a new plan
  const createPlan = useMutation(
    (newPlan: Partial<Plan>) => planService.createPlan(newPlan),
    {
      onSuccess: (response) => {
        // Invalidate plans query to refetch the list
        queryClient.invalidateQueries('plans');
        
        // Extract plan ID from different response formats
        let planId;
        if (response.data && response.data.id) {
          // API Response structure
          planId = response.data.id;
        } else if (response.id) {
          // Direct plan object structure
          planId = response.id;
        }
        
        if (planId) {
          queryClient.invalidateQueries(['plan', planId]);
        }
      },
    }
  );

  // Mutation for updating a plan
  const updatePlan = useMutation(
    ({ planId, data }: { planId: string; data: Partial<Plan> }) => 
      planService.updatePlan(planId, data),
    {
      onSuccess: (data) => {
        // Update the plan in the cache
        queryClient.invalidateQueries('plans');
        queryClient.invalidateQueries(['plan', data.data.id]);
      },
    }
  );

  // Mutation for deleting a plan
  const deletePlan = useMutation(
    (planId: string) => planService.deletePlan(planId),
    {
      onSuccess: () => {
        // Invalidate plans query to refetch the list
        queryClient.invalidateQueries('plans');
      },
    }
  );

  // Handle both paginated responses and array responses
  const isArray = Array.isArray(data);
  
  // If data is an array, convert it to paginated format
  const paginatedData = isArray ? {
    data: data,
    total: data?.length || 0,
    page: page,
    page_size: limit,
    total_pages: Math.ceil((data?.length || 0) / limit)
  } : data;
  
  // Ensure we have plans data to process
  let plansWithProgress = [];
  if (paginatedData?.data) {
    plansWithProgress = paginatedData.data.map((plan: Plan) => {
      // If plan already has progress, use it, otherwise set to 0 for now
      // In a real implementation, we'd calculate this based on nodes completion
      // We would need to fetch nodes for each plan and calculate progress
      return {
        ...plan,
        progress: typeof plan.progress === 'number' ? plan.progress : 0
      };
    });
  }
  
  return {
    plans: plansWithProgress,
    total: paginatedData?.total || 0,
    totalPages: paginatedData?.total_pages || 0,
    currentPage: paginatedData?.page || 1,
    isLoading,
    error,
    refetch,
    createPlan,
    updatePlan,
    deletePlan,
  };
};

/**
 * Hook for fetching a single plan
 */
export const usePlan = (planId: string) => {
  // Use React Query to fetch a single plan
  const { data, isLoading, error, refetch } = useQuery(
    ['plan', planId],
    async () => {
      try {
        // Check if authentication session exists
        const sessionStr = localStorage.getItem('supabase_session');
        if (!sessionStr) {
          throw new Error('No authentication session found');
        }

        console.log(`Fetching plan ${planId} with authentication`);
        const response = await planService.getPlan(planId);
        console.log('Plan API response:', response);
        return response;
      } catch (err) {
        console.error(`Error fetching plan ${planId}:`, err);
        throw err;
      }
    },
    {
      enabled: !!planId, // Only run if planId is provided
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3, // Retry 3 times on failure
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    }
  );

  // Handle both API response formats
  let planData = data;
  
  // Handle various response formats
  if (data) {
    if (data.data) {
      // It's already in ApiResponse format
      planData = data;
    } else if (data.id) {
      // It's a direct plan object
      planData = {
        data: data,
        status: 200
      };
    }
  }

  // Log only when explicitly enabled
  if (window.DEBUG_ENABLED) {
    console.log('Plan data:', planData);
  }

  return {
    plan: planData?.data,
    isLoading,
    error,
    refetch,
  };
};
