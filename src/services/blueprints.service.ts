/**
 * Blueprints Service
 *
 * A Blueprint is a dehydrated, reusable shape (scope: plan | workspace).
 * Forks into a target workspace as a new plan. Save a live plan as a
 * Blueprint via /blueprints/from_plan/:planId. See sketch for details.
 */
import { Blueprint, BlueprintScope, BlueprintVisibility, Plan } from '../types';
import { request } from './api-client';

export interface BlueprintFork {
  id: string;
  title: string;
  status: string;
  visibility?: string;
  ownerId: string;
  organizationId: string | null;
  workspaceId: string | null;
  forkedAt: string | null;
  createdAt: string;
  updatedAt: string;
  workspace: { id: string; title: string; slug: string } | null;
}

export const blueprintService = {
  list: async (params?: {
    scope?: BlueprintScope;
    visibility?: BlueprintVisibility;
    owner_only?: boolean;
  }) => {
    return request<{ blueprints: Blueprint[] }>({
      method: 'GET',
      url: '/blueprints',
      params,
    });
  },

  get: async (id: string) => {
    return request<Blueprint>({
      method: 'GET',
      url: `/blueprints/${id}`,
    });
  },

  update: async (
    id: string,
    data: Partial<{ title: string; description: string; visibility: BlueprintVisibility; tags: string[] }>,
  ) => {
    return request<Blueprint>({
      method: 'PATCH',
      url: `/blueprints/${id}`,
      data,
    });
  },

  remove: async (id: string) => {
    return request<void>({
      method: 'DELETE',
      url: `/blueprints/${id}`,
    });
  },

  /**
   * List plans forked from this blueprint, decorated with their workspace.
   */
  listForks: async (id: string, params?: { limit?: number }) => {
    return request<{ forks: BlueprintFork[] }>({
      method: 'GET',
      url: `/blueprints/${id}/forks`,
      params,
    });
  },

  /**
   * Snapshot a live plan as a new Blueprint (scope='plan').
   */
  saveFromPlan: async (
    planId: string,
    data?: { title?: string; description?: string; visibility?: BlueprintVisibility; tags?: string[] },
  ) => {
    return request<Blueprint>({
      method: 'POST',
      url: `/blueprints/from_plan/${planId}`,
      data: data ?? {},
    });
  },

  /**
   * Fork a plan-scope Blueprint into a target workspace as a new Plan.
   * Returns the newly-created plan row.
   */
  fork: async (id: string, data: { workspace_id: string; title?: string }) => {
    return request<Plan>({
      method: 'POST',
      url: `/blueprints/${id}/fork`,
      data,
    });
  },
};
