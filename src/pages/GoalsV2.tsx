import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Target,
  Plus,
  Search,
  ChevronRight,
  FolderKanban,
} from 'lucide-react';
import {
  useGoalsTree,
  useCreateGoal,
  GoalV2,
} from '../hooks/useGoalsV2';

// ─── Goal Type Config ────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; icon: string; bg: string; text: string }> = {
  outcome:    { label: 'Outcome',    icon: '🎯', bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-700 dark:text-blue-300' },
  constraint: { label: 'Constraint', icon: '🚧', bg: 'bg-red-50 dark:bg-red-900/20',     text: 'text-red-700 dark:text-red-300' },
  metric:     { label: 'Metric',     icon: '📊', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300' },
  principle:  { label: 'Principle',  icon: '💡', bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300' },
};

// Status accent colors for left border — matches Plans page pattern
const statusAccentColors: Record<string, string> = {
  active:    'border-l-emerald-400',
  achieved:  'border-l-blue-400',
  paused:    'border-l-amber-400',
  abandoned: 'border-l-gray-300 dark:border-l-gray-600',
};

const STATUS_FILTERS = ['all', 'active', 'achieved', 'paused', 'abandoned'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

// ─── Flatten tree for list display ───────────────────────────────
function flattenGoals(goals: GoalV2[], depth = 0): (GoalV2 & { depth: number })[] {
  const result: (GoalV2 & { depth: number })[] = [];
  for (const goal of goals) {
    result.push({ ...goal, depth });
    if (goal.children && goal.children.length > 0) {
      result.push(...flattenGoals(goal.children, depth + 1));
    }
  }
  return result;
}

// ─── Create Goal Dialog ──────────────────────────────────────────
function CreateGoalDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const createGoal = useCreateGoal();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>('outcome');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createGoal.mutateAsync({ title, type: type as any, description, priority: 0 });
    onClose();
    if (result?.id) {
      navigate(`/app/goals/${result.id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 w-[420px] shadow-xl">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Create Goal</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
            <input
              placeholder="What do you want to achieve?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setType(k)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
                    type === k
                      ? `${v.bg} ${v.text} border-current font-medium`
                      : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{v.icon}</span>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Description (optional)</label>
            <textarea
              placeholder="Brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
            />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={createGoal.isLoading || !title.trim()} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 transition-colors">
              {createGoal.isLoading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Goal Row ────────────────────────────────────────────────────
function GoalRow({ goal, depth }: { goal: GoalV2 & { depth: number }; depth: number }) {
  const typeConf = TYPE_CONFIG[goal.type] || TYPE_CONFIG.outcome;
  const linkCount = goal.links?.length || 0;

  return (
    <Link
      to={`/app/goals/${goal.id}`}
      className={`group block bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all duration-150 overflow-hidden border-l-[3px] ${statusAccentColors[goal.status] || 'border-l-gray-300'}`}
      style={{ marginLeft: depth * 24 }}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Type icon */}
        <span className="text-base flex-shrink-0">{typeConf.icon}</span>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={goal.title}>
              {goal.title}
            </h3>
            {depth > 0 && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">sub-goal</span>
            )}
          </div>
          {goal.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{goal.description}</p>
          )}
        </div>

        {/* Linked plans count */}
        {linkCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">
            <FolderKanban className="w-3 h-3" />
            {linkCount}
          </span>
        )}

        {/* Status label */}
        <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0 capitalize">
          {goal.status}
        </span>

        {/* Chevron */}
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
      </div>
    </Link>
  );
}

// ─── Empty State ─────────────────────────────────────────────────
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-16">
      <Target className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">No goals yet</p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Create a goal
      </button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function GoalsPage() {
  const { data: tree, isLoading, error } = useGoalsTree();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const flatGoals = useMemo(() => flattenGoals(tree || []), [tree]);

  const filteredGoals = useMemo(() => {
    return flatGoals.filter((goal) => {
      if (statusFilter !== 'all' && goal.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return goal.title.toLowerCase().includes(q) || (goal.description || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [flatGoals, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: flatGoals.length };
    for (const goal of flatGoals) {
      counts[goal.status] = (counts[goal.status] || 0) + 1;
    }
    return counts;
  }, [flatGoals]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header — matches Plans page pattern */}
      <div className="border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Title + search row */}
          <div className="flex items-center gap-4 py-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Goals</h1>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                {flatGoals.length}
              </span>
            </div>

            {/* Search — inline */}
            {flatGoals.length > 0 && (
              <div className="flex-1 relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                />
              </div>
            )}

            {/* New Goal button — right aligned */}
            {flatGoals.length > 0 && (
              <button
                onClick={() => setShowCreate(true)}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Goal
              </button>
            )}
          </div>

          {/* Filter pills */}
          {flatGoals.length > 0 && (
            <div className="flex items-center gap-1 pb-2.5 -mt-0.5 overflow-x-auto">
              {STATUS_FILTERS.map((s) => {
                const count = statusCounts[s] || 0;
                const isActive = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    {count > 0 && <span className={`ml-1 tabular-nums ${isActive ? 'opacity-70' : 'opacity-50'}`}>{count}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <>
          {error && (
            <div className="text-center py-16">
              <p className="text-xs text-red-500">Failed to load goals. Please try again.</p>
            </div>
          )}

          {!error && flatGoals.length === 0 && (
            <EmptyState onCreateClick={() => setShowCreate(true)} />
          )}

          {!error && flatGoals.length > 0 && filteredGoals.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No goals match your search</p>
            </div>
          )}

          {filteredGoals.length > 0 && (
            <div className="space-y-1.5">
              {filteredGoals.map((goal) => (
                <GoalRow key={goal.id} goal={goal} depth={goal.depth} />
              ))}
            </div>
          )}
        </>
      </div>

      {showCreate && <CreateGoalDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
