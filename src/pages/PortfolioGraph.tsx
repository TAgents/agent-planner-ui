import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Compass, Loader2, Zap, ArrowRight } from 'lucide-react';
import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { usePlans } from '../hooks/usePlans';
import { useGoalsV2 } from '../hooks/useGoalsV2';
import { goalBdiService } from '../services/goals.service';
import { goalDashboardService } from '../services/goals.service';
import { planService, SuggestedTask } from '../services/plans.service';
import { Plan } from '../types';

// ─── Helpers ─────────────────────────────────────────────────

function progressBarColor(pct: number) {
  if (pct >= 60) return 'bg-emerald-500';
  if (pct >= 20) return 'bg-amber-500';
  return 'bg-gray-400 dark:bg-gray-500';
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${progressBarColor(value)}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 w-8 text-right shrink-0">{value}%</span>
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</h2>
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{count}</span>
    </div>
  );
}

function healthDot(health: string) {
  if (health === 'on_track') return 'bg-emerald-500';
  if (health === 'at_risk') return 'bg-amber-500';
  return 'bg-red-500';
}

// ─── Main Component ──────────────────────────────────────────

export default function PortfolioGraph() {
  const { plans, isLoading: plansLoading } = usePlans(1, 100, 'active,draft');
  const { data: goalsData, isLoading: goalsLoading } = useGoalsV2();

  const goals = Array.isArray(goalsData) ? goalsData : (goalsData as any)?.goals || [];
  const activeGoals = goals.filter((g: any) => g.status === 'active');
  const goalIds = activeGoals.map((g: any) => g.id);

  // Fetch all portfolios to map plans -> goals
  const { data: allPortfolios, isLoading: portfoliosLoading } = useQuery(
    ['all-goal-portfolios', ...goalIds],
    async () => {
      const results: Record<string, string[]> = {};
      for (const gid of goalIds) {
        try {
          const p = await goalBdiService.getPortfolio(gid);
          results[gid] = (p.linked_plans || []).map((lp: any) => lp.plan_id);
        } catch { results[gid] = []; }
      }
      return results;
    },
    { enabled: goalIds.length > 0, staleTime: 30000 }
  );

  // Fetch goal dashboard for health data
  const { data: dashboardData } = useQuery(
    ['goal-dashboard'],
    () => goalDashboardService.getDashboard(),
    { staleTime: 30000 }
  );

  // Fetch suggested next tasks across all active plans
  const activePlanIds = (plans || []).filter((p: Plan) => p.status === 'active').map((p: Plan) => p.id);
  const { data: suggestionsData } = useQuery(
    ['cross-plan-suggestions', ...activePlanIds],
    async () => {
      const all: Array<SuggestedTask & { plan_id: string; plan_title: string }> = [];
      for (const plan of (plans || []).filter((p: Plan) => p.status === 'active').slice(0, 10)) {
        try {
          const res = await planService.suggestNextTasks(plan.id, 3);
          for (const s of res.suggestions || []) {
            all.push({ ...s, plan_id: plan.id, plan_title: plan.title });
          }
        } catch { /* skip */ }
      }
      // Sort: RPI research first, then by unblocks_count desc
      all.sort((a, b) => {
        if (a.task_mode === 'research' && b.task_mode !== 'research') return -1;
        if (b.task_mode === 'research' && a.task_mode !== 'research') return 1;
        return (b.unblocks_count || 0) - (a.unblocks_count || 0);
      });
      return all.slice(0, 5);
    },
    { enabled: activePlanIds.length > 0, staleTime: 30000 }
  );
  const nextUp = suggestionsData || [];

  const isLoading = plansLoading || goalsLoading || portfoliosLoading;

  // Build plan-to-goal lookup
  const planToGoal: Record<string, { id: string; title: string }> = {};
  if (allPortfolios) {
    for (const goal of activeGoals) {
      const planIds = allPortfolios[goal.id] || [];
      for (const pid of planIds) {
        planToGoal[pid] = { id: goal.id, title: goal.title };
      }
    }
  }

  // Categorize plans (priority: Stale > Finish Line > Needs Input > Not Started)
  const now = new Date();
  const allPlans = plans || [];

  const stale: Plan[] = [];
  const finishLine: Plan[] = [];
  const needsInput: Plan[] = [];
  const notStarted: Plan[] = [];

  for (const plan of allPlans) {
    const progress = plan.progress || 0;
    const daysSinceUpdate = differenceInDays(now, new Date(plan.updated_at));
    const isStale = daysSinceUpdate >= 7;

    if (isStale) {
      stale.push(plan);
    } else if (progress >= 60) {
      finishLine.push(plan);
    } else if (progress > 0) {
      needsInput.push(plan);
    } else {
      notStarted.push(plan);
    }
  }

  // Sort each bucket
  finishLine.sort((a, b) => (b.progress || 0) - (a.progress || 0));
  needsInput.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  stale.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());

  // Dashboard goals with health
  const dashboardGoals: any[] = dashboardData?.goals || [];

  // Goal plan counts from portfolio data
  const goalPlanCounts: Record<string, number> = {};
  if (allPortfolios) {
    for (const [gid, pids] of Object.entries(allPortfolios)) {
      goalPlanCounts[gid] = pids.length;
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">Loading strategic overview...</span>
      </div>
    );
  }

  const PlanRow = ({ plan, extra }: { plan: Plan; extra?: React.ReactNode }) => {
    const progress = plan.progress || 0;
    const goal = planToGoal[plan.id];
    return (
      <div className="flex items-center gap-3 py-2 px-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
        <Link to={`/app/plans/${plan.id}`} className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 truncate min-w-0 shrink">
          {plan.title}
        </Link>
        <ProgressBar value={progress} />
        {extra}
        {goal && (
          <Link to={`/app/goals/${goal.id}`} className="text-[11px] text-violet-500 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 whitespace-nowrap shrink-0">
            {goal.title}
          </Link>
        )}
      </div>
    );
  };

  const today = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-violet-500" />
              Strategic Overview
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{today}</p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {allPlans.length} plan{allPlans.length !== 1 ? 's' : ''} across {activeGoals.length} goal{activeGoals.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* 0. NEXT UP */}
        {nextUp.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Next Up</span>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-medium">{nextUp.length}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-500/20">
              {nextUp.map((task, i) => (
                <div key={task.id} className="flex items-center gap-3 py-2.5 px-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                  <span className="text-[11px] font-bold text-gray-300 dark:text-gray-600 w-4 text-center shrink-0">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <Link to={`/app/plans/${task.plan_id}`} className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 truncate block">
                      {task.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{task.plan_title}</span>
                      {task.task_mode !== 'free' && (
                        <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${
                          task.task_mode === 'research' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          task.task_mode === 'plan' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        }`}>{task.task_mode}</span>
                      )}
                      {task.unblocks_count > 0 && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">unblocks {task.unblocks_count}</span>
                      )}
                    </div>
                  </div>
                  <Link to={`/app/plans/${task.plan_id}`} className="text-gray-300 dark:text-gray-600 hover:text-blue-500 shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 1. FINISH LINE */}
        {finishLine.length > 0 && (
          <section>
            <SectionHeader label="Finish Line" count={finishLine.length} />
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {finishLine.map(plan => <PlanRow key={plan.id} plan={plan} />)}
            </div>
          </section>
        )}

        {/* 2. NEEDS YOUR INPUT */}
        {needsInput.length > 0 && (
          <section>
            <SectionHeader label="Needs Your Input" count={needsInput.length} />
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {needsInput.map(plan => (
                <PlanRow key={plan.id} plan={plan} extra={
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                    {formatDistanceToNow(new Date(plan.updated_at), { addSuffix: true })}
                  </span>
                } />
              ))}
            </div>
          </section>
        )}

        {/* 3. NOT STARTED */}
        {notStarted.length > 0 && (
          <section>
            <SectionHeader label="Not Started" count={notStarted.length} />
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {notStarted.map(plan => {
                const goal = planToGoal[plan.id];
                return (
                  <div key={plan.id} className="flex items-center gap-3 py-2 px-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                    <Link to={`/app/plans/${plan.id}`} className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 truncate min-w-0 flex-1">
                      {plan.title}
                    </Link>
                    {goal && (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                        blocks <Link to={`/app/goals/${goal.id}`} className="text-violet-500 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">{goal.title}</Link>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. STALE */}
        {stale.length > 0 && (
          <section>
            <SectionHeader label="Stale" count={stale.length} />
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-300 dark:border-amber-500/30">
              {stale.map(plan => {
                const days = differenceInDays(now, new Date(plan.updated_at));
                const goal = planToGoal[plan.id];
                return (
                  <div key={plan.id} className="flex items-center gap-3 py-2 px-3 border-b border-amber-100 dark:border-amber-500/10 last:border-b-0">
                    <Link to={`/app/plans/${plan.id}`} className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 truncate min-w-0 shrink">
                      {plan.title}
                    </Link>
                    <ProgressBar value={plan.progress || 0} />
                    <span className={`text-[11px] font-medium whitespace-nowrap shrink-0 ${days >= 14 ? 'text-red-500' : 'text-amber-500'}`}>
                      {days}d stale
                    </span>
                    {goal && (
                      <Link to={`/app/goals/${goal.id}`} className="text-[11px] text-violet-500 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 whitespace-nowrap shrink-0">
                        {goal.title}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. GOAL ALIGNMENT */}
        {(dashboardGoals.length > 0 || activeGoals.length > 0) && (
          <section>
            <SectionHeader label="Goal Alignment" count={dashboardGoals.length || activeGoals.length} />
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {(dashboardGoals.length > 0 ? dashboardGoals : activeGoals).map((goal: any) => (
                <div key={goal.id} className="flex items-center gap-3 py-2 px-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${healthDot(goal.health || 'stale')}`} />
                  <Link to={`/app/goals/${goal.id}`} className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 truncate min-w-0 shrink">
                    {goal.title}
                  </Link>
                  <ProgressBar value={goal.progress || goal.linked_plan_progress?.percent_completed || 0} />
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                    {goalPlanCounts[goal.id] || 0} plan{(goalPlanCounts[goal.id] || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {allPlans.length === 0 && activeGoals.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <Compass className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No goals or plans yet. Create a goal to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
