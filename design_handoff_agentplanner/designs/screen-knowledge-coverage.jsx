// Knowledge — Coverage variant
// "Do we have what we need to execute?" — per-goal, per-plan task knowledge coverage.
// Bold treatment: a vertical "knowledge readiness" bar per goal, then a tree of plans → tasks
// with a knowledge-status icon (covered / gap / contradiction / stale) and top supporting facts.

function KnowledgeCoverage({ theme = 'dark' }) {
  const t = useT(theme);

  const goal = {
    title: 'Ship Atlas v2.0 to design partners',
    coverage: 73,
    covered: 22,
    total: 30,
    gaps: 6,
    conflicts: 2,
    stale: 3,
  };

  const plans = [
    {
      id: 1, title: 'Atlas v2.0 — design partner release', coverage: 81, covered: 13, total: 16,
      tasks: [
        { id: 't1', title: 'Wire SAML config screen', status: 'covered', facts: 4, sample: 'Okta SAML 2.0 schema requires entityID + ACS URL; tenant-scoped.' },
        { id: 't2', title: 'Stand up tenant-scoped feature flags', status: 'covered', facts: 3, sample: 'LaunchDarkly project-per-tenant pattern documented in ADR-014.' },
        { id: 't3', title: 'Define data export contract', status: 'gap', facts: 0 },
        { id: 't4', title: 'Onboarding checklist for partners', status: 'stale', facts: 2, sample: 'Last updated 9d ago — pre-pricing change. Likely needs refresh.' },
      ],
    },
    {
      id: 2, title: 'Query latency reduction sprint', coverage: 56, covered: 9, total: 16,
      tasks: [
        { id: 't5', title: 'Audit current pgvector query plans', status: 'covered', facts: 6, sample: '14 queries hit seq-scan above 200ms; 3 candidate indexes from EXPLAIN.' },
        { id: 't6', title: 'Decide on vector DB replacement', status: 'conflict', facts: 5, sample: 'pgvector benchmarks (researcher-β) and Pinecone benchmarks (planner-α) disagree on p95.' },
        { id: 't7', title: 'Migration cutover plan', status: 'gap', facts: 0 },
      ],
    },
  ];

  const otherGoals = [
    { title: 'Cut p95 query latency below 120ms', cov: 58, plans: 2 },
    { title: 'Onboard 3 enterprise pilots', cov: 34, plans: 2 },
    { title: 'Stay under $40k monthly infra spend', cov: 91, plans: 1 },
  ];

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <AppShell theme={theme} active="know">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header with tabs */}
          <KnowledgeHeader theme={theme} active="coverage" />

          {/* Body */}
          <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>

              {/* Goal selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <Mono style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted }}>Coverage for goal</Mono>
                <div style={{
                  padding: '6px 12px', borderRadius: 6,
                  background: t.surface, border: `1px solid ${t.border}`,
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.violet }} />
                  <span style={{ fontFamily: fontDisplay, fontSize: 13, fontWeight: 600, color: t.text }}>{goal.title}</span>
                  <span style={{ color: t.textMuted, fontSize: 10 }}>▾</span>
                </div>
              </div>

              {/* Hero — coverage gauge */}
              <Card theme={theme} pad={20} style={{ marginBottom: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, alignItems: 'center' }}>
                  <CoverageGauge theme={theme} pct={goal.coverage} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                      <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: '-0.02em' }}>
                        {goal.covered} of {goal.total} tasks
                      </div>
                      <div style={{ fontSize: 13, color: t.textSec }}>have supporting knowledge</div>
                    </div>
                    <div style={{ display: 'flex', gap: 22 }}>
                      <CoverageStat theme={theme} v={goal.covered} l="covered" c={t.emerald} />
                      <CoverageStat theme={theme} v={goal.gaps} l="knowledge gaps" c={t.amber} />
                      <CoverageStat theme={theme} v={goal.conflicts} l="contradictions" c={t.red} />
                      <CoverageStat theme={theme} v={goal.stale} l="stale facts" c={t.violet} />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Plans → tasks */}
              <SectionHead theme={theme} kicker="◆ Per-plan breakdown" title="Where is knowledge missing?" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plans.map((p) => <CoveragePlanCard key={p.id} theme={theme} plan={p} />)}
              </div>

              {/* Other goals — sparkline footer */}
              <div style={{ marginTop: 28 }}>
                <SectionHead theme={theme} kicker="◆ Other goals" title="Coverage at a glance" />
                <Card theme={theme} pad={0} style={{ overflow: 'hidden' }}>
                  {otherGoals.map((g, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 16px',
                      borderBottom: i < otherGoals.length - 1 ? `1px solid ${t.border}` : 'none',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.violet }} />
                      <div style={{ flex: 1, fontFamily: fontDisplay, fontSize: 13, fontWeight: 600, color: t.text, letterSpacing: '-0.01em' }}>{g.title}</div>
                      <div style={{ width: 200, height: 4, background: t.surfaceHi, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${g.cov}%`, height: '100%', background: g.cov >= 70 ? t.emerald : g.cov >= 40 ? t.amber : t.red }} />
                      </div>
                      <Mono style={{ fontSize: 10, color: t.textSec, width: 36, textAlign: 'right' }}>{g.cov}%</Mono>
                      <Mono style={{ fontSize: 10, color: t.textMuted, width: 56, textAlign: 'right' }}>{g.plans} plan{g.plans > 1 ? 's' : ''}</Mono>
                    </div>
                  ))}
                </Card>
              </div>

            </div>
          </div>
        </div>
      </AppShell>
    </ArtboardFrame>
  );
}

function CoverageGauge({ theme, pct }) {
  const t = useT(theme);
  const r = 64;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  const color = pct >= 70 ? t.emerald : pct >= 40 ? t.amber : t.red;
  return (
    <div style={{ width: 160, height: 160, position: 'relative' }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke={t.surfaceHi} strokeWidth="10" />
        <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 80 80)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: fontDisplay, fontSize: 38, fontWeight: 700, color: t.text, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {pct}<span style={{ fontSize: 18, color: t.textMuted }}>%</span>
        </div>
        <Mono style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.textMuted, marginTop: 4 }}>
          knowledge ready
        </Mono>
      </div>
    </div>
  );
}

function CoverageStat({ theme, v, l, c }) {
  const t = useT(theme);
  return (
    <div>
      <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, color: c, letterSpacing: '-0.03em', lineHeight: 1 }}>{v}</div>
      <div style={{ fontSize: 10.5, color: t.textSec, marginTop: 3 }}>{l}</div>
    </div>
  );
}

function CoveragePlanCard({ theme, plan }) {
  const t = useT(theme);

  const iconFor = (s) => {
    if (s === 'covered') return { glyph: '✓', c: t.emerald };
    if (s === 'gap') return { glyph: '○', c: t.amber };
    if (s === 'conflict') return { glyph: '✕', c: t.red };
    if (s === 'stale') return { glyph: '◐', c: t.violet };
    return { glyph: '·', c: t.textMuted };
  };

  return (
    <Card theme={theme} pad={0} style={{ overflow: 'hidden' }}>
      <div style={{
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: `1px solid ${t.border}`,
      }}>
        <span style={{ color: t.textMuted, fontSize: 10 }}>▾</span>
        <div style={{ flex: 1, fontFamily: fontDisplay, fontSize: 14, fontWeight: 600, color: t.text, letterSpacing: '-0.01em' }}>
          {plan.title}
        </div>
        <Mono style={{ fontSize: 11, color: t.textMuted }}>{plan.covered}/{plan.total}</Mono>
        <div style={{ width: 100, height: 4, background: t.surfaceHi, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${plan.coverage}%`, height: '100%', background: plan.coverage >= 70 ? t.emerald : plan.coverage >= 40 ? t.amber : t.red }} />
        </div>
        <div style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 700, color: plan.coverage >= 70 ? t.emerald : plan.coverage >= 40 ? t.amber : t.red, letterSpacing: '-0.02em', width: 44, textAlign: 'right' }}>
          {plan.coverage}%
        </div>
      </div>

      {plan.tasks.map((task, idx) => {
        const ico = iconFor(task.status);
        return (
          <div key={task.id} style={{
            padding: '10px 18px 10px 36px',
            borderBottom: idx < plan.tasks.length - 1 ? `1px solid ${t.border}` : 'none',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: ico.c + '22',
                color: ico.c,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, fontFamily: fontMono, flexShrink: 0,
              }}>{ico.glyph}</span>
              <div style={{ flex: 1, fontSize: 12.5, color: t.text }}>{task.title}</div>
              {task.status === 'covered' && <Mono style={{ fontSize: 10, color: t.textMuted }}>{task.facts} facts</Mono>}
              {task.status === 'gap' && <Pill theme={theme} color="amber">no facts</Pill>}
              {task.status === 'conflict' && <Pill theme={theme} color="red">contradiction</Pill>}
              {task.status === 'stale' && <Pill theme={theme} color="violet">stale · 9d</Pill>}
            </div>
            {task.sample && (
              <div style={{
                fontSize: 11, color: t.textSec, lineHeight: 1.4,
                paddingLeft: 28, fontStyle: task.status === 'stale' ? 'italic' : 'normal',
              }}>
                <span style={{ color: t.textMuted, fontFamily: fontMono, fontSize: 9.5 }}>fact ·</span> {task.sample}
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}

function KnowledgeHeader({ theme, active }) {
  const t = useT(theme);
  const tabs = [
    { id: 'coverage', label: 'Coverage', desc: 'Do we have what we need?' },
    { id: 'timeline', label: 'Timeline', desc: 'When did we learn it?' },
    { id: 'graph', label: 'Graph', desc: 'How is it connected?' },
  ];
  return (
    <div style={{ borderBottom: `1px solid ${t.border}`, background: t.surface, padding: '18px 32px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 4 }}>
            ◇ Knowledge · what the agents know
          </div>
          <div style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>
            {active === 'coverage' && <>473 facts · <span style={{ color: t.amber }}>11 gaps</span> · 2 contradictions</>}
            {active === 'timeline' && <>473 episodes · <span style={{ color: t.amber }}>34 added today</span></>}
            {active === 'graph' && <>92 entities · <span style={{ color: t.amber }}>18 cross-plan</span></>}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 6,
          border: `1px solid ${t.border}`, background: t.bg,
          width: 200,
        }}>
          <span style={{ color: t.textMuted, fontSize: 12 }}>⌕</span>
          <span style={{ color: t.textMuted, fontSize: 11 }}>Search beliefs…</span>
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, paddingBottom: 0 }}>
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <div key={tab.id} style={{
              padding: '10px 18px 12px',
              borderBottom: isActive ? `2px solid ${t.amber}` : `2px solid transparent`,
              cursor: 'pointer',
              marginBottom: -1,
            }}>
              <div style={{ fontFamily: fontDisplay, fontSize: 13, fontWeight: 600, color: isActive ? t.text : t.textSec, letterSpacing: '-0.01em' }}>
                {tab.label}
              </div>
              <div style={{ fontSize: 10, color: t.textMuted, marginTop: 1 }}>{tab.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { KnowledgeCoverage, KnowledgeHeader });
