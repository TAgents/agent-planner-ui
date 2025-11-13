import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
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
} from 'lucide-react';
import { planService } from '../services/api';
import { formatDate } from '../utils/planUtils';

interface PublicPlan {
  id: string;
  title: string;
  description: string;
  status: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  view_count: number;
  progress: {
    total: number;
    completed: number;
    in_progress: number;
    percentage: number;
  };
  nodes: Array<{
    id: string;
    title: string;
    description: string;
    node_type: string;
    status: string;
    parent_id: string | null;
    order_index: number;
    children?: any[];
  }>;
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
            <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getStatusColor(node.status)}`}>
              {node.status.replace('_', ' ')}
            </span>
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

const PublicPlanView: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();

  const { data: plan, isLoading, error } = useQuery<PublicPlan>(
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
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Eye className="w-4 h-4" />
                <span>{plan.view_count} views</span>
              </div>
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
                {plan.title}
              </h1>
              {plan.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {plan.description}
                </p>
              )}
            </div>
            <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${getStatusColor(plan.status)}`}>
              {plan.status.replace('_', ' ')}
            </span>
          </div>

          {/* Plan Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <User className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {plan.owner.name}
                </p>
                <p className="text-xs">Plan Owner</p>
              </div>
            </div>

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
                  {plan.nodes.length} nodes
                </p>
                <p className="text-xs">Total Items</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {plan.progress && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {Math.round(plan.progress.percentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${plan.progress.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                <span>{plan.progress.completed} completed</span>
                <span>{plan.progress.in_progress} in progress</span>
                <span>{plan.progress.total - plan.progress.completed - plan.progress.in_progress} not started</span>
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

          {plan.nodes && plan.nodes.length > 0 ? (
            <div className="space-y-2">
              {plan.nodes
                .filter(node => !node.parent_id)
                .sort((a, b) => a.order_index - b.order_index)
                .map(node => (
                  <NodeItem key={node.id} node={node} depth={0} />
                ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              This plan doesn't have any nodes yet.
            </p>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-gray-600 rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Want to create your own plans?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sign up for free and start planning with AI-powered collaboration tools.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Sign Up Free
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors font-medium"
            >
              Log In
            </Link>
          </div>
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
