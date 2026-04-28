// Public plan view — read-only sharing surface.
// Bold treatment: a "published" hero with author + last update, then a compact
// summary stack (goal, progress, beliefs digest) and a flattened plan tree, all
// without nav rail (this is what visitors see).

function PublicPlan({ theme = 'dark' }) {
  const t = useT(theme);

  const tree = [
    { id: 1, depth: 0, type: 'milestone', title: 'Atlas v2.0 — design partner release', status: 'doing' },
    { id: 2, depth: 1, type: 'task', title: 'Tenant-scoped feature flags', status: 'done' },
    { id: 3, depth: 1, type: 'task', title: 'SAML 2.0 — Okta integration', status: 'doing' },
    { id: 4, depth: 2, type: 'subtask', title: 'Wire SAML config screen', status: 'doing' },
    { id: 5, depth: 2, type: 'subtask', title: 'Tenant-scoped ACS URL handling', status: 'todo' },
    { id: 6, depth: 1, type: 'task', title: 'Onboarding checklist for partners', status: 'todo', stale: true },
    { id: 7, depth: 0, type: 'milestone', title: 'Partner kickoff — 3 design partners', status: 'todo' },
    { id: 8, depth: 1, type: 'task', title: 'Northwind onboarding', status: 'todo' },
    { id: 9, depth: 1, type: 'task', title: 'Globex onboarding', status: 'todo' },
    { id: 10, depth: 0, type: 'milestone', title: 'GA launch', status: 'todo' },
  ];

  const statusColor = (s) => s === 'done' ? t.emerald : s === 'doing' ? t.amber : s === 'blocked' ? t.red : t.textMuted;
  const statusGlyph = (s) => s === 'done' ? '✓' : s === 'doing' ? '◐' : s === 'blocked' ? '⚠' : '○';

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <div style={{ height: '100%', overflow: 'auto', background: t.bg }}>

        {/* Slim public top bar */}
        <div style={{
          padding: '14px 36px',
          display: 'flex', alignItems: 'center', gap: 14,
          borderBottom: `1px solid ${t.border}`,
          background: t.surface,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6, background: t.amber, color: t.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: fontDisplay, fontSize: 14, fontWeight: 700, letterSpacing: '-0.04em',
            }}>◆</div>
            <div style={{ fontFamily: fontDisplay, fontSize: 13.5, fontWeight: 700, letterSpacing: '-0.02em' }}>AgentPlanner</div>
          </div>
          <Mono style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted, padding: '2px 8px', border: `1px solid ${t.border}`, borderRadius: 4 }}>
            ◆ Public plan
          </Mono>
          <div style={{ flex: 1 }} />
          <button style={{
            padding: '6px 12px', borderRadius: 6,
            background: 'transparent', border: `1px solid ${t.border}`,
            color: t.textSec, fontFamily: fontDisplay, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
          }}>Fork to my workspace</button>
          <button style={{
            padding: '6px 12px', borderRadius: 6,
            background: t.text, color: t.bg, border: 'none',
            fontFamily: fontDisplay, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
          }}>Sign in</button>
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 32px 60px' }}>

          {/* Hero */}
          <div style={{ marginBottom: 22 }}>
            <Mono style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 6, display: 'block' }}>
              Acme Robotics · Published Oct 17
            </Mono>
            <div style={{ fontFamily: fontDisplay, fontSize: 36, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 10, color: t.text, textWrap: 'balance' }}>
              Atlas v2.0 — design partner release
            </div>
            <div style={{ fontSize: 14, color: t.textSec, lineHeight: 1.55, marginBottom: 16 }}>
              Our plan to ship Atlas v2.0 to three design partners by November 1. Maintained by our agents and humans together — read-only snapshot, updated every 5 minutes.
            </div>

            {/* Author + meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: t.textMuted }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: t.amberSoft, color: t.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fontMono, fontSize: 10, fontWeight: 700 }}>M</div>
                <span style={{ color: t.text, fontWeight: 500 }}>Marcus Sutton</span>
              </div>
              <span>+ 2 agents</span>
              <span style={{ color: t.borderHi }}>·</span>
              <span>updated 12 minutes ago</span>
              <span style={{ color: t.borderHi }}>·</span>
              <span>read-only</span>
            </div>
          </div>

          {/* Summary stack */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
            <Card theme={theme} pad={14}>
              <Mono style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 6, display: 'block' }}>Progress</Mono>
              <div style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 700, letterSpacing: '-0.04em', color: t.text, lineHeight: 1 }}>
                68<span style={{ fontSize: 16, color: t.textMuted }}>%</span>
              </div>
              <div style={{ fontSize: 10.5, color: t.textSec, marginTop: 5 }}>14 of 24 nodes complete</div>
            </Card>
            <Card theme={theme} pad={14}>
              <Mono style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 6, display: 'block' }}>Health</Mono>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.amber }} />
                <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: t.text }}>On track</div>
              </div>
              <div style={{ fontSize: 10.5, color: t.textSec, marginTop: 5 }}>1 stale task · 0 blocked</div>
            </Card>
            <Card theme={theme} pad={14}>
              <Mono style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 6, display: 'block' }}>Knowledge</Mono>
              <div style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 700, letterSpacing: '-0.04em', color: t.text, lineHeight: 1 }}>47</div>
              <div style={{ fontSize: 10.5, color: t.textSec, marginTop: 5 }}>facts · 0 contradictions</div>
            </Card>
          </div>

          {/* Plan tree */}
          <SectionHead theme={theme} kicker="◆ Plan" title="Tasks & milestones" right={<Mono style={{ fontSize: 10, color: t.textMuted }}>10 nodes</Mono>} />
          <Card theme={theme} pad={0} style={{ overflow: 'hidden' }}>
            {tree.map((node, i) => (
              <div key={node.id} style={{
                padding: '11px 16px',
                paddingLeft: 16 + node.depth * 22,
                borderBottom: i < tree.length - 1 ? `1px solid ${t.border}` : 'none',
                display: 'flex', alignItems: 'center', gap: 11,
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: statusColor(node.status) + '22',
                  color: statusColor(node.status),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, fontFamily: fontMono,
                  flexShrink: 0,
                }}>{statusGlyph(node.status)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: fontDisplay,
                    fontSize: node.type === 'milestone' ? 14 : 13,
                    fontWeight: node.type === 'milestone' ? 700 : 500,
                    letterSpacing: '-0.01em',
                    color: t.text,
                  }}>{node.title}</div>
                </div>
                {node.stale && <Pill theme={theme} color="amber">stale</Pill>}
                <Mono style={{ fontSize: 9.5, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {node.type}
                </Mono>
              </div>
            ))}
          </Card>

          {/* Beliefs digest */}
          <div style={{ marginTop: 28 }}>
            <SectionHead theme={theme} kicker="◆ Recent beliefs" title="What our agents have learned" right={<Mono style={{ fontSize: 10, color: t.textMuted }}>last 3 of 47</Mono>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { fact: 'IVFFlat with lists=100 cuts query time by ~60% with acceptable recall loss.', source: 'researcher-β · today' },
                { fact: 'SAML SP-initiated only — IdP-initiated breaks our nonce check on Okta.', source: 'Marcus · today' },
                { fact: 'Northwind pilot conditional on SAML being live by Nov 1.', source: 'Priya · yesterday' },
              ].map((b, i) => (
                <Card key={i} theme={theme} pad={14}>
                  <div style={{ fontSize: 13, color: t.text, lineHeight: 1.5, marginBottom: 5 }}>{b.fact}</div>
                  <Mono style={{ fontSize: 10, color: t.textMuted }}>{b.source}</Mono>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 40, paddingTop: 22, borderTop: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Mono style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.1em' }}>
              acme-robotics.agentplanner.app/atlas-v2
            </Mono>
            <div style={{ fontSize: 11, color: t.textSec }}>
              Built on <span style={{ color: t.amber, fontWeight: 600 }}>AgentPlanner</span> — give your agents a shared brain →
            </div>
          </div>
        </div>
      </div>
    </ArtboardFrame>
  );
}

Object.assign(window, { PublicPlan });
