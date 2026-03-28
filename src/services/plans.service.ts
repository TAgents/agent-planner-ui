/**
 * Plans Service — extracted from api.ts
 *
 * All plan-related API calls: CRUD, collaborators, progress, public plans, GitHub linking.
 */
import axios from 'axios';
import { ApiResponse, Plan } from '../types';
import { API_CONFIG, request } from './api';

export const planService = {
  getPlans: async (page = 1, limit = 10, status?: string) => {
    const params: Record<string, any> = { page, limit };
    if (status) {
      params.status = status;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Getting plans with params:', params);
    }

    return request<any>({
      method: 'GET',
      url: '/plans',
      params,
    });
  },

  getPlan: async (planId: string) => {
    return request<any>({
      method: 'GET',
      url: `/plans/${planId}`,
    });
  },

  createPlan: async (data: Partial<Plan>) => {
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

  updatePlanVisibility: async (planId: string, visibility: 'public' | 'private') => {
    return request<ApiResponse<Plan>>({
      method: 'PUT',
      url: `/plans/${planId}/visibility`,
      data: { visibility },
    });
  },

  deletePlan: async (planId: string, archive: boolean = true) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/plans/${planId}${archive ? '?archive=true' : ''}`,
    });
  },

  getCollaborators: async (planId: string) => {
    const response = await request<any>({
      method: 'GET',
      url: `/plans/${planId}/collaborators`,
    });

    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.collaborators && Array.isArray(response.collaborators)) return response.collaborators;

    return [];
  },

  addCollaborator: async (planId: string, data: { email: string; role: 'viewer' | 'editor' | 'admin' }) => {
    return request<any>({
      method: 'POST',
      url: `/plans/${planId}/share`,
      data,
    });
  },

  removeCollaborator: async (planId: string, userId: string) => {
    return request<any>({
      method: 'DELETE',
      url: `/plans/${planId}/collaborators/${userId}`,
    });
  },

  updateCollaboratorRole: async (planId: string, userId: string, role: 'viewer' | 'editor' | 'admin') => {
    return request<any>({
      method: 'PUT',
      url: `/plans/${planId}/collaborators/${userId}`,
      data: { role },
    });
  },

  getPlanProgress: async (planId: string) => {
    return request<{
      total_nodes: number;
      completed_nodes: number;
      in_progress_nodes: number;
      blocked_nodes: number;
      completion_percentage: number;
    }>({
      method: 'GET',
      url: `/plans/${planId}/progress`,
    });
  },

  getPlanContext: async (planId: string) => {
    return request<any>({
      method: 'GET',
      url: `/plans/${planId}/context`,
    });
  },

  getAvailableUsers: async (planId: string) => {
    return request<any[]>({
      method: 'GET',
      url: `/plans/${planId}/available-users`,
    });
  },

  getPublicPlans: async (sort: string = 'recent', limit: number = 50, offset: number = 0) => {
    const publicApi = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: API_CONFIG.HEADERS,
      timeout: API_CONFIG.TIMEOUT,
    });

    const response = await publicApi.get('/plans/public', {
      params: { sort, limit, offset }
    });
    return response.data;
  },

  getPublicPlan: async (planId: string) => {
    const publicApi = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: API_CONFIG.HEADERS,
      timeout: API_CONFIG.TIMEOUT,
    });

    const response = await publicApi.get(`/plans/public/${planId}`);
    return response.data;
  },

  getPublicPlanWithStructure: async (planId: string) => {
    const publicApi = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: API_CONFIG.HEADERS,
      timeout: API_CONFIG.TIMEOUT,
    });

    const response = await publicApi.get(`/plans/public/${planId}`);
    return response.data;
  },

  linkGitHubRepo: async (planId: string, owner: string, name: string) => {
    return request<ApiResponse<Plan>>({
      method: 'PUT',
      url: `/plans/${planId}/github`,
      data: {
        github_repo_owner: owner,
        github_repo_name: name,
      },
    });
  },
};
