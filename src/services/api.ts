import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse, Plan, PlanNode, Comment, Activity } from '../types';
import API_CONFIG from '../config/api.config';
import { decodeToken } from '../utils/tokenHelper';

// Custom JWT token for development - this token is specifically formatted for the backend
// and uses the user ID from the MCP project's user-credentials.json
const DEVELOPMENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZjRlNzJiYi1lOTQ5LTQ1ODQtYmFiYi1hZWJhMTZkYTE1YTEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQzODU1NDk0LCJleHAiOjE3NDY0NDc0OTR9.778-vwxYJIVduFcp0q0Mtjsv9Jh198ezwPVYn9c6rb8';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
  timeout: API_CONFIG.TIMEOUT,
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or use the dev token
    const storedToken = localStorage.getItem('auth_token');
    const token = storedToken || DEVELOPMENT_TOKEN;
    
    if (token) {
      console.log('Setting Authorization header with token');
      config.headers.Authorization = `Bearer ${token}`;
      
      // Debug token payload
      const payload = decodeToken(token);
      console.log('Token payload:', payload);
      console.log('Token has userId:', payload?.userId ? 'Yes' : 'No');
      console.log('Token has email:', payload?.email ? 'Yes' : 'No');
    } else {
      console.warn('No auth token found in localStorage');
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
      localStorage.removeItem('auth_token');
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
      'Authorization': localStorage.getItem('auth_token') ? 'Bearer [TOKEN]' : 'None',
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
    const response = await request<ApiResponse<{ token: string }>>({
      method: 'POST',
      url: '/auth/login',
      data: { email, password },
    });
    localStorage.setItem('auth_token', response.data.token);
    return response;
  },
  
  register: async (email: string, password: string, name: string) => {
    return request<ApiResponse<{ token: string }>>({
      method: 'POST',
      url: '/auth/register',
      data: { email, password, name },
    });
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
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
    return request<ApiResponse<PlanNode>>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}`,
    });
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

export default {
  auth: authService,
  plans: planService,
  nodes: nodeService,
  comments: commentService,
  activity: activityService,
  search: searchService,
};
