import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import { 
  Target, 
  Plus, 
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import GoalCard from '../components/goals/GoalCard';

const Goals: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { goals, loading, error, createGoal, deleteGoal } = useGoals(
    undefined,
    statusFilter || undefined
  );

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Create form state
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    time_horizon: '',
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreate = async () => {
    if (!newGoal.title) return;
    try {
      await createGoal({
        title: newGoal.title,
        description: newGoal.description || undefined,
        time_horizon: newGoal.time_horizon || undefined,
      });
      setShowCreateDialog(false);
      setNewGoal({ title: '', description: '', time_horizon: '' });
      showNotification('Goal created successfully', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to create goal', 'error');
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      setShowDeleteConfirm(null);
      showNotification('Goal deleted', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete goal', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}>
            {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {notification.message}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
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

        {/* Goals List */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading goals...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No goals yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Goals help you track what you're working toward across multiple plans.
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Create your first goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={(goalId) => setShowDeleteConfirm(goalId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Goal Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCreateDialog(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Goal</h2>
            
            <div className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newGoal.title}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Goal</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this goal? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
