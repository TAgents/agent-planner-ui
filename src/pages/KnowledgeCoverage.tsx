import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  Target, ChevronDown, ChevronRight, CheckCircle, AlertTriangle,
  XCircle, Circle, BookOpen, Loader2, BarChart3
} from 'lucide-react';
import { goalBdiService } from '../services/api';
import { useGoalsV2 } from '../hooks/useGoalsV2';

const KnowledgeCoverage: React.FC = () => {
  const { data: goalsData } = useGoalsV2();
  const goals = Array.isArray(goalsData) ? goalsData : (goalsData as any)?.goals || [];
  const activeGoals = goals.filter((g: any) => g.status === 'active');

  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  // Auto-select first goal
  React.useEffect(() => {
    if (activeGoals.length > 0 && !selectedGoalId) {
      setSelectedGoalId(activeGoals[0].id);
    }
  }, [activeGoals, selectedGoalId]);

  const { data: coverage, isLoading } = useQuery(
    ['goal-coverage', selectedGoalId],
    () => goalBdiService.getCoverage(selectedGoalId),
    { enabled: !!selectedGoalId, staleTime: 30000 }
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-500" />
            Knowledge Coverage
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Do we have the knowledge we need to execute?
          </p>
        </div>
      </div>

      {/* Goal selector */}
      <div className="mb-6">
        <select
          value={selectedGoalId}
          onChange={(e) => setSelectedGoalId(e.target.value)}
          className="w-full max-w-md px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          <option value="">Select a goal...</option>
          {activeGoals.map((g: any) => (
            <option key={g.id} value={g.id}>
              {g.goalType === 'intention' ? '🎯' : '💭'} {g.title}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-8">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking knowledge coverage...
        </div>
      )}

      {/* Coverage tree */}
      {coverage && (
        <div className="space-y-4">
          {/* Overall summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {coverage.goal.title}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  coverage.goal.goal_type === 'intention'
                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {coverage.goal.goal_type}
                </span>
              </div>
              <CoveragePercentage pct={coverage.overall_coverage.percentage} />
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${coverageColor(coverage.overall_coverage.percentage)}`}
                style={{ width: `${coverage.overall_coverage.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {coverage.overall_coverage.covered} of {coverage.overall_coverage.total} tasks have supporting knowledge
            </p>
          </div>

          {/* Per-plan breakdown */}
          {coverage.plans.map((plan: any) => (
            <PlanCoverageCard key={plan.id} plan={plan} />
          ))}

          {/* No plans */}
          {coverage.plans.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
              No plans linked to this goal yet.
            </div>
          )}
        </div>
      )}

      {/* No goal selected */}
      {!selectedGoalId && !isLoading && (
        <div className="text-center py-12">
          <Target className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select a goal to see knowledge coverage across its plans
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Plan Card ────────────────────────────────────────────────

const PlanCoverageCard: React.FC<{ plan: any }> = ({ plan }) => {
  const [expanded, setExpanded] = useState(true);

  const gaps = plan.tasks.filter((t: any) => !t.has_knowledge);
  const contradictions = plan.tasks.filter((t: any) => t.coherence_status === 'contradiction_detected');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Plan header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              to={`/app/plans/${plan.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
            >
              {plan.title}
            </Link>
            {gaps.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium flex-shrink-0">
                {gaps.length} gap{gaps.length !== 1 ? 's' : ''}
              </span>
            )}
            {contradictions.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 font-medium flex-shrink-0">
                {contradictions.length} conflict{contradictions.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <CoveragePercentage pct={plan.coverage.percentage} />
      </button>

      {/* Task list */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          {plan.tasks.map((task: any) => (
            <TaskCoverageRow key={task.id} task={task} planId={plan.id} />
          ))}
          {plan.tasks.length === 0 && (
            <div className="px-5 py-3 text-xs text-gray-400">No tasks in this plan</div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Task Row ─────────────────────────────────────────────────

const TaskCoverageRow: React.FC<{ task: any; planId: string }> = ({ task, planId }) => {
  const [showFacts, setShowFacts] = useState(false);

  return (
    <div className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <div
        className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50/50 dark:hover:bg-gray-750/50 cursor-pointer"
        onClick={() => task.top_facts?.length > 0 && setShowFacts(!showFacts)}
      >
        {/* Status icon */}
        <TaskKnowledgeIcon task={task} />

        {/* Task title */}
        <Link
          to={`/app/plans/${planId}?node=${task.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 truncate"
        >
          {task.title}
        </Link>

        {/* Fact count */}
        <span className={`text-xs flex-shrink-0 ${
          task.has_knowledge
            ? 'text-gray-400 dark:text-gray-500'
            : 'text-amber-500 dark:text-amber-400 font-medium'
        }`}>
          {task.has_knowledge ? `${task.fact_count} fact${task.fact_count !== 1 ? 's' : ''}` : 'no facts'}
        </span>
      </div>

      {/* Expanded facts */}
      {showFacts && task.top_facts?.length > 0 && (
        <div className="px-12 pb-2.5 space-y-1">
          {task.top_facts.map((fact: string, i: number) => (
            <p key={i} className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              {fact.length > 120 ? fact.slice(0, 120) + '...' : fact}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────

const TaskKnowledgeIcon: React.FC<{ task: any }> = ({ task }) => {
  if (task.coherence_status === 'contradiction_detected') {
    return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
  }
  if (task.coherence_status === 'stale_beliefs') {
    return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
  }
  if (task.has_knowledge) {
    return <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
  }
  return <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />;
};

const CoveragePercentage: React.FC<{ pct: number }> = ({ pct }) => (
  <span className={`text-sm font-bold flex-shrink-0 ${
    pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
    pct >= 50 ? 'text-amber-600 dark:text-amber-400' :
    'text-red-600 dark:text-red-400'
  }`}>
    {pct}%
  </span>
);

function coverageColor(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export default KnowledgeCoverage;
