import { useQuery, useMutation, useQueryClient } from 'react-query';
import { axiosInstance } from '../services/api';
import { goalDashboardService } from '../services/goals.service';
import type { GoalCriterion } from '../utils/goalCriteria';
import type { GoalHealth } from '../utils/goalHealth';

export type GoalType = 'outcome' | 'constraint' | 'metric' | 'principle';
export type GoalStatus = 'draft' | 'active' | 'achieved' | 'paused' | 'abandoned' | 'archived';

/** success_criteria as stored — structured objects (preferred), legacy strings, or the wrapped form. */
export type SuccessCriteria =
  | Array<GoalCriterion | string>
  | { criteria: Array<GoalCriterion | string> }
  | null;

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
  /** v1.1 — Workspace this goal belongs to (folder under the org). */
  workspaceId?: string | null;
  workspace_id?: string | null;
  type: GoalType;
  status: GoalStatus;
  /** True once promoted from desire → intention (committed). */
  committed?: boolean;
  successCriteria: SuccessCriteria;
  priority: number;
  parentGoalId: string | null;
  createdAt: string;
  updatedAt: string;
  ownerName?: string;
  ownerEmail?: string;
  links?: GoalLink[];
  evaluations?: GoalEvaluation[];
  progress?: GoalProgressStats;
  /** Activity density: count of node_logs per day for the last 10 days, on tasks that achieve this goal. */
  density?: number[];
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

// Goal evaluations are now embedded in the goal object (goal.evaluations);
// the standalone GET/POST /goals/:id/evaluations endpoints were removed in
// the API v1 consolidation. Read goal.evaluations directly.

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

/**
 * Record a success criterion's current value (record_criterion_progress). For a
 * yes/no milestone pass current=true + direction='boolean' to mark it met — the
 * human steering affordance so attainment can move without an agent. Auto-
 * achieves the goal when every measurable criterion is met.
 */
export function useRecordCriterion() {
  const qc = useQueryClient();
  return useMutation(
    ({ goalId, index, current, direction }: { goalId: string; index: number; current: unknown; direction?: 'increase' | 'decrease' | 'boolean' }) =>
      fetchApi(`/${goalId}/criteria/progress`, {
        method: 'POST',
        body: JSON.stringify({ index, current, direction }),
      }),
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

// ─── Composed goal state (GET /v1/goals/:id/state) ────────────
// One call returns goal + quality dimensions + execution/attainment progress +
// linked plans (with hidden count) + tasks + bottlenecks + knowledge gaps. This
// is the canonical read for the detail page — prefer it over fanning out across
// useGoalV2 + getQuality + useGoalProgress.

export interface QualityDimension {
  score: number;
  detail: string;
}

export interface GoalStateProgress {
  goal_id: string;
  /** Legacy alias = execution_pct. */
  progress: number;
  direct_progress?: number;
  /** % of achiever tasks completed. */
  execution_pct: number;
  /** % of MEASURABLE criteria met — null when the goal has no measurable criteria. */
  attainment_pct: number | null;
  attainment: { measurable_count: number; met_count: number };
  stats: GoalProgressStats & { source?: 'achievers' | 'linked_plans' };
}

export interface GoalStateResult {
  as_of: string;
  goal: {
    id: string;
    title: string;
    description: string | null;
    type: GoalType;
    committed: boolean;
    status: GoalStatus;
    priority: number;
    success_criteria: SuccessCriteria;
    promoted_at: string | null;
  };
  linked_plans: Array<{ id: string; link_id: string; title?: string | null; status?: string | null }>;
  /** Linked plans the viewer cannot access (filtered out of linked_plans). */
  hidden_linked_plan_count: number;
  linked_tasks: Array<{ id: string; title: string; status: string }>;
  quality: {
    score: number;
    dimensions: {
      clarity: QualityDimension;
      measurability: QualityDimension;
      actionability: QualityDimension;
      knowledge_grounding: QualityDimension;
      commitment: QualityDimension;
    };
    suggestions: string[];
    last_assessed_at: string;
  };
  progress: GoalStateProgress;
  bottlenecks: Array<{ node_id: string; title: string; status: string; direct_downstream_count: number }>;
  knowledge_gaps: KnowledgeGapTask[];
  /** Canonical goal health from the shared server rollup (same source as
   *  Mission/dashboard). null for non-active goals — show lifecycle status. */
  health: GoalHealth | null;
  /** Canonical cross-view numbers (execution %, counts) from the shared rollup.
   *  null for non-active goals. Headline execution progress reads from here so
   *  the detail matches Mission and the list. */
  rollup: GoalRollup | null;
  meta: { partial: boolean; failures: Array<{ source: string; message?: string }> };
}

export interface GoalRollup {
  health: GoalHealth;
  execution_pct: number;
  total_nodes: number;
  completed_nodes: number;
  in_progress_nodes: number;
  blocked_nodes: number;
  percent_blocked: number;
  linked_plan_count: number;
  attainment_pct: number | null;
  pending_decision_count: number;
}

export function useGoalState(goalId: string | undefined) {
  return useQuery(
    [GOALS_KEY, 'state', goalId],
    () => axiosInstance.get(`/v1/goals/${goalId}/state`).then((r) => r.data as GoalStateResult),
    { enabled: !!goalId }
  );
}

/** One row of the goals dashboard — the canonical per-goal health + execution
 *  source for list views. */
export interface GoalDashboardRow {
  id: string;
  status: string;
  workspace_id?: string | null;
  health: GoalHealth;
  linked_plan_progress?: {
    percent_completed: number;
    total_nodes: number;
    completed_nodes: number;
    in_progress_nodes: number;
    blocked_nodes: number;
    percent_blocked: number;
    linked_plan_count: number;
  };
}

/**
 * Canonical goal-health dashboard. The SINGLE source list views (Mission +
 * Goals list) read goal health from — no client-side re-derivation. Shared
 * query key so both pages hit one cached fetch. Only ACTIVE goals appear.
 */
export function useGoalDashboard() {
  return useQuery<{ goals: GoalDashboardRow[] }>(
    [GOALS_KEY, 'dashboard'],
    () => goalDashboardService.getDashboard(),
    { staleTime: 60_000 }
  );
}
