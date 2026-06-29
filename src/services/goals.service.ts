/**
 * Goals Service — extracted from api.ts
 *
 * Goal dashboard, goal extensions, and node agent view APIs.
 */
import { api } from './api-client';

// ── Goal Dashboard API ─────────────────────────────────────

export const goalDashboardService = {
  getDashboard: () => api.get('/goals/dashboard').then(r => r.data),
  getBriefing: (goalId: string) => api.get(`/goals/${goalId}/briefing`).then(r => r.data),
  getCoherence: (goalId: string) => api.get(`/goals/${goalId}/coherence`).then(r => r.data),
  // The actual facts behind the coherence "N contradictions" count: current vs
  // superseded facts, built from the same query as getCoherence.
  getContradictions: (goalId: string): Promise<GoalContradictions> =>
    api.get(`/goals/${goalId}/contradictions`).then(r => r.data),
};

export interface ContradictionFact {
  uuid: string;
  fact: string;
  name?: string;
  created_at?: string;
  valid_at?: string | null;
  invalid_at?: string | null;
  expired_at?: string | null;
}

export interface GoalContradictions {
  goal_id: string;
  query: string | null;
  current: ContradictionFact[];
  superseded: ContradictionFact[];
  contradictions_found: boolean;
}

// ── Node Agent View API ────────────────────────────────────

export const nodeViewService = {
  getAgentView: (nodeId: string, depth: number = 4) =>
    api.get(`/nodes/${nodeId}/agent-view`, { params: { depth } }).then(r => r.data),
};

// ── Goals API extensions ───────────────────────────────

export const goalBdiService = {
  // Marks the goal committed (was "promote to intention"); the canonical path
  // is /promote — /promote-to-intention remains a deprecated alias.
  promoteToIntention: (goalId: string) =>
    api.post(`/goals/${goalId}/promote`).then(r => r.data),
  getPortfolio: (goalId: string) =>
    api.get(`/goals/${goalId}/portfolio`).then(r => r.data),
  getCoverage: (goalId: string) =>
    api.get(`/goals/${goalId}/coverage`).then(r => r.data),
  getQuality: (goalId: string) =>
    api.get(`/goals/${goalId}/quality`).then(r => r.data),
};
