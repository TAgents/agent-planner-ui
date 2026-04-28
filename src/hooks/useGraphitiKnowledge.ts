import { useQuery, useMutation, useQueryClient } from 'react-query';
import { graphitiService, GraphitiEpisode, GraphitiFact, GraphitiEntity, GraphitiContradiction } from '../services/knowledge.service';

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
      // Backend now flattens to {episodes: [...], group_id}. Old double-nested
      // shape {episodes: {episodes: [...]}} kept as fallback for forward-compat.
      const episodes = Array.isArray(result.episodes)
        ? result.episodes
        : (result.episodes as any)?.episodes || [];
      return { episodes, group_id: result.group_id };
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
        entities: Array.isArray(result.entities)
          ? result.entities
          : (result.entities as any)?.nodes || [],
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
      // Backend now flattens to {facts: [...], group_id, method}. Old shape
      // {results: {facts: [...]}} kept as fallback.
      const facts = Array.isArray((result as any).facts)
        ? (result as any).facts
        : result.results?.facts || [];
      return { facts, group_id: result.group_id, method: result.method };
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
        entities: Array.isArray(result.entities)
          ? result.entities
          : (result.entities as any)?.nodes || [],
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

/**
 * Delete an episode by ID
 */
export function useDeleteEpisode() {
  const qc = useQueryClient();
  return useMutation(
    (episodeId: string) => graphitiService.deleteEpisode(episodeId),
    {
      onSuccess: () => {
        qc.invalidateQueries([GRAPHITI_KEY, 'episodes']);
      },
    }
  );
}


/**
 * Resolve plan/task tethers for a list of Graphiti episode UUIDs. Used
 * by the Knowledge Graph entity inspector to walk
 *   entity → facts.episodes → episode_node_links → tasks
 * in one round-trip.
 */
export function useEpisodeTaskLinks(episodeIds: string[]) {
  const stableKey = [...episodeIds].sort().join(",");
  return useQuery(
    [GRAPHITI_KEY, "episode-task-links", stableKey],
    async () => {
      if (episodeIds.length === 0) return { links: [] };
      return graphitiService.getEpisodeTaskLinks(episodeIds);
    },
    { enabled: episodeIds.length > 0, staleTime: 30_000 }
  );
}
