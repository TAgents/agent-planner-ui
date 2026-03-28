/**
 * Decisions & Agent Requests Service — extracted from api.ts
 */
import { request } from './api-client';

// ── Types ──────────────────────────────────────────────────

export interface DecisionOption {
  id: string;
  title: string;
  description?: string;
  pros?: string[];
  cons?: string[];
  is_recommended?: boolean;
}

export interface Decision {
  id: string;
  plan_id: string;
  node_id?: string;
  title: string;
  context: string;
  options?: DecisionOption[];
  urgency: 'blocking' | 'can_continue';
  status: 'pending' | 'resolved' | 'cancelled' | 'expired';
  decision?: string;
  rationale?: string;
  selected_option_id?: string;
  requested_by: string;
  resolved_by?: string;
  created_at: string;
  resolved_at?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
  requester?: { id: string; name: string; email?: string };
  resolver?: { id: string; name: string; email?: string };
}

export interface AgentRequest {
  id: string;
  plan_id: string;
  task_id: string;
  request_type: 'execute' | 'review' | 'plan' | 'custom';
  prompt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'normal' | 'urgent';
  response?: string;
  error?: string;
  requested_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  requester?: { id: string; name: string; email?: string };
}

// ── Decision API ───────────────────────────────────────────

export const decisionsApi = {
  list: async (planId: string, options?: {
    status?: 'pending' | 'resolved' | 'cancelled' | 'expired';
    node_id?: string;
    limit?: number;
    offset?: number;
  }) => {
    return request<Decision[]>({
      method: 'GET',
      url: `/plans/${planId}/decisions`,
      params: options,
    });
  },

  get: async (planId: string, decisionId: string) => {
    return request<Decision>({
      method: 'GET',
      url: `/plans/${planId}/decisions/${decisionId}`,
    });
  },

  getPendingCount: async (planId: string) => {
    const decisions = await request<Decision[]>({
      method: 'GET',
      url: `/plans/${planId}/decisions`,
      params: { status: 'pending' },
    });
    return {
      total: decisions.length,
      blocking: decisions.filter(d => d.urgency === 'blocking').length,
      canContinue: decisions.filter(d => d.urgency === 'can_continue').length,
    };
  },

  resolve: async (planId: string, decisionId: string, data: {
    decision: string;
    rationale?: string;
    selected_option_id?: string;
  }) => {
    return request<Decision>({
      method: 'POST',
      url: `/plans/${planId}/decisions/${decisionId}/resolve`,
      data,
    });
  },

  cancel: async (planId: string, decisionId: string) => {
    return request<Decision>({
      method: 'POST',
      url: `/plans/${planId}/decisions/${decisionId}/cancel`,
    });
  },
};

// ── Agent Request API ──────────────────────────────────────

export const agentRequestApi = {
  create: async (planId: string, taskId: string, data: {
    request_type: 'start' | 'review' | 'help' | 'continue' | 'execute' | 'plan' | 'custom';
    prompt?: string;
    message?: string;
    priority?: 'normal' | 'urgent';
  }) => {
    const typeMap: Record<string, string> = {
      'execute': 'start',
      'plan': 'help',
      'custom': 'help',
    };
    const mappedData = {
      request_type: typeMap[data.request_type] || data.request_type,
      message: data.prompt || data.message || '',
    };
    return request<AgentRequest>({
      method: 'POST',
      url: `/plans/${planId}/nodes/${taskId}/request-agent`,
      data: mappedData,
    });
  },

  listForTask: async (_planId: string, _taskId: string) => {
    return [] as AgentRequest[];
  },

  listForPlan: async (_planId: string, _status?: string) => {
    return [] as AgentRequest[];
  },
};
