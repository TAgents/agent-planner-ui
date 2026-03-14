import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Target, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { usePlans } from '../../hooks/usePlans';
import { useCreateGoal } from '../../hooks/useGoalsV2';

const GOAL_TYPES = [
  { value: 'outcome', label: 'Outcome', description: 'A specific result you want to achieve', icon: '🎯' },
  { value: 'constraint', label: 'Constraint', description: 'A boundary or limitation to respect', icon: '🚧' },
  { value: 'metric', label: 'Metric', description: 'A measurable target to hit', icon: '📊' },
  { value: 'principle', label: 'Principle', description: 'A guiding rule or value to uphold', icon: '💡' },
] as const;

type GoalType = typeof GOAL_TYPES[number]['value'];

const CreatePlan: React.FC = () => {
  const navigate = useNavigate();
  const createGoal = useCreateGoal();
  const { createPlan } = usePlans();

  // Goal-setting flow state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('outcome');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [error, setError] = useState('');

  // Toggle for legacy plan form
  const [showManualPlan, setShowManualPlan] = useState(false);

  // Legacy plan form state
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planStatus, setPlanStatus] = useState<'draft' | 'active'>('draft');

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload: any = {
        title: goalTitle,
        description: goalDescription || undefined,
        type: goalType,
        status: 'active',
      };

      if (successCriteria.trim()) {
        payload.successCriteria = { text: successCriteria.trim() };
      }

      const result = await createGoal.mutateAsync(payload);
      const newGoalId = result?.id || result?.goal?.id;

      if (newGoalId) {
        navigate(`/app/goals/${newGoalId}`);
      } else {
        navigate('/app/goals');
      }
    } catch (err: any) {
      console.error('Error creating goal:', err);
      setError(err?.response?.data?.error || err.message || 'Failed to create goal');
    }
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await createPlan.mutateAsync({
        title: planTitle,
        description: planDescription,
        status: planStatus,
      });

      let planId;
      if (result?.data?.id) {
        planId = result.data.id;
      } else if (result?.id) {
        planId = result.id;
      }

      if (planId) {
        navigate(`/app/plans/${planId}`);
      } else {
        navigate('/app/plans');
      }
    } catch (err: any) {
      console.error('Error creating plan:', err);
      setError(err.message || 'Failed to create plan');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <button
          onClick={() => navigate('/app/plans')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Main Goal-Setting Form */}
        {!showManualPlan && (
          <div>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                What do you want to achieve?
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Set a goal and agents will create and manage the plan for you.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleGoalSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
              {/* Goal Title */}
              <div>
                <label htmlFor="goalTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Goal
                </label>
                <input
                  type="text"
                  id="goalTitle"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="e.g., Launch the new API by end of Q2"
                  required
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="goalDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                  <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  id="goalDescription"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Add more context about what you want to accomplish..."
                />
              </div>

              {/* Goal Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {GOAL_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        goalType === type.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="goalType"
                        value={type.value}
                        checked={goalType === type.value}
                        onChange={() => setGoalType(type.value)}
                        className="sr-only"
                      />
                      <span className="text-lg mt-0.5">{type.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Success Criteria */}
              <div>
                <label htmlFor="successCriteria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Success Criteria
                  <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  id="successCriteria"
                  value={successCriteria}
                  onChange={(e) => setSuccessCriteria(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="How will you know when this goal is achieved?"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createGoal.isLoading || !goalTitle.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createGoal.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating goal...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Set Goal — agents will create a plan
                  </>
                )}
              </button>
            </form>

            {/* Manual plan link */}
            <div className="text-center mt-6">
              <button
                onClick={() => setShowManualPlan(true)}
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                Or create a plan manually
              </button>
            </div>
          </div>
        )}

        {/* Legacy Manual Plan Form */}
        {showManualPlan && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setShowManualPlan(false)}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to goal-setting
              </button>
              <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Create Plan Manually</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create a plan directly without setting a goal first.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <form onSubmit={handlePlanSubmit} className="space-y-6">
                <div>
                  <label htmlFor="planTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Plan Title
                  </label>
                  <input
                    type="text"
                    id="planTitle"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter a title for your plan"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="planDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="planDescription"
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Describe the purpose and goals of this plan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        className="form-radio text-blue-600"
                        name="planStatus"
                        value="draft"
                        checked={planStatus === 'draft'}
                        onChange={() => setPlanStatus('draft')}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Draft</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        className="form-radio text-blue-600"
                        name="planStatus"
                        value="active"
                        checked={planStatus === 'active'}
                        onChange={() => setPlanStatus('active')}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowManualPlan(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createPlan.isLoading || !planTitle.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createPlan.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Create Plan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePlan;
