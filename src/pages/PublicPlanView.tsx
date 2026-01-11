import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import {
  ArrowLeft,
  Eye,
  Calendar,
  User,
  GitBranch,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Loader2,
  Copy,
  Star,
} from 'lucide-react';
import { planService } from '../services/api';
import { formatDate } from '../utils/planUtils';
import { useAuth } from '../hooks/useAuth';

interface PublicPlanNode {
  id: string;
  title: string;
  description?: string;
  node_type: string;
  status: string;
  parent_id: string | null;
  children?: PublicPlanNode[];
}

interface PublicPlanResponse {
  plan: {
    id: string;
    title: string;
    description?: string;
    status: string;
    view_count: number;
    created_at: string;
    updated_at: string;
    github_repo_owner?: string;
    github_repo_name?: string;
    metadata?: any;
    owner: {
      id: string;
      name: string;
      email: string;
      github_username?: string;
      avatar_url?: string;
    };
    progress: number;
  };
  structure: PublicPlanNode;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'in_progress':
      return <Clock className="w-5 h-5 text-blue-500" />;
    case 'blocked':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Circle className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'blocked':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getNodeTypeColor = (nodeType: string) => {
  switch (nodeType) {
    case 'phase':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'task':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'milestone':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// Calculate node statistics from the structure tree
const calculateNodeStats = (node: PublicPlanNode | undefined): {
  total: number;
  completed: number;
  in_progress: number;
  not_started: number;
  blocked: number;
} => {
  if (!node) {
    return { total: 0, completed: 0, in_progress: 0, not_started: 0, blocked: 0 };
  }

  // Don't count the root node itself, only its children
  let stats = { total: 0, completed: 0, in_progress: 0, not_started: 0, blocked: 0 };

  const countNodes = (n: PublicPlanNode, isRoot: boolean = false) => {
    // Count this node unless it's the root
    if (!isRoot) {
      stats.total++;
      switch (n.status) {
        case 'completed':
          stats.completed++;
          break;
        case 'in_progress':
          stats.in_progress++;
          break;
        case 'blocked':
          stats.blocked++;
          break;
        default:
          stats.not_started++;
      }
    }

    // Recursively count children
    if (n.children && n.children.length > 0) {
      n.children.forEach(child => countNodes(child, false));
    }
  };

  countNodes(node, true);
  return stats;
};

const NodeItem: React.FC<{ node: any; depth: number }> = ({ node, depth }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="mb-2">
      <div
        className={`flex items-start gap-3 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all`}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div className="flex-shrink-0 mt-1">{getStatusIcon(node.status)}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
              {node.title}
            </h4>
            <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getNodeTypeColor(node.node_type)}`}>
              {node.node_type}
            </span>
            {node.status && (
              <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getStatusColor(node.status)}`}>
                {node.status.replace('_', ' ')}
              </span>
            )}
          </div>

          {node.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {node.description}
            </p>
          )}

          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isExpanded ? 'Hide' : 'Show'} {node.children.length} sub-item{node.children.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2">
          {node.children.map((child: any) => (
            <NodeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// Helper to check authentication
const PublicPlanView: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId: currentUserId } = useAuth();

  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const { data: response, isLoading, error } = useQuery<PublicPlanResponse>(
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

  const plan = response?.plan;
  const structure = response?.structure;

  // Calculate node statistics from structure
  const nodeStats = React.useMemo(
    () => calculateNodeStats(structure),
    [structure]
  );

  // Fetch star status (only if authenticated)
  const { data: starData, refetch: refetchStars } = useQuery(
    ['planStars', planId],
    () => planService.getPlanStars(planId!),
    {
      enabled: !!planId && isAuthenticated,
      retry: 1,
      onError: (err: any) => {
        console.error('Error fetching star status:', err);
      },
    }
  );

  // Star mutation
  const starMutation = useMutation(
    () => planService.starPlan(planId!),
    {
      onSuccess: () => {
        refetchStars();
      },
      onError: (err: any) => {
        console.error('Error starring plan:', err);
        alert('Failed to star plan. Please try again.');
      },
    }
  );

  // Unstar mutation
  const unstarMutation = useMutation(
    () => planService.unstarPlan(planId!),
    {
      onSuccess: () => {
        refetchStars();
      },
      onError: (err: any) => {
        console.error('Error unstarring plan:', err);
        alert('Failed to unstar plan. Please try again.');
      },
    }
  );

  const handleToggleStar = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (starData?.is_starred) {
      unstarMutation.mutate();
    } else {
      starMutation.mutate();
    }
  };

  const handleUseAsTemplate = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!plan) return;

    setIsCreatingTemplate(true);
    setTemplateError(null);

    try {
      // Create new plan based on template
      const newPlan = await planService.createPlan({
        title: `${plan.title} (Copy)`,
        description: plan.description || '',
        status: 'draft',
      });

      // Note: Full node copying would require a backend endpoint
      // For now, just create the plan and redirect
      // TODO: Implement backend endpoint POST /plans/:id/duplicate to copy all nodes

      navigate(`/app/plans/${newPlan.id}`);
    } catch (err: any) {
      console.error('Error creating template:', err);
      setTemplateError('Failed to create template. Please try again.');
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const isPlanOwner = plan?.owner?.id === currentUserId;

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

  if (error || !plan) {
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
      {/* Secondary Header with Plan Actions */}
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
                <span>{plan.view_count} views</span>
              </div>

              {/* Star Button - visible to all authenticated users */}
              {isAuthenticated && (
                <button
                  onClick={handleToggleStar}
                  disabled={starMutation.isLoading || unstarMutation.isLoading}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    starData?.is_starred
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={starData?.is_starred ? 'Unstar this plan' : 'Star this plan'}
                >
                  <Star
                    className={`w-4 h-4 ${starData?.is_starred ? 'fill-current' : ''}`}
                  />
                  <span>{starData?.star_count || 0}</span>
                </button>
              )}

              {/* Use as Template Button - visible only to non-owners */}
              {isAuthenticated && !isPlanOwner && (
                <button
                  onClick={handleUseAsTemplate}
                  disabled={isCreatingTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Create a copy of this plan"
                >
                  {isCreatingTemplate ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{isCreatingTemplate ? 'Creating...' : 'Use as Template'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message for Template Creation */}
        {templateError && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
              <p className="text-red-700 dark:text-red-300 text-sm">{templateError}</p>
            </div>
            <button
              onClick={() => setTemplateError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* Plan Header */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {plan.title}
              </h1>
              {plan.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {plan.description}
                </p>
              )}
            </div>
            {plan.status && (
              <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${getStatusColor(plan.status)}`}>
                {plan.status.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Plan Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {plan.owner && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {plan.owner.name}
                  </p>
                  <p className="text-xs">Plan Owner</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(plan.created_at)}
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
          {plan && typeof plan.progress === 'number' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {Math.round(plan.progress || 0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${plan.progress || 0}%` }}
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

        {/* Plan Structure */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <GitBranch className="w-6 h-6" />
            Plan Structure
          </h2>

          {structure && structure.children && structure.children.length > 0 ? (
            <div className="space-y-2">
              {structure.children.map(node => (
                <NodeItem key={node.id} node={node} depth={0} />
              ))}
            </div>
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
    </div>
  );
};

export default PublicPlanView;
