import { useQuery } from 'react-query';
import api from '../services/api';

export const useNodeContext = (planId: string, nodeId: string) => {
  return useQuery(
    ['node-context', planId, nodeId],
    () => api.nodes.getNodeContext(planId, nodeId),
    {
      enabled: !!planId && !!nodeId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    }
  );
};

export const useNodeAncestry = (planId: string, nodeId: string) => {
  return useQuery(
    ['node-ancestry', planId, nodeId],
    () => api.nodes.getNodeAncestry(planId, nodeId),
    {
      enabled: !!planId && !!nodeId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    }
  );
};

export const useNodeActivities = (planId: string, nodeId: string) => {
  return useQuery(
    ['node-activities', planId, nodeId],
    () => api.nodes.getNodeActivities(planId, nodeId),
    {
      enabled: !!planId && !!nodeId,
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

export default useNodeContext;
