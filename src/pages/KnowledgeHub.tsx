import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  useKnowledgeStores,
  useKnowledgeStore,
  KnowledgeStore,
  ENTRY_TYPES,
  getEntryTypeConfig,
  EntryType,
} from '../hooks/useKnowledge';
import type { KnowledgeEntry as BaseKnowledgeEntry } from '../services/api';
// Hooks for potential future features
// import { useOrganizations } from '../hooks/useOrganizations';
// import { useGoals } from '../hooks/useGoals';
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  Edit3,
  X,
  Check,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Filter,
  AlertCircle,
  Loader2,
  Building2,
  Target,
  FileText,
  Tag,
  Clock,
  LayoutGrid,
  List,
  MoreVertical,
  // Entry type icons
  Gavel,
  Info,
  Lock,
  Lightbulb,
  Link2,
  StickyNote,
} from 'lucide-react';

// Extended entry type with optional store info for display
interface KnowledgeEntry extends BaseKnowledgeEntry {
  store?: KnowledgeStore;
}

// Entry type icons map
const EntryTypeIcons: Record<string, React.FC<{ className?: string }>> = {
  Gavel,
  Info,
  Lock,
  Lightbulb,
  Link: Link2,
  StickyNote,
};

// Scope icons
const ScopeIcons = {
  organization: Building2,
  goal: Target,
  plan: FileText,
};

// Type filter options
const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  ...ENTRY_TYPES.map(t => ({ value: t.value, label: t.label })),
];

// Scope filter options
const SCOPE_OPTIONS = [
  { value: 'all', label: 'All scopes' },
  { value: 'organization', label: 'Organizations' },
  { value: 'goal', label: 'Goals' },
  { value: 'plan', label: 'Plans' },
];

// Highlight text helper
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

// Format date helper
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Knowledge Entry Card Component
interface EntryCardProps {
  entry: KnowledgeEntry;
  highlight?: string;
  showScope?: boolean;
  onEdit?: (entry: KnowledgeEntry) => void;
  onDelete?: (entry: KnowledgeEntry) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, highlight, showScope, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const typeConfig = getEntryTypeConfig(entry.entry_type as EntryType);
  const IconComponent = EntryTypeIcons[typeConfig.iconName];

  return (
    <article className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${typeConfig.badgeClasses}`}>
            {IconComponent && <IconComponent className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {highlight ? highlightText(entry.title, highlight) : entry.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
              {highlight ? highlightText(entry.content, highlight) : entry.content}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
              {showScope && entry.store && (
                <span className="flex items-center gap-1 capitalize">
                  {entry.store.scope === 'organization' && <Building2 className="w-3 h-3" />}
                  {entry.store.scope === 'goal' && <Target className="w-3 h-3" />}
                  {entry.store.scope === 'plan' && <FileText className="w-3 h-3" />}
                  {entry.store.scope}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(entry.created_at)}
              </span>
              {entry.tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
              aria-label="Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(entry);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(entry);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {entry.source_url && (
        <a
          href={entry.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          Source
        </a>
      )}
    </article>
  );
};

// Knowledge Section Component (for grouped view)
interface KnowledgeSectionProps {
  store: KnowledgeStore;
  filters: { type: string };
  onEditEntry?: (entry: KnowledgeEntry) => void;
  onDeleteEntry?: (entry: KnowledgeEntry) => void;
}

const KnowledgeSection: React.FC<KnowledgeSectionProps> = ({
  store,
  filters,
  onEditEntry,
  onDeleteEntry,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { entries, loading, filterByType } = useKnowledgeStore(isExpanded ? store.id : null);

  // Apply type filter when expanded
  useEffect(() => {
    if (isExpanded && filters.type !== 'all') {
      filterByType(filters.type);
    } else if (isExpanded) {
      filterByType(null);
    }
  }, [isExpanded, filters.type, filterByType]);

  const ScopeIcon = ScopeIcons[store.scope as keyof typeof ScopeIcons] || BookOpen;

  const getScopeTitle = () => {
    switch (store.scope) {
      case 'organization':
        return store.name || 'Organization';
      case 'goal':
        return store.name || 'Goal';
      case 'plan':
        return store.name || 'Plan';
      default:
        return store.name || 'Knowledge Store';
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ScopeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">{getScopeTitle()}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({store.entry_count || 0} entries)
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-white dark:bg-gray-800">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              No entries in this store
            </p>
          ) : (
            entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={onEditEntry}
                onDelete={onDeleteEntry}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Add/Edit Entry Modal
interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: KnowledgeEntry | null;
  stores: KnowledgeStore[];
  defaultStoreId?: string;
  onSave: (storeId: string, data: any) => Promise<void>;
}

const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  entry,
  stores,
  defaultStoreId,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    store_id: entry?.store_id || defaultStoreId || '',
    entry_type: entry?.entry_type || 'note',
    title: entry?.title || '',
    content: entry?.content || '',
    source_url: entry?.source_url || '',
    tags: entry?.tags?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        store_id: entry?.store_id || defaultStoreId || stores[0]?.id || '',
        entry_type: entry?.entry_type || 'note',
        title: entry?.title || '',
        content: entry?.content || '',
        source_url: entry?.source_url || '',
        tags: entry?.tags?.join(', ') || '',
      });
      setError(null);
    }
  }, [isOpen, entry, defaultStoreId, stores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.store_id || !formData.title || !formData.content) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(formData.store_id, {
        entry_type: formData.entry_type,
        title: formData.title,
        content: formData.content,
        source_url: formData.source_url || undefined,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {entry ? 'Edit Entry' : 'Add Knowledge Entry'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Store *
              </label>
              <select
                value={formData.store_id}
                onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a store...</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.scope === 'organization' && '🏢 '}
                    {store.scope === 'goal' && '🎯 '}
                    {store.scope === 'plan' && '📋 '}
                    {store.name || store.scope}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type *
              </label>
              <select
                value={formData.entry_type}
                onChange={(e) => setFormData({ ...formData, entry_type: e.target.value as EntryType })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                {ENTRY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Brief summary..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Full details, context, reasoning..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="api, architecture, frontend"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source URL
              </label>
              <input
                type="url"
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {entry ? 'Save Changes' : 'Add Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Knowledge Hub Component
const KnowledgeHub: React.FC = () => {
  const { stores, loading: storesLoading, error: storesError, refetch: refetchStores } = useKnowledgeStores();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeEntry[]>([]);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState({ scope: 'all', type: 'all' });
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter stores by scope
  const filteredStores = useMemo(() => {
    if (filters.scope === 'all') return stores;
    return stores.filter((s) => s.scope === filters.scope);
  }, [stores, filters.scope]);

  // Search handler
  const handleSearch = useCallback(async () => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Use the first store's search function or implement global search
      // For now, search across all stores
      const allResults: KnowledgeEntry[] = [];
      for (const store of stores) {
        try {
          const results = await fetch(
            `${process.env.REACT_APP_API_URL || 'https://api.agentplanner.io'}/knowledge/search`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                query: searchQuery,
                store_id: store.id,
                limit: 10,
              }),
            }
          ).then((r) => r.json());
          if (results.results) {
            allResults.push(...results.results.map((r: any) => ({ ...r.entry, store })));
          }
        } catch {
          // Continue with other stores
        }
      }
      setSearchResults(allResults);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, stores]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [handleSearch]);

  // Save entry handler
  const handleSaveEntry = async (storeId: string, data: any) => {
    const token = localStorage.getItem('token');
    const baseUrl = process.env.REACT_APP_API_URL || 'https://api.agentplanner.io';

    if (editingEntry) {
      // Update existing entry
      await fetch(`${baseUrl}/knowledge/entries/${editingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      showNotification('Entry updated successfully', 'success');
    } else {
      // Create new entry
      await fetch(`${baseUrl}/knowledge/stores/${storeId}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      showNotification('Entry created successfully', 'success');
    }

    refetchStores();
    setEditingEntry(null);
  };

  // Delete entry handler
  const handleDeleteEntry = async (entry: KnowledgeEntry) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    const token = localStorage.getItem('token');
    const baseUrl = process.env.REACT_APP_API_URL || 'https://api.agentplanner.io';

    try {
      await fetch(`${baseUrl}/knowledge/entries/${entry.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showNotification('Entry deleted', 'success');
      refetchStores();
    } catch (err) {
      showNotification('Failed to delete entry', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Knowledge
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Search and browse knowledge across all your projects
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Entry
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search knowledge... (semantic search)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filters.scope}
              onChange={(e) => setFilters({ ...filters, scope: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              {SCOPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grouped')}
              className={`p-2 rounded ${
                viewMode === 'grouped'
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="Grouped view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`p-2 rounded ${
                viewMode === 'flat'
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {storesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : storesError ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-red-600 dark:text-red-400">{storesError}</p>
          </div>
        ) : searchQuery && searchQuery.length >= 2 ? (
          // Search Results
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchResults.length} results for "{searchQuery}"
            </p>
            {searchResults.length === 0 && !searching ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No results found</p>
              </div>
            ) : (
              searchResults.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  highlight={searchQuery}
                  showScope
                  onEdit={(e) => {
                    setEditingEntry(e);
                    setShowAddModal(true);
                  }}
                  onDelete={handleDeleteEntry}
                />
              ))
            )}
          </div>
        ) : filteredStores.length === 0 ? (
          // Empty State
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No knowledge stores yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create an organization or goal to start capturing knowledge.
            </p>
          </div>
        ) : viewMode === 'grouped' ? (
          // Grouped View
          <div className="space-y-4">
            {filteredStores.map((store) => (
              <KnowledgeSection
                key={store.id}
                store={store}
                filters={filters}
                onEditEntry={(e) => {
                  setEditingEntry(e);
                  setShowAddModal(true);
                }}
                onDeleteEntry={handleDeleteEntry}
              />
            ))}
          </div>
        ) : (
          // Flat View - show all entries
          <div className="space-y-3">
            {filteredStores.map((store) => (
              <FlatStoreEntries
                key={store.id}
                store={store}
                filters={filters}
                onEditEntry={(e) => {
                  setEditingEntry(e);
                  setShowAddModal(true);
                }}
                onDeleteEntry={handleDeleteEntry}
              />
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <EntryModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingEntry(null);
          }}
          entry={editingEntry}
          stores={stores}
          onSave={handleSaveEntry}
        />
      </div>
    </div>
  );
};

// Flat view entries component
const FlatStoreEntries: React.FC<{
  store: KnowledgeStore;
  filters: { type: string };
  onEditEntry: (entry: KnowledgeEntry) => void;
  onDeleteEntry: (entry: KnowledgeEntry) => void;
}> = ({ store, filters, onEditEntry, onDeleteEntry }) => {
  const { entries, loading, filterByType } = useKnowledgeStore(store.id);

  useEffect(() => {
    if (filters.type !== 'all') {
      filterByType(filters.type);
    } else {
      filterByType(null);
    }
  }, [filters.type, filterByType]);

  if (loading) return null;

  return (
    <>
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={{ ...entry, store }}
          showScope
          onEdit={onEditEntry}
          onDelete={onDeleteEntry}
        />
      ))}
    </>
  );
};

export default KnowledgeHub;
