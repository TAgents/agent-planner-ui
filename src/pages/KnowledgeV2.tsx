import React, { useState } from 'react';
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

// ─── Styles ──────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: { padding: 24, maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: { padding: '8px 16px', borderRadius: 6, cursor: 'pointer', border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', fontSize: 14 },
  tabActive: { padding: '8px 16px', borderRadius: 6, cursor: 'pointer', border: '1px solid #3b82f6', background: '#1e3a5f', color: '#93c5fd', fontSize: 14 },
  searchBar: { display: 'flex', gap: 8, marginBottom: 20 },
  input: { flex: 1, padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 14 },
  btn: { padding: '10px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnDanger: { background: '#ef4444', color: '#fff', padding: '4px 10px', fontSize: 12, borderRadius: 4, border: 'none', cursor: 'pointer' },
  card: { background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 12, borderLeft: '4px solid #334155' },
  filterRow: { display: 'flex', gap: 8, marginBottom: 16 },
  select: { padding: '8px 12px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 13 },
  badge: { fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600 },
  modal: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#1e293b', borderRadius: 12, padding: 24, width: 500, maxHeight: '80vh', overflow: 'auto' },
  textarea: { width: '100%', padding: 10, borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 14, minHeight: 100, resize: 'vertical' as const },
  graphPlaceholder: { background: '#1e293b', borderRadius: 8, padding: 40, textAlign: 'center' as const, color: '#64748b' },
};

// ─── Timeline View ───────────────────────────────────────────────
function TimelineView() {
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const { data: entries, isLoading } = useKnowledgeList({ entryType: typeFilter || undefined });
  const deleteMut = useDeleteKnowledge();

  const filtered = entries?.filter(e => !sourceFilter || e.source === sourceFilter) || [];

  return (
    <div>
      <div style={styles.filterRow}>
        <select style={styles.select} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select style={styles.select} value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
          <option value="">All sources</option>
          {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading && <p style={{ color: '#64748b' }}>Loading…</p>}

      {filtered.map(entry => {
        const tc = TYPE_CONFIG[entry.entryType] || TYPE_CONFIG.note;
        return (
          <div key={entry.id} style={{ ...styles.card, borderLeftColor: tc.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{tc.icon} {entry.title}</span>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <span style={{ ...styles.badge, background: tc.color + '22', color: tc.color }}>{tc.label}</span>
                  {entry.source && <span style={{ ...styles.badge, background: '#334155', color: '#94a3b8' }}>{entry.source}</span>}
                  {entry.similarity !== undefined && (
                    <span style={{ ...styles.badge, background: '#10b98122', color: '#10b981' }}>
                      {(entry.similarity * 100).toFixed(0)}% match
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{new Date(entry.createdAt).toLocaleDateString()}</span>
                <button style={styles.btnDanger} onClick={() => { if (window.confirm('Delete this entry?')) deleteMut.mutate(entry.id); }}>✕</button>
              </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: 14, margin: 0, whiteSpace: 'pre-wrap' }}>{entry.content.slice(0, 300)}{entry.content.length > 300 ? '…' : ''}</p>
            {entry.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {entry.tags.map(t => <span key={t} style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: '#334155', color: '#94a3b8' }}>#{t}</span>)}
              </div>
            )}
          </div>
        );
      })}

      {!isLoading && filtered.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No knowledge entries yet. Create one to get started!</p>}
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
      <div style={styles.searchBar}>
        <input
          style={styles.input}
          placeholder="Search knowledge semantically…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleSearch} disabled={searchMut.isLoading}>
          {searchMut.isLoading ? '…' : '🔍 Search'}
        </button>
      </div>

      {searchMut.data && (
        <div>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
            {searchMut.data.results.length} results via {searchMut.data.method} search
          </p>
          {searchMut.data.results.map(entry => {
            const tc = TYPE_CONFIG[entry.entryType] || TYPE_CONFIG.note;
            return (
              <div key={entry.id} style={{ ...styles.card, borderLeftColor: tc.color }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{tc.icon} {entry.title}</span>
                  {entry.similarity !== undefined && (
                    <span style={{ ...styles.badge, background: '#10b98122', color: '#10b981' }}>
                      {(entry.similarity * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <p style={{ color: '#cbd5e1', fontSize: 14, margin: 0 }}>{entry.content.slice(0, 200)}{entry.content.length > 200 ? '…' : ''}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Graph View (placeholder) ────────────────────────────────────
function GraphView() {
  const { data: graph, isLoading } = useKnowledgeGraph({ threshold: 0.7, limit: 50 });

  if (isLoading) return <p style={{ color: '#64748b' }}>Loading graph…</p>;

  if (!graph || graph.nodes.length === 0) {
    return (
      <div style={styles.graphPlaceholder}>
        <p style={{ fontSize: 48, margin: 0 }}>🕸️</p>
        <p style={{ fontSize: 16, marginTop: 8 }}>No similarity connections found yet.</p>
        <p style={{ fontSize: 13 }}>Add more knowledge entries with embeddings to see the similarity graph.</p>
      </div>
    );
  }

  return (
    <div style={styles.graphPlaceholder}>
      <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Knowledge Graph</p>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
        {graph.nodes.length} nodes, {graph.edges.length} connections
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {graph.nodes.map(n => (
          <div key={n.id} style={{ background: '#334155', padding: '6px 12px', borderRadius: 16, fontSize: 13 }}>
            {n.title}
          </div>
        ))}
      </div>
      {graph.edges.length > 0 && (
        <div style={{ marginTop: 16, fontSize: 12, color: '#64748b' }}>
          <p>Top connections:</p>
          {graph.edges.slice(0, 10).map((e, i) => {
            const src = graph.nodes.find(n => n.id === e.source);
            const tgt = graph.nodes.find(n => n.id === e.target);
            return (
              <div key={i} style={{ marginBottom: 4 }}>
                {src?.title} ↔ {tgt?.title} ({(e.similarity * 100).toFixed(0)}%)
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Create Dialog ───────────────────────────────────────────────
function CreateDialog({ onClose }: { onClose: () => void }) {
  const createMut = useCreateKnowledge();
  const [form, setForm] = useState({ title: '', content: '', entryType: 'note', source: 'human', tags: '' });

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    await createMut.mutateAsync({
      title: form.title.trim(),
      content: form.content.trim(),
      entryType: form.entryType as any,
      source: form.source,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Create Knowledge Entry</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={styles.input} placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea style={styles.textarea} placeholder="Content…" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          <div style={{ display: 'flex', gap: 8 }}>
            <select style={{ ...styles.select, flex: 1 }} value={form.entryType} onChange={e => setForm({ ...form, entryType: e.target.value })}>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
            <select style={{ ...styles.select, flex: 1 }} value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
              {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <input style={styles.input} placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={{ ...styles.btn, background: '#334155', color: '#e2e8f0' }} onClick={onClose}>Cancel</button>
            <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleSubmit} disabled={createMut.isLoading}>
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
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🧠 Knowledge Base</h1>
        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => setShowCreate(true)}>+ New Entry</button>
      </div>

      <div style={styles.tabs}>
        {(['timeline', 'search', 'graph'] as const).map(tab => (
          <button
            key={tab}
            style={activeTab === tab ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'timeline' ? '📋 Timeline' : tab === 'search' ? '🔍 Search' : '🕸️ Graph'}
          </button>
        ))}
      </div>

      {activeTab === 'timeline' && <TimelineView />}
      {activeTab === 'search' && <SearchView />}
      {activeTab === 'graph' && <GraphView />}

      {showCreate && <CreateDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
