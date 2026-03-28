import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Target,
  ArrowLeft,
  ArrowRight,
  FolderKanban,
  BookOpen,
  Activity,
  Trash2,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  GitBranch,
  Brain,
  Circle,
  CheckCircle2,
  Clock,
  Ban,
  BarChart3,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import {
  useGoalV2,
  useGoalEvaluations,
  useUpdateGoal,
  useDeleteGoal,
  useAddEvaluation,
  useGoalPath,
  useGoalKnowledgeGaps,
  GoalV2,
  GoalEvaluation,
  GoalPathNode,
} from '../hooks/useGoalsV2';
import { goalDashboardService } from '../services/goals.service';
import { planService } from '../services/plans.service';
import GoalQualityPanel from '../components/goals/GoalQualityPanel';

// ─── Config ──────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string; bg: string; text: string }> = {
  outcome:    { label: 'Outcome',    color: '#3b82f6', icon: '🎯', bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-700 dark:text-blue-300' },
  constraint: { label: 'Constraint', color: '#ef4444', icon: '🚧', bg: 'bg-red-50 dark:bg-red-900/20',     text: 'text-red-700 dark:text-red-300' },
  metric:     { label: 'Metric',     color: '#10b981', icon: '📊', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300' },
  principle:  { label: 'Principle',  color: '#8b5cf6', icon: '💡', bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300' },
};

const STATUS_OPTIONS: { value: string; label: string; dot: string }[] = [
  { value: 'active',    label: 'Active',    dot: 'bg-emerald-500' },
  { value: 'achieved',  label: 'Achieved',  dot: 'bg-blue-500' },
  { value: 'paused',    label: 'Paused',    dot: 'bg-amber-500' },
  { value: 'abandoned', label: 'Abandoned', dot: 'bg-gray-400' },
];

// Tab types
type TabType = 'overview' | 'path' | 'evaluations';

// ─── Status Icon ─────────────────────────────────────────────────
const StatusIcon: React.FC<{ status: string; className?: string }> = ({ status, className = 'w-4 h-4' }) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className={`${className} text-green-500`} />;
    case 'in_progress': return <Clock className={`${className} text-blue-500`} />;
    case 'blocked': return <Ban className={`${className} text-red-500`} />;
    default: return <Circle className={`${className} text-gray-400`} />;
  }
};

// ─── Status Dropdown ─────────────────────────────────────────────
function StatusDropdown({ currentStatus, onStatusChange }: { currentStatus: string; onStatusChange: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = STATUS_OPTIONS.find(o => o.value === currentStatus) || STATUS_OPTIONS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <span className={`w-2 h-2 rounded-full ${current.dot}`} />
        {current.label}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onStatusChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                opt.value === currentStatus
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
              {opt.label}
              {opt.value === currentStatus && <Check className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────
const OverviewTab: React.FC<{ goal: GoalV2; goalId: string }> = ({ goal, goalId }) => {
  const { data: gapsData } = useGoalKnowledgeGaps(goalId);

  // Resolve plan names for linked resources
  const planLinks = (goal.links || []).filter(l => l.linkedType === 'plan');
  const planIds = planLinks.map(l => l.linkedId);
  const { data: planNames } = useQuery(
    ['plan-names', ...planIds],
    async () => {
      const names: Record<string, string> = {};
      for (const id of planIds) {
        try {
          const plan = await planService.getPlan(id);
          names[id] = plan?.title || id.slice(0, 8) + '...';
        } catch {
          names[id] = id.slice(0, 8) + '...';
        }
      }
      return names;
    },
    { enabled: planIds.length > 0, staleTime: 60000 }
  );

  // Get progress from dashboard endpoint (same calculation as Mission Control)
  const { data: dashboardData } = useQuery(
    ['goal-dashboard-for-detail'],
    () => goalDashboardService.getDashboard(),
    { staleTime: 30000 }
  );
  const dashboardGoal = (dashboardData?.goals || []).find((g: any) => g.id === goalId);
  const lp = dashboardGoal?.linked_plan_progress;
  const progress = lp?.percent_completed ?? 0;
  const remaining = (lp?.total_nodes || 0) - (lp?.completed_nodes || 0) - (lp?.blocked_nodes || 0);
  const stats = lp ? {
    total: lp.total_nodes,
    completed: lp.completed_nodes,
    in_progress: Math.max(0, remaining),
    blocked: lp.blocked_nodes,
    not_started: 0,
  } : null;

  const coverage = gapsData?.coverage;
  const gaps = gapsData?.gaps || [];

  return (
    <div className="space-y-4">
      {/* Description */}
      {goal.description && (
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{goal.description}</p>
        </section>
      )}

      {/* Progress across all linked plans */}
      {stats && stats.total > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Progress
            </h3>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {stats && (
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Completed', value: stats.completed, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'In Progress', value: stats.in_progress, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Blocked', value: stats.blocked, color: 'text-red-600 dark:text-red-400' },
                { label: 'Not Started', value: stats.not_started, color: 'text-gray-500 dark:text-gray-400' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Goal Quality Assessment */}
      <GoalQualityPanel goalId={goalId} />

      {/* Knowledge coverage */}
      {coverage && coverage.total > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Knowledge Coverage
            </h3>
            <span className={`text-sm font-medium ${coverage.percentage >= 80 ? 'text-emerald-600' : coverage.percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {coverage.percentage}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${coverage.percentage >= 80 ? 'bg-emerald-500' : coverage.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${coverage.percentage}%` }}
            />
          </div>
          {gaps.length > 0 && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {gaps.length} task{gaps.length !== 1 ? 's' : ''} missing knowledge
            </p>
          )}
        </section>
      )}

      {/* Success Criteria (if any) */}
      {goal.successCriteria && (
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Success Criteria</h3>
          {Array.isArray(goal.successCriteria) ? (
            <div className="space-y-2">
              {goal.successCriteria.map((criterion: any, i: number) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-emerald-500 mt-0.5">&#x2713;</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {criterion.metric || criterion.name || criterion.title || String(criterion)}
                    </span>
                    {criterion.target && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        — {criterion.target}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : typeof goal.successCriteria === 'object' ? (
            <div className="space-y-2">
              {Object.entries(goal.successCriteria).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-emerald-500">&#x2713;</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{key}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">— {String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300">{String(goal.successCriteria)}</p>
          )}
        </section>
      )}

      {/* Linked Plans */}
      {goal.links && goal.links.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Linked Plans ({planLinks.length})
          </h3>
          <div className="space-y-1.5">
            {goal.links.map((link) => (
              <div key={link.id} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded font-medium">{link.linkedType}</span>
                {link.linkedType === 'plan' ? (
                  <Link to={`/app/plans/${link.linkedId}`} className="text-blue-600 dark:text-blue-400 hover:underline truncate flex-1">
                    {planNames?.[link.linkedId] || link.linkedId.slice(0, 8) + '...'}
                  </Link>
                ) : (
                  <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{link.linkedId.slice(0, 8)}...</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state when no data at all */}
      {!stats && !goal.description && (!goal.links || goal.links.length === 0) && (
        <div className="text-center py-12">
          <Target className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">This goal doesn't have any linked plans or tasks yet.</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Use the MCP tools or plan page to link tasks to this goal with "achieves" edges.
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Dependency Path Tab ─────────────────────────────────────────
const DependencyPathTab: React.FC<{ goalId: string }> = ({ goalId }) => {
  const { data: pathData, isLoading: pathLoading } = useGoalPath(goalId);
  const { data: gapsData } = useGoalKnowledgeGaps(goalId);

  if (pathLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const nodes = pathData?.nodes || [];
  const gaps = gapsData?.gaps || [];

  if (nodes.length === 0) {
    return (
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <GitBranch className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">No dependency path yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Link tasks to this goal using "achieves" edges to build a dependency path.
          </p>
        </div>
      </section>
    );
  }

  // Group by depth
  const byDepth = new Map<number, GoalPathNode[]>();
  for (const node of nodes) {
    const list = byDepth.get(node.depth) || [];
    list.push(node);
    byDepth.set(node.depth, list);
  }
  const depths = Array.from(byDepth.keys()).sort((a, b) => a - b);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
        Task Path ({nodes.length} tasks)
      </h3>
      <div className="space-y-4">
        {depths.map((depth) => {
          const depthNodes = byDepth.get(depth)!;
          const label = depth === 1 ? 'Direct achievers' : `Depth ${depth} (upstream)`;
          return (
            <div key={depth}>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 ml-1 font-medium">
                {label}
              </p>
              <div className="space-y-1">
                {depthNodes.map((node) => {
                  const hasGap = gaps.some(g => g.node_id === node.node_id);
                  return (
                    <div
                      key={node.node_id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm transition-colors"
                    >
                      <StatusIcon status={node.status} />
                      <Link
                        to={`/app/plans/${node.plan_id}`}
                        className="flex-1 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                      >
                        {node.title}
                      </Link>
                      <span className="text-[10px] text-gray-400 capitalize">{node.status.replace('_', ' ')}</span>
                      {hasGap && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                          no knowledge
                        </span>
                      )}
                      {node.dependency_type === 'achieves' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                          achieves
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ─── Evaluations Tab ─────────────────────────────────────────────
function EvaluationForm({ goalId, onClose }: { goalId: string; onClose: () => void }) {
  const addEval = useAddEvaluation();
  const [score, setScore] = useState(50);
  const [reasoning, setReasoning] = useState('');
  const [evaluatedBy, setEvaluatedBy] = useState('human');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEval.mutateAsync({ goalId, evaluatedBy, score, reasoning });
    onClose();
  };

  const scoreColor = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-red-600';

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">New Evaluation</h4>
      <div className="space-y-4">
        <div>
          <label className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Score</span>
            <span className={`text-lg font-bold ${scoreColor}`}>{score}</span>
          </label>
          <input type="range" min={0} max={100} value={score} onChange={e => setScore(Number(e.target.value))} className="w-full accent-blue-600" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Evaluated by</label>
          <input
            placeholder="e.g. human, agent-name"
            value={evaluatedBy}
            onChange={e => setEvaluatedBy(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Reasoning</label>
          <textarea
            placeholder="Why this score?"
            value={reasoning}
            onChange={e => setReasoning(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
          <button type="submit" disabled={addEval.isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors">
            {addEval.isLoading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </div>
    </form>
  );
}

const EvaluationsTab: React.FC<{ goalId: string }> = ({ goalId }) => {
  const { data: evaluations } = useGoalEvaluations(goalId);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-3">
      {!showForm && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            + Add Evaluation
          </button>
        </div>
      )}

      {showForm && <EvaluationForm goalId={goalId} onClose={() => setShowForm(false)} />}

      {evaluations && evaluations.length > 0 ? (
        evaluations.map((ev: GoalEvaluation) => {
          const scoreColor = ev.score != null && ev.score >= 70 ? 'border-l-emerald-500' : ev.score != null && ev.score >= 40 ? 'border-l-amber-500' : 'border-l-gray-400';
          return (
            <div key={ev.id} className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-l-[3px] ${scoreColor} p-4`}>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{ev.evaluatedBy}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(ev.evaluatedAt).toLocaleDateString()}</span>
              </div>
              {ev.score != null && (
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{ev.score}<span className="text-sm text-gray-400 font-normal">/100</span></div>
              )}
              {ev.reasoning && <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ev.reasoning}</p>}
            </div>
          );
        })
      ) : (
        !showForm && (
          <div className="text-center py-12">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No evaluations yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Evaluations track how well you're progressing toward this goal.</p>
          </div>
        )
      )}
    </div>
  );
};

// ─── Delete Modal ────────────────────────────────────────────────
const DeleteModal: React.FC<{
  goalTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ goalTitle, isDeleting, onConfirm, onCancel }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel, isDeleting]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={!isDeleting ? onCancel : undefined} />
      <div ref={modalRef} tabIndex={-1} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Goal</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          Are you sure you want to delete "{goalTitle}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={isDeleting} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium text-sm transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Health Color Helper ─────────────────────────────────────────
function getHealthColor(health: string): string {
  switch (health) {
    case 'healthy': return 'bg-emerald-500';
    case 'at_risk': return 'bg-amber-500';
    case 'critical': return 'bg-red-500';
    case 'stale': return 'bg-gray-400';
    default: return 'bg-gray-400';
  }
}

function getCriticalPathStatusStyles(status: string): string {
  switch (status) {
    case 'completed': return 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'in_progress': return 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'blocked': return 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300';
    default: return 'border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-300';
  }
}

// ─── Health Indicators Section ──────────────────────────────────
const HealthIndicators: React.FC<{ goalId: string }> = ({ goalId }) => {
  const { data: briefing } = useQuery(
    ['goals-v2', 'briefing', goalId],
    () => goalDashboardService.getBriefing(goalId),
    { enabled: !!goalId, refetchInterval: 60000 }
  );

  if (!briefing) return null;

  const healthColor = getHealthColor(briefing.health);

  return (
    <>
      {/* Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Health Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Health</div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${healthColor}`} />
            <span className="text-lg font-semibold capitalize">{briefing.health?.replace('_', ' ') || 'Unknown'}</span>
          </div>
          {briefing.health === 'stale' && briefing.last_activity && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Last activity: {new Date(briefing.last_activity).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Bottlenecks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Bottlenecks</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{briefing.bottlenecks?.length || 0}</div>
          {briefing.bottlenecks?.[0] && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{briefing.bottlenecks[0].title}</div>
          )}
        </div>

        {/* Knowledge */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Knowledge</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{briefing.knowledge?.facts_count || 0} facts</div>
          {briefing.knowledge?.contradictions?.length > 0 && (
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              {briefing.knowledge.contradictions.length} contradictions
            </div>
          )}
        </div>

        {/* Pending Decisions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Pending</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{briefing.pending_decisions?.length || 0}</div>
          {briefing.pending_decisions?.[0] && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{briefing.pending_decisions[0].title || briefing.pending_decisions[0]}</div>
          )}
        </div>
      </div>

      {/* Critical Path */}
      {briefing.critical_path?.length > 0 && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Critical Path</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {briefing.critical_path.map((node: any, i: number) => (
              <React.Fragment key={node.node_id}>
                <div className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap border ${getCriticalPathStatusStyles(node.status)}`}>
                  {node.title}
                </div>
                {i < briefing.critical_path.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Staleness Warning */}
      {briefing.health === 'stale' && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">This goal appears stale</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              No recent activity detected. Consider reviewing progress or updating the goal status.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Main Component ──────────────────────────────────────────────
const GoalDetail: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: goal, isLoading } = useGoalV2(goalId ?? '');
  const updateGoal = useUpdateGoal();
  const deleteGoalMut = useDeleteGoal();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['overview', 'path', 'evaluations'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  }, [setSearchParams]);

  const handleStatusChange = useCallback((status: string) => {
    if (!goalId) return;
    updateGoal.mutate({ id: goalId, status: status as any });
  }, [goalId, updateGoal]);

  const handleDelete = useCallback(async () => {
    if (!goalId) return;
    setIsDeleting(true);
    try {
      await deleteGoalMut.mutateAsync(goalId);
      navigate('/app/goals');
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [goalId, deleteGoalMut, navigate]);

  if (!goalId) return <Navigate to="/app/goals" replace />;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-3xl mx-auto text-center py-20">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Goal not found</h2>
          <Link to="/app/goals" className="text-blue-600 hover:text-blue-700 font-medium text-sm">Back to Goals</Link>
        </div>
      </div>
    );
  }

  const typeConf = TYPE_CONFIG[goal.type] || TYPE_CONFIG.outcome;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Target className="w-4 h-4" /> },
    { id: 'path', label: 'Tasks & Dependencies', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'evaluations', label: 'Evaluations', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link to="/app/goals" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Goals
        </Link>

        {/* Header */}
        <header className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="text-2xl mt-0.5">{typeConf.icon}</span>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{goal.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeConf.bg} ${typeConf.text}`}>
                    {typeConf.label}
                  </span>
                  <StatusDropdown currentStatus={goal.status} onStatusChange={handleStatusChange} />
                  {goal.priority > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">Priority {goal.priority}</span>
                  )}
                  {goal.ownerName && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">Created by {goal.ownerName}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
              title="Delete goal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Health Indicators */}
        <HealthIndicators goalId={goalId!} />

        {/* Tabs */}
        <nav className="border-b border-gray-200 dark:border-gray-700 mb-5" aria-label="Goal sections">
          <div className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab goal={goal} goalId={goalId!} />}
          {activeTab === 'path' && <DependencyPathTab goalId={goalId!} />}
          {activeTab === 'evaluations' && <EvaluationsTab goalId={goalId!} />}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <DeleteModal
            goalTitle={goal.title}
            isDeleting={isDeleting}
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default GoalDetail;
