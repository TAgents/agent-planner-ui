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
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  FileText,
  Brain,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { goalDashboardService, nodeService, dashboardApi, decisionsApi } from '../services/api';
import { useDashboardSummary, useRecentPlans } from '../hooks/useDashboard';
import { useRecentActivity, RecentActivityItem } from '../hooks/useRecentActivity';
import DecisionQueue, { PendingDecision } from '../components/decisions/DecisionQueue';
import AgentActivityStream, { ActivityItem } from '../components/activity/AgentActivityStream';
import ContradictionAlert, { Contradiction } from '../components/alerts/ContradictionAlert';

// ============================================================================
// Types
// ============================================================================

interface GoalHealth {
  id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
  health: 'on_track' | 'at_risk' | 'stale';
  last_activity: string | null;
  owner_name?: string | null;
  bottleneck?: { task_name: string; blocks_count: number } | null;
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

const safeFormatDate = (dateStr?: string | null): string | null => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : formatDistanceToNow(d, { addSuffix: true });
  } catch { return null; }
};

const isStaleDate = (dateStr?: string | null): boolean => {
  if (!dateStr) return true;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? true : differenceInDays(new Date(), d) > 3;
  } catch { return true; }
};

/** Map useRecentActivity items → AgentActivityStream's ActivityItem shape */
const mapToActivityItem = (item: RecentActivityItem): ActivityItem => {
  const typeMap: Record<string, ActivityItem['type']> = {
    progress: 'status_change',
    decision: 'agent_requested',
    challenge: 'agent_requested',
    reasoning: 'log_added',
    log: 'log_added',
    comment: 'log_added',
  };
  return {
    id: item.id,
    type: typeMap[item.type || ''] || 'log_added',
    message: item.description || item.content || '',
    plan_title: item.plan_title || '',
    plan_id: item.plan_id || '',
    node_title: item.node_title,
    node_id: item.node_id,
    timestamp: item.created_at,
    actor_type: item.user ? 'human' : 'agent',
  };
};

// ============================================================================
// Stat Pill
// ============================================================================

const StatPill: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
  to?: string;
}> = ({ label, value, icon, accent = 'text-gray-400', to }) => {
  const inner = (
    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-white/60 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700 transition-colors group">
      <span className={`${accent} transition-colors`}>{icon}</span>
      <span
        className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
        {label}
      </span>
    </div>
  );
  if (to) return <Link to={to} className="no-underline">{inner}</Link>;
  return inner;
};

// ============================================================================
// Goal Card
// ============================================================================

const healthColors: Record<string, { dot: string; bar: string; ring: string }> = {
  on_track: { dot: 'bg-emerald-500', bar: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
  at_risk: { dot: 'bg-amber-500', bar: 'bg-amber-500', ring: 'ring-amber-500/20' },
  stale: { dot: 'bg-red-500', bar: 'bg-red-500', ring: 'ring-red-500/20' },
};

const typeBadge: Record<string, string> = {
  outcome: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  constraint: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  metric: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  principle: 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400',
};

const GoalCard: React.FC<{ goal: GoalHealth }> = ({ goal }) => {
  const colors = healthColors[goal.health] || healthColors.on_track;
  const pendingCount = goal.pending_decisions?.length || 0;
  const stale = isStaleDate(goal.last_activity);

  return (
    <Link
      to={`/app/goals/${goal.id}`}
      className="group block rounded-lg bg-white dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-800/60 p-3.5 hover:shadow-md dark:hover:border-gray-700 transition-all duration-200"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ring-4 ${colors.dot} ${colors.ring}`} />
        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white truncate flex-1"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          {goal.title}
        </h3>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${typeBadge[goal.type] || typeBadge.principle}`}>
          {goal.type}
        </span>
        {pendingCount > 0 && (
          <span className="inline-flex items-center justify-center w-4.5 h-4.5 min-w-[18px] text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 rounded-full">
            {pendingCount}
          </span>
        )}
        <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-700/80 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${colors.bar}`} style={{ width: `${goal.progress || 0}%` }} />
        </div>
        <span className="text-[10px] tabular-nums text-gray-500 dark:text-gray-400 w-7 text-right"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {goal.progress || 0}%
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-[10px]">
        {goal.bottleneck ? (
          <span className="text-red-600 dark:text-red-400 truncate flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
            {goal.bottleneck.task_name} blocks {goal.bottleneck.blocks_count}
          </span>
        ) : goal.last_activity ? (
          <span className={`truncate ${stale ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {stale ? 'Stale · ' : ''}{safeFormatDate(goal.last_activity) || 'No activity'}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">No activity yet</span>
        )}
      </div>
    </Link>
  );
};

// ============================================================================
// Plan Card (compact)
// ============================================================================

const statusColor: Record<string, string> = {
  active: 'text-blue-500',
  completed: 'text-emerald-500',
  draft: 'text-gray-400',
  archived: 'text-gray-400',
};

const PlanCard: React.FC<{ plan: { id: string; title: string; status: string; progress?: number | null; updated_at: string } }> = ({ plan }) => (
  <Link
    to={`/app/plans/${plan.id}`}
    className="group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
  >
    <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${statusColor[plan.status] || 'text-gray-400'}`} />
    <div className="flex-1 min-w-0">
      <span className="text-xs font-medium text-gray-900 dark:text-white truncate block">{plan.title}</span>
      <span className="text-[10px] text-gray-400 dark:text-gray-500">{safeFormatDate(plan.updated_at)}</span>
    </div>
    {plan.progress != null && (
      <span className="text-[10px] tabular-nums text-gray-400 dark:text-gray-500 flex-shrink-0"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {plan.progress}%
      </span>
    )}
    <ChevronRight className="w-3 h-3 text-gray-200 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors flex-shrink-0" />
  </Link>
);

// ============================================================================
// Skeleton
// ============================================================================

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-gray-200 dark:bg-gray-800 rounded animate-pulse ${className}`} />
);

const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-36" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// Main Dashboard
// ============================================================================

const Dashboard: React.FC = () => {
  const { userId, organizationName } = useAuth();
  const queryClient = useQueryClient();

  // --- Data sources ---
  const { data: summary } = useDashboardSummary();
  const { data: recentPlansData } = useRecentPlans(6);
  const { data: recentActivityData } = useRecentActivity(15);

  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery<DashboardData>(
    ['goalDashboard', userId],
    () => goalDashboardService.getDashboard(),
    { refetchInterval: 30000 }
  );

  const goals = dashboardData?.goals || [];
  const recentPlans = recentPlansData?.plans || [];

  // Fetch pending decisions directly from /dashboard/pending (same source as bell icon)
  const { data: pendingData } = useQuery(
    ['dashboardPending', userId],
    () => dashboardApi.getPending(20),
    { refetchInterval: 30000 }
  );

  // Map recent activity → AgentActivityStream format
  const initialActivities = useMemo<ActivityItem[]>(() => {
    if (!recentActivityData || !Array.isArray(recentActivityData)) return [];
    return recentActivityData.map(mapToActivityItem);
  }, [recentActivityData]);

  // Map pending items → PendingDecision[] for DecisionQueue
  const pendingDecisions = useMemo<PendingDecision[]>(() => {
    if (!pendingData) return [];
    const decisions: PendingDecision[] = (pendingData.decisions || []).map((d: any) => ({
      node_id: d.node_id || d.id,
      plan_id: d.plan_id,
      title: d.title,
      plan_title: d.plan_title || '',
      type: 'agent_request' as const,
      agent_request_message: d.description || null,
      created_at: d.created_at,
      _decision_id: d.id,  // preserve for resolve API
    }));
    const agentRequests: PendingDecision[] = (pendingData.agent_requests || []).map((r: any) => ({
      node_id: r.id,
      plan_id: r.plan_id,
      title: r.task_title,
      plan_title: r.plan_title || '',
      type: 'agent_request' as const,
      agent_request_message: r.message || null,
      created_at: r.requested_at,
    }));
    return [...decisions, ...agentRequests];
  }, [pendingData]);

  const contradictions = useMemo<Contradiction[]>(() => {
    const goalC = goals.flatMap(g => g.contradictions || []);
    const topC = dashboardData?.contradictions || [];
    const seen = new Set<string>();
    return [...topC, ...goalC].filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
  }, [goals, dashboardData]);

  // Counts by health
  const healthCounts = useMemo(() => {
    const counts = { on_track: 0, at_risk: 0, stale: 0 };
    goals.forEach(g => { if (counts[g.health] !== undefined) counts[g.health]++; });
    return counts;
  }, [goals]);

  // Decision handlers
  const invalidateDecisionQueries = useCallback(() => {
    queryClient.invalidateQueries(['goalDashboard']);
    queryClient.invalidateQueries(['dashboardSummary']);
    queryClient.invalidateQueries(['dashboardPending']);
    queryClient.invalidateQueries(['notifications', 'pending']);
  }, [queryClient]);

  const handleApprove = useCallback(async (decision: PendingDecision) => {
    try {
      const decisionId = (decision as any)._decision_id;
      if (decisionId) {
        // Resolve via decisions API (decision_requests table)
        await decisionsApi.resolve(decision.plan_id, decisionId, {
          decision: 'approved',
          rationale: 'Approved from dashboard',
        });
      } else {
        // Node-based decision (plan_ready or agent_requested on plan_nodes)
        const newStatus = decision.type === 'plan_ready' ? 'in_progress' : 'completed';
        await nodeService.updateNodeStatus(decision.plan_id, decision.node_id, newStatus);
      }
      invalidateDecisionQueries();
    } catch (err) { console.error('Failed to approve:', err); }
  }, [invalidateDecisionQueries]);

  const handleRedirect = useCallback(async (decision: PendingDecision, instructions: string) => {
    try {
      const decisionId = (decision as any)._decision_id;
      if (decisionId) {
        await decisionsApi.resolve(decision.plan_id, decisionId, {
          decision: 'redirected',
          rationale: instructions,
        });
      } else {
        await nodeService.updateNode(decision.plan_id, decision.node_id, {
          agent_instructions: instructions,
          status: 'not_started',
        } as any);
      }
      invalidateDecisionQueries();
    } catch (err) { console.error('Failed to redirect:', err); }
  }, [invalidateDecisionQueries]);

  if (isLoading) return <DashboardSkeleton />;

  const attentionCount = (summary?.pending_decisions_count || 0) + (summary?.pending_agent_requests_count || 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* ============================================================ */}
        {/* Header strip */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Mission Control
              {organizationName && (
                <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
                  {organizationName}
                </span>
              )}
            </h1>
          </div>
          <Link
            to="/app/goals"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-md hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
          >
            <Plus className="w-3 h-3" />
            New Goal
          </Link>
        </div>

        {/* ============================================================ */}
        {/* Stats ribbon */}
        {/* ============================================================ */}
        <div className="flex flex-wrap gap-2.5">
          <StatPill
            label="Need Attention"
            value={attentionCount}
            icon={<ShieldCheck className="w-4 h-4" />}
            accent={attentionCount > 0 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-600'}
          />
          <StatPill
            label="Active Goals"
            value={summary?.active_goals_count || goals.length}
            icon={<Target className="w-4 h-4" />}
            accent="text-blue-500"
            to="/app/goals"
          />
          <StatPill
            label="Active Plans"
            value={summary?.active_plans_count || 0}
            icon={<Layers className="w-4 h-4" />}
            accent="text-indigo-500"
            to="/app/plans"
          />
          <StatPill
            label="Done This Week"
            value={summary?.tasks_completed_this_week || 0}
            icon={<CheckCircle2 className="w-4 h-4" />}
            accent="text-emerald-500"
          />
          {(summary?.knowledge_entries_count ?? 0) > 0 && (
            <StatPill
              label="Knowledge"
              value={summary?.knowledge_entries_count || 0}
              icon={<Brain className="w-4 h-4" />}
              accent="text-purple-500"
              to="/app/knowledge"
            />
          )}
        </div>

        {/* ============================================================ */}
        {/* Error */}
        {/* ============================================================ */}
        {isError && (
          <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-xs text-red-600 dark:text-red-400">Failed to load dashboard data.</p>
          </div>
        )}

        {/* Contradictions */}
        {contradictions.length > 0 && <ContradictionAlert contradictions={contradictions} />}

        {/* ============================================================ */}
        {/* Main grid: 2/3 left + 1/3 right */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ========== LEFT COLUMN ========== */}
          <div className="lg:col-span-2 space-y-5">

            {/* Decision Queue */}
            <section className="bg-white dark:bg-gray-900/60 rounded-lg border border-gray-200/80 dark:border-gray-800/60">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800/50">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <h2
                  className="text-[13px] font-semibold text-gray-900 dark:text-white"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Decisions Needed
                </h2>
                {pendingDecisions.length > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 rounded-full min-w-[18px]">
                    {pendingDecisions.length}
                  </span>
                )}
              </div>
              <div className="p-4">
                <DecisionQueue
                  decisions={pendingDecisions}
                  onApprove={handleApprove}
                  onRedirect={handleRedirect}
                />
              </div>
            </section>

            {/* Goal Health */}
            <section className="bg-white dark:bg-gray-900/60 rounded-lg border border-gray-200/80 dark:border-gray-800/60">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800/50">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <h2
                    className="text-[13px] font-semibold text-gray-900 dark:text-white"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Goal Health
                  </h2>
                </div>
                {goals.length > 0 && (
                  <div className="flex items-center gap-3 text-[10px] font-medium">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {healthCounts.on_track}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {healthCounts.at_risk}
                    </span>
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {healthCounts.stale}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                {goals.length === 0 ? (
                  <div className="text-center py-10">
                    <Target className="w-7 h-7 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">No goals yet</p>
                    <Link
                      to="/app/goals"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Create a goal
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ========== RIGHT COLUMN ========== */}
          <div className="space-y-5">

            {/* Agent Activity */}
            <section className="bg-white dark:bg-gray-900/60 rounded-lg border border-gray-200/80 dark:border-gray-800/60">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800/50">
                <Activity className="w-4 h-4 text-emerald-500" />
                <h2
                  className="text-[13px] font-semibold text-gray-900 dark:text-white"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Agent Activity
                </h2>
                <span className="ml-auto" aria-label="Live"><Zap className="w-3 h-3 text-emerald-400 animate-pulse" /></span>
              </div>
              <div className="p-3">
                <AgentActivityStream initialActivities={initialActivities} maxItems={20} />
              </div>
            </section>

            {/* Recent Plans */}
            <section className="bg-white dark:bg-gray-900/60 rounded-lg border border-gray-200/80 dark:border-gray-800/60">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800/50">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <h2
                    className="text-[13px] font-semibold text-gray-900 dark:text-white"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Recent Plans
                  </h2>
                </div>
                <Link
                  to="/app/plans"
                  className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium flex items-center gap-0.5 transition-colors"
                >
                  All <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </div>
              <div className="py-1">
                {recentPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 dark:text-gray-500">No plans yet</p>
                  </div>
                ) : (
                  recentPlans.map(plan => <PlanCard key={plan.id} plan={plan} />)
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
