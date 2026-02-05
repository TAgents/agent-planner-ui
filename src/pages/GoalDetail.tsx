import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
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
  AlertCircle,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useGoal, SuccessMetric } from '../hooks/useGoals';

// Tab types
type TabType = 'overview' | 'plans' | 'knowledge' | 'activity';

// Status badge component
const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  const getStatusStyle = () => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'achieved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'at_risk':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <TrendingUp className="w-4 h-4" />;
      case 'achieved':
        return <Check className="w-4 h-4" />;
      case 'at_risk':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <X className="w-4 h-4" />;
    }
  };

  return (
    <span className={`rounded-full font-medium flex items-center gap-1 ${sizeClasses} ${getStatusStyle()}`}>
      {getStatusIcon()}
      {status.replace('_', ' ')}
    </span>
  );
};

// Calculate progress
const calculateProgress = (metrics?: SuccessMetric[]): number => {
  if (!metrics?.length) return 0;
  const total = metrics.reduce((sum, m) => {
    const target = parseFloat(m.target) || 0;
    const current = parseFloat(m.current) || 0;
    const progress = target > 0 ? (current / target) * 100 : 0;
    return sum + Math.min(progress, 100);
  }, 0);
  return Math.round(total / metrics.length);
};

// Overview Tab Content
const OverviewTab: React.FC<{ goal: any }> = ({ goal }) => {
  const progress = calculateProgress(goal.success_metrics);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Overall Progress</h3>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Completion</span>
          <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Success Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Success Metrics
        </h3>
        {!goal.success_metrics || goal.success_metrics.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No metrics defined for this goal.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goal.success_metrics.map((metric: SuccessMetric, idx: number) => {
              const target = parseFloat(metric.target) || 0;
              const current = parseFloat(metric.current) || 0;
              const metricProgress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
              const isComplete = metricProgress >= 100;

              return (
                <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{metric.metric}</span>
                    {isComplete && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-2xl font-bold ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      {metric.current}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">/ {metric.target} {metric.unit}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${metricProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Description */}
      {goal.description && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Description</h3>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{goal.description}</p>
        </div>
      )}
    </div>
  );
};

// Plans Tab Content
const PlansTab: React.FC<{ goal: any; onUnlink: (planId: string) => void }> = ({ goal, onUnlink }) => {
  const plans = goal.linked_plans || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Linked Plans ({plans.length})
      </h3>
      {plans.length === 0 ? (
        <div className="text-center py-8">
          <FolderKanban className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No plans linked to this goal</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Link plans from the plan page to track progress toward this goal.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan: any) => (
            <div
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
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => onUnlink(plan.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Unlink plan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Knowledge Tab Content
const KnowledgeTab: React.FC<{ goalId: string }> = ({ goalId }) => {
  // TODO: Implement knowledge entries for goal
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Knowledge Entries
      </h3>
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">
          Knowledge entries related to this goal will appear here.
        </p>
      </div>
    </div>
  );
};

// Activity Tab Content
const ActivityTab: React.FC<{ goalId: string }> = ({ goalId }) => {
  // TODO: Implement activity feed for goal
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Activity
      </h3>
      <div className="text-center py-8">
        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">
          Activity feed coming soon...
        </p>
      </div>
    </div>
  );
};

// Main GoalDetail Component
const GoalDetail: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { goal, loading, error, deleteGoal, unlinkPlan } = useGoal(goalId || null);
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Set initial tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['overview', 'plans', 'knowledge', 'activity'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleDelete = async () => {
    if (!goalId) return;
    try {
      await deleteGoal(goalId);
      navigate('/app/goals');
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const handleUnlinkPlan = async (planId: string) => {
    if (!goalId) return;
    try {
      await unlinkPlan(planId);
    } catch (err) {
      console.error('Failed to unlink plan:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
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
    { id: 'plans', label: 'Linked Plans', icon: <FolderKanban className="w-4 h-4" />, count: goal.linked_plans?.length || 0 },
    { id: 'knowledge', label: 'Knowledge', icon: <BookOpen className="w-4 h-4" />, count: goal.knowledge_entries_count || 0 },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          to="/app/goals"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Goals
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{goal.title}</h1>
                <StatusBadge status={goal.status} />
              </div>
              {goal.organization && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                  <Building2 className="w-4 h-4" />
                  {goal.organization.name}
                </p>
              )}
              {goal.time_horizon && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Target: {new Date(goal.time_horizon).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {/* TODO: Edit modal */}}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit goal"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete goal"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-4 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab goal={goal} />}
        {activeTab === 'plans' && <PlansTab goal={goal} onUnlink={handleUnlinkPlan} />}
        {activeTab === 'knowledge' && <KnowledgeTab goalId={goalId!} />}
        {activeTab === 'activity' && <ActivityTab goalId={goalId!} />}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Goal</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete "{goal.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalDetail;
