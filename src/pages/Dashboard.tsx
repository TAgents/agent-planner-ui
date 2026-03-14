import React, { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import {
  Target,
  Activity,
  ShieldCheck,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { goalDashboardService, nodeService } from '../services/api';
import DecisionQueue, { PendingDecision } from '../components/decisions/DecisionQueue';
import AgentActivityStream, { ActivityItem } from '../components/activity/AgentActivityStream';
import ContradictionAlert, { Contradiction } from '../components/alerts/ContradictionAlert';

// ============================================================================
// Types for Goal Dashboard API response
// ============================================================================

interface GoalHealth {
  id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
  health: 'on_track' | 'at_risk' | 'stale';
  last_activity: string | null;
  bottleneck?: {
    task_name: string;
    blocks_count: number;
  } | null;
  pending_decisions?: PendingDecision[];
  contradictions?: Contradiction[];
}

interface DashboardData {
  goals: GoalHealth[];
  contradictions?: Contradiction[];
}

// ============================================================================
// Helpers
// ============================================================================

const healthDotColor: Record<string, string> = {
  on_track: 'bg-green-500',
  at_risk: 'bg-amber-500',
  stale: 'bg-red-500',
};

const typeBadgeStyle: Record<string, string> = {
  outcome: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  constraint: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  metric: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  principle: 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400',
};

const safeFormatDate = (dateStr?: string | null): string | null => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return null;
  }
};

const isStaleDate = (dateStr?: string | null): boolean => {
  if (!dateStr) return true;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return true;
    return differenceInDays(new Date(), date) > 3;
  } catch {
    return true;
  }
};

// ============================================================================
// Loading Skeleton
// ============================================================================

const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Decision queue skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
      {/* Two-column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
        <div className="lg:col-span-2 space-y-3">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// Goal Card
// ============================================================================

const GoalCard: React.FC<{ goal: GoalHealth }> = ({ goal }) => {
  const pendingCount = goal.pending_decisions?.length || 0;
  const stale = isStaleDate(goal.last_activity);

  return (
    <Link
      to={`/app/goals/${goal.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all duration-150"
    >
      {/* Header row */}
      <div className="flex items-center gap-2.5 mb-2">
        <span
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${healthDotColor[goal.health] || 'bg-gray-400'}`}
          title={goal.health?.replace('_', ' ')}
        />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
          {goal.title}
        </h3>
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeBadgeStyle[goal.type] || typeBadgeStyle.principle}`}
        >
          {goal.type}
        </span>
        {pendingCount > 0 && (
          <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 rounded-full">
            {pendingCount}
          </span>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${goal.progress || 0}%` }}
          />
        </div>
        <span className="text-[11px] tabular-nums text-gray-500 dark:text-gray-400 flex-shrink-0 w-8 text-right">
          {goal.progress || 0}%
        </span>
      </div>

      {/* Footer details */}
      <div className="flex items-center gap-3 text-[11px]">
        {goal.bottleneck && (
          <span className="text-red-600 dark:text-red-400 truncate">
            Bottleneck: {goal.bottleneck.task_name} blocks {goal.bottleneck.blocks_count} task{goal.bottleneck.blocks_count !== 1 ? 's' : ''}
          </span>
        )}
        {!goal.bottleneck && goal.last_activity && (
          <span className={`truncate ${stale ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {stale ? 'Stale — ' : ''}
            {safeFormatDate(goal.last_activity) || 'No recent activity'}
          </span>
        )}
        {!goal.bottleneck && !goal.last_activity && (
          <span className="text-gray-400 dark:text-gray-500">No activity yet</span>
        )}
      </div>
    </Link>
  );
};

// ============================================================================
// Main Dashboard Component
// ============================================================================

const Dashboard: React.FC = () => {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  // Fetch goal dashboard data
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery<DashboardData>(
    ['goalDashboard', userId],
    () => goalDashboardService.getDashboard(),
    { refetchInterval: 30000 }
  );

  // Extract goals and flatten pending decisions across all goals
  const goals = dashboardData?.goals || [];

  const pendingDecisions = useMemo<PendingDecision[]>(() => {
    return goals.flatMap((g) => g.pending_decisions || []);
  }, [goals]);

  const contradictions = useMemo<Contradiction[]>(() => {
    const goalContradictions = goals.flatMap((g) => g.contradictions || []);
    const topLevel = dashboardData?.contradictions || [];
    // Deduplicate by id
    const seen = new Set<string>();
    const all: Contradiction[] = [];
    for (const c of [...topLevel, ...goalContradictions]) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        all.push(c);
      }
    }
    return all;
  }, [goals, dashboardData]);

  // Decision handlers
  const handleApprove = useCallback(
    async (decision: PendingDecision) => {
      try {
        // For plan_ready decisions, approve by moving to in_progress
        // For agent_request, mark as completed (approved)
        const newStatus = decision.type === 'plan_ready' ? 'in_progress' : 'completed';
        await nodeService.updateNodeStatus(decision.plan_id, decision.node_id, newStatus);
        queryClient.invalidateQueries(['goalDashboard']);
      } catch (err) {
        console.error('Failed to approve decision:', err);
      }
    },
    [queryClient]
  );

  const handleRedirect = useCallback(
    async (decision: PendingDecision, instructions: string) => {
      try {
        await nodeService.updateNode(decision.plan_id, decision.node_id, {
          agent_instructions: instructions,
          status: 'not_started',
        } as any);
        queryClient.invalidateQueries(['goalDashboard']);
      } catch (err) {
        console.error('Failed to redirect decision:', err);
      }
    },
    [queryClient]
  );

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Error banner */}
        {isError && (
          <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-xs text-red-600 dark:text-red-400">
              Failed to load dashboard data. Please try refreshing.
            </p>
          </div>
        )}

        {/* Contradiction alerts */}
        {contradictions.length > 0 && (
          <ContradictionAlert contradictions={contradictions} />
        )}

        {/* Section 1: Decision Queue */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            Decisions Needed
            {pendingDecisions.length > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                {pendingDecisions.length}
              </span>
            )}
          </h2>
          <DecisionQueue
            decisions={pendingDecisions}
            onApprove={handleApprove}
            onRedirect={handleRedirect}
          />
        </section>

        {/* Section 2 + 3: Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Goal Health (left column, ~60%) */}
          <section className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Goal Health
            </h2>

            {goals.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center py-12 px-4">
                <Target className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  No goals yet. Create a goal to get started.
                </p>
                <Link
                  to="/app/goals"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create a goal
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </section>

          {/* Agent Activity Stream (right column, ~40%) */}
          <section className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Agent Activity
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <AgentActivityStream initialActivities={[]} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
