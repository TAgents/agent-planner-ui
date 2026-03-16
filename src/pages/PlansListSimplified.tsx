import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List,
  Target,
  Users,
  Clock,
  TrendingUp,
  ChevronRight,
  FileText,
  FolderOpen,
  Trash2,
  RotateCcw,
  Lock,
  Unlock,
  HelpCircle,
  ArrowUpDown,
  Plus,
  LayoutTemplate,
  Rocket,
  FlaskConical,
  Bot,
  MessageSquare,
  Plug,
  ExternalLink,
  Circle,
  RotateCw,
  Check,
  Archive
} from 'lucide-react';
import { usePlans } from '../hooks/usePlans';
import { useNodes } from '../hooks/useNodes';
import { formatDate } from '../utils/planUtils';
import { formatDistanceToNow } from '../utils/dateUtils';
import { Plan } from '../types';
import { useWebSocket } from '../contexts/WebSocketContext';
import { PLAN_EVENTS } from '../types/websocket';
// import { decisionsApi } from '../services/api';

// Sort options
const SORT_OPTIONS = [
  { value: 'updated_desc', label: 'Recent' },
  { value: 'created_desc', label: 'Newest' },
  { value: 'created_asc', label: 'Oldest' },
  { value: 'title_asc', label: 'A-Z' },
  { value: 'progress_desc', label: 'Progress' },
];

// Status accent colors for left border
const statusAccentColors: Record<string, string> = {
  active: 'border-l-amber-400',
  completed: 'border-l-emerald-400',
  draft: 'border-l-gray-300 dark:border-l-gray-600',
  archived: 'border-l-gray-300 dark:border-l-gray-500',
};

// Hook to batch fetch pending decision counts for all plans
// DISABLED: Causes 429 rate limiting when fetching for many plans simultaneously
// TODO: Re-enable when backend has batch endpoint (GET /decisions/counts?plan_ids=...)
function usePendingDecisionCounts(_planIds: string[]) {
  // Return empty counts to avoid rate limiting
  // Pending decisions will show in the notification bell instead
  return {} as Record<string, number>;
}

// Template definitions for quick plan creation
const PLAN_TEMPLATES = [
  {
    icon: Rocket,
    label: 'Software Project',
    description: 'Ship features with milestones, tasks, and team coordination',
    template: 'software-project',
  },
  {
    icon: Target,
    label: 'Product Launch',
    description: 'Plan and execute a product launch from start to finish',
    template: 'product-launch',
  },
  {
    icon: Clock,
    label: 'Sprint Planning',
    description: 'Organize work into sprints with clear deliverables',
    template: 'sprint-planning',
  },
  {
    icon: FlaskConical,
    label: 'Research Project',
    description: 'Structure research with phases, findings, and outcomes',
    template: 'research-project',
  },
];

// Agent integration options for the empty state
const AGENT_INTEGRATIONS = [
  {
    icon: MessageSquare,
    label: 'Slack + OpenClaw',
    description: 'Connect your Slack workspace and let agents collaborate through OpenClaw',
    link: 'https://docs.agentplanner.io/integrations/slack',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Bot,
    label: 'Claude with MCP',
    description: 'Configure Claude Desktop or API with the AgentPlanner MCP server',
    link: 'https://docs.agentplanner.io/integrations/mcp',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Bot,
    label: 'ChatGPT with MCP',
    description: 'Set up ChatGPT to interact with your plans via MCP',
    link: 'https://docs.agentplanner.io/integrations/mcp',
    color: 'from-green-500 to-teal-500',
  },
  {
    icon: Plug,
    label: 'REST API',
    description: 'Integrate any agent or tool using the AgentPlanner REST API',
    link: 'https://docs.agentplanner.io/api',
    color: 'from-blue-500 to-cyan-500',
  },
];

// Empty state component for first-time users
const EmptyPlansGuide: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-8">
      {/* Hero section */}
      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-6">
        <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Configure Your Agent
      </h3>

      <p className="text-gray-600 dark:text-gray-400 text-center max-w-lg mb-10">
        Connect an AI agent to start creating and managing plans. Choose an integration below to get started.
      </p>

      {/* Agent integration cards */}
      <div className="w-full max-w-2xl mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AGENT_INTEGRATIONS.map((integration) => (
            <a
              key={integration.label}
              href={integration.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group"
            >
              <div className={`p-2 bg-gradient-to-br ${integration.color} rounded-lg`}>
                <integration.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  {integration.label}
                  <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h6>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{integration.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 w-full max-w-2xl mb-10">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">or create a plan manually</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Manual plan creation */}
      <Link
        to="/app/plans/new"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all mb-8"
      >
        <Plus className="w-5 h-5" />
        Start from scratch
      </Link>

      {/* Templates */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <LayoutTemplate className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Or use a template</h5>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PLAN_TEMPLATES.map((tmpl) => (
            <Link
              key={tmpl.template}
              to={`/app/plans/new?template=${tmpl.template}`}
              className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group"
            >
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <tmpl.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="text-sm font-semibold text-gray-900 dark:text-white">{tmpl.label}</h6>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{tmpl.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Confirmation modal component (shared by delete/restore)
const ConfirmModal: React.FC<{
  title: string;
  message: string;
  confirmLabel: string;
  loadingLabel: string;
  isLoading: boolean;
  variant: 'danger' | 'success';
  onConfirm: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
}> = ({ title, message, confirmLabel, loadingLabel, isLoading, variant, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onCancel}>
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{message}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
            variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isLoading ? loadingLabel : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// Enhanced Plan card component that fetches its own node data
const PlanCard: React.FC<{
  plan: Plan;
  viewMode: 'grid' | 'list';
  pendingDecisionsCount?: number;
}> = ({ plan, viewMode, pendingDecisionsCount = 0 }) => {
  const { nodes, isLoading } = useNodes(plan.id);
  const { deletePlan, updatePlan } = usePlans();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const isArchived = plan.status === 'archived';

  // Extract visibility information
  const isPublic = plan.visibility === 'public' || plan.metadata?.is_public === true;

  // Calculate progress from actual nodes
  const nodeCount = nodes?.length || 0;
  const completedNodes = nodes?.filter(n => n.status === 'completed').length || 0;
  const inProgressNodes = nodes?.filter(n => n.status === 'in_progress').length || 0;
  const blockedNodes = nodes?.filter(n => n.status === 'blocked').length || 0;
  const progress = nodeCount > 0 ? Math.round((completedNodes / nodeCount) * 100) : 0;

  const handleDelete = async (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(true); };
  const handleRestore = async (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setShowRestoreConfirm(true); };
  const confirmDelete = async (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); try { await deletePlan.mutateAsync(plan.id); } catch (error) { console.error('Failed to archive plan:', error); } setShowDeleteConfirm(false); };
  const confirmRestore = async (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); try { await updatePlan.mutateAsync({ planId: plan.id, data: { status: 'active' } }); } catch (error) { console.error('Failed to restore plan:', error); } setShowRestoreConfirm(false); };
  const cancelDelete = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(false); };
  const cancelRestore = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setShowRestoreConfirm(false); };

  // Segmented progress bar widths
  const completedWidth = nodeCount > 0 ? (completedNodes / nodeCount) * 100 : 0;
  const inProgressWidth = nodeCount > 0 ? (inProgressNodes / nodeCount) * 100 : 0;
  const blockedWidth = nodeCount > 0 ? (blockedNodes / nodeCount) * 100 : 0;

  if (viewMode === 'list') {
    return (
      <div className="relative group">
        <Link
          to={`/app/plans/${plan.id}`}
          className={`block bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all duration-150 overflow-hidden border-l-[3px] ${statusAccentColors[plan.status] || 'border-l-gray-300'}`}
        >
          <div className="px-4 py-3">
            {/* Mobile layout */}
            <div className="flex flex-col gap-2 sm:hidden">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm text-gray-900 dark:text-white leading-tight line-clamp-1 flex-1" title={plan.title}>
                  {plan.title}
                </h3>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              </div>
              {plan.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{plan.description}</p>
              )}
              <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
                <span>{nodeCount} nodes</span>
                <span>{formatDistanceToNow(plan.updated_at)}</span>
                <span className="tabular-nums font-medium">{progress}%</span>
              </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden sm:flex items-center gap-4">
              {/* Title + Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={plan.title}>
                    {plan.title}
                  </h3>
                  {isPublic && (
                    <span title="Public"><Unlock className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" /></span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{plan.description}</p>
                )}
              </div>

              {/* Stats — compact */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                  {nodeCount} nodes
                </span>

                <span className="text-[11px] text-gray-400 dark:text-gray-500 hidden lg:block" title={formatDate(plan.updated_at)}>
                  {formatDistanceToNow(plan.updated_at)}
                </span>

                {/* Segmented progress bar */}
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                    {completedWidth > 0 && <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${completedWidth}%` }} />}
                    {inProgressWidth > 0 && <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${inProgressWidth}%` }} />}
                    {blockedWidth > 0 && <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${blockedWidth}%` }} />}
                  </div>
                  <span className="text-[11px] tabular-nums font-medium text-gray-500 dark:text-gray-400 w-7 text-right">
                    {isLoading ? '-' : `${progress}%`}
                  </span>
                </div>

                {pendingDecisionsCount > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <HelpCircle className="w-3 h-3" />
                    {pendingDecisionsCount}
                  </span>
                )}

                {/* Archive/Restore */}
                {isArchived ? (
                  <button onClick={handleRestore} className="p-1 text-gray-300 hover:text-emerald-500 dark:text-gray-600 dark:hover:text-emerald-400 rounded transition-colors opacity-0 group-hover:opacity-100" title="Restore">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button onClick={handleDelete} className="p-1 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100" title="Archive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              </div>
            </div>
          </div>
        </Link>

        {showDeleteConfirm && (
          <ConfirmModal title="Archive Plan?" message={`This will archive "${plan.title}". You can restore it later.`}
            confirmLabel="Archive" loadingLabel="Archiving..." isLoading={deletePlan.isLoading} variant="danger"
            onConfirm={confirmDelete} onCancel={cancelDelete} />
        )}
        {showRestoreConfirm && (
          <ConfirmModal title="Restore Plan?" message={`This will restore "${plan.title}" and set it to Active.`}
            confirmLabel="Restore" loadingLabel="Restoring..." isLoading={updatePlan.isLoading} variant="success"
            onConfirm={confirmRestore} onCancel={cancelRestore} />
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className="relative group">
      <Link
        to={`/app/plans/${plan.id}`}
        className={`block p-4 bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 border-l-[3px] ${statusAccentColors[plan.status] || 'border-l-gray-300'}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {isPublic && <span title="Public"><Unlock className="w-3 h-3 text-gray-400" /></span>}
          </div>
          <div className="flex items-center gap-1">
            {isArchived ? (
              <button onClick={handleRestore} className="p-1 text-gray-300 hover:text-emerald-500 dark:text-gray-600 rounded transition-colors opacity-0 group-hover:opacity-100" title="Restore">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button onClick={handleDelete} className="p-1 text-gray-300 hover:text-red-500 dark:text-gray-600 rounded transition-colors opacity-0 group-hover:opacity-100" title="Archive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 leading-snug" title={plan.title}>
          {plan.title}
        </h3>

        {plan.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">{plan.description}</p>
        )}

        <div className="space-y-2">
          {/* Segmented progress bar */}
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
            {completedWidth > 0 && <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${completedWidth}%` }} />}
            {inProgressWidth > 0 && <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${inProgressWidth}%` }} />}
            {blockedWidth > 0 && <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${blockedWidth}%` }} />}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
            <span>
              {isLoading ? '...' : (
                <>
                  {completedNodes}/{nodeCount} done
                  {inProgressNodes > 0 && <span className="text-amber-500 ml-1.5">{inProgressNodes} active</span>}
                </>
              )}
            </span>
            <span>{formatDistanceToNow(plan.updated_at)}</span>
          </div>
        </div>
      </Link>

      {showDeleteConfirm && (
        <ConfirmModal title="Archive Plan?" message={`This will archive "${plan.title}". You can restore it later.`}
          confirmLabel="Archive" loadingLabel="Archiving..." isLoading={deletePlan.isLoading} variant="danger"
          onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}
      {showRestoreConfirm && (
        <ConfirmModal title="Restore Plan?" message={`This will restore "${plan.title}" and set it to Active.`}
          confirmLabel="Restore" loadingLabel="Restoring..." isLoading={updatePlan.isLoading} variant="success"
          onConfirm={confirmRestore} onCancel={cancelRestore} />
      )}
    </div>
  );
};

const PlansListSimplified: React.FC = () => {
  const { plans, isLoading, refetch } = usePlans(1, 100);
  const { subscribe } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'completed' | 'archived'>('active');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('updated_desc'); // Default to recently active

  // Force list view on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setViewMode('list');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Batch fetch pending decision counts for all plans
  const planIds = useMemo(() => plans.map((p: Plan) => p.id), [plans]);
  const pendingDecisionCounts = usePendingDecisionCounts(planIds);

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

  // Sort plans based on selected sort option
  const sortedPlans = useMemo(() => {
    const sorted = [...filteredPlans];
    
    switch (sortBy) {
      case 'updated_desc':
        sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case 'created_desc':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'created_asc':
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'title_asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'progress_desc':
        sorted.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        break;
      default:
        sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
    
    return sorted;
  }, [filteredPlans, sortBy]);

  // Status filter counts
  const statusCounts = useMemo(() => ({
    all: plans.filter((p: Plan) => p.status !== 'archived').length,
    active: plans.filter((p: Plan) => p.status === 'active').length,
    draft: plans.filter((p: Plan) => p.status === 'draft').length,
    completed: plans.filter((p: Plan) => p.status === 'completed').length,
    archived: plans.filter((p: Plan) => p.status === 'archived').length,
  }), [plans]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header — compact, integrated */}
      <div className="border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Title + search row */}
          <div className="flex items-center gap-4 py-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Plans</h1>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                {plans.length}
              </span>
            </div>

            {/* Search — inline, grows */}
            {plans.length > 0 && (
              <div className="flex-1 relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                />
              </div>
            )}

            {/* Right side controls */}
            {plans.length > 0 && (
              <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none text-[11px] text-gray-500 dark:text-gray-400 bg-transparent border-0 pr-4 py-1 cursor-pointer focus:ring-0 focus:outline-none"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                {/* View toggle — only show when > 2 plans */}
                {plans.length > 2 && (
                  <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800/50 rounded-md p-0.5 border border-gray-200/60 dark:border-gray-800/60">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400'}`}
                      title="Grid"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400'}`}
                      title="List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter pills — single row, tight */}
          {plans.length > 0 && (
            <div className="flex items-center gap-1 pb-2.5 -mt-0.5 overflow-x-auto">
              {(['all', 'active', 'draft', 'completed', 'archived'] as const).map(status => {
                const count = statusCounts[status];
                const isSelected = filterStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    {count > 0 && <span className={`ml-1 tabular-nums ${isSelected ? 'opacity-70' : 'opacity-50'}`}>{count}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        {plans.length === 0 ? (
          <EmptyPlansGuide />
        ) : sortedPlans.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No plans match your search</p>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
            : 'space-y-1.5'
          }>
            {sortedPlans.map((plan: Plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                viewMode={viewMode}
                pendingDecisionsCount={pendingDecisionCounts[plan.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansListSimplified;
