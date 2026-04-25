// Auth — Login + Signup (single split layout, signup variant emphasized)
// Bold treatment: a left-side typographic statement with rotating "your agents need..." vignette,
// right-side compact form with social/SSO. Same shell for login and signup; this artboard shows signup.

function AuthSignup({ theme = 'dark' }) {
  const t = useT(theme);
  return (
    <ArtboardFrame theme={theme} padded={false}>
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1.1fr 1fr', overflow: 'hidden' }}>

        {/* Left — manifesto */}
        <div style={{
          position: 'relative',
          background: t.surface,
          padding: '36px 40px',
          display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${t.border}`,
          overflow: 'hidden',
        }}>
          {/* dot grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}>
            <defs>
              <pattern id={`auth-dots-${theme}`} width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill={t.border} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#auth-dots-${theme})`} />
          </svg>
          <div style={{
            position: 'absolute', top: -100, left: -80,
            width: 420, height: 420, borderRadius: '50%',
            background: `radial-gradient(circle, ${t.amberSoft}, transparent 65%)`,
            pointerEvents: 'none',
          }} />

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: t.amber, color: t.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: fontDisplay, fontSize: 16, fontWeight: 700, letterSpacing: '-0.04em',
            }}>◆</div>
            <div style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>
              AgentPlanner
            </div>
          </div>

          {/* Statement */}
          <div style={{ position: 'relative', marginTop: 'auto', marginBottom: 'auto' }}>
            <Mono style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 14, display: 'block' }}>
              ◆ Plans, beliefs, and decisions — for AI agents
            </Mono>
            <div style={{
              fontFamily: fontDisplay, fontSize: 44, fontWeight: 700,
              letterSpacing: '-0.04em', lineHeight: 1.04, color: t.text, marginBottom: 18,
              textWrap: 'pretty',
            }}>
              Your agents <br/>
              <span style={{ color: t.amber }}>need a shared</span> <br/>
              brain.
            </div>
            <div style={{ fontSize: 14, color: t.textSec, lineHeight: 1.55, maxWidth: 380 }}>
              A planning surface where humans and agents track goals, branch plans, and accumulate beliefs together — so nobody loses the thread when context window runs out.
            </div>

            {/* Vignette card */}
            <div style={{
              marginTop: 28,
              padding: '14px 16px',
              border: `1px solid ${t.border}`,
              borderRadius: 10,
              background: t.bg,
              display: 'flex', alignItems: 'center', gap: 12,
              maxWidth: 420,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.violetSoft, color: t.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fontMono, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>β</div>
              <div style={{ flex: 1, fontSize: 11.5, color: t.textSec, lineHeight: 1.45 }}>
                <span style={{ color: t.text, fontWeight: 600 }}>researcher-β</span> picked up where planner-α left off. <span style={{ color: t.amber }}>3 new beliefs</span>, 1 contradiction flagged.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ position: 'relative', display: 'flex', gap: 18, fontSize: 11, color: t.textMuted, fontFamily: fontMono, letterSpacing: '0.06em' }}>
            <span>SOC 2 Type II</span>
            <span>·</span>
            <span>EU residency</span>
            <span>·</span>
            <span>MCP-native</span>
          </div>
        </div>

        {/* Right — form */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: t.bg }}>
          <div style={{ width: '100%', maxWidth: 380 }}>
            <Mono style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 6, display: 'block' }}>
              ◆ Create account
            </Mono>
            <div style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 22 }}>
              Set up your workspace
            </div>

            {/* SSO buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              <SSOButton theme={theme} label="Continue with Google" letter="G" />
              <SSOButton theme={theme} label="Continue with GitHub" letter="◐" />
              <SSOButton theme={theme} label="Continue with SAML SSO" letter="⚡" subtle />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: t.border }} />
              <Mono style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.textMuted }}>or with email</Mono>
              <div style={{ flex: 1, height: 1, background: t.border }} />
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <Field theme={theme} label="Work email" value="marcus@acme-robotics.com" />
              <Field theme={theme} label="Workspace name" value="Acme Robotics" hint="acme-robotics.agentplanner.app" />
              <Field theme={theme} label="Password" value="••••••••••••" type="password" />
            </div>

            <button style={{
              width: '100%',
              padding: '11px 14px', borderRadius: 8,
              background: t.text, color: t.bg, border: 'none', cursor: 'pointer',
              fontFamily: fontDisplay, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
              marginBottom: 10,
            }}>
              Create workspace →
            </button>

            <div style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.5, marginBottom: 18, textAlign: 'center' }}>
              By continuing you agree to the <span style={{ color: t.text, textDecoration: 'underline' }}>Terms</span> and <span style={{ color: t.text, textDecoration: 'underline' }}>Privacy notice</span>.
            </div>

            <div style={{ textAlign: 'center', fontSize: 12, color: t.textSec }}>
              Already have an account? <span style={{ color: t.amber, fontWeight: 600, cursor: 'pointer' }}>Sign in</span>
            </div>
          </div>
        </div>
      </div>
    </ArtboardFrame>
  );
}

function SSOButton({ theme, label, letter, subtle }) {
  const t = useT(theme);
  return (
    <button style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 8,
      background: subtle ? 'transparent' : t.surface,
      border: `1px solid ${t.border}`, color: t.text,
      cursor: 'pointer', fontFamily: fontDisplay, fontSize: 12.5, fontWeight: 600,
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 5,
        background: t.surfaceHi, color: t.textSec,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: fontMono, fontSize: 11, fontWeight: 700,
      }}>{letter}</span>
      {label}
    </button>
  );
}

function Field({ theme, label, value, hint, type }) {
  const t = useT(theme);
  return (
    <div>
      <div style={{ fontSize: 10.5, color: t.textSec, marginBottom: 5, fontFamily: fontBody, fontWeight: 500, letterSpacing: '0.02em' }}>
        {label}
      </div>
      <div style={{
        padding: '9px 12px', borderRadius: 7,
        border: `1px solid ${t.borderHi}`, background: t.surface,
        fontSize: 13, color: t.text, fontFamily: fontBody,
      }}>
        {type === 'password' ? <span style={{ letterSpacing: '0.15em' }}>{value}</span> : value}
      </div>
      {hint && <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 4, fontFamily: fontMono }}>↳ {hint}</div>}
    </div>
  );
}

Object.assign(window, { AuthSignup });
