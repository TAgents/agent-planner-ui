import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  ArrowLeft,
  Eye,
  Calendar,
  User,
  GitBranch,
  Loader2,
  Copy,
  AlertCircle,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { planService } from '../services/api';
import { formatDate } from '../utils/planUtils';
import { useAuth } from '../hooks/useAuth';
import { PlanTreeView } from '../components/tree/PlanTreeView';
import { PlanNode } from '../types';
import ClonePlanModal from '../components/explore/ClonePlanModal';

// The v2 API returns nodes in camelCase with children tree structure
interface ApiNode {
  id: string;
  planId: string;
  parentId?: string | null;
  nodeType: string;
  title: string;
  description?: string;
  status: string;
  orderIndex: number;
  dueDate?: string;
  context?: string;
  agentInstructions?: string;
  taskMode?: string;
  metadata?: Record<string, any>;
  commentCount?: number;
  logCount?: number;
  assignedAgentId?: string;
  assignedAgentAt?: string;
  assignedAgentBy?: string;
  createdAt: string;
  updatedAt: string;
  children?: ApiNode[];
}

// v2 getPublicPlan returns a flat object (not wrapped in {plan, structure})
interface PublicPlanApiResponse {
  id: string;
  title: string;
  description?: string;
  status: string;
  visibility: string;
  is_public: boolean;
  view_count: number;
  owner_id: string;
  github_repo_owner?: string;
  github_repo_name?: string;
  github_repo_url?: string;
  github_repo_full_name?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  last_viewed_at?: string;
  owner: {
    id: string;
    name: string;
  } | null;
  nodes: ApiNode[];
}

/** Convert a camelCase API node to snake_case PlanNode */
function apiNodeToPlanNode(node: ApiNode): PlanNode {
  return {
    id: node.id,
    plan_id: node.planId,
    parent_id: node.parentId || undefined,
    node_type: node.nodeType as PlanNode['node_type'],
    title: node.title,
    description: node.description,
    status: node.status as PlanNode['status'],
    order_index: node.orderIndex,
    due_date: node.dueDate,
    context: node.context,
    agent_instructions: node.agentInstructions,
    task_mode: node.taskMode as PlanNode['task_mode'],
    metadata: node.metadata,
    comment_count: node.commentCount,
    log_count: node.logCount,
    assigned_agent_id: node.assignedAgentId,
    assigned_agent_at: node.assignedAgentAt,
    assigned_agent_by: node.assignedAgentBy,
    created_at: node.createdAt,
    updated_at: node.updatedAt,
  };
}

/** Flatten a tree of ApiNodes into a flat PlanNode[] array */
function flattenApiNodes(nodes: ApiNode[]): PlanNode[] {
  const result: PlanNode[] = [];
  function walk(node: ApiNode) {
    result.push(apiNodeToPlanNode(node));
    if (node.children) {
      node.children.forEach(walk);
    }
  }
  nodes.forEach(walk);
  return result;
}

const PublicPlanView: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId: currentUserId } = useAuth();

  const [showCloneModal, setShowCloneModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { data: response, isLoading, error } = useQuery<PublicPlanApiResponse>(
    ['publicPlan', planId],
    () => planService.getPublicPlan(planId!),
    {
      enabled: !!planId,
      retry: 1,
      onError: (err: any) => {
        console.error('Error fetching public plan:', err);
      },
    }
  );

  // Flatten tree nodes into flat PlanNode[] for PlanTreeView
  const flatNodes = useMemo(() => {
    if (!response?.nodes) return [];
    return flattenApiNodes(response.nodes);
  }, [response]);

  // Compute progress from node stats
  const nodeStats = useMemo(() => {
    // Exclude root node from stats
    const nonRoot = flatNodes.filter(n => n.node_type !== 'root');
    const total = nonRoot.length;
    const completed = nonRoot.filter(n => n.status === 'completed').length;
    const in_progress = nonRoot.filter(n => n.status === 'in_progress').length;
    const blocked = nonRoot.filter(n => n.status === 'blocked').length;
    const not_started = total - completed - in_progress - blocked;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, in_progress, blocked, not_started, progress };
  }, [flatNodes]);

  const handleUseAsTemplate = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowCloneModal(true);
  };

  const isPlanOwner = response?.owner?.id === currentUserId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading plan...</p>
        </div>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Plan Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This plan doesn't exist or is not publicly accessible.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{`${response.title} — AgentPlanner`}</title>
        <meta name="description" content={response.description || `View the plan "${response.title}" on AgentPlanner.`} />
        <meta property="og:title" content={`${response.title} — AgentPlanner`} />
        <meta property="og:description" content={response.description || `View the plan "${response.title}" on AgentPlanner.`} />
        <meta property="og:url" content={`https://agentplanner.io/public/plans/${response.id}`} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://agentplanner.io/public/plans/${response.id}`} />
      </Helmet>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Explore</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Eye className="w-4 h-4" />
                <span>{response.view_count} views</span>
              </div>

              {/* Clone Plan Button */}
              {isAuthenticated && !isPlanOwner && (
                <button
                  onClick={handleUseAsTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  title="Clone this plan to your workspace"
                >
                  <Copy className="w-4 h-4" />
                  <span>Clone Plan</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Header */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {response.title}
              </h1>
              {response.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {response.description}
                </p>
              )}
            </div>
            {response.status && (
              <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                response.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                response.status === 'active' || response.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {response.status.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Plan Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {response.owner && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {response.owner.name}
                  </p>
                  <p className="text-xs">Plan Owner</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(response.created_at)}
                </p>
                <p className="text-xs">Created</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <GitBranch className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {nodeStats.total} nodes
                </p>
                <p className="text-xs">Total Items</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {nodeStats.total > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {nodeStats.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${nodeStats.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                <span>{nodeStats.completed} completed</span>
                <span>{nodeStats.in_progress} in progress</span>
                <span>{nodeStats.not_started} not started</span>
              </div>
            </div>
          )}
        </div>

        {/* Plan Structure - using shared PlanTreeView in read-only mode */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <GitBranch className="w-6 h-6" />
            Plan Structure
          </h2>

          {flatNodes.length > 0 ? (
            <PlanTreeView
              nodes={flatNodes}
              selectedNodeId={selectedNodeId}
              onNodeSelect={(nodeId) => setSelectedNodeId(nodeId)}
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              This plan doesn't have any nodes yet.
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Powered by <span className="font-semibold">Talking Agents</span> - Collaborative Planning for Humans & AI
          </p>
        </div>
      </footer>

      {/* Clone Plan Modal */}
      {response && (
        <ClonePlanModal
          plan={{
            id: response.id,
            title: response.title,
            description: response.description,
            owner: response.owner ? { name: response.owner.name } : undefined,
          }}
          isOpen={showCloneModal}
          onClose={() => setShowCloneModal(false)}
        />
      )}
    </div>
  );
};

export default PublicPlanView;
