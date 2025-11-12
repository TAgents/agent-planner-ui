import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter as FilterIcon,
  LayoutGrid,
  List,
  Sparkles,
  Target,
  Users,
  Clock,
  TrendingUp,
  ChevronRight,
  Folder,
  FolderOpen,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { usePlans } from '../hooks/usePlans';
import { useNodes } from '../hooks/useNodes';
import { formatDate } from '../utils/planUtils';
import { Plan, PlanNode } from '../types';
import { useWebSocket } from '../contexts/WebSocketContext';
import { PLAN_EVENTS } from '../types/websocket';

// Empty state component for first-time users
const EmptyPlansGuide: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center mb-6">
        <Folder className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Start Your Planning Journey
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
        Create your first plan to organize projects, track progress, and collaborate with your team.
      </p>

      {/* Quick Start Options */}
      <div className="flex justify-center mb-8">
        <Link
          to="/app/plans/new"
          className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all hover:scale-105 max-w-md"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
              <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Create Your First Plan</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Build your plan from scratch with full control over every detail
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Tips Section */}
      <div className="w-full max-w-2xl">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Popular Plan Types</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Target, label: 'Product Launch' },
            { icon: Users, label: 'Team Project' },
            { icon: Clock, label: 'Sprint Planning' },
            { icon: TrendingUp, label: 'Growth Strategy' },
          ].map((type, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <type.icon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{type.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Plan card component that fetches its own node data
const PlanCard: React.FC<{ plan: Plan; viewMode: 'grid' | 'list' }> = ({ plan, viewMode }) => {
  const { nodes, isLoading } = useNodes(plan.id);
  const { deletePlan, updatePlan } = usePlans();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const isArchived = plan.status === 'archived';

  // Calculate progress from actual nodes
  const nodeCount = nodes?.length || 0;
  const completedNodes = nodes?.filter(n => n.status === 'completed').length || 0;
  const inProgressNodes = nodes?.filter(n => n.status === 'in_progress').length || 0;
  const progress = nodeCount > 0 ? Math.round((completedNodes / nodeCount) * 100) : 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRestoreConfirm(true);
  };

  const confirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deletePlan.mutateAsync(plan.id);
    } catch (error) {
      console.error('Failed to archive plan:', error);
    }
    setShowDeleteConfirm(false);
  };

  const confirmRestore = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updatePlan.mutateAsync({
        planId: plan.id,
        data: { status: 'active' }
      });
    } catch (error) {
      console.error('Failed to restore plan:', error);
    }
    setShowRestoreConfirm(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const cancelRestore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRestoreConfirm(false);
  };

  // Determine status color classes
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="relative group">
        <Link
          to={`/app/plans/${plan.id}`}
          className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700 overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Title and Description */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {plan.title}
                </h3>
                {plan.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                    {plan.description}
                  </p>
                )}
              </div>

              {/* Stats Section */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {/* Node Count */}
                <div className="text-sm text-gray-500 dark:text-gray-400 min-w-[60px] text-right">
                  {isLoading ? (
                    <span className="inline-block w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ) : (
                    `${nodeCount} nodes`
                  )}
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10 text-right">
                    {isLoading ? '-' : `${progress}%`}
                  </span>
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusClasses(plan.status)}`}>
                  {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                </span>

                {/* Delete/Restore Button */}
                {isArchived ? (
                  <button
                    onClick={handleRestore}
                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Restore plan"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Archive plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Chevron */}
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </Link>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelDelete}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Archive Plan?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will archive "{plan.title}". You can restore it later from archived plans.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  disabled={deletePlan.isLoading}
                >
                  {deletePlan.isLoading ? 'Archiving...' : 'Archive'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restore Confirmation Modal */}
        {showRestoreConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelRestore}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Restore Plan?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will restore "{plan.title}" and set its status to Active.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelRestore}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRestore}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  disabled={updatePlan.isLoading}
                >
                  {updatePlan.isLoading ? 'Restoring...' : 'Restore'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      <Link
        to={`/app/plans/${plan.id}`}
        className="block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:scale-[1.02]"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusClasses(plan.status)}`}>
              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </span>
            {isArchived ? (
              <button
                onClick={handleRestore}
                className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Restore plan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Archive plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {plan.title}
        </h3>

        {plan.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {plan.description}
          </p>
        )}

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{isLoading ? '...' : `${progress}%`}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              {isLoading ? (
                <div className="h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
              ) : (
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
          </div>

          <div className="flex justify-between text-xs">
            <div className="text-gray-500 dark:text-gray-400">
              {isLoading ? (
                <span className="inline-block w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <span>
                  {nodeCount > 0 ? (
                    <>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{nodeCount}</span> nodes
                      {completedNodes > 0 && (
                        <span className="text-green-600 dark:text-green-400 ml-2">
                          • {completedNodes} done
                        </span>
                      )}
                      {inProgressNodes > 0 && (
                        <span className="text-blue-600 dark:text-blue-400 ml-2">
                          • {inProgressNodes} active
                        </span>
                      )}
                    </>
                  ) : (
                    'No nodes yet'
                  )}
                </span>
              )}
            </div>
            <span className="text-gray-500 dark:text-gray-400">
              {formatDate(plan.updated_at)}
            </span>
          </div>
        </div>
      </Link>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelDelete}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Archive Plan?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will archive "{plan.title}". You can restore it later from archived plans.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                disabled={deletePlan.isLoading}
              >
                {deletePlan.isLoading ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelRestore}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Restore Plan?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will restore "{plan.title}" and set its status to Active.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelRestore}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                disabled={updatePlan.isLoading}
              >
                {updatePlan.isLoading ? 'Restoring...' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PlansListSimplified: React.FC = () => {
  const { plans, isLoading, updatePlan, refetch } = usePlans(1, 100);
  const { subscribe } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'completed' | 'archived'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list view

  // Subscribe to WebSocket plan events for real-time updates
  useEffect(() => {
    console.log('[PlansListSimplified] Setting up WebSocket subscriptions');

    // Subscribe to plan.created events
    const unsubscribeCreated = subscribe(PLAN_EVENTS.CREATED, (message) => {
      console.log('[PlansListSimplified] Received plan.created event:', message);
      // Refetch plans list to include the new plan
      refetch();
    });

    // Subscribe to plan.deleted events
    const unsubscribeDeleted = subscribe(PLAN_EVENTS.DELETED, (message) => {
      console.log('[PlansListSimplified] Received plan.deleted event:', message);
      // Refetch plans list to remove the deleted plan
      refetch();
    });

    // Cleanup subscriptions on unmount
    return () => {
      console.log('[PlansListSimplified] Cleaning up WebSocket subscriptions');
      unsubscribeCreated();
      unsubscribeDeleted();
    };
  }, [subscribe, refetch]);

  // Filter plans
  const filteredPlans = plans.filter((plan: Plan) => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // "all" excludes archived plans by default
    let matchesStatus = false;
    if (filterStatus === 'all') {
      matchesStatus = plan.status !== 'archived';
    } else {
      matchesStatus = plan.status === filterStatus;
    }

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Plans</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {plans.length > 0 
                ? `${plans.length} plan${plans.length !== 1 ? 's' : ''} in your workspace`
                : 'Create your first plan to get started'
              }
            </p>
          </div>
          
          {plans.length > 0 && (
            <div className="flex items-center gap-3">
              <Link
                to="/app/plans/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Plan
              </Link>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        {plans.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {(['all', 'active', 'draft', 'completed', 'archived'] as const).map(status => {
                  // Count plans for each status
                  const count = status === 'all'
                    ? plans.filter((p: Plan) => p.status !== 'archived').length
                    : plans.filter((p: Plan) => p.status === status).length;

                  return (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                        filterStatus === status
                          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                      {count > 0 && (
                        <span className="ml-1.5 text-xs opacity-60">({count})</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plans Grid/List or Empty State */}
      {plans.length === 0 ? (
        <EmptyPlansGuide />
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No plans found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-3'
        }>
          {filteredPlans.map((plan: Plan) => (
            <PlanCard key={plan.id} plan={plan} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlansListSimplified;
