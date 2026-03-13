import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  Bell,
  Bot,
  Target,
  FolderKanban,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  useDashboardSummary,
  usePendingItems,
  useRecentPlans,
  useActiveGoals,
  PendingDecision,
  PendingAgentRequest,
  RecentPlan,
  ActiveGoal,
} from '../hooks/useDashboard';
import { usePlans } from '../hooks/usePlans';
import { useRecentActivity, RecentActivityItem } from '../hooks/useRecentActivity';

// Status accent colors matching plans list
const statusAccentColors: Record<string, string> = {
  active: 'border-l-amber-400',
  completed: 'border-l-emerald-400',
  draft: 'border-l-gray-300 dark:border-l-gray-600',
  archived: 'border-l-gray-300 dark:border-l-gray-500',
};

const statusDotColors: Record<string, string> = {
  draft: 'bg-gray-400 dark:bg-gray-500',
  active: 'bg-amber-500',
  completed: 'bg-emerald-500',
  archived: 'bg-gray-300 dark:bg-gray-600',
};

// Helper to safely format date
const safeFormatDate = (dateStr?: string | null): string | null => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (e) {
    return null;
  }
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const { userName } = useAuth();
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useDashboardSummary();
  const { data: pending, error: pendingError } = usePendingItems(5);
  const { data: recentPlansData, error: plansError } = useRecentPlans(6);
  const { data: goalsData } = useActiveGoals(5);
  const { plans: sidebarPlans } = usePlans(1, 20);
  const { data: recentActivityData, isLoading: activityLoading } = useRecentActivity(8);

  // Build a progress map from the plans list for consistency
  const progressMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (sidebarPlans) {
      sidebarPlans.forEach((p: any) => {
        if (typeof p.progress === 'number') {
          map[p.id] = p.progress;
        }
      });
    }
    return map;
  }, [sidebarPlans]);

  const hasError = summaryError || pendingError || plansError;
  const plans = recentPlansData?.plans || [];
  const goals = goalsData?.goals || [];
  const hasPendingItems = pending && (pending.decisions.length > 0 || pending.agent_requests.length > 0);

  // Inline stats
  const activePlans = summary?.active_plans_count || 0;
  const tasksCompleted = summary?.tasks_completed_this_week || 0;

  if (summaryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <>
        {/* Error */}
        {hasError && (
          <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-xs text-red-600 dark:text-red-400">Some data couldn't be loaded.</p>
          </div>
        )}

        {/* Needs Attention — only shows when items exist */}
        {hasPendingItems && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/40 rounded-lg p-3">
            <h2 className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Bell className="w-3 h-3" />
              Needs attention
            </h2>
            <div className="space-y-1.5">
              {pending!.decisions.map((d) => (
                <Link key={d.id} to={`/app/plans/${d.plan_id}?decision=${d.id}`}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-gray-900/80 rounded-md border border-amber-200/60 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{d.title}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-auto">{d.plan_title}</span>
                </Link>
              ))}
              {pending!.agent_requests.map((r) => (
                <Link key={r.id} to={`/app/plans/${r.plan_id}?task=${r.id}`}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-gray-900/80 rounded-md border border-blue-200/60 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <Bot className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{r.task_title}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-auto">{r.request_type}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick stats inline */}
        <div className="flex items-center gap-4 mb-4 px-1">
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            <span className="font-medium text-gray-600 dark:text-gray-300">{activePlans}</span> active plan{activePlans !== 1 ? 's' : ''}
          </span>
          {tasksCompleted > 0 && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{tasksCompleted}</span> completed this week
            </span>
          )}
          {goals.length > 0 && (
            <Link to="/app/goals-v2" className="text-[11px] text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors">
              <span className="font-medium text-gray-600 dark:text-gray-300">{goals.length}</span> active goal{goals.length !== 1 ? 's' : ''}
            </Link>
          )}
        </div>

        {/* Plans */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Recent Plans</h2>
            <Link to="/app/plans" className="text-[11px] text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-0.5">
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">No plans yet</p>
              <Link to="/app/plans/create" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Create a plan
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {plans.map((plan) => {
                const progress = progressMap[plan.id] ?? plan.progress;
                return (
                  <Link
                    key={plan.id}
                    to={`/app/plans/${plan.id}`}
                    className={`block bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all duration-150 border-l-[3px] ${statusAccentColors[plan.status] || 'border-l-gray-300'}`}
                  >
                    <div className="px-4 py-3 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{plan.title}</h3>
                        {plan.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{plan.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                          {safeFormatDate(plan.updated_at) || 'Recently'}
                        </span>
                        {typeof progress === 'number' && progress > 0 && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[10px] tabular-nums text-gray-400 dark:text-gray-500">{progress}%</span>
                          </div>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity — compact, only if there are items */}
        {recentActivityData && recentActivityData.length > 0 && (
          <div>
            <h2 className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">Activity</h2>
            <div className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80 divide-y divide-gray-100 dark:divide-gray-800/60">
              {recentActivityData.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center gap-2.5 px-3 py-2">
                  <div className="flex-shrink-0">
                    {item.description?.match(/status\s+to\s+completed/i) ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : item.description?.match(/status\s+to\s+blocked/i) ? (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    ) : item.type === 'decision' ? (
                      <Sparkles className="w-3 h-3 text-purple-500" />
                    ) : (
                      <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">{item.description}</p>
                  {item.plan_title && item.plan_id && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 truncate max-w-[120px]">{item.plan_title}</span>
                  )}
                  <span className="text-[10px] text-gray-300 dark:text-gray-600 flex-shrink-0">
                    {safeFormatDate(item.created_at) || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals — only show if there are active goals */}
        {goals.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Goals</h2>
              <Link to="/app/goals-v2" className="text-[11px] text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-0.5">
                All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-1.5">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80 px-4 py-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{goal.title}</span>
                    <span className="text-[10px] tabular-nums text-gray-400 dark:text-gray-500 ml-2">{goal.progress}%</span>
                  </div>
                  <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </>
      </div>
    </div>
  );
};

export default Dashboard;
