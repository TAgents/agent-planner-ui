// Shared sub-components for the Onboarding / Connect / Integrations surfaces.
// Token, snippet, copy button, client tiles, test panel — used by every connect page.

// --- TOKEN BLOCK -----------------------------------------------------
// A row showing the just-generated API token with a Copy button.
function TokenBlock({ theme, token = 'ap_live_8f3a92c4d1e7b6a8f9c2e5d3', label = 'Your API token' }) {
  const t = useT(theme);
  return (
    <div>
      {label && (
        <Mono style={{ display: 'block', fontSize: 9.5, color: t.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>
          {label}
        </Mono>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8,
        padding: '10px 12px',
      }}>
        <span style={{ color: t.textMuted, fontFamily: fontMono, fontSize: 11 }}>⚿</span>
        <Mono style={{ flex: 1, color: t.text, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {token}
        </Mono>
        <button style={{
          padding: '4px 10px', borderRadius: 5,
          background: t.surfaceHi, border: `1px solid ${t.border}`,
          color: t.textSec, fontFamily: fontMono, fontSize: 10, cursor: 'pointer',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Copy
        </button>
      </div>
    </div>
  );
}

// --- SNIPPET BLOCK ---------------------------------------------------
// A code block with a Copy button overlaid in the top-right.
// `lines` is an array of {text, color?, indent?} or string.
function SnippetBlock({ theme, lines = [], comment, language = 'shell' }) {
  const t = useT(theme);
  return (
    <div style={{
      position: 'relative',
      background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8,
      padding: '12px 14px', paddingRight: 64,
      fontFamily: fontMono, fontSize: 11.5, lineHeight: 1.7, color: t.textSec,
    }}>
      {comment && (
        <div style={{ color: t.textMuted, marginBottom: 4 }}>
          <span style={{ opacity: 0.7 }}>{language === 'shell' ? '# ' : '// '}</span>{comment}
        </div>
      )}
      {lines.map((ln, i) => {
        const obj = typeof ln === 'string' ? { text: ln } : ln;
        const indent = obj.indent || 0;
        return (
          <div key={i} style={{ paddingLeft: indent * 14, color: obj.color || t.text }}>
            {obj.text}
          </div>
        );
      })}
      <button style={{
        position: 'absolute', top: 10, right: 10,
        padding: '4px 10px', borderRadius: 5,
        background: t.surface, border: `1px solid ${t.border}`,
        color: t.textSec, fontFamily: fontMono, fontSize: 10, cursor: 'pointer',
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        Copy
      </button>
    </div>
  );
}

// --- STEP CARD -------------------------------------------------------
// Numbered step with a title, optional subtitle, and content. `state` is
// 'done' | 'active' | 'pending'.
function StepCard({ theme, n, title, subtitle, state = 'pending', children }) {
  const t = useT(theme);
  const isDone = state === 'done';
  const isActive = state === 'active';
  const numColor = isDone ? t.emerald : isActive ? t.amber : t.textMuted;
  const numBg = isDone ? t.emeraldSoft : isActive ? t.amberSoft : t.surfaceHi;
  return (
    <div style={{
      display: 'flex', gap: 16, padding: 0,
      opacity: state === 'pending' ? 0.55 : 1,
    }}>
      {/* Number rail */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: numBg, color: numColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: fontMono, fontSize: 12, fontWeight: 600,
          border: `1.5px solid ${numColor}`,
        }}>
          {isDone ? '✓' : n}
        </div>
        <div style={{ flex: 1, width: 1.5, background: t.border, marginTop: 6, minHeight: 12 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Display style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: t.text }}>
            {title}
          </Display>
          {isDone && (
            <Mono style={{ fontSize: 9.5, color: t.emerald, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              ✓ Done
            </Mono>
          )}
        </div>
        {subtitle && (
          <p style={{ fontSize: 12.5, color: t.textSec, lineHeight: 1.55, marginTop: 4, marginBottom: 14 }}>
            {subtitle}
          </p>
        )}
        {state !== 'pending' && children && (
          <div style={{ marginTop: subtitle ? 0 : 12 }}>{children}</div>
        )}
      </div>
    </div>
  );
}

// --- TEST PANEL ------------------------------------------------------
// Inline result of pressing "Test connection". Renders three states:
// 'idle', 'success', 'error'.
function TestPanel({ theme, state = 'idle', briefing, error }) {
  const t = useT(theme);
  if (state === 'idle') return null;

  if (state === 'success') {
    return (
      <div style={{
        marginTop: 14,
        background: t.emeraldSoft, border: `1px solid ${t.emerald}55`, borderRadius: 10,
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{
            width: 18, height: 18, borderRadius: '50%',
            background: t.emerald, color: t.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
          }}>✓</span>
          <Display style={{ fontSize: 14, fontWeight: 600, color: t.emerald, letterSpacing: '-0.01em' }}>
            Connected — your agent can read your workspace
          </Display>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 10 }}>
          {briefing.map((row, i) => (
            <div key={i} style={{
              background: t.surface, border: `1px solid ${t.border}`, borderRadius: 7,
              padding: '8px 10px',
            }}>
              <Mono style={{ fontSize: 8.5, color: t.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                {row.label}
              </Mono>
              <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 700, color: t.text, marginTop: 2, letterSpacing: '-0.02em' }}>
                {row.value}
              </div>
              {row.sub && (
                <div style={{ fontSize: 10, color: t.textMuted, marginTop: 1 }}>{row.sub}</div>
              )}
            </div>
          ))}
        </div>
        <Mono style={{ display: 'block', fontSize: 9.5, color: t.textMuted, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 10 }}>
          ↳ briefing() · 142ms · via Claude Desktop
        </Mono>
      </div>
    );
  }

  // Error
  return (
    <div style={{
      marginTop: 14,
      background: t.redSoft, border: `1px solid ${t.red}55`, borderRadius: 10,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{
          width: 18, height: 18, borderRadius: '50%',
          background: t.red, color: t.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700,
        }}>!</span>
        <Display style={{ fontSize: 14, fontWeight: 600, color: t.red, letterSpacing: '-0.01em' }}>
          {error.title}
        </Display>
      </div>
      <p style={{ fontSize: 12, color: t.textSec, lineHeight: 1.55, margin: '4px 0 10px 26px' }}>
        {error.plain}
      </p>
      <details style={{ marginLeft: 26, fontSize: 11 }}>
        <summary style={{
          fontFamily: fontMono, fontSize: 10, color: t.textMuted, letterSpacing: '0.12em',
          textTransform: 'uppercase', cursor: 'pointer',
        }}>
          Show technical details
        </summary>
        <div style={{
          marginTop: 8, padding: '8px 10px', borderRadius: 6,
          background: t.bg, border: `1px solid ${t.border}`,
          fontFamily: fontMono, fontSize: 10.5, color: t.textSec, lineHeight: 1.6,
        }}>
          {error.technical}
        </div>
      </details>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, marginLeft: 26 }}>
        <button style={{
          padding: '6px 12px', borderRadius: 6,
          background: t.text, color: t.bg, border: 'none',
          fontFamily: fontBody, fontSize: 11, fontWeight: 600, cursor: 'pointer',
        }}>
          Retry
        </button>
        <button style={{
          padding: '6px 12px', borderRadius: 6,
          background: 'transparent', color: t.textSec, border: `1px solid ${t.border}`,
          fontFamily: fontBody, fontSize: 11, fontWeight: 500, cursor: 'pointer',
        }}>
          Get help
        </button>
      </div>
    </div>
  );
}

// --- CLIENT TILE -----------------------------------------------------
// Used in the wizard step 1 + Works-with strip.
function ClientTile({ theme, glyph, name, sub, recommended = false, active = false, compact = false }) {
  const t = useT(theme);
  return (
    <div style={{
      position: 'relative',
      background: active ? t.surfaceHi : t.surface,
      border: `1px solid ${active ? t.amber : t.border}`,
      borderRadius: 10,
      padding: compact ? '12px 14px' : '16px 16px',
      cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: compact ? 6 : 10,
      minHeight: compact ? 88 : 120,
    }}>
      {recommended && (
        <span style={{
          position: 'absolute', top: -7, right: 12,
          padding: '1.5px 8px', borderRadius: 999,
          background: t.amber, color: t.bg,
          fontFamily: fontMono, fontSize: 8.5, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          Easiest
        </span>
      )}
      <div style={{
        width: compact ? 28 : 36, height: compact ? 28 : 36, borderRadius: 8,
        background: active ? t.amber : t.surfaceHi,
        color: active ? t.bg : t.text,
        border: active ? 'none' : `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: fontDisplay, fontSize: compact ? 13 : 16, fontWeight: 700,
        letterSpacing: '-0.04em',
      }}>
        {glyph}
      </div>
      <div>
        <Display style={{ fontSize: compact ? 12.5 : 14, fontWeight: 600, color: t.text, letterSpacing: '-0.01em', display: 'block' }}>
          {name}
        </Display>
        <div style={{ fontSize: compact ? 10.5 : 11.5, color: t.textMuted, marginTop: 2 }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

// --- PRIMARY BUTTON --------------------------------------------------
function PrimaryButton({ theme, children, large = false, style = {} }) {
  const t = useT(theme);
  return (
    <button style={{
      padding: large ? '12px 22px' : '8px 16px',
      borderRadius: large ? 10 : 8,
      background: t.amber, color: t.bg, border: 'none',
      fontFamily: fontBody, fontSize: large ? 13.5 : 12, fontWeight: 600,
      cursor: 'pointer', letterSpacing: '-0.005em',
      ...style,
    }}>
      {children}
    </button>
  );
}

function GhostButton({ theme, children, style = {} }) {
  const t = useT(theme);
  return (
    <button style={{
      padding: '8px 14px', borderRadius: 8,
      background: 'transparent', color: t.text, border: `1px solid ${t.border}`,
      fontFamily: fontBody, fontSize: 12, fontWeight: 500, cursor: 'pointer',
      ...style,
    }}>
      {children}
    </button>
  );
}

Object.assign(window, { TokenBlock, SnippetBlock, StepCard, TestPanel, ClientTile, PrimaryButton, GhostButton });
