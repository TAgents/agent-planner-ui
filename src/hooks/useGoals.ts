import { useState, useEffect, useCallback } from 'react';
import { goalsService } from '../services/api';

export interface SuccessMetric {
  metric: string;
  target: number;
  current: number;
  unit: string;
}

export interface Goal {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  status: 'active' | 'achieved' | 'at_risk' | 'abandoned';
  success_metrics: SuccessMetric[];
  time_horizon?: string;
  github_repo_url?: string;
  knowledge_store_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  created_by_user?: {
    id: string;
    name?: string;
    email: string;
  };
  linked_plans?: Array<{
    id: string;
    title: string;
    status: string;
    progress: number;
    linked_at: string;
  }>;
  linked_plans_count?: number;
}

export const useGoals = (filters?: { organization_id?: string; status?: string }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await goalsService.list(filters);
      setGoals(data);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      setError(err.message || 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [filters?.organization_id, filters?.status]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async (data: {
    organization_id: string;
    title: string;
    description?: string;
    success_metrics?: SuccessMetric[];
    time_horizon?: string;
  }) => {
    const newGoal = await goalsService.create(data);
    await fetchGoals();
    return newGoal;
  };

  const updateGoal = async (goalId: string, data: Partial<Goal>) => {
    const updated = await goalsService.update(goalId, data);
    await fetchGoals();
    return updated;
  };

  const deleteGoal = async (goalId: string) => {
    await goalsService.delete(goalId);
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
      const data = await goalsService.get(goalId);
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

  const updateMetrics = async (metrics: SuccessMetric[]) => {
    if (!goalId) return;
    await goalsService.updateMetrics(goalId, metrics);
    await fetchGoal();
  };

  const linkPlan = async (planId: string) => {
    if (!goalId) return;
    await goalsService.linkPlan(goalId, planId);
    await fetchGoal();
  };

  const unlinkPlan = async (planId: string) => {
    if (!goalId) return;
    await goalsService.unlinkPlan(goalId, planId);
    await fetchGoal();
  };

  return {
    goal,
    loading,
    error,
    fetchGoal,
    updateMetrics,
    linkPlan,
    unlinkPlan,
  };
};
