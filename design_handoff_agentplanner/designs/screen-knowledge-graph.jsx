// Knowledge — Graph variant
// "How is it connected?" — entities and facts as a graph.
// Bold treatment: a custom positioned graph (no React Flow needed for static design),
// with cross-plan entities highlighted in amber, plus a side panel with entity inspector.

function KnowledgeGraph({ theme = 'dark' }) {
  const t = useT(theme);

  // Hand-positioned nodes — simulates force-directed layout
  const nodes = [
    { id: 'atlas', label: 'Atlas v2.0', type: 'project', x: 320, y: 180, r: 28, cross: true },
    { id: 'saml', label: 'SAML 2.0', type: 'protocol', x: 180, y: 90, r: 22 },
    { id: 'okta', label: 'Okta', type: 'vendor', x: 80, y: 170, r: 20 },
    { id: 'tenant', label: 'Tenant', type: 'concept', x: 200, y: 250, r: 22, cross: true },
    { id: 'pgvector', label: 'pgvector', type: 'tech', x: 480, y: 90, r: 24, cross: true },
    { id: 'pinecone', label: 'Pinecone', type: 'vendor', x: 600, y: 170, r: 22, cross: true },
    { id: 'hnsw', label: 'HNSW', type: 'algo', x: 540, y: 50, r: 18 },
    { id: 'ivfflat', label: 'IVFFlat', type: 'algo', x: 580, y: 250, r: 18 },
    { id: 'latency', label: 'p95 latency', type: 'metric', x: 440, y: 320, r: 22, cross: true },
    { id: 'northwind', label: 'Northwind', type: 'partner', x: 80, y: 350, r: 22 },
    { id: 'globex', label: 'Globex', type: 'partner', x: 240, y: 410, r: 20 },
    { id: 'gdpr', label: 'GDPR', type: 'compliance', x: 380, y: 470, r: 18 },
    { id: 'q4', label: 'Q4 release', type: 'milestone', x: 320, y: 80, r: 18 },
  ];

  const edges = [
    { from: 'atlas', to: 'saml', label: 'requires' },
    { from: 'atlas', to: 'q4', label: 'targets' },
    { from: 'atlas', to: 'tenant', label: 'scoped by' },
    { from: 'saml', to: 'okta', label: 'via' },
    { from: 'saml', to: 'tenant', label: 'per' },
    { from: 'pgvector', to: 'hnsw', label: 'has index' },
    { from: 'pgvector', to: 'ivfflat', label: 'has index' },
    { from: 'pgvector', to: 'latency', label: 'affects' },
    { from: 'pinecone', to: 'latency', label: 'alternative' },
    { from: 'pinecone', to: 'pgvector', label: 'replaces?', conflict: true },
    { from: 'northwind', to: 'saml', label: 'blocks on' },
    { from: 'northwind', to: 'atlas', label: 'pilots' },
    { from: 'globex', to: 'gdpr', label: 'requires' },
    { from: 'globex', to: 'atlas', label: 'pilots' },
    { from: 'atlas', to: 'pgvector', label: 'depends on' },
  ];

  const selectedId = 'pgvector';
  const selected = nodes.find((n) => n.id === selectedId);

  const W = 700, H = 540;

  const typeColor = {
    project: t.amber, protocol: t.violet, vendor: t.text, concept: t.textSec,
    tech: t.violet, algo: t.textMuted, metric: t.amber, partner: t.emerald,
    compliance: t.red, milestone: t.text,
  };

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <AppShell theme={theme} active="know">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <KnowledgeHeader theme={theme} active="graph" />

          {/* Toolbar */}
          <div style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${t.border}`, background: t.bg }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 12px', borderRadius: 6,
              border: `1px solid ${t.border}`, background: t.surface,
              flex: 1, maxWidth: 360,
            }}>
              <span style={{ color: t.textMuted, fontSize: 12 }}>⌕</span>
              <span style={{ color: t.text, fontSize: 12, fontFamily: fontBody }}>vector database performance</span>
            </div>
            <button style={{
              padding: '5px 12px', borderRadius: 6,
              background: t.text, color: t.bg, border: 'none', cursor: 'pointer',
              fontFamily: fontDisplay, fontSize: 11.5, fontWeight: 600,
            }}>Search</button>
            <Mono style={{ fontSize: 10, color: t.textSec, marginLeft: 6 }}>
              13 entities · 15 facts · <span style={{ color: t.amber }}>5 cross-plan</span>
            </Mono>
            <div style={{ flex: 1 }} />
            <Mono style={{ fontSize: 10, color: t.textMuted }}>Layout: force-directed ▾</Mono>
          </div>

          {/* Graph + Inspector */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 0 }}>

            {/* Canvas */}
            <div style={{ position: 'relative', overflow: 'hidden', background: t.bg }}>
              {/* Dot grid */}
              <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <pattern id={`dots-${theme}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill={t.border} />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#dots-${theme})`} opacity="0.5" />
              </svg>

              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
                  {/* Edges */}
                  {edges.map((e, i) => {
                    const a = nodes.find((n) => n.id === e.from);
                    const b = nodes.find((n) => n.id === e.to);
                    if (!a || !b) return null;
                    const isSel = e.from === selectedId || e.to === selectedId;
                    const stroke = e.conflict ? t.red : isSel ? t.text : t.border;
                    const strokeWidth = e.conflict ? 1.6 : isSel ? 1.4 : 1;
                    // Mid for label
                    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
                    return (
                      <g key={i}>
                        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                          stroke={stroke} strokeWidth={strokeWidth}
                          strokeDasharray={e.conflict ? '4 3' : 'none'}
                          opacity={isSel || e.conflict ? 1 : 0.55} />
                        {(isSel || e.conflict) && (
                          <text x={mx} y={my - 4} textAnchor="middle"
                            fill={e.conflict ? t.red : t.textSec}
                            style={{ fontFamily: fontMono, fontSize: 8.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            {e.label}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map((n) => {
                    const isSel = n.id === selectedId;
                    const fg = typeColor[n.type] || t.text;
                    return (
                      <g key={n.id}>
                        {n.cross && (
                          <circle cx={n.x} cy={n.y} r={n.r + 6}
                            fill="none" stroke={t.amber} strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
                        )}
                        <circle cx={n.x} cy={n.y} r={n.r}
                          fill={isSel ? t.text : t.surface}
                          stroke={isSel ? t.amber : (n.cross ? t.amber : t.borderHi)}
                          strokeWidth={isSel ? 2.5 : 1.4} />
                        <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                          fill={isSel ? t.bg : fg}
                          style={{ fontFamily: fontDisplay, fontSize: 11, fontWeight: 600, letterSpacing: '-0.01em' }}>
                          {n.label}
                        </text>
                        <text x={n.x} y={n.y + n.r + 12} textAnchor="middle"
                          fill={t.textMuted}
                          style={{ fontFamily: fontMono, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {n.type}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Legend */}
              <div style={{
                position: 'absolute', bottom: 16, left: 16,
                background: t.surface, border: `1px solid ${t.border}`,
                borderRadius: 8, padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: 14,
                fontSize: 10, color: t.textSec,
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', border: `1.5px solid ${t.borderHi}`, background: t.surface }} /> Entity
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px dashed ${t.amber}`, background: 'transparent' }} /> Cross-plan
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 18, height: 1.5, background: t.red, borderRadius: 1 }} /> Contradiction
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 18, height: 1, background: t.borderHi }} /> Fact
                </span>
              </div>

              {/* Mini-map / zoom */}
              <div style={{
                position: 'absolute', bottom: 16, right: 16,
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                {['+', '−', '⊡'].map((s, i) => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: t.surface, border: `1px solid ${t.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: fontMono, fontSize: 13, color: t.textSec,
                  }}>{s}</div>
                ))}
              </div>
            </div>

            {/* Inspector */}
            <div style={{
              borderLeft: `1px solid ${t.border}`,
              background: t.surface,
              overflow: 'auto',
              padding: 18,
            }}>
              <div style={{ marginBottom: 14 }}>
                <Mono style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted }}>
                  ◆ Entity
                </Mono>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: t.amber, boxShadow: `0 0 0 3px ${t.amberSoft}`,
                }} />
                <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: t.text }}>
                  {selected.label}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <Pill theme={theme} color="violet">{selected.type}</Pill>
                <Pill theme={theme} color="amber">cross-plan</Pill>
              </div>

              <div style={{ fontSize: 11.5, color: t.textSec, lineHeight: 1.5, marginBottom: 18 }}>
                Postgres extension providing approximate-nearest-neighbor search via vector embeddings. Currently powers all semantic search in Atlas. Subject of an active migration evaluation.
              </div>

              {/* Connections */}
              <Mono style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 8 }}>
                ◆ Connections · 5
              </Mono>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                {[
                  { rel: 'has index', target: 'HNSW' },
                  { rel: 'has index', target: 'IVFFlat' },
                  { rel: 'affects', target: 'p95 latency', highlight: true },
                  { rel: 'depended on by', target: 'Atlas v2.0' },
                  { rel: 'replaces?', target: 'Pinecone', conflict: true },
                ].map((c, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px',
                    background: c.conflict ? t.redSoft : t.bg,
                    border: `1px solid ${c.conflict ? t.red : t.border}`,
                    borderRadius: 6,
                  }}>
                    <Mono style={{ fontSize: 9.5, color: c.conflict ? t.red : t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', flex: 1 }}>
                      {c.rel}
                    </Mono>
                    <span style={{ fontFamily: fontDisplay, fontSize: 12, fontWeight: 600, color: c.conflict ? t.red : t.text, letterSpacing: '-0.01em' }}>
                      {c.target}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recent facts */}
              <Mono style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 8 }}>
                ◆ Recent facts · 6
              </Mono>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { fact: 'IVFFlat with lists=100 cuts query time by 60% with acceptable recall loss.', source: 'researcher-β · today 14:32' },
                  { fact: 'HNSW gives best recall but uses 3× memory; M=16 ef=64 is sweet spot.', source: 'researcher-β · today 14:32' },
                  { fact: '14 production queries hit Seq Scan above 200ms — top 3 are user_embedding lookups.', source: 'researcher-β · yesterday' },
                ].map((f, i) => (
                  <div key={i} style={{
                    padding: '8px 10px', background: t.bg,
                    border: `1px solid ${t.border}`, borderRadius: 6,
                  }}>
                    <div style={{ fontSize: 11, color: t.textSec, lineHeight: 1.45, marginBottom: 4 }}>{f.fact}</div>
                    <Mono style={{ fontSize: 9, color: t.textMuted }}>{f.source}</Mono>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ArtboardFrame>
  );
}

Object.assign(window, { KnowledgeGraph });
