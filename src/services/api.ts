import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse, Plan, PlanNode, Comment, Activity, Log, Artifact, ApiToken, TokenPermission } from '../types';

// API Configuration - only needs the API URL
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

console.log('API Configuration:', {
  BASE_URL: API_CONFIG.BASE_URL,
  ENV_VAR: process.env.REACT_APP_API_URL
});

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADERS,
  timeout: API_CONFIG.TIMEOUT,
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (stored after login)
    const sessionStr = localStorage.getItem('auth_session');
    console.log('Interceptor checking auth_session:', sessionStr ? 'Found' : 'Not found');
    
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        console.log('Parsed session object:', session);
        
        // Try different token field names
        let token = null;
        if (session.access_token) {
          token = session.access_token;
        } else if (session.accessToken) {
          token = session.accessToken;
        } else if (typeof session === 'string') {
          // Maybe the session IS the token
          token = session;
        }
        
        if (token) {
          console.log('Setting Authorization header with token');
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn('No token found in session. Session keys:', Object.keys(session || {}));
        }
      } catch (e) {
        console.error('Failed to parse session', e);
      }
    } else {
      console.warn('No auth_session found in localStorage');
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
      localStorage.removeItem('auth_session');
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
      'Authorization': localStorage.getItem('auth_session') ? 'Bearer [TOKEN]' : 'None',
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
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      throw new Error(message);
    }
    throw error;
  }
};

// Authentication endpoints - now using your API instead of direct Supabase
export const authService = {
  login: async (email: string, password: string) => {
    try {
      console.log('Attempting login to:', `${API_CONFIG.BASE_URL}/auth/login`);
      console.log('With credentials:', { email, password: '***' });
      
      const response = await request<{
        user: any;
        session: any;
      }>({
        method: 'POST',
        url: '/auth/login',
        data: { email, password }
      });
      
      console.log('Login response received:', response);
      
      // Store the session in localStorage
      if (response.session) {
        console.log('Storing session in localStorage');
        localStorage.setItem('auth_session', JSON.stringify(response.session));
      } else {
        console.warn('No session in response:', response);
      }
      
      return {
        status: 200,
        data: response
      };
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      throw error;
    }
  },
  
  register: async (email: string, password: string, name: string) => {
    try {
      const response = await request<{
        user: any;
        session: any;
      }>({
        method: 'POST',
        url: '/auth/register',
        data: { email, password, name }
      });
      
      // Store the session if registration is successful
      if (response.session) {
        localStorage.setItem('auth_session', JSON.stringify(response.session));
      }
      
      return {
        status: 201,
        data: response
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      // Call the API logout endpoint
      await request<{message: string}>({
        method: 'POST',
        url: '/auth/logout',
      });
    } catch (error) {
      // Even if the API call fails, clear local session
      console.error('Logout API error:', error);
    } finally {
      // Always clear local session
      localStorage.removeItem('auth_session');
      return { message: 'Logged out successfully' };
    }
  },
  
  forgotPassword: async (email: string) => {
    try {
      const response = await request<{ message: string }>({
        method: 'POST',
        url: '/auth/forgot-password',
        data: { email }
      });
      return { status: 200, data: response };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await request<{ message: string }>({
        method: 'POST',
        url: '/auth/reset-password',
        data: { token, password }
      });
      return { status: 200, data: response };
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
  
  verifyEmail: async (token: string) => {
    try {
      const response = await request<{ message: string; user: any }>({
        method: 'POST',
        url: '/auth/verify-email',
        data: { token }
      });
      return { status: 200, data: response };
    } catch (error: any) {
      console.error('Verify email error:', error);
      throw error;
    }
  },
  
  resendVerification: async (email: string) => {
    try {
      const response = await request<{ message: string }>({
        method: 'POST',
        url: '/auth/resend-verification',
        data: { email }
      });
      return { status: 200, data: response };
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw error;
    }
  },
  
  getProfile: async () => {
    try {
      const response = await request<any>({
        method: 'GET',
        url: '/auth/profile'
      });
      return { status: 200, data: response };
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
  
  updateProfile: async (data: { name?: string; organization?: string; avatar_url?: string }) => {
    try {
      const response = await request<any>({
        method: 'PUT',
        url: '/auth/profile',
        data
      });
      return { status: 200, data: response };
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await request<{ message: string }>({
        method: 'POST',
        url: '/auth/change-password',
        data: { currentPassword, newPassword }
      });
      return { status: 200, data: response };
    } catch (error: any) {
      console.error('Change password error:', error);
      throw error;
    }
  },
  
  uploadAvatar: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post<{ message: string; avatar_url: string }>(
        '/upload/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return { status: 200, data: response.data };
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  },
  
  deleteAvatar: async () => {
    try {
      const response = await request<{ message: string }>({
        method: 'DELETE',
        url: '/upload/avatar'
      });
      return { status: 200, data: response };
    } catch (error: any) {
      console.error('Delete avatar error:', error);
      throw error;
    }
  },
};

// Plans endpoints
export const planService = {
  getPlans: async (page = 1, limit = 10, status?: string) => {
    // Use a more generic type to handle both array and paginated responses
    // Make sure we're sending the status parameter correctly
    const params: Record<string, any> = { page, limit };
    
    // Only add status param if it's defined
    if (status) {
      params.status = status;
    }

    console.log('Getting plans with params:', params);
    
    return request<any>({
      method: 'GET',
      url: '/plans',
      params,
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
      url: `/activity/plans/${planId}/activity`,
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
  
  // New comprehensive plan search endpoint
  searchPlanContents: async (planId: string, query: string) => {
    console.log(`[api.ts] Searching plan ${planId} for: ${query}`);
    return request<ApiResponse<{
      query: string;
      results: Array<{
        id: string;
        type: string;
        title: string;
        content: string;
        created_at: string;
        user_id: string;
      }>;
      count: number;
    }>>({
      method: 'GET',
      url: `/search/plan/${planId}`,
      params: { query },
    });
  },
};

// Logs endpoints
export const logService = {
  getLogs: async (planId: string, nodeId: string) => {
    console.log(`[api.ts] Getting logs for plan=${planId}, node=${nodeId}`);
    try {
      // First check if the node exists by getting node details
      const nodeResp = await request<any>({
        method: 'GET',
        url: `/plans/${planId}/nodes/${nodeId}`,
      });
      
      console.log('[api.ts] Node exists, fetching logs');
      
      // Now get the logs
      const response = await request<any>({
        method: 'GET',
        url: `/plans/${planId}/nodes/${nodeId}/logs`,
      });
      console.log('[api.ts] Logs API response:', response);
      return response;
    } catch (error) {
      console.error('[api.ts] Error fetching logs:', error);
      // Return empty array instead of throwing to handle errors gracefully
      return [];
    }
  },

  addLogEntry: async (planId: string, nodeId: string, logData: { content: string; log_type: string; tags?: string[]; metadata?: object }) => {
    console.log(`[api.ts] Adding log entry for plan=${planId}, node=${nodeId}:`, logData);
    try {
      const response = await request<ApiResponse<Log>>({
        method: 'POST',
        url: `/plans/${planId}/nodes/${nodeId}/log`,
        data: logData,
      });
      console.log('[api.ts] Add log response:', response);
      return response;
    } catch (error) {
      console.error('[api.ts] Error adding log entry:', error);
      throw error;
    }
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

  getArtifact: async (planId: string, nodeId: string, artifactId: string) => {
    return request<ApiResponse<Artifact>>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/artifacts/${artifactId}`,
    });
  },

  updateArtifact: async (planId: string, nodeId: string, artifactId: string, artifactData: { name?: string; content_type?: string; url?: string; metadata?: object }) => {
    return request<ApiResponse<Artifact>>({
      method: 'PUT',
      url: `/plans/${planId}/nodes/${nodeId}/artifacts/${artifactId}`,
      data: artifactData,
    });
  },

  deleteArtifact: async (planId: string, nodeId: string, artifactId: string) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/plans/${planId}/nodes/${nodeId}/artifacts/${artifactId}`,
    });
  },
};

// Debug endpoints
export const debugService = {
  debugTokens: async () => {
    console.log('Calling debug tokens endpoint...');
    try {
      const result = await request<any>({
        method: 'GET',
        url: '/debug/tokens',
      });
      console.log('Debug tokens response:', result);
      return result;
    } catch (error) {
      console.error('Error in debugService.debugTokens:', error);
      throw error;
    }
  },
};

// API Tokens endpoints
export const tokenService = {
  getTokens: async () => {
    console.log('Fetching tokens from API...');
    try {
      const result = await request<ApiToken[] | ApiResponse<ApiToken[]>>({ 
        method: 'GET',
        url: '/tokens',
      });
      console.log('Raw API response for getTokens:', result);
      return result;
    } catch (error) {
      console.error('Error in tokenService.getTokens:', error);
      throw error;
    }
  },
  
  createToken: async (name: string, permissions?: TokenPermission[]) => {
    console.log('Creating token with name:', name, 'permissions:', permissions);
    try {
      const result = await request<ApiToken | ApiResponse<ApiToken>>({ 
        method: 'POST',
        url: '/tokens',
        data: { name, permissions },
      });
      console.log('Raw API response for createToken:', result);
      return result;
    } catch (error) {
      console.error('Error in tokenService.createToken:', error);
      throw error;
    }
  },
  
  revokeToken: async (tokenId: string) => {
    console.log('Revoking token:', tokenId);
    try {
      const result = await request<any>({  
        method: 'DELETE',
        url: `/tokens/${tokenId}`,
      });
      console.log('Raw API response for revokeToken:', result);
      return result;
    } catch (error) {
      console.error('Error in tokenService.revokeToken:', error);
      throw error;
    }
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
  tokens: tokenService,
  debug: debugService,
};
