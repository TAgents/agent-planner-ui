import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Target, CheckCircle, AlertTriangle, BookOpen, Loader2,
  ArrowRight, Circle
} from 'lucide-react';
import { usePlans } from '../hooks/usePlans';
import { useGoalsV2 } from '../hooks/useGoalsV2';
import { goalBdiService } from '../services/goals.service';
import { Plan } from '../types';

// ─── Goal Section ─────────────────────────────────────────────

const GoalSection: React.FC<{ goal: any; allPlans: Plan[] }> = ({ goal, allPlans }) => {
  const { data: portfolio } = useQuery(
    ['goal-portfolio', goal.id],
    () => goalBdiService.getPortfolio(goal.id),
    { staleTime: 30000 }
  );

  const linkedPlanIds = new Set(
    (portfolio?.linked_plans || []).map((lp: any) => lp.plan_id)
  );
  const linkedPlans = allPlans.filter(p => linkedPlanIds.has(p.id));

  // Aggregate stats
  const totalProgress = linkedPlans.length > 0
    ? Math.round(linkedPlans.reduce((s, p) => s + (p.progress || 0), 0) / linkedPlans.length)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Goal header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-violet-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/app/goals/${goal.id}`}
                className="text-base font-semibold text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors truncate"
              >
                {goal.title}
              </Link>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                goal.goalType === 'intention'
                  ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {goal.goalType || 'desire'}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{linkedPlans.length} plan{linkedPlans.length !== 1 ? 's' : ''}</span>
              <span>{totalProgress}% progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plans grid */}
      {linkedPlans.length > 0 ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {linkedPlans.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <div className="px-5 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
          No plans linked to this goal
        </div>
      )}
    </div>
  );
};

// ─── Plan Card ────────────────────────────────────────────────

const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => {
  const progress = plan.progress || 0;
  const quality = plan.quality_score != null ? Math.round(plan.quality_score * 100) : null;

  const statusColors: Record<string, string> = {
    active: 'bg-amber-500',
    completed: 'bg-emerald-500',
    draft: 'bg-gray-400',
    archived: 'bg-gray-400',
  };

  return (
    <Link
      to={`/app/plans/${plan.id}`}
      className="block rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-900 p-4 transition-all hover:shadow-md group"
    >
      {/* Status + Title */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[plan.status] || 'bg-gray-400'}`} />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
          {plan.title}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 w-8 text-right">
          {progress}%
        </span>
      </div>

      {/* Health indicators */}
      <div className="flex items-center gap-3 text-[11px]">
        {/* Quality */}
        {quality != null && (
          <div className="flex items-center gap-1" title="Plan quality score">
            <CheckCircle className={`w-3 h-3 ${quality >= 70 ? 'text-emerald-500' : quality >= 40 ? 'text-amber-500' : 'text-red-500'}`} />
            <span className={`font-medium ${quality >= 70 ? 'text-emerald-600 dark:text-emerald-400' : quality >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
              Q:{quality}%
            </span>
          </div>
        )}

        {/* Coherence checked */}
        {plan.coherence_checked_at ? (
          <div className="flex items-center gap-1 text-gray-400" title={`Last checked: ${new Date(plan.coherence_checked_at).toLocaleDateString()}`}>
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>checked</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-400" title="Not yet checked for coherence">
            <Circle className="w-3 h-3" />
            <span>unchecked</span>
          </div>
        )}
      </div>
    </Link>
  );
};

// ─── Unlinked Plans Section ───────────────────────────────────

const UnlinkedPlansSection: React.FC<{ plans: Plan[] }> = ({ plans }) => {
  if (plans.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-200 dark:border-amber-500/30 overflow-hidden">
      <div className="px-5 py-4 border-b border-amber-100 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Plans without goals ({plans.length})
          </span>
        </div>
        <p className="text-xs text-amber-600/70 dark:text-amber-400/50 mt-1">
          These plans aren't linked to any goal — consider linking them or archiving if no longer needed
        </p>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────

export default function PortfolioGraph() {
  const { plans, isLoading: plansLoading } = usePlans(1, 100, 'active,draft');
  const { data: goalsData, isLoading: goalsLoading } = useGoalsV2();

  const goals = Array.isArray(goalsData) ? goalsData : (goalsData as any)?.goals || [];
  const activeGoals = goals.filter((g: any) => g.status === 'active');

  // Fetch all goal portfolios to find linked plan IDs
  const goalIds = activeGoals.map((g: any) => g.id);
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

  const linkedPlanIds = new Set<string>(
    Object.values(allPortfolios || {}).flat()
  );
  const isLoading = plansLoading || goalsLoading || portfoliosLoading;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">Loading portfolio...</span>
      </div>
    );
  }

  if (activeGoals.length === 0 && (!plans || plans.length === 0)) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <Target className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-lg font-medium">No goals or plans yet</p>
        <p className="text-sm mt-1">Create a goal and link plans to see your portfolio</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-500" />
            Portfolio
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activeGoals.length} goal{activeGoals.length !== 1 ? 's' : ''} · {(plans || []).length} plan{(plans || []).length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Goal sections */}
        {activeGoals.map((goal: any) => (
          <GoalSection key={goal.id} goal={goal} allPlans={plans || []} />
        ))}

        {/* Plans without goals */}
        <UnlinkedPlansSection plans={(plans || []).filter((p: Plan) => !linkedPlanIds.has(p.id))} />
      </div>
    </div>
  );
}
