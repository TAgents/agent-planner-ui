// /connect/claude-desktop — the simplest, lead-with-this connect page.
// Stand-alone (not in AppShell — used both in-product and embedded in Settings).
// Three steps, the third has the inline Test panel.

function ConnectClaudeDesktop({ theme = 'dark' }) {
  const t = useT(theme);

  const briefing = [
    { label: 'Goals', value: '6', sub: '4 active · 2 paused' },
    { label: 'Plans', value: '12', sub: '3 in motion' },
    { label: 'Decisions', value: '0', sub: 'Awaiting you' },
    { label: 'Beliefs', value: '847', sub: 'Across all goals' },
  ];

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <div style={{ height: '100%', overflow: 'auto' }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 28px', borderBottom: `1px solid ${t.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6, background: t.amber, color: t.bg,
              fontFamily: fontDisplay, fontWeight: 700, fontSize: 13, letterSpacing: '-0.04em',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>ap</div>
            <Display style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em' }}>AgentPlanner</Display>
            <Mono style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginLeft: 6 }}>
              · Connect
            </Mono>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: t.textSec }}>
            <span style={{ cursor: 'pointer' }}>Other clients</span>
            <span style={{ cursor: 'pointer' }}>Docs</span>
          </div>
        </div>

        <div style={{ padding: '36px 28px 60px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: t.amber, color: t.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: fontDisplay, fontWeight: 700, fontSize: 19, letterSpacing: '-0.04em',
              }}>CD</div>
              <div>
                <Mono style={{ fontSize: 9.5, color: t.amber, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block' }}>
                  ◆ Easiest path
                </Mono>
                <Display style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>
                  Connect Claude Desktop
                </Display>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: t.textSec, lineHeight: 1.6, marginTop: 8, marginBottom: 28 }}>
              No terminal, no JSON. Download a file, double-click it, and paste your token. About a minute.
            </p>

            {/* Steps */}
            <StepCard theme={theme} n={1} title="Download the extension"
              subtitle="Claude Desktop opens it automatically. If your browser asks where to save, anywhere is fine."
              state="active"
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
                padding: '14px 16px',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 8,
                  background: t.surfaceHi, color: t.text,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  ↓
                </div>
                <div style={{ flex: 1 }}>
                  <Display style={{ fontSize: 13.5, fontWeight: 600, color: t.text, letterSpacing: '-0.01em', display: 'block' }}>
                    agent-planner.mcpb
                  </Display>
                  <Mono style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.08em', marginTop: 2, display: 'block' }}>
                    v0.9.2 · 2.4 MB · macOS / Windows · signed
                  </Mono>
                </div>
                <PrimaryButton theme={theme}>
                  Download .mcpb
                </PrimaryButton>
              </div>
            </StepCard>

            <StepCard theme={theme} n={2} title="Double-click the file you just downloaded"
              subtitle="Claude Desktop will open and ask for an API token. Paste this:"
              state="active"
            >
              <TokenBlock theme={theme} token="ap_live_8f3a92c4d1e7b6a8f9c2e5d3" label={null} />
              <div style={{
                marginTop: 12, padding: '10px 12px', borderRadius: 8,
                background: t.surfaceHi, border: `1px dashed ${t.border}`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ color: t.textMuted, fontSize: 14 }}>ⓘ</span>
                <div style={{ fontSize: 11.5, color: t.textSec, lineHeight: 1.55 }}>
                  The API URL is pre-filled —{' '}
                  <Mono style={{ color: t.text, fontSize: 11 }}>https://agentplanner.io/api</Mono>
                  . You don't have to change anything else.
                </div>
              </div>
            </StepCard>

            <StepCard theme={theme} n={3} title="Test the connection"
              subtitle="We'll fetch your briefing through Claude. If it comes back, you're done."
              state="success"
            >
              <button style={{
                padding: '11px 18px', borderRadius: 8,
                background: t.emerald, color: t.bg, border: 'none',
                fontFamily: fontBody, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 13 }}>✓</span> Test connection
              </button>

              <TestPanel theme={theme} state="success" briefing={briefing} />

              <div style={{
                marginTop: 18, padding: '14px 16px', borderRadius: 10,
                background: t.surface, border: `1px solid ${t.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div>
                  <Display style={{ fontSize: 13, fontWeight: 600, color: t.text, letterSpacing: '-0.01em', display: 'block' }}>
                    Connected
                  </Display>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                    Manage this connection any time from Settings → Integrations.
                  </div>
                </div>
                <PrimaryButton theme={theme}>
                  Open dashboard →
                </PrimaryButton>
              </div>
            </StepCard>

            {/* Footer — alt clients */}
            <div style={{
              marginTop: 18, paddingTop: 22, borderTop: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Mono style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Using a different agent?
              </Mono>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Claude Code', 'Cursor', 'OpenClaw', 'ChatGPT'].map((c) => (
                  <span key={c} style={{
                    padding: '5px 11px', borderRadius: 6,
                    background: t.surface, border: `1px solid ${t.border}`,
                    fontFamily: fontBody, fontSize: 11, color: t.textSec, cursor: 'pointer',
                  }}>
                    {c} →
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </ArtboardFrame>
  );
}

window.ConnectClaudeDesktop = ConnectClaudeDesktop;
