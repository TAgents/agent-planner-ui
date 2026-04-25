// Onboarding wizard — soft-locks the dashboard for new users until they connect
// an agent and successfully run briefing(). Single-page progressive disclosure:
// step 1 picks client (text+monogram tiles), step 2 expands the relevant per-client
// snippet, step 3 is a Test connection button with inline result panel.
//
// The dashboard skeleton is rendered behind the wizard, dimmed, to make it clear
// where the user lands when they finish. A "Skip for now" link is visible.

function Onboarding({ theme = 'dark' }) {
  const t = useT(theme);

  // Hardcoded "demo state" for the static design — step 1 done (Claude Desktop
  // chosen), step 2 active (token + download visible), step 3 success (briefing
  // rendered). This shows the most informationally rich state.
  const stepStates = ['done', 'active', 'success'];

  const briefing = [
    { label: 'Goals', value: '6', sub: '4 active · 2 paused' },
    { label: 'Plans', value: '12', sub: '3 in motion' },
    { label: 'Decisions', value: '0', sub: 'Awaiting you' },
    { label: 'Beliefs', value: '847', sub: 'Across all goals' },
  ];

  return (
    <ArtboardFrame theme={theme} padded={false}>
      {/* Dashboard skeleton dimmed in the background */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.18, pointerEvents: 'none',
        filter: 'blur(1px)',
      }}>
        <DashboardSkeleton theme={theme} />
      </div>

      {/* Soft-lock veil */}
      <div style={{
        position: 'absolute', inset: 0,
        background: theme === 'dark'
          ? 'linear-gradient(180deg, rgba(14,12,10,0.86) 0%, rgba(14,12,10,0.94) 100%)'
          : 'linear-gradient(180deg, rgba(250,250,247,0.86) 0%, rgba(250,250,247,0.94) 100%)',
      }} />

      {/* Wizard */}
      <div style={{
        position: 'relative', height: '100%', overflow: 'auto',
        padding: '36px 24px 60px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <Mono style={{ fontSize: 10, color: t.amber, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                ◆ Welcome to AgentPlanner
              </Mono>
              <span style={{ fontSize: 11, color: t.textMuted, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Skip for now →
              </span>
            </div>
            <Display style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', display: 'block' }}>
              Connect your first agent
            </Display>
            <p style={{ fontSize: 14, color: t.textSec, lineHeight: 1.55, marginTop: 10, maxWidth: 520 }}>
              The dashboard fills in once your agent makes its first call. Most people are connected in under a minute.
            </p>

            {/* Progress strip */}
            <div style={{
              display: 'flex', gap: 6, marginTop: 22,
              padding: '10px 14px', borderRadius: 10,
              background: t.surface, border: `1px solid ${t.border}`,
            }}>
              {['Choose your agent', 'Install + paste token', 'Test connection'].map((label, i) => {
                const s = stepStates[i];
                const c = s === 'success' || s === 'done' ? t.emerald : s === 'active' ? t.amber : t.textMuted;
                return (
                  <React.Fragment key={i}>
                    {i > 0 && <span style={{ color: t.borderHi, alignSelf: 'center' }}>·</span>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%',
                        background: s === 'success' || s === 'done' ? t.emerald : 'transparent',
                        border: `1.5px solid ${c}`,
                        color: t.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 8, fontWeight: 700,
                      }}>
                        {(s === 'success' || s === 'done') ? '✓' : ''}
                      </span>
                      <Mono style={{ fontSize: 10, color: c, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                        {label}
                      </Mono>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Steps */}
          <div>
            {/* Step 1 — Client picker (done state) */}
            <StepCard theme={theme} n={1} title="Which agent are you connecting?"
              subtitle="You can add more later in Settings → Integrations."
              state="done"
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8,
                background: t.surface, border: `1px solid ${t.border}`,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: t.amber, color: t.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: fontDisplay, fontWeight: 700, fontSize: 12, letterSpacing: '-0.04em',
                }}>CD</div>
                <div>
                  <Display style={{ fontSize: 12.5, fontWeight: 600, color: t.text, display: 'block', letterSpacing: '-0.01em' }}>
                    Claude Desktop
                  </Display>
                  <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    one-click .mcpb
                  </Mono>
                </div>
                <span style={{ marginLeft: 10, fontSize: 11, color: t.textMuted, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  Change
                </span>
              </div>
            </StepCard>

            {/* Step 2 — Install (active state) */}
            <StepCard theme={theme} n={2} title="Install and paste your token"
              subtitle="Download the extension, double-click it, then paste this token when Claude Desktop asks."
              state="active"
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {/* Download card */}
                <div style={{
                  background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
                  padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                  <div>
                    <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      A · Download
                    </Mono>
                    <Display style={{ fontSize: 13.5, fontWeight: 600, color: t.text, letterSpacing: '-0.01em', display: 'block' }}>
                      agent-planner.mcpb
                    </Display>
                    <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 2 }}>
                      v0.9.2 · 2.4 MB · macOS / Windows
                    </div>
                  </div>
                  <button style={{
                    marginTop: 14,
                    padding: '8px 12px', borderRadius: 7,
                    background: t.amber, color: t.bg, border: 'none',
                    fontFamily: fontBody, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 12 }}>↓</span> Download
                  </button>
                </div>

                {/* Token card */}
                <div style={{
                  background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
                  padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                  <div>
                    <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      B · Paste this when prompted
                    </Mono>
                    <TokenBlock theme={theme} label={null} token="ap_live_8f3a92c4d1e7b6a8f9c2e5d3" />
                  </div>
                  <Mono style={{ fontSize: 10, color: t.textMuted, marginTop: 10, lineHeight: 1.5 }}>
                    API URL is pre-filled · token never leaves this browser session
                  </Mono>
                </div>
              </div>
            </StepCard>

            {/* Step 3 — Test (success state) */}
            <StepCard theme={theme} n={3} title="Run a test call"
              subtitle="We'll ask your agent to fetch its briefing — proves the connection end to end."
              state="success"
            >
              <button style={{
                padding: '10px 16px', borderRadius: 8,
                background: t.emerald, color: t.bg, border: 'none',
                fontFamily: fontBody, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 12 }}>✓</span> Test connection · Passed
              </button>

              <TestPanel theme={theme} state="success" briefing={briefing} />

              <div style={{
                marginTop: 18, padding: '12px 14px', borderRadius: 8,
                background: t.surface, border: `1px solid ${t.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div>
                  <Display style={{ fontSize: 13, fontWeight: 600, color: t.text, letterSpacing: '-0.01em', display: 'block' }}>
                    You're set up
                  </Display>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                    Your dashboard is unlocked. The first plan you create will be visible to Claude Desktop instantly.
                  </div>
                </div>
                <button style={{
                  padding: '9px 16px', borderRadius: 8,
                  background: t.text, color: t.bg, border: 'none',
                  fontFamily: fontBody, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  flexShrink: 0,
                }}>
                  Go to dashboard →
                </button>
              </div>
            </StepCard>
          </div>

        </div>
      </div>
    </ArtboardFrame>
  );
}

// Quick & dirty dashboard skeleton — placeholder shapes to suggest what's behind
// the veil. Doesn't need to be pixel-perfect, just suggestive.
function DashboardSkeleton({ theme }) {
  const t = useT(theme);
  return (
    <div style={{ height: '100%', display: 'flex' }}>
      <div style={{ width: 56, background: t.surface, borderRight: `1px solid ${t.border}` }} />
      <div style={{ flex: 1, padding: 28 }}>
        <div style={{ height: 24, width: 200, background: t.surfaceHi, borderRadius: 6, marginBottom: 28 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 22 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ height: 130, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10 }} />
          ))}
        </div>
        <div style={{ height: 200, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, marginBottom: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ height: 160, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10 }} />
          <div style={{ height: 160, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}

window.Onboarding = Onboarding;
