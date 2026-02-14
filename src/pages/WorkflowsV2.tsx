import React, { useState } from 'react';
import {
  useWorkflowTemplates,
  useWorkflowRuns,
  useWorkflowRun,
  useWorkflowEvents,
  WorkflowRun,
  WorkflowTemplate,
} from '../hooks/useWorkflows';

const STATUS_COLORS: Record<string, { bg: string; fg: string; icon: string }> = {
  pending: { bg: 'bg-gray-100 dark:bg-slate-700', fg: 'text-gray-600 dark:text-gray-400', icon: '○' },
  running: { bg: 'bg-blue-100 dark:bg-blue-900/30', fg: 'text-blue-600 dark:text-blue-400', icon: '⏳' },
  succeeded: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', fg: 'text-emerald-600 dark:text-emerald-400', icon: '✅' },
  failed: { bg: 'bg-red-100 dark:bg-red-900/30', fg: 'text-red-600 dark:text-red-400', icon: '❌' },
  cancelled: { bg: 'bg-stone-100 dark:bg-stone-800', fg: 'text-stone-600 dark:text-stone-400', icon: '⊘' },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${c.bg} ${c.fg}`}>{c.icon} {status}</span>;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function duration(start: string, end?: string) {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

// ─── Templates Sidebar ──────────────────────────────────────────
function TemplatesList({ templates, selected, onSelect }: {
  templates: WorkflowTemplate[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="w-60 flex-shrink-0">
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3.5 py-2 uppercase">Templates</div>
      {templates.map(t => (
        <div
          key={t.id}
          className={`px-3.5 py-2.5 rounded-md mb-1 cursor-pointer text-sm transition-colors ${
            selected === t.id
              ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-700'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
          onClick={() => onSelect(selected === t.id ? null : t.id)}
        >
          ○ {t.name}
        </div>
      ))}
      {templates.length === 0 && <div className="px-3.5 py-2 text-sm text-gray-400">No templates</div>}
    </div>
  );
}

// ─── Run Detail Panel ────────────────────────────────────────────
function RunDetail({ runId, onBack }: { runId: string; onBack: () => void }) {
  const { data: run, isLoading } = useWorkflowRun(runId);
  if (isLoading) return <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-5 text-gray-500">Loading…</div>;
  if (!run) return <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-5 text-gray-500">Run not found</div>;

  return (
    <div>
      {/* Back button at the top */}
      <button className="mb-4 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800" onClick={onBack}>
        ← Back to runs
      </button>

      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-5">
        <div className="flex justify-between mb-4">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{run.workflowName}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">ID: {run.id.slice(0, 8)}</div>
          </div>
          <div className="text-right">
            <StatusBadge status={run.status} />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {timeAgo(run.startedAt)} · {duration(run.startedAt, run.finishedAt)}
            </div>
          </div>
        </div>

        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Steps</div>
        {(run.steps || []).map((step, i) => {
          const sc = STATUS_COLORS[step.status] || STATUS_COLORS.pending;
          return (
            <div key={i} className="flex items-center gap-2.5 py-2 border-b border-gray-200 dark:border-slate-700 last:border-0">
              <span>{sc.icon}</span>
              <span className="flex-1 font-medium text-sm text-gray-900 dark:text-gray-100">{step.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {step.startedAt && step.finishedAt ? duration(step.startedAt, step.finishedAt) : step.status}
              </span>
            </div>
          );
        })}
        {(!run.steps || run.steps.length === 0) && <div className="text-gray-400 text-sm">No step data available</div>}
      </div>
    </div>
  );
}

// ─── Trigger Workflow Dialog ─────────────────────────────────────
function TriggerDialog({ templates, onClose }: { templates: WorkflowTemplate[]; onClose: () => void }) {
  const [selected, setSelected] = useState('');
  const [payload, setPayload] = useState('{}');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleTrigger = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/workflows/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ workflowName: selected, input: JSON.parse(payload) }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed');
      setResult('Workflow triggered successfully!');
      setTimeout(onClose, 1500);
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-[440px] border border-gray-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trigger Workflow</h3>
        <select className="w-full px-3 py-2.5 mb-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm" value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Select a workflow…</option>
          {templates.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
        <textarea
          className="w-full px-3 py-2.5 mb-3 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm font-mono min-h-[80px]"
          placeholder='{"key": "value"}'
          value={payload}
          onChange={e => setPayload(e.target.value)}
        />
        {result && <p className={`text-sm mb-3 ${result.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{result}</p>}
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600 rounded-md" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50" onClick={handleTrigger} disabled={!selected || submitting}>
            {submitting ? 'Triggering…' : '⚡ Trigger'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
type TabType = 'runs' | 'events';

export default function WorkflowsV2() {
  const [tab, setTab] = useState<TabType>('runs');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTrigger, setShowTrigger] = useState(false);

  const { data: templates = [] } = useWorkflowTemplates();
  const { data: runs = [], isLoading: runsLoading } = useWorkflowRuns({
    status: statusFilter || undefined,
    limit: 50,
  });
  const { data: events = [], isLoading: eventsLoading } = useWorkflowEvents({ limit: 50 });

  const filteredRuns = selectedTemplate
    ? runs.filter(r => r.workflowName === templates.find(t => t.id === selectedTemplate)?.name)
    : runs;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚡ Workflows</h1>
        <button className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md" onClick={() => setShowTrigger(true)}>
          ⚡ Trigger Workflow
        </button>
      </div>

      <div className="flex gap-5">
        <TemplatesList templates={templates} selected={selectedTemplate} onSelect={setSelectedTemplate} />

        <div className="flex-1 min-w-0">
          <div className="flex gap-2 mb-5">
            <button className={`px-4 py-2 text-sm rounded-md border transition-colors ${tab === 'runs' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`} onClick={() => setTab('runs')}>Active Runs</button>
            <button className={`px-4 py-2 text-sm rounded-md border transition-colors ${tab === 'events' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`} onClick={() => setTab('events')}>Event Log</button>
          </div>

          {tab === 'runs' && (
            <>
              {!selectedRunId && (
                <div className="flex gap-2 mb-4">
                  <select className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    <option value="running">Running</option>
                    <option value="succeeded">Succeeded</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              {selectedRunId ? (
                <RunDetail runId={selectedRunId} onBack={() => setSelectedRunId(null)} />
              ) : (
                <>
                  {runsLoading && <div className="text-center py-10 text-gray-400">Loading runs…</div>}
                  {!runsLoading && filteredRuns.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                      <div className="text-3xl mb-2">⚡</div>
                      <div>No workflow runs yet</div>
                      <div className="text-sm mt-1">Runs will appear here when workflows execute</div>
                    </div>
                  )}
                  {filteredRuns.map(run => (
                    <div
                      key={run.id}
                      className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-3 cursor-pointer border border-transparent hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
                      onClick={() => setSelectedRunId(run.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{run.workflowName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{run.id.slice(0, 8)} · {timeAgo(run.startedAt)}</div>
                        </div>
                        <StatusBadge status={run.status} />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {tab === 'events' && (
            <>
              {eventsLoading && <div className="text-center py-10 text-gray-400">Loading events…</div>}
              {!eventsLoading && events.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-3xl mb-2">📡</div>
                  <div>No events yet</div>
                </div>
              )}
              {events.map(event => (
                <div key={event.id} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-3">
                  <div className="flex justify-between">
                    <span className="font-semibold font-mono text-sm text-gray-900 dark:text-white">{event.key}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(event.createdAt)}</span>
                  </div>
                  {event.payload && (
                    <pre className="text-xs text-gray-600 dark:text-gray-400 mt-2 overflow-auto max-h-24">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {showTrigger && <TriggerDialog templates={templates} onClose={() => setShowTrigger(false)} />}
    </div>
  );
}
