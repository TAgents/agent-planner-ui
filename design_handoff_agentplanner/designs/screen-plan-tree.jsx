// Plan Tree screen — bold reinterpretation
// Hero metaphor: a "spine" tree where status forms a vertical EKG-like ribbon down the left,
// agent presence as live cursors, BDI coherence as a wash on each node.

function PlanTree({ theme = 'dark' }) {
  const t = useT(theme);

  const nodes = [
    { id: 1, type: 'phase', depth: 0, title: 'Atlas v2.0 — Design partner ready', status: 'in_progress', coherence: 'coherent', expanded: true, agent: null, beliefs: 12, mode: null },
    { id: 2, type: 'phase', depth: 1, title: 'Foundation: API & data model', status: 'completed', coherence: 'coherent', expanded: true, agent: null, mode: null },
    { id: 3, type: 'task', depth: 2, title: 'Define schema for plan_nodes', status: 'completed', coherence: 'coherent', mode: 'plan' },
    { id: 4, type: 'task', depth: 2, title: 'Implement /nodes CRUD endpoints', status: 'completed', coherence: 'coherent', mode: 'implement' },
    { id: 5, type: 'milestone', depth: 2, title: 'API stable for design partners', status: 'completed', coherence: 'coherent' },
    { id: 6, type: 'phase', depth: 1, title: 'Belief layer: knowledge graph integration', status: 'in_progress', coherence: 'stale_beliefs', expanded: true, agent: 'researcher-β', mode: null },
    { id: 7, type: 'task', depth: 2, title: 'Wire Graphiti → temporal facts table', status: 'in_progress', coherence: 'stale_beliefs', agent: 'researcher-β', mode: 'research', upstream: 1, comments: 3 },
    { id: 8, type: 'task', depth: 2, title: 'Detect contradictions across beliefs', status: 'in_progress', coherence: 'contradiction_detected', mode: 'plan' },
    { id: 9, type: 'task', depth: 2, title: 'Surface stale beliefs in node UI', status: 'not_started', coherence: 'unchecked', upstream: 2 },
    { id: 10, type: 'phase', depth: 1, title: 'Pilot onboarding flow', status: 'blocked', coherence: 'contradiction_detected', expanded: true, mode: null },
    { id: 11, type: 'task', depth: 2, title: 'SSO for enterprise partners', status: 'blocked', coherence: 'contradiction_detected', upstream: 1, comments: 5 },
    { id: 12, type: 'task', depth: 2, title: 'Customer X kickoff call', status: 'plan_ready', coherence: 'coherent', mode: null },
    { id: 13, type: 'milestone', depth: 1, title: '3 partners live by EOQ', status: 'not_started', coherence: 'unchecked' },
  ];

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <AppShell theme={theme} active="plans">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Plan header bar */}
          <div style={{ padding: '14px 28px 12px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.16em' }}>PLANS / ATLAS</Mono>
                <span style={{ color: t.textMuted, fontSize: 10 }}>›</span>
                <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.16em' }}>v2.0</Mono>
              </div>
              <Display style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Atlas v2.0 — Design partner ready
              </Display>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Live agent presence */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8 }}>
                <StatusDot color={t.emerald} ring ringColor={t.emerald} />
                <Mono style={{ fontSize: 10, color: t.textSec }}>researcher-β · working</Mono>
              </div>
              <SegToggle theme={theme} options={['Tree', 'Graph', 'Timeline']} active={0} />
            </div>
          </div>

          {/* Two-pane: tree + side detail */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>
            {/* Tree */}
            <div style={{ overflow: 'auto', padding: '14px 12px 14px 28px' }}>
              <TreeLegend theme={theme} />
              <div style={{ marginTop: 14 }}>
                {nodes.map((n, i) => (
                  <TreeRow key={n.id} theme={theme} n={n} selected={n.id === 7} prev={nodes[i - 1]} next={nodes[i + 1]} />
                ))}
              </div>
            </div>

            {/* Right detail panel */}
            <div style={{ borderLeft: `1px solid ${t.border}`, background: t.surface, overflow: 'auto', padding: 18 }}>
              <NodeDetail theme={theme} />
            </div>
          </div>
        </div>
      </AppShell>
    </ArtboardFrame>
  );
}

function SegToggle({ theme, options, active }) {
  const t = useT(theme);
  return (
    <div style={{ display: 'flex', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: 2 }}>
      {options.map((o, i) => (
        <button
          key={o}
          style={{
            padding: '5px 11px',
            border: 'none',
            background: i === active ? t.surfaceHi : 'transparent',
            color: i === active ? t.text : t.textSec,
            fontSize: 11,
            fontWeight: i === active ? 600 : 500,
            fontFamily: fontBody,
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function TreeLegend({ theme }) {
  const t = useT(theme);
  const items = [
    { c: t.emerald, l: 'Done' },
    { c: t.amber, l: 'In progress' },
    { c: t.red, l: 'Blocked' },
    { c: t.violet, l: 'Plan ready' },
    { c: t.slate, l: 'Not started' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 10, borderBottom: `1px solid ${t.border}` }}>
      <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.18em' }}>STATUS SPINE</Mono>
      {items.map((x) => (
        <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 3, borderRadius: 2, background: x.c }} />
          <span style={{ fontSize: 10.5, color: t.textSec }}>{x.l}</span>
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <Mono style={{ fontSize: 9.5, color: t.textMuted }}>13 nodes · 5 done · 4 in flight</Mono>
    </div>
  );
}

function TreeRow({ theme, n, selected, prev, next }) {
  const t = useT(theme);
  const statusColor = (s) =>
    s === 'completed' ? t.emerald
    : s === 'in_progress' ? t.amber
    : s === 'blocked' ? t.red
    : s === 'plan_ready' ? t.violet
    : t.slate;

  const cohWash = (c) =>
    c === 'stale_beliefs' ? `linear-gradient(90deg, ${t.amberSoft}, transparent 40%)`
    : c === 'contradiction_detected' ? `linear-gradient(90deg, ${t.redSoft}, transparent 40%)`
    : c === 'unchecked' ? 'transparent'
    : 'transparent';

  const sc = statusColor(n.status);
  const indent = n.depth * 28;
  const typeGlyph = n.type === 'phase' ? '◗' : n.type === 'milestone' ? '◆' : '·';

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        background: selected ? t.surfaceHi : 'transparent',
        borderRadius: 8,
        marginBottom: 1,
      }}
    >
      {/* Status spine — left edge */}
      <div style={{ width: 28, position: 'relative', flexShrink: 0 }}>
        {/* Vertical connector line */}
        <div style={{
          position: 'absolute',
          left: 13, top: 0, bottom: 0, width: 2,
          background: sc, opacity: n.status === 'not_started' ? 0.25 : 0.85,
        }} />
        {/* Status dot */}
        <div style={{
          position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
          width: 12, height: 12, borderRadius: '50%',
          background: t.bg, border: `2px solid ${sc}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {n.status === 'completed' && (
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: sc }} />
          )}
          {n.status === 'in_progress' && (
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc }} />
          )}
        </div>
      </div>

      {/* Row content */}
      <div style={{
        flex: 1, minWidth: 0,
        padding: '8px 12px',
        paddingLeft: indent + 8,
        display: 'flex', alignItems: 'center', gap: 10,
        background: cohWash(n.coherence),
        borderRadius: 6,
      }}>
        {/* Type glyph */}
        <span style={{
          fontFamily: fontMono, color: t.textMuted, fontSize: 13, width: 14, textAlign: 'center', flexShrink: 0,
        }}>{typeGlyph}</span>

        {/* Title */}
        <span style={{
          fontSize: n.type === 'phase' ? 13.5 : 12.5,
          fontWeight: n.type === 'phase' ? 600 : 400,
          fontFamily: n.type === 'phase' ? fontDisplay : fontBody,
          color: n.status === 'completed' ? t.textMuted : t.text,
          textDecoration: n.status === 'completed' ? 'line-through' : 'none',
          flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {n.title}
        </span>

        {/* Mode pill */}
        {n.mode && (
          <span style={{
            padding: '1px 5px', borderRadius: 4,
            fontFamily: fontMono, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em',
            background: n.mode === 'research' ? t.violetSoft : n.mode === 'plan' ? t.amberSoft : t.emeraldSoft,
            color: n.mode === 'research' ? t.violet : n.mode === 'plan' ? t.amber : t.emerald,
          }}>{n.mode === 'research' ? 'RES' : n.mode === 'plan' ? 'PLAN' : 'IMPL'}</span>
        )}

        {/* Knowledge gap (real: useGoalKnowledgeGaps surfaces these on goal screen, plan tree only echoes when present) */}
        {n.coherence === 'contradiction_detected' && (
          <span style={{ fontSize: 10, color: t.red, display: 'flex', alignItems: 'center', gap: 3 }}>
            ⚠ blocked
          </span>
        )}

        {/* Agent presence */}
        {n.agent && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: t.amber }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.amber, animation: 'pulse 2s infinite' }} />
            <Mono style={{ fontSize: 9.5 }}>{n.agent}</Mono>
          </span>
        )}

        {/* Upstream deps */}
        {n.upstream && (
          <Pill theme={theme} color="red" style={{ padding: '1px 5px', fontSize: 9 }}>↑{n.upstream}</Pill>
        )}

        {/* Comments */}
        {n.comments && (
          <Mono style={{ fontSize: 9.5, color: t.textMuted }}>◜ {n.comments}</Mono>
        )}
      </div>
    </div>
  );
}

function NodeDetail({ theme }) {
  const t = useT(theme);
  return (
    <div>
      <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.18em' }}>SELECTED NODE</Mono>
      <div style={{ marginTop: 4, marginBottom: 14 }}>
        <Display style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3, display: 'block' }}>
          Wire Graphiti → temporal facts table
        </Display>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          <Pill theme={theme} color="amber"><span style={{ width: 5, height: 5, borderRadius: '50%', background: t.amber }} /> In progress</Pill>
          <Pill theme={theme} color="violet">Research mode</Pill>
        </div>
      </div>

      {/* Tabs (real: details / comments / logs) */}
      <div style={{ marginBottom: 12, display: 'flex', gap: 14, borderBottom: `1px solid ${t.border}`, paddingBottom: 4 }}>
        {[{ k: 'details', a: true }, { k: 'comments', a: false }, { k: 'logs', a: false }].map((tab) => (
          <div key={tab.k} style={{
            fontFamily: fontMono, fontSize: 10.5, letterSpacing: '0.06em',
            paddingBottom: 6, color: tab.a ? t.text : t.textMuted,
            borderBottom: tab.a ? `1.5px solid ${t.amber}` : '1.5px solid transparent',
            marginBottom: -1,
          }}>{tab.k}</div>
        ))}
      </div>

      {/* Details — real model fields */}
      <div style={{ marginBottom: 16 }}>
        <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.18em' }}>DETAILS</Mono>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'Assignee', glyph: 'A', color: t.violet, count: 'researcher-β (agent)', sub: '14m elapsed · running' },
            { label: 'Dependencies', glyph: 'D', color: t.amber, count: '↑ 1 upstream blocking', sub: 'Define schema for plan_nodes' },
            { label: 'Knowledge gap', glyph: 'K', color: t.emerald, count: 'No knowledge linked', sub: 'flagged by useGoalKnowledgeGaps' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: t.bg, borderRadius: 7, border: `1px solid ${t.border}` }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: row.color, color: t.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: fontDisplay, fontWeight: 700, fontSize: 12,
              }}>{row.glyph}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: t.text, fontWeight: 500 }}>{row.count}</div>
                <div style={{ fontSize: 10, color: t.textMuted }}>{row.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent log — real: logs tab */}
      <div>
        <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.18em' }}>LOGS · LAST 3</Mono>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { who: 'researcher-β', t: '12m', m: 'Discovered Graphiti API rate-limits at 100 req/min — needs backoff.', kind: 'log_added' },
            { who: 'researcher-β', t: '38m', m: 'Schema mapped: temporal_facts(id, subject, predicate, object, valid_from, valid_to).', kind: 'status_change' },
            { who: 'you', t: '1h', m: 'Confirmed: facts must be invalidated, not deleted.', kind: 'comment' },
          ].map((l, i) => (
            <div key={i} style={{ fontSize: 11, lineHeight: 1.5, color: t.textSec }}>
              <Mono style={{ fontSize: 9, color: l.who === 'you' ? t.amber : t.violet }}>◆ {l.who}</Mono>
              <Mono style={{ fontSize: 9, color: t.textMuted, marginLeft: 6 }}>{l.t}</Mono>
              <span style={{ fontSize: 9, color: t.textMuted, marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l.kind}</span>
              <div style={{ color: t.text, marginTop: 2 }}>{l.m}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.PlanTree = PlanTree;
