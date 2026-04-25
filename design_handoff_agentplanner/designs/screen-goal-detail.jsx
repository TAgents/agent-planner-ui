// Goal Detail — bold reinterpretation
// Hero metaphor: Goal Compass — three orbiting rings (Beliefs · Desires · Intentions)
// with a central goal core, plus a horizontal "subway line" critical path.

function GoalDetail({ theme = 'dark' }) {
  const t = useT(theme);

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <AppShell theme={theme} active="goals">
        <div style={{ height: '100%', overflow: 'auto', padding: '20px 28px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.16em' }}>GOALS</Mono>
            <span style={{ color: t.textMuted, fontSize: 10 }}>›</span>
            <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.16em' }}>OUTCOME</Mono>
          </div>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 22 }}>
            <div style={{ flex: 1 }}>
              <Display style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Cut p95 query latency below 120ms
              </Display>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <Pill theme={theme} color="emerald">▲ Metric</Pill>
                <Pill theme={theme} color="amber">
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.amber }} /> At risk
                </Pill>
                <span style={{ fontSize: 10.5, color: t.textMuted }}>created by Maya S · 12 days ago</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '7px 14px', background: 'transparent', color: t.text, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 11.5, fontWeight: 500, fontFamily: fontBody }}>Edit</button>
              <button style={{ padding: '7px 14px', background: t.amber, color: t.bg, border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 600, fontFamily: fontBody }}>Link plan</button>
            </div>
          </div>

          {/* Hero: Compass + key stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 18, marginBottom: 22 }}>
            <Compass theme={theme} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Score + progress */}
              <Card theme={theme} pad={16}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
                  <div>
                    <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.18em' }}>QUALITY SCORE</Mono>
                    <div style={{ fontFamily: fontDisplay, fontSize: 42, fontWeight: 700, color: t.text, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      72<span style={{ fontSize: 18, color: t.textMuted, fontWeight: 400 }}>/100</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.18em' }}>PROGRESS</Mono>
                      <Mono style={{ fontSize: 12, color: t.text, fontWeight: 600 }}>41%</Mono>
                    </div>
                    <div style={{ height: 6, background: t.surfaceHi, borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ width: '41%', height: '100%', background: t.amber }} />
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 10.5 }}>
                      <span style={{ color: t.emerald }}>● 7 done</span>
                      <span style={{ color: t.amber }}>● 4 in flight</span>
                      <span style={{ color: t.red }}>● 2 blocked</span>
                      <span style={{ color: t.textMuted }}>● 4 waiting</span>
                    </div>
                  </div>
                </div>
                <div style={{ paddingTop: 10, borderTop: `1px solid ${t.border}`, fontSize: 11, color: t.textSec, lineHeight: 1.6 }}>
                  <span style={{ color: t.text, fontWeight: 600 }}>Why 72?</span>{' '}
                  Specific & measurable, but constraint on infra cost not yet expressed as a sub-goal.
                </div>
              </Card>

              {/* Tension hotspots */}
              <Card theme={theme} pad={14}>
                <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.18em' }}>TENSION HOTSPOTS</Mono>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { kind: 'contradiction', text: 'pgvector benchmark says 87ms · partner X measured 340ms', sev: t.red },
                    { kind: 'stale', text: '"Read replicas not used in prod" — verified 8 days ago', sev: t.amber },
                    { kind: 'gap', text: 'No belief recorded about target customer query patterns', sev: t.violet },
                  ].map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: t.bg, borderRadius: 7 }}>
                      <span style={{ width: 4, height: 26, borderRadius: 2, background: h.sev, flexShrink: 0 }} />
                      <Mono style={{ fontSize: 8.5, color: h.sev, letterSpacing: '0.14em', width: 80, flexShrink: 0 }}>
                        {h.kind.toUpperCase()}
                      </Mono>
                      <span style={{ fontSize: 11.5, color: t.text, flex: 1 }}>{h.text}</span>
                      <span style={{ fontSize: 10, color: t.textMuted }}>resolve →</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Critical path subway */}
          <SectionHead theme={theme} kicker="Critical Path" title="Subway line to the goal" right={<Mono style={{ fontSize: 10, color: t.textMuted }}>5 stops · 2 blocked</Mono>} />
          <Card theme={theme} pad={20} style={{ marginBottom: 22 }}>
            <Subway theme={theme} />
          </Card>

          {/* Tabs (real: Overview / Tasks & Dependencies / Evaluations — 'Beliefs' is a proposed expansion of briefing.knowledge) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${t.border}`, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 18, flex: 1 }}>
              {['Overview', 'Tasks & dependencies', 'Beliefs', 'Evaluations'].map((tab, i) => (
                <div key={tab} style={{
                  padding: '8px 0', fontSize: 12.5, fontWeight: i === 1 ? 600 : 400,
                  color: i === 1 ? t.text : t.textSec,
                  borderBottom: i === 1 ? `2px solid ${t.amber}` : '2px solid transparent',
                  marginBottom: -1,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  {tab}
                  {tab === 'Beliefs' && <ProposedChip theme={theme} style={{ fontSize: 7.5, padding: '1px 4px' }}>new</ProposedChip>}
                </div>
              ))}
            </div>
          </div>

          {/* Task list */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { d: 'Direct achievers', items: [
                { t: 'Profile slow queries with pg_stat', s: 'in_progress', a: 'researcher-β' },
                { t: 'Add index on event_log(timestamp)', s: 'completed' },
              ]},
              { d: 'Depth 2 (upstream)', items: [
                { t: 'Switch to dedicated vector DB', s: 'blocked', a: 'planner-α', b: true },
                { t: 'Cache frequent dashboard queries', s: 'plan_ready' },
              ]},
              { d: 'Depth 3 (upstream)', items: [
                { t: 'Capacity plan: read replicas', s: 'not_started' },
                { t: 'Document target query SLA', s: 'not_started' },
              ]},
            ].map((col, i) => (
              <div key={i}>
                <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.16em', marginBottom: 8, display: 'block' }}>
                  {col.d.toUpperCase()}
                </Mono>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {col.items.map((it, j) => {
                    const sc = it.s === 'completed' ? t.emerald : it.s === 'in_progress' ? t.amber : it.s === 'blocked' ? t.red : it.s === 'plan_ready' ? t.violet : t.slate;
                    return (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 11px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc, marginTop: 5, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: t.text, lineHeight: 1.35, textDecoration: it.s === 'completed' ? 'line-through' : 'none' }}>{it.t}</div>
                          {it.a && <Mono style={{ fontSize: 9, color: t.amber, marginTop: 3, display: 'block' }}>◆ {it.a}</Mono>}
                          {it.b && <Mono style={{ fontSize: 9, color: t.red, marginTop: 3, display: 'block' }}>blocked by 1</Mono>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </ArtboardFrame>
  );
}

function Compass({ theme }) {
  const t = useT(theme);
  const cx = 200, cy = 200;
  // Three rings: Beliefs (outer), Desires (mid), Intentions (inner)
  // Markers: small dots positioned by topic
  const ringData = [
    { r: 150, c: t.violet, label: 'BELIEFS', n: 23, marks: [12, 65, 110, 168, 210, 270, 320] },
    { r: 110, c: t.amber, label: 'DESIRES', n: 4, marks: [40, 130, 200, 290] },
    { r: 70, c: t.emerald, label: 'INTENTIONS', n: 13, marks: [20, 70, 140, 180, 240, 305] },
  ];
  function polar(r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  return (
    <Card theme={theme} pad={16} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.18em' }}>GOAL COMPASS</Mono>
          <ProposedChip theme={theme} />
        </div>
        <Mono style={{ fontSize: 9.5, color: t.amber }}>2 stale · 1 contradiction</Mono>
      </div>
      <svg viewBox="0 0 400 400" style={{ width: '100%', height: 340 }}>
        {/* Cross-hairs */}
        <line x1={cx - 170} y1={cy} x2={cx + 170} y2={cy} stroke={t.border} strokeDasharray="2 4" />
        <line x1={cx} y1={cy - 170} x2={cx} y2={cy + 170} stroke={t.border} strokeDasharray="2 4" />

        {ringData.map((r, i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r.r} fill="none" stroke={r.c} strokeOpacity="0.25" strokeWidth="1" />
            {r.marks.map((deg, j) => {
              const p = polar(r.r, deg);
              const isStale = i === 0 && (j === 1 || j === 4);
              const isContra = i === 0 && j === 2;
              return (
                <circle
                  key={j}
                  cx={p.x}
                  cy={p.y}
                  r={isContra ? 5.5 : 4}
                  fill={isContra ? t.red : isStale ? t.amber : r.c}
                  stroke={t.surface}
                  strokeWidth="2"
                />
              );
            })}
            {/* Ring label */}
            <text
              x={cx + r.r + 6}
              y={cy + 3}
              style={{ fontFamily: fontMono, fontSize: 8.5, fill: r.c, letterSpacing: '0.18em' }}
            >
              {r.label}
            </text>
          </g>
        ))}

        {/* Center: goal core */}
        <circle cx={cx} cy={cy} r={32} fill={t.bg} stroke={t.amber} strokeWidth="2" />
        <text x={cx} y={cy - 2} textAnchor="middle" style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, fill: t.text, letterSpacing: '-0.04em' }}>
          120
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontFamily: fontMono, fontSize: 8, fill: t.textMuted, letterSpacing: '0.2em' }}>
          MS p95
        </text>

        {/* Tension lines: contradiction */}
        <line
          x1={polar(150, 110).x} y1={polar(150, 110).y}
          x2={polar(110, 130).x} y2={polar(110, 130).y}
          stroke={t.red} strokeWidth="1.5" strokeDasharray="3 3"
        />
      </svg>

      {/* Legend stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
        {ringData.map((r) => (
          <div key={r.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, color: r.c, lineHeight: 1 }}>{r.n}</div>
            <Mono style={{ fontSize: 8.5, color: t.textMuted, letterSpacing: '0.16em' }}>{r.label}</Mono>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Subway({ theme }) {
  const t = useT(theme);
  const stops = [
    { t: 'Define query SLA', s: 'completed', node: '#142' },
    { t: 'Profile slow queries', s: 'in_progress', node: '#198' },
    { t: 'Switch to vector DB', s: 'blocked', node: '#211' },
    { t: 'Cache hot reads', s: 'plan_ready', node: '#212' },
    { t: 'Hit 120ms p95', s: 'not_started', node: 'goal' },
  ];
  const sc = (s) => s === 'completed' ? t.emerald : s === 'in_progress' ? t.amber : s === 'blocked' ? t.red : s === 'plan_ready' ? t.violet : t.slate;
  return (
    <div style={{ position: 'relative', padding: '14px 0 6px' }}>
      <div style={{ position: 'absolute', left: 24, right: 24, top: 36, height: 4, background: t.surfaceHi, borderRadius: 2 }} />
      <div style={{ position: 'absolute', left: 24, top: 36, height: 4, width: 'calc((100% - 48px) * 0.35)', background: t.amber, borderRadius: 2 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        {stops.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: t.bg, border: `3px solid ${sc(s.s)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 8, zIndex: 1,
              boxShadow: i === 1 ? `0 0 0 6px ${t.amberSoft}` : 'none',
            }}>
              {s.s === 'completed' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc(s.s) }} />}
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: t.text, textAlign: 'center', maxWidth: 120, lineHeight: 1.3 }}>{s.t}</div>
            <Mono style={{ fontSize: 9, color: t.textMuted, marginTop: 4 }}>{s.node}</Mono>
          </div>
        ))}
      </div>
    </div>
  );
}

window.GoalDetail = GoalDetail;
