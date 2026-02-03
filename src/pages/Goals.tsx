import React, { useState } from 'react';
import { useGoals, useGoal, Goal, SuccessMetric } from '../hooks/useGoals';
import { useOrganizations } from '../hooks/useOrganizations';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit2,
  ChevronRight,
  Calendar,
  TrendingUp,
  Link2,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Building2,
  FileText,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Goals: React.FC = () => {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { goals, loading, error, createGoal, deleteGoal } = useGoals({
    organization_id: selectedOrgId || undefined,
    status: statusFilter || undefined,
  });
  const { organizations } = useOrganizations();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const { goal: selectedGoal, loading: goalLoading, error: goalError, updateMetrics, unlinkPlan } = useGoal(selectedGoalId);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Create form state
  const [newGoal, setNewGoal] = useState({
    organization_id: '',
    title: '',
    description: '',
    time_horizon: '',
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'achieved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'abandoned': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="w-4 h-4" />;
      case 'achieved': return <Check className="w-4 h-4" />;
      case 'at_risk': return <AlertCircle className="w-4 h-4" />;
      default: return <X className="w-4 h-4" />;
    }
  };

  const calculateProgress = (metrics: SuccessMetric[]) => {
    if (!metrics || metrics.length === 0) return 0;
    const total = metrics.reduce((acc, m) => {
      const progress = m.target > 0 ? Math.min((m.current / m.target) * 100, 100) : 0;
      return acc + progress;
    }, 0);
    return Math.round(total / metrics.length);
  };

  const handleCreate = async () => {
    if (!newGoal.title || !newGoal.organization_id) return;
    try {
      await createGoal({
        organization_id: newGoal.organization_id,
        title: newGoal.title,
        description: newGoal.description || undefined,
        time_horizon: newGoal.time_horizon || undefined,
      });
      setShowCreateDialog(false);
      setNewGoal({ organization_id: '', title: '', description: '', time_horizon: '' });
      showNotification('Goal created successfully', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to create goal', 'error');
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      if (selectedGoalId === goalId) setSelectedGoalId(null);
      setShowDeleteConfirm(null);
      showNotification('Goal deleted', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete goal', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-6 h-6" />
              Goals
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Track objectives with success metrics and linked plans
            </p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Goal
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            notification.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {notification.message}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="achieved">Achieved</option>
            <option value="at_risk">At Risk</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals List */}
          <div className="lg:col-span-1 space-y-4">
            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : goals.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No goals yet</p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first goal
                </button>
              </div>
            ) : (
              goals.map((goal) => {
                const progress = calculateProgress(goal.success_metrics);
                return (
                  <div
                    key={goal.id}
                    onClick={() => setSelectedGoalId(goal.id)}
                    className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-all ${
                      selectedGoalId === goal.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(goal.status)}`}>
                            {getStatusIcon(goal.status)}
                            {goal.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                        {goal.organization && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3" />
                            {goal.organization.name}
                          </p>
                        )}
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedGoalId === goal.id ? 'rotate-90' : ''
                      }`} />
                    </div>

                    {/* Progress bar */}
                    {goal.success_metrics && goal.success_metrics.length > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      {goal.time_horizon && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(goal.time_horizon).toLocaleDateString()}
                        </span>
                      )}
                      {goal.linked_plans_count !== undefined && goal.linked_plans_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          {goal.linked_plans_count} plans
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Goal Detail */}
          <div className="lg:col-span-2">
            {!selectedGoalId ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a goal to view details
                </p>
              </div>
            ) : goalLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              </div>
            ) : goalError ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p className="text-red-600 dark:text-red-400">{goalError}</p>
              </div>
            ) : selectedGoal ? (
              <div className="space-y-6">
                {/* Goal Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(selectedGoal.status)}`}>
                          {getStatusIcon(selectedGoal.status)}
                          {selectedGoal.status.replace('_', ' ')}
                        </span>
                        {selectedGoal.organization && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {selectedGoal.organization.name}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedGoal.title}</h2>
                      {selectedGoal.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedGoal.description}</p>
                      )}
                      {selectedGoal.time_horizon && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Target: {new Date(selectedGoal.time_horizon).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(selectedGoal.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Success Metrics
                  </h3>
                  {!selectedGoal.success_metrics || selectedGoal.success_metrics.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No metrics defined</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedGoal.success_metrics.map((metric, idx) => {
                        const progress = metric.target > 0 ? Math.min((metric.current / metric.target) * 100, 100) : 0;
                        return (
                          <div key={idx}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{metric.metric}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {metric.current} / {metric.target} {metric.unit}
                              </span>
                            </div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Linked Plans */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    Linked Plans
                  </h3>
                  {!selectedGoal.linked_plans || selectedGoal.linked_plans.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No plans linked to this goal</p>
                  ) : (
                    <ul className="space-y-3">
                      {selectedGoal.linked_plans.map((plan) => (
                        <li key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <Link
                                to={`/app/plans/${plan.id}`}
                                className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                {plan.title}
                              </Link>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {plan.progress}% complete
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/app/plans/${plan.id}`}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => unlinkPlan(plan.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                              title="Unlink plan"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Create Goal Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateDialog(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Goal</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organization *
                  </label>
                  <select
                    value={newGoal.organization_id}
                    onChange={(e) => setNewGoal({ ...newGoal, organization_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Launch MVP by Q2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="What does success look like?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.time_horizon}
                    onChange={(e) => setNewGoal({ ...newGoal, time_horizon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newGoal.title || !newGoal.organization_id}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Goal?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will permanently delete the goal and unlink all associated plans. This action cannot be undone.
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

export default Goals;
