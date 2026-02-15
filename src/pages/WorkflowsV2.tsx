import React, { useState } from 'react';
import {
  useWorkflowTemplates,
  useWorkflowRuns,
  useWorkflowRun,
  useWorkflowEvents,
  WorkflowRun,
  WorkflowTemplate,
} from '../hooks/useWorkflows';

// ─── Styles ──────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  container: { padding: 24, maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  layout: { display: 'flex', gap: 20 },
  sidebar: { width: 240, flexShrink: 0 },
  main: { flex: 1, minWidth: 0 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: { padding: '8px 16px', borderRadius: 6, cursor: 'pointer', border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', fontSize: 14 },
  tabActive: { padding: '8px 16px', borderRadius: 6, cursor: 'pointer', border: '1px solid #3b82f6', background: '#1e3a5f', color: '#93c5fd', fontSize: 14 },
  card: { background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 12, cursor: 'pointer', border: '1px solid transparent', transition: 'border-color 0.15s' },
  cardSelected: { background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 12, cursor: 'pointer', border: '1px solid #3b82f6' },
  sidebarItem: { padding: '10px 14px', borderRadius: 6, marginBottom: 4, cursor: 'pointer', fontSize: 14, color: '#94a3b8' },
  sidebarItemActive: { padding: '10px 14px', borderRadius: 6, marginBottom: 4, cursor: 'pointer', fontSize: 14, color: '#e2e8f0', background: '#334155' },
  badge: { fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600, display: 'inline-block' },
  detailPanel: { background: '#1e293b', borderRadius: 8, padding: 20 },
  step: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #334155' },
  empty: { color: '#64748b', textAlign: 'center' as const, padding: 40 },
  filterRow: { display: 'flex', gap: 8, marginBottom: 16 },
  select: { padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 13 },
};

const STATUS_COLORS: Record<string, { bg: string; fg: string; icon: string }> = {
  pending: { bg: '#334155', fg: '#94a3b8', icon: '○' },
  running: { bg: '#1e3a5f', fg: '#60a5fa', icon: '⏳' },
  succeeded: { bg: '#064e3b', fg: '#34d399', icon: '✅' },
  failed: { bg: '#7f1d1d', fg: '#f87171', icon: '❌' },
  cancelled: { bg: '#44403c', fg: '#a8a29e', icon: '⊘' },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <span style={{ ...s.badge, background: c.bg, color: c.fg }}>{c.icon} {status}</span>;
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
    <div style={s.sidebar}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', padding: '8px 14px', textTransform: 'uppercase' }}>
        Templates
      </div>
      {templates.map(t => (
        <div
          key={t.id}
          style={selected === t.id ? s.sidebarItemActive : s.sidebarItem}
          onClick={() => onSelect(selected === t.id ? null : t.id)}
        >
          ○ {t.name}
        </div>
      ))}
      {templates.length === 0 && <div style={{ ...s.sidebarItem, color: '#475569' }}>No templates</div>}
    </div>
  );
}

// ─── Run Detail Panel ────────────────────────────────────────────
function RunDetail({ runId }: { runId: string }) {
  const { data: run, isLoading } = useWorkflowRun(runId);
  if (isLoading) return <div style={s.detailPanel}>Loading…</div>;
  if (!run) return <div style={s.detailPanel}>Run not found</div>;

  return (
    <div style={s.detailPanel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{run.workflowName}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>ID: {run.id.slice(0, 8)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <StatusBadge status={run.status} />
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            {timeAgo(run.startedAt)} · {duration(run.startedAt, run.finishedAt)}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Steps</div>
      {(run.steps || []).map((step, i) => {
        const sc = STATUS_COLORS[step.status] || STATUS_COLORS.pending;
        return (
          <div key={i} style={s.step}>
            <span>{sc.icon}</span>
            <span style={{ flex: 1, fontWeight: 500 }}>{step.name}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {step.startedAt && step.finishedAt ? duration(step.startedAt, step.finishedAt) : step.status}
            </span>
          </div>
        );
      })}
      {(!run.steps || run.steps.length === 0) && <div style={{ color: '#475569', fontSize: 13 }}>No step data available</div>}
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

  const { data: templates = [] } = useWorkflowTemplates();
  const { data: runs = [], isLoading: runsLoading } = useWorkflowRuns({
    status: statusFilter || undefined,
    limit: 50,
  });
  const { data: events = [], isLoading: eventsLoading } = useWorkflowEvents({ limit: 50 });

  // Filter runs by selected template
  const filteredRuns = selectedTemplate
    ? runs.filter(r => r.workflowName === templates.find(t => t.id === selectedTemplate)?.name)
    : runs;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.title}>⚡ Workflows</div>
      </div>

      <div style={s.layout}>
        <TemplatesList templates={templates} selected={selectedTemplate} onSelect={setSelectedTemplate} />

        <div style={s.main}>
          <div style={s.tabs}>
            <button style={tab === 'runs' ? s.tabActive : s.tab} onClick={() => setTab('runs')}>Active Runs</button>
            <button style={tab === 'events' ? s.tabActive : s.tab} onClick={() => setTab('events')}>Event Log</button>
          </div>

          {tab === 'runs' && (
            <>
              <div style={s.filterRow}>
                <select style={s.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All statuses</option>
                  <option value="running">Running</option>
                  <option value="succeeded">Succeeded</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {selectedRunId && <RunDetail runId={selectedRunId} />}

              {!selectedRunId && runsLoading && <div style={s.empty}>Loading runs…</div>}

              {!selectedRunId && !runsLoading && filteredRuns.length === 0 && (
                <div style={s.empty}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
                  <div>No workflow runs yet</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Runs will appear here when workflows execute</div>
                </div>
              )}

              {!selectedRunId && filteredRuns.map(run => (
                <div
                  key={run.id}
                  style={s.card}
                  onClick={() => setSelectedRunId(run.id)}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#475569')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{run.workflowName}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {run.id.slice(0, 8)} · {timeAgo(run.startedAt)}
                      </div>
                    </div>
                    <StatusBadge status={run.status} />
                  </div>
                </div>
              ))}

              {selectedRunId && (
                <button
                  style={{ ...s.tab, marginTop: 12 }}
                  onClick={() => setSelectedRunId(null)}
                >
                  ← Back to runs
                </button>
              )}
            </>
          )}

          {tab === 'events' && (
            <>
              {eventsLoading && <div style={s.empty}>Loading events…</div>}
              {!eventsLoading && events.length === 0 && (
                <div style={s.empty}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📡</div>
                  <div>No events yet</div>
                </div>
              )}
              {events.map(event => (
                <div key={event.id} style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>{event.key}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{timeAgo(event.createdAt)}</span>
                  </div>
                  {event.payload && (
                    <pre style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, overflow: 'auto', maxHeight: 100 }}>
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
