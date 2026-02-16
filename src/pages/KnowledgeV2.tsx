import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  useKnowledgeList,
  useKnowledgeSearch,
  useKnowledgeGraph,
  useCreateKnowledge,
  useDeleteKnowledge,
  KnowledgeEntry,
} from '../hooks/useKnowledge';

// ─── Config ──────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  decision: { label: 'Decision', icon: '⚖️', color: '#3b82f6' },
  learning: { label: 'Learning', icon: '💡', color: '#10b981' },
  context: { label: 'Context', icon: '📋', color: '#8b5cf6' },
  constraint: { label: 'Constraint', icon: '🚧', color: '#ef4444' },
  reference: { label: 'Reference', icon: '📎', color: '#6366f1' },
  note: { label: 'Note', icon: '📝', color: '#f59e0b' },
};

const SOURCE_OPTIONS = ['human', 'agent', 'import', 'openclaw'];

// ─── Timeline View ───────────────────────────────────────────────
function TimelineView({ onCreateClick }: { onCreateClick: () => void }) {
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const { data: entries, isLoading } = useKnowledgeList({ entryType: typeFilter || undefined });
  const deleteMut = useDeleteKnowledge();

  const filtered = entries?.filter(e => !sourceFilter || e.source === sourceFilter) || [];

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
          <option value="">All sources</option>
          {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading && <p className="text-gray-400">Loading…</p>}

      {filtered.map(entry => {
        const tc = TYPE_CONFIG[entry.entryType] || TYPE_CONFIG.note;
        return (
          <div key={entry.id} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-3" style={{ borderLeft: `4px solid ${tc.color}` }}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-base font-semibold text-gray-900 dark:text-white">{tc.icon} {entry.title}</span>
                <div className="flex gap-1.5 mt-1">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: tc.color + '22', color: tc.color }}>{tc.label}</span>
                  {entry.source && <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400">{entry.source}</span>}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</span>
                <button className="px-2 py-0.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" onClick={() => { if (window.confirm('Delete this entry?')) deleteMut.mutate(entry.id); }}>✕</button>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{entry.content.slice(0, 300)}{entry.content.length > 300 ? '…' : ''}</p>
            {entry.tags?.length > 0 && (
              <div className="flex gap-1 mt-2">
                {entry.tags.map(t => <span key={t} className="text-[11px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400">#{t}</span>)}
              </div>
            )}
          </div>
        );
      })}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="text-5xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Capture decisions & context</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Knowledge stores help your agents remember important decisions, constraints, and learnings across projects.
          </p>
          <button
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            onClick={onCreateClick}
          >
            + New Knowledge Entry
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            💡 Tip: Agents automatically add learnings as they work
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Search View ─────────────────────────────────────────────────
function SearchView() {
  const [query, setQuery] = useState('');
  const searchMut = useKnowledgeSearch();

  const handleSearch = () => {
    if (query.trim()) searchMut.mutate({ query: query.trim(), limit: 20 });
  };

  return (
    <div>
      <div className="flex gap-2 mb-5">
        <input
          className="flex-1 px-3 py-2.5 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm"
          placeholder="Search knowledge semantically…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="px-4 py-2.5 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50" onClick={handleSearch} disabled={searchMut.isLoading}>
          {searchMut.isLoading ? '…' : '🔍 Search'}
        </button>
      </div>

      {searchMut.data && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {searchMut.data.results.length} results via {searchMut.data.method} search
          </p>
          {searchMut.data.results.map(entry => {
            const tc = TYPE_CONFIG[entry.entryType] || TYPE_CONFIG.note;
            return (
              <div key={entry.id} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-3" style={{ borderLeft: `4px solid ${tc.color}` }}>
                <div className="flex justify-between mb-1.5">
                  <span className="font-semibold text-gray-900 dark:text-white">{tc.icon} {entry.title}</span>
                  {entry.similarity !== undefined && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      {(entry.similarity * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{entry.content.slice(0, 200)}{entry.content.length > 200 ? '…' : ''}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Graph View (force-directed layout) ──────────────────────────
interface GraphNode { id: string; title: string; x: number; y: number; vx: number; vy: number }
interface GraphEdge { source: string; target: string; similarity: number }

function GraphView() {
  const { data: graph, isLoading } = useKnowledgeGraph({ threshold: 0.7, limit: 50 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const animRef = useRef<number>(0);

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (!graph || graph.nodes.length === 0) return;

    // Initialize positions in a circle
    const cx = 400, cy = 300, r = 200;
    nodesRef.current = graph.nodes.map((n, i) => ({
      ...n,
      x: cx + r * Math.cos((2 * Math.PI * i) / graph.nodes.length),
      y: cy + r * Math.sin((2 * Math.PI * i) / graph.nodes.length),
      vx: 0, vy: 0,
    }));
    edgesRef.current = graph.edges;

    let running = true;
    const tick = () => {
      if (!running) return;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Simple force simulation
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const repulse = 5000 / (dist * dist);
          nodes[i].vx -= (dx / dist) * repulse;
          nodes[i].vy -= (dy / dist) * repulse;
          nodes[j].vx += (dx / dist) * repulse;
          nodes[j].vy += (dy / dist) * repulse;
        }
      }

      const nodeMap = new Map(nodes.map(n => [n.id, n]));
      for (const edge of edges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const attract = (dist - 150) * 0.01 * edge.similarity;
        s.vx += (dx / dist) * attract;
        s.vy += (dy / dist) * attract;
        t.vx -= (dx / dist) * attract;
        t.vy -= (dy / dist) * attract;
      }

      // Center gravity
      for (const n of nodes) {
        n.vx += (cx - n.x) * 0.001;
        n.vy += (cy - n.y) * 0.001;
        n.vx *= 0.9;
        n.vy *= 0.9;
        n.x += n.vx;
        n.y += n.vy;
      }

      // Draw
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, 800, 600);

      // Edges
      for (const edge of edges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;
        ctx.strokeStyle = isDark ? `rgba(100,116,139,${edge.similarity * 0.8})` : `rgba(148,163,184,${edge.similarity * 0.8})`;
        ctx.lineWidth = edge.similarity * 3;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }

      // Nodes
      for (const n of nodes) {
        ctx.fillStyle = isDark ? '#334155' : '#e2e8f0';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        const label = n.title.length > 15 ? n.title.slice(0, 14) + '…' : n.title;
        ctx.fillText(label, n.x, n.y + 32);
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    // Stop after 5 seconds to save CPU
    const timeout = setTimeout(() => { running = false; }, 5000);

    return () => { running = false; cancelAnimationFrame(animRef.current); clearTimeout(timeout); };
  }, [graph, isDark]);

  if (isLoading) return <p className="text-gray-400">Loading graph…</p>;

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-10 text-center text-gray-500 dark:text-gray-400">
        <p className="text-5xl mb-2">🕸️</p>
        <p className="text-base">No similarity connections found yet.</p>
        <p className="text-sm mt-1">Add more knowledge entries with embeddings to see the similarity graph.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{graph.nodes.length} nodes, {graph.edges.length} connections</p>
      <canvas ref={canvasRef} width={800} height={600} className="w-full max-w-[800px] mx-auto rounded-lg bg-white dark:bg-slate-900" />
    </div>
  );
}

// ─── Create Dialog ───────────────────────────────────────────────
function CreateDialog({ onClose }: { onClose: () => void }) {
  const createMut = useCreateKnowledge();
  const [form, setForm] = useState({ title: '', content: '', entryType: 'note', source: 'human', tags: '', planId: '' });

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    await createMut.mutateAsync({
      title: form.title.trim(),
      content: form.content.trim(),
      entryType: form.entryType as any,
      source: form.source,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      ...(form.planId ? { scopeId: form.planId, scope: 'plan' as const } : {}),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-[500px] max-h-[80vh] overflow-auto border border-gray-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Knowledge Entry</h3>
        <div className="space-y-3">
          <input className="w-full px-3 py-2.5 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="w-full px-3 py-2.5 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm min-h-[100px]" placeholder="Content…" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          <div className="flex gap-2">
            <select className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm" value={form.entryType} onChange={e => setForm({ ...form, entryType: e.target.value })}>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
            <select className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
              {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <input className="w-full px-3 py-2.5 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm" placeholder="Link to plan (paste plan ID, optional)" value={form.planId} onChange={e => setForm({ ...form, planId: e.target.value })} />
          <input className="w-full px-3 py-2.5 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm" placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          <div className="flex gap-2 justify-end pt-1">
            <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700" onClick={onClose}>Cancel</button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50" onClick={handleSubmit} disabled={createMut.isLoading}>
              {createMut.isLoading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function KnowledgeV2() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'search' | 'graph'>('timeline');
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🧠 Knowledge Base</h1>
        <button className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md" onClick={() => setShowCreate(true)}>+ New Entry</button>
      </div>

      <div className="flex gap-2 mb-5">
        {(['timeline', 'search', 'graph'] as const).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm rounded-md border transition-colors ${
              activeTab === tab
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'timeline' ? '📋 Timeline' : tab === 'search' ? '🔍 Search' : '🕸️ Graph'}
          </button>
        ))}
      </div>

      {activeTab === 'timeline' && <TimelineView onCreateClick={() => setShowCreate(true)} />}
      {activeTab === 'search' && <SearchView />}
      {activeTab === 'graph' && <GraphView />}

      {showCreate && <CreateDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
