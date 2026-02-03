import { useState, useEffect, useCallback } from 'react';
import { knowledgeService } from '../services/api';
import type { KnowledgeStore, KnowledgeEntry } from '../services/api';

export type EntryType = 'decision' | 'context' | 'constraint' | 'learning' | 'reference' | 'note';

export interface EntryTypeConfig {
  value: EntryType;
  label: string;
  icon: string;
  // Explicit Tailwind classes to avoid purging
  badgeClasses: string;
}

export const ENTRY_TYPES: EntryTypeConfig[] = [
  { value: 'decision', label: 'Decision', icon: '⚖️', badgeClasses: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'context', label: 'Context', icon: '📋', badgeClasses: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'constraint', label: 'Constraint', icon: '🚧', badgeClasses: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'learning', label: 'Learning', icon: '💡', badgeClasses: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'reference', label: 'Reference', icon: '🔗', badgeClasses: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
  { value: 'note', label: 'Note', icon: '📝', badgeClasses: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
];

export function getEntryTypeConfig(type: EntryType): EntryTypeConfig {
  return ENTRY_TYPES.find(t => t.value === type) || ENTRY_TYPES[5];
}

interface UseKnowledgeStoresResult {
  stores: KnowledgeStore[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useKnowledgeStores(scope?: string, scopeId?: string): UseKnowledgeStoresResult {
  const [stores, setStores] = useState<KnowledgeStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await knowledgeService.getStores(scope, scopeId);
      setStores(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load knowledge stores');
    } finally {
      setLoading(false);
    }
  }, [scope, scopeId]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { stores, loading, error, refetch: fetchStores };
}

interface UseKnowledgeStoreResult {
  store: KnowledgeStore | null;
  entries: KnowledgeEntry[];
  loading: boolean;
  error: string | null;
  totalEntries: number;
  refetch: () => void;
  loadMore: () => void;
  hasMore: boolean;
  createEntry: (data: {
    entry_type: string;
    title: string;
    content: string;
    source_url?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }) => Promise<KnowledgeEntry>;
  updateEntry: (entryId: string, data: {
    entry_type?: string;
    title?: string;
    content?: string;
    source_url?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }) => Promise<KnowledgeEntry>;
  deleteEntry: (entryId: string) => Promise<void>;
  filterByType: (type: string | null) => void;
  searchEntries: (query: string) => Promise<KnowledgeEntry[]>;
  currentFilter: string | null;
}

export function useKnowledgeStore(storeId: string | null): UseKnowledgeStoreResult {
  const [store, setStore] = useState<KnowledgeStore | null>(null);
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [offset, setOffset] = useState(0);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const limit = 20;

  const fetchStore = useCallback(async () => {
    if (!storeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [storeData, entriesData] = await Promise.all([
        knowledgeService.getStore(storeId),
        knowledgeService.getEntries(storeId, { 
          limit, 
          offset: 0,
          entry_type: currentFilter || undefined
        }),
      ]);
      
      setStore(storeData);
      setEntries(entriesData.entries);
      setTotalEntries(entriesData.total || entriesData.entries.length);
      setOffset(limit);
    } catch (err: any) {
      setError(err.message || 'Failed to load knowledge store');
    } finally {
      setLoading(false);
    }
  }, [storeId, currentFilter]);

  useEffect(() => {
    if (storeId) {
      setOffset(0);
      setEntries([]);
      fetchStore();
    } else {
      setStore(null);
      setEntries([]);
    }
  }, [storeId, fetchStore]);

  const loadMore = useCallback(async () => {
    if (!storeId || loading) return;
    
    try {
      const entriesData = await knowledgeService.getEntries(storeId, { 
        limit, 
        offset,
        entry_type: currentFilter || undefined
      });
      setEntries(prev => [...prev, ...entriesData.entries]);
      setOffset(prev => prev + limit);
    } catch (err: any) {
      setError(err.message || 'Failed to load more entries');
    }
  }, [storeId, loading, offset, currentFilter]);

  const createEntry = useCallback(async (data: {
    entry_type: string;
    title: string;
    content: string;
    source_url?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }) => {
    if (!storeId) throw new Error('No store selected');
    
    const entry = await knowledgeService.createEntry({
      store_id: storeId,
      ...data,
    });
    
    // Only add to list if no filter active or entry matches filter
    if (!currentFilter || entry.entry_type === currentFilter) {
      setEntries(prev => [entry, ...prev]);
    }
    // Always increment total (actual total, not filtered count)
    setTotalEntries(prev => prev + 1);
    return entry;
  }, [storeId, currentFilter]);

  const updateEntry = useCallback(async (entryId: string, data: {
    entry_type?: string;
    title?: string;
    content?: string;
    source_url?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }) => {
    const updated = await knowledgeService.updateEntry(entryId, data);
    setEntries(prev => prev.map(e => e.id === entryId ? updated : e));
    return updated;
  }, []);

  const deleteEntry = useCallback(async (entryId: string) => {
    await knowledgeService.deleteEntry(entryId);
    setEntries(prev => prev.filter(e => e.id !== entryId));
    setTotalEntries(prev => prev - 1);
  }, []);

  const filterByType = useCallback((type: string | null) => {
    setCurrentFilter(type);
    setOffset(0);
    setEntries([]);
  }, []);

  const searchEntries = useCallback(async (query: string) => {
    if (!storeId) return [];
    
    const result = await knowledgeService.search({
      query,
      store_ids: [storeId],
    });
    
    return result.results;
  }, [storeId]);

  return {
    store,
    entries,
    loading,
    error,
    totalEntries,
    refetch: fetchStore,
    loadMore,
    hasMore: entries.length < totalEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    filterByType,
    searchEntries,
    currentFilter,
  };
}

// Hook for knowledge entries scoped to a specific entity (org, goal, plan)
export function useScopedKnowledge(scope: 'organization' | 'goal' | 'plan', scopeId: string | null) {
  const [store, setStore] = useState<KnowledgeStore | null>(null);
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!scopeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get or create store for this scope
      const stores = await knowledgeService.getStores(scope, scopeId);
      if (stores.length > 0) {
        setStore(stores[0]);
        const entriesData = await knowledgeService.getEntries(stores[0].id);
        setEntries(entriesData.entries);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load knowledge');
    } finally {
      setLoading(false);
    }
  }, [scope, scopeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createEntry = useCallback(async (data: {
    entry_type: string;
    title: string;
    content: string;
    source_url?: string;
    tags?: string[];
  }) => {
    if (!scopeId) throw new Error('No scope selected');
    
    const entry = await knowledgeService.createEntry({
      scope,
      scope_id: scopeId,
      ...data,
    });
    
    setEntries(prev => [entry, ...prev]);
    return entry;
  }, [scope, scopeId]);

  const deleteEntry = useCallback(async (entryId: string) => {
    await knowledgeService.deleteEntry(entryId);
    setEntries(prev => prev.filter(e => e.id !== entryId));
  }, []);

  return {
    store,
    entries,
    loading,
    error,
    refetch: fetchData,
    createEntry,
    deleteEntry,
  };
}

export type { KnowledgeStore, KnowledgeEntry };
