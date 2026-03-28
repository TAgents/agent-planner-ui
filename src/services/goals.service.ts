/**
 * Goals Service — extracted from api.ts
 *
 * Goal dashboard, BDI goal extensions, and node agent view APIs.
 */
import { api } from './api-client';

// ── Goal Dashboard API ─────────────────────────────────────

export const goalDashboardService = {
  getDashboard: () => api.get('/goals/dashboard').then(r => r.data),
  getBriefing: (goalId: string) => api.get(`/goals/${goalId}/briefing`).then(r => r.data),
};

// ── Node Agent View API ────────────────────────────────────

export const nodeViewService = {
  getAgentView: (nodeId: string, depth: number = 4) =>
    api.get(`/nodes/${nodeId}/agent-view`, { params: { depth } }).then(r => r.data),
};

// ── BDI Goals API extensions ───────────────────────────────

export const goalBdiService = {
  promoteToIntention: (goalId: string) =>
    api.post(`/goals/${goalId}/promote-to-intention`).then(r => r.data),
  getPortfolio: (goalId: string) =>
    api.get(`/goals/${goalId}/portfolio`).then(r => r.data),
  getCoverage: (goalId: string) =>
    api.get(`/goals/${goalId}/coverage`).then(r => r.data),
  getQuality: (goalId: string) =>
    api.get(`/goals/${goalId}/quality`).then(r => r.data),
};
