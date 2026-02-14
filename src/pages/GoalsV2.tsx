import React, { useState } from 'react';
import {
  useGoalsTree,
  useGoalV2,
  useGoalEvaluations,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          cursor: 'pointer',
          borderRadius: 6,
          background: selectedId === goal.id ? '#1e293b' : 'transparent',
          borderLeft: `3px solid ${typeConf.color}`,
          marginBottom: 2,
          transition: 'background 0.15s',
        }}
      >
        {hasChildren && (
          <span
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            style={{ cursor: 'pointer', fontSize: 12, width: 16 }}
          >
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span style={{ width: 16 }} />}
        <span>{typeConf.icon}</span>
        <span style={{ flex: 1, fontWeight: selectedId === goal.id ? 600 : 400, fontSize: 14 }}>
          {goal.title}
        </span>
        <span
          style={{
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 10,
            background: statusConf.color + '22',
            color: statusConf.color,
          }}
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
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#1e293b', borderRadius: 12, padding: 24, width: 420,
        border: '1px solid #334155',
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>Create Goal</h3>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Goal title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={inputStyle}
          />
          <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{`${v.icon} ${v.label}`}</option>
            ))}
          </select>
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Priority (0=normal)"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
            <button type="submit" disabled={createGoal.isLoading} style={btnPrimary}>
              {createGoal.isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Goal Detail Panel ───────────────────────────────────────────
function GoalDetail({ goalId }: { goalId: string }) {
  const { data: goal, isLoading } = useGoalV2(goalId);
  const { data: evaluations } = useGoalEvaluations(goalId);
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  if (isLoading) return <div style={{ padding: 24, color: '#94a3b8' }}>Loading...</div>;
  if (!goal) return <div style={{ padding: 24, color: '#94a3b8' }}>Goal not found</div>;

  const typeConf = TYPE_CONFIG[goal.type] || TYPE_CONFIG.outcome;
  const statusConf = STATUS_CONFIG[goal.status] || STATUS_CONFIG.active;

  return (
    <div style={{ padding: 24, overflow: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>{typeConf.icon}</span>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{goal.title}</h2>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: typeConf.color + '22', color: typeConf.color }}>
              {typeConf.label}
            </span>
            <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: statusConf.color + '22', color: statusConf.color }}>
              {statusConf.label}
            </span>
            <span style={{ fontSize: 12, color: '#64748b' }}>Priority: {goal.priority}</span>
          </div>
        </div>
      </div>

      {goal.description && (
        <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: 20 }}>{goal.description}</p>
      )}

      {/* Status Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['active', 'achieved', 'paused', 'abandoned'].map((s) => (
          <button
            key={s}
            onClick={() => updateGoal.mutate({ id: goal.id, status: s as any })}
            disabled={goal.status === s}
            style={{
              ...btnSecondary,
              opacity: goal.status === s ? 0.5 : 1,
              borderColor: STATUS_CONFIG[s]?.color || '#475569',
            }}
          >
            {STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Success Criteria */}
      {goal.successCriteria && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ margin: '0 0 8px', color: '#94a3b8', fontSize: 13, textTransform: 'uppercase' }}>
            Success Criteria
          </h4>
          <pre style={{ background: '#0f172a', padding: 12, borderRadius: 8, fontSize: 13, overflow: 'auto' }}>
            {JSON.stringify(goal.successCriteria, null, 2)}
          </pre>
        </div>
      )}

      {/* Links */}
      {goal.links && goal.links.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ margin: '0 0 8px', color: '#94a3b8', fontSize: 13, textTransform: 'uppercase' }}>
            Links ({goal.links.length})
          </h4>
          {goal.links.map((link) => (
            <div key={link.id} style={{
              display: 'flex', gap: 8, padding: '6px 10px', background: '#0f172a',
              borderRadius: 6, marginBottom: 4, fontSize: 13,
            }}>
              <span style={{ color: '#64748b' }}>{link.linkedType}</span>
              <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{link.linkedId.slice(0, 8)}...</span>
            </div>
          ))}
        </div>
      )}

      {/* Evaluations Timeline */}
      <div>
        <h4 style={{ margin: '0 0 8px', color: '#94a3b8', fontSize: 13, textTransform: 'uppercase' }}>
          Evaluations {evaluations ? `(${evaluations.length})` : ''}
        </h4>
        {evaluations && evaluations.length > 0 ? (
          evaluations.map((ev) => (
            <div key={ev.id} style={{
              padding: 12, background: '#0f172a', borderRadius: 8,
              marginBottom: 8, borderLeft: `3px solid ${ev.score != null && ev.score >= 70 ? '#22c55e' : ev.score != null ? '#f59e0b' : '#475569'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{ev.evaluatedBy}</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {new Date(ev.evaluatedAt).toLocaleDateString()}
                </span>
              </div>
              {ev.score != null && (
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{ev.score}/100</div>
              )}
              {ev.reasoning && <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1' }}>{ev.reasoning}</p>}
            </div>
          ))
        ) : (
          <p style={{ color: '#475569', fontSize: 13 }}>No evaluations yet</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function GoalsV2() {
  const { data: tree, isLoading, error } = useGoalsTree();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Left: Tree */}
      <div style={{
        width: 360, borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Goals</h2>
          <button onClick={() => setShowCreate(true)} style={btnPrimary}>+ New</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
          <>
            {isLoading && <p style={{ color: '#64748b', padding: 12 }}>Loading...</p>}
            {error && <p style={{ color: '#ef4444', padding: 12 }}>Failed to load goals</p>}
            {tree && tree.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>
                <p style={{ fontSize: 32 }}>🎯</p>
                <p>No goals yet. Create your first goal!</p>
              </div>
            )}
            {tree && tree.map((goal) => (
              <GoalTreeNode key={goal.id} goal={goal} selectedId={selectedId} onSelect={setSelectedId} />
            ))}
          </>
        </div>
      </div>

      {/* Right: Detail */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {selectedId ? (
          <GoalDetail goalId={selectedId} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 48 }}>🎯</p>
              <p>Select a goal to view details</p>
            </div>
          </div>
        )}
      </div>

      {showCreate && <CreateGoalDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  marginBottom: 10,
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: 6,
  color: '#e2e8f0',
  fontSize: 14,
  boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  padding: '8px 16px',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
};

const btnSecondary: React.CSSProperties = {
  padding: '6px 12px',
  background: 'transparent',
  color: '#94a3b8',
  border: '1px solid #475569',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 12,
};
