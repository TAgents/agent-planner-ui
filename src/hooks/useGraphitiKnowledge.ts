import { useQuery, useMutation, useQueryClient } from 'react-query';
import { graphitiService, GraphitiEpisode, GraphitiFact, GraphitiEntity, GraphitiContradiction } from '../services/api';

const GRAPHITI_KEY = 'graphiti';

/**
 * Check if Graphiti service is available
 */
export function useGraphitiStatus() {
  return useQuery(
    [GRAPHITI_KEY, 'status'],
    () => graphitiService.getStatus(),
    { staleTime: 60000, retry: false }
  );
}

/**
 * Fetch episodes (timeline entries)
 */
export function useGraphitiEpisodes(maxEpisodes = 20, enabled = true) {
  return useQuery(
    [GRAPHITI_KEY, 'episodes', maxEpisodes],
    async () => {
      const result = await graphitiService.getEpisodes(maxEpisodes);
      return {
        episodes: result.episodes?.episodes || [],
        group_id: result.group_id,
      };
    },
    { enabled, staleTime: 30000 }
  );
}

/**
 * Search for facts related to a query (react-query cached)
 */
export function useGraphitiFactSearch(query: string | null, maxResults = 10) {
  return useQuery(
    [GRAPHITI_KEY, 'facts', query, maxResults],
    async () => {
      if (!query) return { facts: [] as GraphitiFact[], group_id: '', method: '' };
      const result = await graphitiService.searchFacts(query, maxResults);
      return {
        facts: result.results?.facts || [],
        group_id: result.group_id,
        method: result.method,
      };
    },
    { enabled: !!query?.trim(), staleTime: 30000 }
  );
}

/**
 * Search for entities (react-query cached)
 */
export function useGraphitiEntitySearch(query: string | null, maxResults = 20) {
  return useQuery(
    [GRAPHITI_KEY, 'entities', query, maxResults],
    async () => {
      if (!query) return { entities: [] as GraphitiEntity[], group_id: '' };
      const result = await graphitiService.searchEntities(query, maxResults);
      return {
        entities: result.entities?.nodes || [],
        group_id: result.group_id,
      };
    },
    { enabled: !!query?.trim(), staleTime: 30000 }
  );
}

/**
 * Mutation-based fact search for on-demand triggers
 */
export function useGraphitiFactSearchMutation() {
  return useMutation(
    async ({ query, maxResults = 10 }: { query: string; maxResults?: number }) => {
      const result = await graphitiService.searchFacts(query, maxResults);
      return {
        facts: result.results?.facts || [],
        group_id: result.group_id,
        method: result.method,
      };
    }
  );
}

/**
 * Mutation-based entity search for on-demand triggers
 */
export function useGraphitiEntitySearchMutation() {
  return useMutation(
    async ({ query, maxResults = 20 }: { query: string; maxResults?: number }) => {
      const result = await graphitiService.searchEntities(query, maxResults);
      return {
        entities: result.entities?.nodes || [],
        group_id: result.group_id,
      };
    }
  );
}

/**
 * Find contradictions in knowledge
 */
export function useGraphitiContradictions(query: string | null, maxResults = 10) {
  return useQuery(
    [GRAPHITI_KEY, 'contradictions', query, maxResults],
    async () => {
      if (!query) return { current: [] as GraphitiContradiction[], superseded: [] as GraphitiContradiction[], contradictions_found: false };
      return graphitiService.findContradictions(query, maxResults);
    },
    { enabled: !!query?.trim(), staleTime: 30000 }
  );
}

/**
 * Create a new episode (learning/knowledge entry)
 */
export function useCreateGraphitiEpisode() {
  const qc = useQueryClient();
  return useMutation(
    ({ content, name }: { content: string; name: string }) =>
      graphitiService.createEpisode(content, name),
    {
      onSuccess: () => {
        qc.invalidateQueries([GRAPHITI_KEY, 'episodes']);
      },
    }
  );
}
