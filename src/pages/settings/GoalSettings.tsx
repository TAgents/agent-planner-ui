import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useGoals, Goal, SuccessMetric } from '../../hooks/useGoals';
import { 
  Target, 
  Plus, 
  Trash2, 
  ChevronRight,
  Settings,
  AlertCircle,
  Check,
  Loader2,
  Key,
  Building2,
  BookOpen,
  Link2,
  Clock,
  TrendingUp,
  X,
  Edit3,
  Filter
} from 'lucide-react';

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

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', dot: 'bg-green-500' },
  achieved: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', dot: 'bg-blue-500' },
  at_risk: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200', dot: 'bg-yellow-500' },
  abandoned: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', dot: 'bg-gray-500' },
};

const GoalSettings: React.FC = () => {
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { goals, loading: goalsLoading, error: goalsError, createGoal, updateGoal, deleteGoal } = useGoals(undefined, statusFilter || undefined);
  
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Form state
  const [newGoal, setNewGoal] = useState({
    organization_id: '',
    title: '',
    description: '',
    time_horizon: 'quarterly',
    github_repo_url: '',
    success_metrics: [] as SuccessMetric[],
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'active' as Goal['status'],
    time_horizon: '',
    success_metrics: [] as SuccessMetric[],
  });

  const selectedGoal = useMemo(() => 
    goals.find(g => g.id === selectedGoalId) || null, 
    [goals, selectedGoalId]
  );

  // Clear selection when filtered goal disappears (e.g., status filter changed)
  useEffect(() => {
    if (selectedGoalId && !goalsLoading && !selectedGoal) {
      setSelectedGoalId(null);
    }
  }, [selectedGoalId, selectedGoal, goalsLoading]);

  // Group goals by organization
  const goalsByOrg = useMemo(() => {
    const grouped: Record<string, { org: typeof organizations[0]; goals: Goal[] }> = {};
    
    organizations.forEach(org => {
      grouped[org.id] = { org, goals: [] };
    });
    
    goals.forEach(goal => {
      if (grouped[goal.organization_id]) {
        grouped[goal.organization_id].goals.push(goal);
      }
    });
    
    return Object.values(grouped).filter(g => g.goals.length > 0 || organizations.length === 1);
  }, [organizations, goals]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim() || !newGoal.organization_id) return;
    try {
      await createGoal({
        organization_id: newGoal.organization_id,
        title: newGoal.title,
        description: newGoal.description || undefined,
        time_horizon: newGoal.time_horizon || undefined,
        github_repo_url: newGoal.github_repo_url || undefined,
        success_metrics: newGoal.success_metrics.length > 0 ? newGoal.success_metrics : undefined,
      });
      setShowCreateDialog(false);
      setNewGoal({
        organization_id: '',
        title: '',
        description: '',
        time_horizon: 'quarterly',
        github_repo_url: '',
        success_metrics: [],
      });
      showNotification('Goal created successfully', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to create goal', 'error');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      if (selectedGoalId === goalId) setSelectedGoalId(null);
      setShowDeleteConfirm(null);
      showNotification('Goal deleted', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete goal', 'error');
    }
  };

  const startEdit = () => {
    if (!selectedGoal) return;
    setEditForm({
      title: selectedGoal.title,
      description: selectedGoal.description || '',
      status: selectedGoal.status,
      time_horizon: selectedGoal.time_horizon || '',
      success_metrics: selectedGoal.success_metrics || [],
    });
    setEditMode(true);
  };

  const saveEdit = async () => {
    if (!selectedGoal) return;
    try {
      await updateGoal(selectedGoal.id, {
        title: editForm.title,
        description: editForm.description || undefined,
        status: editForm.status,
        time_horizon: editForm.time_horizon || undefined,
        success_metrics: editForm.success_metrics,
      });
      setEditMode(false);
      showNotification('Goal updated', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update goal', 'error');
    }
  };

  const addMetricToForm = (isNew: boolean) => {
    const newMetric: SuccessMetric = { metric: '', target: '', current: '', unit: '' };
    if (isNew) {
      setNewGoal(prev => ({
        ...prev,
        success_metrics: [...prev.success_metrics, newMetric],
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        success_metrics: [...prev.success_metrics, newMetric],
      }));
    }
  };

  const updateMetric = (index: number, field: keyof SuccessMetric, value: string, isNew: boolean) => {
    if (isNew) {
      setNewGoal(prev => ({
        ...prev,
        success_metrics: prev.success_metrics.map((m, i) => 
          i === index ? { ...m, [field]: value } : m
        ),
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        success_metrics: prev.success_metrics.map((m, i) => 
          i === index ? { ...m, [field]: value } : m
        ),
      }));
    }
  };

  const removeMetric = (index: number, isNew: boolean) => {
    if (isNew) {
      setNewGoal(prev => ({
        ...prev,
        success_metrics: prev.success_metrics.filter((_, i) => i !== index),
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        success_metrics: prev.success_metrics.filter((_, i) => i !== index),
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = statusColors[status] || statusColors.active;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your goals, track success metrics, and link plans
          </p>
        </div>

        {/* Settings Navigation */}
        <SettingsNav />

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Goals</h2>
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Create goal"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="achieved">Achieved</option>
                    <option value="at_risk">At Risk</option>
                    <option value="abandoned">Abandoned</option>
                  </select>
                </div>
              </div>

              {goalsLoading || orgsLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </div>
              ) : goalsError ? (
                <div className="p-4 text-center text-red-600 dark:text-red-400">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                  {goalsError}
                </div>
              ) : goals.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No goals yet</p>
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Create your first goal
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {goalsByOrg.map(({ org, goals: orgGoals }) => (
                    <div key={org.id}>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {org.name}
                        </p>
                      </div>
                      {orgGoals.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 italic">
                          No goals in this organization
                        </div>
                      ) : (
                        orgGoals.map((goal) => (
                          <button
                            key={goal.id}
                            onClick={() => {
                              setSelectedGoalId(goal.id);
                              setEditMode(false);
                            }}
                            className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between ${
                              selectedGoalId === goal.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {goal.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(goal.status)}
                                {goal.linked_plans?.length > 0 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Link2 className="w-3 h-3" />
                                    {goal.linked_plans.length}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                              selectedGoalId === goal.id ? 'rotate-90' : ''
                            }`} />
                          </button>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Goal Details */}
          <div className="lg:col-span-2">
            {!selectedGoalId ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a goal to view and edit its details
                </p>
              </div>
            ) : !selectedGoal ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Goal Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        {editMode ? (
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            className="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none w-full"
                          />
                        ) : (
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedGoal.title}</h2>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {editMode ? (
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as Goal['status'] }))}
                              className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            >
                              <option value="active">Active</option>
                              <option value="achieved">Achieved</option>
                              <option value="at_risk">At Risk</option>
                              <option value="abandoned">Abandoned</option>
                            </select>
                          ) : (
                            getStatusBadge(selectedGoal.status)
                          )}
                          {selectedGoal.time_horizon && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {editMode ? (
                                <input
                                  type="text"
                                  value={editForm.time_horizon}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, time_horizon: e.target.value }))}
                                  className="w-24 px-1 border-b border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                                  placeholder="quarterly"
                                />
                              ) : (
                                selectedGoal.time_horizon
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editMode ? (
                        <>
                          <button
                            onClick={() => setEditMode(false)}
                            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <button
                            onClick={saveEdit}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Save
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={startEdit}
                            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit goal"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(selectedGoal.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete goal"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    {editMode ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        rows={3}
                        placeholder="Describe what this goal aims to achieve..."
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedGoal.description || 'No description provided'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Success Metrics
                    </h3>
                    {editMode && (
                      <button
                        onClick={() => addMetricToForm(false)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Metric
                      </button>
                    )}
                  </div>

                  <div className="p-4">
                    {editMode ? (
                      editForm.success_metrics.length === 0 ? (
                        <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                          No metrics defined. Click "Add Metric" to add one.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {editForm.success_metrics.map((metric, index) => (
                            <div key={index} className="grid grid-cols-5 gap-2 items-center">
                              <input
                                type="text"
                                value={metric.metric}
                                onChange={(e) => updateMetric(index, 'metric', e.target.value, false)}
                                placeholder="Metric name"
                                className="col-span-2 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                              />
                              <input
                                type="text"
                                value={metric.target}
                                onChange={(e) => updateMetric(index, 'target', e.target.value, false)}
                                placeholder="Target"
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                              />
                              <input
                                type="text"
                                value={metric.unit}
                                onChange={(e) => updateMetric(index, 'unit', e.target.value, false)}
                                placeholder="Unit"
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                              />
                              <button
                                onClick={() => removeMetric(index, false)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )
                    ) : selectedGoal.success_metrics?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedGoal.success_metrics.map((metric, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{metric.metric}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Target: {metric.target} {metric.unit}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {metric.current || '0'} {metric.unit}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                        No success metrics defined
                      </p>
                    )}
                  </div>
                </div>

                {/* Linked Plans */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Link2 className="w-5 h-5" />
                      Linked Plans
                      {selectedGoal.linked_plans?.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                          {selectedGoal.linked_plans.length}
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="p-4">
                    {selectedGoal.linked_plans?.length > 0 ? (
                      <div className="space-y-2">
                        {selectedGoal.linked_plans.map((plan) => (
                          <Link
                            key={plan.id}
                            to={`/app/plans/${plan.id}`}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{plan.title}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{plan.status}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${plan.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400 w-10 text-right">
                                {plan.progress || 0}%
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                        No plans linked to this goal
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Goal Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateDialog(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Goal</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organization *
                  </label>
                  <select
                    value={newGoal.organization_id}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, organization_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select organization...</option>
                    {organizations.map(org => (
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
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Increase user engagement by 20%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Describe what this goal aims to achieve..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time Horizon
                    </label>
                    <select
                      value={newGoal.time_horizon}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, time_horizon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      GitHub Repo URL
                    </label>
                    <input
                      type="url"
                      value={newGoal.github_repo_url}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, github_repo_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                {/* Success Metrics */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Success Metrics
                    </label>
                    <button
                      type="button"
                      onClick={() => addMetricToForm(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  {newGoal.success_metrics.length > 0 ? (
                    <div className="space-y-2">
                      {newGoal.success_metrics.map((metric, index) => (
                        <div key={index} className="grid grid-cols-5 gap-2 items-center">
                          <input
                            type="text"
                            value={metric.metric}
                            onChange={(e) => updateMetric(index, 'metric', e.target.value, true)}
                            placeholder="Metric"
                            className="col-span-2 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                          />
                          <input
                            type="text"
                            value={metric.target}
                            onChange={(e) => updateMetric(index, 'target', e.target.value, true)}
                            placeholder="Target"
                            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                          />
                          <input
                            type="text"
                            value={metric.unit}
                            onChange={(e) => updateMetric(index, 'unit', e.target.value, true)}
                            placeholder="Unit"
                            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeMetric(index, true)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                      No metrics added yet
                    </p>
                  )}
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
                  onClick={handleCreateGoal}
                  disabled={!newGoal.title.trim() || !newGoal.organization_id}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Create
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Goal?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This action cannot be undone. All linked plans will be unlinked from this goal.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteGoal(showDeleteConfirm)}
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

export default GoalSettings;
