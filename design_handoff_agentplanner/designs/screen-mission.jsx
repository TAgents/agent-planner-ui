// Mission Control Dashboard — bold reinterpretation
// Hero metaphor: a "BDI Coherence Dial" radial showing tension across all goals,
// goals as constellation cards with health pulse + sparkline of velocity.

function MissionControl({ theme = 'dark' }) {
  const t = useT(theme);

  const goals = [
    { id: 1, type: 'outcome', title: 'Ship Atlas v2.0 to design partners', progress: 68, health: 'on_track', velocity: [3,4,3,5,6,7,8], coherence: 'coherent', activity: '12m ago', pending: 0, beliefs: 47, contradictions: 0 },
    { id: 2, type: 'metric', title: 'Cut p95 query latency below 120ms', progress: 41, health: 'at_risk', velocity: [5,4,4,3,3,2,2], coherence: 'stale_beliefs', activity: '4h ago', pending: 2, beliefs: 23, contradictions: 0 },
    { id: 3, type: 'outcome', title: 'Onboard 3 enterprise pilots', progress: 22, health: 'stale', velocity: [2,3,2,1,1,0,0], coherence: 'contradiction_detected', activity: '6d ago', pending: 1, beliefs: 19, contradictions: 2 },
    { id: 4, type: 'constraint', title: 'Stay under $40k monthly infra spend', progress: 88, health: 'on_track', velocity: [6,7,6,7,8,7,8], coherence: 'coherent', activity: '34m ago', pending: 0, beliefs: 12, contradictions: 0 },
  ];

  const healthColor = (h) => h === 'on_track' ? t.emerald : h === 'at_risk' ? t.amber : t.red;
  const cohColor = (c) => c === 'coherent' ? t.emerald : c === 'stale_beliefs' ? t.amber : c === 'contradiction_detected' ? t.red : t.slate;
  const cohLabel = (c) => c === 'coherent' ? 'Coherent' : c === 'stale_beliefs' ? 'Stale beliefs' : c === 'contradiction_detected' ? 'Contradiction' : 'Unchecked';

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <AppShell theme={theme} active="mission">
        <div style={{ height: '100%', overflow: 'hidden', padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 4 }}>
                Mission Control · Acme Robotics
              </div>
              <div style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em' }}>
                Friday morning, <span style={{ color: t.amber }}>4 goals in motion</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Mono style={{ fontSize: 10.5, color: t.textMuted }}>3 agents · live</Mono>
              <StatusDot color={t.emerald} ring ringColor={t.emerald} />
            </div>
          </div>

          {/* Top row: BDI dial (hero) + ribbon */}
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18 }}>
            <BDIDial theme={theme} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Card theme={theme} pad={14}>
                <div style={{ fontFamily: fontMono, fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 10 }}>
                  Today's pulse
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                  {[
                    { v: 3, l: 'Need attention', c: t.amber },
                    { v: 4, l: 'Active goals', c: t.text },
                    { v: 11, l: 'Active plans', c: t.text },
                    { v: 24, l: 'Done this week', c: t.emerald },
                  ].map((s, i) => (
                    <div key={i}>
                      <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, color: s.c, letterSpacing: '-0.04em', lineHeight: 1 }}>
                        {s.v}
                      </div>
                      <div style={{ fontSize: 10.5, color: t.textSec, marginTop: 4 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Decisions queue (compact, top-priority feel) */}
              <Card theme={theme} pad={0} style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${t.border}` }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.amber }} />
                  <Display style={{ fontSize: 13.5, fontWeight: 600 }}>Awaiting your call</Display>
                  <Pill theme={theme} color="amber" style={{ marginLeft: 4 }}>3</Pill>
                  <div style={{ flex: 1 }} />
                  <Mono style={{ fontSize: 9.5, color: t.textMuted }}>blocking · 2</Mono>
                </div>
                <DecisionRow theme={theme} agent="planner-α" plan="Atlas v2.0" title="Switch from Postgres pgvector to dedicated vector DB?" urgency="blocking" age="14m" options={['Approve', 'Redirect']} />
                <DecisionRow theme={theme} agent="researcher-β" plan="Latency cut" title="Found 3 root causes — which to tackle first?" urgency="blocking" age="38m" options={['Pick path', 'Discuss']} />
                <DecisionRow theme={theme} agent="planner-α" plan="Pilot rollout" title="Customer X requested SAML — add to scope?" urgency="can_continue" age="2h" options={['Yes', 'Defer']} />
              </Card>
            </div>
          </div>

          {/* Goal constellation */}
          <SectionHead
            theme={theme}
            kicker="Goal Constellation"
            title="Health, beliefs, and tension at a glance"
            right={<Mono style={{ fontSize: 10, color: t.textMuted }}>sorted by tension ↓</Mono>}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {goals.map((g) => (
              <GoalConstellationCard key={g.id} theme={theme} g={g} hc={healthColor(g.health)} cc={cohColor(g.coherence)} cl={cohLabel(g.coherence)} />
            ))}
          </div>
        </div>
      </AppShell>
    </ArtboardFrame>
  );
}

function BDIDial({ theme }) {
  const t = useT(theme);
  // Three concentric arcs: Beliefs (violet), Desires (amber), Intentions (emerald)
  // Arc lengths represent coherence/coverage. Red wedge = contradiction.
  const r1 = 110, r2 = 88, r3 = 66;
  const cx = 150, cy = 150;
  const arc = (r, startAngle, endAngle, color, dash = false) => {
    const start = polar(cx, cy, r, startAngle);
    const end = polar(cx, cy, r, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return (
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
        fill="none"
        stroke={color}
        strokeWidth={dash ? 4 : 6}
        strokeLinecap="round"
        strokeDasharray={dash ? '2 4' : 'none'}
      />
    );
  };
  function polar(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <Card theme={theme} pad={16} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontFamily: fontMono, fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted }}>
          BDI Coherence
        </div>
        <ProposedChip theme={theme} />
      </div>
      <Display style={{ display: 'block', fontSize: 14, fontWeight: 600, marginTop: 2, color: t.text }}>
        Belief · Desire · Intention
      </Display>

      <svg viewBox="0 0 300 300" style={{ width: '100%', height: 240, marginTop: 6 }}>
        {/* Tracks */}
        <circle cx={cx} cy={cy} r={r1} fill="none" stroke={t.border} strokeWidth="6" />
        <circle cx={cx} cy={cy} r={r2} fill="none" stroke={t.border} strokeWidth="6" />
        <circle cx={cx} cy={cy} r={r3} fill="none" stroke={t.border} strokeWidth="6" />

        {/* B - 76% */}
        {arc(r1, 0, 274, t.violet)}
        {/* D - 92% */}
        {arc(r2, 0, 331, t.amber)}
        {/* I - 58% (with red gap = contradiction) */}
        {arc(r3, 0, 168, t.emerald)}
        {arc(r3, 168, 220, t.red, true)}

        {/* Center readout */}
        <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontFamily: fontDisplay, fontSize: 38, fontWeight: 700, fill: t.text, letterSpacing: '-0.04em' }}>
          74
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: '0.2em', fill: t.textMuted, textTransform: 'uppercase' }}>
          coherence
        </text>
        <text x={cx} y={cy + 28} textAnchor="middle" style={{ fontFamily: fontMono, fontSize: 9, fill: t.amber }}>
          ⚠ 2 contradictions
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, fontSize: 10.5 }}>
        {[
          { c: t.violet, l: 'Beliefs', v: '76%' },
          { c: t.amber, l: 'Desires', v: '92%' },
          { c: t.emerald, l: 'Intentions', v: '58%' },
        ].map((x) => (
          <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
            <span style={{ color: t.textSec }}>{x.l}</span>
            <Mono style={{ color: t.text, fontWeight: 600 }}>{x.v}</Mono>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DecisionRow({ theme, agent, plan, title, urgency, age, options }) {
  const t = useT(theme);
  const isBlocking = urgency === 'blocking';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${t.border}` }}>
      <span style={{ width: 4, height: 28, borderRadius: 2, background: isBlocking ? t.red : t.amber, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Mono style={{ fontSize: 9.5, color: t.amber }}>◆ {agent}</Mono>
          <span style={{ fontSize: 10, color: t.textMuted }}>·</span>
          <Mono style={{ fontSize: 9.5, color: t.textMuted }}>{plan}</Mono>
          <span style={{ fontSize: 10, color: t.textMuted, marginLeft: 'auto' }}>{age}</span>
        </div>
        <div style={{ fontSize: 12.5, color: t.text, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
      </div>
      <button
        style={{
          padding: '5px 11px',
          borderRadius: 7,
          background: isBlocking ? t.amber : 'transparent',
          color: isBlocking ? t.bg : t.text,
          border: isBlocking ? 'none' : `1px solid ${t.border}`,
          fontSize: 11,
          fontWeight: 600,
          fontFamily: fontBody,
          cursor: 'pointer',
        }}
      >
        {options[0]}
      </button>
    </div>
  );
}

function GoalConstellationCard({ theme, g, hc, cc, cl }) {
  const t = useT(theme);
  const typeMap = {
    outcome: { glyph: '◎', label: 'OUTCOME', color: t.amber },
    metric: { glyph: '▲', label: 'METRIC', color: t.emerald },
    constraint: { glyph: '⌬', label: 'CONSTRAINT', color: t.red },
    principle: { glyph: '◇', label: 'PRINCIPLE', color: t.violet },
  };
  const ty = typeMap[g.type];
  return (
    <Card theme={theme} pad={14}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: t.surfaceHi,
          color: ty.color, fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{ty.glyph}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Mono style={{ fontSize: 9, letterSpacing: '0.18em', color: ty.color }}>{ty.label}</Mono>
            <Pill theme={theme} color={g.coherence === 'coherent' ? 'emerald' : g.coherence === 'stale_beliefs' ? 'amber' : 'red'}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: cc, display: 'inline-block' }} />
              {cl}
            </Pill>
            {g.pending > 0 && <Pill theme={theme} color="amber">{g.pending} pending</Pill>}
          </div>
          <div style={{ fontFamily: fontDisplay, fontSize: 14.5, fontWeight: 600, lineHeight: 1.25, color: t.text }}>
            {g.title}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Spark values={g.velocity} color={hc} w={56} h={20} />
          <Mono style={{ fontSize: 9, color: t.textMuted, marginTop: 2, display: 'block' }}>7d velocity</Mono>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 4, background: t.surfaceHi, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${g.progress}%`, height: '100%', background: hc }} />
        </div>
        <Mono style={{ fontSize: 11, fontWeight: 600, color: t.text, minWidth: 32, textAlign: 'right' }}>{g.progress}%</Mono>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 10.5, color: t.textMuted }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {g.contradictions ? `${g.contradictions} contradictions` : 'no contradictions'} · {g.activity}
        </span>
        <ProposedChip theme={theme} style={{ fontSize: 8 }}>velocity</ProposedChip>
      </div>
    </Card>
  );
}

window.MissionControl = MissionControl;
