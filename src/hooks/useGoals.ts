import { useState, useEffect, useCallback } from 'react';
import { goalService, Goal, SuccessMetric } from '../services/api';

export type { Goal, SuccessMetric };

export const useGoals = (organizationId?: string, statusFilter?: string) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await goalService.list(organizationId, statusFilter);
      setGoals(data);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      setError(err.message || 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [organizationId, statusFilter]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async (data: {
    organization_id: string;
    title: string;
    description?: string;
    success_metrics?: SuccessMetric[];
    time_horizon?: string;
    github_repo_url?: string;
  }) => {
    const newGoal = await goalService.create(data);
    await fetchGoals();
    return newGoal;
  };

  const updateGoal = async (goalId: string, data: {
    title?: string;
    description?: string;
    status?: 'active' | 'achieved' | 'at_risk' | 'abandoned';
    success_metrics?: SuccessMetric[];
    time_horizon?: string;
  }) => {
    const updated = await goalService.update(goalId, data);
    await fetchGoals();
    return updated;
  };

  const deleteGoal = async (goalId: string) => {
    await goalService.delete(goalId);
    await fetchGoals();
  };

  const linkPlan = async (goalId: string, planId: string) => {
    await goalService.linkPlan(goalId, planId);
    await fetchGoals();
  };

  const unlinkPlan = async (goalId: string, planId: string) => {
    await goalService.unlinkPlan(goalId, planId);
    await fetchGoals();
  };

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    linkPlan,
    unlinkPlan,
  };
};

export const useGoal = (goalId: string | null) => {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoal = useCallback(async () => {
    if (!goalId) {
      setGoal(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await goalService.get(goalId);
      setGoal(data);
    } catch (err: any) {
      console.error('Error fetching goal:', err);
      setError(err.message || 'Failed to fetch goal');
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  const updateGoal = async (data: {
    title?: string;
    description?: string;
    status?: 'active' | 'achieved' | 'at_risk' | 'abandoned';
    success_metrics?: SuccessMetric[];
    time_horizon?: string;
  }) => {
    if (!goalId) return;
    const updated = await goalService.update(goalId, data);
    setGoal(updated);
    return updated;
  };

  const linkPlan = async (planId: string) => {
    if (!goalId) return;
    await goalService.linkPlan(goalId, planId);
    await fetchGoal();
  };

  const unlinkPlan = async (planId: string) => {
    if (!goalId) return;
    await goalService.unlinkPlan(goalId, planId);
    await fetchGoal();
  };

  return {
    goal,
    loading,
    error,
    fetchGoal,
    updateGoal,
    linkPlan,
    unlinkPlan,
  };
};
