// Portfolio / Strategic Overview — cross-plan view organized by attention bucket
// Real model: plans bucketed Finish Line / Needs Input / Stale + suggested Next Up tasks.
// Bold treatment: a horizontal "attention spectrum" header that maps the buckets onto a heatline.

function Portfolio({ theme = 'dark' }) {
  const t = useT(theme);

  const nextUp = [
    { i: 1, title: 'Audit current pgvector query plans', plan: 'Query latency sprint', mode: 'research', unblocks: 4 },
    { i: 2, title: 'Draft pilot SLA template', plan: 'Northwind pilot', mode: 'plan', unblocks: 3 },
    { i: 3, title: 'Wire SAML config screen', plan: 'Atlas v2.0', mode: 'execute', unblocks: 2 },
    { i: 4, title: 'Run latency profile against staging', plan: 'Query latency sprint', mode: 'execute', unblocks: 1 },
    { i: 5, title: 'Spec migration cutover plan', plan: 'Vector DB research', mode: 'plan', unblocks: 1 },
  ];

  const finishLine = [
    { title: 'Auth & SSO foundation', goal: 'Atlas v2.0', progress: 100, label: '16/16 done' },
    { title: 'Infra cost watch — Q4', goal: 'Stay under $40k/mo', progress: 75, label: '9/12 done' },
    { title: 'Atlas v2.0 — design partner release', goal: 'Atlas v2.0', progress: 67, label: '14/24 done' },
  ];

  const needsInput = [
    { title: 'Query latency reduction sprint', goal: 'Cut p95', progress: 35, since: '4h ago', issue: '2 decisions pending' },
    { title: 'Enterprise pilot — Globex', goal: 'Onboard 3 pilots', progress: 11, since: '2d ago', issue: 'agent waiting on you' },
  ];

  const stale = [
    { title: 'Enterprise pilot — Northwind', goal: 'Onboard 3 pilots', progress: 22, days: 6 },
    { title: 'Vector DB migration — research', goal: 'Cut p95', progress: 0, days: 9 },
  ];

  const goalAlignment = [
    { title: 'Ship Atlas v2.0 to design partners', plans: 2, progress: 68, health: 'on_track' },
    { title: 'Cut p95 query latency below 120ms', plans: 2, progress: 41, health: 'at_risk' },
    { title: 'Onboard 3 enterprise pilots', plans: 2, progress: 22, health: 'stale' },
    { title: 'Stay under $40k monthly infra spend', plans: 1, progress: 88, health: 'on_track' },
  ];

  const healthMap = { on_track: t.emerald, at_risk: t.amber, stale: t.red };

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <AppShell theme={theme} active="plans">
        <div style={{ height: '100%', overflow: 'auto' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 32px 40px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 4 }}>
                  ◇ Strategic overview
                </div>
                <div style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em' }}>
                  Where to <span style={{ color: t.amber }}>spend the next hour</span>
                </div>
                <div style={{ fontSize: 12, color: t.textSec, marginTop: 4 }}>
                  7 plans across 4 goals · Friday, October 18
                </div>
              </div>
            </div>

            {/* Attention spectrum */}
            <AttentionSpectrum theme={theme} />

            {/* Next up */}
            <div style={{ marginTop: 24 }}>
              <SectionHead theme={theme} kicker="◆ Next up" title="Suggested by your agents" right={<Mono style={{ fontSize: 10, color: t.textMuted }}>top 5 of 23</Mono>} />
              <Card theme={theme} pad={0} style={{ overflow: 'hidden' }}>
                {nextUp.map((task, idx) => (
                  <div key={task.i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px',
                    borderBottom: idx < nextUp.length - 1 ? `1px solid ${t.border}` : 'none',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: idx === 0 ? t.amberSoft : t.surfaceHi,
                      color: idx === 0 ? t.amber : t.textMuted,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: fontMono, fontSize: 10, fontWeight: 700,
                      flexShrink: 0,
                    }}>{task.i}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: fontDisplay, fontSize: 13.5, fontWeight: 600, color: t.text, letterSpacing: '-0.01em' }}>
                        {task.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, fontSize: 11, color: t.textMuted }}>
                        <span>{task.plan}</span>
                        <span style={{ color: t.borderHi }}>·</span>
                        <Mono style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 3,
                          background: task.mode === 'research' ? 'rgba(138,124,184,0.15)' : task.mode === 'plan' ? 'rgba(91,168,154,0.15)' : 'rgba(212,162,78,0.15)',
                          color: task.mode === 'research' ? t.violet : task.mode === 'plan' ? t.emerald : t.amber,
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                        }}>{task.mode}</Mono>
                        {task.unblocks > 0 && <span>unblocks {task.unblocks}</span>}
                      </div>
                    </div>
                    <span style={{ color: t.textMuted, fontSize: 14 }}>→</span>
                  </div>
                ))}
              </Card>
            </div>

            {/* Two-col: Finish line + Needs input */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 24 }}>
              <div>
                <SectionHead theme={theme} kicker="◆ Finish line" title="One push from done" right={<Pill theme={theme} color="emerald">{finishLine.length}</Pill>} />
                <Card theme={theme} pad={0} style={{ overflow: 'hidden' }}>
                  {finishLine.map((p, i) => (
                    <PortfolioPlanRow key={i} theme={theme} plan={p} accent={t.emerald} last={i === finishLine.length - 1} />
                  ))}
                </Card>
              </div>
              <div>
                <SectionHead theme={theme} kicker="◆ Needs your input" title="Blocked on you" right={<Pill theme={theme} color="amber">{needsInput.length}</Pill>} />
                <Card theme={theme} pad={0} style={{ overflow: 'hidden' }}>
                  {needsInput.map((p, i) => (
                    <PortfolioPlanRow key={i} theme={theme} plan={p} accent={t.amber} last={i === needsInput.length - 1} showIssue />
                  ))}
                </Card>
              </div>
            </div>

            {/* Stale */}
            <div style={{ marginTop: 24 }}>
              <SectionHead theme={theme} kicker="◆ Stale" title="Drifting without you" right={<Pill theme={theme} color="red">{stale.length}</Pill>} />
              <Card theme={theme} pad={0} style={{ overflow: 'hidden', borderColor: t.red }}>
                {stale.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '12px 16px',
                    borderBottom: i < stale.length - 1 ? `1px solid ${t.border}` : 'none',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: fontDisplay, fontSize: 13.5, fontWeight: 600, color: t.text, letterSpacing: '-0.01em' }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: t.violet, marginTop: 2 }}>↳ {p.goal}</div>
                    </div>
                    <div style={{ width: 120, height: 4, background: t.surfaceHi, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${p.progress}%`, height: '100%', background: t.slate }} />
                    </div>
                    <Mono style={{ fontSize: 10, color: t.textMuted, width: 36, textAlign: 'right' }}>{p.progress}%</Mono>
                    <Pill theme={theme} color={p.days >= 8 ? 'red' : 'amber'}>{p.days}d stale</Pill>
                  </div>
                ))}
              </Card>
            </div>

            {/* Goal alignment */}
            <div style={{ marginTop: 24 }}>
              <SectionHead theme={theme} kicker="◆ Goal alignment" title="Plans → goals" />
              <Card theme={theme} pad={0} style={{ overflow: 'hidden' }}>
                {goalAlignment.map((g, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px',
                    borderBottom: i < goalAlignment.length - 1 ? `1px solid ${t.border}` : 'none',
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: healthMap[g.health], flexShrink: 0 }} />
                    <div style={{ flex: 1, fontFamily: fontDisplay, fontSize: 13.5, fontWeight: 600, color: t.text, letterSpacing: '-0.01em', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {g.title}
                    </div>
                    <div style={{ width: 160, height: 4, background: t.surfaceHi, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${g.progress}%`, height: '100%', background: healthMap[g.health] }} />
                    </div>
                    <Mono style={{ fontSize: 10, color: t.textSec, width: 36, textAlign: 'right' }}>{g.progress}%</Mono>
                    <Mono style={{ fontSize: 10, color: t.textMuted, width: 56, textAlign: 'right' }}>{g.plans} plan{g.plans > 1 ? 's' : ''}</Mono>
                  </div>
                ))}
              </Card>
            </div>

          </div>
        </div>
      </AppShell>
    </ArtboardFrame>
  );
}

function AttentionSpectrum({ theme }) {
  const t = useT(theme);
  // A horizontal heatline showing where the 7 plans sit on attention urgency.
  const buckets = [
    { label: 'Stale', count: 2, color: t.red, w: 18 },
    { label: 'Needs input', count: 2, color: t.amber, w: 22 },
    { label: 'In motion', count: 0, color: t.text, w: 18 },
    { label: 'Finish line', count: 3, color: t.emerald, w: 32 },
    { label: 'Done', count: 0, color: t.slate, w: 10 },
  ];
  return (
    <Card theme={theme} pad={16}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Mono style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted }}>
          ◆ Attention spectrum
        </Mono>
        <Mono style={{ fontSize: 10, color: t.textSec }}>7 plans · live</Mono>
      </div>
      <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 28, marginBottom: 8 }}>
        {buckets.map((b, i) => (
          <div key={i} style={{
            flex: b.w,
            background: b.count > 0 ? b.color : t.surfaceHi,
            opacity: b.count > 0 ? 1 : 0.35,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: fontMono, fontSize: 10, fontWeight: 700,
            color: b.count > 0 ? t.bg : t.textMuted,
          }}>
            {b.count > 0 ? b.count : '·'}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        {buckets.map((b, i) => (
          <div key={i} style={{ flex: b.w, fontSize: 10, color: t.textMuted, fontFamily: fontBody, letterSpacing: '0.04em', textAlign: 'center' }}>
            {b.label}
          </div>
        ))}
      </div>
    </Card>
  );
}

function PortfolioPlanRow({ theme, plan, accent, last, showIssue }) {
  const t = useT(theme);
  return (
    <div style={{
      padding: '12px 16px',
      borderBottom: last ? 'none' : `1px solid ${t.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0, fontFamily: fontDisplay, fontSize: 13, fontWeight: 600, color: t.text, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {plan.title}
        </div>
        <div style={{ flex: 1, height: 4, background: t.surfaceHi, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${plan.progress}%`, height: '100%', background: accent }} />
        </div>
        <Mono style={{ fontSize: 10, color: t.textSec, width: 36, textAlign: 'right' }}>{plan.progress}%</Mono>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: t.textMuted }}>
        <span style={{ color: t.violet }}>↳ {plan.goal}</span>
        <span style={{ color: t.borderHi }}>·</span>
        <span>{plan.label || plan.since}</span>
        {showIssue && plan.issue && <>
          <span style={{ color: t.borderHi }}>·</span>
          <span style={{ color: t.amber }}>{plan.issue}</span>
        </>}
      </div>
    </div>
  );
}

Object.assign(window, { Portfolio });
