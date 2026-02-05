import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  Bell,
  Bot,
  Target,
  FolderKanban,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Clock,
  Sparkles,
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

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtext?: string;
  color?: string;
}> = ({ icon, label, value, subtext, color = 'blue' }) => {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        {subtext && <div className="text-xs text-gray-400 dark:text-gray-500">{subtext}</div>}
      </div>
    </div>
  );
};

// Needs Attention Section
const NeedsAttentionSection: React.FC<{
  decisions: PendingDecision[];
  agentRequests: PendingAgentRequest[];
}> = ({ decisions, agentRequests }) => {
  if (decisions.length === 0 && agentRequests.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
      <h2 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
        <Bell className="w-5 h-5" />
        Needs Your Attention
      </h2>
      <div className="space-y-2">
        {decisions.map((decision) => (
          <Link
            key={decision.id}
            to={`/app/plans/${decision.plan_id}?decision=${decision.id}`}
            className="block p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-amber-600 dark:text-amber-400 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {decision.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  in {decision.plan_title} · {decision.urgency} priority
                </p>
              </div>
            </div>
          </Link>
        ))}
        {agentRequests.map((request) => (
          <Link
            key={request.id}
            to={`/app/plans/${request.plan_id}?task=${request.id}`}
            className="block p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                <Bot className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Agent request: {request.task_title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {request.request_type} · in {request.plan_title}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Active Goals Section
const ActiveGoalsSection: React.FC<{ goals: ActiveGoal[] }> = ({ goals }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Active Goals
        </h3>
        <Link
          to="/app/goals"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
        >
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      {goals.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
          No active goals yet.{' '}
          <Link to="/app/goals" className="text-blue-600 dark:text-blue-400 hover:underline">
            Create one
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate pr-2">
                  {goal.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {goal.progress}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              {goal.target_date && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Due {formatDistanceToNow(new Date(goal.target_date), { addSuffix: true })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Recent Plans Section
const RecentPlansSection: React.FC<{ plans: RecentPlan[] }> = ({ plans }) => {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-400',
    active: 'bg-blue-500',
    completed: 'bg-green-500',
    archived: 'bg-amber-500',
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Recent Plans
        </h3>
        <Link
          to="/app/plans"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
        >
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      {plans.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FolderKanban className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-3">No plans yet</p>
          <Link
            to="/app/plans/ai-create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Create your first plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              to={`/app/plans/${plan.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all"
            >
              <div className="flex items-start gap-2 mb-2">
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${statusColors[plan.status]}`}
                  title={plan.status}
                />
                <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                  {plan.title}
                </h4>
              </div>
              {plan.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                  {plan.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(plan.updated_at), { addSuffix: true })}
                </span>
                {typeof plan.progress === 'number' && (
                  <span>{plan.progress}% complete</span>
                )}
              </div>
              {typeof plan.progress === 'number' && plan.progress > 0 && (
                <div className="mt-2 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// Quick Stats Section
const QuickStatsSection: React.FC<{
  activePlans: number;
  tasksCompleted: number;
  activeGoals: number;
  knowledgeEntries: number;
  isLoading: boolean;
}> = ({ activePlans, tasksCompleted, activeGoals, knowledgeEntries, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={<FolderKanban className="w-5 h-5" />}
        label="Active Plans"
        value={activePlans}
        color="blue"
      />
      <StatCard
        icon={<CheckCircle2 className="w-5 h-5" />}
        label="Tasks Completed"
        value={tasksCompleted}
        subtext="this week"
        color="green"
      />
      <StatCard
        icon={<Target className="w-5 h-5" />}
        label="Goals"
        value={activeGoals}
        color="amber"
      />
      <StatCard
        icon={<BookOpen className="w-5 h-5" />}
        label="Knowledge Entries"
        value={knowledgeEntries}
        color="purple"
      />
    </div>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const { userName } = useAuth();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: pending } = usePendingItems(5);
  const { data: recentPlansData } = useRecentPlans(6);
  const { data: goalsData } = useActiveGoals(5);

  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your plans and goals
          </p>
        </div>

        {/* Needs Attention */}
        {pending && (
          <NeedsAttentionSection
            decisions={pending.decisions}
            agentRequests={pending.agent_requests}
          />
        )}

        {/* Quick Stats */}
        <QuickStatsSection
          activePlans={summary?.active_plans_count || 0}
          tasksCompleted={summary?.tasks_completed_this_week || 0}
          activeGoals={summary?.active_goals_count || 0}
          knowledgeEntries={summary?.knowledge_entries_count || 0}
          isLoading={summaryLoading}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Goals - Takes 1 column */}
          <div className="lg:col-span-1">
            <ActiveGoalsSection goals={goalsData?.goals || []} />
          </div>

          {/* Recent Activity placeholder - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                Activity feed coming soon...
              </p>
            </div>
          </div>
        </div>

        {/* Recent Plans */}
        <RecentPlansSection plans={recentPlansData?.plans || []} />
      </div>
    </div>
  );
};

export default Dashboard;
