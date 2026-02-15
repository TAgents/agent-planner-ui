import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';

// Use the default export (axios instance)
const apiClient = (api as any).default || api;

export interface GoalV2 {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  type: 'outcome' | 'constraint' | 'metric' | 'principle';
  status: 'active' | 'achieved' | 'paused' | 'abandoned';
  successCriteria: any;
  priority: number;
  parentGoalId: string | null;
  createdAt: string;
  updatedAt: string;
  links?: GoalLink[];
  evaluations?: GoalEvaluation[];
  children?: GoalV2[];
}

export interface GoalLink {
  id: string;
  goalId: string;
  linkedType: 'plan' | 'task' | 'agent' | 'workflow';
  linkedId: string;
  createdAt: string;
}

export interface GoalEvaluation {
  id: string;
  goalId: string;
  evaluatedAt: string;
  evaluatedBy: string;
  score: number | null;
  reasoning: string | null;
  suggestedActions: any;
  createdAt: string;
}

const GOALS_KEY = 'goals-v2';

async function fetchApi(path: string, options?: any) {
  const sessionStr = localStorage.getItem('auth_session');
  let token: string | null = null;
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      token = session.access_token || session.accessToken || session;
    } catch { token = sessionStr; }
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/goals${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

export function useGoalsV2(filters?: { status?: string; type?: string }) {
  return useQuery([GOALS_KEY, 'list', filters], () =>
    fetchApi(`?${new URLSearchParams(filters as any || {}).toString()}`).then(d => d.goals as GoalV2[])
  );
}

export function useGoalV2(id: string | undefined) {
  return useQuery([GOALS_KEY, 'detail', id], () =>
    fetchApi(`/${id}`).then(d => d as GoalV2),
    { enabled: !!id }
  );
}

export function useGoalsTree() {
  return useQuery([GOALS_KEY, 'tree'], () =>
    fetchApi('/tree').then(d => d.tree as GoalV2[])
  );
}

export function useGoalEvaluations(goalId: string | undefined) {
  return useQuery([GOALS_KEY, 'evaluations', goalId], () =>
    fetchApi(`/${goalId}/evaluations`).then(d => d.evaluations as GoalEvaluation[]),
    { enabled: !!goalId }
  );
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation(
    (data: Partial<GoalV2>) => fetchApi('', { method: 'POST', body: JSON.stringify(data) }),
    { onSuccess: () => qc.invalidateQueries(GOALS_KEY) }
  );
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation(
    ({ id, ...data }: Partial<GoalV2> & { id: string }) =>
      fetchApi(`/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    { onSuccess: () => qc.invalidateQueries(GOALS_KEY) }
  );
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation(
    (id: string) => fetchApi(`/${id}`, { method: 'DELETE' }),
    { onSuccess: () => qc.invalidateQueries(GOALS_KEY) }
  );
}

export function useAddGoalLink() {
  const qc = useQueryClient();
  return useMutation(
    ({ goalId, linkedType, linkedId }: { goalId: string; linkedType: string; linkedId: string }) =>
      fetchApi(`/${goalId}/links`, { method: 'POST', body: JSON.stringify({ linkedType, linkedId }) }),
    { onSuccess: () => qc.invalidateQueries(GOALS_KEY) }
  );
}

export function useAddEvaluation() {
  const qc = useQueryClient();
  return useMutation(
    ({ goalId, ...data }: { goalId: string; evaluatedBy: string; score?: number; reasoning?: string }) =>
      fetchApi(`/${goalId}/evaluations`, { method: 'POST', body: JSON.stringify(data) }),
    { onSuccess: () => qc.invalidateQueries(GOALS_KEY) }
  );
}
