// Shared tokens, primitives, helpers across all screens.
// Theme is determined by a class `theme-light` or `theme-dark` on the artboard root.

const TOKENS = {
  dark: {
    bg: '#0e0c0a',
    surface: '#16140f',
    surfaceHi: '#1e1b15',
    border: '#2a261e',
    borderHi: '#3a3528',
    text: '#ede8df',
    textSec: '#a09882',
    textMuted: '#6b6354',
    amber: '#d4a24e',
    amberSoft: 'rgba(212,162,78,0.15)',
    emerald: '#5ba89a',
    emeraldSoft: 'rgba(91,168,154,0.18)',
    red: '#c94a4a',
    redSoft: 'rgba(201,74,74,0.16)',
    violet: '#8a7cb8',
    violetSoft: 'rgba(138,124,184,0.18)',
    slate: '#4a4438',
  },
  light: {
    bg: '#fafaf7',
    surface: '#ffffff',
    surfaceHi: '#f4f2ec',
    border: '#e8e4dc',
    borderHi: '#d4cfc5',
    text: '#16140f',
    textSec: '#5a5448',
    textMuted: '#8a8474',
    amber: '#b8882e',
    amberSoft: 'rgba(184,136,46,0.12)',
    emerald: '#3d7a6e',
    emeraldSoft: 'rgba(61,122,110,0.12)',
    red: '#b03838',
    redSoft: 'rgba(176,56,56,0.10)',
    violet: '#5d4f8a',
    violetSoft: 'rgba(93,79,138,0.12)',
    slate: '#a09882',
  },
};

// Font stacks are read from CSS vars on :root so Tweaks can swap them live.
const fontDisplay = `var(--ap-font-display, 'Inter', system-ui, sans-serif)`;
const fontBody = `var(--ap-font-body, 'Inter', system-ui, sans-serif)`;
const fontMono = `var(--ap-font-mono, ui-monospace, 'JetBrains Mono', monospace)`;

// Use within a themed artboard
function useT(theme) {
  return TOKENS[theme] || TOKENS.dark;
}

function ArtboardFrame({ theme = 'dark', children, padded = true, style = {} }) {
  const t = useT(theme);
  return (
    <div
      className={`theme-${theme}`}
      style={{
        width: '100%',
        height: '100%',
        background: t.bg,
        color: t.text,
        fontFamily: fontBody,
        padding: padded ? 28 : 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// AppBar / sidebar shells
function AppShell({ theme, active = 'mission', children }) {
  const t = useT(theme);
  const items = [
    { id: 'mission', label: 'Mission', glyph: 'M' },
    { id: 'goals', label: 'Goals', glyph: 'G' },
    { id: 'plans', label: 'Plans', glyph: 'P' },
    { id: 'know', label: 'Knowledge', glyph: 'K' },
  ];
  return (
    <div style={{ display: 'flex', height: '100%', gap: 0 }}>
      <aside
        style={{
          width: 56,
          background: t.surface,
          borderRight: `1px solid ${t.border}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '14px 0',
          gap: 4,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: t.amber,
            color: t.bg,
            fontFamily: fontDisplay,
            fontWeight: 700,
            fontSize: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            letterSpacing: '-0.04em',
          }}
        >
          ap
        </div>
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <div
              key={it.id}
              title={it.label}
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? t.text : t.textMuted,
                background: isActive ? t.surfaceHi : 'transparent',
                fontFamily: fontMono,
                fontSize: 11,
                fontWeight: 600,
                position: 'relative',
              }}
            >
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: -10,
                    top: 8,
                    bottom: 8,
                    width: 2,
                    borderRadius: 2,
                    background: t.amber,
                  }}
                />
              )}
              {it.glyph}
            </div>
          );
        })}
        <div style={{ flex: 1 }} />
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: t.surfaceHi,
            border: `1px solid ${t.border}`,
            color: t.textSec,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontFamily: fontMono,
          }}
        >
          MS
        </div>
      </aside>
      <main style={{ flex: 1, minWidth: 0, position: 'relative' }}>{children}</main>
    </div>
  );
}

// Section / card primitives
function Card({ theme, children, style = {}, pad = 16 }) {
  const t = useT(theme);
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        padding: pad,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ theme, children, color = 'slate', style = {} }) {
  const t = useT(theme);
  const map = {
    amber: { bg: t.amberSoft, fg: t.amber },
    emerald: { bg: t.emeraldSoft, fg: t.emerald },
    red: { bg: t.redSoft, fg: t.red },
    violet: { bg: t.violetSoft, fg: t.violet },
    slate: { bg: t.surfaceHi, fg: t.textSec },
  };
  const c = map[color] || map.slate;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 7px',
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        fontFamily: fontMono,
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function StatusDot({ color = '#888', size = 8, ring = false, ringColor }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: ring ? `0 0 0 4px ${ringColor || color}33` : 'none',
        flexShrink: 0,
      }}
    />
  );
}

function Mono({ children, style = {} }) {
  return <span style={{ fontFamily: fontMono, ...style }}>{children}</span>;
}

function Display({ children, style = {} }) {
  return (
    <span
      style={{
        fontFamily: fontDisplay,
        letterSpacing: '-0.02em',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// Marker for design elements that don't exist in the real backend yet — keep the
// reconciliation honest. Small dashed pill, amber-tinted, mono caps.
function ProposedChip({ theme, children = 'Proposed', style = {} }) {
  const t = useT(theme);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '1.5px 6px',
        borderRadius: 4,
        border: `1px dashed ${t.amber}`,
        color: t.amber,
        background: 'transparent',
        fontFamily: fontMono,
        fontSize: 8.5,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: t.amber, opacity: 0.7 }} />
      {children}
    </span>
  );
}

// Sparkline
function Spark({ values, color, w = 60, h = 18 }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Section header with kicker + title
function SectionHead({ theme, kicker, title, right }) {
  const t = useT(theme);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
      <div>
        {kicker && (
          <div
            style={{
              fontFamily: fontMono,
              fontSize: 9.5,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: t.textMuted,
              marginBottom: 4,
            }}
          >
            {kicker}
          </div>
        )}
        <div style={{ fontFamily: fontDisplay, fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', color: t.text }}>
          {title}
        </div>
      </div>
      {right}
    </div>
  );
}

Object.assign(window, {
  TOKENS, useT, ArtboardFrame, AppShell, Card, Pill, ProposedChip, StatusDot, Mono, Display, Spark, SectionHead,
  fontDisplay, fontBody, fontMono,
});
