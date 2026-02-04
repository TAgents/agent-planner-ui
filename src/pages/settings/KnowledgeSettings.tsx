import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  useKnowledgeStores,
  useKnowledgeStore,
  KnowledgeEntry,
  KnowledgeStore,
  ENTRY_TYPES,
  getEntryTypeConfig,
  EntryType,
} from '../../hooks/useKnowledge';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useGoals } from '../../hooks/useGoals';
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
  User,
  Key,
  // Entry type icons
  Gavel,
  Info,
  Lock,
  Lightbulb,
  Link2,
  StickyNote,
  Database,
} from 'lucide-react';

// Map icon names to components
const EntryTypeIcons: Record<string, React.FC<{ className?: string }>> = {
  Gavel,
  Info,
  Lock,
  Lightbulb,
  Link: Link2,
  StickyNote,
};

// Settings Navigation Tabs Component
const SettingsNav: React.FC = () => {
  const location = useLocation();
  
  const tabs = [
    { path: '/app/settings', label: 'API Tokens', icon: Key },
    { path: '/app/settings/organization', label: 'Organizations', icon: Building2 },
    { path: '/app/settings/goals', label: 'Goals', icon: Target },
    { path: '/app/settings/knowledge', label: 'Knowledge', icon: BookOpen },
  ];

  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      <nav className="flex gap-4">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

// Helper component to render entry type icon
const EntryTypeIcon: React.FC<{ iconName: string; className?: string }> = ({ iconName, className }) => {
  const IconComponent = EntryTypeIcons[iconName];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
};

// Scope group item type
interface ScopeItem {
  id: string;
  name: string;
  scope: 'organization' | 'goal' | 'plan';
  store?: KnowledgeStore;
  parentName?: string;
}

const KnowledgeSettings: React.FC = () => {
  const { organizations, loading: orgsLoading } = useOrganizations();
  const { goals, loading: goalsLoading } = useGoals();
  
  // Get all stores (without scope filter to group them ourselves)
  const { stores, loading: storesLoading, error: storesError } = useKnowledgeStores();
  
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [expandedScopes, setExpandedScopes] = useState<Record<string, boolean>>({
    organization: true,
    goal: false,
    plan: false,
  });

  const {
    store: selectedStore,
    entries,
    loading: entriesLoading,
    error: entriesError,
    hasMore,
    loadMore,
    createEntry,
    updateEntry,
    deleteEntry,
    filterByType,
    currentFilter,
  } = useKnowledgeStore(selectedStoreId);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState<KnowledgeEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    entry_type: 'note' as EntryType,
    title: '',
    content: '',
    source_url: '',
    tags: '',
  });

  // Group stores by scope type
  const storesByScope = useMemo(() => {
    const grouped: Record<string, ScopeItem[]> = {
      organization: [],
      goal: [],
      plan: [],
    };

    // Create a map of store by scope_id for quick lookup
    const storeByScope: Record<string, KnowledgeStore> = {};
    stores.forEach(store => {
      storeByScope[`${store.scope}-${store.scope_id}`] = store;
    });

    // Add organizations
    organizations.forEach(org => {
      const store = storeByScope[`organization-${org.id}`];
      grouped.organization.push({
        id: org.id,
        name: org.name,
        scope: 'organization',
        store,
      });
    });

    // Add goals
    goals.forEach(goal => {
      const store = storeByScope[`goal-${goal.id}`];
      const org = organizations.find(o => o.id === goal.organization_id);
      grouped.goal.push({
        id: goal.id,
        name: goal.title,
        scope: 'goal',
        store,
        parentName: org?.name,
      });
    });

    // Add plans from stores (we don't have a plans hook here, so use stores)
    stores
      .filter(s => s.scope === 'plan')
      .forEach(store => {
        grouped.plan.push({
          id: store.scope_id,
          name: `Plan ${store.scope_id.slice(0, 8)}...`,
          scope: 'plan',
          store,
        });
      });

    return grouped;
  }, [organizations, goals, stores]);

  const toggleScope = (scope: string) => {
    setExpandedScopes(prev => ({ ...prev, [scope]: !prev[scope] }));
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const resetForm = () => {
    setFormData({
      entry_type: 'note',
      title: '',
      content: '',
      source_url: '',
      tags: '',
    });
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      await createEntry({
        entry_type: formData.entry_type,
        title: formData.title.trim(),
        content: formData.content.trim(),
        source_url: formData.source_url.trim() || undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setShowCreateDialog(false);
      resetForm();
      showNotification('Entry created successfully', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to create entry', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!showEditDialog || !formData.title.trim() || !formData.content.trim()) return;

    try {
      await updateEntry(showEditDialog.id, {
        entry_type: formData.entry_type,
        title: formData.title.trim(),
        content: formData.content.trim(),
        source_url: formData.source_url.trim() || undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setShowEditDialog(null);
      resetForm();
      showNotification('Entry updated successfully', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update entry', 'error');
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      await deleteEntry(entryId);
      setShowDeleteConfirm(null);
      showNotification('Entry deleted', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete entry', 'error');
    }
  };

  const openEditDialog = (entry: KnowledgeEntry) => {
    setFormData({
      entry_type: entry.entry_type,
      title: entry.title,
      content: entry.content,
      source_url: entry.source_url || '',
      tags: entry.tags?.join(', ') || '',
    });
    setShowEditDialog(entry);
  };

  const getScopeIcon = (type: string) => {
    switch (type) {
      case 'organization':
        return <Building2 className="w-4 h-4" />;
      case 'goal':
        return <Target className="w-4 h-4" />;
      case 'plan':
        return <FileText className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getScopeColor = (type: string) => {
    switch (type) {
      case 'organization':
        return 'from-blue-500 to-purple-600';
      case 'goal':
        return 'from-orange-500 to-red-600';
      case 'plan':
        return 'from-green-500 to-teal-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const filteredEntries = entries.filter(entry =>
    searchQuery
      ? entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const isLoading = orgsLoading || goalsLoading || storesLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Capture decisions, context, constraints, and learnings
          </p>
        </div>

        {/* Settings Navigation */}
        <SettingsNav />

        {/* Notification */}
        {notification && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}
          >
            {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel: Stores grouped by scope */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Knowledge Stores
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Browse by organization, goal, or plan
                </p>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </div>
              ) : storesError ? (
                <div className="p-4 text-center text-red-600 dark:text-red-400">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                  {storesError}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Organization Scope */}
                  <div>
                    <button
                      onClick={() => toggleScope('organization')}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-900 dark:text-white">Organizations</span>
                        <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                          {storesByScope.organization.length}
                        </span>
                      </div>
                      {expandedScopes.organization ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {expandedScopes.organization && (
                      <div className="bg-gray-50 dark:bg-gray-900/50">
                        {storesByScope.organization.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                            No organizations
                          </p>
                        ) : (
                          storesByScope.organization.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => item.store && setSelectedStoreId(item.store.id)}
                              disabled={!item.store}
                              className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                                selectedStoreId === item.store?.id
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 border-l-2 border-transparent'
                              } ${!item.store ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getScopeColor('organization')} flex items-center justify-center text-white text-sm font-medium`}>
                                {item.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.store ? `${item.store.entry_count || 0} entries` : 'No store'}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Goal Scope */}
                  <div>
                    <button
                      onClick={() => toggleScope('goal')}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-500" />
                        <span className="font-medium text-gray-900 dark:text-white">Goals</span>
                        <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                          {storesByScope.goal.length}
                        </span>
                      </div>
                      {expandedScopes.goal ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {expandedScopes.goal && (
                      <div className="bg-gray-50 dark:bg-gray-900/50">
                        {storesByScope.goal.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                            No goals
                          </p>
                        ) : (
                          storesByScope.goal.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => item.store && setSelectedStoreId(item.store.id)}
                              disabled={!item.store}
                              className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                                selectedStoreId === item.store?.id
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 border-l-2 border-transparent'
                              } ${!item.store ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getScopeColor('goal')} flex items-center justify-center text-white`}>
                                <Target className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {item.parentName || 'Unknown org'} • {item.store ? `${item.store.entry_count || 0} entries` : 'No store'}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Plan Scope */}
                  <div>
                    <button
                      onClick={() => toggleScope('plan')}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-gray-900 dark:text-white">Plans</span>
                        <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                          {storesByScope.plan.length}
                        </span>
                      </div>
                      {expandedScopes.plan ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {expandedScopes.plan && (
                      <div className="bg-gray-50 dark:bg-gray-900/50">
                        {storesByScope.plan.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                            No plan knowledge stores
                          </p>
                        ) : (
                          storesByScope.plan.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => item.store && setSelectedStoreId(item.store.id)}
                              className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                                selectedStoreId === item.store?.id
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 border-l-2 border-transparent'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getScopeColor('plan')} flex items-center justify-center text-white`}>
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.store?.entry_count || 0} entries
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Entries */}
          <div className="lg:col-span-3">
            {!selectedStoreId ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">Select a knowledge store from the left panel</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Browse by organization, goal, or plan to view knowledge entries
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header with actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      {selectedStore && getScopeIcon(selectedStore.scope)}
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {selectedStore?.scope} Knowledge
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {entries.length} entries
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      {/* Filter by type */}
                      <div className="relative">
                        <select
                          value={currentFilter || ''}
                          onChange={(e) => filterByType(e.target.value || null)}
                          className="appearance-none pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">All Types</option>
                          {ENTRY_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>

                      {/* Add entry */}
                      <button
                        onClick={() => {
                          resetForm();
                          setShowCreateDialog(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Entry
                      </button>
                    </div>
                  </div>
                </div>

                {/* Entry type stats */}
                {selectedStore && selectedStore.entries_by_type && Object.keys(selectedStore.entries_by_type).length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {ENTRY_TYPES.map((type) => {
                      const count = selectedStore.entries_by_type?.[type.value] || 0;
                      if (count === 0) return null;
                      return (
                        <button
                          key={type.value}
                          onClick={() => filterByType(currentFilter === type.value ? null : type.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                            currentFilter === type.value
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <EntryTypeIcon iconName={type.iconName} className="w-3 h-3" />
                          {type.label}
                          <span className="bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-full text-xs">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Entries list */}
                {entriesLoading ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : entriesError ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <p className="text-red-600 dark:text-red-400">{entriesError}</p>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery || currentFilter ? 'No matching entries found' : 'No knowledge entries yet'}
                    </p>
                    {!searchQuery && !currentFilter && (
                      <button
                        onClick={() => {
                          resetForm();
                          setShowCreateDialog(true);
                        }}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Create your first entry
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEntries.map((entry) => {
                      const typeConfig = getEntryTypeConfig(entry.entry_type);
                      return (
                        <div
                          key={entry.id}
                          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${typeConfig.badgeClasses}`}
                                >
                                  <EntryTypeIcon iconName={typeConfig.iconName} className="w-3 h-3" />
                                  {typeConfig.label}
                                </span>
                                {entry.source_url && (
                                  <a
                                    href={entry.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Source
                                  </a>
                                )}
                              </div>

                              <h3 className="font-medium text-gray-900 dark:text-white mb-1">{entry.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{entry.content}</p>

                              {entry.tags && entry.tags.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                  <Tag className="w-3 h-3 text-gray-400" />
                                  {entry.tags.map((tag, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(entry.created_at).toLocaleDateString()}
                                </span>
                                {entry.created_by_user && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {entry.created_by_user.name || entry.created_by_user.email}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditDialog(entry)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(entry.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {hasMore && (
                      <div className="text-center pt-4">
                        <button
                          onClick={loadMore}
                          className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium transition-colors"
                        >
                          Load More
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {(showCreateDialog || showEditDialog) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(null);
              resetForm();
            }}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {showEditDialog ? 'Edit Entry' : 'Create Entry'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setShowEditDialog(null);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Entry Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ENTRY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, entry_type: type.value })}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          formData.entry_type === type.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <EntryTypeIcon iconName={type.iconName} className="w-5 h-5 mb-1 text-gray-600 dark:text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Brief title for this entry"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={6}
                    placeholder="Detailed content of the knowledge entry..."
                  />
                </div>

                {/* Source URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source URL (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="architecture, frontend, api"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setShowEditDialog(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditDialog ? handleUpdate : handleCreate}
                  disabled={!formData.title.trim() || !formData.content.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {showEditDialog ? 'Save Changes' : 'Create Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Entry?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This action cannot be undone. This knowledge entry will be permanently deleted.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeSettings;
