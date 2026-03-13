import { useQuery, useMutation, useQueryClient } from 'react-query';
import { dependencyService } from '../services/api';
import { Dependency, DependencyType } from '../types';

/**
 * Hook for fetching and managing plan dependencies
 */
export const useDependencies = (planId: string) => {
  const queryClient = useQueryClient();

  // Get user ID from session for query key
  const sessionStr = localStorage.getItem('auth_session');
  let userId = 'anonymous';
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      userId = session.user?.id || session.user?.email || 'anonymous';
    } catch (e) {
      console.error('Error parsing session:', e);
    }
  }

  // Fetch all dependencies for a plan
  const { data, isLoading, error, refetch } = useQuery(
    ['dependencies', userId, planId],
    async () => {
      if (!sessionStr) return { edges: [], count: 0 };
      return dependencyService.listPlanDependencies(planId);
    },
    {
      enabled: !!planId,
      staleTime: 30000,
    }
  );

  // Create dependency mutation
  const createDependency = useMutation(
    (params: {
      source_node_id: string;
      target_node_id: string;
      dependency_type?: DependencyType;
      weight?: number;
    }) => dependencyService.createDependency(planId, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['dependencies', userId, planId]);
        queryClient.invalidateQueries(['criticalPath', userId, planId]);
      },
    }
  );

  // Delete dependency mutation
  const deleteDependency = useMutation(
    (depId: string) => dependencyService.deleteDependency(planId, depId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['dependencies', userId, planId]);
        queryClient.invalidateQueries(['criticalPath', userId, planId]);
      },
    }
  );

  return {
    dependencies: (data?.edges || []) as Dependency[],
    dependencyCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    createDependency,
    deleteDependency,
  };
};

/**
 * Hook for fetching the critical path of a plan
 */
export const useCriticalPath = (planId: string, enabled = true) => {
  const sessionStr = localStorage.getItem('auth_session');
  let userId = 'anonymous';
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      userId = session.user?.id || session.user?.email || 'anonymous';
    } catch (e) { /* ignore */ }
  }

  const { data, isLoading, error, refetch } = useQuery(
    ['criticalPath', userId, planId],
    () => dependencyService.getCriticalPath(planId),
    {
      enabled: !!planId && enabled,
      staleTime: 60000,
    }
  );

  return {
    criticalPath: data,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for impact analysis of a specific node
 */
export const useImpactAnalysis = (planId: string, nodeId: string, scenario: 'delay' | 'block' | 'remove' = 'block') => {
  const sessionStr = localStorage.getItem('auth_session');
  let userId = 'anonymous';
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      userId = session.user?.id || session.user?.email || 'anonymous';
    } catch (e) { /* ignore */ }
  }

  const { data, isLoading, error, refetch } = useQuery(
    ['impact', userId, planId, nodeId, scenario],
    () => dependencyService.getImpact(planId, nodeId, scenario),
    {
      enabled: !!planId && !!nodeId,
      staleTime: 30000,
    }
  );

  return {
    impact: data,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching dependencies of a specific node (upstream and downstream)
 */
export const useNodeDependencies = (planId: string, nodeId: string, enabled = true) => {
  const sessionStr = localStorage.getItem('auth_session');
  let userId = 'anonymous';
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      userId = session.user?.id || session.user?.email || 'anonymous';
    } catch (e) { /* ignore */ }
  }

  const { data, isLoading, error, refetch } = useQuery(
    ['nodeDependencies', userId, planId, nodeId],
    () => dependencyService.listNodeDependencies(planId, nodeId, 'both'),
    {
      enabled: !!planId && !!nodeId && enabled,
      staleTime: 30000,
    }
  );

  return {
    upstream: (data?.upstream || []) as Dependency[],
    downstream: (data?.downstream || []) as Dependency[],
    isLoading,
    error,
    refetch,
  };
};
