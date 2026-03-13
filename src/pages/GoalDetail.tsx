import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate, Navigate } from 'react-router-dom';
import {
  Target,
  ArrowLeft,
  Calendar,
  Building2,
  TrendingUp,
  FolderKanban,
  BookOpen,
  Activity,
  Trash2,
  Edit,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  GitBranch,
  Brain,
  Circle,
  CheckCircle2,
  Clock,
  Ban,
} from 'lucide-react';
import { useGoal, SuccessMetric } from '../hooks/useGoals';
import { Goal, LinkedPlan } from '../services/api';
import StatusBadge from '../components/goals/shared/StatusBadge';
import {
  calculateOverallProgress,
  calculateMetricProgress,
  isMetricComplete
} from '../utils/goalHelpers';
import {
  useGoalPath,
  useGoalProgress,
  useGoalKnowledgeGaps,
  GoalPathNode,
} from '../hooks/useGoalsV2';

// Tab types
type TabType = 'overview' | 'plans' | 'path' | 'knowledge' | 'activity';

// Notification state type
interface Notification {
  message: string;
  type: 'success' | 'error';
}

// Overview Tab Content
const OverviewTab: React.FC<{ goal: Goal }> = ({ goal }) => {
  const progress = useMemo(
    () => calculateOverallProgress(goal.success_metrics),
    [goal.success_metrics]
  );

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <section 
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        aria-labelledby="progress-heading"
      >
        <h3 id="progress-heading" className="font-semibold text-gray-900 dark:text-white mb-4">
          Overall Progress
        </h3>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Completion</span>
          <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <div 
          className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall progress: ${progress}%`}
        >
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      {/* Success Metrics */}
      <section 
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        aria-labelledby="metrics-heading"
      >
        <h3 id="metrics-heading" className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          Success Metrics
        </h3>
        {!goal.success_metrics || goal.success_metrics.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No metrics defined for this goal.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goal.success_metrics.map((metric: SuccessMetric, idx: number) => {
              const metricProgress = calculateMetricProgress(metric);
              const complete = isMetricComplete(metric);

              return (
                <div key={metric.metric || idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{metric.metric}</span>
                    {complete && (
                      <Check className="w-5 h-5 text-green-500" aria-label="Complete" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-2xl font-bold ${complete ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      {metric.current}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">/ {metric.target} {metric.unit}</span>
                  </div>
                  <div 
                    className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(metricProgress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`h-full rounded-full ${complete ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${metricProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Description */}
      {goal.description && (
        <section 
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          aria-labelledby="description-heading"
        >
          <h3 id="description-heading" className="font-semibold text-gray-900 dark:text-white mb-4">
            Description
          </h3>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{goal.description}</p>
        </section>
      )}
    </div>
  );
};

// Plans Tab Content
const PlansTab: React.FC<{ 
  goal: Goal; 
  onUnlink: (planId: string) => Promise<void>;
  onError: (message: string) => void;
}> = ({ goal, onUnlink, onError }) => {
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const plans = goal.linked_plans || [];

  const handleUnlink = async (planId: string) => {
    setUnlinking(planId);
    try {
      await onUnlink(planId);
    } catch (err) {
      onError('Failed to unlink plan. Please try again.');
    } finally {
      setUnlinking(null);
    }
  };

  return (
    <section 
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      aria-labelledby="plans-heading"
    >
      <h3 id="plans-heading" className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        Linked Plans ({plans.length})
      </h3>
      {plans.length === 0 ? (
        <div className="text-center py-8">
          <FolderKanban className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" aria-hidden="true" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No plans linked to this goal</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Link plans from the plan page to track progress toward this goal.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {plans.map((plan: LinkedPlan) => (
            <li
              key={plan.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <Link
                  to={`/app/plans/${plan.id}`}
                  className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {plan.title}
                </Link>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>{plan.progress || 0}% complete</span>
                  <span className="capitalize">{plan.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/app/plans/${plan.id}`}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                  title="Open plan"
                  aria-label={`Open plan: ${plan.title}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleUnlink(plan.id)}
                  disabled={unlinking === plan.id}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                  title="Unlink plan"
                  aria-label={`Unlink plan: ${plan.title}`}
                >
                  {unlinking === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

// Knowledge Tab Content
const KnowledgeTab: React.FC<{ goalId: string }> = ({ goalId }) => {
  return (
    <section 
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      aria-labelledby="knowledge-heading"
    >
      <h3 id="knowledge-heading" className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        Knowledge Entries
      </h3>
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" aria-hidden="true" />
        <p className="text-gray-500 dark:text-gray-400">
          Knowledge entries related to this goal will appear here.
        </p>
      </div>
    </section>
  );
};

// Activity Tab Content
const ActivityTab: React.FC<{ goalId: string }> = ({ goalId }) => {
  return (
    <section 
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      aria-labelledby="activity-heading"
    >
      <h3 id="activity-heading" className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        Activity
      </h3>
      <div className="text-center py-8">
        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" aria-hidden="true" />
        <p className="text-gray-500 dark:text-gray-400">
          Activity feed coming soon...
        </p>
      </div>
    </section>
  );
};

// Status icon helper
const StatusIcon: React.FC<{ status: string; className?: string }> = ({ status, className = 'w-4 h-4' }) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className={`${className} text-green-500`} />;
    case 'in_progress': return <Clock className={`${className} text-blue-500`} />;
    case 'blocked': return <Ban className={`${className} text-red-500`} />;
    default: return <Circle className={`${className} text-gray-400`} />;
  }
};

// Dependency Path Tab Content
const DependencyPathTab: React.FC<{ goalId: string }> = ({ goalId }) => {
  const { data: pathData, isLoading: pathLoading } = useGoalPath(goalId);
  const { data: progressData } = useGoalProgress(goalId);
  const { data: gapsData } = useGoalKnowledgeGaps(goalId);

  if (pathLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const nodes = pathData?.nodes || [];
  const stats = pathData?.stats;
  const progress = progressData?.progress ?? 0;
  const directProgress = progressData?.direct_progress ?? 0;
  const gaps = gapsData?.gaps || [];
  const coverage = gapsData?.coverage;

  if (nodes.length === 0) {
    return (
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <GitBranch className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No dependency path yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Link tasks to this goal using "achieves" edges to build a dependency path.
          </p>
        </div>
      </section>
    );
  }

  // Group by depth
  const byDepth = new Map<number, GoalPathNode[]>();
  for (const node of nodes) {
    const list = byDepth.get(node.depth) || [];
    list.push(node);
    byDepth.set(node.depth, list);
  }
  const depths = Array.from(byDepth.keys()).sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      {/* Progress from graph */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Graph Progress
          </h3>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
          {stats && (
            <>
              <span>{stats.completed} completed</span>
              <span>{stats.in_progress} in progress</span>
              <span>{stats.blocked} blocked</span>
              <span>{stats.not_started} not started</span>
            </>
          )}
        </div>
        {directProgress !== progress && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Direct achievers: {directProgress}%
          </p>
        )}
      </section>

      {/* Knowledge coverage */}
      {coverage && coverage.total > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Knowledge Coverage
            </h3>
            <span className={`text-sm font-medium ${coverage.percentage >= 80 ? 'text-green-600' : coverage.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {coverage.percentage}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${coverage.percentage >= 80 ? 'bg-green-500' : coverage.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${coverage.percentage}%` }}
            />
          </div>
          {gaps.length > 0 && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {gaps.length} task{gaps.length !== 1 ? 's' : ''} missing knowledge coverage
            </p>
          )}
        </section>
      )}

      {/* Task tree by depth */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Task Path ({nodes.length} tasks)
        </h3>
        <div className="space-y-3">
          {depths.map((depth) => {
            const depthNodes = byDepth.get(depth)!;
            const label = depth === 1 ? 'Direct achievers' : `Depth ${depth} (upstream)`;
            return (
              <div key={depth}>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 ml-1">
                  {label}
                </p>
                <div className="space-y-1">
                  {depthNodes.map((node) => {
                    const hasGap = gaps.some(g => g.node_id === node.node_id);
                    return (
                      <div
                        key={node.node_id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm"
                      >
                        <StatusIcon status={node.status} />
                        <Link
                          to={`/app/plans/${node.plan_id}`}
                          className="flex-1 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                        >
                          {node.title}
                        </Link>
                        <span className="text-[10px] text-gray-400 capitalize">{node.status.replace('_', ' ')}</span>
                        {hasGap && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                            no knowledge
                          </span>
                        )}
                        {node.dependency_type === 'achieves' && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                            achieves
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal: React.FC<{
  goalTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ goalTitle, isDeleting, onConfirm, onCancel }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Focus trap and escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    modalRef.current?.focus();
    
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel, isDeleting]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={!isDeleting ? onCancel : undefined}
        aria-hidden="true"
      />
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
      >
        <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Delete Goal
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Are you sure you want to delete "{goalTitle}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification timeout constant
const NOTIFICATION_TIMEOUT_MS = 5000;

// Main GoalDetail Component
const GoalDetail: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { goal, loading, error, deleteGoal, unlinkPlan } = useGoal(goalId ?? null);
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Set initial tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['overview', 'plans', 'path', 'knowledge', 'activity'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  }, [setSearchParams]);

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), NOTIFICATION_TIMEOUT_MS);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!goalId) return;
    setIsDeleting(true);
    try {
      await deleteGoal(goalId);
      navigate('/app/goals');
    } catch (err) {
      showNotification('Failed to delete goal. Please try again.', 'error');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [goalId, deleteGoal, navigate, showNotification]);

  const handleUnlinkPlan = useCallback(async (planId: string) => {
    await unlinkPlan(planId);
  }, [unlinkPlan]);

  const handleError = useCallback((message: string) => {
    showNotification(message, 'error');
  }, [showNotification]);

  // Redirect if no goalId provided
  if (!goalId) {
    return <Navigate to="/app/goals" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20" role="status">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="sr-only">Loading goal...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20" role="alert">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Goal not found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error || 'The goal you are looking for does not exist.'}</p>
            <Link
              to="/app/goals"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Goals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Target className="w-4 h-4" /> },
    { id: 'path', label: 'Dependency Path', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'plans', label: 'Linked Plans', icon: <FolderKanban className="w-4 h-4" />, count: goal.linked_plans?.length || 0 },
    { id: 'knowledge', label: 'Knowledge', icon: <BookOpen className="w-4 h-4" />, count: goal.knowledge_entries_count || 0 },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Notification */}
        {notification && (
          <div 
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              notification.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}
            role="alert"
          >
            {notification.type === 'success' ? (
              <Check className="w-5 h-5" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
            )}
            {notification.message}
          </div>
        )}

        {/* Back Link */}
        <Link
          to="/app/goals"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Goals
        </Link>

        {/* Header */}
        <header className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{goal.title}</h1>
                <StatusBadge status={goal.status} size="md" />
              </div>
              {goal.organization && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  {goal.organization.name}
                </p>
              )}
              {goal.time_horizon && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  Target: <time dateTime={goal.time_horizon}>{new Date(goal.time_horizon).toLocaleDateString()}</time>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Edit functionality will be implemented in a future update
                  // See: https://github.com/TAgents/agent-planner-ui/issues/new?title=Implement+goal+edit+modal
                  showNotification('Edit functionality coming soon!', 'success');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit goal (coming soon)"
                aria-label="Edit goal"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete goal"
                aria-label="Delete goal"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <nav className="border-b border-gray-200 dark:border-gray-700 mb-6" aria-label="Goal sections">
          <div className="flex gap-4 -mb-px" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'overview' && <OverviewTab goal={goal} />}
          {activeTab === 'path' && <DependencyPathTab goalId={goalId!} />}
          {activeTab === 'plans' && <PlansTab goal={goal} onUnlink={handleUnlinkPlan} onError={handleError} />}
          {activeTab === 'knowledge' && <KnowledgeTab goalId={goalId!} />}
          {activeTab === 'activity' && <ActivityTab goalId={goalId!} />}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <DeleteModal
            goalTitle={goal.title}
            isDeleting={isDeleting}
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default GoalDetail;
