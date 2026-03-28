import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse, Plan, PlanNode, Comment, Activity, Log, ApiToken, TokenPermission, Dependency, DependencyType, CriticalPathResult, ImpactAnalysis } from '../types';

// API Configuration - only needs the API URL
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    ENV_VAR: process.env.REACT_APP_API_URL
  });
}

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
    if (process.env.NODE_ENV === 'development') {
      console.log('Interceptor checking auth_session:', sessionStr ? 'Found' : 'Not found');
    }

    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (process.env.NODE_ENV === 'development') {
          console.log('Parsed session object (keys only):', Object.keys(session));
        }

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
          if (process.env.NODE_ENV === 'development') {
            console.log('Setting Authorization header with token');
          }
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Send active org context to backend
        const activeOrgId = localStorage.getItem('active_org_id');
        if (activeOrgId) {
          config.headers['X-Organization-Id'] = activeOrgId;
        }

        if (!token && process.env.NODE_ENV === 'development') {
          console.warn('No token found in session. Session keys:', Object.keys(session || {}));
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to parse session', e);
        }
      }
    } else if (process.env.NODE_ENV === 'development') {
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
    // Handle authentication errors - only redirect on protected routes
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isProtectedRoute = currentPath.startsWith('/app/') || currentPath === '/app';
      if (isProtectedRoute) {
        localStorage.removeItem('auth_session');
        window.location.href = '/login';
      }
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

// Custom error class to preserve error code from API
class ApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

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
      const code = error.response?.data?.code;
      throw new ApiError(message, code);
    }
    throw error;
  }
};

// Authentication endpoints - now using your API instead of direct Supabase
export const authService = {
  login: async (email: string, password: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting login to:', `${API_CONFIG.BASE_URL}/auth/login`);
        console.log('With credentials:', { email, password: '***' });
      }

      const response = await request<{
        user: any;
        session: any;
      }>({
        method: 'POST',
        url: '/auth/login',
        data: { email, password }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Login response received (user only):', {
          hasSession: !!response.session,
          hasUser: !!response.user,
          userEmail: response.user?.email
        });
      }

      // Store the session in localStorage (include user data for useAuth)
      if (response.session) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Storing session in localStorage');
        }
        localStorage.setItem('auth_session', JSON.stringify({
          ...response.session,
          user: response.user,
        }));
      } else if (process.env.NODE_ENV === 'development') {
        console.warn('No session in response');
      }

      return {
        status: 200,
        data: response
      };
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error details:', {
          message: error.message,
          status: error.response?.status
        });
      }
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

      // Store the session if registration is successful (include user data for useAuth)
      if (response.session) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Registration successful, storing session');
        }
        localStorage.setItem('auth_session', JSON.stringify({
          ...response.session,
          user: response.user,
        }));
      }

      return {
        status: 201,
        data: response
      };
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', {
          message: error.message,
          status: error.response?.status
        });
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout API error:', error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Forgot password error:', error.message);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Reset password error:', error.message);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Verify email error:', error.message);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Resend verification error:', error.message);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Get profile error:', error.message);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Update profile error:', error.message);
      }
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await request<{ message: string }>({
        method: 'POST',
        url: '/users/change-password',
        data: { currentPassword, newPassword }
      });
      return { status: 200, data: response };
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Change password error:', error.message);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Upload avatar error:', error.message);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Delete avatar error:', error.message);
      }
      throw error;
    }
  },
};

// Plans endpoints — extracted to plans.service.ts
import { planService } from './plans.service';
export { planService };

// Nodes endpoints — extracted to nodes.service.ts
import { nodeService } from './nodes.service';
export { nodeService };

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

  // Timeline view of plan activity
  getPlanTimeline: async (planId: string) => {
    return request<any[]>({
      method: 'GET',
      url: `/activity/plans/${planId}/timeline`,
    });
  },

  // Activity for a specific node
  getNodeActivity: async (planId: string, nodeId: string) => {
    return request<any[]>({
      method: 'GET',
      url: `/activity/plans/${planId}/nodes/${nodeId}/activity`,
    });
  },

  // Add detailed activity log with metadata
  addDetailedLog: async (planId: string, nodeId: string, logData: {
    content: string;
    log_type: string;
    metadata?: Record<string, any>;
    tags?: string[];
  }) => {
    return request<any>({
      method: 'POST',
      url: `/activity/plans/${planId}/nodes/${nodeId}/detailed-log`,
      data: logData,
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
    if (process.env.NODE_ENV === 'development') {
      console.log(`[api.ts] Searching plan ${planId} for: ${query}`);
    }
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
      await request<any>({
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

// Upload service for file uploads
export const uploadService = {
  uploadAvatar: async (file: File) => {
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
    
    return response.data;
  },

  deleteAvatar: async () => {
    return request<{ message: string }>({
      method: 'DELETE',
      url: '/upload/avatar'
    });
  },
};

// User management service
export const userService = {
  // List all users (when backend implements)
  getAllUsers: async () => {
    return request<any[]>({
      method: 'GET',
      url: '/users',
    });
  },

  // Search users by name or email (when backend implements)
  searchUsers: async (query: string) => {
    return request<any[]>({
      method: 'GET',
      url: '/users/search',
      params: { q: query },
    });
  },
};

// GitHub + Slack — extracted to integrations.service.ts
import { githubService, slackService } from './integrations.service';
export { githubService, slackService };
export type { SlackStatus, SlackChannel } from './integrations.service';

/* githubService removed — see integrations.service.ts */
const _githubRemoved = {
  checkConnection: async () => {
    return request<{
      connected: boolean;
      github_username: string | null;
      github_avatar_url: string | null;
    }>({
      method: 'GET',
      url: '/github/status',
    });
  },

  // List user's GitHub repositories
  listRepos: async () => {
    return request<{
      repos: Array<{
        id: number;
        name: string;
        full_name: string;
        owner: string;
        description: string | null;
        html_url: string;
        private: boolean;
        language: string | null;
        stargazers_count: number;
        forks_count: number;
        updated_at: string;
        default_branch: string;
      }>;
    }>({
      method: 'GET',
      url: '/github/repos',
    });
  },

  // Get repository details
  getRepo: async (owner: string, name: string) => {
    return request<{
      id: number;
      name: string;
      full_name: string;
      owner: string;
      description: string | null;
      html_url: string;
      private: boolean;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
      open_issues_count: number;
      updated_at: string;
      default_branch: string;
      topics: string[];
    }>({
      method: 'GET',
      url: `/github/repos/${owner}/${name}`,
    });
  },

  // Get repository content (README, file structure, languages)
  getRepoContent: async (owner: string, name: string) => {
    return request<{
      readme: string | null;
      file_structure: Array<{
        name: string;
        type: 'file' | 'dir';
        path: string;
        size: number;
      }>;
      languages: Record<string, number>;
    }>({
      method: 'GET',
      url: `/github/repos/${owner}/${name}/content`,
    });
  },

  // Create a single GitHub issue
  createIssue: async (owner: string, name: string, data: {
    title: string;
    body?: string;
    labels?: string[];
  }) => {
    return request<{
      id: number;
      number: number;
      title: string;
      html_url: string;
      state: string;
      created_at: string;
    }>({
      method: 'POST',
      url: `/github/repos/${owner}/${name}/issues`,
      data,
    });
  },

  // Bulk create GitHub issues from plan tasks
  createIssuesFromTasks: async (owner: string, name: string, data: {
    tasks: Array<{
      id: string;
      title: string;
      description?: string;
      context?: string;
      node_type?: string;
      status?: string;
    }>;
    planTitle: string;
    planUrl: string;
  }) => {
    return request<{
      created: number;
      failed: number;
      results: Array<{
        task_id: string;
        task_title: string;
        issue_number: number;
        issue_url: string;
        success: boolean;
      }>;
      errors: Array<{
        task_id: string;
        task_title: string;
        error: string;
        success: boolean;
      }>;
    }>({
      method: 'POST',
      url: `/github/repos/${owner}/${name}/issues/bulk`,
      data,
    });
  },

  // Search GitHub repositories
  searchRepos: async (query: string) => {
    return request<{
      repos: Array<{
        id: number;
        name: string;
        full_name: string;
        owner: string;
        description: string | null;
        html_url: string;
        private: boolean;
        language: string | null;
        stargazers_count: number;
      }>;
    }>({
      method: 'GET',
      url: '/github/search',
      params: { q: query },
    });
  },
};

// Collaboration service for real-time features
export const collaborationService = {
  // Get active users on a plan
  getActiveUsers: async (planId: string) => {
    return request<any[]>({
      method: 'GET',
      url: `/plans/${planId}/active-users`,
    });
  },

  // Update user presence
  updatePresence: async (planId: string, data: { status: 'active' | 'away'; last_seen?: string }) => {
    return request<any>({
      method: 'POST',
      url: `/plans/${planId}/presence`,
      data,
    });
  },

  // Get active users for a specific node
  getNodeActiveUsers: async (planId: string, nodeId: string) => {
    return request<any[]>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/active-users`,
    });
  },
};

// API Tokens endpoints
export const tokenService = {
  getTokens: async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching tokens from API...');
    }
    try {
      const result = await request<ApiToken[] | ApiResponse<ApiToken[]>>({
        method: 'GET',
        url: '/auth/token',
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('Tokens fetched (count):', Array.isArray(result) ? result.length : 'N/A');
      }
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in tokenService.getTokens:', error);
      }
      throw error;
    }
  },

  createToken: async (name: string, permissions?: TokenPermission[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating token with name:', name, 'permissions:', permissions);
    }
    try {
      const result = await request<ApiToken | ApiResponse<ApiToken>>({
        method: 'POST',
        url: '/auth/token',
        data: { name, permissions },
      });
      if (process.env.NODE_ENV === 'development') {
        // Don't log the actual token value for security
        console.log('Token created successfully');
      }
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in tokenService.createToken:', error);
      }
      throw error;
    }
  },

  revokeToken: async (tokenId: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Revoking token:', tokenId);
    }
    try {
      const result = await request<any>({
        method: 'DELETE',
        url: `/auth/token/${tokenId}`,
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('Token revoked successfully');
      }
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in tokenService.revokeToken:', error);
      }
      throw error;
    }
  },
};

// AI Service - for prompt analysis and AI-assisted features
export interface SmartQuestion {
  id: string;
  category: 'scope' | 'constraints' | 'context';
  question: string;
  placeholder: string;
}

export const aiService = {
  // Analyze a prompt and return clarifying questions
  analyzePrompt: async (prompt: string): Promise<{ success: boolean; questions: SmartQuestion[]; usage?: { inputTokens: number; outputTokens: number } }> => {
    if (process.env.NODE_ENV === 'development') {
      console.log('aiService.analyzePrompt called with prompt length:', prompt.length);
    }
    try {
      const result = await request<{ success: boolean; questions: SmartQuestion[]; usage?: { inputTokens: number; outputTokens: number } }>({
        method: 'POST',
        url: '/ai/analyze-prompt',
        data: { prompt },
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('analyzePrompt result:', result);
      }
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in aiService.analyzePrompt:', error);
      }
      throw error;
    }
  },
};

const apiServices = {
  auth: authService,
  plans: planService,
  nodes: nodeService,
  comments: commentService,
  activity: activityService,
  search: searchService,
  logs: logService,
  upload: uploadService,
  users: userService,
  github: githubService,
  collaboration: collaborationService,
  tokens: tokenService,
  debug: debugService,
  ai: aiService,
};

export { api as axiosInstance };
// Shared infra exports for domain service files
export { api, API_CONFIG, request };
export default apiServices;

// Decisions & Agent Requests — extracted to decisions.service.ts
import { decisionsApi, agentRequestApi } from './decisions.service';
export { decisionsApi, agentRequestApi };
export type { Decision, DecisionOption, AgentRequest } from './decisions.service';


// Dashboard Types
export interface DashboardSummary {
  pending_decisions_count: number;
  pending_agent_requests_count: number;
  active_plans_count: number;
  tasks_completed_this_week: number;
  active_goals_count: number;
  knowledge_entries_count: number;
}

export interface PendingDecision {
  id: string;
  title: string;
  description?: string;
  urgency: string;
  created_at: string;
  plan_id: string;
  plan_title: string;
  node_id?: string;
}

export interface PendingAgentRequest {
  id: string;
  task_title: string;
  request_type: string;
  requested_at: string;
  message?: string;
  plan_id: string;
  plan_title: string;
}

export interface PendingItems {
  decisions: PendingDecision[];
  agent_requests: PendingAgentRequest[];
  total: number;
}

export interface DashboardPlan {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  progress?: number | null;
  is_owner: boolean;
}

export interface DashboardGoal {
  id: string;
  title: string;
  description?: string;
  status: string;
  target_date?: string;
  current_value?: number;
  target_value?: number;
  metric_type?: string;
  progress: number;
}

// Dashboard API
export const dashboardApi = {
  getSummary: async () => {
    return request<DashboardSummary>({
      method: 'GET',
      url: '/dashboard/summary',
    });
  },

  getPending: async (limit: number = 5) => {
    return request<PendingItems>({
      method: 'GET',
      url: '/dashboard/pending',
      params: { limit },
    });
  },

  getRecentPlans: async (limit: number = 6) => {
    return request<{ plans: DashboardPlan[] }>({
      method: 'GET',
      url: '/dashboard/recent-plans',
      params: { limit },
    });
  },

  getActiveGoals: async (limit: number = 5) => {
    return request<{ goals: DashboardGoal[] }>({
      method: 'GET',
      url: '/dashboard/active-goals',
      params: { limit },
    });
  },

};

// slackService extracted to integrations.service.ts

// Dependency API
export const dependencyService = {
  listPlanDependencies: async (planId: string) => {
    return request<{ edges: Dependency[]; count: number }>({
      method: 'GET',
      url: `/plans/${planId}/dependencies`,
    });
  },

  listNodeDependencies: async (planId: string, nodeId: string, direction: 'upstream' | 'downstream' | 'both' = 'both') => {
    return request<{ upstream?: Dependency[]; downstream?: Dependency[]; edges?: Dependency[]; count?: number }>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/dependencies`,
      params: { direction },
    });
  },

  createDependency: async (planId: string, data: {
    source_node_id: string;
    target_node_id: string;
    dependency_type?: DependencyType;
    weight?: number;
    metadata?: Record<string, any>;
  }) => {
    return request<Dependency>({
      method: 'POST',
      url: `/plans/${planId}/dependencies`,
      data,
    });
  },

  deleteDependency: async (planId: string, depId: string) => {
    return request<{ deleted: boolean; id: string }>({
      method: 'DELETE',
      url: `/plans/${planId}/dependencies/${depId}`,
    });
  },

  getCriticalPath: async (planId: string) => {
    return request<CriticalPathResult>({
      method: 'GET',
      url: `/plans/${planId}/critical-path`,
    });
  },

  getImpact: async (planId: string, nodeId: string, scenario: 'delay' | 'block' | 'remove' = 'block') => {
    return request<ImpactAnalysis>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/impact`,
      params: { scenario },
    });
  },

  getUpstream: async (planId: string, nodeId: string, maxDepth = 10) => {
    return request<{ nodes: any[]; count: number }>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/upstream`,
      params: { max_depth: maxDepth },
    });
  },

  getDownstream: async (planId: string, nodeId: string, maxDepth = 10) => {
    return request<{ nodes: any[]; count: number }>({
      method: 'GET',
      url: `/plans/${planId}/nodes/${nodeId}/downstream`,
      params: { max_depth: maxDepth },
    });
  },

  listCrossPlanDependencies: async (planIds: string[]) => {
    return request<{ edges: CrossPlanEdge[]; count: number }>({
      method: 'GET',
      url: `/dependencies/cross-plan`,
      params: { plan_ids: planIds.join(',') },
    });
  },

  createCrossPlanDependency: async (data: {
    source_node_id: string;
    target_node_id: string;
    dependency_type?: DependencyType;
    weight?: number;
  }) => {
    return request<any>({
      method: 'POST',
      url: `/dependencies/cross-plan`,
      data,
    });
  },
};

export interface CrossPlanEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  dependency_type: string;
  weight: number;
  metadata: Record<string, any>;
  source_plan_id: string;
  source_title: string;
  source_status: string;
  target_plan_id: string;
  target_title: string;
  target_status: string;
}

// Knowledge (Graphiti, Coherence, Knowledge Loop) — extracted to knowledge.service.ts
import { graphitiService, coherenceService, knowledgeLoopService } from './knowledge.service';
export { graphitiService, coherenceService, knowledgeLoopService };
export type { GraphitiStatus, GraphitiEpisode, GraphitiFact, GraphitiEntity, GraphitiContradiction } from './knowledge.service';

// Goals, Node Agent View, BDI Goals — extracted to goals.service.ts
import { goalDashboardService, nodeViewService, goalBdiService } from './goals.service';
export { goalDashboardService, nodeViewService, goalBdiService };

// Organization Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPersonal: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
  role?: 'owner' | 'admin' | 'member';
  joinedAt?: string;
  memberCount?: number;
  planCount?: number;
}

export interface OrgMember {
  id: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  };
}

// Organization API
export const organizationService = {
  list: async () => {
    const res = await api.get('/organizations');
    return res.data as { organizations: Organization[] };
  },

  get: async (orgId: string) => {
    const res = await api.get(`/organizations/${orgId}`);
    return res.data as Organization;
  },

  create: async (data: { name: string; description?: string; slug?: string }) => {
    const res = await api.post('/organizations', data);
    return res.data as Organization;
  },

  update: async (orgId: string, data: { name?: string; description?: string; avatarUrl?: string }) => {
    const res = await api.put(`/organizations/${orgId}`, data);
    return res.data as Organization;
  },

  delete: async (orgId: string) => {
    const res = await api.delete(`/organizations/${orgId}`);
    return res.data;
  },

  listMembers: async (orgId: string) => {
    const res = await api.get(`/organizations/${orgId}/members`);
    return res.data as { members: OrgMember[] };
  },

  addMember: async (orgId: string, data: { email?: string; user_id?: string; role?: string }) => {
    const res = await api.post(`/organizations/${orgId}/members`, data);
    return res.data as OrgMember;
  },

  removeMember: async (orgId: string, memberId: string) => {
    const res = await api.delete(`/organizations/${orgId}/members/${memberId}`);
    return res.data;
  },

  updateMemberRole: async (orgId: string, memberId: string, role: string) => {
    const res = await api.put(`/organizations/${orgId}/members/${memberId}/role`, { role });
    return res.data;
  },

  listPlans: async (orgId: string) => {
    const res = await api.get(`/organizations/${orgId}/plans`);
    return res.data;
  },
};

// Claims API
export const claimService = {
  getClaim: (planId: string, nodeId: string) =>
    api.get(`/plans/${planId}/nodes/${nodeId}/claim`).then(r => r.data),
  claim: (planId: string, nodeId: string, agentId: string, ttlMinutes?: number) =>
    api.post(`/plans/${planId}/nodes/${nodeId}/claim`, { agent_id: agentId, ttl_minutes: ttlMinutes }).then(r => r.data),
  release: (planId: string, nodeId: string, agentId: string) =>
    api.delete(`/plans/${planId}/nodes/${nodeId}/claim`, { data: { agent_id: agentId } }).then(r => r.data),
};

// coherenceService and knowledgeLoopService re-exported above from knowledge.service.ts

// goalBdiService re-exported above from goals.service.ts
