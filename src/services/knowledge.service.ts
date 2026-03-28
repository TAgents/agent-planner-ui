/**
 * Knowledge Service — extracted from api.ts
 *
 * Graphiti knowledge graph, BDI coherence, and knowledge loop APIs.
 */
import { api, request } from './api-client';

// ── Graphiti Types ─────────────────────────────────────────

export interface GraphitiStatus {
  available: boolean;
  status: { status: string };
}

export interface GraphitiEpisode {
  uuid: string;
  name: string;
  content: string;
  source_description?: string;
  created_at: string;
  valid_at?: string;
  entity_edges?: Array<{ relation_type: string; source_entity_name: string; target_entity_name: string }>;
}

export interface GraphitiFact {
  uuid: string;
  fact: string;
  name?: string;
  created_at: string;
  valid_at?: string;
  invalid_at?: string;
  source_node_name?: string;
  target_node_name?: string;
  source_node_uuid?: string;
  target_node_uuid?: string;
  episodes?: string[];
}

export interface GraphitiEntity {
  uuid: string;
  name: string;
  entity_type?: string;
  summary?: string;
  created_at: string;
  group_id?: string;
}

export interface GraphitiContradiction {
  uuid: string;
  fact: string;
  created_at: string;
  valid_at?: string;
  invalid_at?: string;
}

// ── Graphiti Knowledge Graph API ───────────────────────────

export const graphitiService = {
  getStatus: async () => {
    return request<GraphitiStatus>({
      method: 'GET',
      url: '/knowledge/graphiti/status',
    });
  },

  getEpisodes: async (maxEpisodes = 20) => {
    return request<{ episodes: { episodes: GraphitiEpisode[] }; group_id: string }>({
      method: 'GET',
      url: '/knowledge/episodes',
      params: { max_episodes: maxEpisodes },
    });
  },

  searchFacts: async (query: string, maxResults = 10) => {
    return request<{ results: { facts: GraphitiFact[] }; group_id: string; method: string }>({
      method: 'POST',
      url: '/knowledge/graph-search',
      data: { query, max_results: maxResults },
    });
  },

  searchEntities: async (query: string, maxResults = 20) => {
    return request<{ entities: { nodes: GraphitiEntity[] }; group_id: string }>({
      method: 'POST',
      url: '/knowledge/entities',
      data: { query, max_results: maxResults },
    });
  },

  findContradictions: async (query: string, maxResults = 10) => {
    return request<{ current: GraphitiContradiction[]; superseded: GraphitiContradiction[]; contradictions_found: boolean }>({
      method: 'POST',
      url: '/knowledge/contradictions',
      data: { query, max_results: maxResults },
    });
  },

  createEpisode: async (content: string, name: string) => {
    return request<any>({
      method: 'POST',
      url: '/knowledge/episodes',
      data: { content, name },
    });
  },

  deleteEpisode: async (episodeId: string) => {
    return request<{ deleted: boolean }>({
      method: 'DELETE',
      url: `/knowledge/episodes/${episodeId}`,
    });
  },

  getCoverageMap: async () => {
    const res = await api.get('/knowledge/coverage-map');
    return res.data;
  },
};

// ── BDI Coherence API ──────────────────────────────────────

export const coherenceService = {
  getPlanCoherence: (planId: string) =>
    api.get(`/plans/${planId}/coherence`).then(r => r.data),
  runCheck: (planId: string, goalId?: string) =>
    api.post(`/plans/${planId}/coherence/check`, goalId ? { goal_id: goalId } : {}).then(r => r.data),
  getPending: () =>
    api.get('/coherence/pending').then(r => r.data),
  getNodeEpisodeLinks: (planId: string, nodeId: string, linkType?: string) =>
    api.get(`/plans/${planId}/nodes/${nodeId}/episode-links`, { params: linkType ? { link_type: linkType } : {} }).then(r => r.data),
};

// ── BDI Knowledge Loop API ─────────────────────────────────

export const knowledgeLoopService = {
  start: (planId: string, goalId?: string, maxIterations?: number) =>
    api.post(`/plans/${planId}/knowledge-loop/start`, { goal_id: goalId, max_iterations: maxIterations }).then(r => r.data),
  getStatus: (planId: string) =>
    api.get(`/plans/${planId}/knowledge-loop/status`).then(r => r.data),
  getContext: (planId: string) =>
    api.get(`/plans/${planId}/knowledge-loop/context`).then(r => r.data),
  iterate: (planId: string, data: { quality_score: number; rationale?: string; modifications?: string[]; episode_id?: string }) =>
    api.post(`/plans/${planId}/knowledge-loop/iterate`, data).then(r => r.data),
  stop: (planId: string) =>
    api.post(`/plans/${planId}/knowledge-loop/stop`).then(r => r.data),
};
