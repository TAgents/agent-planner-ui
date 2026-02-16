import { useQuery, useMutation, useQueryClient } from 'react-query';

export interface KnowledgeEntry {
  id: string;
  ownerId: string;
  scope: 'global' | 'plan' | 'task';
  scopeId: string | null;
  entryType: 'decision' | 'learning' | 'context' | 'constraint' | 'reference' | 'note';
  title: string;
  content: string;
  tags: string[];
  source: string | null;
  metadata: Record<string, any>;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  similarity?: number;
}

export interface KnowledgeGraphData {
  nodes: { id: string; title: string }[];
  edges: { source: string; target: string; similarity: number }[];
}

const KNOWLEDGE_KEY = 'knowledge-v2';

async function fetchApi(path: string, options?: any) {
  const sessionStr = localStorage.getItem('auth_session');
  let token: string | null = null;
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      token = session.access_token || session.accessToken || session;
    } catch { token = sessionStr; }
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/knowledge${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

export function useKnowledgeList(filters?: { scope?: string; scopeId?: string; entryType?: string; limit?: number; offset?: number }) {
  return useQuery([KNOWLEDGE_KEY, 'list', filters], () => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
    }
    return fetchApi(`?${params.toString()}`).then(d => d.entries as KnowledgeEntry[]);
  });
}

export function useKnowledgeItem(id: string | undefined) {
  return useQuery([KNOWLEDGE_KEY, 'detail', id], () =>
    fetchApi(`/${id}`).then(d => d.entry as KnowledgeEntry),
    { enabled: !!id }
  );
}

// Legacy mutation-based search (kept for backward compat)
export function useKnowledgeSearch() {
  return useMutation(
    (params: { query: string; limit?: number; scope?: string; scopeId?: string; entryType?: string; source?: string }) =>
      fetchApi('/search', { method: 'POST', body: JSON.stringify(params) }).then(d => ({
        results: d.results as KnowledgeEntry[],
        method: d.method as string,
      }))
  );
}

// Query-based search with caching
export function useKnowledgeSearchQuery(params: { query: string; limit?: number; scope?: string; entryType?: string } | null) {
  return useQuery(
    [KNOWLEDGE_KEY, 'search', params],
    () => fetchApi('/search', { method: 'POST', body: JSON.stringify(params) }).then(d => ({
      results: d.results as KnowledgeEntry[],
      method: d.method as string,
    })),
    { enabled: !!params?.query?.trim(), staleTime: 30000 }
  );
}

export function useKnowledgeGraph(opts?: { threshold?: number; limit?: number }) {
  return useQuery([KNOWLEDGE_KEY, 'graph', opts], () => {
    const params = new URLSearchParams();
    if (opts?.threshold) params.set('threshold', String(opts.threshold));
    if (opts?.limit) params.set('limit', String(opts.limit));
    return fetchApi(`/graph?${params.toString()}`).then(d => d as KnowledgeGraphData);
  });
}

export function useCreateKnowledge() {
  const qc = useQueryClient();
  return useMutation(
    (data: Partial<KnowledgeEntry>) => fetchApi('', { method: 'POST', body: JSON.stringify(data) }),
    { onSuccess: () => qc.invalidateQueries(KNOWLEDGE_KEY) }
  );
}

export function useUpdateKnowledge() {
  const qc = useQueryClient();
  return useMutation(
    ({ id, ...data }: Partial<KnowledgeEntry> & { id: string }) =>
      fetchApi(`/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    { onSuccess: () => qc.invalidateQueries(KNOWLEDGE_KEY) }
  );
}

export function useDeleteKnowledge() {
  const qc = useQueryClient();
  return useMutation(
    (id: string) => fetchApi(`/${id}`, { method: 'DELETE' }),
    { onSuccess: () => qc.invalidateQueries(KNOWLEDGE_KEY) }
  );
}
