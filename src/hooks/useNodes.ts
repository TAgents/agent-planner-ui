import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useMemo } from 'react';
import { nodeService } from '../services/api';
import { PlanNode, FlowNode, FlowEdge } from '../types';
import { transformToFlowNodes, createFlowEdges } from '../utils/planUtils';
import 'reactflow/dist/style.css';

/**
 * Hook for fetching and managing plan nodes
 */
export const useNodes = (planId: string) => {
  const queryClient = useQueryClient();

  // Get user ID from session to use in query key
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

  // Use React Query to fetch nodes for a plan
  // Include userId in the query key to separate cache per user
  const { data, isLoading, error, refetch } = useQuery(
    ['nodes', userId, planId],
    async () => {
      try {
        // Check if authentication session exists
        if (!sessionStr) {
          throw new Error('No authentication session found');
        }

        console.log(`Fetching nodes for plan ${planId} with authentication for user:`, userId);
        const response = await nodeService.getNodes(planId);
        console.log('Nodes API response:', response);
        return response;
      } catch (err) {
        console.error(`Error fetching nodes for plan ${planId}:`, err);
        throw err;
      }
    },
    {
      enabled: !!planId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Flatten the hierarchical tree structure
  const flattenNodes = (nodesTree: any[]): PlanNode[] => {
    if (!nodesTree || !Array.isArray(nodesTree)) return [];
    
    return nodesTree.reduce<PlanNode[]>((acc, node) => {
      if (!node) return acc;
      
      // Extract the children and create a copy of the node without the children
      const { children, ...nodeWithoutChildren } = node;
      
      // Add the current node to the flattened list
      acc.push(nodeWithoutChildren as PlanNode);
      
      // Recursively add children
      if (children && Array.isArray(children) && children.length > 0) {
        acc.push(...flattenNodes(children));
      }
      
      return acc;
    }, []);
  };

  // Memoize the nodes tree
  const nodesTree = useMemo(() => data?.data || [], [data?.data]);
  
  // Memoize flattened nodes
  const nodes = useMemo(() => flattenNodes(nodesTree), [nodesTree]);
  
  // Add debugging for node data only when explicitly enabled
  if (process.env.NODE_ENV === 'development' && window.DEBUG_ENABLED) {
    console.log('Nodes tree structure:', nodesTree);
    console.log('Flattened nodes:', nodes);
  }
  
  // Memoize flow transformations
  const flowNodes = useMemo(() => transformToFlowNodes(nodes), [nodes]);
  const flowEdges = useMemo(() => createFlowEdges(nodes), [nodes]);

  // Mutation for creating a new node
  const createNode = useMutation(
    (newNode: Partial<PlanNode>) => nodeService.createNode(planId, newNode),
    {
      onSuccess: () => {
        // Directly refetch the nodes instead of using setTimeout
        refetch();
      },
    }
  );

  // Mutation for updating a node
  const updateNode = useMutation(
    ({ nodeId, data }: { nodeId: string; data: Partial<PlanNode> }) => 
      nodeService.updateNode(planId, nodeId, data),
    {
      onSuccess: (data) => {
        // Directly refetch instead of using setTimeout
        refetch();
        // Also update the node details if it's currently selected
        if (data.data?.id) {
          queryClient.invalidateQueries(['node', userId, planId, data.data.id]);
        }
      },
    }
  );

  // Mutation for updating node status
  const updateNodeStatus = useMutation(
    ({ nodeId, status }: { nodeId: string; status: string }) => 
      nodeService.updateNodeStatus(planId, nodeId, status),
    {
      onSuccess: (data, variables) => {
        // Directly refetch instead of using setTimeout
        refetch();
        // Also invalidate the specific node query using the nodeId from variables
        queryClient.invalidateQueries(['node', userId, planId, variables.nodeId]);
        console.log('Invalidated node query for:', variables.nodeId);
      },
    }
  );

  // Mutation for deleting a node
  const deleteNode = useMutation(
    (nodeId: string) => nodeService.deleteNode(planId, nodeId),
    {
      onSuccess: () => {
        // Directly refetch instead of using setTimeout
        refetch();
      },
    }
  );

  return {
    nodes,
    flowNodes,
    flowEdges,
    isLoading,
    error,
    refetch,
    createNode,
    updateNode,
    updateNodeStatus,
    deleteNode,
  };
};

/**
 * Hook for fetching a single node
 */
export const useNode = (planId: string, nodeId: string) => {
  // Get user ID from session to use in query key
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

  // Use React Query to fetch a single node
  // Include userId in the query key to separate cache per user
  const { data, isLoading, error, refetch } = useQuery(
    ['node', userId, planId, nodeId],
    async () => {
      try {
        // Check if authentication session exists
        if (!sessionStr) {
          throw new Error('No authentication session found');
        }

        console.log(`Fetching node details for planId=${planId}, nodeId=${nodeId} with authentication for user:`, userId);
        const response = await nodeService.getNode(planId, nodeId);
        console.log('Node details API response:', response);
        return response;
      } catch (err) {
        console.error(`Error fetching node details for planId=${planId}, nodeId=${nodeId}:`, err);
        throw err;
      }
    },
    {
      enabled: !!planId && !!nodeId,
      staleTime: 0, // Always fetch fresh data when switching nodes
      cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
      retry: 2, // Retry twice if the request fails
      retryDelay: 1000, // Wait 1 second between retries
      refetchOnWindowFocus: false,
      refetchOnMount: 'always', // Always refetch when component mounts
      onSuccess: (data) => {
        console.log('Node details fetched successfully:', data?.data?.id);
      },
      onError: (err) => {
        console.error('Error fetching node details:', err);
      }
    }
  );

  // Add debug info only when explicitly enabled
  if (window.DEBUG_ENABLED) {
    console.log('useNode hook result:', {
      hasData: !!data,
      dataObject: data?.data ? true : false,
      isLoading,
      hasError: !!error
    });
  }

  return {
    node: data?.data,
    isLoading,
    error,
    refetch,
  };
};
