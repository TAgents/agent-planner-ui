/**
 * Workspaces Service
 *
 * A Workspace is a folder under an Organization that owns goals and plans.
 * See agent-planner/docs/WORKSPACE_BLUEPRINT_SKETCH.md.
 */
import { Workspace } from '../types';
import { request } from './api-client';

export const workspaceService = {
  list: async (params: { organization_id: string; include_archived?: boolean }) => {
    return request<{ workspaces: Workspace[] }>({
      method: 'GET',
      url: '/workspaces',
      params,
    });
  },

  get: async (id: string) => {
    return request<Workspace>({
      method: 'GET',
      url: `/workspaces/${id}`,
    });
  },

  create: async (data: {
    organization_id: string;
    title: string;
    slug?: string;
    description?: string;
    icon?: string;
    is_default?: boolean;
  }) => {
    return request<Workspace>({
      method: 'POST',
      url: '/workspaces',
      data,
    });
  },

  update: async (
    id: string,
    data: Partial<{ title: string; description: string; icon: string; slug: string; metadata: Record<string, any> }>,
  ) => {
    return request<Workspace>({
      method: 'PATCH',
      url: `/workspaces/${id}`,
      data,
    });
  },

  archive: async (id: string) => {
    return request<Workspace>({
      method: 'POST',
      url: `/workspaces/${id}/archive`,
    });
  },

  restore: async (id: string) => {
    return request<Workspace>({
      method: 'POST',
      url: `/workspaces/${id}/restore`,
    });
  },

  remove: async (id: string) => {
    return request<void>({
      method: 'DELETE',
      url: `/workspaces/${id}`,
    });
  },
};
