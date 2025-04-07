import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse, Plan, PlanNode, Comment, Activity, Log, Artifact } from '../types';
import API_CONFIG from '../config/api.config';
import { decodeToken } from '../utils/tokenHelper';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseClient = createClient(
  API_CONFIG.SUPABASE_URL,
  API_CONFIG.SUPABASE_ANON_KEY
);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
  timeout: API_CONFIG.TIMEOUT,
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Get session from localStorage
    const sessionStr = localStorage.getItem('supabase_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && session.access_token) {
          console.log('Setting Authorization header with Supabase token');
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      } catch (e) {
        console.error('Failed to parse session', e);
      }
    } else {
      console.warn('No Supabase session found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('supabase_session');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// A helper function to debug API calls during development
const debugApiCall = (method: string, url: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔶 API ${method}: ${API_CONFIG.BASE_URL}${url}`, data || '');
    console.log('Headers:', {
      'Authorization': localStorage.getItem('supabase_session') ? 'Bearer [TOKEN]' : 'None',
      'Content-Type': 'application/json'
    });
  }
};

// Generic request function
const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    // Debug API call
    debugApiCall(config.method?.toUpperCase() || 'GET', config.url || '', config.data);
    
    const response: AxiosResponse<T> = await api(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
    throw error;
  }
};

// Authentication endpoints
export const authService = {
  login: async (email: string, password: string) => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
  email,
  password,
  });
  
  if (error) throw new Error(error.message);
  
    // Store the session in localStorage
    localStorage.setItem('supabase_session', JSON.stringify(data.session));
    
  return {
  status: 200,
  data: {
    user: data.user,
      session: data.session
      }
    };
  },
  
  register: async (email: string, password: string, name: string) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) throw new Error(error.message);
    
    if (data.session) {
      localStorage.setItem('supabase_session', JSON.stringify(data.session));
    }
    
    return {
      status: 201,
      data: {
        user: data.user,
        session: data.session
      }
    };
  },
  
  logout: () => {
    // Clear session from localStorage
    localStorage.removeItem('supabase_session');
    
    // Sign out from Supabase
    supabaseClient.auth.signOut();
    
    // Also call the API endpoint
    return request<{message: string}>({
      method: 'POST',
      url: '/auth/logout',
    }).catch(() => {
      // Even if the API call fails, consider the logout successful
      return { message: 'Logged out successfully' };
    });
  },
};

// Plans endpoints
export const planService = {
  getPlans: async (page = 1, limit = 10, status?: string) => {
    // Use a more generic type to handle both array and paginated responses
    return request<any>({
      method: 'GET',
      url: '/plans',
      params: { page, limit, status },
    });
  },
  
  getPlan: async (planId: string) => {
    // Use a more generic type to handle both response formats
    return request<any>({
      method: 'GET',
      url: `/plans/${planId}`,
    });
  },
  
  createPlan: async (data: Partial<Plan>) => {
    // Use a more generic type to handle both response formats
    return request<any>({
      method: 'POST',
      url: '/plans',
      data,
    });
  },
  
  updatePlan: async (planId: string, data: Partial<Plan>) => {
    return request<ApiResponse<Plan>>({
      method: 'PUT',
      url: `/plans/${planId}`,
      data,
    });
  },
  
  deletePlan: async (planId: string) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/plans/${planId}`,
    });
  },
};

// Helper function to flatten hierarchical node structure
const flattenNodes = (nodes: any[]): PlanNode[] => {
  if (!nodes || !Array.isArray(nodes)) return [];
  
  return nodes.reduce<PlanNode[]>((acc, node) => {
    if (!node) return acc;
    
    // Extract children array
    const { children, ...nodeWithoutChildren } = node;
    
    // Add the node itself (without children property)
    acc.push(nodeWithoutChildren as PlanNode);
    
    // Recursively process children
    if (children && Array.isArray(children) && children.length > 0) {
      acc.push(...flattenNodes(children));
    }
    
    return acc;
  }, []);
};

// Nodes endpoints
export const nodeService = {
  getNodes: async (planId: string) => {
    try {
      const response = await request<any>({
        method: 'GET',
        url: `/plans/${planId}/nodes`,
      });
      console.log('[api.ts] Raw response received for getNodes:', JSON.stringify(response));

      // Assuming 'response' is the actual body, e.g., [{...}]
      const responseBody = response;

      if (!responseBody || !Array.isArray(responseBody)) {
        console.error('[api.ts] getNodes: Response body is not a valid array!', responseBody);
        return { data: [], status: 500, message: 'Invalid response format' };
      }

      if (responseBody.length === 0) {
        console.log('[api.ts] getNodes: API returned an empty array.');
        return { data: [], status: 200 };
      }

      // Check for hierarchy (should be true)
      const hasHierarchy = responseBody.some((item: any) => 
        item && item.children && Array.isArray(item.children)
      );
      console.log('[api.ts] getNodes: Has hierarchy?', hasHierarchy);

      if (hasHierarchy) {
        console.log('[api.ts] getNodes: Flattening hierarchical data...');
        const flattened = flattenNodes(responseBody);
        console.log('[api.ts] getNodes: Flattened data length:', flattened.length);
        return { data: flattened, status: 200 };
      }

      console.log('[api.ts] getNodes: Returning data as is (non-hierarchical).');
      return { data: responseBody, status: 200 };

    } catch (error: any) {
      console.error('[api.ts] CATCH block in getNodes:', error);
      return { data: [], status: error?.response?.status || 500, message: error.message || 'Error fetching nodes' };
    }
  },
  
  getNode: async (planId: string, nodeId: string) => {
    console.log(`[api.ts] getNode: fetching node ${nodeId} from plan ${planId}`);
    try {
      // Instead of using the dedicated endpoint, let's fetch all nodes and filter
      const allNodesResponse = await request<any>({
        method: 'GET',
        url: `/plans/${planId}/nodes`,
      });
      
      console.log('[api.ts] getNode: Got all nodes response', allNodesResponse);
      
      // Process the response based on its structure
      let nodes: PlanNode[] = [];
      
      if (Array.isArray(allNodesResponse)) {
        // Direct array response
        nodes = flattenNodes(allNodesResponse);
      } else if (allNodesResponse && allNodesResponse.data) {
        // Response with data property
        nodes = Array.isArray(allNodesResponse.data) 
          ? flattenNodes(allNodesResponse.data)
          : [];
      }
      
      // Find the specific node
      const targetNode = nodes.find((node: PlanNode) => node.id === nodeId);
      
      if (targetNode) {
        console.log('[api.ts] getNode: Found node:', targetNode.id);
        return { data: targetNode, status: 200 };
      } else {
        console.error('[api.ts] getNode: Node not found among', nodes.length, 'nodes');
        throw new Error('Node not found');
      }
    } catch (error: any) {
      console.error('[api.ts] getNode ERROR:', error);
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
};

// Comments endpoints
export const commentService = {
  getComments: async (planId: string, nodeId: string) => {
    return request<ApiResponse<Comment[]>>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/comments`,
    });
  },
  
  addComment: async (planId: string, nodeId: string, content: string, commentType: string = 'human') => {
    return request<ApiResponse<Comment>>({
      method: 'POST',
      url: `/plans/${planId}/nodes/${nodeId}/comments`,
      data: { content, comment_type: commentType },
    });
  },
};

// Activity endpoints
export const activityService = {
  getActivityFeed: async (page = 1, limit = 20) => {
    return request<PaginatedResponse<Activity>>({
      method: 'GET',
      url: '/activity/feed',
      params: { page, limit },
    });
  },
  
  getPlanActivity: async (planId: string, page = 1, limit = 20) => {
    return request<PaginatedResponse<Activity>>({
      method: 'GET',
      url: `/plans/${planId}/activity`,
      params: { page, limit },
    });
  },
};

// Search endpoints
export const searchService = {
  globalSearch: async (query: string) => {
    return request<ApiResponse<any>>({
      method: 'GET',
      url: '/search',
      params: { q: query },
    });
  },
  
  searchPlan: async (planId: string, query: string) => {
    return request<ApiResponse<any>>({
      method: 'GET',
      url: `/plans/${planId}/nodes/search`,
      params: { q: query },
    });
  },
};

// Logs endpoints
export const logService = {
  getLogs: async (planId: string, nodeId: string) => {
    return request<ApiResponse<Log[]>>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/logs`,
    });
  },

  addLogEntry: async (planId: string, nodeId: string, logData: { content: string; log_type: string; tags?: string[]; metadata?: object }) => {
    return request<ApiResponse<Log>>({
      method: 'POST',
      url: `/plans/${planId}/nodes/${nodeId}/detailed-log`,
      data: logData,
    });
  },
};

// Artifacts endpoints
export const artifactService = {
  getArtifacts: async (planId: string, nodeId: string) => {
    return request<ApiResponse<Artifact[]>>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/artifacts`,
    });
  },

  addArtifact: async (planId: string, nodeId: string, artifactData: { name: string; content_type: string; url: string; metadata?: object }) => {
    return request<ApiResponse<Artifact>>({
      method: 'POST',
      url: `/plans/${planId}/nodes/${nodeId}/artifacts`,
      data: artifactData,
    });
  },
};

export default {
  auth: authService,
  plans: planService,
  nodes: nodeService,
  comments: commentService,
  activity: activityService,
  search: searchService,
  logs: logService,
  artifacts: artifactService,
};
