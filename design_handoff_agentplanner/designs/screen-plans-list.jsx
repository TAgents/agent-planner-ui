// Plans list — index of all plans
// Bold treatment: each plan is a "mission card" with status spine, segmented progress,
// pulse indicator for activity, and inline goal-tether showing which goal it serves.

function PlansList({ theme = 'dark' }) {
  const t = useT(theme);

  const plans = [
    {
      id: 1, title: 'Atlas v2.0 — design partner release', goal: 'Ship Atlas v2.0',
      status: 'active', progress: { done: 14, doing: 3, blocked: 1, todo: 6 },
      updated: '12m ago', nodes: 24, agents: 2, pending: 0, public: false, accent: 'amber',
    },
    {
      id: 2, title: 'Query latency reduction sprint', goal: 'Cut p95 below 120ms',
      status: 'active', progress: { done: 8, doing: 2, blocked: 2, todo: 11 },
      updated: '4h ago', nodes: 23, agents: 1, pending: 2, public: false, accent: 'amber',
    },
    {
      id: 3, title: 'Enterprise pilot — Northwind', goal: 'Onboard 3 pilots',
      status: 'active', progress: { done: 4, doing: 1, blocked: 0, todo: 13 },
      updated: '6d ago', nodes: 18, agents: 0, pending: 1, public: true, accent: 'red', stale: true,
    },
    {
      id: 4, title: 'Enterprise pilot — Globex', goal: 'Onboard 3 pilots',
      status: 'active', progress: { done: 2, doing: 2, blocked: 0, todo: 15 },
      updated: '2d ago', nodes: 19, agents: 1, pending: 0, public: true, accent: 'amber',
    },
    {
      id: 5, title: 'Infra cost watch — Q4', goal: 'Stay under $40k/mo',
      status: 'active', progress: { done: 9, doing: 1, blocked: 0, todo: 2 },
      updated: '34m ago', nodes: 12, agents: 1, pending: 0, public: false, accent: 'emerald',
    },
    {
      id: 6, title: 'Vector DB migration — research', goal: 'Cut p95 below 120ms',
      status: 'draft', progress: { done: 0, doing: 0, blocked: 0, todo: 8 },
      updated: '1d ago', nodes: 8, agents: 0, pending: 0, public: false, accent: 'slate',
    },
    {
      id: 7, title: 'Auth & SSO foundation', goal: 'Ship Atlas v2.0',
      status: 'completed', progress: { done: 16, doing: 0, blocked: 0, todo: 0 },
      updated: '5d ago', nodes: 16, agents: 0, pending: 0, public: false, accent: 'emerald',
    },
  ];

  const filterCounts = { all: 7, active: 5, draft: 1, completed: 1, archived: 0 };
  const activeFilter = 'active';

  const accentMap = { amber: t.amber, emerald: t.emerald, red: t.red, slate: t.slate, violet: t.violet };

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <AppShell theme={theme} active="plans">
        <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ borderBottom: `1px solid ${t.border}`, background: t.surface, padding: '18px 32px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 4 }}>
                  Plans · Acme Robotics
                </div>
                <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>
                  7 plans, <span style={{ color: t.amber }}>3 want your attention</span>
                </div>
              </div>
              <div style={{ flex: 1 }} />

              {/* Search */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 8,
                border: `1px solid ${t.border}`, background: t.bg,
                width: 220,
              }}>
                <span style={{ color: t.textMuted, fontSize: 12 }}>⌕</span>
                <span style={{ color: t.textMuted, fontSize: 12, fontFamily: fontBody }}>Search plans…</span>
                <div style={{ flex: 1 }} />
                <Mono style={{ fontSize: 9, color: t.textMuted, padding: '1px 5px', border: `1px solid ${t.border}`, borderRadius: 3 }}>⌘K</Mono>
              </div>

              {/* New plan */}
              <button style={{
                padding: '8px 14px', borderRadius: 8,
                background: t.text, color: t.bg,
                border: 'none', fontFamily: fontDisplay, fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
                display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              }}>
                <span style={{ fontSize: 14 }}>+</span> New plan
              </button>
            </div>

            {/* Filter pills + view toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 14 }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'draft', label: 'Draft' },
                { id: 'completed', label: 'Completed' },
                { id: 'archived', label: 'Archived' },
              ].map((f) => {
                const isActive = f.id === activeFilter;
                return (
                  <button key={f.id} style={{
                    padding: '5px 11px', borderRadius: 6,
                    border: 'none', cursor: 'pointer',
                    background: isActive ? t.text : 'transparent',
                    color: isActive ? t.bg : t.textSec,
                    fontFamily: fontBody, fontSize: 11, fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}>
                    {f.label}
                    <span style={{ fontFamily: fontMono, fontSize: 9, opacity: isActive ? 0.7 : 0.55 }}>
                      {filterCounts[f.id]}
                    </span>
                  </button>
                );
              })}
              <div style={{ flex: 1 }} />

              <Mono style={{ fontSize: 10, color: t.textMuted }}>Sort: Recent ▾</Mono>
              <div style={{ display: 'flex', border: `1px solid ${t.border}`, borderRadius: 6, overflow: 'hidden', marginLeft: 6 }}>
                <div style={{ padding: '5px 9px', background: t.surfaceHi, color: t.text, fontSize: 11, fontFamily: fontMono }}>≡</div>
                <div style={{ padding: '5px 9px', color: t.textMuted, fontSize: 11, fontFamily: fontMono, borderLeft: `1px solid ${t.border}` }}>▦</div>
              </div>
            </div>
          </div>

          {/* Plans list */}
          <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plans.map((p) => <PlanRow key={p.id} theme={theme} plan={p} accentColor={accentMap[p.accent]} />)}
            </div>
          </div>
        </div>
      </AppShell>
    </ArtboardFrame>
  );
}

function PlanRow({ theme, plan, accentColor }) {
  const t = useT(theme);
  const total = plan.progress.done + plan.progress.doing + plan.progress.blocked + plan.progress.todo;
  const pct = total === 0 ? 0 : Math.round((plan.progress.done / total) * 100);
  const seg = (n) => total === 0 ? 0 : (n / total) * 100;

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      background: t.surface,
      border: `1px solid ${t.border}`, borderRadius: 10,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Status spine */}
      <div style={{ width: 3, background: accentColor, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
        {/* Title + goal tether */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {plan.title}
            </div>
            {plan.public && (
              <span style={{ fontFamily: fontMono, fontSize: 9, color: t.textMuted, padding: '1px 5px', border: `1px solid ${t.border}`, borderRadius: 3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Public
              </span>
            )}
            {plan.stale && <Pill theme={theme} color="red">Stale · 6d</Pill>}
            {plan.pending > 0 && <Pill theme={theme} color="amber">{plan.pending} decision{plan.pending > 1 ? 's' : ''}</Pill>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: t.textMuted }}>
            <span style={{ fontFamily: fontMono, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase' }}>serves</span>
            <span style={{ color: t.violet, fontWeight: 500 }}>↳ {plan.goal}</span>
            <span style={{ color: t.borderHi }}>·</span>
            <span style={{ fontFamily: fontMono, fontSize: 10 }}>{plan.nodes} nodes</span>
            <span style={{ color: t.borderHi }}>·</span>
            <span style={{ fontFamily: fontMono, fontSize: 10 }}>updated {plan.updated}</span>
          </div>
        </div>

        {/* Agents */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          {plan.agents > 0 ? (
            <>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.emerald, animation: 'pulse 2s infinite' }} />
              <Mono style={{ fontSize: 10, color: t.emerald }}>{plan.agents} live</Mono>
            </>
          ) : (
            <Mono style={{ fontSize: 10, color: t.textMuted }}>idle</Mono>
          )}
        </div>

        {/* Segmented progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, width: 200 }}>
          <div style={{ flex: 1, height: 5, background: t.surfaceHi, borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
            {plan.progress.done > 0 && <div style={{ width: `${seg(plan.progress.done)}%`, background: t.emerald }} />}
            {plan.progress.doing > 0 && <div style={{ width: `${seg(plan.progress.doing)}%`, background: t.amber }} />}
            {plan.progress.blocked > 0 && <div style={{ width: `${seg(plan.progress.blocked)}%`, background: t.red }} />}
          </div>
          <div style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', color: t.text, width: 36, textAlign: 'right' }}>
            {pct}%
          </div>
        </div>

        {/* Counts mini */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, fontSize: 10, color: t.textSec }}>
          <span><span style={{ color: t.emerald, fontFamily: fontMono, fontWeight: 600 }}>{plan.progress.done}</span> done</span>
          {plan.progress.doing > 0 && <span><span style={{ color: t.amber, fontFamily: fontMono, fontWeight: 600 }}>{plan.progress.doing}</span> active</span>}
          {plan.progress.blocked > 0 && <span><span style={{ color: t.red, fontFamily: fontMono, fontWeight: 600 }}>{plan.progress.blocked}</span> blocked</span>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PlansList });
