import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGoalsTree,
  useGoalV2,
  useGoalEvaluations,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useAddEvaluation,
  GoalV2,
  GoalEvaluation,
} from '../hooks/useGoalsV2';

// ─── Goal Type Config ────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  outcome: { label: 'Outcome', color: '#3b82f6', icon: '🎯' },
  constraint: { label: 'Constraint', color: '#ef4444', icon: '🚧' },
  metric: { label: 'Metric', color: '#10b981', icon: '📊' },
  principle: { label: 'Principle', color: '#8b5cf6', icon: '💡' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: '#22c55e' },
  achieved: { label: 'Achieved', color: '#3b82f6' },
  paused: { label: 'Paused', color: '#f59e0b' },
  abandoned: { label: 'Abandoned', color: '#6b7280' },
};

// ─── Tree Node Component ─────────────────────────────────────────
function GoalTreeNode({
  goal,
  selectedId,
  onSelect,
  depth = 0,
}: {
  goal: GoalV2;
  selectedId: string | null;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = goal.children && goal.children.length > 0;
  const typeConf = TYPE_CONFIG[goal.type] || TYPE_CONFIG.outcome;
  const statusConf = STATUS_CONFIG[goal.status] || STATUS_CONFIG.active;

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        onClick={() => onSelect(goal.id)}
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md mb-0.5 transition-colors
          ${selectedId === goal.id ? 'bg-gray-100 dark:bg-slate-800' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
        style={{ borderLeft: `3px solid ${typeConf.color}` }}
      >
        {hasChildren ? (
          <span
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="cursor-pointer text-xs w-4 text-gray-500 dark:text-gray-400"
          >
            {expanded ? '▼' : '▶'}
          </span>
        ) : <span className="w-4" />}
        <span>{typeConf.icon}</span>
        <span className={`flex-1 text-sm text-gray-900 dark:text-gray-100 ${selectedId === goal.id ? 'font-semibold' : ''}`}>
          {goal.title}
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full"
          style={{ background: statusConf.color + '22', color: statusConf.color }}
        >
          {statusConf.label}
        </span>
      </div>
      {expanded && hasChildren && goal.children!.map((child) => (
        <GoalTreeNode key={child.id} goal={child} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
      ))}
    </div>
  );
}

// ─── Create Goal Dialog ──────────────────────────────────────────
function CreateGoalDialog({
  onClose,
  parentGoalId,
}: {
  onClose: () => void;
  parentGoalId?: string;
}) {
  const createGoal = useCreateGoal();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>('outcome');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGoal.mutateAsync({ title, type: type as any, description, priority, parentGoalId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-xl p-6 w-[420px] border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Create Goal</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Goal title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm"
          />
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm">
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{`${v.icon} ${v.label}`}</option>
            ))}
          </select>
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm"
          />
          <input
            type="number"
            placeholder="Priority (0=normal)"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm"
          />
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={createGoal.isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50">
              {createGoal.isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Evaluation Form ─────────────────────────────────────────────
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

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 mt-4 bg-gray-50 dark:bg-slate-900">
      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">New Evaluation</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Score: {score}/100</label>
          <input type="range" min={0} max={100} value={score} onChange={e => setScore(Number(e.target.value))} className="w-full" />
        </div>
        <input
          placeholder="Evaluated by (e.g. human, agent-name)"
          value={evaluatedBy}
          onChange={e => setEvaluatedBy(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
        />
        <textarea
          placeholder="Reasoning..."
          value={reasoning}
          onChange={e => setReasoning(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
        />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600 rounded-md">Cancel</button>
          <button type="submit" disabled={addEval.isLoading} className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50">
            {addEval.isLoading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Goal Detail Panel ───────────────────────────────────────────
function GoalDetail({ goalId }: { goalId: string }) {
  const { data: goal, isLoading } = useGoalV2(goalId);
  const { data: evaluations } = useGoalEvaluations(goalId);
  const updateGoal = useUpdateGoal();
  const [showEvalForm, setShowEvalForm] = useState(false);

  if (isLoading) return <div className="p-6 text-gray-400">Loading...</div>;
  if (!goal) return <div className="p-6 text-gray-400">Goal not found</div>;

  const typeConf = TYPE_CONFIG[goal.type] || TYPE_CONFIG.outcome;
  const statusConf = STATUS_CONFIG[goal.status] || STATUS_CONFIG.active;

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{typeConf.icon}</span>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{goal.title}</h2>
          <div className="flex gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: typeConf.color + '22', color: typeConf.color }}>{typeConf.label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: statusConf.color + '22', color: statusConf.color }}>{statusConf.label}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Priority: {goal.priority}</span>
          </div>
        </div>
      </div>

      {goal.description && <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5">{goal.description}</p>}

      {/* Status Actions */}
      <div className="flex gap-2 mb-6">
        {['active', 'achieved', 'paused', 'abandoned'].map((s) => (
          <button
            key={s}
            onClick={() => updateGoal.mutate({ id: goal.id, status: s as any })}
            disabled={goal.status === s}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors
              ${goal.status === s
                ? 'opacity-50 cursor-default border-gray-300 dark:border-slate-600 text-gray-400'
                : 'border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
          >
            {STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Success Criteria */}
      {goal.successCriteria && (
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Success Criteria</h4>
          <pre className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg text-sm overflow-auto text-gray-800 dark:text-gray-200">
            {JSON.stringify(goal.successCriteria, null, 2)}
          </pre>
        </div>
      )}

      {/* Links */}
      {goal.links && goal.links.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Links ({goal.links.length})</h4>
          {goal.links.map((link) => (
            <div key={link.id} className="flex gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-900 rounded-md mb-1 text-sm">
              <span className="text-gray-500 dark:text-gray-400">{link.linkedType}</span>
              <span className="text-gray-800 dark:text-gray-200 font-mono">{link.linkedId.slice(0, 8)}...</span>
            </div>
          ))}
        </div>
      )}

      {/* Evaluations */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Evaluations {evaluations ? `(${evaluations.length})` : ''}
          </h4>
          {!showEvalForm && (
            <button onClick={() => setShowEvalForm(true)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              + Add Evaluation
            </button>
          )}
        </div>
        {showEvalForm && <EvaluationForm goalId={goalId} onClose={() => setShowEvalForm(false)} />}
        {evaluations && evaluations.length > 0 ? (
          evaluations.map((ev) => (
            <div key={ev.id} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg mb-2"
              style={{ borderLeft: `3px solid ${ev.score != null && ev.score >= 70 ? '#22c55e' : ev.score != null ? '#f59e0b' : '#475569'}` }}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">{ev.evaluatedBy}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(ev.evaluatedAt).toLocaleDateString()}</span>
              </div>
              {ev.score != null && <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">{ev.score}/100</div>}
              {ev.reasoning && <p className="text-sm text-gray-700 dark:text-gray-300">{ev.reasoning}</p>}
            </div>
          ))
        ) : (
          !showEvalForm && <p className="text-sm text-gray-400">No evaluations yet</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function GoalsV2() {
  const { goalId } = useParams<{ goalId?: string }>();
  const navigate = useNavigate();
  const { data: tree, isLoading, error } = useGoalsTree();
  const [showCreate, setShowCreate] = useState(false);

  const handleSelect = (id: string) => {
    navigate(`/app/goals-v2/${id}`);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100">
      {/* Left: Tree */}
      <div className="w-[360px] border-r border-gray-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 pb-2 flex justify-between items-center">
          <h2 className="text-lg font-bold">Goals</h2>
          <button onClick={() => setShowCreate(true)} className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md">+ New</button>
        </div>
        <div className="flex-1 overflow-auto px-3 py-2">
          <>
            {isLoading && <p className="text-gray-400 p-3">Loading...</p>}
            {error && <p className="text-red-500 p-3">Failed to load goals</p>}
            {tree && tree.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl">🎯</p>
                <p className="mt-2">No goals yet. Create your first goal!</p>
              </div>
            )}
            {tree && tree.map((goal) => (
              <GoalTreeNode key={goal.id} goal={goal} selectedId={goalId || null} onSelect={handleSelect} />
            ))}
          </>
        </div>
      </div>

      {/* Right: Detail */}
      <div className="flex-1 overflow-hidden">
        {goalId ? (
          <GoalDetail goalId={goalId} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-5xl">🎯</p>
              <p className="mt-2">Select a goal to view details</p>
            </div>
          </div>
        )}
      </div>

      {showCreate && <CreateGoalDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
