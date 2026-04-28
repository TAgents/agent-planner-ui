// Knowledge — Timeline variant
// "When did we learn it?" — chronological flow of episodes.
// Bold treatment: a vertical timeline rail with day-headings, agent attribution, and entity-extraction chips.

function KnowledgeTimeline({ theme = 'dark' }) {
  const t = useT(theme);

  const episodes = [
    { day: 'Today', items: [
      { id: 1, time: '14:32', name: 'pgvector index strategies', agent: 'researcher-β', plan: 'Query latency sprint', content: 'IVFFlat with lists=100 reduces recall but cuts query time by 60% on our dataset. HNSW gives best recall but uses 3× memory. M=16, ef_construction=64 is the sweet spot.', entities: [['pgvector','HAS_INDEX','HNSW'], ['HNSW','TRADEOFF','memory']], cross: false, conflict: false },
      { id: 2, time: '13:18', name: 'Pinecone pricing comparison', agent: 'planner-α', plan: 'Vector DB research', content: 'Pinecone p2 starter: $70/mo for 1M vectors. Scales to $0.096/hr per pod. Replication adds 2×. Estimated $1,400/mo at our scale vs. current $0 (managed PG).', entities: [['Pinecone','PRICING','$1400/mo']], cross: true, conflict: true, conflictWith: 'pgvector benchmarks (Ep #1)' },
      { id: 3, time: '11:04', name: 'SAML config — Okta', agent: 'user · Marcus', plan: 'Atlas v2.0', content: 'Tenants need separate Okta apps; ACS URL must be tenant-scoped. SP-initiated only — IdP-initiated breaks our nonce check.', entities: [['Atlas','REQUIRES','SAML 2.0'], ['Okta','SCOPE','per-tenant']], cross: false },
    ]},
    { day: 'Yesterday', items: [
      { id: 4, time: '17:55', name: 'Northwind onboarding feedback', agent: 'user · Priya', plan: 'Northwind pilot', content: 'They want SSO before any data is exposed. Pilot conditional on SAML being live by Nov 1.', entities: [['Northwind','BLOCKS_ON','SAML'], ['SAML','DEADLINE','2025-11-01']], cross: true },
      { id: 5, time: '15:22', name: 'EXPLAIN audit results', agent: 'researcher-β', plan: 'Query latency sprint', content: '14 of 47 production queries hit Seq Scan above 200ms. Top 3 are user_embedding lookups. Index suggestions: idx_user_emb_hnsw, idx_doc_emb_ivfflat.', entities: [['user_embedding','HOT_PATH','seq_scan'], ['idx_user_emb_hnsw','PROPOSED','user_embedding']], cross: false },
    ]},
    { day: 'Wed, Oct 16', items: [
      { id: 6, time: '10:12', name: 'Globex pilot — first call notes', agent: 'user · Marcus', plan: 'Globex pilot', content: 'Want pilot scoped to their EU tenant. GDPR DPA required. Decision-maker is VP Ops, not the IT contact who reached out.', entities: [['Globex','REGION','EU'], ['Globex','REQUIRES','GDPR DPA']], cross: false },
    ]},
  ];

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <AppShell theme={theme} active="know">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <KnowledgeHeader theme={theme} active="timeline" />

          {/* Toolbar */}
          <div style={{ padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${t.border}`, background: t.bg }}>
            <Mono style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Filter</Mono>
            {[
              { l: 'All', n: 473, active: true },
              { l: 'From agents', n: 312 },
              { l: 'From you', n: 148 },
              { l: 'Cross-plan', n: 18 },
              { l: 'Contradictions', n: 2, color: t.red },
            ].map((f, i) => (
              <button key={i} style={{
                padding: '4px 10px', borderRadius: 5,
                border: 'none', cursor: 'pointer',
                background: f.active ? t.text : 'transparent',
                color: f.active ? t.bg : (f.color || t.textSec),
                fontFamily: fontBody, fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                {f.l}
                <span style={{ fontFamily: fontMono, fontSize: 9, opacity: 0.7 }}>{f.n}</span>
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <Mono style={{ fontSize: 10, color: t.textMuted }}>Last 50 episodes</Mono>
          </div>

          {/* Timeline body */}
          <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px 40px' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              {episodes.map((day, di) => (
                <div key={day.day} style={{ marginBottom: 24 }}>
                  {/* Day heading */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Mono style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.text }}>
                      {day.day}
                    </Mono>
                    <div style={{ flex: 1, height: 1, background: t.border }} />
                    <Mono style={{ fontSize: 10, color: t.textMuted }}>{day.items.length}</Mono>
                  </div>

                  {day.items.map((ep, idx) => (
                    <TimelineItem key={ep.id} theme={theme} ep={ep} last={idx === day.items.length - 1} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </ArtboardFrame>
  );
}

function TimelineItem({ theme, ep, last }) {
  const t = useT(theme);
  const isUser = ep.agent.startsWith('user');

  return (
    <div style={{ display: 'flex', gap: 14, marginBottom: 14, position: 'relative' }}>
      {/* Rail */}
      <div style={{ width: 14, position: 'relative', flexShrink: 0 }}>
        <div style={{
          position: 'absolute', left: 5, top: 6, bottom: last ? 0 : -14,
          width: 1, background: t.border,
        }} />
        <div style={{
          width: 11, height: 11, borderRadius: '50%',
          background: ep.conflict ? t.red : isUser ? t.amber : t.violet,
          border: `2px solid ${t.bg}`,
          position: 'relative', zIndex: 1,
          boxShadow: ep.conflict ? `0 0 0 4px ${t.redSoft}` : 'none',
        }} />
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        background: t.surface,
        border: `1px solid ${ep.conflict ? t.red : t.border}`,
        borderRadius: 10,
        padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ fontFamily: fontDisplay, fontSize: 13.5, fontWeight: 600, color: t.text, letterSpacing: '-0.01em', flex: 1 }}>
            {ep.name}
          </div>
          {ep.cross && <Pill theme={theme} color="violet">cross-plan</Pill>}
          {ep.conflict && <Pill theme={theme} color="red">contradicts</Pill>}
          <Mono style={{ fontSize: 10, color: t.textMuted }}>{ep.time}</Mono>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 11, color: t.textMuted }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '1px 6px', borderRadius: 3,
            background: isUser ? t.amberSoft : t.violetSoft,
            color: isUser ? t.amber : t.violet,
            fontFamily: fontMono, fontSize: 9.5, fontWeight: 600,
          }}>
            {ep.agent}
          </span>
          <span style={{ color: t.borderHi }}>·</span>
          <span>{ep.plan}</span>
        </div>

        <div style={{ fontSize: 12, color: t.textSec, lineHeight: 1.55, marginBottom: 8 }}>
          {ep.content}
        </div>

        {ep.conflict && ep.conflictWith && (
          <div style={{ padding: '6px 10px', borderRadius: 6, background: t.redSoft, marginBottom: 8 }}>
            <Mono style={{ fontSize: 9.5, color: t.red, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              ⚠ contradicts: {ep.conflictWith}
            </Mono>
          </div>
        )}

        {/* Entity extractions */}
        {ep.entities && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {ep.entities.map((e, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 7px', borderRadius: 4,
                background: t.bg,
                border: `1px solid ${t.border}`,
                fontFamily: fontMono, fontSize: 9.5,
              }}>
                <span style={{ color: t.text, fontWeight: 500 }}>{e[0]}</span>
                <span style={{ color: t.textMuted }}>{e[1].toLowerCase()}</span>
                <span style={{ color: t.text, fontWeight: 500 }}>{e[2]}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { KnowledgeTimeline });
