// Goals list — the workspace's compass index.
// Each row is a goal "ridge": type glyph in a typed swatch, lineage rail for sub-goals,
// BDI density spark, plan tether, quality score, status spine. Ranked by attention urgency.
//
// Maps to GoalsV2.tsx in the codebase: useGoalsTree (hierarchical), 4 types
// (outcome / constraint / metric / principle), status (active / achieved / paused / abandoned),
// search + filter pills, optional sub-goal indent, links to plans.

function GoalsList({ theme = 'dark' }) {
  const t = useT(theme);

  // type → visual config
  const TYPES = {
    outcome:    { glyph: '◉', label: 'Outcome',    color: t.amber,   soft: t.amberSoft },
    constraint: { glyph: '◐', label: 'Constraint', color: t.red,     soft: t.redSoft },
    metric:     { glyph: '▲', label: 'Metric',     color: t.emerald, soft: t.emeraldSoft },
    principle:  { glyph: '◆', label: 'Principle',  color: t.violet,  soft: t.violetSoft },
  };

  // status → spine color
  const STATUS = {
    active:    t.amber,
    achieved:  t.emerald,
    paused:    t.slate,
    abandoned: t.borderHi,
  };

  const goals = [
    {
      id: 1, depth: 0, type: 'outcome', status: 'active',
      title: 'Ship Atlas v2.0 to design-partner cohort',
      desc: 'GA-quality release for the 12-org partner waitlist by EOQ.',
      owner: 'Maya S', score: 84, plans: 3, subgoals: 4,
      progress: { done: 18, doing: 4, blocked: 1, todo: 9 },
      bdi: [2, 3, 4, 6, 5, 7, 8, 6, 9, 11], bdiColor: 'amber',
      attention: 'You',
    },
    {
      id: 2, depth: 1, type: 'metric', status: 'active',
      title: 'Cut p95 query latency below 120ms',
      desc: 'Currently 187ms; partner X measured 340ms.',
      owner: 'Maya S', score: 72, plans: 2, subgoals: 0,
      progress: { done: 7, doing: 4, blocked: 2, todo: 4 },
      bdi: [3, 4, 3, 5, 6, 7, 6, 8, 7, 9], bdiColor: 'amber',
      attention: 'At risk',
    },
    {
      id: 3, depth: 1, type: 'constraint', status: 'active',
      title: 'Stay under $40k/mo infra spend',
      desc: 'Hard ceiling; finance reviews monthly.',
      owner: 'Dev R', score: 91, plans: 1, subgoals: 0,
      progress: { done: 9, doing: 1, blocked: 0, todo: 2 },
      bdi: [5, 5, 4, 6, 5, 6, 5, 4, 6, 5], bdiColor: 'emerald',
      attention: null,
    },
    {
      id: 4, depth: 1, type: 'principle', status: 'active',
      title: 'Read-replica reads only; never write to followers',
      desc: 'Data correctness invariant — applies across all plans.',
      owner: 'Dev R', score: 65, plans: 4, subgoals: 0,
      progress: null,
      bdi: [1, 2, 1, 2, 3, 2, 3, 2, 3, 3], bdiColor: 'violet',
      attention: 'Stale',
    },
    {
      id: 5, depth: 0, type: 'outcome', status: 'active',
      title: 'Onboard 3 enterprise pilots by April',
      desc: 'Northwind, Globex, and Initech in active conversation.',
      owner: 'Pat L', score: 58, plans: 2, subgoals: 1,
      progress: { done: 6, doing: 3, blocked: 0, todo: 28 },
      bdi: [4, 5, 6, 5, 7, 8, 7, 9, 8, 10], bdiColor: 'amber',
      attention: 'You',
    },
    {
      id: 6, depth: 1, type: 'metric', status: 'active',
      title: 'Achieve 30+ day pilot retention',
      desc: 'Each pilot must complete 30 contiguous days of active use.',
      owner: 'Pat L', score: 60, plans: 0, subgoals: 0,
      progress: { done: 0, doing: 1, blocked: 0, todo: 5 },
      bdi: [0, 1, 1, 2, 1, 2, 2, 3, 3, 4], bdiColor: 'amber',
      attention: 'No plan',
    },
    {
      id: 7, depth: 0, type: 'principle', status: 'active',
      title: 'Decisions over 4h must be visible to humans',
      desc: 'Workspace-wide oversight contract.',
      owner: 'Maya S', score: 88, plans: 8, subgoals: 0,
      progress: null,
      bdi: [3, 3, 4, 4, 5, 4, 5, 6, 5, 6], bdiColor: 'violet',
      attention: null,
    },
    {
      id: 8, depth: 0, type: 'outcome', status: 'achieved',
      title: 'Auth & SSO foundation in production',
      desc: 'SAML, OIDC, and magic-link verified across 3 IDPs.',
      owner: 'Dev R', score: 96, plans: 1, subgoals: 0,
      progress: { done: 16, doing: 0, blocked: 0, todo: 0 },
      bdi: [2, 3, 5, 7, 9, 11, 13, 14, 14, 14], bdiColor: 'emerald',
      attention: 'Done · Mar 14',
    },
    {
      id: 9, depth: 0, type: 'outcome', status: 'paused',
      title: 'Open-source the SDK by H2',
      desc: 'Paused pending legal review of contributor license.',
      owner: 'Pat L', score: 41, plans: 1, subgoals: 0,
      progress: { done: 2, doing: 0, blocked: 0, todo: 11 },
      bdi: [3, 4, 4, 3, 2, 2, 1, 1, 1, 1], bdiColor: 'slate',
      attention: 'Paused 11d',
    },
  ];

  const filterCounts = { all: 14, active: 9, achieved: 3, paused: 1, abandoned: 1 };
  const typeCounts = { all: 14, outcome: 6, metric: 4, constraint: 2, principle: 2 };
  const activeFilter = 'active';
  const activeType = 'all';

  // header attention summary
  const needAttention = goals.filter(g => g.attention === 'You' || g.attention === 'At risk' || g.attention === 'Stale' || g.attention === 'No plan').length;

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <AppShell theme={theme} active="goals">
        <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ borderBottom: `1px solid ${t.border}`, background: t.surface, padding: '18px 32px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
              <div>
                <Mono style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 4 }}>
                  Goals · Acme Robotics
                </Mono>
                <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  9 active goals, <span style={{ color: t.amber }}>{needAttention} need a look</span>
                </div>
              </div>
              <div style={{ flex: 1 }} />

              {/* Search */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 8,
                border: `1px solid ${t.border}`, background: t.bg,
                width: 240,
              }}>
                <span style={{ color: t.textMuted, fontSize: 12 }}>⌕</span>
                <span style={{ color: t.textMuted, fontSize: 12 }}>Search goals…</span>
                <div style={{ flex: 1 }} />
                <Mono style={{ fontSize: 9, color: t.textMuted, padding: '1px 5px', border: `1px solid ${t.border}`, borderRadius: 3 }}>⌘K</Mono>
              </div>

              {/* New goal */}
              <button style={{
                padding: '8px 14px', borderRadius: 8,
                background: t.text, color: t.bg,
                border: 'none', fontFamily: fontDisplay, fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
                display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              }}>
                <span style={{ fontSize: 14 }}>+</span> New goal
              </button>
            </div>

            {/* Filter row 1 — status pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 8 }}>
              <Mono style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.textMuted, marginRight: 6 }}>Status</Mono>
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'achieved', label: 'Achieved' },
                { id: 'paused', label: 'Paused' },
                { id: 'abandoned', label: 'Abandoned' },
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
                    <Mono style={{ fontSize: 9, opacity: isActive ? 0.7 : 0.55 }}>
                      {filterCounts[f.id]}
                    </Mono>
                  </button>
                );
              })}
              <div style={{ flex: 1 }} />
              <Mono style={{ fontSize: 10, color: t.textMuted }}>Sort: Attention ▾</Mono>
            </div>

            {/* Filter row 2 — type pills (legend) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 14 }}>
              <Mono style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.textMuted, marginRight: 6 }}>Type</Mono>
              {[
                { id: 'all', label: 'All', color: t.text },
                { id: 'outcome', label: 'Outcome', color: t.amber, glyph: '◉' },
                { id: 'metric', label: 'Metric', color: t.emerald, glyph: '▲' },
                { id: 'constraint', label: 'Constraint', color: t.red, glyph: '◐' },
                { id: 'principle', label: 'Principle', color: t.violet, glyph: '◆' },
              ].map((f) => {
                const isActive = f.id === activeType;
                return (
                  <button key={f.id} style={{
                    padding: '5px 11px', borderRadius: 6,
                    border: `1px solid ${isActive ? t.borderHi : t.border}`,
                    background: isActive ? t.surfaceHi : 'transparent',
                    cursor: 'pointer',
                    color: t.textSec,
                    fontFamily: fontBody, fontSize: 11, fontWeight: 500,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    {f.glyph && <span style={{ color: f.color, fontSize: 10 }}>{f.glyph}</span>}
                    {f.label}
                    <Mono style={{ fontSize: 9, opacity: 0.55 }}>
                      {typeCounts[f.id]}
                    </Mono>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column header strip */}
          <div style={{
            padding: '8px 32px', borderBottom: `1px solid ${t.border}`,
            background: t.bg,
            display: 'grid', gridTemplateColumns: '1fr 110px 110px 100px 60px',
            gap: 16, alignItems: 'center',
          }}>
            <Mono style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted }}>Goal</Mono>
            <Mono style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted, textAlign: 'left' }}>BDI density (10d)</Mono>
            <Mono style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted, textAlign: 'left' }}>Quality / Plans</Mono>
            <Mono style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted, textAlign: 'left' }}>Progress</Mono>
            <Mono style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted, textAlign: 'right' }}>Status</Mono>
          </div>

          {/* Goals list */}
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 24px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {goals.map((g, i) => (
                <GoalRidge
                  key={g.id} theme={theme} goal={g}
                  type={TYPES[g.type]}
                  spine={STATUS[g.status]}
                  isLastChild={i < goals.length - 1 ? goals[i + 1].depth <= g.depth : true}
                  isFirstChild={g.depth > 0 && (i === 0 || goals[i - 1].depth < g.depth)}
                  hasSibling={g.depth > 0 && i + 1 < goals.length && goals[i + 1].depth >= g.depth}
                />
              ))}
            </div>

            {/* footnote */}
            <div style={{ marginTop: 18, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 14, fontSize: 10, color: t.textMuted }}>
              <Mono style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.textMuted }}>Legend</Mono>
              <span><span style={{ color: t.amber }}>◉</span> Outcome — measurable end state</span>
              <span><span style={{ color: t.emerald }}>▲</span> Metric — quantitative target</span>
              <span><span style={{ color: t.red }}>◐</span> Constraint — must-not-violate</span>
              <span><span style={{ color: t.violet }}>◆</span> Principle — durable invariant</span>
            </div>
          </div>
        </div>
      </AppShell>
    </ArtboardFrame>
  );
}

function GoalRidge({ theme, goal, type, spine, isFirstChild }) {
  const t = useT(theme);
  const total = goal.progress
    ? goal.progress.done + goal.progress.doing + goal.progress.blocked + goal.progress.todo
    : 0;
  const pct = !goal.progress || total === 0 ? null : Math.round((goal.progress.done / total) * 100);

  // attention pill color
  const attnMap = {
    'You':       t.amber,
    'At risk':   t.red,
    'Stale':     t.amber,
    'No plan':   t.amber,
    'Paused 11d': t.slate,
    'Done · Mar 14': t.emerald,
  };
  const attnColor = attnMap[goal.attention];
  const attnSoft = goal.attention === 'You' ? t.amberSoft :
    goal.attention === 'At risk' ? t.redSoft :
    goal.attention === 'Stale' ? t.amberSoft :
    goal.attention === 'No plan' ? t.amberSoft :
    goal.attention === 'Done · Mar 14' ? t.emeraldSoft :
    t.surfaceHi;

  return (
    <div style={{
      position: 'relative',
      paddingLeft: goal.depth * 28,
      marginBottom: 6,
    }}>
      {/* Lineage rail for sub-goals */}
      {goal.depth > 0 && (
        <>
          <div style={{
            position: 'absolute', left: (goal.depth - 1) * 28 + 18, top: -6, bottom: '50%',
            width: 1, background: t.border,
          }} />
          <div style={{
            position: 'absolute', left: (goal.depth - 1) * 28 + 18, top: '50%',
            width: 14, height: 1, background: t.border,
          }} />
        </>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 110px 110px 100px 60px',
        gap: 16, alignItems: 'center',
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderLeft: `3px solid ${spine}`,
        borderRadius: 10,
        padding: '12px 16px',
        minWidth: 0,
      }}>
        {/* Title cluster */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
          {/* Type swatch */}
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: type.soft,
            color: type.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, flexShrink: 0,
          }}>
            {type.glyph}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{
                fontFamily: fontDisplay, fontSize: 13.5, fontWeight: 600,
                letterSpacing: '-0.01em', color: t.text,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}>
                {goal.title}
              </div>
              {goal.attention && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '1.5px 7px', borderRadius: 4,
                  background: attnSoft, color: attnColor,
                  fontFamily: fontMono, fontSize: 8.5, fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  flexShrink: 0,
                }}>
                  {goal.attention === 'You' && <span style={{ width: 4, height: 4, borderRadius: '50%', background: attnColor }} />}
                  {goal.attention}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, color: t.textMuted, minWidth: 0 }}>
              <span style={{ color: type.color, fontFamily: fontMono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', flexShrink: 0 }}>{type.label}</span>
              <span style={{ color: t.borderHi }}>·</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.desc}</span>
              <span style={{ color: t.borderHi, flexShrink: 0 }}>·</span>
              <Mono style={{ fontSize: 10, flexShrink: 0 }}>{goal.owner}</Mono>
            </div>
          </div>
        </div>

        {/* BDI density spark */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Spark values={goal.bdi} color={
            goal.bdiColor === 'amber' ? t.amber :
            goal.bdiColor === 'emerald' ? t.emerald :
            goal.bdiColor === 'violet' ? t.violet :
            t.slate
          } w={100} h={20} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Mono style={{ fontSize: 8.5, color: t.textMuted, letterSpacing: '0.08em' }}>{goal.bdi[0]}</Mono>
            <Mono style={{ fontSize: 8.5, color: t.textMuted, letterSpacing: '0.08em' }}>{goal.bdi[goal.bdi.length - 1]} now</Mono>
          </div>
        </div>

        {/* Quality / Plans */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{
              fontFamily: fontDisplay, fontSize: 18, fontWeight: 700,
              letterSpacing: '-0.03em', lineHeight: 1,
              color: goal.score >= 80 ? t.emerald : goal.score >= 60 ? t.amber : t.red,
            }}>
              {goal.score}
            </div>
            <Mono style={{ fontSize: 8.5, color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>quality</Mono>
          </div>
          <div style={{ width: 1, height: 22, background: t.border }} />
          <div>
            <div style={{
              fontFamily: fontDisplay, fontSize: 14, fontWeight: 600,
              color: goal.plans === 0 ? t.red : t.text, lineHeight: 1,
            }}>
              {goal.plans}
            </div>
            <Mono style={{ fontSize: 8.5, color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>plan{goal.plans === 1 ? '' : 's'}</Mono>
          </div>
        </div>

        {/* Progress segmented bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {goal.progress ? (
            <>
              <div style={{
                height: 6, background: t.surfaceHi, borderRadius: 3,
                overflow: 'hidden', display: 'flex',
              }}>
                {goal.progress.done > 0 && <div style={{ width: `${(goal.progress.done / total) * 100}%`, background: t.emerald }} />}
                {goal.progress.doing > 0 && <div style={{ width: `${(goal.progress.doing / total) * 100}%`, background: t.amber }} />}
                {goal.progress.blocked > 0 && <div style={{ width: `${(goal.progress.blocked / total) * 100}%`, background: t.red }} />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9.5 }}>
                <span style={{ fontFamily: fontDisplay, fontWeight: 700, color: t.text }}>{pct}%</span>
                <span style={{ color: t.textMuted, fontFamily: fontMono, fontSize: 9 }}>· {goal.progress.done}/{total}</span>
              </div>
            </>
          ) : (
            <div style={{
              fontFamily: fontMono, fontSize: 9.5, color: t.textMuted,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '4px 0',
            }}>
              standing rule
            </div>
          )}
        </div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: spine,
            ...(goal.status === 'active' ? { boxShadow: `0 0 0 3px ${spine}33` } : {}),
          }} />
          <Mono style={{ fontSize: 9.5, color: t.textSec, letterSpacing: '0.06em', textTransform: 'capitalize' }}>
            {goal.status}
          </Mono>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GoalsList });
