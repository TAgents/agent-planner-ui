import { useQuery, useMutation, useQueryClient } from 'react-query';
import { axiosInstance } from '../services/api';

export interface GoalProgressStats {
  total: number;
  completed: number;
  in_progress: number;
  blocked: number;
  not_started: number;
  completion_percentage: number;
}

export interface GoalV2 {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  organizationId: string | null;
  type: 'outcome' | 'constraint' | 'metric' | 'principle';
  status: 'active' | 'achieved' | 'paused' | 'abandoned';
  successCriteria: any;
  priority: number;
  parentGoalId: string | null;
  createdAt: string;
  updatedAt: string;
  ownerName?: string;
  ownerEmail?: string;
  links?: GoalLink[];
  evaluations?: GoalEvaluation[];
  progress?: GoalProgressStats;
  children?: GoalV2[];
}

export interface GoalLink {
  id: string;
  goalId: string;
  linkedType: 'plan' | 'task' | 'agent';
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

async function fetchApi(path: string, options?: { method?: string; body?: string }) {
  const config: any = { url: `/goals${path}`, method: options?.method || 'GET' };
  if (options?.body) config.data = JSON.parse(options.body);
  const res = await axiosInstance(config);
  return res.data;
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

// ─── Goal Dependency Hooks ────────────────────────────────────

export interface GoalPathNode {
  node_id: string;
  dependency_type: string;
  weight: number;
  depth: number;
  title: string;
  status: string;
  node_type: string;
  task_mode: string;
  plan_id: string;
}

export interface GoalPathResult {
  nodes: GoalPathNode[];
  stats: {
    total: number;
    completed: number;
    blocked: number;
    in_progress: number;
    not_started: number;
    completion_percentage: number;
  };
}

export interface GoalProgressResult {
  goal_id: string;
  progress: number;
  direct_progress: number;
  stats: GoalPathResult['stats'];
}

export interface GoalAchiever {
  dependency_id: string;
  node_id: string;
  title: string;
  status: string;
  node_type: string;
  dependency_type: string;
  weight: number;
}

export interface KnowledgeGapTask {
  node_id: string;
  title: string;
  status: string;
  depth: number;
  fact_count: number;
  has_knowledge: boolean;
  top_facts: string[];
}

export interface KnowledgeGapsResult {
  available: boolean;
  tasks: KnowledgeGapTask[];
  gaps: KnowledgeGapTask[];
  coverage: { total: number; covered: number; percentage: number };
}

export function useGoalPath(goalId: string | undefined) {
  return useQuery(
    [GOALS_KEY, 'path', goalId],
    () => fetchApi(`/${goalId}/path`) as Promise<GoalPathResult>,
    { enabled: !!goalId }
  );
}

export function useGoalProgress(goalId: string | undefined) {
  return useQuery(
    [GOALS_KEY, 'progress', goalId],
    () => fetchApi(`/${goalId}/progress`) as Promise<GoalProgressResult>,
    { enabled: !!goalId }
  );
}

export function useGoalAchievers(goalId: string | undefined) {
  return useQuery(
    [GOALS_KEY, 'achievers', goalId],
    () => fetchApi(`/${goalId}/achievers`).then(d => d as { tasks: GoalAchiever[]; count: number }),
    { enabled: !!goalId }
  );
}

export function useGoalKnowledgeGaps(goalId: string | undefined) {
  return useQuery(
    [GOALS_KEY, 'knowledge-gaps', goalId],
    () => fetchApi(`/${goalId}/knowledge-gaps`) as Promise<KnowledgeGapsResult>,
    { enabled: !!goalId }
  );
}

export function useAddAchiever() {
  const qc = useQueryClient();
  return useMutation(
    ({ goalId, nodeId, weight }: { goalId: string; nodeId: string; weight?: number }) =>
      fetchApi(`/${goalId}/achievers`, { method: 'POST', body: JSON.stringify({ source_node_id: nodeId, weight }) }),
    { onSuccess: () => qc.invalidateQueries(GOALS_KEY) }
  );
}

export function useRemoveAchiever() {
  const qc = useQueryClient();
  return useMutation(
    ({ goalId, depId }: { goalId: string; depId: string }) =>
      fetchApi(`/${goalId}/achievers/${depId}`, { method: 'DELETE' }),
    { onSuccess: () => qc.invalidateQueries(GOALS_KEY) }
  );
}
