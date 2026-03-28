/**
 * Nodes Service — extracted from api.ts
 *
 * All node-related API calls: CRUD, status, move, assignments, agent ops.
 */
import { ApiResponse, PlanNode } from '../types';
import { request } from './api';

/** Flatten hierarchical node structure into flat array */
const flattenNodes = (nodes: any[]): PlanNode[] => {
  if (!nodes || !Array.isArray(nodes)) return [];

  return nodes.reduce<PlanNode[]>((acc, node) => {
    if (!node) return acc;

    const { children, ...nodeWithoutChildren } = node;
    acc.push(nodeWithoutChildren as PlanNode);

    if (children && Array.isArray(children) && children.length > 0) {
      acc.push(...flattenNodes(children));
    }

    return acc;
  }, []);
};

export const nodeService = {
  getNodes: async (planId: string) => {
    try {
      const response = await request<any>({
        method: 'GET',
        url: `/plans/${planId}/nodes`,
        params: { include_root: 'true' },
      });
      console.log('[nodes.service] Raw response received for getNodes:', JSON.stringify(response));

      const responseBody = response;

      if (!responseBody || !Array.isArray(responseBody)) {
        console.error('[nodes.service] getNodes: Response body is not a valid array!', responseBody);
        return { data: [], status: 500, message: 'Invalid response format' };
      }

      if (responseBody.length === 0) {
        console.log('[nodes.service] getNodes: API returned an empty array.');
        return { data: [], status: 200 };
      }

      const hasHierarchy = responseBody.some((item: any) =>
        item && item.children && Array.isArray(item.children)
      );
      console.log('[nodes.service] getNodes: Has hierarchy?', hasHierarchy);

      if (hasHierarchy) {
        console.log('[nodes.service] getNodes: Flattening hierarchical data...');
        const flattened = flattenNodes(responseBody);
        console.log('[nodes.service] getNodes: Flattened data length:', flattened.length);
        return { data: flattened, status: 200 };
      }

      console.log('[nodes.service] getNodes: Returning data as is (non-hierarchical).');
      return { data: responseBody, status: 200 };

    } catch (error: any) {
      console.error('[nodes.service] CATCH block in getNodes:', error);
      return { data: [], status: error?.response?.status || 500, message: error.message || 'Error fetching nodes' };
    }
  },

  getNode: async (planId: string, nodeId: string) => {
    console.log(`[nodes.service] getNode: fetching node ${nodeId} from plan ${planId}`);
    try {
      const response = await request<PlanNode>({
        method: 'GET',
        url: `/plans/${planId}/nodes/${nodeId}`,
      });

      console.log('[nodes.service] getNode: Got individual node response', response);

      if (response) {
        return { data: response, status: 200 };
      } else {
        console.error('[nodes.service] getNode: No node data in response');
        throw new Error('Node not found');
      }
    } catch (error: any) {
      console.error('[nodes.service] getNode ERROR:', error);
      throw error;
    }
  },

  createNode: async (planId: string, data: Partial<PlanNode>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating node with data:', data);
    }

    return request<ApiResponse<PlanNode>>({
      method: 'POST',
      url: `/plans/${planId}/nodes`,
      data,
    });
  },

  updateNode: async (planId: string, nodeId: string, data: Partial<PlanNode>) => {
    return request<ApiResponse<PlanNode>>({
      method: 'PUT',
      url: `/plans/${planId}/nodes/${nodeId}`,
      data,
    });
  },

  updateNodeStatus: async (planId: string, nodeId: string, status: string) => {
    return request<ApiResponse<PlanNode>>({
      method: 'PUT',
      url: `/plans/${planId}/nodes/${nodeId}/status`,
      data: { status },
    });
  },

  deleteNode: async (planId: string, nodeId: string) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/plans/${planId}/nodes/${nodeId}`,
    });
  },

  getNodeContext: async (planId: string, nodeId: string) => {
    return request<any>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/context`,
    });
  },

  getNodeAncestry: async (planId: string, nodeId: string) => {
    return request<any>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/ancestry`,
    });
  },

  moveNode: async (planId: string, nodeId: string, data: { parent_id?: string | null; order_index?: number }) => {
    return request<ApiResponse<PlanNode>>({
      method: 'POST',
      url: `/plans/${planId}/nodes/${nodeId}/move`,
      data,
    });
  },

  getNodeAssignments: async (planId: string, nodeId: string) => {
    return request<any[]>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/assignments`,
    });
  },

  assignUserToNode: async (planId: string, nodeId: string, userId: string) => {
    return request<any>({
      method: 'POST',
      url: `/plans/${planId}/nodes/${nodeId}/assign`,
      data: { user_id: userId },
    });
  },

  unassignUserFromNode: async (planId: string, nodeId: string, userId: string) => {
    return request<any>({
      method: 'DELETE',
      url: `/plans/${planId}/nodes/${nodeId}/unassign`,
      data: { user_id: userId },
    });
  },

  assignAgent: async (planId: string, nodeId: string, agentId: string) => {
    return request<any>({
      method: 'POST',
      url: `/plans/${planId}/nodes/${nodeId}/assign-agent`,
      data: { agent_id: agentId },
    });
  },

  unassignAgent: async (planId: string, nodeId: string) => {
    return request<any>({
      method: 'DELETE',
      url: `/plans/${planId}/nodes/${nodeId}/assign-agent`,
    });
  },

  clearAgentRequest: async (planId: string, nodeId: string) => {
    return request<any>({
      method: 'DELETE',
      url: `/plans/${planId}/nodes/${nodeId}/request-agent`,
    });
  },

  getSuggestedAgents: async (planId: string, nodeId: string, tags?: string) => {
    return request<{ agents: Array<{ id: string; name: string; email: string; avatar_url: string; capability_tags: string[] }> }>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/suggested-agents`,
      params: tags ? { tags } : undefined,
    });
  },

  getNodeActivities: async (planId: string, nodeId: string) => {
    return request<any[]>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/activities`,
    });
  },
};
